package com.workspace.config.adapters;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.dataformat.yaml.YAMLFactory;
import com.fasterxml.jackson.dataformat.yaml.YAMLGenerator;
import org.springframework.util.StringUtils;

import java.io.IOException;
import java.io.StringWriter;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Java/Spring Boot Configuration Adapter
 * 
 * Converts the unified configuration schema to Spring Boot compatible format
 * Supports application.yml, environment profiles, and Spring Boot conventions
 */
public class JavaConfigAdapter {
    
    private final ObjectMapper yamlMapper;
    private final ObjectMapper jsonMapper;
    private final Map<String, Object> options;
    
    public JavaConfigAdapter() {
        this(new HashMap<>());
    }
    
    public JavaConfigAdapter(Map<String, Object> options) {
        this.options = options;
        this.yamlMapper = new ObjectMapper(new YAMLFactory()
            .disable(YAMLGenerator.Feature.WRITE_DOC_START_MARKER));
        this.jsonMapper = new ObjectMapper();
    }
    
    /**
     * Generate Spring Boot application.yml from unified config
     */
    public String generateApplicationYml(JsonNode unifiedConfig, String environment) throws IOException {
        Map<String, Object> springConfig = new LinkedHashMap<>();
        
        // Spring configuration
        Map<String, Object> spring = new LinkedHashMap<>();
        
        // Application name and profiles
        Map<String, Object> application = new LinkedHashMap<>();
        JsonNode appConfig = unifiedConfig.get("application");
        if (appConfig != null) {
            application.put("name", appConfig.get("name").asText());
        }
        spring.put("application", application);
        
        Map<String, Object> profiles = new LinkedHashMap<>();
        profiles.put("active", String.format("${SPRING_PROFILES_ACTIVE:%s}", environment));
        spring.put("profiles", profiles);
        
        // Database configuration
        generateDatabaseConfig(spring, unifiedConfig.get("database"));
        
        // Cache configuration  
        generateCacheConfig(spring, unifiedConfig.get("cache"));
        
        // Security configuration
        generateSecurityConfig(spring, unifiedConfig.get("security"));
        
        // Web configuration
        generateWebConfig(spring, unifiedConfig.get("server"));
        
        // JPA configuration
        generateJpaConfig(spring, unifiedConfig.get("database"));
        
        springConfig.put("spring", spring);
        
        // Server configuration
        generateServerConfig(springConfig, unifiedConfig.get("server"));
        
        // Management/Actuator configuration
        generateManagementConfig(springConfig, unifiedConfig.get("monitoring"));
        
        // Logging configuration
        generateLoggingConfig(springConfig, unifiedConfig.get("logging"));
        
        // Application-specific configuration
        generateAppSpecificConfig(springConfig, unifiedConfig);
        
        return yamlMapper.writeValueAsString(springConfig);
    }
    
    private void generateDatabaseConfig(Map<String, Object> spring, JsonNode dbConfig) {
        if (dbConfig == null) return;
        
        Map<String, Object> datasource = new LinkedHashMap<>();
        
        String dbUrl = dbConfig.get("url").asText();
        datasource.put("url", String.format("${DATABASE_URL:%s}", dbUrl));
        
        // Extract username/password from URL or use environment variables
        if (dbUrl.contains("postgresql://") || dbUrl.contains("mysql://")) {
            datasource.put("username", "${DATABASE_USERNAME:postgres}");
            datasource.put("password", "${DATABASE_PASSWORD:postgres}");
        }
        
        // Determine driver class
        if (dbUrl.startsWith("postgresql://")) {
            datasource.put("driver-class-name", "org.postgresql.Driver");
        } else if (dbUrl.startsWith("mysql://")) {
            datasource.put("driver-class-name", "com.mysql.cj.jdbc.Driver");
        } else if (dbUrl.startsWith("sqlite://")) {
            datasource.put("driver-class-name", "org.sqlite.JDBC");
        }
        
        // HikariCP connection pool
        Map<String, Object> hikari = new LinkedHashMap<>();
        JsonNode poolConfig = dbConfig.get("pool");
        if (poolConfig != null) {
            hikari.put("maximum-pool-size", String.format("${DB_POOL_SIZE:%d}", 
                poolConfig.get("size").asInt(20)));
            hikari.put("minimum-idle", String.format("${DB_POOL_MIN_IDLE:%d}", 
                poolConfig.get("minIdle").asInt(5)));
            hikari.put("connection-timeout", poolConfig.get("timeout").asInt(30) * 1000);
            hikari.put("max-lifetime", poolConfig.get("maxLifetime").asInt(1800) * 1000);
        }
        datasource.put("hikari", hikari);
        
        spring.put("datasource", datasource);
    }
    
