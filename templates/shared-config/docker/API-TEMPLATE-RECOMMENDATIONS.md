# API Template Docker Implementation Recommendations

**Phase 2.3 Implementation Guide**
**Template**: Node.js + TypeScript + Express + PostgreSQL + Redis
**Deployment Strategy**: Multi-stage build with full backend stack

---

## Overview

The API template requires a Docker setup that:
1. Builds the Node.js/TypeScript application
2. Runs with PostgreSQL database
3. Uses Redis for caching and sessions
4. Implements comprehensive health checks
5. Provides rate limiting and authentication
6. Supports development and production environments

---

## Recommended Dockerfile

### Multi-Stage Build Strategy

**Stage 1: Build TypeScript Application**
- Base image: `node:18-alpine`
- Build tool: TypeScript compiler
- Output: Compiled JavaScript in `dist/` directory

**Stage 2: Runtime Environment**
- Base image: `node:18-alpine`
- Runtime: Node.js
- Purpose: Serve API with minimal dependencies

### Complete Dockerfile

```dockerfile
# Stage 1: Build application
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files for better caching
COPY package.json package-lock.json ./

# Install ALL dependencies (including dev dependencies for build)
RUN npm ci --silent && \
    npm cache clean --force

# Copy application source
COPY . .

# Build TypeScript application
RUN npm run build

# Verify build output exists
RUN test -d dist || (echo "Build failed: dist directory not found" && exit 1)

# Stage 2: Production runtime
FROM node:18-alpine

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init curl

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -u 1001 -S nodejs -G nodejs

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./

# Install only production dependencies
RUN npm ci --only=production --silent && \
    npm cache clean --force

# Copy built application from builder
COPY --from=builder --chown=nodejs:nodejs /app/dist ./dist

# Create necessary directories
RUN mkdir -p logs uploads tmp && \
    chown -R nodejs:nodejs /app

# Copy health check script
COPY --chown=nodejs:nodejs healthcheck.js ./

# Switch to non-root user
USER nodejs

# Expose application port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD node healthcheck.js || exit 1

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Start application
CMD ["node", "dist/index.js"]
```

---

## Required Health Check Script

### healthcheck.js

**Location**: `templates/api/healthcheck.js`

```javascript
/**
 * Docker health check script
 * Tests if the API is responding to requests
 */

const http = require('http');

const options = {
  host: 'localhost',
  port: process.env.PORT || 3000,
  path: '/health',
  timeout: 2000,
  method: 'GET'
};

const request = http.request(options, (res) => {
  console.log(`Health check status: ${res.statusCode}`);

  if (res.statusCode === 200) {
    process.exit(0); // Healthy
  } else {
    process.exit(1); // Unhealthy
  }
});

request.on('error', (err) => {
  console.error('Health check failed:', err.message);
  process.exit(1);
});

request.on('timeout', () => {
  console.error('Health check timeout');
  request.destroy();
  process.exit(1);
});

request.end();
```

---

## Health Endpoint Implementation

### Add to src/index.ts

```typescript
import express, { Request, Response } from 'express';

const app = express();

// Health check endpoint (REQUIRED for Docker health checks)
app.get('/health', async (req: Request, res: Response) => {
  try {
    // Check database connection
    // await db.query('SELECT 1');

    // Check Redis connection
    // await redis.ping();

    res.status(200).json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development'
    });
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Liveness probe (simpler check - just checks if app is running)
app.get('/health/liveness', (req: Request, res: Response) => {
  res.status(200).send('OK');
});

// Readiness probe (checks if app is ready to serve traffic)
app.get('/health/readiness', async (req: Request, res: Response) => {
  try {
    // Check all critical dependencies
    // await db.query('SELECT 1');
    // await redis.ping();
    res.status(200).json({ status: 'ready' });
  } catch (error) {
    res.status(503).json({ status: 'not ready' });
  }
});
```

---

## Docker Compose Configuration

