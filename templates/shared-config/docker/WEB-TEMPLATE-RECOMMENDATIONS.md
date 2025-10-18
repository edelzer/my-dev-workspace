# Web Template Docker Implementation Recommendations

**Phase 2.2 Implementation Guide**
**Template**: React + TypeScript + Vite
**Deployment Strategy**: Multi-stage build with Nginx

---

## Overview

The web template requires a Docker setup that:
1. Builds the React application with Vite
2. Serves static files through Nginx
3. Implements SPA routing (fallback to index.html)
4. Includes comprehensive security headers
5. Optimizes for production performance

---

## Recommended Dockerfile

### Multi-Stage Build Strategy

**Stage 1: Build React Application**
- Base image: `node:18-alpine`
- Build tool: Vite
- Output: Static files in `dist/` directory

**Stage 2: Serve with Nginx**
- Base image: `nginx:alpine`
- Runtime: Nginx web server
- Purpose: Serve static files with optimizations

### Complete Dockerfile

```dockerfile
# Stage 1: Build React application
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files for better caching
COPY package.json package-lock.json ./

# Install dependencies
RUN npm ci --only=production --silent && \
    npm cache clean --force

# Copy application source
COPY . .

# Build production bundle
RUN npm run build

# Verify build output exists
RUN test -d dist || (echo "Build failed: dist directory not found" && exit 1)

# Stage 2: Production image with Nginx
FROM nginx:alpine

# Install additional tools for health checks
RUN apk add --no-cache wget

# Remove default Nginx configuration
RUN rm /etc/nginx/conf.d/default.conf

# Copy custom Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY nginx-security.conf /etc/nginx/conf.d/security.conf

# Copy built application from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Create non-root user for Nginx
RUN addgroup -g 1001 -S nginx && \
    adduser -u 1001 -S nginx -G nginx && \
    chown -R nginx:nginx /var/cache/nginx && \
    chown -R nginx:nginx /var/log/nginx && \
    chown -R nginx:nginx /etc/nginx/conf.d && \
    chown -R nginx:nginx /usr/share/nginx/html && \
    touch /var/run/nginx.pid && \
    chown -R nginx:nginx /var/run/nginx.pid

# Switch to non-root user
USER nginx

# Expose HTTP port
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --quiet --tries=1 --spider http://localhost/ || exit 1

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
```

---

## Required Nginx Configuration Files

### 1. nginx.conf (Main Configuration)

**Location**: `templates/web/nginx.conf`

```nginx
# Nginx configuration for React SPA

# Upstream servers (if needed for API proxy)
# upstream api {
#     server api:3000;
# }

server {
    listen 80;
    server_name localhost;

    # Root directory for static files
    root /usr/share/nginx/html;
    index index.html;

    # Enable gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types
        text/plain
        text/css
        text/javascript
        application/javascript
        application/json
        application/x-javascript
        text/xml
        application/xml
        application/xml+rss
        image/svg+xml;

    # Security headers (loaded from security.conf)
    include /etc/nginx/conf.d/security.conf;

    # Cache static assets (JS, CSS, images)
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        access_log off;
    }

    # API proxy (if backend API is separate)
    # location /api/ {
    #     proxy_pass http://api/;
    #     proxy_http_version 1.1;
    #     proxy_set_header Upgrade $http_upgrade;
    #     proxy_set_header Connection 'upgrade';
    #     proxy_set_header Host $host;
    #     proxy_cache_bypass $http_upgrade;
    #     proxy_set_header X-Real-IP $remote_addr;
    #     proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    #     proxy_set_header X-Forwarded-Proto $scheme;
    # }

    # SPA routing - serve index.html for all routes
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Health check endpoint
    location /health {
        access_log off;
        return 200 "healthy\n";
        add_header Content-Type text/plain;
    }

    # Security: Deny access to hidden files
    location ~ /\. {
        deny all;
        access_log off;
        log_not_found off;
    }
}
```

### 2. nginx-security.conf (Security Headers)

**Location**: `templates/web/nginx-security.conf`

