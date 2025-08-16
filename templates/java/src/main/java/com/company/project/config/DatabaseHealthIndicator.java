package com.company.project.config;

import io.micrometer.core.instrument.Timer;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.actuate.health.Health;
import org.springframework.boot.actuate.health.HealthIndicator;
import org.springframework.stereotype.Component;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.ResultSet;
import java.sql.Statement;
import java.time.Instant;
import java.util.HashMap;
import java.util.Map;

/**
 * Database Health Indicator
 * 
 * Comprehensive database health monitoring with connection pool status,
 * query performance metrics, and detailed diagnostics.
 * 
 * Health Check Features:
 * - Database connectivity verification
 * - Connection pool status monitoring
 * - Query response time measurement
 * - Database version and configuration details
 * - Connection count and utilization metrics
 * 
 * Monitoring Integration:
 * - Metrics collection for dashboards
 * - Alert threshold configuration
 * - Performance trend tracking
 * - Automated health reporting
 * 
 * @author Spring Boot Professional Template
 * @version 1.0.0
 * @since 2024-01-01
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class DatabaseHealthIndicator implements HealthIndicator {

    private final DataSource dataSource;
    private final Timer databaseQueryTimer;

    private static final String HEALTH_CHECK_QUERY = "SELECT 1";
    private static final String VERSION_QUERY = "SELECT version()";
    private static final long WARNING_THRESHOLD_MS = 1000; // 1 second
    private static final long ERROR_THRESHOLD_MS = 5000;   // 5 seconds

    /**
     * Perform database health check
     * 
     * @return Health health status with detailed information
     */
    @Override
    public Health health() {
        try {
            return checkDatabaseHealth();
        } catch (Exception e) {
            log.error("Database health check failed", e);
            return Health.down()
                    .withDetail("error", e.getMessage())
                    .withDetail("timestamp", Instant.now())
                    .withDetail("status", "Database connection failed")
                    .build();
        }
    }

    /**
     * Perform comprehensive database health assessment
     * 
     * @return Health detailed health status
     * @throws Exception if health check fails
     */
    private Health checkDatabaseHealth() throws Exception {
        long startTime = System.currentTimeMillis();
        Map<String, Object> details = new HashMap<>();
        
        try (Connection connection = dataSource.getConnection()) {
            // Basic connectivity test
            Timer.Sample sample = Timer.start();
            boolean isValid = connection.isValid(5); // 5 second timeout
            long validationTime = sample.stop(databaseQueryTimer);
            
            details.put("timestamp", Instant.now());
            details.put("validationTime", validationTime + "ms");
            details.put("connectionValid", isValid);
            
            if (!isValid) {
                return Health.down()
                        .withDetails(details)
                        .withDetail("status", "Connection validation failed")
                        .build();
            }
            
            // Query response time test
            long queryStartTime = System.currentTimeMillis();
            try (Statement statement = connection.createStatement();
                 ResultSet resultSet = statement.executeQuery(HEALTH_CHECK_QUERY)) {
                
                if (resultSet.next()) {
                    long queryTime = System.currentTimeMillis() - queryStartTime;
                    details.put("queryResponseTime", queryTime + "ms");
                    
                    // Database version and details
                    addDatabaseDetails(connection, details);
                    
                    // Connection pool information
                    addConnectionPoolDetails(details);
                    
                    // Determine health status based on response time
                    Health.Builder healthBuilder = determineHealthStatus(queryTime);
                    
                    return healthBuilder
                            .withDetails(details)
                            .build();
                }
            }
            
            return Health.down()
                    .withDetails(details)
                    .withDetail("status", "Query execution failed")
                    .build();
                    
        } catch (Exception e) {
            details.put("error", e.getMessage());
            details.put("errorType", e.getClass().getSimpleName());
            throw e;
        }
    }

    /**
     * Add database-specific details to health information
     * 
     * @param connection Database connection
     * @param details Details map to populate
     */
    private void addDatabaseDetails(Connection connection, Map<String, Object> details) {
        try {
            // Database metadata
            var metaData = connection.getMetaData();
            details.put("databaseProduct", metaData.getDatabaseProductName());
            details.put("databaseVersion", metaData.getDatabaseProductVersion());
            details.put("driverName", metaData.getDriverName());
            details.put("driverVersion", metaData.getDriverVersion());
            details.put("jdbcUrl", metaData.getURL());
            details.put("username", metaData.getUserName());
            
            // Database capabilities
            details.put("supportsTransactions", metaData.supportsTransactions());
            details.put("supportsStoredProcedures", metaData.supportsStoredProcedures());
            details.put("supportsMultipleTransactions", metaData.supportsMultipleTransactions());
            
            // Get database-specific information
            if (metaData.getDatabaseProductName().toLowerCase().contains("postgresql")) {
                addPostgreSQLDetails(connection, details);
            }
            
        } catch (Exception e) {
            details.put("metadataError", e.getMessage());
            log.warn("Failed to retrieve database metadata", e);
        }
    }

    /**
     * Add PostgreSQL-specific health details
     * 
     * @param connection Database connection
     * @param details Details map to populate
     */
    private void addPostgreSQLDetails(Connection connection, Map<String, Object> details) {
        try (Statement statement = connection.createStatement()) {
            // Get database size
            try (ResultSet rs = statement.executeQuery(
                    "SELECT pg_size_pretty(pg_database_size(current_database())) as db_size")) {
                if (rs.next()) {
                    details.put("databaseSize", rs.getString("db_size"));
                }
            }
            
            // Get connection count
            try (ResultSet rs = statement.executeQuery(
                    "SELECT count(*) as connection_count FROM pg_stat_activity")) {
                if (rs.next()) {
                    details.put("activeConnections", rs.getInt("connection_count"));
                }
            }
            
            // Get database statistics
            try (ResultSet rs = statement.executeQuery(
                    "SELECT numbackends, xact_commit, xact_rollback, blks_read, blks_hit " +
                    "FROM pg_stat_database WHERE datname = current_database()")) {
                if (rs.next()) {
                    Map<String, Object> stats = new HashMap<>();
                    stats.put("backends", rs.getInt("numbackends"));
                    stats.put("commits", rs.getLong("xact_commit"));
                    stats.put("rollbacks", rs.getLong("xact_rollback"));
                    stats.put("blocksRead", rs.getLong("blks_read"));
                    stats.put("blocksHit", rs.getLong("blks_hit"));
                    
                    // Calculate cache hit ratio
                    long blksRead = rs.getLong("blks_read");
                    long blksHit = rs.getLong("blks_hit");
                    if (blksRead + blksHit > 0) {
                        double hitRatio = (double) blksHit / (blksRead + blksHit) * 100;
                        stats.put("cacheHitRatio", String.format("%.2f%%", hitRatio));
                    }
                    
                    details.put("statistics", stats);
                }
            }
            
        } catch (Exception e) {
            details.put("postgresqlStatsError", e.getMessage());
            log.warn("Failed to retrieve PostgreSQL statistics", e);
        }
    }

    /**
     * Add connection pool details to health information
     * 
     * @param details Details map to populate
     */
    private void addConnectionPoolDetails(Map<String, Object> details) {
        try {
            // Try to get HikariCP details if available
            if (dataSource instanceof com.zaxxer.hikari.HikariDataSource) {
                com.zaxxer.hikari.HikariDataSource hikariDs = 
                    (com.zaxxer.hikari.HikariDataSource) dataSource;
                
                Map<String, Object> poolInfo = new HashMap<>();
                poolInfo.put("poolName", hikariDs.getPoolName());
                poolInfo.put("maximumPoolSize", hikariDs.getMaximumPoolSize());
                poolInfo.put("minimumIdle", hikariDs.getMinimumIdle());
                poolInfo.put("connectionTimeout", hikariDs.getConnectionTimeout());
                poolInfo.put("idleTimeout", hikariDs.getIdleTimeout());
                poolInfo.put("maxLifetime", hikariDs.getMaxLifetime());
                
                // Get pool statistics if available
                try {
                    var poolMXBean = hikariDs.getHikariPoolMXBean();
                    if (poolMXBean != null) {
                        poolInfo.put("activeConnections", poolMXBean.getActiveConnections());
                        poolInfo.put("idleConnections", poolMXBean.getIdleConnections());
                        poolInfo.put("totalConnections", poolMXBean.getTotalConnections());
                        poolInfo.put("threadsAwaitingConnection", poolMXBean.getThreadsAwaitingConnection());
                    }
                } catch (Exception e) {
                    poolInfo.put("statisticsError", "Pool statistics not available");
                }
                
                details.put("connectionPool", poolInfo);
            } else {
                details.put("connectionPool", "Type: " + dataSource.getClass().getSimpleName());
            }
            
        } catch (Exception e) {
            details.put("poolInfoError", e.getMessage());
            log.warn("Failed to retrieve connection pool details", e);
        }
    }

    /**
     * Determine health status based on query response time
     * 
     * @param queryTime Query execution time in milliseconds
     * @return Health.Builder appropriate health status
     */
    private Health.Builder determineHealthStatus(long queryTime) {
        if (queryTime >= ERROR_THRESHOLD_MS) {
            return Health.down()
                    .withDetail("status", "Database response time exceeds error threshold")
                    .withDetail("threshold", ERROR_THRESHOLD_MS + "ms");
        } else if (queryTime >= WARNING_THRESHOLD_MS) {
            return Health.up()
                    .withDetail("status", "Database response time exceeds warning threshold")
                    .withDetail("threshold", WARNING_THRESHOLD_MS + "ms")
                    .withDetail("warning", "Consider investigating database performance");
        } else {
            return Health.up()
                    .withDetail("status", "Database is healthy and responsive");
        }
    }
}