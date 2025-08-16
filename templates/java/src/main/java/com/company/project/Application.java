package com.company.project;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.transaction.annotation.EnableTransactionManagement;

/**
 * Spring Boot Application Main Class
 * 
 * Professional Spring Boot application with comprehensive security,
 * monitoring, and enterprise features.
 * 
 * This application implements:
 * - OWASP security best practices with Spring Security
 * - JWT authentication and role-based authorization
 * - Request/response logging and monitoring with Actuator
 * - Database integration with JPA and Flyway migrations
 * - Comprehensive error handling and validation
 * - Caching with Redis integration
 * - API documentation with OpenAPI 3
 * - Professional testing with JUnit 5 and TestContainers
 * 
 * Security Features:
 * - Method-level security with annotations
 * - JWT token validation and blacklisting
 * - CORS protection and security headers
 * - Input validation with Bean Validation
 * - SQL injection protection with JPA
 * - Audit logging with JPA Auditing
 * 
 * Performance Features:
 * - Connection pooling with HikariCP
 * - Redis caching for sessions and data
 * - Async processing capabilities
 * - Database transaction management
 * - Health checks and metrics collection
 * 
 * @author Spring Boot Professional Template
 * @version 1.0.0
 * @since 2024-01-01
 */
@SpringBootApplication
@EnableConfigurationProperties
@EnableMethodSecurity(prePostEnabled = true, securedEnabled = true, jsr250Enabled = true)
@EnableJpaAuditing(auditorAwareRef = "auditorProvider")
@EnableTransactionManagement
@EnableCaching
@EnableAsync
public class Application {

    /**
     * Main method to start the Spring Boot application.
     * 
     * Configures the application with:
     * - Security-first initialization
     * - Database connection validation
     * - Cache initialization
     * - Health check setup
     * - Monitoring and metrics activation
     * 
     * @param args Command line arguments
     */
    public static void main(String[] args) {
        // Set system properties for security
        System.setProperty("java.awt.headless", "true");
        System.setProperty("java.security.egd", "file:/dev/./urandom");
        
        // Configure logging for security events
        System.setProperty("logging.level.com.company.project.security", "INFO");
        System.setProperty("logging.level.org.springframework.security", "INFO");
        
        // Start the application
        SpringApplication app = new SpringApplication(Application.class);
        
        // Add application event listeners for security monitoring
        app.addListeners(new SecurityEventListener());
        
        // Configure startup banner
        app.setBannerMode(SpringApplication.BannerMode.CONSOLE);
        
        // Run the application
        app.run(args);
    }
    
    /**
     * Application startup event listener for security initialization.
     */
    private static class SecurityEventListener implements org.springframework.boot.context.event.ApplicationReadyEventListener {
        
        @Override
        public void onApplicationEvent(org.springframework.boot.context.event.ApplicationReadyEvent event) {
            // Log security initialization
            org.slf4j.LoggerFactory.getLogger(Application.class)
                .info("Spring Boot Professional Template started successfully with security-first configuration");
        }
    }
}