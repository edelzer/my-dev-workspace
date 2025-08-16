package middleware

import (
	"fmt"
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"

	"app/internal/auth"
	"app/internal/utils"
)

// AuthMiddleware handles JWT authentication
type AuthMiddleware struct {
	jwtService *auth.JWTService
	logger     *utils.Logger
}

// NewAuthMiddleware creates a new authentication middleware
func NewAuthMiddleware(jwtService *auth.JWTService, logger *utils.Logger) *AuthMiddleware {
	return &AuthMiddleware{
		jwtService: jwtService,
		logger:     logger,
	}
}

// RequireAuth middleware that requires valid JWT authentication
func (a *AuthMiddleware) RequireAuth() gin.HandlerFunc {
	return func(c *gin.Context) {
		// Get Authorization header
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			c.JSON(http.StatusUnauthorized, gin.H{
				"error": "Authorization header is required",
				"code":  "MISSING_AUTH_HEADER",
			})
			c.Abort()
			return
		}

		// Extract token from header
		token, err := a.jwtService.ExtractTokenFromHeader(authHeader)
		if err != nil {
			a.logger.Warn("Invalid authorization header format", "error", err, "ip", c.ClientIP())
			c.JSON(http.StatusUnauthorized, gin.H{
				"error": "Invalid authorization header format",
				"code":  "INVALID_AUTH_HEADER",
			})
			c.Abort()
			return
		}

		// Validate token
		claims, err := a.jwtService.ValidateToken(token)
		if err != nil {
			a.logger.Warn("Invalid JWT token", "error", err, "ip", c.ClientIP())
			c.JSON(http.StatusUnauthorized, gin.H{
				"error": "Invalid or expired token",
				"code":  "INVALID_TOKEN",
			})
			c.Abort()
			return
		}

		// Store user information in context
		c.Set("user_id", claims.UserID)
		c.Set("user_email", claims.Email)
		c.Set("user_username", claims.Username)
		c.Set("user_roles", claims.Roles)
		c.Set("user_permissions", claims.Permissions)
		c.Set("token_claims", claims)

		a.logger.Debug("User authenticated successfully", 
			"user_id", claims.UserID, 
			"email", claims.Email,
			"ip", c.ClientIP())

		c.Next()
	}
}

// OptionalAuth middleware that extracts user info if token is present but doesn't require it
func (a *AuthMiddleware) OptionalAuth() gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			c.Next()
			return
		}

		token, err := a.jwtService.ExtractTokenFromHeader(authHeader)
		if err != nil {
			c.Next()
			return
		}

		claims, err := a.jwtService.ValidateToken(token)
		if err != nil {
			c.Next()
			return
		}

		// Store user information in context
		c.Set("user_id", claims.UserID)
		c.Set("user_email", claims.Email)
		c.Set("user_username", claims.Username)
		c.Set("user_roles", claims.Roles)
		c.Set("user_permissions", claims.Permissions)
		c.Set("token_claims", claims)

		c.Next()
	}
}

// RequireRole middleware that requires specific role
func (a *AuthMiddleware) RequireRole(requiredRole string) gin.HandlerFunc {
	return func(c *gin.Context) {
		// First check if user is authenticated
		userRoles, exists := c.Get("user_roles")
		if !exists {
			c.JSON(http.StatusUnauthorized, gin.H{
				"error": "Authentication required",
				"code":  "AUTHENTICATION_REQUIRED",
			})
			c.Abort()
			return
		}

		roles, ok := userRoles.([]string)
		if !ok {
			c.JSON(http.StatusInternalServerError, gin.H{
				"error": "Invalid user roles data",
				"code":  "INVALID_ROLES_DATA",
			})
			c.Abort()
			return
		}

		// Check if user has required role
		hasRole := false
		for _, role := range roles {
			if role == requiredRole || role == "admin" { // Admin has access to everything
				hasRole = true
				break
			}
		}

		if !hasRole {
			userID, _ := c.Get("user_id")
			a.logger.Warn("Access denied - insufficient role", 
				"user_id", userID, 
				"required_role", requiredRole,
				"user_roles", roles,
				"ip", c.ClientIP())
			
			c.JSON(http.StatusForbidden, gin.H{
				"error": "Insufficient permissions",
				"code":  "INSUFFICIENT_ROLE",
			})
			c.Abort()
			return
		}

		c.Next()
	}
}

