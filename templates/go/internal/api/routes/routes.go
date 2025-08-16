package routes

import (
	"github.com/gin-gonic/gin"
	"github.com/go-redis/redis/v8"
	"gorm.io/gorm"

	"app/internal/api/handlers"
	"app/internal/api/middleware"
	"app/internal/auth"
	"app/internal/config"
	"app/internal/repository/postgres"
	"app/internal/services"
	"app/internal/utils"
)

// Dependencies holds all dependencies needed for route setup
type Dependencies struct {
	DB          *gorm.DB
	RedisClient *redis.Client
	Config      *config.Config
	Logger      *utils.Logger
}

// Setup configures all routes and middleware
func Setup(router *gin.Engine, deps *Dependencies) {
	// Initialize services
	userRepo := postgres.NewUserRepository(deps.DB)
	jwtService := auth.NewJWTService(deps.Config.JWTSecret, "go-api", deps.Config.JWTExpirationHours)
	passwordService := auth.NewPasswordService(deps.Config.BCryptCost)
	sessionService := auth.NewSessionService(deps.RedisClient, deps.Config.SessionTimeout)
	authService := services.NewAuthService(userRepo, jwtService, passwordService, sessionService, deps.RedisClient, deps.Config, deps.Logger, deps.DB)

	// Initialize middleware
	authMiddleware := middleware.NewAuthMiddleware(jwtService, deps.Logger)
	securityMiddleware := middleware.NewSecurityMiddleware(deps.Config, deps.Logger)
	rateLimiter := middleware.NewRateLimiter(deps.RedisClient, deps.Config, deps.Logger)

	// Initialize handlers
	authHandler := handlers.NewAuthHandler(authService, deps.Logger)
	healthHandler := handlers.NewHealthHandler(deps.DB, deps.RedisClient, deps.Logger)

	// Global middleware
	router.Use(securityMiddleware.SecurityHeaders())
	router.Use(securityMiddleware.CORS())
	router.Use(rateLimiter.GlobalRateLimit())
	router.Use(middleware.RequestLogger(deps.Logger))
	router.Use(gin.Recovery())

	// Health check routes (no authentication required)
	health := router.Group("/health")
	{
		health.GET("/", healthHandler.Health)
		health.GET("/readiness", healthHandler.Readiness)
		health.GET("/liveness", healthHandler.Liveness)
	}

	// API v1 routes
	v1 := router.Group("/api/v1")
	{
		// Authentication routes (public)
		auth := v1.Group("/auth")
		auth.Use(rateLimiter.AuthRateLimit())
		{
			auth.POST("/register", authHandler.Register)
			auth.POST("/login", authHandler.Login)
			auth.POST("/refresh", authHandler.RefreshToken)
			auth.POST("/forgot-password", authHandler.ForgotPassword)
			auth.POST("/reset-password", authHandler.ResetPassword)
			auth.POST("/verify-email", authHandler.VerifyEmail)
		}

		// Protected routes (authentication required)
		protected := v1.Group("/")
		protected.Use(authMiddleware.RequireAuth())
		protected.Use(rateLimiter.APIRateLimit())
		{
			// User profile routes
			user := protected.Group("/user")
			{
				user.GET("/profile", authHandler.GetProfile)
				user.PUT("/profile", authHandler.UpdateProfile)
				user.POST("/change-password", authHandler.ChangePassword)
				user.POST("/logout", authHandler.Logout)
				user.GET("/sessions", authHandler.GetSessions)
				user.DELETE("/sessions/:session_id", authHandler.RevokeSession)
			}

			// Admin routes (admin role required)
			admin := protected.Group("/admin")
			admin.Use(authMiddleware.RequireRole("admin"))
			{
				// User management
				users := admin.Group("/users")
				{
					users.GET("/", authHandler.ListUsers)
					users.GET("/:id", authHandler.GetUser)
					users.PUT("/:id", authHandler.UpdateUser)
					users.DELETE("/:id", authHandler.DeleteUser)
					users.POST("/:id/activate", authHandler.ActivateUser)
					users.POST("/:id/deactivate", authHandler.DeactivateUser)
					users.POST("/:id/unlock", authHandler.UnlockUser)
				}

				// System information
				system := admin.Group("/system")
				{
					system.GET("/stats", authHandler.GetSystemStats)
					system.GET("/audit-logs", authHandler.GetAuditLogs)
				}
			}
		}
	}

	// Metrics endpoint (if enabled)
	if deps.Config.MetricsEnabled {
		router.GET("/metrics", handlers.PrometheusHandler())
	}

	// Catch-all route for 404
	router.NoRoute(func(c *gin.Context) {
		c.JSON(404, gin.H{
			"error": "Route not found",
			"code":  "ROUTE_NOT_FOUND",
		})
	})
}