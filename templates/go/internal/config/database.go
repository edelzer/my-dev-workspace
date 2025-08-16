package config

import (
	"fmt"
	"time"
)

// DatabaseConfig holds database-specific configuration
type DatabaseConfig struct {
	Host               string
	Port               int
	Username           string
	Password           string
	Name               string
	SSLMode            string
	MaxOpenConnections int
	MaxIdleConnections int
	ConnMaxLifetime    time.Duration
	ConnMaxIdleTime    time.Duration
	LogLevel           string
}

// RedisConfig holds Redis-specific configuration
type RedisConfig struct {
	Host               string
	Port               int
	Password           string
	DB                 int
	MaxRetries         int
	PoolSize           int
	MinIdleConns       int
	PoolTimeout        time.Duration
	IdleTimeout        time.Duration
	IdleCheckFrequency time.Duration
}

// LoadDatabaseConfig loads database configuration from environment
func LoadDatabaseConfig() *DatabaseConfig {
	return &DatabaseConfig{
		Host:               getEnvWithDefault("DB_HOST", "localhost"),
		Port:               getEnvInt("DB_PORT", 5432),
		Username:           getEnvWithDefault("DB_USERNAME", "user"),
		Password:           getEnvWithDefault("DB_PASSWORD", "password"),
		Name:               getEnvWithDefault("DB_NAME", "app_db"),
		SSLMode:            getEnvWithDefault("DB_SSL_MODE", "disable"),
		MaxOpenConnections: getEnvInt("DB_MAX_OPEN_CONNECTIONS", 25),
		MaxIdleConnections: getEnvInt("DB_MAX_IDLE_CONNECTIONS", 5),
		ConnMaxLifetime:    time.Duration(getEnvInt("DB_CONN_MAX_LIFETIME_MINUTES", 60)) * time.Minute,
		ConnMaxIdleTime:    time.Duration(getEnvInt("DB_CONN_MAX_IDLE_MINUTES", 10)) * time.Minute,
		LogLevel:           getEnvWithDefault("DB_LOG_LEVEL", "info"),
	}
}

// LoadRedisConfig loads Redis configuration from environment
func LoadRedisConfig() *RedisConfig {
	return &RedisConfig{
		Host:               getEnvWithDefault("REDIS_HOST", "localhost"),
		Port:               getEnvInt("REDIS_PORT", 6379),
		Password:           getEnvWithDefault("REDIS_PASSWORD", ""),
		DB:                 getEnvInt("REDIS_DB", 0),
		MaxRetries:         getEnvInt("REDIS_MAX_RETRIES", 3),
		PoolSize:           getEnvInt("REDIS_POOL_SIZE", 10),
		MinIdleConns:       getEnvInt("REDIS_MIN_IDLE_CONNS", 2),
		PoolTimeout:        time.Duration(getEnvInt("REDIS_POOL_TIMEOUT_SECONDS", 30)) * time.Second,
		IdleTimeout:        time.Duration(getEnvInt("REDIS_IDLE_TIMEOUT_MINUTES", 5)) * time.Minute,
		IdleCheckFrequency: time.Duration(getEnvInt("REDIS_IDLE_CHECK_FREQUENCY_MINUTES", 1)) * time.Minute,
	}
}

// GetDSN returns the PostgreSQL connection string
func (c *DatabaseConfig) GetDSN() string {
	return fmt.Sprintf(
		"host=%s port=%d user=%s password=%s dbname=%s sslmode=%s",
		c.Host, c.Port, c.Username, c.Password, c.Name, c.SSLMode,
	)
}

// GetRedisAddr returns the Redis connection address
func (c *RedisConfig) GetRedisAddr() string {
	return fmt.Sprintf("%s:%d", c.Host, c.Port)
}