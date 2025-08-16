package adapters

import (
	"encoding/json"
	"fmt"
	"os"
	"strconv"
	"strings"
	"text/template"
	"time"
)

// GoConfigAdapter converts unified configuration to Go-compatible format
// Supports Viper configuration, environment variables, and struct validation
type GoConfigAdapter struct {
	Options map[string]interface{}
}

// NewGoConfigAdapter creates a new Go configuration adapter
func NewGoConfigAdapter(options map[string]interface{}) *GoConfigAdapter {
	if options == nil {
		options = make(map[string]interface{})
	}
	return &GoConfigAdapter{
		Options: options,
	}
}

// UnifiedConfig represents the input configuration structure
type UnifiedConfig struct {
	Application  ApplicationConfig  `json:"application"`
	Server       ServerConfig       `json:"server"`
	Database     DatabaseConfig     `json:"database"`
	Cache        CacheConfig        `json:"cache"`
	Security     SecurityConfig     `json:"security"`
	CORS         CORSConfig         `json:"cors"`
	RateLimit    RateLimitConfig    `json:"rateLimiting"`
	Logging      LoggingConfig      `json:"logging"`
	Monitoring   MonitoringConfig   `json:"monitoring"`
	External     ExternalConfig     `json:"external"`
	Features     map[string]bool    `json:"features"`
	API          APIConfig          `json:"api"`
	Validation   ValidationConfig   `json:"validation"`
}

// ApplicationConfig holds application-level settings
type ApplicationConfig struct {
	Name        string `json:"name"`
	Version     string `json:"version"`
	Environment string `json:"environment"`
	Description string `json:"description"`
	Debug       bool   `json:"debug"`
}

// ServerConfig holds server settings
type ServerConfig struct {
	Host        string            `json:"host"`
	Port        int               `json:"port"`
	ContextPath string            `json:"contextPath"`
	Timeouts    TimeoutConfig     `json:"timeouts"`
	Compression CompressionConfig `json:"compression"`
	SSL         SSLConfig         `json:"ssl"`
}

// Other config structs...
type TimeoutConfig struct {
	Connection int `json:"connection"`
	Request    int `json:"request"`
	KeepAlive  int `json:"keepAlive"`
}

type CompressionConfig struct {
	Enabled   bool `json:"enabled"`
	Threshold int  `json:"threshold"`
}

type SSLConfig struct {
	Enabled          bool   `json:"enabled"`
	Keystore         string `json:"keystore"`
	KeystorePassword string `json:"keystorePassword"`
	KeystoreType     string `json:"keystoreType"`
}

type DatabaseConfig struct {
	URL        string          `json:"url"`
	Driver     string          `json:"driver"`
	Pool       PoolConfig      `json:"pool"`
	Migrations MigrationConfig `json:"migrations"`
}

type PoolConfig struct {
	Size        int `json:"size"`
	MinIdle     int `json:"minIdle"`
	MaxIdle     int `json:"maxIdle"`
	Timeout     int `json:"timeout"`
	MaxLifetime int `json:"maxLifetime"`
}

type MigrationConfig struct {
	Enabled     bool   `json:"enabled"`
	Location    string `json:"location"`
	AutoMigrate bool   `json:"autoMigrate"`
}

type CacheConfig struct {
	Type     string            `json:"type"`
	URL      string            `json:"url"`
	Host     string            `json:"host"`
	Port     int               `json:"port"`
	Password string            `json:"password"`
	Database int               `json:"database"`
	Pool     CachePoolConfig   `json:"pool"`
	TTL      int               `json:"ttl"`
}

type CachePoolConfig struct {
	MaxActive int `json:"maxActive"`
	MaxIdle   int `json:"maxIdle"`
	MinIdle   int `json:"minIdle"`
}

type SecurityConfig struct {
	JWT      JWTConfig      `json:"jwt"`
	Password PasswordConfig `json:"password"`
	Session  SessionConfig  `json:"session"`
	Headers  HeadersConfig  `json:"headers"`
}