    private void generateCacheConfig(Map<String, Object> spring, JsonNode cacheConfig) {
        if (cacheConfig == null) return;
        
        String cacheType = cacheConfig.get("type").asText("redis");
        
        if ("redis".equals(cacheType)) {
            // Redis configuration
            Map<String, Object> redis = new LinkedHashMap<>();
            redis.put("host", String.format("${REDIS_HOST:%s}", 
                cacheConfig.get("host").asText("localhost")));
            redis.put("port", String.format("${REDIS_PORT:%d}", 
                cacheConfig.get("port").asInt(6379)));
            redis.put("password", "${REDIS_PASSWORD:}");
            redis.put("database", String.format("${REDIS_DATABASE:%d}", 
                cacheConfig.get("database").asInt(0)));
            redis.put("timeout", "2000ms");
            
            // Lettuce pool configuration
            Map<String, Object> lettuce = new LinkedHashMap<>();
            Map<String, Object> pool = new LinkedHashMap<>();
            JsonNode poolConfig = cacheConfig.get("pool");
            if (poolConfig != null) {
                pool.put("max-active", poolConfig.get("maxActive").asInt(20));
                pool.put("max-idle", poolConfig.get("maxIdle").asInt(10));
                pool.put("min-idle", poolConfig.get("minIdle").asInt(5));
            }
            lettuce.put("pool", pool);
            redis.put("lettuce", lettuce);
            
            Map<String, Object> data = new LinkedHashMap<>();
            data.put("redis", redis);
            spring.put("data", data);
            
            // Cache configuration
            Map<String, Object> cache = new LinkedHashMap<>();
            cache.put("type", "redis");
            Map<String, Object> cacheRedis = new LinkedHashMap<>();
            cacheRedis.put("time-to-live", String.format("%dms", 
                cacheConfig.get("ttl").asInt(3600) * 1000));
            cacheRedis.put("cache-null-values", false);
            cache.put("redis", cacheRedis);
            spring.put("cache", cache);
        }
    }
    
    private void generateSecurityConfig(Map<String, Object> spring, JsonNode securityConfig) {
        if (securityConfig == null) return;
        
        Map<String, Object> security = new LinkedHashMap<>();
        security.put("require-ssl", "${REQUIRE_SSL:false}");
        spring.put("security", security);
    }
    
    private void generateWebConfig(Map<String, Object> spring, JsonNode serverConfig) {
        if (serverConfig == null) return;
        
        Map<String, Object> web = new LinkedHashMap<>();
        
        // Static resources caching
        Map<String, Object> resources = new LinkedHashMap<>();
        Map<String, Object> cache = new LinkedHashMap<>();
        Map<String, Object> cacheControl = new LinkedHashMap<>();
        cacheControl.put("max-age", 31536000); // 1 year
        cacheControl.put("cache-public", true);
        cache.put("cachecontrol", cacheControl);
        resources.put("cache", cache);
        web.put("resources", resources);
        
        spring.put("web", web);
    }
    
