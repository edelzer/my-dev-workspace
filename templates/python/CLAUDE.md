# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with this FastAPI project, incorporating BMAD workspace protocols and best practices.

## ⚠️ CRITICAL: AI AGENT UNCERTAINTY PROTOCOL ⚠️

**ABSOLUTE LAW #1: STOP WHEN UNCERTAIN**

If you are unsure about ANY of the following, you MUST immediately stop all actions and request clarification:
- The next step to take in FastAPI development
- How to interpret Python/FastAPI requirements or specifications
- Which security protocol or middleware to implement
- The expected behavior of async operations or database interactions
- Whether an action might break existing FastAPI functionality
- Database migration or model changes that could affect data integrity

**MANDATORY ACTIONS WHEN UNCERTAIN:**
1. **STOP** - Cease all implementation activities immediately
2. **ASSESS** - Clearly identify what you don't understand about the FastAPI/Python context
3. **REPORT** - Explain the uncertainty and request Python-specific guidance
4. **WAIT** - Do not proceed until you receive clear direction

## ⚠️ ABSOLUTE LAW #2: STRICT FASTAPI PROTOCOL ADHERENCE ⚠️

**MANDATORY FASTAPI DEVELOPMENT SEQUENCE**

You MUST strictly adhere to FastAPI best practices and this project's architecture:

**REQUIRED FASTAPI PLANNING SEQUENCE:**
1. **Security Analysis** - Validate all endpoints follow security middleware chain
2. **Pydantic Models** - Define request/response models before route implementation
3. **Database Models** - Ensure SQLAlchemy models are properly defined with relationships
4. **Authentication Flow** - Verify JWT token handling and user context injection
5. **Async Operations** - All database operations must be async with proper session management
6. **Error Handling** - Implement comprehensive error handling with structured responses
7. **Testing Strategy** - Write tests for models, routes, and middleware before implementation
8. **API Documentation** - Ensure OpenAPI documentation is complete and accurate

**FASTAPI ARCHITECTURE COMPLIANCE:**
- **Middleware Order**: Security → Auth → Rate Limiting → Logging → Error Handling
- **Database Sessions**: Always use dependency injection for database sessions
- **Response Models**: All endpoints must have Pydantic response models
- **Error Responses**: Consistent error response format across all endpoints
- **Async/Await**: Proper async/await usage for all I/O operations

## ⚠️ ABSOLUTE LAW #3: PYTHON SECURITY-FIRST DEVELOPMENT ⚠️

**MANDATORY PYTHON SECURITY PROTOCOLS**

Every Python/FastAPI development decision must prioritize security:

**SECURITY VALIDATION CHECKLIST:**
1. **Input Validation**: All inputs validated through Pydantic models
2. **SQL Injection Prevention**: Parameterized queries only, no string concatenation
3. **XSS Protection**: Response sanitization and proper content types
4. **Authentication**: JWT tokens with proper expiration and blacklisting
5. **Authorization**: Role-based access control on protected endpoints
6. **Rate Limiting**: Implemented on all public endpoints
7. **Security Headers**: Complete OWASP security headers implementation
8. **Logging**: Security events logged with appropriate detail level

**FORBIDDEN PYTHON PRACTICES:**
- Direct SQL string concatenation
- Storing passwords in plain text
- Missing input validation on endpoints
- Synchronous database operations in FastAPI
- Exposing sensitive data in error responses
- Missing authentication on protected routes

## ⚠️ ABSOLUTE LAW #4: ASYNC PYTHON DEVELOPMENT PRECISION ⚠️

**MANDATORY ASYNC/AWAIT PATTERNS**

All database and I/O operations must follow async patterns:

**ASYNC OPERATION REQUIREMENTS:**
1. **Database Operations**: Always use async SQLAlchemy sessions
2. **Redis Operations**: Use async Redis client for all cache operations
3. **HTTP Requests**: Use httpx or aiohttp for external API calls
4. **File Operations**: Use aiofiles for file I/O operations
5. **Background Tasks**: Implement using FastAPI background tasks or Celery

**ASYNC BEST PRACTICES:**
- Dependency injection for database sessions
- Context managers for resource cleanup
- Proper exception handling in async contexts
- Connection pooling for database and Redis
- Graceful shutdown handling for background tasks

## Project Overview

This is a **FastAPI Professional Template** with comprehensive security, testing, and BMAD workspace integration. The project implements enterprise-grade patterns for production-ready API development.

## Core Architecture

