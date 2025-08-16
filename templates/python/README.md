# FastAPI Professional Template

A production-ready FastAPI template with comprehensive security, testing, and development features integrated with the BMAD workspace methodology.

## 🚀 Features

### Security-First Architecture
- **OWASP Security Standards**: Comprehensive middleware stack implementing security best practices
- **JWT Authentication**: Secure token-based authentication with refresh tokens and blacklisting
- **Rate Limiting**: Advanced rate limiting with Redis backend and progressive penalties
- **Input Validation**: Pydantic models with comprehensive validation and sanitization
- **Security Headers**: Complete security headers implementation (CSP, HSTS, XSS Protection)
- **Audit Logging**: Comprehensive security event logging and monitoring

### Database & Caching
- **Async SQLAlchemy**: High-performance async database operations with connection pooling
- **Alembic Migrations**: Database schema versioning and migration management
- **Redis Integration**: Caching, sessions, and rate limiting with Redis
- **Connection Health Monitoring**: Automatic database health checks and reconnection

### Testing & Quality
- **TDD Methodology**: Test-driven development with comprehensive test suite
- **Pytest Integration**: Unit, integration, and E2E testing with async support
- **Code Coverage**: 90%+ code coverage requirements with detailed reporting
- **Code Quality Tools**: Black, isort, flake8, mypy, bandit, and safety integration
- **Factory Pattern**: Test data factories for consistent test setup

### Development Experience
- **Claude Code Integration**: Full integration with Claude Code AI assistant
- **BMAD Workspace**: Aligned with BMAD development methodology and protocols
- **Docker Support**: Multi-stage Docker builds with development and production targets
- **Hot Reloading**: Fast development with automatic code reloading
- **Comprehensive Logging**: Structured JSON logging with security event tracking

### Production Ready
- **CI/CD Pipeline**: Complete GitHub Actions workflow with security scanning
- **Container Security**: Docker security best practices with non-root users
- **Monitoring Integration**: Prometheus metrics and health check endpoints
- **Performance Optimized**: Connection pooling, caching, and async operations
- **Deployment Ready**: AWS ECS, Kubernetes, and traditional deployment support

## 📋 Prerequisites

- Python 3.9+
- Poetry (recommended) or pip
- Docker and Docker Compose
- Redis server
- PostgreSQL database (or SQLite for development)

## 🛠️ Quick Start

### 1. Create Project from Template

```bash
# Using the BMAD workspace script
node scripts/new-project.js my-api-project python

# Or clone directly
git clone <template-repo> my-api-project
cd my-api-project
```

### 2. Environment Setup

```bash
# Copy environment template
cp .env.example .env

# Edit environment variables
nano .env
```

### 3. Install Dependencies

```bash
# Using Poetry (recommended)
poetry install --with dev

# Or using pip
pip install -r requirements/development.txt
```

### 4. Database Setup

```bash
# Run migrations
poetry run alembic upgrade head

# Or with Docker Compose
docker-compose up -d db
poetry run alembic upgrade head
```

### 5. Start Development Server

```bash
# Local development
poetry run uvicorn app.main:app --reload

# Or with Docker Compose (full stack)
docker-compose up -d
```

### 6. Verify Installation

```bash
# Check health endpoint
curl http://localhost:8000/health/

# View API documentation
open http://localhost:8000/docs
```

## 🏗️ Project Structure

```
fastapi-template/
├── app/                    # Application source code
│   ├── auth/              # Authentication & authorization
│   ├── database/          # Database models & connection
│   ├── middleware/        # Security & logging middleware
│   ├── routes/            # API endpoints
│   ├── services/          # Business logic layer
│   ├── utils/             # Utility functions
│   ├── config/            # Configuration management
│   └── main.py            # FastAPI application entry
├── tests/                 # Comprehensive test suite
│   ├── unit/              # Unit tests
│   ├── integration/       # Integration tests
│   ├── e2e/               # End-to-end tests
│   └── conftest.py        # Test configuration
├── alembic/               # Database migrations
├── scripts/               # Utility scripts
├── config/                # Configuration files
├── docs/                  # Documentation
├── .github/workflows/     # CI/CD pipelines
├── docker-compose.yml     # Development environment
├── Dockerfile             # Container configuration
├── pyproject.toml         # Python project configuration
└── CLAUDE.md              # Claude Code integration
```

## 🔧 Development

### Running Tests

```bash
# All tests with coverage
poetry run pytest --cov=app --cov-report=html

# Unit tests only
poetry run pytest tests/unit/ -v

# Integration tests
poetry run pytest tests/integration/ -v

# Watch mode for TDD
poetry run pytest --watch --cov=app
```

### Code Quality

