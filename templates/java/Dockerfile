# Multi-stage Dockerfile for Spring Boot Professional Template
# Security-hardened, production-ready container with minimal attack surface

# Build stage
FROM gradle:8.5-jdk17-alpine AS builder

# Set working directory
WORKDIR /app

# Copy dependency configuration first (for better layer caching)
COPY build.gradle settings.gradle gradle.properties ./
COPY gradle/ ./gradle/

# Download dependencies (cached layer if dependencies don't change)
RUN gradle dependencies --no-daemon

# Copy source code
COPY src/ ./src/

# Build application with security checks and tests
RUN gradle clean build -x test --no-daemon && \
    gradle jacocoTestReport --no-daemon && \
    gradle dependencyCheck --no-daemon

# Verify JAR file exists and is valid
RUN test -f build/libs/*.jar && \
    echo "Application JAR built successfully"

# Runtime stage - minimal JRE image
FROM eclipse-temurin:17-jre-alpine

# Install security updates and required packages
RUN apk update && \
    apk upgrade && \
    apk add --no-cache \
        curl \
        dumb-init \
        tzdata && \
    rm -rf /var/cache/apk/*

# Create non-root user for security
RUN addgroup -g 1001 -S spring && \
    adduser -u 1001 -S spring -G spring

# Set timezone (can be overridden with environment variable)
ENV TZ=UTC
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

# Create application directories
RUN mkdir -p /app/logs /app/config /app/uploads && \
    chown -R spring:spring /app

# Set working directory
WORKDIR /app

# Copy JAR from build stage
COPY --from=builder --chown=spring:spring /app/build/libs/*.jar app.jar

# Copy configuration files
COPY --chown=spring:spring docker/application-docker.yml /app/config/

# Set up health check script
COPY --chown=spring:spring docker/healthcheck.sh /app/
RUN chmod +x /app/healthcheck.sh

# Switch to non-root user
USER spring:spring

# JVM configuration for containers
ENV JAVA_OPTS="-XX:+UseG1GC \
               -XX:MaxRAMPercentage=75 \
               -XX:+UseStringDeduplication \
               -XX:+OptimizeStringConcat \
               -XX:+UseCompressedOops \
               -Djava.security.egd=file:/dev/./urandom \
               -Dspring.profiles.active=docker \
               -Dlogging.level.com.company.project=INFO"

# Application configuration
ENV SERVER_PORT=8080 \
    MANAGEMENT_PORT=8081 \
    SPRING_PROFILES_ACTIVE=docker

# Expose ports
EXPOSE 8080 8081

# Health check configuration
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD ./healthcheck.sh

# Volume for logs and uploads
VOLUME ["/app/logs", "/app/uploads"]

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Start application with security manager and optimized JVM settings
CMD ["sh", "-c", "exec java $JAVA_OPTS -jar app.jar"]

# Security labels
LABEL maintainer="Spring Boot Professional Template Team" \
      version="1.0.0" \
      description="Professional Spring Boot application with security-first architecture" \
      org.opencontainers.image.title="Spring Boot Professional Template" \
      org.opencontainers.image.description="Professional Spring Boot API with comprehensive security features" \
      org.opencontainers.image.version="1.0.0" \
      org.opencontainers.image.created="" \
      org.opencontainers.image.source="https://github.com/company/spring-boot-template" \
      org.opencontainers.image.licenses="MIT" \
      org.opencontainers.image.vendor="Company Name" \
      security.non-root="true" \
      security.minimal="true"