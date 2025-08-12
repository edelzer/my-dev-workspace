# CLAUDE.md Template (API Project)

This file provides guidance to Claude Code (claude.ai/code) when working with this Node.js/Express API, incorporating BMAD multi-agent workflows and security-first backend development.

## API Project Overview

**Project Type**: RESTful API / GraphQL API
**Framework**: Node.js + Express.js + TypeScript
**Database**: [PostgreSQL|MongoDB|MySQL|Redis]
**Authentication**: [JWT|OAuth 2.0|Passport.js|Custom]
**Documentation**: [OpenAPI/Swagger|GraphQL Schema|Custom]

## Backend Security-First Philosophy

### API Security Fundamentals
- Input validation on all endpoints
- SQL injection prevention through parameterized queries
- Rate limiting and DDoS protection
- CORS properly configured
- Security headers (Helmet.js integration)
- Authentication and authorization on all protected routes
- API versioning and deprecation strategies

### Data Protection Standards
- Encryption at rest and in transit
- PII handling and GDPR compliance
- Database connection security
- Logging without sensitive data exposure
- Secure environment variable management

### Performance and Scalability
- Database query optimization
- Caching strategies (Redis/Memcached)
- Connection pooling and management
- Horizontal scaling considerations
- Monitoring and alerting systems

## BMAD Multi-Agent API Workflow

### Planning Phase Agents
- `/analyst` - API requirements analysis, third-party integration research, market standards review
- `/pm` - Endpoint specification, data model requirements, integration timeline planning
- `/architect` - Database schema design, API architecture patterns, security architecture

### Development Phase Agents
- `/dev` - Endpoint implementation, middleware development, business logic implementation
- `/qa` - API testing, security testing, performance testing, documentation validation
- `/sm` - Sprint coordination, integration milestone tracking, deployment planning

### Quality Assurance Agents
- `/qa` - Unit testing, integration testing, security penetration testing, load testing

## API-Specific Build Commands

```bash
# Development
npm run dev              # Development server with hot reload (nodemon)
npm run dev:debug        # Development with debugging enabled
npm run test:tdd         # Jest TDD mode with watch
npm run db:migrate       # Database migrations
npm run db:seed          # Database seeding
npm run lint:fix         # ESLint with auto-fix
npm run security:scan    # Security vulnerability scanning

# Quality Assurance
npm run build           # Production build compilation
npm run test:integration # Integration test suite
npm run test:coverage   # Test coverage report
npm run test:security   # Security-focused testing
npm run test:performance # Load testing and performance benchmarks

# Database Management
npm run db:reset        # Reset database to clean state
npm run db:backup       # Database backup procedures
npm run db:restore      # Database restore procedures

# Monitoring and Logging
npm run logs:tail       # Application log monitoring
npm run metrics:collect # Performance metrics collection
```

## API Endpoint Development Standards

### Endpoint Structure
```typescript
// routes/resourceRoutes.ts
interface ResourceController {
  // [BMAD /dev]: Implement comprehensive endpoint handlers
  list: RequestHandler;    // GET /api/v1/resources
  show: RequestHandler;    // GET /api/v1/resources/:id
  create: RequestHandler;  // POST /api/v1/resources
  update: RequestHandler;  // PUT /api/v1/resources/:id
  delete: RequestHandler;  // DELETE /api/v1/resources/:id
}

// [BMAD /qa]: Comprehensive endpoint testing
describe('Resource API Endpoints', () => {
  describe('GET /api/v1/resources', () => {
    // Test implementation with security, validation, and error cases
  });
});
```

### Security Middleware Stack
```typescript
// [BMAD /architect]: Security-first middleware configuration
app.use(helmet());                    // Security headers
app.use(cors(corsOptions));          // CORS configuration
app.use(rateLimit(rateLimitOptions)); // Rate limiting
app.use(express.json({ limit: '10mb' })); // Body parsing with limits
app.use(validationMiddleware);       // Input validation
app.use(authenticationMiddleware);   // JWT/OAuth validation
app.use(authorizationMiddleware);    // Role-based access control
```

### Data Validation Patterns
- **Input Validation**: Joi, Yup, or Zod schemas for all endpoint inputs
- **Database Validation**: Model-level validation with comprehensive constraints
- **Business Logic Validation**: Custom validation for complex business rules
- **Output Sanitization**: Sensitive data filtering before response serialization

## Database Security Implementation

### Query Security
- [ ] Parameterized queries for all database interactions
- [ ] SQL injection prevention through ORM/Query Builder usage
- [ ] Database user permissions follow principle of least privilege
- [ ] Database connection encryption (SSL/TLS)
- [ ] Connection pooling with proper timeout configurations

### Data Privacy
- [ ] PII encryption at column level for sensitive data
- [ ] Audit logging for all data access and modifications
- [ ] Data retention policies implemented and automated
- [ ] GDPR right-to-deletion automated procedures
- [ ] Database backup encryption and secure storage

## Testing Strategy