type JWTConfig struct {
	Secret             string `json:"secret"`
	Algorithm          string `json:"algorithm"`
	AccessTokenExpiry  int    `json:"accessTokenExpiry"`
	RefreshTokenExpiry int    `json:"refreshTokenExpiry"`
}

type PasswordConfig struct {
	MinLength            int  `json:"minLength"`
	RequireUppercase     bool `json:"requireUppercase"`
	RequireLowercase     bool `json:"requireLowercase"`
	RequireNumbers       bool `json:"requireNumbers"`
	RequireSpecialChars  bool `json:"requireSpecialChars"`
	HashRounds           int  `json:"hashRounds"`
}

type SessionConfig struct {
	Timeout       int `json:"timeout"`
	MaxConcurrent int `json:"maxConcurrent"`
}

type HeadersConfig struct {
	ContentTypeOptions       string `json:"contentTypeOptions"`
	FrameOptions            string `json:"frameOptions"`
	XSSProtection           string `json:"xssProtection"`
	StrictTransportSecurity string `json:"strictTransportSecurity"`
	ContentSecurityPolicy   string `json:"contentSecurityPolicy"`
	ReferrerPolicy          string `json:"referrerPolicy"`
}

type CORSConfig struct {
	AllowedOrigins   []string `json:"allowedOrigins"`
	AllowedMethods   []string `json:"allowedMethods"`
	AllowedHeaders   []string `json:"allowedHeaders"`
	AllowCredentials bool     `json:"allowCredentials"`
	MaxAge           int      `json:"maxAge"`
}

type RateLimitConfig struct {
	Enabled bool               `json:"enabled"`
	Global  RateLimitRule      `json:"global"`
	Auth    RateLimitRule      `json:"auth"`
	API     RateLimitRule      `json:"api"`
}

type RateLimitRule struct {
	Requests int `json:"requests"`
	Window   int `json:"window"`
}

type LoggingConfig struct {
	Level   string         `json:"level"`
	Format  string         `json:"format"`
	File    FileLogConfig  `json:"file"`
	Console ConsoleLogConfig `json:"console"`
}

type FileLogConfig struct {
	Enabled  bool   `json:"enabled"`
	Path     string `json:"path"`
	MaxSize  string `json:"maxSize"`
	MaxFiles int    `json:"maxFiles"`
	Rotation string `json:"rotation"`
}

type ConsoleLogConfig struct {
	Enabled  bool `json:"enabled"`
	Colorize bool `json:"colorize"`
}

type MonitoringConfig struct {
	Metrics     MetricsConfig     `json:"metrics"`
	HealthCheck HealthCheckConfig `json:"healthCheck"`
	Tracing     TracingConfig     `json:"tracing"`
}

type MetricsConfig struct {
	Enabled    bool              `json:"enabled"`
	Endpoint   string            `json:"endpoint"`
	Prometheus PrometheusConfig  `json:"prometheus"`
}

type PrometheusConfig struct {
	Enabled bool `json:"enabled"`
	Port    int  `json:"port"`
}

type HealthCheckConfig struct {
	Enabled  bool   `json:"enabled"`
	Endpoint string `json:"endpoint"`
	Timeout  int    `json:"timeout"`
}

type TracingConfig struct {
	Enabled bool          `json:"enabled"`
	Jaeger  JaegerConfig  `json:"jaeger"`
}

type JaegerConfig struct {
	Endpoint     string  `json:"endpoint"`
	SamplingRate float64 `json:"samplingRate"`
}

type ExternalConfig struct {
	Email   EmailConfig   `json:"email"`
	Storage StorageConfig `json:"storage"`
}

type EmailConfig struct {
	Enabled  bool       `json:"enabled"`
	Provider string     `json:"provider"`
	From     string     `json:"from"`
	SMTP     SMTPConfig `json:"smtp"`
}

