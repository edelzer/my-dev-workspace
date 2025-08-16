# CLAUDE.md - Go Gin Template

This file provides guidance to Claude Code (claude.ai/code) when working with this Go Gin template, incorporating professional development protocols and best practices.

## ⚠️ CRITICAL: AI AGENT UNCERTAINTY PROTOCOL ⚠️

**ABSOLUTE LAW #1: STOP WHEN UNCERTAIN**

If you are unsure about ANY of the following, you MUST immediately stop all actions and request clarification:
- Go idioms, patterns, or best practices
- Database schema changes or migrations
- Security implications of authentication/authorization changes
- Performance impacts of middleware or database queries
- API design decisions and HTTP status codes
- Concurrent programming patterns and goroutine usage

**MANDATORY ACTIONS WHEN UNCERTAIN:**
1. **STOP** - Cease all implementation activities immediately
2. **ASSESS** - Clearly identify what you don't understand about Go or the codebase
3. **REPORT** - Explain the uncertainty and request guidance
4. **WAIT** - Do not proceed until you receive clear direction

## Go Template Overview

This is a professional Go Gin template designed for high-performance, secure web API development with comprehensive security, testing, and monitoring capabilities.

## Core Development Philosophy

### Security-First Go Development
Every Go feature prioritizes security from design through deployment. Go's built-in security features are leveraged alongside industry best practices.

### Performance-Oriented Architecture
Leveraging Go's performance advantages through proper goroutine usage, connection pooling, and efficient memory management.

### Clean Architecture Pattern
Implementing clean architecture with clear separation between handlers, services, repositories, and models.

### Go-Specific Best Practices
Following Go conventions, idioms, and community standards for maintainable, idiomatic code.

## Project Structure and Go Conventions

```
go-gin-template/
├── cmd/                    # Application entry points (Go convention)
│   └── server/            # Main server binary
├── internal/              # Private packages (Go convention)
│   ├── api/              # HTTP layer
│   ├── auth/             # Authentication logic
│   ├── config/           # Configuration management
│   ├── database/         # Database operations
│   ├── models/           # Data structures
│   ├── repository/       # Data access layer
│   ├── services/         # Business logic
│   └── utils/            # Utilities
├── pkg/                   # Public packages (Go convention)
└── tests/                 # Test suites
```

## Go-Specific Development Protocols

### 1. Go Code Standards
- **Effective Go**: Follow https://golang.org/doc/effective_go.html
- **Go Code Review Comments**: Adhere to https://github.com/golang/go/wiki/CodeReviewComments
- **gofmt/goimports**: All code must be formatted with standard tools
- **golangci-lint**: Pass all linter checks
- **go vet**: Pass static analysis checks

### 2. Error Handling Protocol
```go
// Always wrap errors with context
if err != nil {
    return fmt.Errorf("failed to process user data: %w", err)
}

// Use custom error types for business logic
var ErrUserNotFound = errors.New("user not found")

// Log errors with structured logging
logger.Error("Database operation failed", "error", err, "user_id", userID)
```

### 3. Concurrency and Goroutines
- **Context Usage**: Always pass context.Context for cancellation
- **Goroutine Management**: Proper cleanup and synchronization
- **Channel Communication**: Prefer channels over shared memory
- **Worker Pools**: Use for bounded concurrency

### 4. Database Operations
- **GORM Best Practices**: Proper preloading, transactions, and error handling
- **Migration Management**: Version-controlled schema changes
- **Connection Pooling**: Configured for optimal performance
- **Query Optimization**: Use of indexes and efficient queries

### 5. HTTP and Gin Framework
- **Middleware Order**: Security, logging, rate limiting, authentication
- **Request Validation**: Comprehensive input validation using validator package
- **Response Standards**: Consistent JSON response formats
- **Error Responses**: Structured error handling with proper HTTP status codes

## Security Implementation in Go

### JWT Authentication
```go
// Token generation with proper claims
func (j *JWTService) GenerateToken(user *models.User) (string, error) {
    claims := Claims{
        UserID:   user.ID,
        Email:    user.Email,
        Roles:    extractRoles(user.Roles),
        RegisteredClaims: jwt.RegisteredClaims{
            ExpiresAt: jwt.NewNumericDate(time.Now().Add(j.expirationTime)),
            IssuedAt:  jwt.NewNumericDate(time.Now()),
            Subject:   user.ID.String(),
        },
    }
    return jwt.NewWithClaims(jwt.SigningMethodHS256, claims).SignedString(j.secretKey)
}
```

### Middleware Security
```go
// Security headers middleware
func (s *SecurityMiddleware) SecurityHeaders() gin.HandlerFunc {
    return func(c *gin.Context) {
        c.Header("X-Content-Type-Options", "nosniff")
        c.Header("X-Frame-Options", "DENY")
        c.Header("X-XSS-Protection", "1; mode=block")
        c.Next()
    }
}
```