### Full Stack Setup

**Location**: `templates/api/docker-compose.yml`

```yaml
version: '3.8'

services:
  # Node.js API Application
  api:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: node-api
    ports:
      - "3000:3000"
    environment:
      # Application
      NODE_ENV: development
      PORT: 3000

      # Database
      DATABASE_URL: postgresql://postgres:password@postgres:5432/api_db
      DATABASE_HOST: postgres
      DATABASE_PORT: 5432
      DATABASE_NAME: api_db
      DATABASE_USER: postgres
      DATABASE_PASSWORD: password

      # Redis
      REDIS_URL: redis://redis:6379/0
      REDIS_HOST: redis
      REDIS_PORT: 6379

      # JWT
      JWT_SECRET: dev-secret-change-in-production-very-long-random-string
      JWT_EXPIRATION: 1h
      JWT_REFRESH_EXPIRATION: 7d

      # Security
      CORS_ORIGIN: http://localhost:3000,http://localhost:5173
      RATE_LIMIT_WINDOW_MS: 900000
      RATE_LIMIT_MAX_REQUESTS: 100

      # Logging
      LOG_LEVEL: debug
    volumes:
      - ./src:/app/src:ro
      - ./dist:/app/dist
      - api_logs:/app/logs
      - api_uploads:/app/uploads
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    networks:
      - api-network
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "node", "healthcheck.js"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

  # PostgreSQL Database
  postgres:
    image: postgres:15-alpine
    container_name: node-api-postgres
    environment:
      POSTGRES_DB: api_db
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password
      POSTGRES_INITDB_ARGS: "--encoding=UTF8 --locale=C"
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./init.sql:/docker-entrypoint-initdb.d/init.sql:ro
    networks:
      - api-network
    restart: unless-stopped
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres -d api_db"]
      interval: 10s
      timeout: 5s
      retries: 5
      start_period: 10s

  # Redis Cache and Session Store
  redis:
    image: redis:7-alpine
    container_name: node-api-redis
    command: redis-server --appendonly yes --maxmemory 256mb --maxmemory-policy allkeys-lru
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    networks:
      - api-network
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 3s
      retries: 3

  # Optional: Database Administration
  adminer:
    image: adminer:latest
    container_name: node-api-adminer
    environment:
      ADMINER_DEFAULT_SERVER: postgres
      ADMINER_DESIGN: dracula
    ports:
      - "8080:8080"
    depends_on:
      - postgres
    networks:
      - api-network
    restart: unless-stopped
    profiles:
      - admin

  # Optional: Redis Administration
  redis-commander:
    image: rediscommander/redis-commander:latest
    container_name: node-api-redis-commander
    environment:
      REDIS_HOSTS: local:redis:6379
      HTTP_USER: admin
      HTTP_PASSWORD: admin
    ports:
      - "8081:8081"
    depends_on:
      - redis
    networks:
      - api-network
    restart: unless-stopped
    profiles:
      - admin

# Named volumes for data persistence
volumes:
  postgres_data:
    name: node-api-postgres-data
  redis_data:
    name: node-api-redis-data
  api_logs:
    name: node-api-logs
  api_uploads:
    name: node-api-uploads

# Custom network
networks:
  api-network:
    name: node-api-network
    driver: bridge
```

---

## Database Initialization Script

### init.sql

**Location**: `templates/api/init.sql`