type SMTPConfig struct {
	Host     string `json:"host"`
	Port     int    `json:"port"`
	Username string `json:"username"`
	Password string `json:"password"`
	Secure   bool   `json:"secure"`
	StartTLS bool   `json:"startTLS"`
}

type StorageConfig struct {
	Type  string       `json:"type"`
	Local LocalStorage `json:"local"`
	S3    S3Storage    `json:"s3"`
}

type LocalStorage struct {
	Path string `json:"path"`
}

type S3Storage struct {
	Bucket          string `json:"bucket"`
	Region          string `json:"region"`
	AccessKeyID     string `json:"accessKeyId"`
	SecretAccessKey string `json:"secretAccessKey"`
}

type APIConfig struct {
	Version     string        `json:"version"`
	Title       string        `json:"title"`
	Description string        `json:"description"`
	Contact     ContactConfig `json:"contact"`
	License     LicenseConfig `json:"license"`
	Pagination  PagingConfig  `json:"pagination"`
}

type ContactConfig struct {
	Name  string `json:"name"`
	Email string `json:"email"`
	URL   string `json:"url"`
}

type LicenseConfig struct {
	Name string `json:"name"`
	URL  string `json:"url"`
}

type PagingConfig struct {
	DefaultSize int `json:"defaultSize"`
	MaxSize     int `json:"maxSize"`
}

type ValidationConfig struct {
	MaxRequestSize string           `json:"maxRequestSize"`
	MaxJSONDepth   int              `json:"maxJsonDepth"`
	SanitizeInput  bool             `json:"sanitizeInput"`
	FileUpload     FileUploadConfig `json:"fileUpload"`
}

type FileUploadConfig struct {
	MaxFileSize        string   `json:"maxFileSize"`
	AllowedExtensions  []string `json:"allowedExtensions"`
	MaxFiles           int      `json:"maxFiles"`
}

// GoConfig represents the Go-compatible configuration structure
type GoConfig struct {
	App         AppConfig      `mapstructure:"app"`
	Server      ServerSettings `mapstructure:"server"`
	Database    DBSettings     `mapstructure:"database"`
	Redis       RedisSettings  `mapstructure:"redis"`
	Security    SecSettings    `mapstructure:"security"`
	CORS        CORSSettings   `mapstructure:"cors"`
	RateLimit   RLSettings     `mapstructure:"rateLimit"`
	Log         LogSettings    `mapstructure:"log"`
	Monitoring  MonSettings    `mapstructure:"monitoring"`
	External    ExtSettings    `mapstructure:"external"`
	Features    map[string]bool `mapstructure:"features"`
}

// Go-compatible config structs
type AppConfig struct {
	Name        string `mapstructure:"name"`
	Version     string `mapstructure:"version"`
	Environment string `mapstructure:"environment"`
	Debug       bool   `mapstructure:"debug"`
}

type ServerSettings struct {
	Host               string        `mapstructure:"host"`
	Port               int           `mapstructure:"port"`
	ReadTimeout        time.Duration `mapstructure:"readTimeout"`
	WriteTimeout       time.Duration `mapstructure:"writeTimeout"`
	IdleTimeout        time.Duration `mapstructure:"idleTimeout"`
	GracefulTimeout    time.Duration `mapstructure:"gracefulTimeout"`
	EnableCompression  bool          `mapstructure:"enableCompression"`
	CompressionLevel   int           `mapstructure:"compressionLevel"`
	TLSEnabled         bool          `mapstructure:"tlsEnabled"`
	CertFile           string        `mapstructure:"certFile"`
	KeyFile            string        `mapstructure:"keyFile"`
}

type DBSettings struct {
	Host            string        `mapstructure:"host"`
	Port            int           `mapstructure:"port"`
	User            string        `mapstructure:"user"`
	Password        string        `mapstructure:"password"`
	Database        string        `mapstructure:"database"`
	SSLMode         string        `mapstructure:"sslMode"`
	MaxOpenConns    int           `mapstructure:"maxOpenConns"`
	MaxIdleConns    int           `mapstructure:"maxIdleConns"`
	ConnMaxLifetime time.Duration `mapstructure:"connMaxLifetime"`
	ConnMaxIdleTime time.Duration `mapstructure:"connMaxIdleTime"`
}

