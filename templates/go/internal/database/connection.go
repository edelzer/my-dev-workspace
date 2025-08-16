package database

import (
	"context"
	"fmt"
	"log"
	"time"

	"github.com/go-redis/redis/v8"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"

	"app/internal/config"
	"app/internal/models"
)

// Connect establishes a connection to PostgreSQL database using GORM
func Connect(databaseURL string) (*gorm.DB, error) {
	// Parse configuration
	dbConfig := config.LoadDatabaseConfig()

	// Configure GORM logger based on environment
	var gormLogger logger.Interface
	switch dbConfig.LogLevel {
	case "silent":
		gormLogger = logger.Default.LogMode(logger.Silent)
	case "error":
		gormLogger = logger.Default.LogMode(logger.Error)
	case "warn":
		gormLogger = logger.Default.LogMode(logger.Warn)
	case "info":
		gormLogger = logger.Default.LogMode(logger.Info)
	default:
		gormLogger = logger.Default.LogMode(logger.Info)
	}

	// Custom logger with structured logging
	gormLogger = logger.New(
		log.New(log.Writer(), "\r\n", log.LstdFlags),
		logger.Config{
			SlowThreshold:             time.Second,
			LogLevel:                  gormLogger.LogMode(logger.Info).GetLogLevel(),
			IgnoreRecordNotFoundError: true,
			Colorful:                  false,
		},
	)

	// Connect to database
	db, err := gorm.Open(postgres.Open(databaseURL), &gorm.Config{
		Logger:                 gormLogger,
		SkipDefaultTransaction: false,
		PrepareStmt:            true,
	})
	if err != nil {
		return nil, fmt.Errorf("failed to connect to database: %w", err)
	}

	// Get underlying sql.DB to configure connection pool
	sqlDB, err := db.DB()
	if err != nil {
		return nil, fmt.Errorf("failed to get underlying sql.DB: %w", err)
	}

	// Configure connection pool
	sqlDB.SetMaxOpenConns(dbConfig.MaxOpenConnections)
	sqlDB.SetMaxIdleConns(dbConfig.MaxIdleConnections)
	sqlDB.SetConnMaxLifetime(dbConfig.ConnMaxLifetime)
	sqlDB.SetConnMaxIdleTime(dbConfig.ConnMaxIdleTime)

	// Test the connection
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	
	if err := sqlDB.PingContext(ctx); err != nil {
		return nil, fmt.Errorf("failed to ping database: %w", err)
	}

	return db, nil
}

// ConnectRedis establishes a connection to Redis
func ConnectRedis(redisURL string) (*redis.Client, error) {
	redisConfig := config.LoadRedisConfig()

	// Parse Redis URL or use config
	var options *redis.Options
	if redisURL != "" {
		opt, err := redis.ParseURL(redisURL)
		if err != nil {
			return nil, fmt.Errorf("failed to parse Redis URL: %w", err)
		}
		options = opt
	} else {
		options = &redis.Options{
			Addr:               redisConfig.GetRedisAddr(),
			Password:           redisConfig.Password,
			DB:                 redisConfig.DB,
			MaxRetries:         redisConfig.MaxRetries,
			PoolSize:           redisConfig.PoolSize,
			MinIdleConns:       redisConfig.MinIdleConns,
			PoolTimeout:        redisConfig.PoolTimeout,
			IdleTimeout:        redisConfig.IdleTimeout,
			IdleCheckFrequency: redisConfig.IdleCheckFrequency,
		}
	}

	// Create Redis client
	client := redis.NewClient(options)

	// Test the connection
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	if err := client.Ping(ctx).Err(); err != nil {
		return nil, fmt.Errorf("failed to connect to Redis: %w", err)
	}

	return client, nil
}

// Migrate runs database migrations
func Migrate(db *gorm.DB) error {
	// Auto-migrate all models
	err := db.AutoMigrate(
		&models.User{},
		&models.Role{},
		&models.UserRole{},
		&models.RefreshToken{},
		&models.PasswordReset{},
		&models.AuditLog{},
	)
	if err != nil {
		return fmt.Errorf("failed to run migrations: %w", err)
	}

	// Create default roles if they don't exist
	if err := seedDefaultRoles(db); err != nil {
		return fmt.Errorf("failed to seed default roles: %w", err)
	}

	return nil
}

// seedDefaultRoles creates default system roles
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
				// Role doesn't exist, create it
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

// HealthCheck checks the health of database connections
func HealthCheck(db *gorm.DB, redisClient *redis.Client) error {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	// Check PostgreSQL connection
	sqlDB, err := db.DB()
	if err != nil {
		return fmt.Errorf("failed to get underlying sql.DB: %w", err)
	}

	if err := sqlDB.PingContext(ctx); err != nil {
		return fmt.Errorf("PostgreSQL health check failed: %w", err)
	}

	// Check Redis connection
	if err := redisClient.Ping(ctx).Err(); err != nil {
		return fmt.Errorf("Redis health check failed: %w", err)
	}

	return nil
}