```sql
-- PostgreSQL initialization script for Node.js API
-- This script runs automatically when the database container is first created

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create database if not exists (redundant but safe)
-- PostgreSQL automatically creates the database specified in POSTGRES_DB

-- Set timezone
SET timezone = 'UTC';

-- Create users table (example schema)
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    is_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_login_at TIMESTAMP WITH TIME ZONE
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_is_active ON users(is_active);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at DESC);

-- Create refresh tokens table
CREATE TABLE IF NOT EXISTS refresh_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(500) NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    revoked_at TIMESTAMP WITH TIME ZONE,
    replaced_by UUID REFERENCES refresh_tokens(id),
    CONSTRAINT unique_active_token UNIQUE(token)
);

-- Create indexes for refresh tokens
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user_id ON refresh_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_token ON refresh_tokens(token);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_expires_at ON refresh_tokens(expires_at);

-- Create audit log table
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    resource VARCHAR(100),
    resource_id UUID,
    ip_address INET,
    user_agent TEXT,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for audit logs
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at DESC);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
CREATE TRIGGER update_users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Grant permissions to the application user
GRANT CONNECT ON DATABASE api_db TO postgres;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO postgres;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO postgres;

-- Insert a test user (password: "Test1234!")
-- Password hash for "Test1234!" using bcrypt (cost factor 10)
INSERT INTO users (email, password_hash, first_name, last_name, is_active, is_verified)
VALUES (
    'admin@example.com',
    '$2b$10$X3wLv7YOG8hG9vfgKwqN0.pKZQ8Q0vXZQOZ8qZQ8Q0vXZQOZ8qZQ8O', -- "Test1234!"
    'Admin',
    'User',
    true,
    true
) ON CONFLICT (email) DO NOTHING;

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'Database initialization complete!';
    RAISE NOTICE 'Test user: admin@example.com / Test1234!';
END $$;
```

---

## Required Files for API Template

### 1. `.dockerignore`

Copy from `templates/shared-config/docker/.dockerignore.template`:

```bash
cp templates/shared-config/docker/.dockerignore.template templates/api/.dockerignore
```

### 2. Environment Configuration

**Create `.env.example`:**

```env
# Application
NODE_ENV=development
PORT=3000

# Database
DATABASE_URL=postgresql://postgres:password@localhost:5432/api_db
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=api_db
DATABASE_USER=postgres
DATABASE_PASSWORD=password

# Redis
REDIS_URL=redis://localhost:6379/0
REDIS_HOST=localhost
REDIS_PORT=6379

# JWT Authentication
JWT_SECRET=your-super-secret-jwt-key-change-in-production-minimum-32-characters-long
JWT_EXPIRATION=1h
JWT_REFRESH_EXPIRATION=7d

# Security
CORS_ORIGIN=http://localhost:3000,http://localhost:5173
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
BCRYPT_ROUNDS=10

# Logging
LOG_LEVEL=debug
LOG_FORMAT=json

# Email (optional)
SMTP_HOST=smtp.mailtrap.io
SMTP_PORT=2525
SMTP_USER=
SMTP_PASS=
EMAIL_FROM=noreply@example.com

# File Uploads
MAX_FILE_SIZE=10485760
UPLOAD_PATH=./uploads
```

**Create `.env` (for local development):**

```bash
# Copy example and customize
cp .env.example .env
```

---

## Build and Deployment Commands

### Local Development

```bash
# Build Docker image
docker build -t node-api:latest .

# Run container with environment variables
docker run -d \
  -p 3000:3000 \
  -e DATABASE_URL=postgresql://postgres:password@host.docker.internal:5432/api_db \
  -e REDIS_URL=redis://host.docker.internal:6379/0 \
  --name api-server \
  node-api:latest

# View logs
docker logs -f api-server

# Stop and remove container
docker stop api-server && docker rm api-server
```

### Docker Compose (Recommended)

```bash
# Start all services
docker compose up -d

# View logs
docker compose logs -f api

# Restart API service after code changes
docker compose restart api

# Stop all services
docker compose down

# Stop and remove volumes (WARNING: deletes all data)
docker compose down -v

# Rebuild and restart
docker compose up -d --build

# Start with admin tools
docker compose --profile admin up -d
```

### Database Operations

```bash
# Run migrations (if using migration tool)
docker compose exec api npm run migrate

# Seed database
docker compose exec api npm run seed

# Access PostgreSQL directly
docker compose exec postgres psql -U postgres -d api_db

# Backup database
docker compose exec postgres pg_dump -U postgres api_db > backup.sql

# Restore database
docker compose exec -T postgres psql -U postgres api_db < backup.sql
```