    private void generateJpaConfig(Map<String, Object> spring, JsonNode dbConfig) {
        if (dbConfig == null) return;
        
        Map<String, Object> jpa = new LinkedHashMap<>();
        
        Map<String, Object> hibernate = new LinkedHashMap<>();
        hibernate.put("ddl-auto", "validate");
        
        Map<String, Object> naming = new LinkedHashMap<>();
        naming.put("physical-strategy", "org.hibernate.boot.model.naming.PhysicalNamingStrategyStandardImpl");
        naming.put("implicit-strategy", "org.hibernate.boot.model.naming.ImplicitNamingStrategyLegacyJpaImpl");
        hibernate.put("naming", naming);
        
        jpa.put("hibernate", hibernate);
        
        Map<String, Object> properties = new LinkedHashMap<>();
        Map<String, Object> hibernateProps = new LinkedHashMap<>();
        
        String dbUrl = dbConfig.get("url").asText();
        if (dbUrl.startsWith("postgresql://")) {
            hibernateProps.put("dialect", "org.hibernate.dialect.PostgreSQLDialect");
        } else if (dbUrl.startsWith("mysql://")) {
            hibernateProps.put("dialect", "org.hibernate.dialect.MySQL8Dialect");
        }
        
        hibernateProps.put("format_sql", false);
        hibernateProps.put("show_sql", false);
        
        Map<String, Object> jdbc = new LinkedHashMap<>();
        jdbc.put("batch_size", 20);
        jdbc.put("order_inserts", true);
        jdbc.put("order_updates", true);
        hibernateProps.put("jdbc", jdbc);
        
        Map<String, Object> cache = new LinkedHashMap<>();
        cache.put("use_second_level_cache", true);
        cache.put("use_query_cache", true);
        hibernateProps.put("cache", cache);
        
        properties.put("hibernate", hibernateProps);
        jpa.put("properties", properties);
        jpa.put("open-in-view", false);
        
        spring.put("jpa", jpa);
    }
    
    private void generateServerConfig(Map<String, Object> config, JsonNode serverConfig) {
        if (serverConfig == null) return;
        
        Map<String, Object> server = new LinkedHashMap<>();
        
        server.put("port", String.format("${SERVER_PORT:%d}", 
            serverConfig.get("port").asInt(8080)));
        
        Map<String, Object> servlet = new LinkedHashMap<>();
        servlet.put("context-path", String.format("${SERVER_CONTEXT_PATH:%s}", 
            serverConfig.get("contextPath").asText("")));
        
        Map<String, Object> session = new LinkedHashMap<>();
        session.put("timeout", "30m");
        Map<String, Object> cookie = new LinkedHashMap<>();
        cookie.put("http-only", true);
        cookie.put("secure", "${COOKIE_SECURE:false}");
        cookie.put("same-site", "strict");
        cookie.put("name", "JSESSIONID");
        session.put("cookie", cookie);
        servlet.put("session", session);
        server.put("servlet", servlet);
        
        // Error configuration
        Map<String, Object> error = new LinkedHashMap<>();
        error.put("include-message", "never");
        error.put("include-binding-errors", "never");
        error.put("include-stacktrace", "never");
        error.put("include-exception", false);
        server.put("error", error);
        
        // Compression
        JsonNode compressionConfig = serverConfig.get("compression");
        if (compressionConfig != null && compressionConfig.get("enabled").asBoolean()) {
            Map<String, Object> compression = new LinkedHashMap<>();
            compression.put("enabled", true);
            compression.put("mime-types", 
                "text/html,text/xml,text/plain,text/css,text/javascript,application/javascript,application/json");
            compression.put("min-response-size", compressionConfig.get("threshold").asInt(1024));
            server.put("compression", compression);
        }
        
        // SSL configuration
        JsonNode sslConfig = serverConfig.get("ssl");
        if (sslConfig != null) {
            Map<String, Object> ssl = new LinkedHashMap<>();
            ssl.put("enabled", "${SSL_ENABLED:false}");
            ssl.put("key-store", "${SSL_KEYSTORE:}");
            ssl.put("key-store-password", "${SSL_KEYSTORE_PASSWORD:}");
            ssl.put("key-store-type", sslConfig.get("keystoreType").asText("PKCS12"));
            server.put("ssl", ssl);
        }
        
        // HTTP/2
        server.put("http2", Map.of("enabled", "${HTTP2_ENABLED:true}"));
        
        config.put("server", server);
    }
    