type RedisSettings struct {
	Host         string        `mapstructure:"host"`
	Port         int           `mapstructure:"port"`
	Password     string        `mapstructure:"password"`
	Database     int           `mapstructure:"database"`
	PoolSize     int           `mapstructure:"poolSize"`
	MinIdleConns int           `mapstructure:"minIdleConns"`
	DialTimeout  time.Duration `mapstructure:"dialTimeout"`
	ReadTimeout  time.Duration `mapstructure:"readTimeout"`
	WriteTimeout time.Duration `mapstructure:"writeTimeout"`
	IdleTimeout  time.Duration `mapstructure:"idleTimeout"`
}

type SecSettings struct {
	JWTSecret           string        `mapstructure:"jwtSecret"`
	JWTExpirationHours  int           `mapstructure:"jwtExpirationHours"`
	BCryptCost          int           `mapstructure:"bcryptCost"`
	SessionTimeout      time.Duration `mapstructure:"sessionTimeout"`
	MaxLoginAttempts    int           `mapstructure:"maxLoginAttempts"`
	AccountLockoutTime  time.Duration `mapstructure:"accountLockoutTime"`
}

type CORSSettings struct {
	AllowedOrigins   []string      `mapstructure:"allowedOrigins"`
	AllowedMethods   []string      `mapstructure:"allowedMethods"`
	AllowedHeaders   []string      `mapstructure:"allowedHeaders"`
	AllowCredentials bool          `mapstructure:"allowCredentials"`
	MaxAge           time.Duration `mapstructure:"maxAge"`
}

type RLSettings struct {
	Enabled           bool          `mapstructure:"enabled"`
	RequestsPerSecond int           `mapstructure:"requestsPerSecond"`
	Burst             int           `mapstructure:"burst"`
	CleanupInterval   time.Duration `mapstructure:"cleanupInterval"`
}

type LogSettings struct {
	Level      string `mapstructure:"level"`
	Format     string `mapstructure:"format"`
	Output     string `mapstructure:"output"`
	Filename   string `mapstructure:"filename"`
	MaxSize    int    `mapstructure:"maxSize"`
	MaxBackups int    `mapstructure:"maxBackups"`
	MaxAge     int    `mapstructure:"maxAge"`
	Compress   bool   `mapstructure:"compress"`
}

type MonSettings struct {
	Enabled        bool   `mapstructure:"enabled"`
	MetricsPath    string `mapstructure:"metricsPath"`
	HealthPath     string `mapstructure:"healthPath"`
	PrometheusPort int    `mapstructure:"prometheusPort"`
}

type ExtSettings struct {
	Email   EmailSettings   `mapstructure:"email"`
	Storage StorageSettings `mapstructure:"storage"`
}

type EmailSettings struct {
	Enabled  bool   `mapstructure:"enabled"`
	Host     string `mapstructure:"host"`
	Port     int    `mapstructure:"port"`
	Username string `mapstructure:"username"`
	Password string `mapstructure:"password"`
	From     string `mapstructure:"from"`
	UseTLS   bool   `mapstructure:"useTLS"`
}

type StorageSettings struct {
	Type   string `mapstructure:"type"`
	Path   string `mapstructure:"path"`
	Bucket string `mapstructure:"bucket"`
	Region string `mapstructure:"region"`
}