// RequirePermission middleware that requires specific permission
func (a *AuthMiddleware) RequirePermission(requiredPermission string) gin.HandlerFunc {
	return func(c *gin.Context) {
		// First check if user is authenticated
		userPermissions, exists := c.Get("user_permissions")
		if !exists {
			c.JSON(http.StatusUnauthorized, gin.H{
				"error": "Authentication required",
				"code":  "AUTHENTICATION_REQUIRED",
			})
			c.Abort()
			return
		}

		permissions, ok := userPermissions.([]string)
		if !ok {
			c.JSON(http.StatusInternalServerError, gin.H{
				"error": "Invalid user permissions data",
				"code":  "INVALID_PERMISSIONS_DATA",
			})
			c.Abort()
			return
		}

		// Check if user has required permission
		hasPermission := false
		for _, permission := range permissions {
			if permission == requiredPermission || permission == "*" {
				hasPermission = true
				break
			}
			// Check for wildcard permissions (e.g., "user:*" matches "user:read")
			if strings.HasSuffix(permission, "*") {
				prefix := permission[:len(permission)-1]
				if strings.HasPrefix(requiredPermission, prefix) {
					hasPermission = true
					break
				}
			}
		}

		if !hasPermission {
			userID, _ := c.Get("user_id")
			a.logger.Warn("Access denied - insufficient permission", 
				"user_id", userID, 
				"required_permission", requiredPermission,
				"user_permissions", permissions,
				"ip", c.ClientIP())
			
			c.JSON(http.StatusForbidden, gin.H{
				"error": "Insufficient permissions",
				"code":  "INSUFFICIENT_PERMISSION",
			})
			c.Abort()
			return
		}

		c.Next()
	}
}

// RequireOwnershipOrRole middleware that requires either ownership of resource or specific role
func (a *AuthMiddleware) RequireOwnershipOrRole(getResourceOwnerID func(*gin.Context) (uuid.UUID, error), allowedRole string) gin.HandlerFunc {
	return func(c *gin.Context) {
		userID, exists := c.Get("user_id")
		if !exists {
			c.JSON(http.StatusUnauthorized, gin.H{
				"error": "Authentication required",
				"code":  "AUTHENTICATION_REQUIRED",
			})
			c.Abort()
			return
		}

		currentUserID, ok := userID.(uuid.UUID)
		if !ok {
			c.JSON(http.StatusInternalServerError, gin.H{
				"error": "Invalid user ID data",
				"code":  "INVALID_USER_ID",
			})
			c.Abort()
			return
		}

		// Check if user has the allowed role (e.g., admin)
		userRoles, _ := c.Get("user_roles")
		if roles, ok := userRoles.([]string); ok {
			for _, role := range roles {
				if role == allowedRole {
					c.Next()
					return
				}
			}
		}

		// Check ownership
		resourceOwnerID, err := getResourceOwnerID(c)
		if err != nil {
			a.logger.Error("Failed to get resource owner ID", "error", err)
			c.JSON(http.StatusInternalServerError, gin.H{
				"error": "Failed to verify ownership",
				"code":  "OWNERSHIP_CHECK_FAILED",
			})
			c.Abort()
			return
		}

		if currentUserID != resourceOwnerID {
			a.logger.Warn("Access denied - not owner", 
				"user_id", currentUserID, 
				"resource_owner_id", resourceOwnerID,
				"ip", c.ClientIP())
			
			c.JSON(http.StatusForbidden, gin.H{
				"error": "Access denied - not owner of resource",
				"code":  "NOT_OWNER",
			})
			c.Abort()
			return
		}

		c.Next()
	}
}

// GetCurrentUser returns the current authenticated user from context
func GetCurrentUser(c *gin.Context) (*CurrentUser, error) {
	userID, exists := c.Get("user_id")
	if !exists {
		return nil, fmt.Errorf("user not authenticated")
	}

	id, ok := userID.(uuid.UUID)
	if !ok {
		return nil, fmt.Errorf("invalid user ID format")
	}

	email, _ := c.Get("user_email")
	username, _ := c.Get("user_username")
	roles, _ := c.Get("user_roles")
	permissions, _ := c.Get("user_permissions")

	return &CurrentUser{
		ID:          id,
		Email:       email.(string),
		Username:    username.(string),
		Roles:       roles.([]string),
		Permissions: permissions.([]string),
	}, nil
}

// CurrentUser represents the current authenticated user
type CurrentUser struct {
	ID          uuid.UUID `json:"id"`
	Email       string    `json:"email"`
	Username    string    `json:"username"`
	Roles       []string  `json:"roles"`
	Permissions []string  `json:"permissions"`
}

// HasRole checks if the current user has a specific role
func (u *CurrentUser) HasRole(role string) bool {
	for _, userRole := range u.Roles {
		if userRole == role || userRole == "admin" {
			return true
		}
	}
	return false
}

// HasPermission checks if the current user has a specific permission
func (u *CurrentUser) HasPermission(permission string) bool {
	for _, userPermission := range u.Permissions {
		if userPermission == permission || userPermission == "*" {
			return true
		}
		// Check for wildcard permissions
		if strings.HasSuffix(userPermission, "*") {
			prefix := userPermission[:len(userPermission)-1]
			if strings.HasPrefix(permission, prefix) {
				return true
			}
		}
	}
	return false
}

// IsAdmin checks if the current user is an admin
func (u *CurrentUser) IsAdmin() bool {
	return u.HasRole("admin")
}