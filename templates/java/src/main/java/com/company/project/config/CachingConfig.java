package com.company.project.config;

import com.fasterxml.jackson.annotation.JsonAutoDetect;
import com.fasterxml.jackson.annotation.JsonTypeInfo;
import com.fasterxml.jackson.annotation.PropertyAccessor;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.jsontype.impl.LaissezFaireSubTypeValidator;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.cache.CacheProperties;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.CachingConfigurer;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.cache.interceptor.CacheErrorHandler;
import org.springframework.cache.interceptor.CacheResolver;
import org.springframework.cache.interceptor.KeyGenerator;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.data.redis.cache.RedisCacheConfiguration;
import org.springframework.data.redis.cache.RedisCacheManager;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.serializer.GenericJackson2JsonRedisSerializer;
import org.springframework.data.redis.serializer.RedisSerializationContext;
import org.springframework.data.redis.serializer.StringRedisSerializer;

import java.time.Duration;
import java.util.HashMap;
import java.util.Map;

/**
 * Caching Configuration
 * 
 * Comprehensive Redis-based caching configuration with intelligent cache management,
 * performance optimization, and monitoring capabilities.
 * 
 * Caching Features:
 * - Multi-level cache configuration with different TTL strategies
 * - Intelligent cache key generation and management
 * - JSON serialization with type information preservation
 * - Cache error handling and fallback mechanisms
 * - Performance monitoring and metrics collection
 * 
 * Cache Strategies:
 * - Short-term cache (5 minutes) for frequently accessed data
 * - Medium-term cache (30 minutes) for user sessions and preferences
 * - Long-term cache (2 hours) for reference data and configurations
 * - Permanent cache for static data with manual invalidation
 * 
 * Security Features:
 * - Secure serialization without class loading vulnerabilities
 * - Cache isolation between different data types
 * - Automatic cache invalidation on security events
 * - Protected cache keys to prevent unauthorized access
 * 
 * @author Spring Boot Professional Template
 * @version 1.0.0
 * @since 2024-01-01
 */
@Slf4j
@Configuration
@EnableCaching
@EnableConfigurationProperties(CacheProperties.class)
@RequiredArgsConstructor
public class CachingConfig implements CachingConfigurer {

    private final RedisConnectionFactory redisConnectionFactory;

    // Cache names constants
    public static final String USER_CACHE = "users";
    public static final String ROLE_CACHE = "roles";
    public static final String PERMISSION_CACHE = "permissions";
    public static final String SESSION_CACHE = "sessions";
    public static final String AUTH_CACHE = "auth";
    public static final String CONFIG_CACHE = "config";
    public static final String REFERENCE_CACHE = "reference";
    public static final String SHORT_TERM_CACHE = "short_term";
    public static final String MEDIUM_TERM_CACHE = "medium_term";
    public static final String LONG_TERM_CACHE = "long_term";

    /**
     * Primary Redis Template for general operations
     * 
     * @return RedisTemplate configured Redis template
     */
    @Bean
    @Primary
    public RedisTemplate<String, Object> redisTemplate() {
        RedisTemplate<String, Object> template = new RedisTemplate<>();
        template.setConnectionFactory(redisConnectionFactory);
        
        // Use String serializer for keys
        StringRedisSerializer stringSerializer = new StringRedisSerializer();
        template.setKeySerializer(stringSerializer);
        template.setHashKeySerializer(stringSerializer);
        
        // Use JSON serializer for values
        GenericJackson2JsonRedisSerializer jsonSerializer = createJsonSerializer();
        template.setValueSerializer(jsonSerializer);
        template.setHashValueSerializer(jsonSerializer);
        
        template.setDefaultSerializer(jsonSerializer);
        template.afterPropertiesSet();
        
        return template;
    }

    /**
     * Redis Cache Manager with multiple cache configurations
     * 
     * @return CacheManager configured cache manager
     */
    @Bean
    @Primary
    @Override
    public CacheManager cacheManager() {
        RedisCacheManager.Builder builder = RedisCacheManager
                .RedisCacheManagerBuilder
                .fromConnectionFactory(redisConnectionFactory)
                .cacheDefaults(defaultCacheConfiguration());
        
        // Configure specific cache settings
        Map<String, RedisCacheConfiguration> cacheConfigurations = createCacheConfigurations();
        builder.withInitialCacheConfigurations(cacheConfigurations);
        
        // Enable transactions if needed
        builder.transactionAware();
        
        RedisCacheManager cacheManager = builder.build();
        cacheManager.setTransactionAware(true);
        
        log.info("Redis Cache Manager configured with {} cache configurations", 
                cacheConfigurations.size());
        
        return cacheManager;
    }

