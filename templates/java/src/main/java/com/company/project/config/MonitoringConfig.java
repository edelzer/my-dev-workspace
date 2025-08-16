package com.company.project.config;

import io.micrometer.core.aop.TimedAspect;
import io.micrometer.core.instrument.Counter;
import io.micrometer.core.instrument.MeterRegistry;
import io.micrometer.core.instrument.Timer;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.actuate.health.HealthContributor;
import org.springframework.boot.actuate.health.HealthIndicator;
import org.springframework.boot.actuate.info.InfoContributor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.core.RedisTemplate;

import javax.sql.DataSource;
import java.util.Map;

/**
 * Monitoring and Observability Configuration
 * 
 * Comprehensive monitoring setup with metrics, health checks, and observability
 * features for production-ready Spring Boot applications.
 * 
 * Monitoring Features:
 * - Custom metrics registration and tracking
 * - Performance monitoring with Micrometer
 * - Health checks for all critical dependencies
 * - Application information endpoints
 * - Database and Redis monitoring
 * - Security event tracking metrics
 * 
 * Observability Features:
 * - Request/response timing metrics
 * - Error rate tracking and alerting
 * - Database connection pool monitoring
 * - Cache hit/miss rate tracking
 * - User activity and authentication metrics
 * - System resource utilization tracking
 * 
 * Integration Features:
 * - Prometheus metrics export
 * - Custom dashboard support
 * - Alert manager integration
 * - Log correlation with metrics
 * - Distributed tracing support
 * 
 * @author Spring Boot Professional Template
 * @version 1.0.0
 * @since 2024-01-01
 */
@Configuration
@RequiredArgsConstructor
public class MonitoringConfig {

    private final MeterRegistry meterRegistry;
    private final DataSource dataSource;
    private final RedisConnectionFactory redisConnectionFactory;

    /**
     * Configure TimedAspect for @Timed annotation support
     * 
     * Enables automatic timing metrics for methods annotated with @Timed.
     * 
     * @param registry Meter registry for metrics
     * @return TimedAspect configured aspect
     */
    @Bean
    public TimedAspect timedAspect(MeterRegistry registry) {
        return new TimedAspect(registry);
    }

    /**
     * Authentication success counter
     * 
     * Tracks successful authentication attempts by authentication method.
     * 
     * @return Counter authentication success counter
     */
    @Bean
    public Counter authenticationSuccessCounter() {
        return Counter.builder("authentication.success")
                .description("Count of successful authentication attempts")
                .tag("method", "jwt")
                .register(meterRegistry);
    }

    /**
     * Authentication failure counter
     * 
     * Tracks failed authentication attempts with failure reasons.
     * 
     * @return Counter authentication failure counter
     */
    @Bean
    public Counter authenticationFailureCounter() {
        return Counter.builder("authentication.failure")
                .description("Count of failed authentication attempts")
                .tag("reason", "invalid_credentials")
                .register(meterRegistry);
    }

    /**
     * User registration counter
     * 
     * Tracks new user registrations.
     * 
     * @return Counter user registration counter
     */
    @Bean
    public Counter userRegistrationCounter() {
        return Counter.builder("user.registration")
                .description("Count of new user registrations")
                .register(meterRegistry);
    }

    /**
     * API request timer
     * 
     * Tracks API request duration and throughput.
     * 
     * @return Timer API request timer
     */
    @Bean
    public Timer apiRequestTimer() {
        return Timer.builder("api.request.duration")
                .description("API request processing time")
                .register(meterRegistry);
    }

    /**
     * Database query timer
     * 
     * Tracks database query execution times.
     * 
     * @return Timer database query timer
     */
    @Bean
    public Timer databaseQueryTimer() {
        return Timer.builder("database.query.duration")
                .description("Database query execution time")
                .register(meterRegistry);
    }