### API Testing Pyramid
- **Unit Tests**: Controller logic, middleware functions, utility functions
- **Integration Tests**: Database interactions, external API integrations, authentication flows
- **Contract Tests**: API response schema validation, OpenAPI specification compliance
- **End-to-End Tests**: Complete user journeys, authentication to data persistence

### Security Testing
- **Penetration Testing**: OWASP Top 10 vulnerability scanning
- **Authentication Testing**: JWT manipulation, session hijacking, privilege escalation
- **Input Fuzzing**: Malicious payload testing on all endpoints
- **Rate Limiting Testing**: DDoS resilience and abuse prevention validation

### Performance Testing
- **Load Testing**: Concurrent user simulation under normal conditions
- **Stress Testing**: Breaking point identification and graceful degradation
- **Spike Testing**: Traffic surge handling and auto-scaling validation
- **Endurance Testing**: Long-running stability and memory leak detection

## Quality Gates Validation

### Pre-Deployment Checklist
- [ ] All unit and integration tests passing
- [ ] Security scan results clean (no high/critical vulnerabilities)
- [ ] Performance benchmarks met or improved
- [ ] API documentation updated and validated
- [ ] Database migrations tested in staging environment
- [ ] Monitoring and alerting systems configured

### BMAD Agent Handoff Validation
- [ ] `/analyst` + `/pm`: API requirements documented with clear acceptance criteria
- [ ] `/architect`: Database schema and API architecture validated and documented
- [ ] `/dev`: Implementation matches specifications with comprehensive error handling
- [ ] `/qa`: Security testing, performance testing, and integration testing completed
- [ ] `/bmad-orchestrator`: All quality gates passed, deployment procedures validated

## Monitoring and Observability

### Application Monitoring
- **Health Checks**: Endpoint availability and dependency health monitoring
- **Performance Metrics**: Response times, throughput, error rates, resource utilization
- **Business Metrics**: API usage patterns, feature adoption, user behavior analytics
- **Security Monitoring**: Failed authentication attempts, suspicious activity patterns

### Logging Standards
```typescript
// [BMAD /dev]: Comprehensive logging without sensitive data exposure
logger.info('API request received', {
  method: req.method,
  path: req.path,
  userAgent: req.get('User-Agent'),
  ip: req.ip,
  // Never log: passwords, tokens, PII, sensitive business data
});
```

### Error Handling Patterns
- **Structured Error Responses**: Consistent error format across all endpoints
- **Error Classification**: Client errors (4xx) vs server errors (5xx) with proper HTTP status codes
- **Security-Conscious Errors**: No sensitive information leakage in error messages
- **Error Recovery**: Graceful degradation and circuit breaker patterns

## API Documentation Standards

### OpenAPI/Swagger Documentation
- [ ] All endpoints documented with request/response schemas
- [ ] Authentication requirements clearly specified
- [ ] Error response formats documented
- [ ] Rate limiting information included
- [ ] Example requests and responses provided
- [ ] API versioning and deprecation policies documented

### Integration Guides
- [ ] SDK/client library documentation
- [ ] Authentication setup guides
- [ ] Common integration patterns and examples
- [ ] Troubleshooting guides for common issues

## Emergency Procedures

### Security Incidents
1. **Immediate Response**: API endpoint shutdown procedures if breach detected
2. **Investigation**: `/qa` security audit and breach scope analysis
3. **Containment**: User notification, password reset procedures, token invalidation
4. **Recovery**: Security patch deployment, enhanced monitoring implementation

### Performance Degradation
1. **Detection**: Automated alerting and performance threshold monitoring
2. **Analysis**: `/architect` performance bottleneck identification
3. **Mitigation**: `/dev` query optimization, caching implementation, resource scaling

### Data Integrity Issues
1. **Assessment**: Database consistency validation and backup integrity check
2. **Recovery**: Point-in-time database restore procedures
3. **Validation**: Data integrity verification and application-level consistency checks

## Deployment and DevOps

### CI/CD Pipeline
- **Build Validation**: TypeScript compilation, linting, security scanning
- **Testing**: Automated test suite execution including security and performance tests
- **Staging Deployment**: Production-like environment testing with real data scenarios
- **Production Deployment**: Blue-green or rolling deployment with rollback capabilities

### Environment Configuration
- **Development**: Local development with Docker containerization
- **Staging**: Production parity for accurate testing
- **Production**: High availability, auto-scaling, comprehensive monitoring

## Project-Specific Context

### Current Focus
- [CUSTOMIZE: Current API development priorities and integration objectives]

### Integration Architecture
- [CUSTOMIZE: External API integrations, microservice communication patterns]

### Performance Requirements
- [CUSTOMIZE: SLA requirements, throughput targets, response time objectives]

**API Development Integration Command**: When implementing API features, coordinate `/architect` and `/dev` agents for optimal data architecture, validate through `/qa` security and performance testing, and maintain comprehensive monitoring throughout the development lifecycle.