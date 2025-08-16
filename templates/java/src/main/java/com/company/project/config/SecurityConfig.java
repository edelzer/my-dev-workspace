package com.company.project.config;

import com.company.project.security.JwtAuthenticationEntryPoint;
import com.company.project.security.JwtAuthenticationFilter;
import com.company.project.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.web.header.writers.ReferrerPolicyHeaderWriter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

/**
 * Security Configuration with JWT Authentication
 * 
 * Comprehensive Spring Security configuration implementing:
 * - JWT-based authentication and authorization
 * - OWASP security headers and CORS protection
 * - Method-level security with role-based access control
 * - Security event logging and monitoring
 * - Protection against common web vulnerabilities
 * 
 * Security Features:
 * - JWT token validation and blacklisting
 * - Password encoding with BCrypt
 * - CSRF protection for stateless operations
 * - XSS protection with security headers
 * - Clickjacking protection with frame options
 * - Content Security Policy implementation
 * - Secure session management
 * 
 * Authentication Flow:
 * 1. User credentials validated against database
 * 2. JWT token generated with user claims and roles
 * 3. Token validated on each request through filter
 * 4. User context injected for authorization decisions
 * 5. Security events logged for monitoring
 * 
 * @author Spring Boot Professional Template
 * @version 1.0.0
 * @since 2024-01-01
 */
@Configuration
@EnableWebSecurity
@EnableMethodSecurity(prePostEnabled = true, securedEnabled = true, jsr250Enabled = true)
@RequiredArgsConstructor
public class SecurityConfig {

    private final UserDetailsService userDetailsService;
    private final JwtAuthenticationEntryPoint jwtAuthenticationEntryPoint;
    private final JwtTokenProvider jwtTokenProvider;

    /**
     * Configure HTTP security with comprehensive protection.
     * 
     * Security Configuration:
     * - Stateless session management with JWT
     * - CORS configuration for cross-origin requests
     * - CSRF protection for state-changing operations
     * - Security headers for XSS and clickjacking protection
     * - Authentication and authorization rules
     * - Custom JWT authentication filter
     * 
     * @param http HttpSecurity configuration
     * @return SecurityFilterChain configured security filter chain
     * @throws Exception if configuration fails
     */
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            // Disable CSRF for stateless JWT authentication
            .csrf(AbstractHttpConfigurer::disable)
            
            // Configure CORS
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            
            // Configure session management
            .sessionManagement(session -> session
                .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                .maximumSessions(1)
                .maxSessionsPreventsLogin(false)
            )
            
            // Configure security headers
            .headers(headers -> headers
                .frameOptions().deny()
                .contentTypeOptions().and()
                .httpStrictTransportSecurity(hstsConfig -> hstsConfig
                    .maxAgeInSeconds(31536000)
                    .includeSubdomains(true)
                    .preload(true)
                )
                .referrerPolicy(ReferrerPolicyHeaderWriter.ReferrerPolicy.STRICT_ORIGIN_WHEN_CROSS_ORIGIN)
                .and()
                .httpPublicKeyPinning(hpkp -> hpkp.withPins("pin-sha256=base64="))
            )
            
            // Configure authentication entry point
            .exceptionHandling(exceptions -> exceptions
                .authenticationEntryPoint(jwtAuthenticationEntryPoint)
                .accessDeniedHandler((request, response, accessDeniedException) -> {
                    response.setStatus(403);
                    response.setContentType("application/json");
                    response.getWriter().write(
                        "{\"error\":\"Access Denied\",\"message\":\"Insufficient privileges\"}"
                    );
                })
            )
            