    private void generateManagementConfig(Map<String, Object> config, JsonNode monitoringConfig) {
        if (monitoringConfig == null) return;
        
        Map<String, Object> management = new LinkedHashMap<>();
        
        Map<String, Object> server = new LinkedHashMap<>();
        server.put("port", "${MANAGEMENT_PORT:8081}");
        management.put("server", server);
        
        Map<String, Object> endpoints = new LinkedHashMap<>();
        Map<String, Object> web = new LinkedHashMap<>();
        Map<String, Object> exposure = new LinkedHashMap<>();
        exposure.put("include", "health,info,metrics,prometheus,loggers");
        web.put("exposure", exposure);
        web.put("base-path", "/actuator");
        endpoints.put("web", web);
        endpoints.put("enabled-by-default", false);
        management.put("endpoints", endpoints);
        
        Map<String, Object> endpoint = new LinkedHashMap<>();
        endpoint.put("health", Map.of("enabled", true, "show-details", "when-authorized"));
        endpoint.put("info", Map.of("enabled", true));
        endpoint.put("metrics", Map.of("enabled", true));
        endpoint.put("prometheus", Map.of("enabled", true));
        management.put("endpoint", endpoint);
        
        Map<String, Object> health = new LinkedHashMap<>();
        health.put("redis", Map.of("enabled", true));
        health.put("db", Map.of("enabled", true));
        health.put("diskspace", Map.of("enabled", true, "threshold", "10MB"));
        management.put("health", health);
        
        Map<String, Object> metrics = new LinkedHashMap<>();
        Map<String, Object> export = new LinkedHashMap<>();
        export.put("prometheus", Map.of("enabled", true));
        metrics.put("export", export);
        management.put("metrics", metrics);
        
        config.put("management", management);
    }
    
    private void generateLoggingConfig(Map<String, Object> config, JsonNode loggingConfig) {
        if (loggingConfig == null) return;
        
        Map<String, Object> logging = new LinkedHashMap<>();
        
        Map<String, Object> level = new LinkedHashMap<>();
        level.put("com.company.project", String.format("${LOG_LEVEL:%s}", 
            loggingConfig.get("level").asText("INFO")));
        level.put("org.springframework.security", "INFO");
        level.put("org.springframework.web", "WARN");
        level.put("org.hibernate.SQL", "WARN");
        level.put("redis.clients.jedis", "WARN");
        logging.put("level", level);
        
        Map<String, Object> pattern = new LinkedHashMap<>();
        pattern.put("console", "%d{yyyy-MM-dd HH:mm:ss.SSS} [%thread] %-5level [%X{traceId:-},%X{spanId:-}] %logger{36} - %msg%n");
        pattern.put("file", "%d{yyyy-MM-dd HH:mm:ss.SSS} [%thread] %-5level [%X{traceId:-},%X{spanId:-}] %logger{36} - %msg%n");
        logging.put("pattern", pattern);
        
        JsonNode fileConfig = loggingConfig.get("file");
        if (fileConfig != null && fileConfig.get("enabled").asBoolean()) {
            Map<String, Object> file = new LinkedHashMap<>();
            file.put("name", String.format("${LOG_FILE:%s}", fileConfig.get("path").asText("logs/application.log")));
            file.put("max-size", fileConfig.get("maxSize").asText("10MB"));
            file.put("max-history", fileConfig.get("maxFiles").asInt(30));
            file.put("total-size-cap", "1GB");
            logging.put("file", file);
        }
        
        config.put("logging", logging);
    }
    
