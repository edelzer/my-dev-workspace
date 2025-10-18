# Docker Configuration Best Practices

This directory contains shared Docker configuration patterns and best practices extracted from the existing python, java, and go templates. Use this as a reference when implementing Docker support for web and api templates.

## Overview

**Existing Docker Support:**
- ✅ **Python Template**: Multi-stage build with FastAPI, PostgreSQL, Redis, comprehensive monitoring
- ✅ **Java Template**: Multi-stage build with Spring Boot, PostgreSQL, Redis, full observability stack
- ✅ **Go Template**: Minimal scratch-based build with Gin, PostgreSQL, Redis

**Templates Needing Docker Support:**
- ❌ **Web Template**: React + TypeScript + Vite (needs Nginx multi-stage build)
- ❌ **API Template**: Node.js + TypeScript + Express (needs PostgreSQL + Redis stack)

---

## Common Docker Patterns Across All Templates

### 1. Multi-Stage Builds

**Purpose**: Separate build environment from runtime environment for smaller, more secure images

**Pattern Observed:**
```dockerfile
# Stage 1: Build stage (includes build tools, dependencies, source code)
FROM <language>:<version>-alpine AS builder
WORKDIR /app
COPY package/dependency files
RUN install dependencies
COPY source code
RUN build application

# Stage 2: Runtime stage (minimal image with only runtime dependencies)
FROM <runtime>:<version>-alpine
COPY --from=builder /app/built-artifacts /app/
CMD ["start", "application"]
```

**Examples from Existing Templates:**
- **Python**: `python:3.11-slim` (builder) → `python:3.11-slim` (production)
- **Java**: `gradle:8.5-jdk17-alpine` (builder) → `eclipse-temurin:17-jre-alpine` (runtime)
- **Go**: `golang:1.21-alpine` (builder) → `scratch` (runtime - most minimal!)

**Benefits:**
- ✅ Smaller final image size (excludes build tools)
- ✅ Reduced attack surface (fewer packages in runtime)
- ✅ Faster deployment (smaller images transfer faster)
- ✅ Better security (no compiler or build tools in production)

---

### 2. Security Best Practices

#### Non-Root User Execution (ALL templates implement this)

**Why**: Running as root inside containers is a security risk. Non-root users limit damage from compromised containers.

**Python Template Pattern:**
```dockerfile
RUN groupadd -r appuser && useradd -r -g appuser appuser
USER appuser
```

**Java Template Pattern:**
```dockerfile
RUN addgroup -g 1001 -S spring && \
    adduser -u 1001 -S spring -G spring
USER spring:spring
```

**Go Template Pattern:**
```dockerfile
RUN adduser -D -g '' appuser
USER appuser
```

#### Alpine Base Images

**Why**: Alpine Linux is minimal (~5MB) compared to full distros (Ubuntu ~80MB), reducing attack surface.

**All templates use Alpine variants:**
- `python:3.11-slim` (Debian-based, still minimal at ~50MB)
- `node:18-alpine` (recommended for web/api - ~40MB)
- `eclipse-temurin:17-jre-alpine`
- `golang:1.21-alpine`
- `nginx:alpine`

#### File Permissions and Ownership

**Pattern from all templates:**
```dockerfile
# Create directories with proper ownership
RUN mkdir -p /app/logs /app/uploads && \
    chown -R appuser:appuser /app && \
    chmod -R 755 /app
```

---

### 3. Health Check Patterns

Health checks ensure containers are running correctly and enable orchestration platforms (Docker, Kubernetes) to restart unhealthy containers.

**Python Template (HTTP endpoint check):**
```dockerfile
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8000/health/liveness || exit 1
```

**Java Template (Custom script with comprehensive checks):**
```dockerfile
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD ./healthcheck.sh
```

**Go Template (Binary-based health check):**
```dockerfile
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD ["/app", "healthcheck"] || exit 1
```

**Recommended for Web Template (Nginx):**
```dockerfile
HEALTHCHECK CMD wget --quiet --tries=1 --spider http://localhost/ || exit 1
```

**Recommended for API Template (Node.js):**
```dockerfile
HEALTHCHECK CMD node healthcheck.js || exit 1
```

---

