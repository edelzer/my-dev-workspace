# Node.js/Express API Template

Production-ready Node.js API with TypeScript, Express, comprehensive security, and Docker support.

## Features

- ✅ Express.js with TypeScript
- ✅ Security-first (Helmet, CORS, rate limiting)
- ✅ JWT authentication ready
- ✅ PostgreSQL with Prisma ORM
- ✅ Redis for caching
- ✅ Docker & Docker Compose
- ✅ Comprehensive testing (Jest)
- ✅ ESLint + Prettier
- ✅ CI/CD ready

## Quick Start

### Development (Local)

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run tests
npm run test

# Run security checks
npm run security:scan
```

The API will be available at `http://localhost:3000`

### Docker Deployment

```bash
# Build and start all services (API, PostgreSQL, Redis)
docker compose up -d

# View logs
docker compose logs -f api

# Check service health
docker compose ps

# Stop all services
docker compose down

# Stop and remove volumes (CAUTION: deletes data)
docker compose down -v
```

## Docker Architecture

### Multi-Stage Build

The Dockerfile uses a multi-stage build for optimal image size and security:

1. **Builder Stage**: Installs dependencies and compiles TypeScript
2. **Runtime Stage**: Minimal production image with only compiled code

### Services

**API Service**:
- Node.js 18 Alpine Linux
- Non-root user (nodejs:1001)
- dumb-init for proper signal handling
- Health checks every 30 seconds
- Automatic restart on failure

**PostgreSQL Database**:
- PostgreSQL 15 Alpine
- Persistent volume for data
- Automatic schema initialization via init.sql
- Health checks to ensure database readiness

**Redis Cache**:
- Redis 7 Alpine
- AOF persistence enabled
- Persistent volume for data
- Health checks for availability

## Environment Variables

Create a `.env` file in the project root:

```env
# Node Environment
NODE_ENV=production

# Server Configuration
PORT=3000

# Database Configuration
POSTGRES_PASSWORD=your-secure-password-here
DATABASE_URL=postgresql://api:your-secure-password-here@postgres:5432/apidb

# Redis Configuration
REDIS_URL=redis://redis:6379

# Security
JWT_SECRET=your-very-secure-jwt-secret-here
```

**Security Notes**:
- NEVER commit `.env` files to version control
- Use strong, unique passwords for production
- Rotate JWT secrets regularly
- Use environment-specific secrets management (AWS Secrets Manager, etc.)

## API Endpoints

### Health Check

```bash
GET /health
```

Response:
```json
{
  "status": "healthy",
  "timestamp": "2025-10-18T12:00:00.000Z",
  "uptime": 123.456,
  "environment": "production"
}
```

### Status

```bash
GET /api/v1/status
```

Response:
```json
{
  "message": "API is running",
  "version": "1.0.0"
}
```

## Production Deployment

### AWS ECS (Elastic Container Service)

```bash
# Build and tag image
docker build -t your-api:latest .

# Tag for ECR
docker tag your-api:latest <aws-account-id>.dkr.ecr.<region>.amazonaws.com/your-api:latest

# Login to ECR
aws ecr get-login-password --region <region> | docker login --username AWS --password-stdin <aws-account-id>.dkr.ecr.<region>.amazonaws.com

# Push to ECR
docker push <aws-account-id>.dkr.ecr.<region>.amazonaws.com/your-api:latest

# Deploy to ECS (via Task Definition update)
aws ecs update-service --cluster your-cluster --service your-api-service --force-new-deployment
```

### GCP Cloud Run

```bash
# Build and tag image
docker build -t gcr.io/<project-id>/your-api:latest .

# Push to Container Registry
docker push gcr.io/<project-id>/your-api:latest

# Deploy to Cloud Run
gcloud run deploy your-api \
  --image gcr.io/<project-id>/your-api:latest \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars DATABASE_URL=<db-url>,REDIS_URL=<redis-url>,JWT_SECRET=<secret>
```

### Azure Container Apps

```bash
# Build and tag image
docker build -t your-api:latest .

# Tag for Azure Container Registry
docker tag your-api:latest <registry-name>.azurecr.io/your-api:latest

# Login to ACR
az acr login --name <registry-name>

# Push to ACR
docker push <registry-name>.azurecr.io/your-api:latest

# Deploy to Container Apps
az containerapp create \
  --name your-api \
  --resource-group <resource-group> \
  --environment <environment-name> \
  --image <registry-name>.azurecr.io/your-api:latest \
  --target-port 3000 \
  --env-vars DATABASE_URL=<db-url> REDIS_URL=<redis-url> JWT_SECRET=<secret>
```