// GenerateGoConfig converts unified config to Go-compatible structure
func (adapter *GoConfigAdapter) GenerateGoConfig(unifiedConfig UnifiedConfig, environment string) *GoConfig {
	goConfig := &GoConfig{
		App: AppConfig{
			Name:        unifiedConfig.Application.Name,
			Version:     unifiedConfig.Application.Version,
			Environment: environment,
			Debug:       unifiedConfig.Application.Debug || environment == "development",
		},
		Server: ServerSettings{
			Host:               unifiedConfig.Server.Host,
			Port:               unifiedConfig.Server.Port,
			ReadTimeout:        time.Duration(unifiedConfig.Server.Timeouts.Request) * time.Second,
			WriteTimeout:       time.Duration(unifiedConfig.Server.Timeouts.Request) * time.Second,
			IdleTimeout:        time.Duration(unifiedConfig.Server.Timeouts.KeepAlive) * time.Second,
			GracefulTimeout:    30 * time.Second,
			EnableCompression:  unifiedConfig.Server.Compression.Enabled,
			CompressionLevel:   6, // Default gzip level
			TLSEnabled:         unifiedConfig.Server.SSL.Enabled,
		},
		Database: adapter.generateDBSettings(unifiedConfig.Database),
		Redis:    adapter.generateRedisSettings(unifiedConfig.Cache),
		Security: adapter.generateSecuritySettings(unifiedConfig.Security),
		CORS:     adapter.generateCORSSettings(unifiedConfig.CORS),
		RateLimit: RLSettings{
			Enabled:           unifiedConfig.RateLimit.Enabled,
			RequestsPerSecond: unifiedConfig.RateLimit.Global.Requests,
			Burst:             unifiedConfig.RateLimit.Global.Requests * 2,
			CleanupInterval:   5 * time.Minute,
		},
		Log:        adapter.generateLogSettings(unifiedConfig.Logging),
		Monitoring: adapter.generateMonitoringSettings(unifiedConfig.Monitoring),
		External:   adapter.generateExternalSettings(unifiedConfig.External),
		Features:   unifiedConfig.Features,
	}

	return goConfig
}

func (adapter *GoConfigAdapter) generateDBSettings(dbConfig DatabaseConfig) DBSettings {
	// Parse database URL to extract components
	host, port, user, password, database := adapter.parseDBURL(dbConfig.URL)
	
	return DBSettings{
		Host:            host,
		Port:            port,
		User:            user,
		Password:        password,
		Database:        database,
		SSLMode:         "prefer",
		MaxOpenConns:    dbConfig.Pool.Size,
		MaxIdleConns:    dbConfig.Pool.MinIdle,
		ConnMaxLifetime: time.Duration(dbConfig.Pool.MaxLifetime) * time.Second,
		ConnMaxIdleTime: time.Duration(dbConfig.Pool.Timeout) * time.Second,
	}
}

func (adapter *GoConfigAdapter) generateRedisSettings(cacheConfig CacheConfig) RedisSettings {
	if cacheConfig.Type != "redis" {
		return RedisSettings{}
	}
	
	return RedisSettings{
		Host:         cacheConfig.Host,
		Port:         cacheConfig.Port,
		Password:     cacheConfig.Password,
		Database:     cacheConfig.Database,
		PoolSize:     cacheConfig.Pool.MaxActive,
		MinIdleConns: cacheConfig.Pool.MinIdle,
		DialTimeout:  5 * time.Second,
		ReadTimeout:  3 * time.Second,
		WriteTimeout: 3 * time.Second,
		IdleTimeout:  5 * time.Minute,
	}
}

func (adapter *GoConfigAdapter) generateSecuritySettings(secConfig SecurityConfig) SecSettings {
	return SecSettings{
		JWTSecret:          secConfig.JWT.Secret,
		JWTExpirationHours: secConfig.JWT.AccessTokenExpiry / 3600,
		BCryptCost:         secConfig.Password.HashRounds,
		SessionTimeout:     time.Duration(secConfig.Session.Timeout) * time.Second,
		MaxLoginAttempts:   5, // Default
		AccountLockoutTime: 30 * time.Minute,
	}
}

