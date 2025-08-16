package tests

import (
	"context"
	"fmt"
	"log"
	"os"
	"testing"

	"github.com/go-redis/redis/v8"
	"github.com/google/uuid"
	"github.com/stretchr/testify/require"
	"gorm.io/driver/postgres"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"

	"app/internal/models"
)

// setupTestDB creates a test database connection
func setupTestDB(t *testing.T) *gorm.DB {
	var db *gorm.DB
	var err error

	// Use SQLite for unit tests, PostgreSQL for integration tests
	if os.Getenv("USE_POSTGRES") == "true" {
		dsn := getTestPostgresDSN()
		db, err = gorm.Open(postgres.Open(dsn), &gorm.Config{
			Logger: logger.Default.LogMode(logger.Silent),
		})
	} else {
		db, err = gorm.Open(sqlite.Open(":memory:"), &gorm.Config{
			Logger: logger.Default.LogMode(logger.Silent),
		})
	}

	if t != nil {
		require.NoError(t, err, "Failed to connect to test database")
	} else if err != nil {
		log.Fatalf("Failed to connect to test database: %v", err)
	}

	// Run migrations
	err = db.AutoMigrate(
		&models.User{},
		&models.Role{},
		&models.UserRole{},
		&models.RefreshToken{},
		&models.PasswordReset{},
		&models.EmailVerification{},
		&models.AuditLog{},
	)

	if t != nil {
		require.NoError(t, err, "Failed to run test migrations")
	} else if err != nil {
		log.Fatalf("Failed to run test migrations: %v", err)
	}

	// Seed default roles
	seedDefaultRoles(db)

	return db
}

// setupTestRedis creates a test Redis connection
func setupTestRedis(t *testing.T) *redis.Client {
	redisURL := os.Getenv("REDIS_TEST_URL")
	if redisURL == "" {
		redisURL = "redis://localhost:6379/1" // Use database 1 for tests
	}

	opts, err := redis.ParseURL(redisURL)
	if t != nil {
		require.NoError(t, err, "Failed to parse Redis URL")
	} else if err != nil {
		log.Fatalf("Failed to parse Redis URL: %v", err)
	}

	client := redis.NewClient(opts)

	// Test connection
	ctx := context.Background()
	err = client.Ping(ctx).Err()
	if t != nil {
		require.NoError(t, err, "Failed to connect to test Redis")
	} else if err != nil {
		log.Fatalf("Failed to connect to test Redis: %v", err)
	}

	return client
}

// teardownTestDB cleans up the test database
func teardownTestDB(t *testing.T, db *gorm.DB) {
	if db == nil {
		return
	}

	// Clean up all tables
	tables := []string{
		"audit_logs",
		"email_verifications",
		"password_resets",
		"refresh_tokens",
		"user_roles",
		"roles",
		"users",
	}

	for _, table := range tables {
		db.Exec(fmt.Sprintf("DELETE FROM %s", table))
	}

	// Close connection
	sqlDB, err := db.DB()
	if err == nil {
		sqlDB.Close()
	}
}

// teardownTestRedis cleans up the test Redis
func teardownTestRedis(t *testing.T, client *redis.Client) {
	if client == nil {
		return
	}

	ctx := context.Background()
	client.FlushDB(ctx)
	client.Close()
}

// getTestPostgresDSN returns the PostgreSQL DSN for testing
func getTestPostgresDSN() string {
	host := getEnvWithDefault("DB_TEST_HOST", "localhost")
	port := getEnvWithDefault("DB_TEST_PORT", "5432")
	user := getEnvWithDefault("DB_TEST_USER", "test")
	password := getEnvWithDefault("DB_TEST_PASSWORD", "test")
	dbname := getEnvWithDefault("DB_TEST_NAME", "test_db")
	sslmode := getEnvWithDefault("DB_TEST_SSLMODE", "disable")

	return fmt.Sprintf("host=%s port=%s user=%s password=%s dbname=%s sslmode=%s",
		host, port, user, password, dbname, sslmode)
}

// seedDefaultRoles creates default roles for testing
func seedDefaultRoles(db *gorm.DB) error {
	defaultRoles := []models.Role{
		{
			Name:        "admin",
			Description: "Administrator with full system access",
			Permissions: []string{"*"},
		},
		{
			Name:        "user",
			Description: "Standard user with basic access",
			Permissions: []string{"user:read", "user:update"},
		},
		{
			Name:        "moderator",
			Description: "Moderator with limited administrative access",
			Permissions: []string{"user:read", "user:update", "content:moderate"},
		},
	}

	for _, role := range defaultRoles {
		var existingRole models.Role
		if err := db.Where("name = ?", role.Name).First(&existingRole).Error; err != nil {
			if err == gorm.ErrRecordNotFound {
				if err := db.Create(&role).Error; err != nil {
					return fmt.Errorf("failed to create role %s: %w", role.Name, err)
				}
			} else {
				return fmt.Errorf("failed to check for existing role %s: %w", role.Name, err)
			}
		}
	}

	return nil
}