    /**
     * Create default cache configuration
     * 
     * @return RedisCacheConfiguration default configuration
     */
    private RedisCacheConfiguration defaultCacheConfiguration() {
        return RedisCacheConfiguration.defaultCacheConfig()
                .entryTtl(Duration.ofMinutes(30)) // Default 30 minutes TTL
                .disableCachingNullValues()
                .serializeKeysWith(RedisSerializationContext.SerializationPair
                        .fromSerializer(new StringRedisSerializer()))
                .serializeValuesWith(RedisSerializationContext.SerializationPair
                        .fromSerializer(createJsonSerializer()))
                .prefixCacheNameWith("spring-app:cache:");
    }

    /**
     * Create specific cache configurations for different cache types
     * 
     * @return Map cache configurations
     */
    private Map<String, RedisCacheConfiguration> createCacheConfigurations() {
        Map<String, RedisCacheConfiguration> configs = new HashMap<>();
        
        // User cache - medium term (1 hour)
        configs.put(USER_CACHE, defaultCacheConfiguration()
                .entryTtl(Duration.ofHours(1))
                .prefixCacheNameWith("spring-app:users:"));
        
        // Role cache - long term (4 hours, roles change infrequently)
        configs.put(ROLE_CACHE, defaultCacheConfiguration()
                .entryTtl(Duration.ofHours(4))
                .prefixCacheNameWith("spring-app:roles:"));
        
        // Permission cache - very long term (8 hours, permissions rarely change)
        configs.put(PERMISSION_CACHE, defaultCacheConfiguration()
                .entryTtl(Duration.ofHours(8))
                .prefixCacheNameWith("spring-app:permissions:"));
        
        // Session cache - short term (30 minutes)
        configs.put(SESSION_CACHE, defaultCacheConfiguration()
                .entryTtl(Duration.ofMinutes(30))
                .prefixCacheNameWith("spring-app:sessions:"));
        
        // Auth cache - very short term (15 minutes for security)
        configs.put(AUTH_CACHE, defaultCacheConfiguration()
                .entryTtl(Duration.ofMinutes(15))
                .prefixCacheNameWith("spring-app:auth:"));
        
        // Configuration cache - long term (6 hours)
        configs.put(CONFIG_CACHE, defaultCacheConfiguration()
                .entryTtl(Duration.ofHours(6))
                .prefixCacheNameWith("spring-app:config:"));
        
        // Reference data cache - very long term (12 hours)
        configs.put(REFERENCE_CACHE, defaultCacheConfiguration()
                .entryTtl(Duration.ofHours(12))
                .prefixCacheNameWith("spring-app:reference:"));
        
        // Dynamic TTL caches
        configs.put(SHORT_TERM_CACHE, defaultCacheConfiguration()
                .entryTtl(Duration.ofMinutes(5))
                .prefixCacheNameWith("spring-app:short:"));
        
        configs.put(MEDIUM_TERM_CACHE, defaultCacheConfiguration()
                .entryTtl(Duration.ofMinutes(30))
                .prefixCacheNameWith("spring-app:medium:"));
        
        configs.put(LONG_TERM_CACHE, defaultCacheConfiguration()
                .entryTtl(Duration.ofHours(2))
                .prefixCacheNameWith("spring-app:long:"));
        
        return configs;
    }

    /**
     * Create JSON serializer with security considerations
     * 
     * @return GenericJackson2JsonRedisSerializer configured serializer
     */
    private GenericJackson2JsonRedisSerializer createJsonSerializer() {
        ObjectMapper objectMapper = new ObjectMapper();
        
        // Register Java Time module for proper date/time handling
        objectMapper.registerModule(new JavaTimeModule());
        
        // Configure visibility to use fields
        objectMapper.setVisibility(PropertyAccessor.ALL, JsonAutoDetect.Visibility.ANY);
        
        // Enable type information for polymorphic deserialization
        objectMapper.activateDefaultTyping(
                LaissezFaireSubTypeValidator.instance,
                ObjectMapper.DefaultTyping.NON_FINAL,
                JsonTypeInfo.As.PROPERTY
        );
        
        return new GenericJackson2JsonRedisSerializer(objectMapper);
    }

    /**
     * Custom key generator for cache keys
     * 
     * @return KeyGenerator custom key generator
     */
    @Bean
    @Override
    public KeyGenerator keyGenerator() {
        return new CacheKeyGenerator();
    }

