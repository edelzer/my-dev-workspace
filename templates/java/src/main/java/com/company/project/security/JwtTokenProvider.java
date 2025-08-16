package com.company.project.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Date;
import java.util.List;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;

/**
 * JWT Token Provider for Authentication and Authorization
 * 
 * Comprehensive JWT token management with security-first approach:
 * - Secure token generation with strong cryptographic keys
 * - Token validation with expiration and signature verification
 * - Token blacklisting for secure logout and revocation
 * - Claims extraction for user context and authorization
 * - Security event logging for monitoring and auditing
 * 
 * Security Features:
 * - HMAC SHA-512 algorithm for token signing
 * - Configurable token expiration times
 * - Redis-backed token blacklisting
 * - Comprehensive error handling and logging
 * - Protection against token tampering and replay attacks
 * 
 * Token Structure:
 * - Header: Algorithm and token type
 * - Payload: User claims, roles, and expiration
 * - Signature: HMAC signature for verification
 * 
 * @author Spring Boot Professional Template
 * @version 1.0.0
 * @since 2024-01-01
 */
@Slf4j
@Component
public class JwtTokenProvider {

    private final SecretKey jwtSecret;
    private final long jwtExpirationMs;
    private final long refreshTokenExpirationMs;
    private final RedisTemplate<String, String> redisTemplate;

    private static final String BLACKLIST_PREFIX = "blacklist:";
    private static final String REFRESH_TOKEN_PREFIX = "refresh:";

    /**
     * Constructor for JWT Token Provider
     * 
     * @param jwtSecret JWT secret key from configuration
     * @param jwtExpirationMs Token expiration time in milliseconds
     * @param refreshTokenExpirationMs Refresh token expiration time in milliseconds
     * @param redisTemplate Redis template for token blacklisting
     */
    public JwtTokenProvider(
            @Value("${app.jwt.secret}") String jwtSecret,
            @Value("${app.jwt.expiration-ms:3600000}") long jwtExpirationMs,
            @Value("${app.jwt.refresh-expiration-ms:86400000}") long refreshTokenExpirationMs,
            RedisTemplate<String, String> redisTemplate) {
        
        this.jwtSecret = Keys.hmacShaKeyFor(Decoders.BASE64.decode(jwtSecret));
        this.jwtExpirationMs = jwtExpirationMs;
        this.refreshTokenExpirationMs = refreshTokenExpirationMs;
        this.redisTemplate = redisTemplate;
        
        log.info("JWT Token Provider initialized with expiration: {} ms", jwtExpirationMs);
    }

    /**
     * Generate JWT access token from authentication
     * 
     * Creates a signed JWT token with user claims and roles for authentication
     * and authorization purposes.
     * 
     * @param authentication Spring Security authentication object
     * @return String JWT access token
     */
    public String generateAccessToken(Authentication authentication) {
        UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
        
        Instant now = Instant.now();
        Instant expiryDate = now.plus(jwtExpirationMs, ChronoUnit.MILLIS);
        
        List<String> roles = authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .collect(Collectors.toList());

        String token = Jwts.builder()
                .setSubject(userPrincipal.getId().toString())
                .claim("username", userPrincipal.getUsername())
                .claim("email", userPrincipal.getEmail())
                .claim("roles", roles)
                .claim("type", "access")
                .setIssuedAt(Date.from(now))
                .setExpiration(Date.from(expiryDate))
                .signWith(jwtSecret, SignatureAlgorithm.HS512)
                .compact();

        log.debug("Generated access token for user: {} with roles: {}", 
                 userPrincipal.getUsername(), roles);
        
        return token;
    }

    /**
     * Generate JWT refresh token
     * 
     * Creates a long-lived refresh token for obtaining new access tokens
     * without requiring user re-authentication.
     * 
     * @param authentication Spring Security authentication object
     * @return String JWT refresh token
     */
    public String generateRefreshToken(Authentication authentication) {
        UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
        
        Instant now = Instant.now();
        Instant expiryDate = now.plus(refreshTokenExpirationMs, ChronoUnit.MILLIS);

        String refreshToken = Jwts.builder()
                .setSubject(userPrincipal.getId().toString())
                .claim("username", userPrincipal.getUsername())
                .claim("type", "refresh")
                .setIssuedAt(Date.from(now))
                .setExpiration(Date.from(expiryDate))
                .signWith(jwtSecret, SignatureAlgorithm.HS512)
                .compact();

        // Store refresh token in Redis for validation
        String key = REFRESH_TOKEN_PREFIX + userPrincipal.getId();
        redisTemplate.opsForValue().set(key, refreshToken, refreshTokenExpirationMs, TimeUnit.MILLISECONDS);

        log.debug("Generated refresh token for user: {}", userPrincipal.getUsername());
        
        return refreshToken;
    }

    /**
     * Extract user ID from JWT token
     * 
     * @param token JWT token
     * @return Long user ID
     */
    public Long getUserIdFromToken(String token) {
        Claims claims = getClaimsFromToken(token);
        return Long.parseLong(claims.getSubject());
    }

