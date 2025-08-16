# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with this Spring Boot project, incorporating BMAD workspace protocols and professional Java development best practices.

## ⚠️ CRITICAL: AI AGENT UNCERTAINTY PROTOCOL ⚠️

**ABSOLUTE LAW #1: STOP WHEN UNCERTAIN**

If you are unsure about ANY of the following, you MUST immediately stop all actions and request clarification:
- The next step to take in Spring Boot development
- How to interpret Java/Spring Boot requirements or specifications
- Which security protocol or Spring Security configuration to implement
- The expected behavior of JPA operations, transactions, or database interactions
- Whether an action might break existing Spring Boot functionality
- Database migration or JPA entity changes that could affect data integrity
- Thread safety concerns with Spring beans or concurrent operations

**MANDATORY ACTIONS WHEN UNCERTAIN:**
1. **STOP** - Cease all implementation activities immediately
2. **ASSESS** - Clearly identify what you don't understand about the Spring Boot/Java context
3. **REPORT** - Explain the uncertainty and request Java-specific guidance
4. **WAIT** - Do not proceed until you receive clear direction

## ⚠️ ABSOLUTE LAW #2: STRICT SPRING BOOT PROTOCOL ADHERENCE ⚠️

**MANDATORY SPRING BOOT DEVELOPMENT SEQUENCE**

You MUST strictly adhere to Spring Boot best practices and this project's architecture:

**REQUIRED SPRING BOOT PLANNING SEQUENCE:**
1. **Security Analysis** - Validate all endpoints follow Spring Security configuration
2. **Entity Design** - Define JPA entities with proper relationships and constraints
3. **Repository Layer** - Implement Spring Data JPA repositories with optimized queries
4. **Service Layer** - Create business logic with proper transaction management
5. **Controller Layer** - Implement REST controllers with comprehensive validation
6. **Authentication Flow** - Verify JWT token handling and Spring Security integration
7. **Database Operations** - Ensure proper JPA/Hibernate usage with transaction boundaries
8. **Error Handling** - Implement comprehensive exception handling with @ControllerAdvice
9. **Testing Strategy** - Write tests for all layers (unit, integration, security tests)
10. **API Documentation** - Ensure OpenAPI/Swagger documentation is complete and accurate

**SPRING BOOT ARCHITECTURE COMPLIANCE:**
- **Layered Architecture**: Controller → Service → Repository → Entity
- **Dependency Injection**: Use constructor injection for required dependencies
- **Transaction Management**: Proper @Transactional annotations with correct propagation
- **Security Integration**: JWT authentication with method-level security
- **Error Responses**: Consistent error response format across all endpoints
- **Bean Lifecycle**: Proper understanding of Spring bean scopes and lifecycle

## ⚠️ ABSOLUTE LAW #3: JAVA SECURITY-FIRST DEVELOPMENT ⚠️

**MANDATORY JAVA SECURITY PROTOCOLS**

Every Java/Spring Boot development decision must prioritize security:

**SECURITY VALIDATION CHECKLIST:**
1. **Input Validation**: All inputs validated through Bean Validation (JSR-303)
2. **SQL Injection Prevention**: Use JPA/JPQL only, no native SQL string concatenation
3. **XSS Protection**: Proper output encoding and Spring Security headers
4. **Authentication**: JWT tokens with proper expiration and Spring Security integration
5. **Authorization**: Method-level security with @PreAuthorize/@PostAuthorize
6. **Password Security**: BCrypt encoding with proper strength configuration
7. **Security Headers**: Complete OWASP security headers via Spring Security
8. **Audit Logging**: Security events logged with appropriate detail level
9. **Thread Safety**: Proper handling of shared state in Spring beans
10. **Resource Management**: Proper try-with-resources and connection handling

**FORBIDDEN JAVA PRACTICES:**
- Direct JDBC operations without proper parameterization
- Storing passwords in plain text or weak encoding
- Missing validation on REST endpoints
- Synchronous operations blocking event loops
- Exposing sensitive data in error responses or logs
- Missing authentication on protected endpoints
- Improper exception handling that leaks system information

## ⚠️ ABSOLUTE LAW #4: ENTERPRISE JAVA DEVELOPMENT PRECISION ⚠️

**MANDATORY ENTERPRISE PATTERNS**

All development must follow enterprise Java patterns:

**ENTERPRISE DEVELOPMENT REQUIREMENTS:**
1. **Transaction Management**: Proper Spring @Transactional usage with ACID compliance
2. **Caching Strategy**: Redis integration with intelligent cache invalidation
3. **Monitoring Integration**: Micrometer metrics with Prometheus export
4. **Health Checks**: Custom health indicators for all external dependencies
5. **Logging Standards**: Structured logging with correlation IDs and security events
6. **Performance Optimization**: Connection pooling, query optimization, lazy loading
7. **Concurrency Handling**: Proper synchronization and thread-safe operations
8. **Resource Management**: Proper cleanup and lifecycle management

**SPRING BOOT BEST PRACTICES:**
- Configuration through application.yml with profiles
- External configuration for environment-specific settings
- Proper bean validation and error handling
- Actuator endpoints for monitoring and management
- Graceful shutdown and startup procedures
- Database migration management with Flyway

## Project Overview

This is a **Spring Boot Professional Template** with comprehensive security, testing, monitoring, and enterprise-grade patterns for production-ready API development.

## Core Architecture

### Spring Boot Application Structure
```
src/main/java/com/company/project/
├── Application.java         # Main Spring Boot application class
├── config/                  # Configuration classes (Security, Caching, etc.)
├── controller/              # REST API controllers with OpenAPI documentation
├── service/                 # Business logic layer with transaction management
├── repository/              # Spring Data JPA repositories with custom queries
├── model/                   # JPA entities with audit trails and validation
├── dto/                     # Data Transfer Objects for API requests/responses
├── security/                # JWT authentication and Spring Security configuration
├── exception/               # Global exception handling and custom exceptions
└── util/                    # Utility classes and helper functions
```

### Security-First Architecture
1. **Spring Security Configuration**: Comprehensive security with JWT authentication
2. **Method-Level Security**: @PreAuthorize/@PostAuthorize for fine-grained access control
3. **Input Validation**: Bean Validation (JSR-303) for all data inputs
4. **Audit Logging**: JPA Auditing with comprehensive change tracking
5. **Password Security**: BCrypt encoding with configurable strength

### Database Architecture
- **JPA/Hibernate**: Advanced ORM with proper relationship mappings
- **Flyway Migrations**: Database schema versioning and migration management
- **Connection Pooling**: HikariCP for optimal database connection management
- **Query Optimization**: Custom repository methods with proper indexing
- **Audit Trail**: Comprehensive audit logging with automatic change tracking

## Development Protocols

### Security-First Development (Law #1-3)
Every feature must be developed with security as the primary concern:

```java
// ✅ CORRECT: Secure endpoint implementation
@RestController
@RequestMapping("/api/v1/users")
@Validated
@SecurityRequirement(name = "bearerAuth")
public class UserController {

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserResponse> createUser(
            @Valid @RequestBody UserCreateRequest request,
            Authentication authentication) {
        
        // Input validation happens automatically through @Valid
        // Authorization verified through @PreAuthorize
        // Authentication context available for auditing
        
        UserResponse response = userService.createUser(request, authentication.getName());
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
}

// ❌ INCORRECT: Insecure implementation
@PostMapping("/users")
public User createUser(@RequestBody Map<String, Object> data) {
    // No validation, no authentication, no authorization
    // Raw Map instead of typed DTO
    // Direct entity exposure
    return userRepository.save(new User()); // Missing validation
}
```

### Test-Driven Development (TDD)
All development follows strict TDD methodology with Spring Boot Test:

```java
// Test first - define expected behavior
@SpringBootTest
@TestMethodOrder(OrderAnnotation.class)
@Transactional
class UserServiceTest {

    @Test
    @Order(1)
    @DisplayName("Should create user with valid data")
    void shouldCreateUserWithValidData() {
        // Given
        UserCreateRequest request = UserCreateRequest.builder()
            .username("testuser")
            .email("test@example.com")
            .password("SecurePassword123!")
            .firstName("Test")
            .lastName("User")
            .build();

        // When
        UserResponse response = userService.createUser(request, "admin");

        // Then
        assertThat(response).isNotNull();
        assertThat(response.getUsername()).isEqualTo("testuser");
        assertThat(response.getEmail()).isEqualTo("test@example.com");
        // Assert password not returned in response
        assertThat(response.getPassword()).isNull();
    }
}
```

### Enterprise Patterns (Law #4)
All development must follow enterprise Java patterns:

```java
// ✅ CORRECT: Enterprise service implementation
@Service
@Transactional(readOnly = true)
@Validated
@Timed(name = "user.service", description = "User service operations")
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final CacheManager cacheManager;
    private final Counter userCreationCounter;

    public UserService(UserRepository userRepository, 
                      PasswordEncoder passwordEncoder,
                      CacheManager cacheManager,
                      MeterRegistry meterRegistry) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.cacheManager = cacheManager;
        this.userCreationCounter = meterRegistry.counter("user.creation");
    }

    @Transactional
    @CacheEvict(value = "users", allEntries = true)
    @PreAuthorize("hasRole('ADMIN')")
    public UserResponse createUser(@Valid UserCreateRequest request, String createdBy) {
        // Validate business rules
        validateUserCreation(request);
        
        // Create entity with proper encoding
        User user = User.builder()
            .username(request.getUsername())
            .email(request.getEmail())
            .password(passwordEncoder.encode(request.getPassword()))
            .firstName(request.getFirstName())
            .lastName(request.getLastName())
            .enabled(true)
            .createdBy(createdBy)
            .build();
        
        // Save with transaction management
        User savedUser = userRepository.save(user);
        
        // Update metrics
        userCreationCounter.increment();
        
        // Log security event
        log.info("User created: {} by {}", savedUser.getUsername(), createdBy);
        
        // Return DTO (not entity)
        return UserMapper.toResponse(savedUser);
    }
}
```

## Claude Code Integration

### Available Commands
- `/spring:test` - Run comprehensive test suite with coverage
- `/spring:security` - Security analysis and vulnerability scanning
- `/spring:migration` - Database migration assistance with Flyway
- `/spring:endpoint` - Create new REST endpoint with full security implementation
- `/spring:entity` - Create JPA entity with proper relationships and validation
- `/spring:service` - Implement service layer with transaction management
- `/spring:deploy` - Deployment preparation and validation

### Development Workflow
1. **Security Analysis**: Every change begins with security impact assessment
2. **TDD Implementation**: Write tests before implementation using Spring Boot Test
3. **Entity Design**: Proper JPA entity design with relationships and validation
4. **Service Layer**: Business logic with proper transaction boundaries
5. **Controller Layer**: REST API with comprehensive input validation
6. **Integration Testing**: End-to-end testing with TestContainers
7. **Documentation Update**: Maintain OpenAPI documentation currency

### Code Quality Standards
- **Type Safety**: Complete type annotations and generic usage
- **Bean Validation**: All DTOs use JSR-303 validation annotations
- **Exception Handling**: Comprehensive error handling with @ControllerAdvice
- **Security Logging**: All security events properly logged
- **Performance**: Database queries optimized with proper indexing and caching
- **Testing**: Complete test coverage including security and integration tests

## Essential Commands

### Development
```bash
# Start development with hot reload
./gradlew bootRun --args='--spring.profiles.active=development'

# Run with Docker Compose (full stack)
docker-compose up -d

# Run tests with coverage
./gradlew test jacocoTestReport

# TDD watch mode (if configured)
./gradlew test --continuous
```

### Database Management
```bash
# Run Flyway migrations
./gradlew flywayMigrate

# Validate migrations
./gradlew flywayValidate

# Generate migration info
./gradlew flywayInfo

# Clean database (development only)
./gradlew flywayClean
```

### Code Quality
```bash
# Format and lint code
./gradlew checkstyleMain checkstyleTest

# Security analysis
./gradlew spotbugsMain dependencyCheck

# Run all quality checks
./gradlew qualityCheck

# Full verification pipeline
./gradlew fullVerification
```

### Testing Categories
```bash
# Unit tests
./gradlew test

# Integration tests with TestContainers
./gradlew integrationTest

# Security-focused tests
./gradlew securityTest

# Performance tests
./gradlew performanceTest
```

### Monitoring and Operations
```bash
# Check application health
curl http://localhost:8081/actuator/health

# View metrics
curl http://localhost:8081/actuator/metrics

# Prometheus metrics
curl http://localhost:8081/actuator/prometheus

# Application info
curl http://localhost:8081/actuator/info
```

## Project Dependencies

### Core Spring Boot Stack
- **Spring Boot**: Modern Java framework with auto-configuration
- **Spring Security**: Comprehensive security framework with JWT support
- **Spring Data JPA**: Repository abstraction with Hibernate ORM
- **Spring Cache**: Caching abstraction with Redis integration
- **Spring Actuator**: Production-ready monitoring and management