### 4. Layer Caching Optimization

**Pattern**: Copy dependency files BEFORE source code to leverage Docker's layer caching.

**Why**: Dependencies change less frequently than source code. Caching dependency installation speeds up builds.

**Optimal Order:**
```dockerfile
# 1. Copy dependency manifests first
COPY package.json package-lock.json ./

# 2. Install dependencies (cached if manifests unchanged)
RUN npm ci --only=production

# 3. Copy source code last (changes frequently)
COPY . .

# 4. Build application
RUN npm run build
```

**Examples from existing templates:**

**Python:**
```dockerfile
COPY pyproject.toml ./
COPY requirements/ ./requirements/
RUN poetry install --only main
COPY . .  # Source code last
```

**Java:**
```dockerfile
COPY build.gradle settings.gradle gradle.properties ./
RUN gradle dependencies --no-daemon  # Cache dependencies
COPY src/ ./src/  # Source code last
RUN gradle clean build
```

**Go:**
```dockerfile
COPY go.mod go.sum ./
RUN go mod download  # Cache Go modules
COPY . .  # Source code last
RUN go build
```

---

### 5. Environment Variable Configuration

All templates use environment variables for configuration (12-factor app principle).

**Common Environment Variables:**
- `ENVIRONMENT` / `NODE_ENV`: development, staging, production
- `DATABASE_URL`: Database connection string
- `REDIS_URL`: Redis connection string
- `JWT_SECRET`: Authentication secret
- `LOG_LEVEL`: Logging verbosity
- `PORT`: Application port

**Best Practices:**
- ✅ Never hardcode secrets in Dockerfile
- ✅ Use `.env.example` for documentation
- ✅ Override via docker-compose.yml or Kubernetes ConfigMaps
- ✅ Validate required environment variables at startup

---

## Docker Compose Patterns

### Common Service Patterns

#### PostgreSQL Database (All templates)

```yaml
db:
  image: postgres:15-alpine
  environment:
    POSTGRES_DB: app_db
    POSTGRES_USER: postgres
    POSTGRES_PASSWORD: postgres  # Change in production!
  ports:
    - "5432:5432"
  volumes:
    - postgres_data:/var/lib/postgresql/data
    - ./scripts/init.sql:/docker-entrypoint-initdb.d/init.sql
  healthcheck:
    test: ["CMD-SHELL", "pg_isready -U postgres -d app_db"]
    interval: 30s
    timeout: 10s
    retries: 3
```

**Key Features:**
- Named volume for data persistence
- Init script support via docker-entrypoint-initdb.d
- Health check with pg_isready
- Port exposure for local development

#### Redis Cache (All templates)

```yaml
redis:
  image: redis:7-alpine
  command: redis-server --appendonly yes --maxmemory 256mb --maxmemory-policy allkeys-lru
  ports:
    - "6379:6379"
  volumes:
    - redis_data:/data
  healthcheck:
    test: ["CMD", "redis-cli", "ping"]
    interval: 10s
    timeout: 3s
    retries: 3
```

**Key Features:**
- Persistence enabled (appendonly)
- Memory limits (maxmemory)
- LRU eviction policy
- Health check with redis-cli

#### Application Service Dependencies

**Pattern for proper startup order:**
```yaml
app:
  build: .
  depends_on:
    postgres:
      condition: service_healthy
    redis:
      condition: service_healthy
```

**Why**: Ensures database and Redis are ready before starting application.

---

### Advanced Docker Compose Patterns

#### 1. Profile-Based Services (Java template pattern)

Use profiles to enable optional services without starting them by default:

```yaml
pgadmin:
  image: dpage/pgadmin4:latest
  ports:
    - "5050:80"
  profiles:
    - development  # Only start with: docker compose --profile development up
```

**Common profiles:**
- `development`: Database admin tools, debugging tools
- `monitoring`: Prometheus, Grafana, Loki
- `production`: Production-specific services (nginx, load balancers)

#### 2. Security Hardening (Java template - best example)

```yaml
app:
  security_opt:
    - no-new-privileges:true  # Prevent privilege escalation
  cap_drop:
    - ALL  # Drop all Linux capabilities
  cap_add:
    - NET_BIND_SERVICE  # Add back only required capabilities
  tmpfs:
    - /tmp  # Mount /tmp as tmpfs (cleared on restart)
```

