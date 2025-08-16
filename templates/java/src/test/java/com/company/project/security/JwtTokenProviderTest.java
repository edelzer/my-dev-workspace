package com.company.project.security;

import com.company.project.model.Role;
import com.company.project.model.User;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.Tag;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.test.context.ActiveProfiles;

import java.util.Set;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.*;

/**
 * JWT Token Provider Tests
 * 
 * Comprehensive test suite for JWT token generation, validation, and management.
 * 
 * Test Categories:
 * - Token generation and structure validation
 * - Token validation and error handling
 * - Token blacklisting and security features
 * - Claims extraction and verification
 * - Security edge cases and attack scenarios
 * 
 * Security Test Coverage:
 * - Token tampering detection
 * - Expiration handling
 * - Blacklist functionality
 * - Claims integrity
 * - Error response security
 * 
 * @author Spring Boot Professional Template
 * @version 1.0.0
 * @since 2024-01-01
 */
@SpringBootTest
@ActiveProfiles("test")
@Tag("security")
@DisplayName("JWT Token Provider Tests")
class JwtTokenProviderTest {

    private JwtTokenProvider jwtTokenProvider;
    private RedisTemplate<String, String> redisTemplate;
    private User testUser;
    private UserPrincipal testUserPrincipal;
    private Authentication testAuthentication;

    @BeforeEach
    void setUp() {
        // Mock Redis template
        redisTemplate = mock(RedisTemplate.class);
        when(redisTemplate.hasKey(anyString())).thenReturn(false);
        
        // Create JWT Token Provider with test configuration
        jwtTokenProvider = new JwtTokenProvider(
            "dGVzdFNlY3JldEtleUZvckpXVFRva2VuU2lnbmluZ0luVGVzdEVudmlyb25tZW50V2l0aFNwcmluZ0Jvb3Q=",
            60000L, // 1 minute
            300000L, // 5 minutes
            redisTemplate
        );
        
        // Create test user and roles
        Role userRole = Role.builder()
            .id(1L)
            .name("USER")
            .enabled(true)
            .build();
            
        testUser = User.builder()
            .id(1L)
            .username("testuser")
            .email("test@example.com")
            .firstName("Test")
            .lastName("User")
            .password("encodedPassword")
            .enabled(true)
            .accountNonExpired(true)
            .accountNonLocked(true)
            .credentialsNonExpired(true)
            .roles(Set.of(userRole))
            .build();
            
        testUserPrincipal = UserPrincipal.create(testUser);
        testAuthentication = new UsernamePasswordAuthenticationToken(
            testUserPrincipal, null, testUserPrincipal.getAuthorities());
    }

    @Nested
    @DisplayName("Token Generation Tests")
    class TokenGenerationTests {

        @Test
        @DisplayName("Should generate valid access token with correct structure")
        void shouldGenerateValidAccessToken() {
            // When
            String token = jwtTokenProvider.generateAccessToken(testAuthentication);
            
            // Then
            assertThat(token).isNotNull();
            assertThat(token).isNotEmpty();
            assertThat(token.split("\\.")).hasSize(3); // JWT has 3 parts
            
            // Verify token contains expected claims
            Long userId = jwtTokenProvider.getUserIdFromToken(token);
            String username = jwtTokenProvider.getUsernameFromToken(token);
            
            assertThat(userId).isEqualTo(testUser.getId());
            assertThat(username).isEqualTo(testUser.getUsername());
        }

        @Test
        @DisplayName("Should generate valid refresh token")
        void shouldGenerateValidRefreshToken() {
            // When
            String refreshToken = jwtTokenProvider.generateRefreshToken(testAuthentication);
            
            // Then
            assertThat(refreshToken).isNotNull();
            assertThat(refreshToken).isNotEmpty();
            assertThat(refreshToken.split("\\.")).hasSize(3);
            
            // Verify refresh token is stored in Redis
            verify(redisTemplate.opsForValue()).set(
                eq("refresh:" + testUser.getId()), 
                eq(refreshToken), 
                eq(300000L), 
                any()
            );
        }

        @Test
        @DisplayName("Should include user roles in access token")
        void shouldIncludeUserRolesInAccessToken() {
            // When
            String token = jwtTokenProvider.generateAccessToken(testAuthentication);
            
            // Then
            var roles = jwtTokenProvider.getRolesFromToken(token);
            assertThat(roles).contains("ROLE_USER");
        }
    }

    @Nested
    @DisplayName("Token Validation Tests")
    class TokenValidationTests {

        @Test
        @DisplayName("Should validate correct token successfully")
        void shouldValidateCorrectToken() {
            // Given
            String token = jwtTokenProvider.generateAccessToken(testAuthentication);
            
            // When
            boolean isValid = jwtTokenProvider.validateToken(token);
            
            // Then
            assertThat(isValid).isTrue();
        }

        @Test
        @DisplayName("Should reject malformed token")
        void shouldRejectMalformedToken() {
            // Given
            String malformedToken = "not.a.valid.jwt.token";
            
            // When
            boolean isValid = jwtTokenProvider.validateToken(malformedToken);
            
            // Then
            assertThat(isValid).isFalse();
        }

        @Test
        @DisplayName("Should reject token with invalid signature")
        void shouldRejectTokenWithInvalidSignature() {
            // Given
            String tokenWithInvalidSignature = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9." +
                "eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ." +
                "invalid_signature";
            
            // When
            boolean isValid = jwtTokenProvider.validateToken(tokenWithInvalidSignature);
            
            // Then
            assertThat(isValid).isFalse();
        }