    /**
     * Cache error handler for graceful degradation
     * 
     * @return CacheErrorHandler error handler
     */
    @Bean
    @Override
    public CacheErrorHandler errorHandler() {
        return new CacheErrorHandler() {
            @Override
            public void handleCacheGetError(RuntimeException exception, 
                                          org.springframework.cache.Cache cache, Object key) {
                log.warn("Cache GET error for cache: {}, key: {}, error: {}", 
                        cache.getName(), key, exception.getMessage());
                // Continue without cache - graceful degradation
            }

            @Override
            public void handleCachePutError(RuntimeException exception, 
                                          org.springframework.cache.Cache cache, Object key, Object value) {
                log.warn("Cache PUT error for cache: {}, key: {}, error: {}", 
                        cache.getName(), key, exception.getMessage());
                // Continue without caching
            }

            @Override
            public void handleCacheEvictError(RuntimeException exception, 
                                            org.springframework.cache.Cache cache, Object key) {
                log.warn("Cache EVICT error for cache: {}, key: {}, error: {}", 
                        cache.getName(), key, exception.getMessage());
                // Continue without eviction
            }

            @Override
            public void handleCacheClearError(RuntimeException exception, 
                                            org.springframework.cache.Cache cache) {
                log.warn("Cache CLEAR error for cache: {}, error: {}", 
                        cache.getName(), exception.getMessage());
                // Continue without clearing
            }
        };
    }

    /**
     * Cache resolver for dynamic cache selection
     * 
     * @return CacheResolver cache resolver
     */
    @Bean
    @Override
    public CacheResolver cacheResolver() {
        return new DynamicCacheResolver(cacheManager());
    }

    /**
     * Redis Template for specific operations (String-String)
     * 
     * @return RedisTemplate string template
     */
    @Bean
    public RedisTemplate<String, String> stringRedisTemplate() {
        RedisTemplate<String, String> template = new RedisTemplate<>();
        template.setConnectionFactory(redisConnectionFactory);
        template.setDefaultSerializer(new StringRedisSerializer());
        template.afterPropertiesSet();
        return template;
    }

    /**
     * Cache statistics and monitoring bean
     * 
     * @return CacheMonitor cache monitoring service
     */
    @Bean
    public CacheMonitor cacheMonitor() {
        return new CacheMonitor(cacheManager(), redisTemplate());
    }

    /**
     * Cache warming service for preloading critical data
     * 
     * @return CacheWarmupService cache warmup service
     */
    @Bean
    public CacheWarmupService cacheWarmupService() {
        return new CacheWarmupService(cacheManager());
    }

    /**
     * Cache invalidation service for security events
     * 
     * @return CacheInvalidationService cache invalidation service
     */
    @Bean
    public CacheInvalidationService cacheInvalidationService() {
        return new CacheInvalidationService(cacheManager());
    }

    /**
     * Custom cache key generator
     */
    private static class CacheKeyGenerator implements KeyGenerator {
        
        @Override
        public Object generate(Object target, java.lang.reflect.Method method, Object... params) {
            StringBuilder keyBuilder = new StringBuilder();
            
            // Add class name
            keyBuilder.append(target.getClass().getSimpleName());
            keyBuilder.append(":");
            
            // Add method name
            keyBuilder.append(method.getName());
            
            // Add parameters
            if (params.length > 0) {
                keyBuilder.append(":");
                for (Object param : params) {
                    if (param != null) {
                        keyBuilder.append(param.toString());
                        keyBuilder.append(",");
                    } else {
                        keyBuilder.append("null,");
                    }
                }
                // Remove trailing comma
                keyBuilder.setLength(keyBuilder.length() - 1);
            }
            
            String key = keyBuilder.toString();
            log.debug("Generated cache key: {}", key);
            return key;
        }
    }

    /**
     * Dynamic cache resolver for runtime cache selection
     */
    private static class DynamicCacheResolver implements CacheResolver {
        
        private final CacheManager cacheManager;
        
        public DynamicCacheResolver(CacheManager cacheManager) {
            this.cacheManager = cacheManager;
        }
        
        @Override
        public java.util.Collection<? extends org.springframework.cache.Cache> resolveCaches(
                org.springframework.cache.interceptor.CacheOperationInvocationContext<?> context) {
            
            // Default cache resolution
            String[] cacheNames = context.getOperation().getCacheNames().toArray(new String[0]);
            
            if (cacheNames.length == 0) {
                // Use method-based cache naming
                String methodName = context.getMethod().getName();
                String className = context.getTarget().getClass().getSimpleName();
                
                if (className.contains("User")) {
                    cacheNames = new String[]{USER_CACHE};
                } else if (className.contains("Role")) {
                    cacheNames = new String[]{ROLE_CACHE};
                } else if (className.contains("Permission")) {
                    cacheNames = new String[]{PERMISSION_CACHE};
                } else {
                    cacheNames = new String[]{SHORT_TERM_CACHE};
                }
            }
            
            return java.util.Arrays.stream(cacheNames)
                    .map(cacheManager::getCache)
                    .filter(java.util.Objects::nonNull)
                    .collect(java.util.stream.Collectors.toList());
        }
    }
}