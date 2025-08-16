# Spring Boot Professional Template

A comprehensive, security-first Spring Boot template for enterprise-grade API development with modern Java practices, complete monitoring, and production-ready features.

## Features

### 🔐 Security-First Architecture
- **JWT Authentication** with refresh tokens and blacklisting
- **Role-Based Access Control** with method-level security
- **Spring Security** with comprehensive CORS and CSRF protection
- **Password Security** with BCrypt encoding and strength validation
- **Security Headers** implementing OWASP recommendations
- **Input Validation** using Bean Validation (JSR-303)
- **Audit Logging** with comprehensive change tracking

### 🏗️ Enterprise Architecture
- **Layered Architecture** (Controller → Service → Repository → Entity)
- **Spring Boot 3.2+** with Java 17+ support
- **Spring Data JPA** with Hibernate and query optimization
- **PostgreSQL** with HikariCP connection pooling
- **Redis** for caching, sessions, and rate limiting
- **Flyway** database migration management
- **Docker** containerization with multi-stage builds

### 📊 Monitoring & Observability
- **Spring Boot Actuator** with custom health indicators
- **Micrometer** metrics with Prometheus export
- **Structured Logging** with correlation IDs
- **Custom Dashboards** with Grafana integration
- **Alert Management** with configurable thresholds
- **Performance Monitoring** with JVM and application metrics

### 🧪 Comprehensive Testing
- **JUnit 5** with advanced testing features
- **TestContainers** for integration testing
- **Security Testing** with Spring Security Test
- **MockMvc** for web layer testing
- **Test Coverage** with JaCoCo reporting
- **Performance Testing** with load testing support

### 🚀 DevOps Ready
- **CI/CD Pipeline** with GitHub Actions
- **Security Scanning** with OWASP and Trivy
- **Code Quality** with Checkstyle, PMD, and SpotBugs
- **Container Security** with hardened Docker images
- **Kubernetes** deployment configurations
- **Zero-Downtime** deployment strategies

## Quick Start

### Prerequisites
- **Java 17+** (OpenJDK or Oracle JDK)
- **Docker & Docker Compose**
- **PostgreSQL 13+** (or use Docker)
- **Redis 6+** (or use Docker)

### Development Setup

1. **Clone and Setup**
   ```bash
   git clone <repository-url>
   cd spring-boot-professional-template
   chmod +x gradlew
   ```

2. **Start Infrastructure**
   ```bash
   # Start PostgreSQL and Redis
   docker-compose up -d postgres redis
   
   # Wait for services to be ready
   docker-compose logs -f postgres redis
   ```

3. **Run Application**
   ```bash
   # Development mode with hot reload
   ./gradlew bootRun --args='--spring.profiles.active=development'
   
   # Or run with Docker (full stack)
   docker-compose up -d
   ```

4. **Verify Setup**
   ```bash
   # Health check
   curl http://localhost:8081/actuator/health
   
   # API documentation
   open http://localhost:8080/swagger-ui.html
   ```

### Default Users
- **Admin User**: `admin` / `Admin123!`
- **Regular User**: `user` / `User123!`

## Project Structure

```
src/
├── main/
│   ├── java/com/company/project/
│   │   ├── Application.java              # Main Spring Boot application
│   │   ├── config/                       # Configuration classes
│   │   │   ├── SecurityConfig.java       # Spring Security configuration
│   │   │   ├── CachingConfig.java        # Redis caching configuration
│   │   │   ├── MonitoringConfig.java     # Metrics and monitoring
│   │   │   └── DatabaseConfig.java       # Database configuration
│   │   ├── controller/                   # REST API controllers
│   │   ├── service/                      # Business logic layer
│   │   ├── repository/                   # Data access layer
│   │   ├── model/                        # JPA entities
│   │   ├── dto/                          # Data Transfer Objects
│   │   ├── security/                     # JWT and authentication
│   │   ├── exception/                    # Exception handling
│   │   └── util/                         # Utility classes
│   └── resources/
│       ├── application*.yml              # Configuration files
│       └── db/migration/                 # Flyway migrations
└── test/                                 # Test classes
    ├── unit/                            # Unit tests
    ├── integration/                     # Integration tests
    ├── security/                        # Security tests
    └── performance/                     # Performance tests
```

## Configuration

### Environment Profiles
- **development**: Local development with relaxed security
- **test**: Test environment with in-memory databases
- **production**: Production environment with enhanced security

### Key Configuration
```yaml
# Database
DATABASE_URL=jdbc:postgresql://localhost:5432/springapp
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=postgres

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=redispassword

# JWT
JWT_SECRET=<base64-encoded-secret>
JWT_EXPIRATION_MS=3600000

# Security
CORS_ALLOWED_ORIGINS=http://localhost:3000
```

## API Documentation

### OpenAPI/Swagger
- **Development**: http://localhost:8080/swagger-ui.html
- **API Docs**: http://localhost:8080/v3/api-docs

