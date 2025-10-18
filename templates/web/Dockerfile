# Stage 1: Build React application
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files for better caching
COPY package.json package-lock.json ./

# Install dependencies (all dependencies needed for build)
RUN npm ci --silent && \
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