func (adapter *GoConfigAdapter) generateCORSSettings(corsConfig CORSConfig) CORSSettings {
	return CORSSettings{
		AllowedOrigins:   corsConfig.AllowedOrigins,
		AllowedMethods:   corsConfig.AllowedMethods,
		AllowedHeaders:   corsConfig.AllowedHeaders,
		AllowCredentials: corsConfig.AllowCredentials,
		MaxAge:           time.Duration(corsConfig.MaxAge) * time.Second,
	}
}

func (adapter *GoConfigAdapter) generateLogSettings(logConfig LoggingConfig) LogSettings {
	return LogSettings{
		Level:      strings.ToLower(logConfig.Level),
		Format:     logConfig.Format,
		Output:     "both", // console and file
		Filename:   logConfig.File.Path,
		MaxSize:    adapter.parseSizeToMB(logConfig.File.MaxSize),
		MaxBackups: logConfig.File.MaxFiles,
		MaxAge:     30, // days
		Compress:   true,
	}
}

func (adapter *GoConfigAdapter) generateMonitoringSettings(monConfig MonitoringConfig) MonSettings {
	return MonSettings{
		Enabled:        monConfig.Metrics.Enabled,
		MetricsPath:    monConfig.Metrics.Endpoint,
		HealthPath:     monConfig.HealthCheck.Endpoint,
		PrometheusPort: monConfig.Metrics.Prometheus.Port,
	}
}

func (adapter *GoConfigAdapter) generateExternalSettings(extConfig ExternalConfig) ExtSettings {
	return ExtSettings{
		Email: EmailSettings{
			Enabled:  extConfig.Email.Enabled,
			Host:     extConfig.Email.SMTP.Host,
			Port:     extConfig.Email.SMTP.Port,
			Username: extConfig.Email.SMTP.Username,
			Password: extConfig.Email.SMTP.Password,
			From:     extConfig.Email.From,
			UseTLS:   extConfig.Email.SMTP.StartTLS,
		},
		Storage: StorageSettings{
			Type:   extConfig.Storage.Type,
			Path:   extConfig.Storage.Local.Path,
			Bucket: extConfig.Storage.S3.Bucket,
			Region: extConfig.Storage.S3.Region,
		},
	}
}