## Database Setup

### Schema Initialization

The `init.sql` file automatically creates:
- UUID and pgcrypto extensions
- Users table with email/password
- Performance indexes
- Proper permissions

### Migrations

For schema changes, use Prisma or manual migrations:

```bash
# Using Prisma
npx prisma migrate dev --name your-migration-name

# Manual SQL
psql $DATABASE_URL < migrations/001_add_feature.sql
```

## Security Features

### Built-in Security Middleware

1. **Helmet**: Sets security-related HTTP headers
2. **CORS**: Cross-Origin Resource Sharing configuration
3. **Rate Limiting**: Prevents brute force attacks (100 requests per 15 minutes)
4. **Compression**: Reduces payload size
5. **Input Validation**: Limits request body size to 10MB

### Docker Security

1. **Non-root user**: Application runs as nodejs:1001
2. **Multi-stage build**: Minimal attack surface
3. **Alpine Linux**: Smaller image, fewer vulnerabilities
4. **Health checks**: Automatic container restart on failure
5. **No secrets in images**: All secrets via environment variables

### Recommended Security Practices

- Enable HTTPS in production (use reverse proxy like nginx)
- Implement JWT token rotation
- Use prepared statements for database queries (prevents SQL injection)
- Enable PostgreSQL SSL connections
- Implement rate limiting per user/IP
- Log all authentication attempts
- Use secrets management services (AWS Secrets Manager, etc.)

## Testing

```bash
# Run all tests
npm run test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch

# Run security audit
npm audit

# Run linting
npm run lint
```

## Monitoring and Logging

### Health Checks

The `/health` endpoint provides:
- Service status
- Uptime metrics
- Environment information
- Timestamp

Use for:
- Docker health checks
- Load balancer health monitoring
- Kubernetes liveness/readiness probes

### Logging Strategy

Add structured logging:

```typescript
import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

// Log all requests
app.use((req, res, next) => {
  logger.info({
    method: req.method,
    path: req.path,
    ip: req.ip,
    timestamp: new Date().toISOString()
  });
  next();
});
```

## Troubleshooting

### Common Issues

**Issue**: Docker container not starting
```bash
# Check logs
docker compose logs api

# Common causes:
# - Missing environment variables
# - Database connection failure
# - Port already in use
```

**Issue**: Database connection failed
```bash
# Verify PostgreSQL is healthy
docker compose ps postgres

# Check database logs
docker compose logs postgres

# Test connection manually
docker compose exec postgres psql -U api -d apidb
```

**Issue**: Health check failing
```bash
# Test health endpoint manually
curl http://localhost:3000/health

# Check if port is accessible
docker compose exec api wget -O- http://localhost:3000/health

# Review health check configuration in docker-compose.yml
```

**Issue**: Redis connection failed
```bash
# Verify Redis is running
docker compose ps redis

# Test Redis connection
docker compose exec redis redis-cli ping

# Should return: PONG
```

### Performance Optimization

**Database**:
- Add indexes for frequently queried columns
- Use connection pooling
- Enable query caching with Redis
- Monitor slow queries

**API**:
- Implement response caching
- Use compression middleware
- Optimize JSON payload sizes
- Enable HTTP/2

**Docker**:
- Use smaller base images
- Minimize layer count
- Enable build caching
- Use .dockerignore effectively

## Development Workflow

1. **Local Development**: Use `npm run dev` for hot-reloading
2. **Testing**: Run tests before committing (`npm run test`)
3. **Security Checks**: Run `npm audit` and `npm run security:scan`
4. **Linting**: Ensure code quality with `npm run lint`
5. **Docker Testing**: Test with `docker compose up` before deployment
6. **CI/CD**: Automated testing and deployment via GitHub Actions

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT License - see LICENSE file for details

## Support

For issues and questions:
- Open an issue on GitHub
- Check existing documentation
- Review troubleshooting section

## Next Steps

1. **Add Authentication**: Implement JWT-based authentication
2. **Add Database ORM**: Integrate Prisma for type-safe database access
3. **Add API Documentation**: Use Swagger/OpenAPI
4. **Add Monitoring**: Integrate Prometheus/Grafana
5. **Add Logging**: Implement structured logging with Winston
6. **Add Testing**: Expand test coverage to >80%
7. **Add CI/CD**: Automate deployments with GitHub Actions