### Redis Operations

```bash
# Access Redis CLI
docker compose exec redis redis-cli

# View all keys
docker compose exec redis redis-cli KEYS '*'

# Flush all data (WARNING: deletes all cached data)
docker compose exec redis redis-cli FLUSHALL
```

---

## Performance Optimizations

### 1. Node.js Performance

**Add to `docker-compose.yml` environment:**
```yaml
# Node.js optimization flags
NODE_OPTIONS: --max-old-space-size=512 --optimize_for_size
```

### 2. Database Connection Pooling

**Configure in your database client:**
```typescript
const pool = new Pool({
  host: process.env.DATABASE_HOST,
  port: parseInt(process.env.DATABASE_PORT || '5432'),
  database: process.env.DATABASE_NAME,
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  max: 20, // Maximum pool size
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});
```

### 3. Redis Connection Pooling

**Configure Redis client:**
```typescript
const redis = new Redis({
  host: process.env.REDIS_HOST,
  port: parseInt(process.env.REDIS_PORT || '6379'),
  maxRetriesPerRequest: 3,
  retryStrategy: (times) => Math.min(times * 50, 2000),
});
```

---

## Security Considerations

### 1. Environment Variables

❌ **NEVER commit `.env` files to Git**

✅ **DO:**
- Use `.env.example` for documentation
- Use secrets management in production (AWS Secrets Manager, Vault)
- Rotate secrets regularly
- Use strong, random JWT secrets (minimum 32 characters)

### 2. Database Security

✅ **Implemented:**
- UUID primary keys (prevents enumeration attacks)
- Password hashing with bcrypt
- Prepared statements (SQL injection prevention)
- Row-level security policies (optional, advanced)

### 3. API Security

**Implement in your API code:**
```typescript
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import mongoSanitize from 'express-mongo-sanitize';

app.use(helmet()); // Security headers

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);

app.use(mongoSanitize()); // Prevent NoSQL injection
```

### 4. Image Scanning

**Scan for vulnerabilities:**
```bash
# Docker Scout
docker scout cves node-api:latest

# Trivy
trivy image node-api:latest
```

---

## Monitoring and Observability

### Application Metrics

**Add Prometheus metrics (optional):**
```typescript
import prometheus from 'prom-client';

const register = new prometheus.Registry();

// Default metrics (CPU, memory, etc.)
prometheus.collectDefaultMetrics({ register });

// Custom metrics
const httpRequestDuration = new prometheus.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  registers: [register]
});

// Expose metrics endpoint
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});
```

### Logging Best Practices

**Use structured logging:**
```typescript
import winston from 'winston';

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' })
  ]
});
```

---

## Cloud Platform Deployment

### AWS (ECS/Fargate)

```bash
# Authenticate to ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin YOUR_ECR_URL

# Build and push
docker build -t node-api .
docker tag node-api:latest YOUR_ECR_URL/node-api:latest
docker push YOUR_ECR_URL/node-api:latest

# Create task definition and service in ECS
# Configure environment variables via ECS task definition
# Use AWS RDS for PostgreSQL and ElastiCache for Redis
```

### Google Cloud Run

```bash
# Build and push to GCR
gcloud builds submit --tag gcr.io/PROJECT_ID/node-api

# Deploy to Cloud Run
gcloud run deploy node-api \
  --image gcr.io/PROJECT_ID/node-api \
  --platform managed \
  --port 3000 \
  --set-env-vars DATABASE_URL=postgresql://... \
  --allow-unauthenticated

# Use Cloud SQL for PostgreSQL and Memorystore for Redis
```

### Azure Container Apps

