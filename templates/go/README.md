# Go Gin Professional Template

A production-ready Go Gin template with comprehensive security, testing, and development features integrated with the BMAD workspace methodology.

## 🚀 Features

### Security-First Architecture
- **JWT Authentication**: Secure token-based authentication with refresh tokens and blacklisting
- **Role-Based Access Control**: Comprehensive RBAC system with permissions and roles
- **Rate Limiting**: Advanced rate limiting with Redis backend and progressive penalties
- **Security Middleware**: Complete security headers implementation (HSTS, CSP, XSS Protection)
- **Password Security**: Bcrypt hashing with strength validation and secure generation
- **Audit Logging**: Comprehensive security event logging and monitoring
- **Input Validation**: Thorough input validation and sanitization

### Database & Caching
- **GORM Integration**: High-performance ORM with PostgreSQL support
- **Database Migrations**: Automated schema management and versioning
- **Redis Integration**: Caching, sessions, and rate limiting with Redis
- **Connection Pooling**: Optimized database connection management
- **Repository Pattern**: Clean separation of data access logic

### Testing & Quality
- **TDD Methodology**: Test-driven development with comprehensive test suite
- **Unit Testing**: Comprehensive unit tests with mocking support
- **Integration Testing**: Database and API integration tests
- **Benchmark Testing**: Performance testing and optimization
- **Code Coverage**: 90%+ code coverage requirements with detailed reporting
- **Static Analysis**: gosec, golangci-lint, and govulncheck integration

### Development Experience
- **Hot Reloading**: Fast development with Air hot reloading
- **Claude Code Integration**: Full integration with Claude Code AI assistant
- **BMAD Workspace**: Aligned with BMAD development methodology and protocols
- **Docker Support**: Multi-stage Docker builds with development and production targets
- **Comprehensive Logging**: Structured JSON logging with security event tracking
- **Development Tools**: Makefile with comprehensive development commands

### Production Ready
- **CI/CD Pipeline**: Complete GitHub Actions workflow with security scanning
- **Container Security**: Docker security best practices with non-root users
- **Health Checks**: Kubernetes-ready health check endpoints
- **Performance Optimized**: Connection pooling, caching, and async operations
- **Monitoring Integration**: Prometheus metrics and structured logging
- **Deployment Ready**: Kubernetes, Docker Compose, and cloud deployment support

## 📋 Prerequisites

- Go 1.21+
- Docker and Docker Compose
- PostgreSQL database
- Redis server
- Make (for development commands)

## 🛠️ Quick Start

### 1. Create Project from Template

```bash
# Using the BMAD workspace script
node scripts/new-project.js my-go-api go

# Or clone directly
git clone <template-repo> my-go-api
cd my-go-api
```

### 2. Environment Setup

```bash
# Copy environment template
cp .env.example .env

# Edit environment variables
nano .env
```

### 3. Install Dependencies and Tools

```bash
# Setup development environment
make setup

# Or manually install dependencies
go mod download
make install-tools
```

### 4. Database Setup

```bash
# Start services with Docker Compose
make docker-compose-up

# Or setup manually with local PostgreSQL
make db-migrate
```

### 5. Start Development Server

```bash
# Start with hot reloading
make dev

# Or run normally
make run
```

### 6. Verify Installation

```bash
# Check health endpoint
curl http://localhost:8080/health/

# Run tests
make test

# Check code quality
make check
```

## 🏗️ Project Structure