    /**
     * Extract username from JWT token
     * 
     * @param token JWT token
     * @return String username
     */
    public String getUsernameFromToken(String token) {
        Claims claims = getClaimsFromToken(token);
        return claims.get("username", String.class);
    }

    /**
     * Extract roles from JWT token
     * 
     * @param token JWT token
     * @return List<String> user roles
     */
    @SuppressWarnings("unchecked")
    public List<String> getRolesFromToken(String token) {
        Claims claims = getClaimsFromToken(token);
        return claims.get("roles", List.class);
    }

    /**
     * Extract token expiration date
     * 
     * @param token JWT token
     * @return Date expiration date
     */
    public Date getExpirationFromToken(String token) {
        Claims claims = getClaimsFromToken(token);
        return claims.getExpiration();
    }

    /**
     * Validate JWT token
     * 
     * Performs comprehensive token validation including:
     * - Signature verification
     * - Expiration check
     * - Blacklist verification
     * - Token structure validation
     * 
     * @param token JWT token to validate
     * @return boolean true if token is valid
     */
    public boolean validateToken(String token) {
        try {
            // Check if token is blacklisted
            if (isTokenBlacklisted(token)) {
                log.warn("Attempt to use blacklisted token");
                return false;
            }

            // Parse and validate token
            Jwts.parserBuilder()
                .setSigningKey(jwtSecret)
                .build()
                .parseClaimsJws(token);

            log.debug("Token validation successful");
            return true;
            
        } catch (SecurityException ex) {
            log.error("Invalid JWT signature: {}", ex.getMessage());
        } catch (MalformedJwtException ex) {
            log.error("Invalid JWT token: {}", ex.getMessage());
        } catch (ExpiredJwtException ex) {
            log.warn("Expired JWT token: {}", ex.getMessage());
        } catch (UnsupportedJwtException ex) {
            log.error("Unsupported JWT token: {}", ex.getMessage());
        } catch (IllegalArgumentException ex) {
            log.error("JWT claims string is empty: {}", ex.getMessage());
        } catch (Exception ex) {
            log.error("JWT token validation error: {}", ex.getMessage());
        }
        
        return false;
    }

    /**
     * Blacklist a JWT token
     * 
     * Adds the token to Redis blacklist to prevent further use.
     * Used for secure logout and token revocation.
     * 
     * @param token JWT token to blacklist
     */
    public void blacklistToken(String token) {
        try {
            Date expiration = getExpirationFromToken(token);
            long ttl = expiration.getTime() - System.currentTimeMillis();
            
            if (ttl > 0) {
                String key = BLACKLIST_PREFIX + token;
                redisTemplate.opsForValue().set(key, "blacklisted", ttl, TimeUnit.MILLISECONDS);
                log.info("Token blacklisted successfully");
            }
            
        } catch (Exception ex) {
            log.error("Error blacklisting token: {}", ex.getMessage());
        }
    }

    /**
     * Check if token is blacklisted
     * 
     * @param token JWT token to check
     * @return boolean true if token is blacklisted
     */
    public boolean isTokenBlacklisted(String token) {
        try {
            String key = BLACKLIST_PREFIX + token;
            return Boolean.TRUE.equals(redisTemplate.hasKey(key));
        } catch (Exception ex) {
            log.error("Error checking token blacklist: {}", ex.getMessage());
            return false;
        }
    }

    /**
     * Validate refresh token
     * 
     * @param refreshToken Refresh token to validate
     * @param userId User ID for token ownership verification
     * @return boolean true if refresh token is valid
     */
    public boolean validateRefreshToken(String refreshToken, Long userId) {
        try {
            // Validate token structure and signature
            if (!validateToken(refreshToken)) {
                return false;
            }

            // Check token type
            Claims claims = getClaimsFromToken(refreshToken);
            if (!"refresh".equals(claims.get("type", String.class))) {
                log.warn("Invalid token type for refresh operation");
                return false;
            }

            // Verify token exists in Redis
            String key = REFRESH_TOKEN_PREFIX + userId;
            String storedToken = redisTemplate.opsForValue().get(key);
            
            boolean isValid = refreshToken.equals(storedToken);
            if (!isValid) {
                log.warn("Refresh token not found in store for user: {}", userId);
            }
            
            return isValid;
            
        } catch (Exception ex) {
            log.error("Error validating refresh token: {}", ex.getMessage());
            return false;
        }
    }

    /**
     * Revoke refresh token
     * 
     * @param userId User ID for token revocation
     */
    public void revokeRefreshToken(Long userId) {
        try {
            String key = REFRESH_TOKEN_PREFIX + userId;
            redisTemplate.delete(key);
            log.info("Refresh token revoked for user: {}", userId);
        } catch (Exception ex) {
            log.error("Error revoking refresh token: {}", ex.getMessage());
        }
    }

    /**
     * Extract claims from JWT token
     * 
     * @param token JWT token
     * @return Claims token claims
     */
    private Claims getClaimsFromToken(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(jwtSecret)
                .build()
                .parseClaimsJws(token)
                .getBody();
    }
}