#### 3. Named Volumes and Networks

**Benefits:**
- Explicit naming for clarity
- Easier backup and migration
- Better organization

```yaml
volumes:
  postgres_data:
    name: my-app-postgres-data  # Explicit name
  redis_data:
    name: my-app-redis-data

networks:
  app-network:
    name: my-app-network
    driver: bridge
```

---

## Recommendations for Web Template (React + Nginx)

### Dockerfile Strategy

**Multi-stage build: Node.js builder → Nginx runtime**

**Stage 1: Build React App**
- Base: `node:18-alpine`
- Install dependencies: `npm ci --only=production`
- Build assets: `npm run build`
- Output: `dist/` directory with static files

**Stage 2: Serve with Nginx**
- Base: `nginx:alpine`
- Copy built files: `COPY --from=builder /app/dist /usr/share/nginx/html`
- Copy nginx config for SPA routing
- Add security headers
- Health check: `wget --spider http://localhost/`

### Docker Compose Strategy

**Simple setup (no backend initially):**
```yaml
services:
  web:
    build: .
    ports:
      - "80:80"
    environment:
      - VITE_API_URL=http://localhost:3000
```

**Optional: Add API service connection**
```yaml
  web:
    depends_on:
      - api
    environment:
      - VITE_API_URL=http://api:3000
```

### Nginx Configuration Needs

**Required:**
- SPA routing (fallback to index.html)
- Security headers (XSS protection, CSP, frame options)
- Gzip compression
- Static file caching

---

## Recommendations for API Template (Node.js + Express)

### Dockerfile Strategy

**Multi-stage build: Node.js builder → Node.js runtime (Alpine)**

**Stage 1: Build**
- Base: `node:18-alpine`
- Install dependencies: `npm ci --only=production`
- Build TypeScript: `npm run build`
- Output: `dist/` directory with compiled JavaScript

**Stage 2: Runtime**
- Base: `node:18-alpine`
- Create non-root user: `adduser -S nodejs`
- Copy dependencies and built files
- Health check: `node healthcheck.js`
- Start: `node dist/index.js`

### Docker Compose Strategy

**Full stack: API + PostgreSQL + Redis**

**Core services:**
1. **api**: Node.js application
2. **postgres**: Database with init scripts
3. **redis**: Cache and session storage

**Dependency management:**
```yaml
api:
  depends_on:
    postgres:
      condition: service_healthy
    redis:
      condition: service_healthy
```

**Environment configuration:**
- DATABASE_URL: PostgreSQL connection
- REDIS_URL: Redis connection
- JWT_SECRET: Authentication secret
- NODE_ENV: development/production

### Health Check Implementation

**Create `healthcheck.js`:**
```javascript
const http = require('http');

const options = {
  host: 'localhost',
  port: 3000,
  path: '/health',
  timeout: 2000
};

const request = http.request(options, (res) => {
  process.exit(res.statusCode === 200 ? 0 : 1);
});

request.on('error', () => process.exit(1));
request.end();
```

---

## Security Best Practices Summary

### ✅ DO:

1. **Use multi-stage builds** to keep runtime images small
2. **Run as non-root user** (create dedicated user)
3. **Use Alpine base images** for minimal attack surface
4. **Implement health checks** for all services
5. **Use named volumes** for data persistence
6. **Validate environment variables** at startup
7. **Use .dockerignore** to exclude unnecessary files
8. **Scan images for vulnerabilities** (Docker Scout, Trivy)
9. **Use explicit version tags** (not `latest`)
10. **Implement proper signal handling** for graceful shutdown

### ❌ DON'T:

1. ❌ Run containers as root
2. ❌ Include secrets in Dockerfile or image layers
3. ❌ Use `latest` tag in production
4. ❌ Copy unnecessary files (use .dockerignore)
5. ❌ Expose unnecessary ports
6. ❌ Run multiple processes in one container (use docker-compose)
7. ❌ Store persistent data in containers (use volumes)
8. ❌ Hardcode configuration (use environment variables)
9. ❌ Skip health checks
10. ❌ Use full OS images when Alpine is sufficient

