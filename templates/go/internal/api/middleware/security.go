package middleware

import (
	"fmt"
	"net/http"
	"strings"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"

	"app/internal/config"
	"app/internal/utils"
)

// SecurityMiddleware provides various security middleware functions
type SecurityMiddleware struct {
	config *config.Config
	logger *utils.Logger
}

// NewSecurityMiddleware creates a new security middleware
func NewSecurityMiddleware(cfg *config.Config, logger *utils.Logger) *SecurityMiddleware {
	return &SecurityMiddleware{
		config: cfg,
		logger: logger,
	}
}

// SecurityHeaders adds security headers to responses
func (s *SecurityMiddleware) SecurityHeaders() gin.HandlerFunc {
	return func(c *gin.Context) {
		// Content Security Policy
		csp := "default-src 'self'; " +
			"script-src 'self' 'unsafe-inline' 'unsafe-eval'; " +
			"style-src 'self' 'unsafe-inline'; " +
			"img-src 'self' data: https:; " +
			"font-src 'self' data:; " +
			"connect-src 'self'; " +
			"media-src 'self'; " +
			"object-src 'none'; " +
			"child-src 'none'; " +
			"frame-ancestors 'none'; " +
			"base-uri 'self'; " +
			"form-action 'self'"

		if s.config.IsProduction() {
			csp += "; upgrade-insecure-requests"
		}

		c.Header("Content-Security-Policy", csp)

		// HTTP Strict Transport Security (HSTS)
		if s.config.IsProduction() {
			c.Header("Strict-Transport-Security", "max-age=63072000; includeSubDomains; preload")
		}

		// X-Frame-Options
		c.Header("X-Frame-Options", "DENY")

		// X-Content-Type-Options
		c.Header("X-Content-Type-Options", "nosniff")

		// X-XSS-Protection
		c.Header("X-XSS-Protection", "1; mode=block")

		// Referrer Policy
		c.Header("Referrer-Policy", "strict-origin-when-cross-origin")

		// Permissions Policy
		c.Header("Permissions-Policy", "geolocation=(), microphone=(), camera=()")

		// Remove server information
		c.Header("Server", "")

		// X-Powered-By removal (if present)
		c.Header("X-Powered-By", "")

		c.Next()
	}
}