// GenerateConfigStruct generates Go struct code for configuration
func (adapter *GoConfigAdapter) GenerateConfigStruct() string {
	configTemplate := `package config

import (
	"fmt"
	"os"
	"strconv"
	"strings"
	"time"
)

// Config holds all configuration for the application
type Config struct {
	// Application configuration
	AppName        string
	AppVersion     string
	Environment    string
	Debug          bool

	// Server configuration
	ServerHost     string
	ServerPort     int
	ReadTimeout    time.Duration
	WriteTimeout   time.Duration
	IdleTimeout    time.Duration

	// Database configuration
	DatabaseURL    string
	MaxOpenConns   int
	MaxIdleConns   int
	ConnMaxLifetime time.Duration

	// Redis configuration
	RedisHost      string
	RedisPort      int
	RedisPassword  string
	RedisDatabase  int

	// Security configuration
	JWTSecret           string
	JWTExpirationHours  int
	BCryptCost          int
	SessionTimeout      time.Duration

	// CORS configuration
	CORSAllowedOrigins []string
	CORSAllowedMethods []string
	CORSAllowedHeaders []string

	// Rate limiting configuration
	RateLimitEnabled     bool
	RateLimitRPS         int
	RateLimitBurst       int

	// Logging configuration
	LogLevel     string
	LogFormat    string
	LogOutput    string

	// Monitoring configuration
	MetricsEnabled bool
	MetricsPath    string
	HealthPath     string

	// External services
	EmailEnabled bool
	SMTPHost     string
	SMTPPort     int
	SMTPUsername string
	SMTPPassword string
}

// Load loads configuration from environment variables
func Load() (*Config, error) {
	cfg := &Config{
		// Application defaults
		AppName:     getEnvWithDefault("APP_NAME", "go-app"),
		AppVersion:  getEnvWithDefault("APP_VERSION", "1.0.0"),
		Environment: getEnvWithDefault("ENVIRONMENT", "development"),
		Debug:       getEnvBool("DEBUG", true),

		// Server defaults
		ServerHost:   getEnvWithDefault("HOST", "0.0.0.0"),
		ServerPort:   getEnvInt("PORT", 8080),
		ReadTimeout:  time.Duration(getEnvInt("READ_timeout", 60)) * time.Second,
		WriteTimeout: time.Duration(getEnvInt("write_timeout", 60)) * time.Second,
		IdleTimeout:  time.Duration(getEnvInt("idle_timeout", 120)) * time.Second,

		// Database defaults
		DatabaseURL:      getEnvWithDefault("DATABASE_URL", "postgres://user:password@localhost:5432/app_db?sslmode=disable"),
		MaxOpenConns:     getEnvInt("DB_MAX_OPEN_CONNS", 25),
		MaxIdleConns:     getEnvInt("DB_MAX_IDLE_CONNS", 10),
		ConnMaxLifetime:  time.Duration(getEnvInt("DB_CONN_MAX_LIFETIME", 1800)) * time.Second,

		// Redis defaults
		RedisHost:     getEnvWithDefault("REDIS_HOST", "localhost"),
		RedisPort:     getEnvInt("REDIS_PORT", 6379),
		RedisPassword: getEnvWithDefault("REDIS_PASSWORD", ""),
		RedisDatabase: getEnvInt("REDIS_DATABASE", 0),

		// Security defaults
		JWTSecret:          getEnvWithDefault("JWT_SECRET", "your-super-secret-jwt-key-change-in-production"),
		JWTExpirationHours: getEnvInt("JWT_EXPIRATION_HOURS", 24),
		BCryptCost:         getEnvInt("BCRYPT_COST", 12),
		SessionTimeout:     time.Duration(getEnvInt("SESSION_TIMEOUT", 3600)) * time.Second,

		// CORS defaults
		CORSAllowedOrigins: getEnvSlice("CORS_ALLOWED_ORIGINS", []string{"http://localhost:3000", "http://localhost:8080"}),
		CORSAllowedMethods: getEnvSlice("CORS_ALLOWED_METHODS", []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"}),
		CORSAllowedHeaders: getEnvSlice("CORS_ALLOWED_HEADERS", []string{"Origin", "Content-Type", "Accept", "Authorization", "X-Requested-With"}),

		// Rate limiting defaults
		RateLimitEnabled: getEnvBool("RATE_LIMIT_ENABLED", true),
		RateLimitRPS:     getEnvInt("RATE_LIMIT_RPS", 100),
		RateLimitBurst:   getEnvInt("RATE_LIMIT_BURST", 200),

		// Logging defaults
		LogLevel:  getEnvWithDefault("LOG_LEVEL", "info"),
		LogFormat: getEnvWithDefault("LOG_FORMAT", "json"),
		LogOutput: getEnvWithDefault("LOG_OUTPUT", "stdout"),

		// Monitoring defaults
		MetricsEnabled: getEnvBool("METRICS_ENABLED", true),
		MetricsPath:    getEnvWithDefault("METRICS_PATH", "/metrics"),
		HealthPath:     getEnvWithDefault("HEALTH_PATH", "/health"),

		// Email defaults
		EmailEnabled: getEnvBool("EMAIL_ENABLED", false),
		SMTPHost:     getEnvWithDefault("SMTP_HOST", "localhost"),
		SMTPPort:     getEnvInt("SMTP_PORT", 587),
		SMTPUsername: getEnvWithDefault("SMTP_USERNAME", ""),
		SMTPPassword: getEnvWithDefault("SMTP_PASSWORD", ""),
	}

	// Validate configuration
	if err := cfg.Validate(); err != nil {
		return nil, fmt.Errorf("configuration validation failed: %w", err)
	}

	return cfg, nil
}

// Validate checks that required configuration values are set
func (c *Config) Validate() error {
	if c.JWTSecret == "your-super-secret-jwt-key-change-in-production" && c.Environment == "production" {
		return fmt.Errorf("JWT_SECRET must be set in production")
	}

	if c.JWTExpirationHours <= 0 {
		return fmt.Errorf("JWT_EXPIRATION_HOURS must be positive")
	}

	if c.BCryptCost < 4 || c.BCryptCost > 31 {
		return fmt.Errorf("BCRYPT_COST must be between 4 and 31")
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
`

	return configTemplate
}