### Rate Limiting with Redis
```go
// Rate limiting implementation
func (rl *RateLimiter) checkRateLimit(key string, requests int, window time.Duration) (bool, int, time.Time, error) {
    ctx := context.Background()
    now := time.Now()
    windowStart := now.Truncate(window)
    
    pipe := rl.redisClient.Pipeline()
    countKey := fmt.Sprintf("%s:%d", key, windowStart.Unix())
    
    incrCmd := pipe.Incr(ctx, countKey)
    pipe.Expire(ctx, countKey, window)
    
    _, err := pipe.Exec(ctx)
    // ... implementation
}
```

## Testing Strategies for Go

### Unit Testing
```go
func TestUserService_CreateUser(t *testing.T) {
    // Arrange
    mockRepo := &mocks.UserRepository{}
    service := NewUserService(mockRepo)
    
    user := &models.User{Email: "test@example.com"}
    mockRepo.On("Create", mock.Anything, user).Return(nil)
    
    // Act
    err := service.CreateUser(context.Background(), user)
    
    // Assert
    assert.NoError(t, err)
    mockRepo.AssertExpectations(t)
}
```

### Integration Testing
```go
func TestAPI_CreateUser_Integration(t *testing.T) {
    // Setup test database
    db := setupTestDB(t)
    defer teardownTestDB(t, db)
    
    // Create test server
    router := setupTestRouter(db)
    
    // Test request
    req := httptest.NewRequest("POST", "/api/v1/users", body)
    w := httptest.NewRecorder()
    router.ServeHTTP(w, req)
    
    assert.Equal(t, 201, w.Code)
}
```

### Benchmark Testing
```go
func BenchmarkUserService_GetUser(b *testing.B) {
    service := setupBenchmarkService()
    userID := uuid.New()
    
    b.ResetTimer()
    for i := 0; i < b.N; i++ {
        _, err := service.GetUser(context.Background(), userID)
        if err != nil {
            b.Fatal(err)
        }
    }
}
```

## Performance Optimization

### Database Performance
```go
// Connection pool configuration
func configureDB(db *gorm.DB) error {
    sqlDB, err := db.DB()
    if err != nil {
        return err
    }
    
    sqlDB.SetMaxOpenConns(25)
    sqlDB.SetMaxIdleConns(5)
    sqlDB.SetConnMaxLifetime(time.Hour)
    sqlDB.SetConnMaxIdleTime(10 * time.Minute)
    
    return nil
}
```

### Redis Optimization
```go
// Redis client configuration
func newRedisClient(config *Config) *redis.Client {
    return redis.NewClient(&redis.Options{
        Addr:         config.RedisAddr,
        PoolSize:     10,
        MinIdleConns: 2,
        PoolTimeout:  30 * time.Second,
        IdleTimeout:  5 * time.Minute,
    })
}
```

### Memory Management
- **Avoid Memory Leaks**: Proper cleanup of goroutines and channels
- **Buffer Reuse**: Use sync.Pool for frequently allocated objects
- **String Building**: Use strings.Builder for efficient string concatenation

## Development Commands

### Essential Make Commands
```bash
# Development
make dev          # Start with hot reloading
make run          # Run application
make build        # Build binary

# Testing
make test         # Run all tests
make test-cover   # Run tests with coverage
make benchmark    # Run benchmarks

# Quality
make lint         # Run linters
make fmt          # Format code
make vet          # Run go vet
make security     # Security checks

# Database
make db-migrate   # Run migrations
make db-rollback  # Rollback migration
make db-seed      # Seed test data

# Docker
make docker-build # Build Docker image
make docker-run   # Run container
```

## Claude Code Integration

### Available Commands
When working with this Go template, you can use these commands:

- `/go:test` - Run comprehensive test suite
- `/go:lint` - Perform code quality checks
- `/go:security` - Run security analysis
- `/go:build` - Build the application
- `/go:benchmark` - Run performance benchmarks
- `/go:docs` - Generate API documentation

### Development Workflow
1. **Analysis Phase**: Understand requirements and Go-specific considerations
2. **Design Phase**: Plan Go-idiomatic solutions with proper interfaces
3. **Implementation Phase**: Write clean, tested Go code
4. **Testing Phase**: Comprehensive unit, integration, and benchmark tests
5. **Security Phase**: Validate security implementations
6. **Performance Phase**: Optimize for Go's performance characteristics

## API Design Standards

### Request/Response Format
```go
// Standard response structure
type APIResponse struct {
    Success bool        `json:"success"`
    Data    interface{} `json:"data,omitempty"`
    Error   *APIError   `json:"error,omitempty"`
    Meta    *Meta       `json:"meta,omitempty"`
}

// Error response structure
type APIError struct {
    Code    string `json:"code"`
    Message string `json:"message"`
    Details string `json:"details,omitempty"`
}
```