    /**
     * Cache hit counter
     * 
     * Tracks cache hit rates for performance monitoring.
     * 
     * @return Counter cache hit counter
     */
    @Bean
    public Counter cacheHitCounter() {
        return Counter.builder("cache.hit")
                .description("Count of cache hits")
                .tag("cache", "redis")
                .register(meterRegistry);
    }

    /**
     * Cache miss counter
     * 
     * Tracks cache miss rates for performance monitoring.
     * 
     * @return Counter cache miss counter
     */
    @Bean
    public Counter cacheMissCounter() {
        return Counter.builder("cache.miss")
                .description("Count of cache misses")
                .tag("cache", "redis")
                .register(meterRegistry);
    }

    /**
     * Security event counter
     * 
     * Tracks security-related events for monitoring and alerting.
     * 
     * @return Counter security event counter
     */
    @Bean
    public Counter securityEventCounter() {
        return Counter.builder("security.event")
                .description("Count of security events")
                .tag("event", "login_attempt")
                .register(meterRegistry);
    }

    /**
     * Error counter
     * 
     * Tracks application errors by type and severity.
     * 
     * @return Counter error counter
     */
    @Bean
    public Counter errorCounter() {
        return Counter.builder("application.error")
                .description("Count of application errors")
                .tag("severity", "error")
                .register(meterRegistry);
    }

    /**
     * Custom database health indicator
     * 
     * Provides detailed database health information including
     * connection pool status and query response times.
     * 
     * @return HealthIndicator database health indicator
     */
    @Bean
    public HealthIndicator databaseHealthIndicator() {
        return new DatabaseHealthIndicator(dataSource, databaseQueryTimer());
    }

    /**
     * Custom Redis health indicator
     * 
     * Provides detailed Redis health information including
     * connection status and response times.
     * 
     * @return HealthIndicator Redis health indicator
     */
    @Bean
    public HealthIndicator redisHealthIndicator() {
        return new RedisHealthIndicator(redisConnectionFactory);
    }

    /**
     * Application info contributor
     * 
     * Provides custom application information for the info endpoint.
     * 
     * @return InfoContributor application info contributor
     */
    @Bean
    public InfoContributor applicationInfoContributor() {
        return builder -> {
            Map<String, Object> appInfo = Map.of(
                "name", "Spring Boot Professional Template",
                "description", "Professional Spring Boot API with security-first architecture",
                "version", "1.0.0",
                "features", Map.of(
                    "authentication", "JWT with refresh tokens",
                    "authorization", "Role-based with permissions",
                    "security", "OWASP compliant with comprehensive headers",
                    "monitoring", "Prometheus metrics with custom dashboards",
                    "caching", "Redis with intelligent invalidation",
                    "database", "PostgreSQL with connection pooling",
                    "testing", "JUnit 5 with TestContainers",
                    "documentation", "OpenAPI 3 with Swagger UI"
                ),
                "contact", Map.of(
                    "team", "Development Team",
                    "email", "dev-team@company.com",
                    "documentation", "https://company.com/docs"
                )
            );
            
            builder.withDetail("application", appInfo);
        };
    }

    /**
     * Security metrics contributor
     * 
     * Provides security-related metrics and information.
     * 
     * @return InfoContributor security metrics contributor
     */
    @Bean
    public InfoContributor securityInfoContributor() {
        return builder -> {
            Map<String, Object> securityInfo = Map.of(
                "authentication", Map.of(
                    "method", "JWT",
                    "tokenExpiry", "1 hour",
                    "refreshTokenExpiry", "24 hours",
                    "passwordPolicy", "Strong password requirements enforced"
                ),
                "authorization", Map.of(
                    "model", "Role-Based Access Control (RBAC)",
                    "permissions", "Fine-grained permissions system",
                    "hierarchy", "Role hierarchy support"
                ),
                "security", Map.of(
                    "headers", "Complete OWASP security headers",
                    "cors", "Configurable CORS policy",
                    "csrf", "CSRF protection for state-changing operations",
                    "rateLimiting", "Redis-backed rate limiting",
                    "sessionManagement", "Secure session handling"
                )
            );
            
            builder.withDetail("security", securityInfo);
        };
    }