### Database and Persistence
- **PostgreSQL**: Primary database with advanced features
- **Flyway**: Database migration and version control
- **HikariCP**: High-performance connection pooling
- **Redis**: Caching, session storage, and rate limiting

### Security Dependencies
- **JWT (JJWT)**: JSON Web Token implementation
- **BCrypt**: Password hashing algorithm
- **OWASP Dependency Check**: Vulnerability scanning
- **SpotBugs**: Static analysis for security issues

### Testing Framework
- **JUnit 5**: Modern testing framework with advanced features
- **TestContainers**: Integration testing with real databases
- **MockMvc**: Web layer testing
- **Mockito**: Mocking framework for unit tests
- **AssertJ**: Fluent assertion library

### Code Quality Tools
- **Checkstyle**: Code formatting and style checking
- **PMD**: Source code analyzer
- **SpotBugs**: Bug detection and security analysis
- **JaCoCo**: Test coverage reporting

### Monitoring and Observability
- **Micrometer**: Application metrics collection
- **Prometheus**: Metrics export and monitoring
- **Logback**: Structured logging framework
- **OpenAPI 3**: API documentation generation

## Security Implementation

### Authentication Flow
1. **User Registration**: Password validation, email verification
2. **Login**: JWT token generation with device fingerprinting
3. **Token Validation**: Spring Security filter validates all protected endpoints
4. **Session Management**: Redis-backed session storage with TTL
5. **Logout**: Token blacklisting and session cleanup

### Authorization Patterns
```java
// Method-level security
@PreAuthorize("hasRole('ADMIN')")
public ResponseEntity<List<UserResponse>> getAllUsers() {
    // Only admins can access
}

@PreAuthorize("hasRole('USER') and #userId == authentication.principal.id")
public ResponseEntity<UserResponse> getUser(@PathVariable Long userId) {
    // Users can only access their own data
}

// Custom security expressions
@PreAuthorize("@securityService.canAccessUser(authentication, #userId)")
public ResponseEntity<UserResponse> updateUser(@PathVariable Long userId) {
    // Custom security logic
}
```

### Error Handling Strategy
- **Development**: Detailed error information for debugging
- **Production**: Sanitized error responses to prevent information disclosure
- **Security**: All security events logged with appropriate detail
- **Monitoring**: Integration with monitoring systems for alerting

## Performance Optimization

### Database Optimization
- **Connection Pooling**: HikariCP configured for optimal concurrency
- **Query Optimization**: Proper indexing and JPQL query patterns
- **Lazy Loading**: Efficient entity loading strategies
- **Batch Operations**: Bulk insert/update operations for performance

### Caching Strategy
- **Redis Integration**: Multi-level caching strategy with intelligent TTL
- **Cache Hierarchies**: Different cache durations for different data types
- **Cache Invalidation**: Event-driven cache invalidation on data changes
- **Cache Monitoring**: Metrics for cache hit/miss rates

### Monitoring & Observability
- **Health Checks**: Comprehensive health monitoring with custom indicators
- **Metrics**: Prometheus integration for metrics collection
- **Logging**: Structured JSON logging with correlation IDs
- **Tracing**: Request tracing for performance analysis
- **Alerting**: Custom alert rules for critical metrics

## Deployment Guidelines

### Container Deployment
- **Multi-stage Builds**: Optimized production containers with security hardening
- **Non-root Execution**: Security-first container configuration
- **Health Checks**: Container health monitoring with proper timeouts
- **Resource Limits**: Memory and CPU constraints for stability

### Environment Configuration
- **External Configuration**: Complete configuration through environment variables
- **Security Settings**: Production security configurations via profiles
- **Database**: Production database connection with connection pooling
- **Monitoring**: Production monitoring and alerting setup

### CI/CD Pipeline
- **Security Scanning**: OWASP dependency check and container scanning
- **Quality Gates**: Code quality and test coverage requirements
- **Automated Testing**: Unit, integration, and security tests
- **Zero-Downtime Deployment**: Blue-green deployment strategies

## Remember: Spring Boot Excellence Through Security

This Spring Boot template embodies security-first development principles while maintaining high performance and developer productivity. Every component is designed to work together seamlessly while providing enterprise-grade security, monitoring, and maintainability.

**Implementation Priorities**: Security validation, proper transaction management, comprehensive testing, performance optimization, monitoring integration, and complete documentation.

**Spring Boot Best Practices**: Dependency injection, proper bean lifecycle management, configuration externalization, comprehensive error handling, and production-ready monitoring.