// GenerateEnvFile generates .env file content
func (adapter *GoConfigAdapter) GenerateEnvFile(unifiedConfig UnifiedConfig, environment string) string {
	var envLines []string

	// Application
	envLines = append(envLines,
		"# Application Configuration",
		fmt.Sprintf("APP_NAME=%s", unifiedConfig.Application.Name),
		fmt.Sprintf("APP_VERSION=%s", unifiedConfig.Application.Version),
		fmt.Sprintf("ENVIRONMENT=%s", environment),
		fmt.Sprintf("DEBUG=%t", unifiedConfig.Application.Debug),
		"",
	)

	// Server
	envLines = append(envLines,
		"# Server Configuration",
		fmt.Sprintf("HOST=%s", unifiedConfig.Server.Host),
		fmt.Sprintf("PORT=%d", unifiedConfig.Server.Port),
		"",
	)

	// Database
	envLines = append(envLines,
		"# Database Configuration",
		fmt.Sprintf("DATABASE_URL=%s", unifiedConfig.Database.URL),
		"",
	)

	// Redis
	if unifiedConfig.Cache.Type == "redis" {
		envLines = append(envLines,
			"# Redis Configuration",
			fmt.Sprintf("REDIS_HOST=%s", unifiedConfig.Cache.Host),
			fmt.Sprintf("REDIS_PORT=%d", unifiedConfig.Cache.Port),
			"REDIS_PASSWORD=",
			fmt.Sprintf("REDIS_DATABASE=%d", unifiedConfig.Cache.Database),
			"",
		)
	}

	// Security
	envLines = append(envLines,
		"# Security Configuration",
		fmt.Sprintf("JWT_SECRET=%s", adapter.generateSecretKey()),
		fmt.Sprintf("JWT_EXPIRATION_HOURS=%d", unifiedConfig.Security.JWT.AccessTokenExpiry/3600),
		fmt.Sprintf("BCRYPT_COST=%d", unifiedConfig.Security.Password.HashRounds),
		"",
	)

	// External services
	if unifiedConfig.External.Email.Enabled {
		envLines = append(envLines,
			"# Email Configuration",
			"EMAIL_ENABLED=true",
			"SMTP_HOST=",
			"SMTP_PORT=587",
			"SMTP_USERNAME=",
			"SMTP_PASSWORD=",
			"",
		)
	}

	return strings.Join(envLines, "\n")
}

// Helper methods
func (adapter *GoConfigAdapter) parseDBURL(dbURL string) (host string, port int, user, password, database string) {
	// Simple URL parsing - in production, use proper URL parsing
	// This is a simplified implementation
	host = "localhost"
	port = 5432
	user = "user"
	password = "password"
	database = "app_db"
	return
}

func (adapter *GoConfigAdapter) parseSizeToMB(sizeStr string) int {
	// Parse size string like "10MB" to integer MB
	sizeStr = strings.ToUpper(strings.TrimSpace(sizeStr))
	if strings.HasSuffix(sizeStr, "MB") {
		if size, err := strconv.Atoi(strings.TrimSuffix(sizeStr, "MB")); err == nil {
			return size
		}
	}
	return 10 // Default 10MB
}

func (adapter *GoConfigAdapter) generateSecretKey() string {
	// In a real implementation, generate a secure random key
	return "your-generated-secret-key-here"
}