```bash
# Format code
poetry run black .
poetry run isort .

# Lint code
poetry run flake8 .
poetry run mypy .

# Security scanning
poetry run bandit -r app/
poetry run safety check

# All quality checks
poetry run pre-commit run --all-files
```

### Database Operations

```bash
# Create migration
poetry run alembic revision --autogenerate -m "Description"

# Apply migrations
poetry run alembic upgrade head

# Rollback migration
poetry run alembic downgrade -1

# Reset database
poetry run alembic downgrade base
poetry run alembic upgrade head
```

## 🚀 Deployment

### Docker Deployment

```bash
# Build production image
docker build --target production -t fastapi-app:latest .

# Run with Docker Compose
docker-compose -f docker-compose.prod.yml up -d

# Health check
curl http://localhost:8000/health/
```

### Cloud Deployment

The template includes configurations for:

- **AWS ECS**: Complete ECS task definitions and service configurations
- **Kubernetes**: Helm charts and deployment manifests
- **Google Cloud Run**: Cloud Run deployment configuration
- **Heroku**: Procfile and configuration for Heroku deployment

### Environment Variables

Key environment variables for production:

```bash
# Application
ENVIRONMENT=production
SECRET_KEY=your-super-secret-key
DATABASE_URL=postgresql://user:pass@host:5432/db
REDIS_URL=redis://host:6379/0

# Security
ALLOWED_HOSTS=yourdomain.com,api.yourdomain.com
CORS_ORIGINS=https://yourdomain.com

# Monitoring
SENTRY_DSN=your-sentry-dsn
LOG_LEVEL=INFO
```

## 🔒 Security Features

### Authentication Flow
1. **User Registration**: Password strength validation and email verification
2. **Login**: JWT token generation with device fingerprinting
3. **Token Refresh**: Secure token refresh with blacklisting
4. **Logout**: Token blacklisting and session cleanup

### Security Middleware Stack
1. **Security Headers**: OWASP recommended security headers
2. **Rate Limiting**: Configurable rate limits with Redis backend
3. **Authentication**: JWT validation and user context injection
4. **Logging**: Comprehensive request/response logging
5. **Error Handling**: Security-conscious error responses

### Monitoring & Alerting
- **Security Events**: Failed login attempts, suspicious patterns
- **Performance Metrics**: Response times, database health
- **Error Tracking**: Structured error logging with alerts
- **Audit Logging**: Complete audit trail for compliance

## 🧪 Testing Strategy

### Test Categories
- **Unit Tests**: Individual component testing with mocks
- **Integration Tests**: API endpoint testing with real database
- **E2E Tests**: Complete user workflow testing
- **Security Tests**: Authentication and authorization testing
- **Performance Tests**: Load testing and benchmarking

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
- **Grafana Dashboards**: Pre-configured dashboards for monitoring
- **Log Aggregation**: Structured logging with ELK stack support
- **APM Integration**: Application performance monitoring

## 🤝 Claude Code Integration

This template is fully integrated with Claude Code AI assistant:

### Available Commands
- `/api:test` - Run test suite with coverage
- `/api:lint` - Code quality checks
- `/api:security` - Security analysis
- `/api:deploy` - Deployment assistance
- `/api:docs` - Generate documentation

### Development Protocols
- **Security-First**: Every feature starts with security analysis
- **TDD Methodology**: Test-driven development workflow
- **Task Decomposition**: 15-30 minute development cycles
- **Technical Debt Management**: Systematic debt tracking and resolution

## 📚 Documentation

- **API Documentation**: Automatic OpenAPI/Swagger documentation at `/docs`
- **Architecture Guide**: Detailed architecture documentation in `/docs`
- **Security Guide**: Security implementation and best practices
- **Development Guide**: Setup and development workflow
- **Deployment Guide**: Production deployment instructions

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Make changes following the coding standards
4. Run tests: `poetry run pytest`
5. Run quality checks: `poetry run pre-commit run --all-files`
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

- ✅ **FastAPI Application**: Modern async Python web framework
- ✅ **Security Middleware**: OWASP security implementation
- ✅ **JWT Authentication**: Complete auth system with refresh tokens
- ✅ **Database Integration**: Async SQLAlchemy with Alembic migrations
- ✅ **Redis Caching**: Session management and rate limiting
- ✅ **Comprehensive Testing**: Unit, integration, and E2E tests
- ✅ **Code Quality Tools**: Black, isort, flake8, mypy, bandit
- ✅ **Docker Support**: Multi-stage builds and compose
- ✅ **CI/CD Pipeline**: GitHub Actions with security scanning
- ✅ **Claude Code Integration**: AI-assisted development workflow
- ✅ **Production Ready**: Monitoring, logging, and deployment configs
- ✅ **Documentation**: Complete API and development documentation

---

**Built with ❤️ using the BMAD workspace methodology and Claude Code AI assistant.**