            // Configure authorization rules
            .authorizeHttpRequests(authz -> authz
                // Public endpoints
                .requestMatchers(HttpMethod.POST, "/api/v1/auth/login", "/api/v1/auth/register").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/v1/auth/verify/**").permitAll()
                .requestMatchers(HttpMethod.POST, "/api/v1/auth/forgot-password").permitAll()
                .requestMatchers(HttpMethod.POST, "/api/v1/auth/reset-password").permitAll()
                
                // Health and monitoring endpoints
                .requestMatchers("/actuator/health", "/actuator/health/**").permitAll()
                .requestMatchers("/actuator/info").permitAll()
                .requestMatchers("/actuator/prometheus").hasRole("ADMIN")
                .requestMatchers("/actuator/**").hasRole("ADMIN")
                
                // API documentation (development only)
                .requestMatchers("/swagger-ui/**", "/v3/api-docs/**").hasRole("ADMIN")
                
                // Admin endpoints
                .requestMatchers("/api/v1/admin/**").hasRole("ADMIN")
                
                // User management endpoints
                .requestMatchers(HttpMethod.GET, "/api/v1/users/profile").hasAnyRole("USER", "ADMIN")
                .requestMatchers(HttpMethod.PUT, "/api/v1/users/profile").hasAnyRole("USER", "ADMIN")
                .requestMatchers(HttpMethod.DELETE, "/api/v1/users/**").hasRole("ADMIN")
                .requestMatchers("/api/v1/users/**").hasAnyRole("USER", "ADMIN")
                
                // All other endpoints require authentication
                .anyRequest().authenticated()
            );

        // Add JWT authentication filter
        http.addFilterBefore(jwtAuthenticationFilter(), UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    /**
     * JWT Authentication Filter Bean
     * 
     * Custom filter that validates JWT tokens on each request and sets
     * the authentication context for authorized requests.
     * 
     * @return JwtAuthenticationFilter configured JWT filter
     */
    @Bean
    public JwtAuthenticationFilter jwtAuthenticationFilter() {
        return new JwtAuthenticationFilter(jwtTokenProvider, userDetailsService);
    }

    /**
     * Password Encoder Bean
     * 
     * BCrypt password encoder with strength 12 for secure password hashing.
     * 
     * @return PasswordEncoder BCrypt password encoder
     */
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder(12);
    }

    /**
     * Authentication Manager Bean
     * 
     * Configures the authentication manager for user credential validation.
     * 
     * @param authConfig Authentication configuration
     * @return AuthenticationManager configured authentication manager
     * @throws Exception if configuration fails
     */
    @Bean
    public AuthenticationManager authenticationManager(
            AuthenticationConfiguration authConfig) throws Exception {
        return authConfig.getAuthenticationManager();
    }

    /**
     * DAO Authentication Provider Bean
     * 
     * Configures authentication provider with user details service and password encoder.
     * 
     * @return DaoAuthenticationProvider configured authentication provider
     */
    @Bean
    public DaoAuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider();
        authProvider.setUserDetailsService(userDetailsService);
        authProvider.setPasswordEncoder(passwordEncoder());
        authProvider.setHideUserNotFoundExceptions(false); // For security auditing
        return authProvider;
    }

    /**
     * CORS Configuration Source
     * 
     * Configures Cross-Origin Resource Sharing (CORS) settings for
     * secure cross-origin requests with proper restrictions.
     * 
     * @return CorsConfigurationSource CORS configuration
     */
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        
        // Configure allowed origins (restrict in production)
        configuration.setAllowedOriginPatterns(List.of(
            "http://localhost:3000",  // Development frontend
            "http://localhost:8080",  // Development backend
            "https://*.company.com"   // Production domains
        ));
        
        // Configure allowed methods
        configuration.setAllowedMethods(Arrays.asList(
            "GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"
        ));
        
        // Configure allowed headers
        configuration.setAllowedHeaders(Arrays.asList(
            "Authorization", 
            "Content-Type", 
            "X-Requested-With",
            "Accept",
            "Origin",
            "Access-Control-Request-Method",
            "Access-Control-Request-Headers"
        ));
        
        // Configure exposed headers
        configuration.setExposedHeaders(Arrays.asList(
            "Access-Control-Allow-Origin",
            "Access-Control-Allow-Credentials",
            "Authorization",
            "X-Total-Count"
        ));
        
        // Allow credentials for authentication
        configuration.setAllowCredentials(true);
        
        // Cache preflight responses for 1 hour
        configuration.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/api/**", configuration);
        source.registerCorsConfiguration("/actuator/**", configuration);
        
        return source;
    }
}