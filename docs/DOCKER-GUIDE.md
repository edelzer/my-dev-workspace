# Docker Deployment Guide

Complete guide to Docker deployment across all workspace templates with production-ready examples for AWS, GCP, Azure, and DigitalOcean.

## Table of Contents

1. [Why Docker?](#why-docker)
2. [Template-Specific Guides](#template-specific-guides)
   - [Web Template (React + Nginx)](#web-template-react--nginx)
   - [API Template (Node.js + Express)](#api-template-nodejs--express)
   - [Python Template (FastAPI)](#python-template-fastapi)
   - [Java Template (Spring Boot)](#java-template-spring-boot)
   - [Go Template (Gin Framework)](#go-template-gin-framework)
3. [Production Deployment](#production-deployment)
   - [AWS Elastic Container Service (ECS)](#aws-elastic-container-service-ecs)
   - [Google Cloud Run](#google-cloud-run)
   - [Azure Container Apps](#azure-container-apps)
   - [DigitalOcean App Platform](#digitalocean-app-platform)
4. [Security Best Practices](#security-best-practices)
5. [Troubleshooting](#troubleshooting)
6. [Development Workflow](#development-workflow)

---

## Why Docker?

### Development Benefits
- **Consistency**: "Works on my machine" becomes "Works everywhere"
- **Isolation**: Dependencies contained, no conflicts with host system
- **Reproducibility**: Identical environments across team members
- **Quick Setup**: New developers productive in minutes, not days

###Production Benefits
- **Portability**: Deploy to any cloud platform or on-premise
- **Scalability**: Horizontal scaling with container orchestration
- **Security**: Isolated processes, minimal attack surface
- **Resource Efficiency**: Better utilization than virtual machines

### Docker vs Traditional Deployment

| Aspect | Docker | Traditional |
|--------|--------|-------------|
| Setup Time | Minutes | Hours/Days |
| Environment Consistency | Guaranteed | Manual effort |
| Resource Usage | Minimal overhead | VM overhead |
| Deployment Speed | Seconds | Minutes |
| Rollback | Instant | Complex |
| Scaling | Automatic | Manual |

---

## Template-Specific Guides

### Web Template (React + Nginx)

**Architecture**: Multi-stage build (Node.js builder → nginx runtime)

**Image Size**: ~25MB (highly optimized)

**Key Features**:
- React + Vite build system
- Production-optimized nginx server
- Comprehensive security headers (CSP, X-Frame-Options, HSTS)
- SPA routing support
- Gzip compression for static assets
- 1-year caching for immutable files
- Health check endpoint

**Quick Start**:
```bash
# From templates/web directory
docker build -t my-web-app .
docker run -p 80:80 my-web-app

# With Docker Compose
docker compose up -d
```

**Build Process**:
1. **Builder stage**: Install deps, compile TypeScript, build with Vite
2. **Runtime stage**: Copy built assets to nginx, configure security
3. **Result**: Minimal image with only static files + nginx

**Environment Variables**:
```bash
# Build-time variables (Vite)
VITE_API_URL=https://api.example.com
VITE_APP_ENV=production
```

**Health Check**:
- Endpoint: `GET /health`
- Interval: 30 seconds
- Timeout: 3 seconds

**nginx Configuration Highlights**:
```nginx
# SPA routing
try_files $uri $uri/ /index.html;

# Security headers
add_header X-Frame-Options "DENY";
add_header Content-Security-Policy "default-src 'self'";
add_header X-Content-Type-Options "nosniff";

# Gzip compression
gzip on;
gzip_types text/plain text/css application/json application/javascript;
```

---

### API Template (Node.js + Express)

**Architecture**: Multi-stage build (Node.js builder → Node.js runtime) + PostgreSQL + Redis

**Image Size**: ~120-150MB

**Key Features**:
- Express.js with TypeScript
- Security middleware (Helmet, CORS, rate limiting)
- PostgreSQL 15 database with init schema
- Redis for caching/sessions
- Health check endpoint
- Multi-service orchestration
- Persistent data volumes

**Quick Start**:
```bash
# From templates/api directory
docker compose up -d

# View logs
docker compose logs -f api

# Stop all services
docker compose down
```

**Services**:
1. **API**: Express server on port 3000
2. **PostgreSQL**: Database on port 5432 (internal)
3. **Redis**: Cache on port 6379 (internal)

**Build Process**:
1. **Builder stage**: Install all deps, compile TypeScript
2. **Runtime stage**: Copy dist + production deps only
3. **Result**: Optimized image with compiled code

**Environment Variables**:
```bash
# Required
DATABASE_URL=postgresql://api:password@postgres:5432/api_db
REDIS_URL=redis://redis:6379
JWT_SECRET=your-secret-key-change-in-production
NODE_ENV=production

# Optional
PORT=3000
LOG_LEVEL=info
```

**Health Check**:
- Endpoint: `GET /health`
- Returns: `{status, timestamp, uptime, environment}`
- Interval: 30 seconds
- Timeout: 3 seconds

**Database Initialization**:
```sql
-- Automatic on first startup via init.sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Docker Compose Highlights**:
```yaml
services:
  api:
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    healthcheck:
      test: ["CMD", "node", "healthcheck.js"]
      interval: 30s
```

---

### Python Template (FastAPI)

**Architecture**: Multi-stage build (Python builder → Python runtime) with development variant

**Image Size**: ~150-200MB

**Key Features**:
- FastAPI with async support
- Poetry for dependency management
- Multi-stage: builder → production → development
- Non-root user security
- Health check at `/health/liveness`
- uvicorn ASGI server
- Optimized for production performance

**Quick Start**:
```bash
# Production build
docker build --target production -t my-api .
docker run -p 8000:8000 my-api

# Development build (with reload)
docker build --target development -t my-api-dev .
docker run -p 8000:8000 -v $(pwd):/app my-api-dev
```

**Build Stages**:
1. **Builder**: Install Poetry, download dependencies
2. **Production**: Copy installed packages, minimal runtime
3. **Development**: Full dev deps, hot reload enabled

**Environment Variables**:
```bash
ENVIRONMENT=production
DATABASE_URL=postgresql://user:pass@host:5432/db
REDIS_URL=redis://redis:6379
LOG_LEVEL=info
```

**Health Check**:
- Endpoint: `GET /health/liveness`
- Command: `curl -f http://localhost:8000/health/liveness`
- Interval: 30 seconds

**Security Features**:
- Non-root user: `appuser` (production), `devuser` (development)
- Dedicated directories: `/app/logs`, `/app/uploads`, `/app/tmp`
- Proper file permissions (755)
- Cleaned package cache

**uvicorn Configuration**:
```bash
# Production (from Dockerfile CMD)
uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 1

# Development
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload --log-level debug
```

---

### Java Template (Spring Boot)

**Architecture**: Multi-stage build (Gradle builder → JRE runtime)

**Image Size**: ~200-250MB

**Key Features**:
- Spring Boot with Gradle
- Security checks during build (dependency-check)
- JaCoCo test coverage reports
- Eclipse Temurin JRE (minimal runtime)
- Optimized JVM settings for containers
- dumb-init for proper signal handling
- Comprehensive health check script
- Management port separation (8080 app, 8081 actuator)

**Quick Start**:
```bash
# Build
docker build -t my-spring-app .

# Run
docker run -p 8080:8080 -p 8081:8081 my-spring-app

# With custom JVM opts
docker run -e JAVA_OPTS="-Xmx512m" -p 8080:8080 my-spring-app
```

**Build Process**:
1. **Builder stage**: Download deps, run tests, security checks, build JAR
2. **Runtime stage**: Copy JAR to JRE-only image
3. **Optimization**: Layer caching for Gradle dependencies

**JVM Optimization** (container-aware):
```bash
-XX:+UseG1GC                    # G1 garbage collector
-XX:MaxRAMPercentage=75         # Use 75% of container memory
-XX:+UseStringDeduplication     # Reduce memory usage
-XX:+UseCompressedOops          # Smaller object pointers
```

**Environment Variables**:
```bash
# JVM configuration
JAVA_OPTS="-XX:MaxRAMPercentage=75"

# Spring profiles
SPRING_PROFILES_ACTIVE=docker

# Ports
SERVER_PORT=8080
MANAGEMENT_PORT=8081

# Timezone
TZ=UTC
```

**Health Check**:
- Script: `healthcheck.sh` (custom script)
- Interval: 30 seconds
- Timeout: 10 seconds
- Start period: 60 seconds (allows for slow startup)

**Security Features**:
- Non-root user: `spring:spring` (UID/GID 1001)
- Security labels in Dockerfile
- dumb-init for zombie process handling
- Minimal JRE image (no build tools)

**Volumes**:
```yaml
# For logs and uploads
VOLUME ["/app/logs", "/app/uploads"]
```

---

### Go Template (Gin Framework)

**Architecture**: Multi-stage build (Go builder → scratch runtime)

**Image Size**: ~10-15MB (smallest of all templates!)

**Key Features**:
- Ultra-minimal scratch base image
- Static binary compilation (no dependencies)
- CGO disabled for portability
- Built-in health check command
- Optimized build flags for size
- CA certificates included
- Timezone data bundled
- Non-root user security

**Quick Start**:
```bash
# Build
docker build -t my-go-app .

# Run
docker run -p 8080:8080 my-go-app
```

**Build Process**:
1. **Builder stage**: Download modules, verify, compile static binary
2. **Runtime stage**: Copy binary to scratch (empty base)
3. **Optimization**: ldflags for size reduction (`-w -s -extldflags "-static"`)

**Build Flags Explained**:
```bash
CGO_ENABLED=0                    # Pure Go, no C dependencies
GOOS=linux GOARCH=amd64          # Target platform
-ldflags='-w -s -extldflags "-static"'
  -w: Omit DWARF symbol table     # Reduce size
  -s: Omit symbol table           # Reduce size
  -extldflags "-static"           # Static linking
-a -installsuffix cgo             # Rebuild all packages
```

**Why Scratch Base?**
- **Smallest possible**: Only contains your binary
- **Most secure**: No OS, no shell, minimal attack surface
- **Fastest**: Near-instant startup
- **Trade-off**: No debugging tools in container

**Included from Builder**:
```dockerfile
COPY --from=builder /etc/ssl/certs/ca-certificates.crt  # HTTPS support
COPY --from=builder /usr/share/zoneinfo                  # Timezone support
COPY --from=builder /etc/passwd                          # User info
```

**Environment Variables**:
```bash
PORT=8080
GIN_MODE=release
LOG_LEVEL=info
```

**Health Check**:
- Command: `/app healthcheck` (binary includes health check)
- Interval: 30 seconds
- Timeout: 3 seconds
- Start period: 5 seconds (Go starts fast!)

**Security Features**:
- Non-root user: `appuser`
- No shell (scratch = no attack surface)
- Static binary (no dynamic library vulnerabilities)
- Minimal dependencies

**Image Size Comparison**:
| Template | Base Image | Final Size |
|----------|-----------|------------|
| Go | scratch | ~10-15MB |
| Web | nginx:alpine | ~25MB |
| API | node:18-alpine | ~120-150MB |
| Python | python:3.11-slim | ~150-200MB |
| Java | eclipse-temurin:17-jre-alpine | ~200-250MB |

---

## Production Deployment

### AWS Elastic Container Service (ECS)

**Prerequisites**:
```bash
# Install AWS CLI
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install

# Configure credentials
aws configure
```

**Step 1: Create ECR Repository**:
```bash
# Create repository
aws ecr create-repository \
  --repository-name my-app \
  --region us-east-1

# Get login command
aws ecr get-login-password --region us-east-1 | \
  docker login --username AWS --password-stdin \
  123456789012.dkr.ecr.us-east-1.amazonaws.com
```

**Step 2: Build and Push**:
```bash
# Build for production
docker build -t my-app:latest .

# Tag for ECR
docker tag my-app:latest \
  123456789012.dkr.ecr.us-east-1.amazonaws.com/my-app:latest

# Push to ECR
docker push 123456789012.dkr.ecr.us-east-1.amazonaws.com/my-app:latest
```

**Step 3: Create ECS Cluster**:
```bash
# Create cluster (Fargate)
aws ecs create-cluster \
  --cluster-name my-app-cluster \
  --region us-east-1
```

**Step 4: Create Task Definition** (`task-definition.json`):
```json
{
  "family": "my-app-task",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "256",
  "memory": "512",
  "containerDefinitions": [
    {
      "name": "my-app",
      "image": "123456789012.dkr.ecr.us-east-1.amazonaws.com/my-app:latest",
      "portMappings": [
        {
          "containerPort": 80,
          "protocol": "tcp"
        }
      ],
      "environment": [
        {"name": "NODE_ENV", "value": "production"}
      ],
      "secrets": [
        {
          "name": "DATABASE_URL",
          "valueFrom": "arn:aws:secretsmanager:us-east-1:123456789012:secret:db-url-abc123"
        }
      ],
      "healthCheck": {
        "command": ["CMD-SHELL", "wget --spider http://localhost/health || exit 1"],
        "interval": 30,
        "timeout": 5,
        "retries": 3,
        "startPeriod": 60
      },
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/my-app",
          "awslogs-region": "us-east-1",
          "awslogs-stream-prefix": "ecs"
        }
      }
    }
  ]
}
```

**Step 5: Register Task Definition**:
```bash
aws ecs register-task-definition \
  --cli-input-json file://task-definition.json
```

**Step 6: Create Service with Load Balancer**:
```bash
aws ecs create-service \
  --cluster my-app-cluster \
  --service-name my-app-service \
  --task-definition my-app-task \
  --desired-count 2 \
  --launch-type FARGATE \
  --network-configuration "awsvpcConfiguration={subnets=[subnet-12345,subnet-67890],securityGroups=[sg-12345],assignPublicIp=ENABLED}" \
  --load-balancers "targetGroupArn=arn:aws:elasticloadbalancing:us-east-1:123456789012:targetgroup/my-app-tg/1234567890,containerName=my-app,containerPort=80"
```

**Environment Variables via Secrets Manager**:
```bash
# Create secret
aws secretsmanager create-secret \
  --name db-url \
  --secret-string "postgresql://user:pass@host:5432/db"

# Reference in task definition (see secrets section above)
```

---

### Google Cloud Run

**Prerequisites**:
```bash
# Install gcloud CLI
curl https://sdk.cloud.google.com | bash
exec -l $SHELL
gcloud init

# Enable APIs
gcloud services enable run.googleapis.com
gcloud services enable containerregistry.googleapis.com
```

**Step 1: Configure Docker for GCR**:
```bash
gcloud auth configure-docker
```

**Step 2: Build and Push**:
```bash
# Set project
export PROJECT_ID=$(gcloud config get-value project)

# Build
docker build -t gcr.io/$PROJECT_ID/my-app:latest .

# Push
docker push gcr.io/$PROJECT_ID/my-app:latest
```

**Step 3: Deploy to Cloud Run**:
```bash
gcloud run deploy my-app \
  --image gcr.io/$PROJECT_ID/my-app:latest \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --port 80 \
  --memory 512Mi \
  --cpu 1 \
  --max-instances 10 \
  --set-env-vars NODE_ENV=production \
  --set-secrets DATABASE_URL=db-url:latest
```

**Environment Variables**:
```bash
# Set individual variables
gcloud run services update my-app \
  --set-env-vars NODE_ENV=production,LOG_LEVEL=info

# Set from file
gcloud run services update my-app \
  --env-vars-file .env.yaml
```

**Secrets via Secret Manager**:
```bash
# Create secret
echo -n "postgresql://user:pass@host:5432/db" | \
  gcloud secrets create db-url --data-file=-

# Grant access
gcloud secrets add-iam-policy-binding db-url \
  --member=serviceAccount:my-app@$PROJECT_ID.iam.gserviceaccount.com \
  --role=roles/secretmanager.secretAccessor

# Use in deployment (see --set-secrets above)
```

**Custom Domain**:
```bash
# Map domain
gcloud run domain-mappings create \
  --service my-app \
  --domain my-app.example.com \
  --region us-central1
```

---

### Azure Container Apps

**Prerequisites**:
```bash
# Install Azure CLI
curl -sL https://aka.ms/InstallAzureCLIDeb | sudo bash

# Login
az login

# Install Container Apps extension
az extension add --name containerapp --upgrade
```

**Step 1: Create Resource Group**:
```bash
az group create \
  --name my-app-rg \
  --location eastus
```

**Step 2: Create Container Registry**:
```bash
# Create ACR
az acr create \
  --resource-group my-app-rg \
  --name myappregistry \
  --sku Basic

# Login
az acr login --name myappregistry
```

**Step 3: Build and Push**:
```bash
# Build and push in one command (using ACR build)
az acr build \
  --registry myappregistry \
  --image my-app:latest \
  .

# Or tag and push locally built image
docker tag my-app:latest myappregistry.azurecr.io/my-app:latest
docker push myappregistry.azurecr.io/my-app:latest
```

**Step 4: Create Container App Environment**:
```bash
az containerapp env create \
  --name my-app-env \
  --resource-group my-app-rg \
  --location eastus
```

**Step 5: Deploy Container App**:
```bash
az containerapp create \
  --name my-app \
  --resource-group my-app-rg \
  --environment my-app-env \
  --image myappregistry.azurecr.io/my-app:latest \
  --target-port 80 \
  --ingress external \
  --registry-server myappregistry.azurecr.io \
  --cpu 0.5 --memory 1.0Gi \
  --min-replicas 1 --max-replicas 10 \
  --env-vars NODE_ENV=production
```

**Environment Variables**:
```bash
# Update environment variables
az containerapp update \
  --name my-app \
  --resource-group my-app-rg \
  --set-env-vars NODE_ENV=production LOG_LEVEL=info
```

**Secrets via Key Vault**:
```bash
# Create Key Vault
az keyvault create \
  --name my-app-vault \
  --resource-group my-app-rg \
  --location eastus

# Add secret
az keyvault secret set \
  --vault-name my-app-vault \
  --name db-url \
  --value "postgresql://user:pass@host:5432/db"

# Enable managed identity for Container App
az containerapp identity assign \
  --name my-app \
  --resource-group my-app-rg \
  --system-assigned

# Grant access (replace with actual principal ID)
az keyvault set-policy \
  --name my-app-vault \
  --object-id <principal-id> \
  --secret-permissions get list
```

**Custom Domain**:
```bash
az containerapp hostname add \
  --name my-app \
  --resource-group my-app-rg \
  --hostname my-app.example.com
```

---

### DigitalOcean App Platform

**Prerequisites**:
```bash
# Install doctl
wget https://github.com/digitalocean/doctl/releases/download/v1.98.0/doctl-1.98.0-linux-amd64.tar.gz
tar xf doctl-1.98.0-linux-amd64.tar.gz
sudo mv doctl /usr/local/bin

# Authenticate
doctl auth init
```

**Step 1: Create Container Registry**:
```bash
# Create registry
doctl registry create my-app-registry

# Login
doctl registry login
```

**Step 2: Build and Push**:
```bash
# Tag for DigitalOcean registry
docker tag my-app:latest registry.digitalocean.com/my-app-registry/my-app:latest

# Push
docker push registry.digitalocean.com/my-app-registry/my-app:latest
```

**Step 3: Create App Spec** (`app.yaml`):
```yaml
name: my-app
services:
  - name: web
    image:
      registry_type: DOCR
      repository: my-app
      tag: latest
    instance_count: 2
    instance_size_slug: basic-xxs
    http_port: 80
    health_check:
      http_path: /health
      initial_delay_seconds: 30
      period_seconds: 30
      timeout_seconds: 5
      success_threshold: 1
      failure_threshold: 3
    envs:
      - key: NODE_ENV
        value: production
      - key: DATABASE_URL
        value: ${db.DATABASE_URL}  # Reference managed database
        type: SECRET
    routes:
      - path: /
databases:
  - name: db
    engine: PG
    version: "15"
    size: db-s-1vcpu-1gb
```

**Step 4: Deploy**:
```bash
# Deploy from spec
doctl apps create --spec app.yaml

# Or deploy directly
doctl apps create \
  --spec - << EOF
{
  "name": "my-app",
  "services": [{
    "name": "web",
    "image": {
      "registry_type": "DOCR",
      "repository": "my-app",
      "tag": "latest"
    },
    "http_port": 80,
    "instance_count": 2,
    "instance_size_slug": "basic-xxs"
  }]
}
EOF
```

**Environment Variables**:
```bash
# Get app ID
APP_ID=$(doctl apps list --format ID --no-header)

# Update environment variables
doctl apps update $APP_ID --spec app.yaml
```

**Custom Domain**:
```bash
# Add domain to app
doctl apps update $APP_ID --spec - << EOF
{
  "domains": [{
    "domain": "my-app.example.com",
    "type": "PRIMARY"
  }]
}
EOF
```

---

## Security Best Practices

### Multi-Stage Builds

**Why Multi-Stage Builds Matter**:
- Reduce final image size by 50-90%
- Remove build tools from production image
- Minimize attack surface
- Faster deployments and pulls

**Pattern (Node.js example)**:
```dockerfile
# Builder stage (large, has build tools)
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Runtime stage (small, production-only)
FROM node:18-alpine AS runtime
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
CMD ["node", "dist/index.js"]
```

**Size Comparison**:
- Builder stage: ~400MB (includes dev deps, source, build artifacts)
- Runtime stage: ~120MB (only production deps + compiled code)
- **Savings**: 70% reduction

---

### Non-Root Users

**Security Implications**:
- Root in container = root on host (with escape vulnerabilities)
- Principle of least privilege
- Compliance requirements (PCI-DSS, SOC 2)

**All Templates Implement Non-Root**:
```dockerfile
# Web/API (Node.js)
RUN addgroup -g 1001 nodejs && adduser -u 1001 -G nodejs nodejs
USER nodejs:nodejs

# Python
RUN groupadd -r appuser && useradd -r -g appuser appuser
USER appuser

# Java
RUN addgroup -g 1001 -S spring && adduser -u 1001 -S spring -G spring
USER spring:spring

# Go
RUN adduser -D -g '' appuser
USER appuser
```

**UID/GID Best Practices**:
- Use explicit UID/GID (not just username)
- Avoid UID 0 (root)
- Use high UID (1000+) to avoid conflicts
- Consistent across all templates

---

### Base Image Selection

**Why Alpine Linux?**:
- **Minimal**: ~5MB base (vs ~100MB for Debian)
- **Secure**: Smaller attack surface, fewer vulnerabilities
- **Fast**: Quicker pulls, faster scaling
- **musl libc**: Lighter than glibc

**Image Size Comparison**:
| Base Image | Size | Use Case |
|------------|------|----------|
| alpine:3.18 | ~5MB | Production (most templates) |
| debian:bookworm-slim | ~100MB | Compatibility needs |
| ubuntu:22.04 | ~77MB | Enterprise standards |
| scratch | 0MB | Go static binaries only |

**When NOT to Use Alpine**:
- Need glibc-specific binaries
- Complex native dependencies
- Python scientific libraries (numpy issues)
→ Use debian:bookworm-slim instead

---

### Vulnerability Scanning

**Docker Scan (Built-in)**:
```bash
# Scan image
docker scan my-app:latest

# Scan with severity threshold
docker scan --severity=high my-app:latest

# Accept risk for specific CVE
docker scan --accept=CVE-2023-1234 my-app:latest
```

**Snyk Integration**:
```bash
# Install Snyk
npm install -g snyk

# Authenticate
snyk auth

# Scan Docker image
snyk container test my-app:latest

# Monitor in Snyk dashboard
snyk container monitor my-app:latest
```

**Trivy Scanning**:
```bash
# Install Trivy
wget -qO - https://aquasecurity.github.io/trivy-repo/deb/public.key | sudo apt-key add -
echo "deb https://aquasecurity.github.io/trivy-repo/deb $(lsb_release -sc) main" | sudo tee -a /etc/apt/sources.list.d/trivy.list
sudo apt-get update && sudo apt-get install trivy

# Scan image
trivy image my-app:latest

# Critical vulnerabilities only
trivy image --severity CRITICAL my-app:latest

# Export report
trivy image --format json --output report.json my-app:latest
```

**CI/CD Integration (GitHub Actions)**:
```yaml
name: Security Scan

on: [push]

jobs:
  scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Build image
        run: docker build -t my-app:${{ github.sha }} .

      - name: Run Trivy scan
        uses: aquasecurity/trivy-action@master
        with:
          image-ref: my-app:${{ github.sha }}
          severity: 'CRITICAL,HIGH'
          exit-code: '1'  # Fail on vulnerabilities
```

---

### Secrets Management

**❌ NEVER Do This**:
```dockerfile
# WRONG - hardcoded secrets
ENV DATABASE_URL=postgresql://user:password123@db:5432/mydb
ENV API_KEY=sk_live_abc123xyz789

# WRONG - secrets in build args
ARG API_KEY=sk_live_abc123xyz789
```

**✅ Use Environment Variables**:
```bash
# Pass at runtime
docker run -e DATABASE_URL=$DATABASE_URL my-app

# From .env file (development only)
docker run --env-file .env my-app
```

**✅ Cloud Secret Managers**:

**AWS Secrets Manager**:
```json
{
  "secrets": [
    {
      "name": "DATABASE_URL",
      "valueFrom": "arn:aws:secretsmanager:region:account:secret:db-url-abc123"
    }
  ]
}
```

**GCP Secret Manager**:
```bash
gcloud run deploy my-app \
  --set-secrets DATABASE_URL=db-url:latest
```

**Azure Key Vault**:
```bash
az containerapp update \
  --set-env-vars DATABASE_URL=secretref:db-url
```

**Docker Compose (Development)**:
```yaml
services:
  api:
    environment:
      - DATABASE_URL=${DATABASE_URL}  # From host env
    # NOT from .env file in git!
```

**.dockerignore for Secrets**:
```
.env
.env.local
.env.production
*.key
*.pem
credentials.json
secrets/
```

---

## Troubleshooting

### Build Issues

**Problem: npm ci fails with ENOENT**
```
npm ERR! enoent ENOENT: no such file or directory, open '/app/package.json'
```
**Solution**: Check COPY order in Dockerfile
```dockerfile
# Correct order
COPY package*.json ./
RUN npm ci
COPY . .
```

**Problem: Permission denied errors**
```
Error: EACCES: permission denied, mkdir '/app/dist'
```
**Solution**: Set proper permissions before switching users
```dockerfile
RUN mkdir -p /app/dist && chown -R nodejs:nodejs /app
USER nodejs
```

**Problem: Out of disk space**
```
Error: no space left on device
```
**Solution**: Clean up Docker
```bash
# Remove unused images
docker image prune -a

# Remove build cache
docker builder prune

# Remove everything (careful!)
docker system prune -a --volumes
```

**Problem: Platform-specific build issues (M1/M2 Macs)**
```
WARNING: The requested image's platform (linux/amd64) does not match the detected host platform (linux/arm64/v8)
```
**Solution**: Build for specific platform
```bash
# Build for linux/amd64 (production)
docker buildx build --platform linux/amd64 -t my-app .

# Multi-platform build
docker buildx build --platform linux/amd64,linux/arm64 -t my-app .
```

---

### Runtime Issues

**Problem: Container exits immediately**
```
docker run my-app
(exits with code 0 or 1)
```
**Solution**: Check logs and entry point
```bash
# View logs
docker logs container-name

# Run with interactive shell
docker run -it --entrypoint /bin/sh my-app

# Check CMD/ENTRYPOINT
docker inspect my-app | grep -A5 Cmd
```

**Problem: Health checks failing**
```
Unhealthy: Health check failed
```
**Solution**: Debug health check
```bash
# Check health status
docker inspect --format='{{.State.Health.Status}}' container-name

# View health check logs
docker inspect --format='{{json .State.Health}}' container-name | jq

# Test health check manually
docker exec container-name wget --spider http://localhost/health
```

**Problem: Database connection errors**
```
Error: connect ECONNREFUSED 127.0.0.1:5432
```
**Solution**: Check service dependencies and networking
```bash
# In docker-compose, ensure depends_on with health checks
services:
  api:
    depends_on:
      postgres:
        condition: service_healthy

# Check network connectivity
docker exec api ping postgres
docker exec api curl postgres:5432
```

**Problem: Port already in use**
```
Error: bind: address already in use
```
**Solution**: Find and kill process or use different port
```bash
# Find process using port
lsof -i :3000
netstat -tulpn | grep :3000

# Kill process
kill -9 <PID>

# Or use different port
docker run -p 3001:3000 my-app
```

---

### Networking Issues

**Problem: Service discovery fails in docker-compose**
```
Error: getaddrinfo ENOTFOUND postgres
```
**Solution**: Use service names as hostnames
```yaml
services:
  api:
    environment:
      # Use service name, not localhost
      DATABASE_URL: postgresql://user:pass@postgres:5432/db

  postgres:
    # Service name becomes hostname
```

**Problem: Can't access container from host**
```
curl: (7) Failed to connect to localhost port 3000
```
**Solution**: Check port mapping
```bash
# Correct port mapping: host:container
docker run -p 3000:3000 my-app

# Verify ports
docker port container-name
```

**Problem: Containers can't communicate**
```
Error: connect ETIMEDOUT
```
**Solution**: Check network configuration
```bash
# Verify network
docker network ls
docker network inspect bridge

# Containers must be on same network
docker network create my-network
docker run --network my-network api
docker run --network my-network db
```

---

### Performance Issues

**Problem: Slow build times**
**Solution**: Optimize layer caching
```dockerfile
# Bad - invalidates cache on any file change
COPY . .
RUN npm install

# Good - cache dependencies separately
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
```

**Problem: Large image sizes**
**Solution**: Multi-stage builds + .dockerignore
```dockerfile
# Multi-stage
FROM node:18-alpine AS builder
# ... build steps
FROM node:18-alpine AS runtime
COPY --from=builder /app/dist ./dist  # Only copy what's needed
```

```
# .dockerignore
node_modules
.git
*.md
test/
```

**Problem: Container resource exhaustion**
```
Error: JavaScript heap out of memory
```
**Solution**: Set resource limits
```bash
# Increase memory limit
docker run --memory=2g --memory-swap=2g my-app

# In docker-compose
services:
  api:
    deploy:
      resources:
        limits:
          memory: 2G
          cpus: '1.0'
```

**Problem: Slow volume mounts (Windows/Mac)**
**Solution**: Use delegated consistency
```yaml
services:
  app:
    volumes:
      - ./src:/app/src:delegated  # Faster on Mac/Windows
```

---

## Development Workflow

### Local Development with Docker

**Hot Reload with Volume Mounts**:
```yaml
# docker-compose.dev.yml
services:
  web:
    build:
      context: .
      target: development  # If using multi-stage
    volumes:
      - ./src:/app/src:delegated
      - /app/node_modules  # Don't override node_modules
    environment:
      - NODE_ENV=development
    command: npm run dev  # Override CMD for dev server
```

**Usage**:
```bash
docker-compose -f docker-compose.dev.yml up
```

**Debugging in Containers**:
```yaml
# Expose debug port
services:
  api:
    ports:
      - "3000:3000"
      - "9229:9229"  # Node.js debugger
    command: node --inspect=0.0.0.0:9229 dist/index.js
```

**VS Code Debug Configuration** (`.vscode/launch.json`):
```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "attach",
      "name": "Docker: Attach to Node",
      "remoteRoot": "/app",
      "localRoot": "${workspaceFolder}",
      "protocol": "inspector",
      "port": 9229,
      "restart": true,
      "sourceMaps": true
    }
  ]
}
```

---

### CI/CD Integration

**GitHub Actions**:
```yaml
name: Build and Deploy

on:
  push:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v2

      - name: Login to DockerHub
        uses: docker/login-action@v2
        with:
          username: ${{ secrets.DOCKERHUB_USERNAME }}
          password: ${{ secrets.DOCKERHUB_TOKEN }}

      - name: Build and push
        uses: docker/build-push-action@v4
        with:
          context: .
          push: true
          tags: myorg/my-app:latest,myorg/my-app:${{ github.sha }}
          cache-from: type=registry,ref=myorg/my-app:buildcache
          cache-to: type=registry,ref=myorg/my-app:buildcache,mode=max
```

**GitLab CI**:
```yaml
# .gitlab-ci.yml
build:
  image: docker:latest
  services:
    - docker:dind
  before_script:
    - docker login -u $CI_REGISTRY_USER -p $CI_REGISTRY_PASSWORD $CI_REGISTRY
  script:
    - docker build -t $CI_REGISTRY_IMAGE:$CI_COMMIT_SHA .
    - docker push $CI_REGISTRY_IMAGE:$CI_COMMIT_SHA
  only:
    - main
```

**Build Caching Strategies**:
```yaml
# GitHub Actions with layer caching
- name: Build with cache
  uses: docker/build-push-action@v4
  with:
    cache-from: type=gha
    cache-to: type=gha,mode=max
```

---

### Docker Compose Tips

**Service Dependencies with Health Checks**:
```yaml
services:
  api:
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy

  postgres:
    healthcheck:
      test: ["CMD", "pg_isready", "-U", "postgres"]
      interval: 5s
      timeout: 3s
      retries: 5

  redis:
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 5s
      timeout: 3s
      retries: 5
```

**Volume Management**:
```yaml
services:
  postgres:
    volumes:
      - postgres_data:/var/lib/postgresql/data  # Named volume (persistent)
      - ./init.sql:/docker-entrypoint-initdb.d/init.sql  # Bind mount (init script)

volumes:
  postgres_data:  # Define named volume
    driver: local
```

**Network Isolation**:
```yaml
services:
  web:
    networks:
      - frontend

  api:
    networks:
      - frontend
      - backend

  db:
    networks:
      - backend  # Not exposed to web

networks:
  frontend:
  backend:
```

**Environment-Specific Compose Files**:
```bash
# Base configuration
docker-compose.yml

# Development overrides
docker-compose.dev.yml

# Production overrides
docker-compose.prod.yml

# Use development config
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up

# Use production config
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up
```

---

## Quick Reference

### Common Commands

```bash
# Build
docker build -t my-app .
docker build --no-cache -t my-app .

# Run
docker run -p 3000:3000 my-app
docker run -d --name my-app-container my-app

# Logs
docker logs my-app-container
docker logs -f my-app-container  # Follow

# Execute commands
docker exec -it my-app-container sh
docker exec my-app-container ls /app

# Inspect
docker inspect my-app-container
docker ps
docker ps -a

# Clean up
docker stop my-app-container
docker rm my-app-container
docker rmi my-app
docker system prune -a
```

### Docker Compose Commands

```bash
# Start
docker compose up
docker compose up -d  # Detached

# Stop
docker compose down
docker compose down -v  # Remove volumes

# Logs
docker compose logs
docker compose logs -f api  # Follow specific service

# Rebuild
docker compose build
docker compose up --build

# Execute
docker compose exec api sh
docker compose exec postgres psql -U postgres

# Validate
docker compose config
```

---

## Summary

**All 5 templates are production-ready with Docker**:
- ✅ **Web**: React + Nginx (~25MB, security headers, SPA routing)
- ✅ **API**: Node.js + Express + PostgreSQL + Redis (~120MB, multi-service)
- ✅ **Python**: FastAPI + Poetry (~150MB, async, multi-stage)
- ✅ **Java**: Spring Boot + Gradle (~200MB, JVM-optimized, health checks)
- ✅ **Go**: Gin + static binary (~10MB, scratch base, fastest)

**Deploy anywhere**:
- AWS ECS (Fargate or EC2)
- Google Cloud Run (serverless containers)
- Azure Container Apps
- DigitalOcean App Platform
- Any Kubernetes cluster

**Security built-in**:
- Multi-stage builds (minimize attack surface)
- Non-root users (all templates)
- Alpine Linux (minimal base images)
- Vulnerability scanning (Docker scan, Snyk, Trivy)
- Secrets management (cloud providers)

**Ready for production in < 10 minutes** ✨

---

**For template-specific details, see**:
- [`templates/web/README.md`](../templates/web/README.md)
- [`templates/api/README.md`](../templates/api/README.md)
- [`templates/python/README.md`](../templates/python/README.md)
- [`templates/java/README.md`](../templates/java/README.md)
- [`templates/go/README.md`](../templates/go/README.md)