```nginx
# Security headers for Nginx

# Prevent clickjacking attacks
add_header X-Frame-Options "DENY" always;

# Prevent MIME type sniffing
add_header X-Content-Type-Options "nosniff" always;

# Enable XSS protection
add_header X-XSS-Protection "1; mode=block" always;

# Content Security Policy
add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self'; frame-ancestors 'none';" always;

# Referrer Policy
add_header Referrer-Policy "strict-origin-when-cross-origin" always;

# Permissions Policy (formerly Feature-Policy)
add_header Permissions-Policy "geolocation=(), microphone=(), camera=()" always;

# Strict Transport Security (HSTS) - uncomment for HTTPS
# add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;

# Remove Nginx version from headers
server_tokens off;
```

---

## Docker Compose Configuration

### Simple Setup (Web Only)

**Location**: `templates/web/docker-compose.yml`

```yaml
version: '3.8'

services:
  web:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: react-web-app
    ports:
      - "80:80"
    environment:
      # Vite environment variables (build-time)
      - VITE_APP_NAME=React Web App
      - VITE_API_URL=http://localhost:3000
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "wget", "--quiet", "--tries=1", "--spider", "http://localhost/health"]
      interval: 30s
      timeout: 3s
      retries: 3
      start_period: 10s
    networks:
      - web-network

networks:
  web-network:
    driver: bridge
```

### Advanced Setup (Web + API Integration)

```yaml
version: '3.8'

services:
  web:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: react-web-app
    ports:
      - "80:80"
    environment:
      - VITE_API_URL=http://api:3000
    depends_on:
      api:
        condition: service_healthy
    restart: unless-stopped
    networks:
      - web-network

  api:
    image: your-api-image:latest
    container_name: backend-api
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://postgres:password@postgres:5432/app_db
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
    networks:
      - web-network

networks:
  web-network:
    driver: bridge
```

---

## Required Files for Web Template

### 1. `.dockerignore`

Copy from `templates/shared-config/docker/.dockerignore.template`:

```bash
cp templates/shared-config/docker/.dockerignore.template templates/web/.dockerignore
```

### 2. Environment Configuration

**Create `.env.example`:**

```env
# Vite Environment Variables (build-time only)
VITE_APP_NAME=React Web App
VITE_API_URL=http://localhost:3000
VITE_ENVIRONMENT=production
```

**Note**: Vite environment variables are embedded at build time, not runtime!

---

## Build and Deployment Commands

### Local Development

```bash
# Build Docker image
docker build -t react-web-app:latest .

# Run container
docker run -d -p 80:80 --name web-app react-web-app:latest

# View logs
docker logs -f web-app

# Stop container
docker stop web-app && docker rm web-app
```

### Docker Compose

```bash
# Start services
docker compose up -d

# View logs
docker compose logs -f web

# Stop services
docker compose down

# Rebuild and restart
docker compose up -d --build
```

### Production Build

```bash
# Build with specific tag
docker build -t react-web-app:1.0.0 .

# Tag for registry
docker tag react-web-app:1.0.0 your-registry.com/react-web-app:1.0.0

# Push to registry
docker push your-registry.com/react-web-app:1.0.0
```

---

## Performance Optimizations

### 1. Build Time Optimizations

**Use BuildKit for faster builds:**
```bash
DOCKER_BUILDKIT=1 docker build -t react-web-app .
```

**Cache npm dependencies:**
```dockerfile
# In Dockerfile (already included)
COPY package.json package-lock.json ./
RUN npm ci --only=production  # This layer is cached
COPY . .  # Source changes don't invalidate dependency cache
```

### 2. Runtime Optimizations

**Nginx configuration includes:**
- ✅ Gzip compression for text files
- ✅ Static asset caching (1 year expiry)
- ✅ Access log disabled for static assets
- ✅ HTTP/2 support (when using HTTPS)

### 3. Image Size Optimization

**Expected image sizes:**
- Builder stage: ~500MB (Node.js + dependencies)
- Final image: ~25MB (Nginx + static files)

**Verify image size:**
```bash
docker images react-web-app
```

---

## Security Considerations

### 1. Non-Root User

✅ Implemented: Nginx runs as user `nginx` (UID 1001)

### 2. Security Headers

✅ Comprehensive security headers in `nginx-security.conf`:
- X-Frame-Options
- X-Content-Type-Options
- X-XSS-Protection
- Content-Security-Policy
- Referrer-Policy
- Permissions-Policy