### HTTP Status Code Usage
- `200` - Success with data
- `201` - Created successfully
- `204` - Success without content
- `400` - Bad request (validation errors)
- `401` - Unauthorized (authentication required)
- `403` - Forbidden (insufficient permissions)
- `404` - Not found
- `409` - Conflict (duplicate resource)
- `422` - Unprocessable Entity (business logic error)
- `429` - Too Many Requests (rate limited)
- `500` - Internal Server Error

## Monitoring and Observability

### Structured Logging
```go
// Use structured logging throughout
logger.Info("User created successfully",
    "user_id", user.ID,
    "email", user.Email,
    "ip_address", clientIP,
)

logger.Error("Database operation failed",
    "error", err,
    "operation", "create_user",
    "user_id", userID,
)
```

### Metrics Collection
```go
// Prometheus metrics example
var (
    requestDuration = prometheus.NewHistogramVec(
        prometheus.HistogramOpts{
            Name: "http_request_duration_seconds",
            Help: "HTTP request duration in seconds",
        },
        []string{"method", "path", "status_code"},
    )
)
```

### Health Checks
```go
// Comprehensive health check
func (h *HealthHandler) Health(c *gin.Context) {
    health := &HealthStatus{
        Status:    "healthy",
        Timestamp: time.Now(),
        Services:  make(map[string]ServiceHealth),
    }
    
    // Check database
    if err := h.checkDatabase(); err != nil {
        health.Services["database"] = ServiceHealth{
            Status: "unhealthy",
            Error:  err.Error(),
        }
        health.Status = "degraded"
    }
    
    c.JSON(200, health)
}
```

## Database Patterns

### Repository Pattern
```go
type UserRepository interface {
    Create(ctx context.Context, user *User) error
    GetByID(ctx context.Context, id uuid.UUID) (*User, error)
    Update(ctx context.Context, user *User) error
    Delete(ctx context.Context, id uuid.UUID) error
}

type userRepository struct {
    db *gorm.DB
}

func (r *userRepository) Create(ctx context.Context, user *User) error {
    if err := r.db.WithContext(ctx).Create(user).Error; err != nil {
        return fmt.Errorf("failed to create user: %w", err)
    }
    return nil
}
```

### Transaction Management
```go
func (s *UserService) CreateUserWithRole(ctx context.Context, user *User, roleID uuid.UUID) error {
    return s.db.WithContext(ctx).Transaction(func(tx *gorm.DB) error {
        if err := tx.Create(user).Error; err != nil {
            return err
        }
        
        userRole := &UserRole{
            UserID: user.ID,
            RoleID: roleID,
        }
        return tx.Create(userRole).Error
    })
}
```

## Deployment and Operations

### Docker Best Practices
- Multi-stage builds for smaller images
- Non-root user for security
- Health checks for container orchestration
- Proper signal handling for graceful shutdown

### Kubernetes Integration
- Readiness and liveness probes
- Resource limits and requests
- ConfigMaps and Secrets for configuration
- Horizontal Pod Autoscaling (HPA) support

### Configuration Management
```go
// Environment-based configuration
type Config struct {
    Environment string `mapstructure:"ENVIRONMENT"`
    Port        string `mapstructure:"PORT"`
    DatabaseURL string `mapstructure:"DATABASE_URL"`
    RedisURL    string `mapstructure:"REDIS_URL"`
    JWTSecret   string `mapstructure:"JWT_SECRET"`
}

func Load() (*Config, error) {
    viper.AutomaticEnv()
    
    config := &Config{}
    if err := viper.Unmarshal(config); err != nil {
        return nil, fmt.Errorf("failed to unmarshal config: %w", err)
    }
    
    return config, nil
}
```

## Common Go Patterns and Idioms

### Context Usage
```go
// Always accept context as first parameter
func (s *UserService) GetUser(ctx context.Context, id uuid.UUID) (*User, error) {
    // Check for cancellation
    select {
    case <-ctx.Done():
        return nil, ctx.Err()
    default:
    }
    
    return s.userRepo.GetByID(ctx, id)
}
```

### Error Wrapping
```go
// Wrap errors with context
if err := s.userRepo.Create(ctx, user); err != nil {
    return fmt.Errorf("failed to create user %s: %w", user.Email, err)
}
```

### Interface Design
```go
// Keep interfaces small and focused
type Authenticator interface {
    Authenticate(ctx context.Context, token string) (*User, error)
}

type Authorizer interface {
    Authorize(ctx context.Context, user *User, resource string) error
}
```

## Remember: Go-Specific Excellence

These guidelines enable building high-performance, secure, and maintainable Go applications that leverage the language's strengths:

- **Simplicity**: Write clear, readable code
- **Performance**: Leverage Go's performance characteristics
- **Concurrency**: Use goroutines and channels effectively
- **Standards**: Follow Go community conventions
- **Testing**: Comprehensive test coverage with benchmarks
- **Security**: Implement defense in depth
- **Observability**: Structured logging and metrics

Follow Go idioms, maintain clean architecture, implement comprehensive testing, and leverage Go's built-in features for optimal performance and security.