```
go-gin-template/
├── cmd/                    # Application entry points
│   └── server/            # Main server application
├── internal/              # Private application code
│   ├── api/              # API layer
│   │   ├── handlers/     # HTTP handlers (controllers)
│   │   ├── middleware/   # Security and logging middleware
│   │   ├── routes/       # Route definitions
│   │   └── responses/    # API response structures
│   ├── auth/             # Authentication & authorization
│   ├── config/           # Configuration management
│   ├── database/         # Database connection and migrations
│   ├── models/           # Data models and DTOs
│   ├── repository/       # Data access layer with interfaces
│   ├── services/         # Business logic layer
│   └── utils/            # Utility functions and helpers
├── pkg/                   # Public packages
│   ├── errors/           # Custom error types
│   └── response/         # Response utilities
├── tests/                 # Test suites
│   ├── integration/      # Integration tests
│   ├── unit/             # Unit tests
│   └── fixtures/         # Test fixtures and data
├── deployments/           # Deployment configurations
│   ├── docker/           # Docker configurations
│   └── k8s/              # Kubernetes manifests
├── configs/               # Configuration files
├── scripts/               # Development and deployment scripts
├── docs/                  # API documentation
├── .github/workflows/     # CI/CD pipelines
├── go.mod                 # Go modules
├── go.sum                 # Dependency checksums
├── Dockerfile             # Container configuration
├── docker-compose.yml     # Development environment
├── Makefile               # Build automation
├── .env.example           # Environment template
├── README.md              # This file
└── CLAUDE.md              # Claude Code integration
```

## 🔧 Development

### Running Tests

```bash
# All tests with coverage
make test

# Integration tests
make test-integration

# Benchmarks
make benchmark

# Coverage report
make test-cover
```

### Code Quality

```bash
# Format code
make fmt

# Lint code
make lint

# Security checks
make security

# All quality checks
make check
```

### Database Operations

```bash
# Run migrations
make db-migrate

# Rollback migration
make db-rollback

# Reset database
make db-reset

# Seed test data
make db-seed
```

### Development Server

```bash
# Start with hot reloading
make dev

# Build and run
make build-local && ./app

# Run with Docker
make docker-run
```

## 🚀 Deployment

### Docker Deployment

```bash
# Build production image
make docker-build

# Run with Docker Compose
make docker-compose-up

# Check logs
make docker-compose-logs
```

### Production Build

```bash
# Build optimized binary
make build-prod

# Build and deploy
make deploy
```

### Kubernetes Deployment

```yaml
# Example Kubernetes deployment
apiVersion: apps/v1
kind: Deployment
metadata:
  name: go-api
spec:
  replicas: 3
  selector:
    matchLabels:
      app: go-api
  template:
    metadata:
      labels:
        app: go-api
    spec:
      containers:
      - name: go-api
        image: your-registry/go-api:latest
        ports:
        - containerPort: 8080
        env:
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: app-secrets
              key: database-url
        livenessProbe:
          httpGet:
            path: /health/liveness
            port: 8080
        readinessProbe:
          httpGet:
            path: /health/readiness
            port: 8080
```

## 🔒 Security Features

### Authentication Flow
1. **User Registration**: Password strength validation and email verification
2. **Login**: JWT token generation with device fingerprinting
3. **Token Refresh**: Secure token refresh with rotation and blacklisting
4. **Logout**: Token blacklisting and session cleanup

### Security Middleware Stack
1. **Security Headers**: OWASP recommended security headers
2. **Rate Limiting**: Configurable rate limits with Redis backend
3. **Authentication**: JWT validation and user context injection
4. **Authorization**: Role-based and permission-based access control
5. **Logging**: Comprehensive request/response logging
6. **Input Validation**: Request validation and sanitization

### Monitoring & Alerting
- **Security Events**: Failed login attempts, suspicious patterns
- **Performance Metrics**: Response times, database health, Redis health
- **Error Tracking**: Structured error logging with context
- **Audit Logging**: Complete audit trail for compliance

## 🧪 Testing Strategy

### Test Categories
- **Unit Tests**: Individual component testing with mocks
- **Integration Tests**: API endpoint testing with real database
- **Security Tests**: Authentication and authorization testing
- **Performance Tests**: Load testing and benchmarking
- **Contract Tests**: API contract validation