### Authentication
```bash
# Login
curl -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"Admin123!"}'

# Use token
curl -X GET http://localhost:8080/api/v1/users \
  -H "Authorization: Bearer <jwt-token>"
```

## Development

### Running Tests
```bash
# All tests
./gradlew test

# Specific test categories
./gradlew test --tests "*Unit*"          # Unit tests
./gradlew integrationTest                # Integration tests
./gradlew securityTest                   # Security tests

# With coverage
./gradlew test jacocoTestReport
```

### Code Quality
```bash
# Format and lint
./gradlew checkstyleMain checkstyleTest

# Security analysis
./gradlew spotbugsMain dependencyCheck

# All quality checks
./gradlew qualityCheck
```

### Database Management
```bash
# Run migrations
./gradlew flywayMigrate

# Migration info
./gradlew flywayInfo

# Validate migrations
./gradlew flywayValidate
```

## Monitoring

### Health Checks
- **Application**: http://localhost:8081/actuator/health
- **Database**: http://localhost:8081/actuator/health/db
- **Redis**: http://localhost:8081/actuator/health/redis

### Metrics
- **Prometheus**: http://localhost:8081/actuator/prometheus
- **Application Metrics**: http://localhost:8081/actuator/metrics
- **Grafana Dashboard**: http://localhost:3001 (admin/grafana)

### Logging
```bash
# View application logs
docker-compose logs -f app

# Structured JSON logging with correlation IDs
tail -f logs/application.log | jq
```

## Security

### Authentication Flow
1. **Login** → JWT access token + refresh token
2. **API Calls** → Bearer token in Authorization header
3. **Token Refresh** → Use refresh token for new access token
4. **Logout** → Token blacklisting and cleanup

### Security Features
- **JWT Authentication** with configurable expiration
- **Role-Based Authorization** with method-level security
- **Password Policies** with strength validation
- **Account Lockout** after failed attempts
- **Security Headers** (HSTS, CSP, X-Frame-Options, etc.)
- **CORS Protection** with configurable origins
- **Rate Limiting** to prevent abuse
- **Audit Logging** for security events

### Security Testing
```bash
# Run security-focused tests
./gradlew securityTest

# OWASP dependency check
./gradlew dependencyCheck

# Static analysis
./gradlew spotbugsMain
```

## Deployment

### Docker Deployment
```bash
# Build and run
docker-compose up -d

# Production-like setup
docker-compose --profile production up -d

# View logs
docker-compose logs -f app
```

### Production Deployment
```bash
# Build production image
./gradlew bootBuildImage

# Or with Docker
docker build -t spring-app:latest .

# Run with production profile
docker run -e SPRING_PROFILES_ACTIVE=production spring-app:latest
```

### Environment Variables
```bash
# Required for production
export DATABASE_URL="jdbc:postgresql://prod-db:5432/app"
export DATABASE_USERNAME="app_user"
export DATABASE_PASSWORD="secure_password"
export JWT_SECRET="base64_encoded_secret_key"
export REDIS_HOST="redis.example.com"
export CORS_ALLOWED_ORIGINS="https://app.example.com"
```

## Performance

### Optimization Features
- **Connection Pooling** with HikariCP
- **Query Optimization** with proper indexing
- **Caching Strategy** with Redis and multiple TTL levels
- **Lazy Loading** for JPA relationships
- **Batch Operations** for bulk database operations
- **Compression** for HTTP responses
- **HTTP/2** support for improved performance

### Performance Testing
```bash
# Load testing (if configured)
./gradlew performanceTest

# Monitor performance
curl http://localhost:8081/actuator/metrics
```

## Contributing

### Development Guidelines
1. **Security First** - All changes must pass security analysis
2. **Test Driven** - Write tests before implementation
3. **Code Quality** - All quality checks must pass
4. **Documentation** - Update documentation for new features
5. **Performance** - Consider performance impact of changes

### Commit Standards
```bash
# Quality checks before commit
./gradlew qualityCheck

# Run full test suite
./gradlew fullVerification
```

## Support

### Common Issues
- **Database Connection**: Check PostgreSQL is running and credentials are correct
- **Redis Connection**: Verify Redis is accessible and password is set
- **JWT Errors**: Ensure JWT_SECRET is properly configured
- **CORS Issues**: Check CORS_ALLOWED_ORIGINS configuration

### Debugging
```bash
# Enable debug logging
export LOGGING_LEVEL_COM_COMPANY_PROJECT=DEBUG

# Check health endpoints
curl http://localhost:8081/actuator/health

# View application info
curl http://localhost:8081/actuator/info
```

### Resources
- **Spring Boot Documentation**: https://spring.io/projects/spring-boot
- **Spring Security Reference**: https://spring.io/projects/spring-security
- **API Documentation**: http://localhost:8080/swagger-ui.html
- **Monitoring Dashboard**: http://localhost:3001

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

**Professional Spring Boot Template** - Secure, scalable, and production-ready API development with modern Java practices.