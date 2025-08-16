package com.company.project.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.time.Instant;
import java.util.HashMap;
import java.util.Map;

/**
 * JWT Authentication Entry Point
 * 
 * Custom authentication entry point that handles unauthorized access attempts
 * with security-conscious error responses and comprehensive logging.
 * 
 * Security Features:
 * - Structured error responses without sensitive information disclosure
 * - Comprehensive security event logging for monitoring
 * - Consistent error format across all authentication failures
 * - Client IP tracking for security analysis
 * - Request path logging for attack pattern detection
 * 
 * Error Response Format:
 * - HTTP 401 Unauthorized status
 * - JSON error response with standardized structure
 * - Timestamp for correlation with logs
 * - Request path for client debugging
 * - No sensitive system information disclosure
 * 
 * @author Spring Boot Professional Template
 * @version 1.0.0
 * @since 2024-01-01
 */
@Slf4j
@Component
public class JwtAuthenticationEntryPoint implements AuthenticationEntryPoint {

    private final ObjectMapper objectMapper = new ObjectMapper();

    /**
     * Handle authentication entry point for unauthorized requests
     * 
     * This method is invoked when a user tries to access a protected resource
     * without proper authentication credentials.
     * 
     * @param request HTTP request that caused the authentication exception
     * @param response HTTP response to send to client
     * @param authException Authentication exception that triggered this entry point
     * @throws IOException if response writing fails
     */
    @Override
    public void commence(
            HttpServletRequest request,
            HttpServletResponse response,
            AuthenticationException authException) throws IOException {

        // Extract request information for logging
        String requestUri = request.getRequestURI();
        String method = request.getMethod();
        String clientIp = getClientIpAddress(request);
        String userAgent = request.getHeader("User-Agent");
        
        // Log security event for monitoring
        log.warn("Unauthorized access attempt - IP: {}, Method: {}, Path: {}, User-Agent: {}, Exception: {}", 
                clientIp, method, requestUri, userAgent, authException.getMessage());

        // Set response status and content type
        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");

        // Add security headers
        addSecurityHeaders(response);

        // Create error response
        Map<String, Object> errorResponse = createErrorResponse(requestUri, authException);

        // Write JSON response
        response.getWriter().write(objectMapper.writeValueAsString(errorResponse));
    }

    /**
     * Create standardized error response
     * 
     * @param requestUri Request URI that caused the error
     * @param authException Authentication exception
     * @return Map error response structure
     */
    private Map<String, Object> createErrorResponse(String requestUri, AuthenticationException authException) {
        Map<String, Object> errorResponse = new HashMap<>();
        
        // Standard error information
        errorResponse.put("error", "Unauthorized");
        errorResponse.put("message", "Authentication required to access this resource");
        errorResponse.put("status", 401);
        errorResponse.put("path", requestUri);
        errorResponse.put("timestamp", Instant.now().toString());
        
        // Add specific error details based on exception type
        String errorCode = determineErrorCode(authException);
        errorResponse.put("errorCode", errorCode);
        
        // Add hints for client applications (without exposing security details)
        Map<String, String> hints = new HashMap<>();
        hints.put("action", "Please provide valid authentication credentials");
        hints.put("header", "Include 'Authorization: Bearer <token>' header");
        
        // Add additional hints based on error type
        switch (errorCode) {
            case "TOKEN_EXPIRED":
                hints.put("solution", "Refresh your authentication token");
                break;
            case "TOKEN_MALFORMED":
                hints.put("solution", "Ensure token format is correct");
                break;
            case "TOKEN_MISSING":
                hints.put("solution", "Include Authorization header with Bearer token");
                break;
            default:
                hints.put("solution", "Verify your authentication credentials");
        }
        
        errorResponse.put("hints", hints);
        
        return errorResponse;
    }

    /**
     * Determine specific error code based on exception
     * 
     * @param authException Authentication exception
     * @return String error code for client debugging
     */
    private String determineErrorCode(AuthenticationException authException) {
        String message = authException.getMessage();
        
        if (message == null) {
            return "AUTH_REQUIRED";
        }
        
        // Analyze exception message to provide appropriate error code
        if (message.contains("expired")) {
            return "TOKEN_EXPIRED";
        } else if (message.contains("malformed") || message.contains("invalid")) {
            return "TOKEN_MALFORMED";
        } else if (message.contains("missing") || message.contains("required")) {
            return "TOKEN_MISSING";
        } else if (message.contains("signature")) {
            return "TOKEN_INVALID_SIGNATURE";
        } else if (message.contains("blacklist")) {
            return "TOKEN_REVOKED";
        } else {
            return "AUTH_REQUIRED";
        }
    }

    /**
     * Add security headers to response
     * 
     * @param response HTTP response
     */
    private void addSecurityHeaders(HttpServletResponse response) {
        // Prevent caching of error responses
        response.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
        response.setHeader("Pragma", "no-cache");
        response.setHeader("Expires", "0");
        
        // Security headers
        response.setHeader("X-Content-Type-Options", "nosniff");
        response.setHeader("X-Frame-Options", "DENY");
        response.setHeader("X-XSS-Protection", "1; mode=block");
        response.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
        
        // CORS headers for error responses
        response.setHeader("Access-Control-Allow-Origin", "*");
        response.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
        response.setHeader("Access-Control-Allow-Headers", "Authorization, Content-Type, X-Requested-With");
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
            if (ip != null && !ip.isEmpty() && !"unknown".equalsIgnoreCase(ip)) {
                // Handle comma-separated IPs (take first one)
                if (ip.contains(",")) {
                    ip = ip.split(",")[0].trim();
                }
                return ip;
            }
        }

        return request.getRemoteAddr();
    }
}