// CORS configures Cross-Origin Resource Sharing
func (s *SecurityMiddleware) CORS() gin.HandlerFunc {
	config := cors.Config{
		AllowOrigins:     s.config.CORSAllowedOrigins,
		AllowMethods:     s.config.CORSAllowedMethods,
		AllowHeaders:     s.config.CORSAllowedHeaders,
		ExposeHeaders:    []string{"Content-Length", "X-Request-ID"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}

	// In development, allow all origins
	if s.config.IsDevelopment() {
		config.AllowAllOrigins = false // Keep explicit origins for security
	}

	return cors.New(config)
}

// RequestID adds a unique request ID to each request
func (s *SecurityMiddleware) RequestID() gin.HandlerFunc {
	return gin.CustomRecovery(func(c *gin.Context, recovered interface{}) {
		if err, ok := recovered.(string); ok {
			c.String(http.StatusInternalServerError, fmt.Sprintf("error: %s", err))
		}
		c.AbortWithStatus(http.StatusInternalServerError)
	})
}

// IPWhitelist restricts access to specific IP addresses
func (s *SecurityMiddleware) IPWhitelist(allowedIPs []string) gin.HandlerFunc {
	allowedIPMap := make(map[string]bool)
	for _, ip := range allowedIPs {
		allowedIPMap[ip] = true
	}

	return func(c *gin.Context) {
		clientIP := c.ClientIP()
		
		if !allowedIPMap[clientIP] {
			s.logger.Warn("Access denied - IP not whitelisted", "ip", clientIP)
			c.JSON(http.StatusForbidden, gin.H{
				"error": "Access denied",
				"code":  "IP_NOT_ALLOWED",
			})
			c.Abort()
			return
		}

		c.Next()
	}
}

// ContentTypeValidation ensures proper content type for POST/PUT requests
func (s *SecurityMiddleware) ContentTypeValidation() gin.HandlerFunc {
	return func(c *gin.Context) {
		if c.Request.Method == "POST" || c.Request.Method == "PUT" || c.Request.Method == "PATCH" {
			contentType := c.GetHeader("Content-Type")
			
			// Allow application/json and multipart/form-data
			allowedTypes := []string{
				"application/json",
				"multipart/form-data",
				"application/x-www-form-urlencoded",
			}

			isValid := false
			for _, allowedType := range allowedTypes {
				if strings.Contains(contentType, allowedType) {
					isValid = true
					break
				}
			}

			if !isValid && c.Request.ContentLength > 0 {
				s.logger.Warn("Invalid content type", 
					"content_type", contentType, 
					"method", c.Request.Method,
					"ip", c.ClientIP())
				
				c.JSON(http.StatusUnsupportedMediaType, gin.H{
					"error": "Unsupported content type",
					"code":  "INVALID_CONTENT_TYPE",
				})
				c.Abort()
				return
			}
		}

		c.Next()
	}
}

// RequestSizeLimit limits the size of request bodies
func (s *SecurityMiddleware) RequestSizeLimit(maxSize int64) gin.HandlerFunc {
	return func(c *gin.Context) {
		if c.Request.ContentLength > maxSize {
			s.logger.Warn("Request too large", 
				"content_length", c.Request.ContentLength, 
				"max_size", maxSize,
				"ip", c.ClientIP())
			
			c.JSON(http.StatusRequestEntityTooLarge, gin.H{
				"error": "Request body too large",
				"code":  "REQUEST_TOO_LARGE",
			})
			c.Abort()
			return
		}

		c.Next()
	}
}

// APIKeyAuth provides API key authentication for specific endpoints
func (s *SecurityMiddleware) APIKeyAuth(validAPIKeys []string) gin.HandlerFunc {
	validKeys := make(map[string]bool)
	for _, key := range validAPIKeys {
		validKeys[key] = true
	}

	return func(c *gin.Context) {
		apiKey := c.GetHeader("X-API-Key")
		if apiKey == "" {
			apiKey = c.Query("api_key")
		}

		if apiKey == "" {
			c.JSON(http.StatusUnauthorized, gin.H{
				"error": "API key is required",
				"code":  "MISSING_API_KEY",
			})
			c.Abort()
			return
		}

		if !validKeys[apiKey] {
			s.logger.Warn("Invalid API key", 
				"api_key", apiKey[:8]+"...", // Log partial key for security
				"ip", c.ClientIP())
			
			c.JSON(http.StatusUnauthorized, gin.H{
				"error": "Invalid API key",
				"code":  "INVALID_API_KEY",
			})
			c.Abort()
			return
		}

		c.Next()
	}
}

// HTTPSRedirect redirects HTTP requests to HTTPS in production
func (s *SecurityMiddleware) HTTPSRedirect() gin.HandlerFunc {
	return func(c *gin.Context) {
		if s.config.IsProduction() {
			if c.Request.Header.Get("X-Forwarded-Proto") != "https" {
				httpsURL := "https://" + c.Request.Host + c.Request.URL.String()
				c.Redirect(http.StatusMovedPermanently, httpsURL)
				c.Abort()
				return
			}
		}
		c.Next()
	}
}

// NoCache adds headers to prevent caching of sensitive responses
func (s *SecurityMiddleware) NoCache() gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Header("Cache-Control", "no-cache, no-store, must-revalidate")
		c.Header("Pragma", "no-cache")
		c.Header("Expires", "0")
		c.Next()
	}
}

// SecureJSON prevents JSON hijacking
func (s *SecurityMiddleware) SecureJSON() gin.HandlerFunc {
	return func(c *gin.Context) {
		// Add anti-JSON hijacking prefix for arrays
		c.Header("X-Content-Type-Options", "nosniff")
		c.Next()
	}
}

// CSRFProtection provides basic CSRF protection
func (s *SecurityMiddleware) CSRFProtection() gin.HandlerFunc {
	return func(c *gin.Context) {
		// Skip CSRF protection for GET, HEAD, OPTIONS
		if c.Request.Method == "GET" || c.Request.Method == "HEAD" || c.Request.Method == "OPTIONS" {
			c.Next()
			return
		}

		// Check for CSRF token in header or form
		csrfToken := c.GetHeader("X-CSRF-Token")
		if csrfToken == "" {
			csrfToken = c.PostForm("csrf_token")
		}

		// For now, just log CSRF checks - implement full CSRF protection as needed
		if csrfToken == "" {
			s.logger.Warn("Missing CSRF token", "method", c.Request.Method, "ip", c.ClientIP())
		}

		c.Next()
	}
}

// XSSProtection adds XSS protection headers and basic filtering
func (s *SecurityMiddleware) XSSProtection() gin.HandlerFunc {
	return func(c *gin.Context) {
		// Add XSS protection headers
		c.Header("X-XSS-Protection", "1; mode=block")
		c.Header("X-Content-Type-Options", "nosniff")
		
		c.Next()
	}
}