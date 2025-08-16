package com.company.project.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;
import java.util.stream.Collectors;

/**
 * JWT Authentication Filter
 * 
 * Custom filter that intercepts HTTP requests to validate JWT tokens
 * and establish authentication context for authorized requests.
 * 
 * Filter Process:
 * 1. Extract JWT token from Authorization header
 * 2. Validate token signature and expiration
 * 3. Check token blacklist for revoked tokens
 * 4. Extract user information and roles from token
 * 5. Load user details and set authentication context
 * 6. Continue filter chain with authenticated user
 * 
 * Security Features:
 * - Bearer token extraction and validation
 * - Comprehensive error handling and logging
 * - Security context management
 * - Request details injection for auditing
 * - Protection against token tampering
 * 
 * Error Handling:
 * - Invalid tokens are logged and ignored
 * - Malformed headers are handled gracefully
 * - Authentication failures are tracked for monitoring
 * - No exceptions thrown to prevent information disclosure
 * 
 * @author Spring Boot Professional Template
 * @version 1.0.0
 * @since 2024-01-01
 */
@Slf4j
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtTokenProvider jwtTokenProvider;
    private final UserDetailsService userDetailsService;

    private static final String AUTHORIZATION_HEADER = "Authorization";
    private static final String BEARER_PREFIX = "Bearer ";

    /**
     * Main filter method that processes each HTTP request
     * 
     * @param request HTTP request
     * @param response HTTP response
     * @param filterChain Filter chain to continue processing
     * @throws ServletException if servlet processing fails
     * @throws IOException if I/O operation fails
     */
    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain) throws ServletException, IOException {

        try {
            // Extract JWT token from request
            String token = extractTokenFromRequest(request);
            
            // Validate token and set authentication if valid
            if (token != null && jwtTokenProvider.validateToken(token)) {
                setAuthenticationFromToken(token, request);
            } else if (token != null) {
                // Log invalid token attempt for security monitoring
                log.warn("Invalid JWT token attempt from IP: {} for path: {}", 
                        getClientIpAddress(request), request.getRequestURI());
            }
            
        } catch (Exception ex) {
            // Log authentication errors but don't block request
            log.error("Authentication error in JWT filter: {}", ex.getMessage());
            
            // Clear security context on error
            SecurityContextHolder.clearContext();
        }

        // Continue with filter chain
        filterChain.doFilter(request, response);
    }

    /**
     * Extract JWT token from Authorization header
     * 
     * Supports Bearer token format: "Bearer <token>"
     * 
     * @param request HTTP request
     * @return String JWT token or null if not found
     */
    private String extractTokenFromRequest(HttpServletRequest request) {
        String bearerToken = request.getHeader(AUTHORIZATION_HEADER);
        
        if (StringUtils.hasText(bearerToken) && bearerToken.startsWith(BEARER_PREFIX)) {
            String token = bearerToken.substring(BEARER_PREFIX.length());
            
            // Basic token format validation
            if (StringUtils.hasText(token) && token.split("\\.").length == 3) {
                return token;
            } else {
                log.debug("Malformed JWT token format");
            }
        }
        
        return null;
    }

    /**
     * Set authentication context from valid JWT token
     * 
     * @param token Valid JWT token
     * @param request HTTP request for details
     */
    private void setAuthenticationFromToken(String token, HttpServletRequest request) {
        try {
            // Extract user information from token
            Long userId = jwtTokenProvider.getUserIdFromToken(token);
            String username = jwtTokenProvider.getUsernameFromToken(token);
            List<String> roles = jwtTokenProvider.getRolesFromToken(token);
            
            // Convert roles to authorities
            List<SimpleGrantedAuthority> authorities = roles.stream()
                    .map(SimpleGrantedAuthority::new)
                    .collect(Collectors.toList());

            // Load user details for complete authentication
            UserDetails userDetails = userDetailsService.loadUserByUsername(username);
            
            // Create authentication token
            UsernamePasswordAuthenticationToken authentication = 
                    new UsernamePasswordAuthenticationToken(
                            userDetails, null, authorities);
            
            // Set request details for auditing
            authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
            
            // Set authentication in security context
            SecurityContextHolder.getContext().setAuthentication(authentication);
            
            log.debug("Authentication set for user: {} with roles: {}", username, roles);
            
        } catch (Exception ex) {
            log.error("Error setting authentication from token: {}", ex.getMessage());
            SecurityContextHolder.clearContext();
        }
    }

    /**
     * Extract client IP address from request
     * 
     * Handles various proxy headers for accurate IP determination.
     * 
     * @param request HTTP request
     * @return String client IP address
     */
    private String getClientIpAddress(HttpServletRequest request) {
        String[] headerNames = {
            "X-Forwarded-For",
            "Proxy-Client-IP",
            "WL-Proxy-Client-IP",
            "HTTP_X_FORWARDED_FOR",
            "HTTP_X_FORWARDED",
            "HTTP_X_CLUSTER_CLIENT_IP",
            "HTTP_CLIENT_IP",
            "HTTP_FORWARDED_FOR",
            "HTTP_FORWARDED",
            "HTTP_VIA",
            "REMOTE_ADDR"
        };

        for (String header : headerNames) {
            String ip = request.getHeader(header);
            if (StringUtils.hasText(ip) && !"unknown".equalsIgnoreCase(ip)) {
                // Handle comma-separated IPs (take first one)
                if (ip.contains(",")) {
                    ip = ip.split(",")[0].trim();
                }
                return ip;
            }
        }

        return request.getRemoteAddr();
    }

    /**
     * Determine if filter should be applied to request
     * 
     * Skip authentication for certain paths that don't require it.
     * 
     * @param request HTTP request
     * @return boolean true if filter should not be applied
     */
    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String path = request.getRequestURI();
        
        // Skip authentication for public endpoints
        return path.startsWith("/api/v1/auth/login") ||
               path.startsWith("/api/v1/auth/register") ||
               path.startsWith("/api/v1/auth/verify") ||
               path.startsWith("/api/v1/auth/forgot-password") ||
               path.startsWith("/api/v1/auth/reset-password") ||
               path.startsWith("/actuator/health") ||
               path.startsWith("/actuator/info") ||
               (path.startsWith("/swagger-ui") && isSwaggerEnabled()) ||
               (path.startsWith("/v3/api-docs") && isSwaggerEnabled());
    }

    /**
     * Check if Swagger is enabled (development/staging only)
     * 
     * @return boolean true if Swagger should be accessible
     */
    private boolean isSwaggerEnabled() {
        String profile = System.getProperty("spring.profiles.active", "development");
        return "development".equals(profile) || "staging".equals(profile);
    }
}