### 3. Image Scanning

**Scan for vulnerabilities:**
```bash
# Docker Scout
docker scout cves react-web-app:latest

# Trivy
trivy image react-web-app:latest
```

---

## Health Checks

### Docker Health Check

Automatically enabled in Dockerfile:
```dockerfile
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --quiet --tries=1 --spider http://localhost/ || exit 1
```

### Nginx Health Endpoint

Included in `nginx.conf`:
```nginx
location /health {
    access_log off;
    return 200 "healthy\n";
    add_header Content-Type text/plain;
}
```

**Test health endpoint:**
```bash
curl http://localhost/health
```

---

## Troubleshooting

### Build Failures

**Issue**: Build fails at `npm run build`
**Solution**: Check Vite configuration, ensure all dependencies are installed

**Issue**: `dist` directory not found
**Solution**: Verify Vite output directory in `vite.config.ts`

### Runtime Issues

**Issue**: 404 errors on refresh
**Solution**: Ensure `try_files $uri $uri/ /index.html;` is in nginx.conf

**Issue**: Assets not loading
**Solution**: Check Content-Security-Policy in nginx-security.conf

**Issue**: API calls failing
**Solution**: Check CORS configuration, ensure API URL is correct

---

## Cloud Platform Deployment

### AWS (ECS/Fargate)

```bash
# Authenticate to ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin YOUR_ECR_URL

# Build and push
docker build -t react-web-app .
docker tag react-web-app:latest YOUR_ECR_URL/react-web-app:latest
docker push YOUR_ECR_URL/react-web-app:latest
```

### Google Cloud Run

```bash
# Build and push to GCR
gcloud builds submit --tag gcr.io/PROJECT_ID/react-web-app

# Deploy to Cloud Run
gcloud run deploy react-web-app \
  --image gcr.io/PROJECT_ID/react-web-app \
  --platform managed \
  --port 80 \
  --allow-unauthenticated
```

### Azure Container Apps

```bash
# Build and push to ACR
az acr build --registry YOUR_ACR --image react-web-app:latest .

# Deploy to Container Apps
az containerapp create \
  --name react-web-app \
  --resource-group YOUR_RG \
  --image YOUR_ACR.azurecr.io/react-web-app:latest \
  --target-port 80 \
  --ingress external
```

### DigitalOcean App Platform

```bash
# Push to DigitalOcean Container Registry
doctl registry login
docker tag react-web-app:latest registry.digitalocean.com/YOUR_REGISTRY/react-web-app:latest
docker push registry.digitalocean.com/YOUR_REGISTRY/react-web-app:latest
```

---

## README.md Updates Required

Add the following section to `templates/web/README.md`:

```markdown
## Docker Deployment

### Quick Start with Docker

1. **Build the Docker image:**
   ```bash
   docker build -t react-web-app .
   ```

2. **Run the container:**
   ```bash
   docker run -d -p 80:80 --name web-app react-web-app
   ```

3. **Access the application:**
   Open http://localhost in your browser

### Docker Compose

1. **Start all services:**
   ```bash
   docker compose up -d
   ```

2. **View logs:**
   ```bash
   docker compose logs -f
   ```

3. **Stop services:**
   ```bash
   docker compose down
   ```

### Production Deployment

See [DOCKER-GUIDE.md](../../docs/DOCKER-GUIDE.md) for comprehensive deployment guides for:
- AWS ECS/Fargate
- Google Cloud Run
- Azure Container Apps
- DigitalOcean App Platform
```

---

## Validation Checklist

Before completing Phase 2.2, verify:

- [ ] `templates/web/Dockerfile` builds successfully
- [ ] `templates/web/nginx.conf` configured correctly
- [ ] `templates/web/nginx-security.conf` has all security headers
- [ ] `templates/web/docker-compose.yml` works
- [ ] `templates/web/.dockerignore` copied from shared config
- [ ] Health check endpoint returns 200
- [ ] Static files served correctly
- [ ] SPA routing works (no 404 on refresh)
- [ ] Security headers present in responses
- [ ] README.md updated with Docker section
- [ ] Docker image size < 30MB

---

**Last Updated**: 2025-01-18
**Status**: Ready for Phase 2.2 implementation
**Next**: Implement Docker support for web template following this guide