---

## Build Optimization Tips

### 1. Minimize Layer Count

**Bad:**
```dockerfile
RUN apt-get update
RUN apt-get install -y package1
RUN apt-get install -y package2
```

**Good:**
```dockerfile
RUN apt-get update && \
    apt-get install -y package1 package2 && \
    rm -rf /var/lib/apt/lists/*
```

### 2. Order Dockerfile Instructions by Change Frequency

```dockerfile
# 1. Base image (changes rarely)
FROM node:18-alpine

# 2. System dependencies (changes rarely)
RUN apk add --no-cache curl

# 3. Application dependencies (changes occasionally)
COPY package*.json ./
RUN npm ci --only=production

# 4. Application code (changes frequently)
COPY . .

# 5. Build step (depends on code)
RUN npm run build
```

### 3. Use Build Cache Effectively

**Mount npm cache during build:**
```dockerfile
RUN --mount=type=cache,target=/root/.npm \
    npm ci --only=production
```

---

## Monitoring and Observability Patterns

### From Python Template (Most Comprehensive):

**Services:**
- **Prometheus**: Metrics collection
- **Grafana**: Metrics visualization
- **Loki**: Log aggregation

**Implementation:**
```yaml
prometheus:
  image: prom/prometheus:latest
  ports:
    - "9090:9090"
  volumes:
    - ./config/prometheus.yml:/etc/prometheus/prometheus.yml
    - prometheus_data:/prometheus
  profiles:
    - monitoring

grafana:
  image: grafana/grafana:latest
  ports:
    - "3000:3000"
  environment:
    GF_SECURITY_ADMIN_PASSWORD: admin
  depends_on:
    - prometheus
  profiles:
    - monitoring
```

**Usage:**
```bash
# Start with monitoring
docker compose --profile monitoring up -d

# Access Grafana: http://localhost:3000
# Access Prometheus: http://localhost:9090
```

---

## References to Existing Templates

### Python Template
- **Location**: `templates/python/Dockerfile`
- **Best for**: Learning comprehensive multi-stage builds
- **Key features**: Poetry dependency management, development stage, health checks
- **docker-compose**: Most comprehensive monitoring stack

### Java Template
- **Location**: `templates/java/Dockerfile`
- **Best for**: Learning enterprise security patterns
- **Key features**: JVM optimization, dumb-init, custom health check scripts
- **docker-compose**: Best security hardening examples

### Go Template
- **Location**: `templates/go/Dockerfile`
- **Best for**: Learning minimal container patterns
- **Key features**: Scratch-based runtime, static binary compilation
- **docker-compose**: Simplest, most efficient setup

---

## Additional Resources

### Official Documentation
- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)
- [Docker Security](https://docs.docker.com/engine/security/)
- [Multi-stage Builds](https://docs.docker.com/build/building/multi-stage/)
- [Health Checks](https://docs.docker.com/engine/reference/builder/#healthcheck)

### Security Scanning Tools
- [Docker Scout](https://docs.docker.com/scout/)
- [Trivy](https://github.com/aquasecurity/trivy)
- [Snyk Container](https://snyk.io/product/container-vulnerability-management/)

### Image Size Comparison
- **Full Ubuntu**: ~80MB
- **Debian Slim**: ~50MB
- **Alpine Linux**: ~5MB
- **Scratch (Go)**: ~10MB (binary only)

---

## Next Steps for Web and API Templates

### Phase 2.2: Web Template Implementation
1. Create multi-stage Dockerfile (Node.js → Nginx)
2. Create nginx.conf with SPA routing and security headers
3. Create docker-compose.yml (single service)
4. Update README.md with Docker deployment instructions

### Phase 2.3: API Template Implementation
1. Create multi-stage Dockerfile (Node.js → Node.js Alpine)
2. Create docker-compose.yml (api + postgres + redis)
3. Create init.sql for database initialization
4. Add /health endpoint to API
5. Create healthcheck.js for Docker health checks
6. Update README.md with Docker deployment instructions

---

**Last Updated**: 2025-01-18
**Status**: Phase 2.1 Complete - Ready for Phase 2.2 and 2.3 implementation