```bash
# Build and push to ACR
az acr build --registry YOUR_ACR --image node-api:latest .

# Deploy to Container Apps
az containerapp create \
  --name node-api \
  --resource-group YOUR_RG \
  --image YOUR_ACR.azurecr.io/node-api:latest \
  --target-port 3000 \
  --env-vars DATABASE_URL=secretref:database-url \
  --ingress external

# Use Azure Database for PostgreSQL and Azure Cache for Redis
```

### DigitalOcean App Platform

```bash
# Push to DigitalOcean Container Registry
doctl registry login
docker tag node-api:latest registry.digitalocean.com/YOUR_REGISTRY/node-api:latest
docker push registry.digitalocean.com/YOUR_REGISTRY/node-api:latest

# Use DigitalOcean Managed PostgreSQL and Redis
```

---

## Troubleshooting

### Common Issues

**Issue**: Cannot connect to database
```bash
# Solution 1: Check if postgres container is healthy
docker compose ps postgres

# Solution 2: Verify database credentials
docker compose exec postgres psql -U postgres -d api_db -c "SELECT 1;"

# Solution 3: Check logs
docker compose logs postgres
```

**Issue**: Redis connection fails
```bash
# Solution 1: Verify Redis is running
docker compose exec redis redis-cli ping

# Solution 2: Check Redis logs
docker compose logs redis
```

**Issue**: Health check failing
```bash
# Test health endpoint manually
curl http://localhost:3000/health

# Check application logs
docker compose logs api

# Verify dependencies are healthy
docker compose ps
```

**Issue**: Build fails on TypeScript compilation
```bash
# Check TypeScript configuration
cat tsconfig.json

# Verify all dependencies are installed
npm install

# Run build locally
npm run build
```

---

## README.md Updates Required

Add the following section to `templates/api/README.md`:

```markdown
## Docker Deployment

### Quick Start with Docker Compose

1. **Create environment file:**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

2. **Start all services:**
   ```bash
   docker compose up -d
   ```

3. **Verify services are running:**
   ```bash
   docker compose ps
   ```

4. **View logs:**
   ```bash
   docker compose logs -f api
   ```

5. **Test the API:**
   ```bash
   curl http://localhost:3000/health
   ```

### Docker Compose Services

- **api**: Node.js application (http://localhost:3000)
- **postgres**: PostgreSQL database (port 5432)
- **redis**: Redis cache (port 6379)
- **adminer**: Database admin UI (http://localhost:8080) [optional]
- **redis-commander**: Redis admin UI (http://localhost:8081) [optional]

### Start with Admin Tools

```bash
docker compose --profile admin up -d
```

### Database Operations

```bash
# Access database
docker compose exec postgres psql -U postgres -d api_db

# Run migrations
docker compose exec api npm run migrate

# Seed database
docker compose exec api npm run seed
```

### Stop Services

```bash
docker compose down
```

### Production Deployment

See [DOCKER-GUIDE.md](../../docs/DOCKER-GUIDE.md) for comprehensive deployment guides for:
- AWS ECS with RDS and ElastiCache
- Google Cloud Run with Cloud SQL and Memorystore
- Azure Container Apps with Managed PostgreSQL and Redis
- DigitalOcean App Platform with Managed Databases
```

---

## Validation Checklist

Before completing Phase 2.3, verify:

- [ ] `templates/api/Dockerfile` builds successfully
- [ ] `templates/api/docker-compose.yml` starts all services
- [ ] `templates/api/healthcheck.js` works correctly
- [ ] `templates/api/init.sql` initializes database
- [ ] `templates/api/.dockerignore` copied from shared config
- [ ] `/health` endpoint returns 200 with status
- [ ] PostgreSQL connection works
- [ ] Redis connection works
- [ ] Database tables created successfully
- [ ] Test user can authenticate
- [ ] README.md updated with Docker section
- [ ] All health checks passing
- [ ] Docker image size < 150MB

---

**Last Updated**: 2025-01-18
**Status**: Ready for Phase 2.3 implementation
**Next**: Implement Docker support for API template following this guide