        @Test
        @DisplayName("Should reject blacklisted token")
        void shouldRejectBlacklistedToken() {
            // Given
            String token = jwtTokenProvider.generateAccessToken(testAuthentication);
            when(redisTemplate.hasKey("blacklist:" + token)).thenReturn(true);
            
            // When
            boolean isValid = jwtTokenProvider.validateToken(token);
            
            // Then
            assertThat(isValid).isFalse();
        }
    }

    @Nested
    @DisplayName("Token Blacklisting Tests")
    class TokenBlacklistingTests {

        @Test
        @DisplayName("Should blacklist token successfully")
        void shouldBlacklistTokenSuccessfully() {
            // Given
            String token = jwtTokenProvider.generateAccessToken(testAuthentication);
            
            // When
            jwtTokenProvider.blacklistToken(token);
            
            // Then
            verify(redisTemplate.opsForValue()).set(
                eq("blacklist:" + token), 
                eq("blacklisted"), 
                anyLong(), 
                any()
            );
        }

        @Test
        @DisplayName("Should detect blacklisted token")
        void shouldDetectBlacklistedToken() {
            // Given
            String token = "test.token.here";
            when(redisTemplate.hasKey("blacklist:" + token)).thenReturn(true);
            
            // When
            boolean isBlacklisted = jwtTokenProvider.isTokenBlacklisted(token);
            
            // Then
            assertThat(isBlacklisted).isTrue();
        }
    }

    @Nested
    @DisplayName("Claims Extraction Tests")
    class ClaimsExtractionTests {

        @Test
        @DisplayName("Should extract user ID correctly")
        void shouldExtractUserIdCorrectly() {
            // Given
            String token = jwtTokenProvider.generateAccessToken(testAuthentication);
            
            // When
            Long userId = jwtTokenProvider.getUserIdFromToken(token);
            
            // Then
            assertThat(userId).isEqualTo(testUser.getId());
        }

        @Test
        @DisplayName("Should extract username correctly")
        void shouldExtractUsernameCorrectly() {
            // Given
            String token = jwtTokenProvider.generateAccessToken(testAuthentication);
            
            // When
            String username = jwtTokenProvider.getUsernameFromToken(token);
            
            // Then
            assertThat(username).isEqualTo(testUser.getUsername());
        }

        @Test
        @DisplayName("Should extract roles correctly")
        void shouldExtractRolesCorrectly() {
            // Given
            String token = jwtTokenProvider.generateAccessToken(testAuthentication);
            
            // When
            var roles = jwtTokenProvider.getRolesFromToken(token);
            
            // Then
            assertThat(roles).isNotEmpty();
            assertThat(roles).contains("ROLE_USER");
        }

        @Test
        @DisplayName("Should extract expiration date correctly")
        void shouldExtractExpirationDateCorrectly() {
            // Given
            String token = jwtTokenProvider.generateAccessToken(testAuthentication);
            
            // When
            var expiration = jwtTokenProvider.getExpirationFromToken(token);
            
            // Then
            assertThat(expiration).isNotNull();
            assertThat(expiration).isAfter(new java.util.Date());
        }
    }

    @Nested
    @DisplayName("Refresh Token Tests")
    class RefreshTokenTests {

        @Test
        @DisplayName("Should validate refresh token successfully")
        void shouldValidateRefreshTokenSuccessfully() {
            // Given
            String refreshToken = jwtTokenProvider.generateRefreshToken(testAuthentication);
            when(redisTemplate.opsForValue().get("refresh:" + testUser.getId()))
                .thenReturn(refreshToken);
            
            // When
            boolean isValid = jwtTokenProvider.validateRefreshToken(refreshToken, testUser.getId());
            
            // Then
            assertThat(isValid).isTrue();
        }

        @Test
        @DisplayName("Should reject refresh token not in store")
        void shouldRejectRefreshTokenNotInStore() {
            // Given
            String refreshToken = jwtTokenProvider.generateRefreshToken(testAuthentication);
            when(redisTemplate.opsForValue().get("refresh:" + testUser.getId()))
                .thenReturn(null);
            
            // When
            boolean isValid = jwtTokenProvider.validateRefreshToken(refreshToken, testUser.getId());
            
            // Then
            assertThat(isValid).isFalse();
        }

        @Test
        @DisplayName("Should revoke refresh token successfully")
        void shouldRevokeRefreshTokenSuccessfully() {
            // When
            jwtTokenProvider.revokeRefreshToken(testUser.getId());
            
            // Then
            verify(redisTemplate).delete("refresh:" + testUser.getId());
        }
    }

    @Nested
    @DisplayName("Security Edge Cases")
    class SecurityEdgeCasesTests {

        @Test
        @DisplayName("Should handle null token gracefully")
        void shouldHandleNullTokenGracefully() {
            // When & Then
            assertThat(jwtTokenProvider.validateToken(null)).isFalse();
            assertThatThrownBy(() -> jwtTokenProvider.getUserIdFromToken(null))
                .isInstanceOf(Exception.class);
        }

        @Test
        @DisplayName("Should handle empty token gracefully")
        void shouldHandleEmptyTokenGracefully() {
            // When & Then
            assertThat(jwtTokenProvider.validateToken("")).isFalse();
            assertThatThrownBy(() -> jwtTokenProvider.getUserIdFromToken(""))
                .isInstanceOf(Exception.class);
        }

        @Test
        @DisplayName("Should handle Redis errors gracefully")
        void shouldHandleRedisErrorsGracefully() {
            // Given
            when(redisTemplate.hasKey(anyString())).thenThrow(new RuntimeException("Redis error"));
            String token = jwtTokenProvider.generateAccessToken(testAuthentication);
            
            // When & Then
            assertThat(jwtTokenProvider.isTokenBlacklisted(token)).isFalse();
        }
    }
}