### FastAPI Application Structure
```
app/
├── main.py              # FastAPI application with middleware stack
├── auth/                # JWT authentication and session management
├── middleware/          # Security, logging, rate limiting middleware
├── database/            # SQLAlchemy models and connection management
├── routes/              # API endpoints organized by domain
├── services/            # Business logic layer
├── utils/               # Utility functions and helpers
└── config/              # Application configuration management
```

### Security-First Middleware Stack
1. **SecurityMiddleware**: OWASP headers, input validation, malicious pattern detection
2. **AuthMiddleware**: JWT validation, user context injection, session management
3. **RateLimitingMiddleware**: Redis-backed rate limiting with progressive penalties
4. **LoggingMiddleware**: Structured logging with security event tracking
5. **ErrorHandlerMiddleware**: Security-conscious error handling

### Database Architecture
- **Async SQLAlchemy**: High-performance async ORM with connection pooling
- **Alembic Migrations**: Database schema versioning and migration management
- **Redis Integration**: Caching, sessions, rate limiting, and background task queuing
- **Audit Logging**: Comprehensive audit trail with user action tracking

## Development Protocols

### Security-First Development (Law #1-3)
Every feature must be developed with security as the primary concern:

```python
# ✅ CORRECT: Secure endpoint implementation
@router.post("/users/", response_model=UserResponse)
async def create_user(
    user_data: UserCreateRequest,  # Pydantic validation
    current_user: User = Depends(require_admin_role),  # Authentication
    db: AsyncSession = Depends(get_db_session)  # Dependency injection
):
    # Input validation happens automatically through Pydantic
    # Authorization verified through dependency
    # Database session managed through dependency injection
    
    # Business logic here
    pass

# ❌ INCORRECT: Insecure implementation
@app.post("/users/")
async def create_user(request):  # No validation
    # Direct database access without session management
    # No authentication or authorization
    # No input validation
    pass
```

### Test-Driven Development (TDD)
All development follows strict TDD methodology:

1. **Write Failing Tests**: Start with comprehensive test cases
2. **Minimal Implementation**: Write just enough code to pass tests
3. **Refactor**: Improve code while maintaining test coverage
4. **Repeat**: Continue cycle for all features

```python
# Test first - define expected behavior
async def test_create_user_success(authenticated_admin_client):
    user_data = {
        "email": "test@example.com",
        "password": "SecurePassword123!",
        "first_name": "Test",
        "last_name": "User"
    }
    
    response = await authenticated_admin_client.post("/api/v1/users/", json=user_data)
    
    assert response.status_code == 201
    assert response.json()["email"] == user_data["email"]
    # Assert password not returned in response
    assert "password" not in response.json()

# Then implement to satisfy tests
```

### Async/Await Patterns (Law #4)
All I/O operations must be async:

```python
# ✅ CORRECT: Async database operations
async def get_user_by_email(email: str, db: AsyncSession) -> Optional[User]:
    stmt = select(User).where(User.email == email)
    result = await db.execute(stmt)
    return result.scalar_one_or_none()

# ✅ CORRECT: Async Redis operations
async def cache_user_session(user_id: str, session_data: dict):
    redis_client = await get_redis_client()
    await redis_client.setex(f"session:{user_id}", 3600, json.dumps(session_data))

# ❌ INCORRECT: Synchronous operations
def get_user_by_email(email: str):  # Not async
    # Synchronous database query
    return session.query(User).filter(User.email == email).first()
```

## Claude Code Integration

### Available Commands
- `/fastapi:test` - Run comprehensive test suite with coverage
- `/fastapi:security` - Security analysis and vulnerability scanning
- `/fastapi:migration` - Database migration assistance
- `/fastapi:endpoint` - Create new API endpoint with full security implementation
- `/fastapi:middleware` - Implement or modify middleware components
- `/fastapi:deploy` - Deployment preparation and validation

### Development Workflow
1. **Security Analysis**: Every change begins with security impact assessment
2. **TDD Implementation**: Write tests before code implementation
3. **Async Validation**: Ensure all I/O operations are properly async
4. **Integration Testing**: Validate middleware and authentication integration
5. **Documentation Update**: Maintain OpenAPI documentation currency

### Code Quality Standards
- **Type Hints**: All functions must have complete type annotations
- **Pydantic Models**: All request/response data uses Pydantic models
- **Error Handling**: Comprehensive error handling with structured responses
- **Security Logging**: All security events properly logged
- **Performance**: Database queries optimized with proper indexing