### Test-Driven Development
1. **Write Failing Tests**: Start with failing tests that define requirements
2. **Implement Code**: Write minimal code to make tests pass
3. **Refactor**: Improve code while maintaining test coverage
4. **Repeat**: Continue cycle for new features

## 📊 Monitoring & Observability

### Health Checks
- `/health/` - Comprehensive health status
- `/health/readiness` - Kubernetes readiness probe
- `/health/liveness` - Kubernetes liveness probe

### Metrics & Monitoring
- **Prometheus Integration**: Custom metrics and instrumentation
- **Structured Logging**: JSON logging with correlation IDs
- **Database Monitoring**: Connection pool metrics and query performance
- **Redis Monitoring**: Cache hit rates and connection health

## 🤝 Claude Code Integration

This template is fully integrated with Claude Code AI assistant:

### Available Commands
- `/go:test` - Run test suite with coverage
- `/go:lint` - Code quality checks
- `/go:security` - Security analysis
- `/go:build` - Build application
- `/go:deploy` - Deployment assistance

### Development Protocols
- **Security-First**: Every feature starts with security analysis
- **TDD Methodology**: Test-driven development workflow
- **Task Decomposition**: 15-30 minute development cycles
- **Technical Debt Management**: Systematic debt tracking and resolution

## 📚 API Documentation

### Authentication Endpoints
```
POST /api/v1/auth/register    - User registration
POST /api/v1/auth/login       - User login
POST /api/v1/auth/refresh     - Token refresh
POST /api/v1/auth/logout      - User logout
POST /api/v1/auth/forgot-password - Password reset request
POST /api/v1/auth/reset-password  - Password reset
POST /api/v1/auth/verify-email    - Email verification
```

### User Endpoints
```
GET    /api/v1/user/profile        - Get user profile
PUT    /api/v1/user/profile        - Update user profile
POST   /api/v1/user/change-password - Change password
GET    /api/v1/user/sessions       - Get active sessions
DELETE /api/v1/user/sessions/:id   - Revoke session
```

### Admin Endpoints
```
GET    /api/v1/admin/users         - List users
GET    /api/v1/admin/users/:id     - Get user details
PUT    /api/v1/admin/users/:id     - Update user
DELETE /api/v1/admin/users/:id     - Delete user
POST   /api/v1/admin/users/:id/activate   - Activate user
POST   /api/v1/admin/users/:id/deactivate - Deactivate user
GET    /api/v1/admin/system/stats  - System statistics
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Make changes following the coding standards
4. Run tests: `make test`
5. Run quality checks: `make check`
6. Commit changes: `git commit -m "feat: add new feature"`
7. Push to branch: `git push origin feature/new-feature`
8. Create a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: Full documentation in `/docs` directory
- **GitHub Issues**: Report bugs and request features
- **Claude Code**: Use Claude Code AI assistant for development help
- **Community**: Join our development community discussions

## 🏆 Template Features Checklist

- ✅ **Go Gin Framework**: Modern HTTP web framework
- ✅ **Security Middleware**: OWASP security implementation
- ✅ **JWT Authentication**: Complete auth system with refresh tokens
- ✅ **GORM Integration**: PostgreSQL with automated migrations
- ✅ **Redis Caching**: Session management and rate limiting
- ✅ **Comprehensive Testing**: Unit, integration, and performance tests
- ✅ **Code Quality Tools**: golangci-lint, gosec, govulncheck
- ✅ **Docker Support**: Multi-stage builds and compose
- ✅ **CI/CD Pipeline**: GitHub Actions with security scanning
- ✅ **Claude Code Integration**: AI-assisted development workflow
- ✅ **Production Ready**: Monitoring, logging, and deployment configs
- ✅ **API Documentation**: Complete endpoint documentation
- ✅ **Performance Optimized**: Connection pooling and caching
- ✅ **Security Focused**: Comprehensive security implementations

---

**Built with ❤️ using the BMAD workspace methodology and Claude Code AI assistant.**