// createTestUser creates a test user with optional roles
func createTestUser(db *gorm.DB, email, username string, roleNames ...string) (*models.User, error) {
	user := &models.User{
		ID:        uuid.New(),
		Email:     email,
		Username:  username,
		FirstName: "Test",
		LastName:  "User",
		IsActive:  true,
		IsVerified: true,
		PasswordHash: "$2a$12$example.hash", // Use a dummy hash for tests
	}

	if err := db.Create(user).Error; err != nil {
		return nil, fmt.Errorf("failed to create test user: %w", err)
	}

	// Assign roles if specified
	for _, roleName := range roleNames {
		var role models.Role
		if err := db.Where("name = ?", roleName).First(&role).Error; err != nil {
			return nil, fmt.Errorf("role %s not found: %w", roleName, err)
		}

		userRole := &models.UserRole{
			UserID: user.ID,
			RoleID: role.ID,
		}

		if err := db.Create(userRole).Error; err != nil {
			return nil, fmt.Errorf("failed to assign role %s: %w", roleName, err)
		}
	}

	// Reload user with roles
	if err := db.Preload("Roles").First(user, user.ID).Error; err != nil {
		return nil, fmt.Errorf("failed to reload user with roles: %w", err)
	}

	return user, nil
}

// createTestRole creates a test role
func createTestRole(db *gorm.DB, name, description string, permissions []string) (*models.Role, error) {
	role := &models.Role{
		ID:          uuid.New(),
		Name:        name,
		Description: description,
		Permissions: permissions,
		IsActive:    true,
	}

	if err := db.Create(role).Error; err != nil {
		return nil, fmt.Errorf("failed to create test role: %w", err)
	}

	return role, nil
}

// assertUserExists checks if a user exists in the database
func assertUserExists(t *testing.T, db *gorm.DB, userID uuid.UUID) {
	var user models.User
	err := db.First(&user, userID).Error
	require.NoError(t, err, "User should exist in database")
}

// assertUserNotExists checks if a user does not exist in the database
func assertUserNotExists(t *testing.T, db *gorm.DB, userID uuid.UUID) {
	var user models.User
	err := db.First(&user, userID).Error
	require.Error(t, err, "User should not exist in database")
	require.Equal(t, gorm.ErrRecordNotFound, err)
}

// clearDatabase clears all data from test database tables
func clearDatabase(db *gorm.DB) error {
	tables := []string{
		"audit_logs",
		"email_verifications",
		"password_resets",
		"refresh_tokens",
		"user_roles",
		"users",
		"roles",
	}

	for _, table := range tables {
		if err := db.Exec(fmt.Sprintf("DELETE FROM %s", table)).Error; err != nil {
			return fmt.Errorf("failed to clear table %s: %w", table, err)
		}
	}

	// Re-seed default roles
	return seedDefaultRoles(db)
}

// getEnvWithDefault returns environment variable value or default
func getEnvWithDefault(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}

// TestDatabaseConfig holds test database configuration
type TestDatabaseConfig struct {
	Host     string
	Port     string
	User     string
	Password string
	Database string
	SSLMode  string
}

// GetTestDatabaseConfig returns test database configuration
func GetTestDatabaseConfig() *TestDatabaseConfig {
	return &TestDatabaseConfig{
		Host:     getEnvWithDefault("DB_TEST_HOST", "localhost"),
		Port:     getEnvWithDefault("DB_TEST_PORT", "5432"),
		User:     getEnvWithDefault("DB_TEST_USER", "test"),
		Password: getEnvWithDefault("DB_TEST_PASSWORD", "test"),
		Database: getEnvWithDefault("DB_TEST_NAME", "test_db"),
		SSLMode:  getEnvWithDefault("DB_TEST_SSLMODE", "disable"),
	}
}

// TestRedisConfig holds test Redis configuration
type TestRedisConfig struct {
	Host     string
	Port     string
	Password string
	Database int
}

// GetTestRedisConfig returns test Redis configuration
func GetTestRedisConfig() *TestRedisConfig {
	return &TestRedisConfig{
		Host:     getEnvWithDefault("REDIS_TEST_HOST", "localhost"),
		Port:     getEnvWithDefault("REDIS_TEST_PORT", "6379"),
		Password: getEnvWithDefault("REDIS_TEST_PASSWORD", ""),
		Database: 1, // Use database 1 for tests
	}
}