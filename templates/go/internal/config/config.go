package config

import (
	"fmt"
	"os"
	"strconv"
	"strings"
)

// Config holds all configuration for the application
type Config struct {
	// Server configuration
	Port        string
	Environment string
	Debug       bool

	// Database configuration
	DatabaseURL string
	RedisURL    string

	// Security configuration
	JWTSecret           string
	JWTExpirationHours  int
	BCryptCost          int
	RateLimitRPS        int
	RateLimitBurst      int
	SessionTimeout      int

	// CORS configuration
	CORSAllowedOrigins []string
	CORSAllowedMethods []string
	CORSAllowedHeaders []string

	// Logging configuration
	LogLevel string

	// External services
	SMTPHost     string
	SMTPPort     int
	SMTPUsername string
	SMTPPassword string
	SMTPFrom     string

	// Monitoring
	MetricsEnabled bool
	HealthCheckURL string
}

// Load loads configuration from environment variables
func Load() (*Config, error) {
	cfg := &Config{
		// Server defaults
		Port:        getEnvWithDefault("PORT", "8080"),
		Environment: getEnvWithDefault("ENVIRONMENT", "development"),
		Debug:       getEnvBool("DEBUG", true),

		// Database defaults
		DatabaseURL: getEnvWithDefault("DATABASE_URL", "postgres://user:password@localhost:5432/app_db?sslmode=disable"),
		RedisURL:    getEnvWithDefault("REDIS_URL", "redis://localhost:6379/0"),

		// Security defaults
		JWTSecret:          getEnvWithDefault("JWT_SECRET", "your-super-secret-jwt-key-change-in-production"),
		JWTExpirationHours: getEnvInt("JWT_EXPIRATION_HOURS", 24),
		BCryptCost:         getEnvInt("BCRYPT_COST", 12),
		RateLimitRPS:       getEnvInt("RATE_LIMIT_RPS", 100),
		RateLimitBurst:     getEnvInt("RATE_LIMIT_BURST", 200),
		SessionTimeout:     getEnvInt("SESSION_TIMEOUT", 3600),

		// CORS defaults
		CORSAllowedOrigins: getEnvSlice("CORS_ALLOWED_ORIGINS", []string{"http://localhost:3000", "http://localhost:8080"}),
		CORSAllowedMethods: getEnvSlice("CORS_ALLOWED_METHODS", []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"}),
		CORSAllowedHeaders: getEnvSlice("CORS_ALLOWED_HEADERS", []string{"Origin", "Content-Type", "Accept", "Authorization", "X-Requested-With"}),

		// Logging defaults
		LogLevel: getEnvWithDefault("LOG_LEVEL", "info"),

		// SMTP defaults
		SMTPHost:     getEnvWithDefault("SMTP_HOST", "localhost"),
		SMTPPort:     getEnvInt("SMTP_PORT", 587),
		SMTPUsername: getEnvWithDefault("SMTP_USERNAME", ""),
		SMTPPassword: getEnvWithDefault("SMTP_PASSWORD", ""),
		SMTPFrom:     getEnvWithDefault("SMTP_FROM", "noreply@example.com"),

		// Monitoring defaults
		MetricsEnabled: getEnvBool("METRICS_ENABLED", true),
		HealthCheckURL: getEnvWithDefault("HEALTH_CHECK_URL", "/health"),
	}

	// Validate required configuration
	if err := cfg.validate(); err != nil {
		return nil, fmt.Errorf("configuration validation failed: %w", err)
	}

	return cfg, nil
}

// validate checks that required configuration values are set
func (c *Config) validate() error {
	if c.JWTSecret == "your-super-secret-jwt-key-change-in-production" && c.Environment == "production" {
		return fmt.Errorf("JWT_SECRET must be set in production")
	}

	if c.JWTExpirationHours <= 0 {
		return fmt.Errorf("JWT_EXPIRATION_HOURS must be positive")
	}

	if c.BCryptCost < 4 || c.BCryptCost > 31 {
		return fmt.Errorf("BCRYPT_COST must be between 4 and 31")
	}

	if c.RateLimitRPS <= 0 {
		return fmt.Errorf("RATE_LIMIT_RPS must be positive")
	}

	if c.RateLimitBurst <= 0 {
		return fmt.Errorf("RATE_LIMIT_BURST must be positive")
	}

	return nil
}

// IsProduction returns true if the environment is production
func (c *Config) IsProduction() bool {
	return c.Environment == "production"
}

// IsDevelopment returns true if the environment is development
func (c *Config) IsDevelopment() bool {
	return c.Environment == "development"
}

// IsTest returns true if the environment is test
func (c *Config) IsTest() bool {
	return c.Environment == "test"
}

// Helper functions for environment variable parsing

func getEnvWithDefault(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}

func getEnvInt(key string, defaultValue int) int {
	if value := os.Getenv(key); value != "" {
		if intValue, err := strconv.Atoi(value); err == nil {
			return intValue
		}
	}
	return defaultValue
}

func getEnvBool(key string, defaultValue bool) bool {
	if value := os.Getenv(key); value != "" {
		if boolValue, err := strconv.ParseBool(value); err == nil {
			return boolValue
		}
	}
	return defaultValue
}

func getEnvSlice(key string, defaultValue []string) []string {
	if value := os.Getenv(key); value != "" {
		return strings.Split(value, ",")
	}
	return defaultValue
}