    private void generateAppSpecificConfig(Map<String, Object> config, JsonNode unifiedConfig) {
        Map<String, Object> app = new LinkedHashMap<>();
        
        // JWT configuration
        JsonNode securityConfig = unifiedConfig.get("security");
        if (securityConfig != null) {
            JsonNode jwtConfig = securityConfig.get("jwt");
            if (jwtConfig != null) {
                Map<String, Object> jwt = new LinkedHashMap<>();
                jwt.put("secret", "${JWT_SECRET:defaultSecretKey}");
                jwt.put("expiration-ms", String.format("${JWT_EXPIRATION_MS:%d}", 
                    jwtConfig.get("accessTokenExpiry").asInt(3600) * 1000));
                jwt.put("refresh-expiration-ms", String.format("${JWT_REFRESH_EXPIRATION_MS:%d}", 
                    jwtConfig.get("refreshTokenExpiry").asInt(86400) * 1000));
                app.put("jwt", jwt);
            }
        }
        
        // CORS configuration
        JsonNode corsConfig = unifiedConfig.get("cors");
        if (corsConfig != null) {
            Map<String, Object> cors = new LinkedHashMap<>();
            cors.put("allowed-origins", corsConfig.get("allowedOrigins").isArray() ? 
                String.join(",", jsonArrayToStringList(corsConfig.get("allowedOrigins"))) : 
                "http://localhost:3000");
            cors.put("allowed-methods", corsConfig.get("allowedMethods").isArray() ? 
                String.join(",", jsonArrayToStringList(corsConfig.get("allowedMethods"))) : 
                "GET,POST,PUT,DELETE,OPTIONS");
            cors.put("allowed-headers", "*");
            cors.put("allow-credentials", corsConfig.get("allowCredentials").asBoolean(true));
            cors.put("max-age", corsConfig.get("maxAge").asInt(3600));
            app.put("cors", cors);
        }
        
        // Feature flags
        JsonNode featuresConfig = unifiedConfig.get("features");
        if (featuresConfig != null) {
            Map<String, Object> features = new LinkedHashMap<>();
            featuresConfig.fields().forEachRemaining(entry -> {
                String key = convertToCamelCase(entry.getKey()) + "-enabled";
                features.put(key, String.format("${%s:%s}", 
                    entry.getKey().toUpperCase() + "_ENABLED", 
                    entry.getValue().asBoolean()));
            });
            app.put("features", features);
        }
        
        config.put("app", app);
    }
    
    /**
     * Generate environment-specific property files
     */
    public String generateEnvironmentProperties(JsonNode unifiedConfig, String environment) throws IOException {
        List<String> properties = new ArrayList<>();
        
        properties.add(String.format("# %s Environment Configuration", 
            StringUtils.capitalize(environment)));
        properties.add("");
        
        // Application properties
        JsonNode appConfig = unifiedConfig.get("application");
        if (appConfig != null) {
            properties.add("# Application");
            properties.add(String.format("spring.application.name=%s", appConfig.get("name").asText()));
            properties.add(String.format("app.environment=%s", environment));
            properties.add("");
        }
        
        // Server properties
        JsonNode serverConfig = unifiedConfig.get("server");
        if (serverConfig != null) {
            properties.add("# Server");
            properties.add(String.format("server.port=%d", serverConfig.get("port").asInt(8080)));
            properties.add("");
        }
        
        // Database properties
        JsonNode dbConfig = unifiedConfig.get("database");
        if (dbConfig != null) {
            properties.add("# Database");
            properties.add(String.format("spring.datasource.url=%s", dbConfig.get("url").asText()));
            properties.add("");
        }
        
        return String.join("\n", properties);
    }
    
    /**
     * Generate Maven dependencies for configuration
     */
    public String generateMavenDependencies() {
        return """
            <!-- Configuration Management Dependencies -->
            <dependency>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-configuration-processor</artifactId>
                <optional>true</optional>
            </dependency>
            <dependency>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-starter-validation</artifactId>
            </dependency>
            <dependency>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-starter-actuator</artifactId>
            </dependency>
            """;
    }
    
    // Helper methods
    private List<String> jsonArrayToStringList(JsonNode arrayNode) {
        List<String> list = new ArrayList<>();
        arrayNode.forEach(node -> list.add(node.asText()));
        return list;
    }
    
    private String convertToCamelCase(String input) {
        return Arrays.stream(input.split("[-_]"))
            .map(word -> word.substring(0, 1).toUpperCase() + word.substring(1).toLowerCase())
            .collect(Collectors.joining())
            .substring(0, 1).toLowerCase() + 
            Arrays.stream(input.split("[-_]"))
                .map(word -> word.substring(0, 1).toUpperCase() + word.substring(1).toLowerCase())
                .collect(Collectors.joining()).substring(1);
    }
}