## Essential Commands

### Development
```bash
# Start development server with hot reload
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Run with Docker Compose (full stack)
docker-compose up -d

# Run tests with coverage
pytest --cov=app --cov-report=html --cov-report=term

# TDD watch mode
pytest --watch --cov=app
```

### Database Management
```bash
# Create migration
alembic revision --autogenerate -m "Description"

# Apply migrations
alembic upgrade head

# Rollback migration
alembic downgrade -1
```

### Code Quality
```bash
# Format code
black . && isort .

# Lint and type check
flake8 . && mypy .

# Security scanning
bandit -r app/ && safety check

# All quality checks
pre-commit run --all-files
```

### Testing Categories
```bash
# Unit tests
pytest tests/unit/ -v

# Integration tests  
pytest tests/integration/ -v

# End-to-end tests
pytest tests/e2e/ -v

# Security tests
pytest tests/security/ -v
```

## Project Dependencies

### Core FastAPI Stack
- **FastAPI**: Modern, fast web framework for building APIs
- **Uvicorn**: ASGI server for FastAPI applications
- **Pydantic**: Data validation using Python type annotations
- **SQLAlchemy**: Async ORM for database operations
- **Alembic**: Database migration tool
- **Redis**: Caching, sessions, and rate limiting

### Security Dependencies
- **PyJWT**: JSON Web Token implementation
- **bcrypt**: Password hashing
- **cryptography**: Cryptographic recipes and primitives
- **python-multipart**: Form and file upload support

### Development & Testing
- **pytest**: Testing framework with async support
- **pytest-asyncio**: Async testing support
- **pytest-cov**: Coverage reporting
- **httpx**: Async HTTP client for testing
- **factory-boy**: Test data generation

### Code Quality
- **black**: Code formatting
- **isort**: Import sorting
- **flake8**: Linting
- **mypy**: Static type checking
- **bandit**: Security analysis
- **safety**: Dependency vulnerability checking

## Security Implementation

### Authentication Flow
1. **User Registration**: Password validation, email verification
2. **Login**: JWT token generation with device fingerprinting
3. **Token Validation**: Middleware validates all protected endpoints
4. **Session Management**: Redis-backed session storage
5. **Logout**: Token blacklisting and session cleanup

### Authorization Patterns
```python
# Role-based access control
@router.get("/admin/users/")
async def admin_list_users(
    current_user: User = Depends(require_roles(["admin"]))
):
    pass

# Resource ownership validation
@router.get("/users/{user_id}")
async def get_user(
    user_id: str,
    current_user: User = Depends(get_current_user)
):
    if user_id != current_user.id and "admin" not in current_user.roles:
        raise HTTPException(status_code=403, detail="Access denied")
```

### Error Handling Strategy
- **Development**: Detailed error information for debugging
- **Production**: Sanitized error responses to prevent information disclosure
- **Security**: All security events logged with appropriate detail
- **Monitoring**: Integration with monitoring systems for alerting

## Performance Optimization

### Database Optimization
- **Connection Pooling**: Configured for optimal concurrency
- **Query Optimization**: Proper indexing and query patterns
- **Async Operations**: Non-blocking database operations
- **Health Monitoring**: Automatic connection health checks

### Caching Strategy
- **Redis Integration**: Multi-level caching strategy
- **Session Caching**: User session and authentication caching
- **Rate Limiting**: Distributed rate limiting with Redis
- **Background Tasks**: Async task processing

### Monitoring & Observability
- **Health Checks**: Comprehensive health monitoring endpoints
- **Metrics**: Prometheus integration for metrics collection
- **Logging**: Structured JSON logging with security events
- **Tracing**: Request tracing for performance analysis

## Deployment Guidelines

### Container Deployment
- **Multi-stage Builds**: Optimized production containers
- **Security**: Non-root user execution
- **Health Checks**: Container health monitoring
- **Secrets**: Secure secret management

### Environment Configuration
- **Environment Variables**: Complete configuration through environment
- **Security Settings**: Production security configurations
- **Database**: Production database connection settings
- **Monitoring**: Production monitoring and alerting setup

## Remember: FastAPI Excellence Through Security

This FastAPI template embodies security-first development principles while maintaining high performance and developer productivity. Every component is designed to work together seamlessly while providing enterprise-grade security and monitoring capabilities.

**Implementation Priorities**: Security validation, async operations, comprehensive testing, proper error handling, performance optimization, and complete documentation.