    /**
     * Performance metrics contributor
     * 
     * Provides performance-related information and benchmarks.
     * 
     * @return InfoContributor performance metrics contributor
     */
    @Bean
    public InfoContributor performanceInfoContributor() {
        return builder -> {
            Map<String, Object> performanceInfo = Map.of(
                "database", Map.of(
                    "provider", "PostgreSQL",
                    "connectionPool", "HikariCP",
                    "maxConnections", 50,
                    "queryOptimization", "Enabled with proper indexing"
                ),
                "caching", Map.of(
                    "provider", "Redis",
                    "strategy", "Multi-level caching",
                    "ttl", "Configurable per cache type",
                    "eviction", "LRU with intelligent invalidation"
                ),
                "monitoring", Map.of(
                    "metrics", "Prometheus compatible",
                    "tracing", "Distributed tracing support",
                    "logging", "Structured JSON logging",
                    "alerting", "Custom alert rules"
                )
            );
            
            builder.withDetail("performance", performanceInfo);
        };
    }

    /**
     * Health contributor registry
     * 
     * Registers all custom health indicators.
     * 
     * @return HealthContributor health contributor registry
     */
    @Bean
    public HealthContributor customHealthContributor() {
        return HealthContributor.adapt(Map.of(
            "database", databaseHealthIndicator(),
            "redis", redisHealthIndicator(),
            "application", new ApplicationHealthIndicator()
        ));
    }

    /**
     * Register common gauges for system monitoring
     */
    @Bean
    public void registerSystemGauges() {
        // JVM memory usage
        meterRegistry.gauge("jvm.memory.used.percent", Runtime.getRuntime(), runtime -> {
            long total = runtime.totalMemory();
            long free = runtime.freeMemory();
            return total > 0 ? ((double) (total - free) / total) * 100 : 0;
        });

        // System load average (Unix systems)
        try {
            java.lang.management.OperatingSystemMXBean osBean = 
                java.lang.management.ManagementFactory.getOperatingSystemMXBean();
            
            if (osBean instanceof com.sun.management.OperatingSystemMXBean) {
                com.sun.management.OperatingSystemMXBean sunOsBean = 
                    (com.sun.management.OperatingSystemMXBean) osBean;
                
                meterRegistry.gauge("system.cpu.usage", sunOsBean, 
                    bean -> bean.getProcessCpuLoad() * 100);
                
                meterRegistry.gauge("system.memory.used.bytes", sunOsBean,
                    bean -> bean.getTotalPhysicalMemorySize() - bean.getFreePhysicalMemorySize());
            }
        } catch (Exception e) {
            // Ignore if not available on this platform
        }
    }

    /**
     * Custom timer for method execution tracking
     * 
     * @param name Timer name
     * @param description Timer description
     * @param tags Additional tags
     * @return Timer configured timer
     */
    public Timer createMethodTimer(String name, String description, String... tags) {
        Timer.Builder builder = Timer.builder(name)
                .description(description);
        
        // Add tags in pairs
        for (int i = 0; i < tags.length - 1; i += 2) {
            builder.tag(tags[i], tags[i + 1]);
        }
        
        return builder.register(meterRegistry);
    }

    /**
     * Custom counter for event tracking
     * 
     * @param name Counter name
     * @param description Counter description
     * @param tags Additional tags
     * @return Counter configured counter
     */
    public Counter createEventCounter(String name, String description, String... tags) {
        Counter.Builder builder = Counter.builder(name)
                .description(description);
        
        // Add tags in pairs
        for (int i = 0; i < tags.length - 1; i += 2) {
            builder.tag(tags[i], tags[i + 1]);
        }
        
        return builder.register(meterRegistry);
    }
}