package middleware

import (
	"context"
	"fmt"
	"net/http"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/go-redis/redis/v8"

	"app/internal/config"
	"app/internal/utils"
)

// RateLimiter provides rate limiting functionality
type RateLimiter struct {
	redisClient *redis.Client
	config      *config.Config
	logger      *utils.Logger
}

// NewRateLimiter creates a new rate limiter
func NewRateLimiter(redisClient *redis.Client, cfg *config.Config, logger *utils.Logger) *RateLimiter {
	return &RateLimiter{
		redisClient: redisClient,
		config:      cfg,
		logger:      logger,
	}
}

// RateLimitConfig represents rate limiting configuration for different endpoints
type RateLimitConfig struct {
	Requests    int           // Number of requests allowed
	Window      time.Duration // Time window
	KeyFunc     KeyFunc       // Function to generate rate limit key
	SkipFunc    SkipFunc      // Function to determine if rate limiting should be skipped
	OnLimitFunc OnLimitFunc   // Function called when rate limit is exceeded
}

// KeyFunc generates a rate limiting key for the request
type KeyFunc func(*gin.Context) string

// SkipFunc determines if rate limiting should be skipped for this request
type SkipFunc func(*gin.Context) bool

// OnLimitFunc is called when rate limit is exceeded
type OnLimitFunc func(*gin.Context)

// DefaultKeyFunc generates a key based on client IP
func DefaultKeyFunc(c *gin.Context) string {
	return "rate_limit:" + c.ClientIP()
}

// IPKeyFunc generates a key based on client IP with prefix
func IPKeyFunc(prefix string) KeyFunc {
	return func(c *gin.Context) string {
		return fmt.Sprintf("rate_limit:%s:%s", prefix, c.ClientIP())
	}
}

// UserKeyFunc generates a key based on authenticated user
func UserKeyFunc(prefix string) KeyFunc {
	return func(c *gin.Context) string {
		userID, exists := c.Get("user_id")
		if !exists {
			return IPKeyFunc(prefix)(c)
		}
		return fmt.Sprintf("rate_limit:%s:user:%v", prefix, userID)
	}
}

// RateLimit applies rate limiting based on the provided configuration
func (rl *RateLimiter) RateLimit(config RateLimitConfig) gin.HandlerFunc {
	return func(c *gin.Context) {
		// Skip rate limiting if skip function returns true
		if config.SkipFunc != nil && config.SkipFunc(c) {
			c.Next()
			return
		}

		// Generate rate limiting key
		key := config.KeyFunc(c)
		if key == "" {
			key = DefaultKeyFunc(c)
		}

		// Check rate limit
		allowed, remaining, resetTime, err := rl.checkRateLimit(key, config.Requests, config.Window)
		if err != nil {
			rl.logger.Error("Rate limiting error", "error", err, "key", key)
			// On error, allow the request but log the issue
			c.Next()
			return
		}

		// Add rate limit headers
		c.Header("X-RateLimit-Limit", strconv.Itoa(config.Requests))
		c.Header("X-RateLimit-Remaining", strconv.Itoa(remaining))
		c.Header("X-RateLimit-Reset", strconv.FormatInt(resetTime.Unix(), 10))

		if !allowed {
			// Rate limit exceeded
			rl.logger.Warn("Rate limit exceeded", 
				"key", key,
				"ip", c.ClientIP(),
				"user_agent", c.GetHeader("User-Agent"))

			if config.OnLimitFunc != nil {
				config.OnLimitFunc(c)
			} else {
				c.JSON(http.StatusTooManyRequests, gin.H{
					"error":     "Rate limit exceeded",
					"code":      "RATE_LIMIT_EXCEEDED",
					"remaining": remaining,
					"reset_at":  resetTime.Unix(),
				})
			}
			c.Abort()
			return
		}

		c.Next()
	}
}

// checkRateLimit checks if a request is allowed under the rate limit
func (rl *RateLimiter) checkRateLimit(key string, requests int, window time.Duration) (allowed bool, remaining int, resetTime time.Time, err error) {
	ctx := context.Background()
	now := time.Now()
	windowStart := now.Truncate(window)
	resetTime = windowStart.Add(window)

	// Use Redis pipeline for atomic operations
	pipe := rl.redisClient.Pipeline()
	
	// Current count key
	countKey := fmt.Sprintf("%s:%d", key, windowStart.Unix())
	
	// Get current count
	getCmd := pipe.Get(ctx, countKey)
	
	// Increment count
	incrCmd := pipe.Incr(ctx, countKey)
	
	// Set expiration (only if this is the first increment)
	pipe.Expire(ctx, countKey, window)
	
	// Execute pipeline
	_, err = pipe.Exec(ctx)
	if err != nil && err != redis.Nil {
		return false, 0, resetTime, fmt.Errorf("failed to execute rate limit pipeline: %w", err)
	}

	// Get the incremented count
	currentCount := int(incrCmd.Val())
	
	// Check if limit is exceeded
	if currentCount > requests {
		return false, 0, resetTime, nil
	}

	remaining = requests - currentCount
	return true, remaining, resetTime, nil
}

// GlobalRateLimit applies global rate limiting by IP
func (rl *RateLimiter) GlobalRateLimit() gin.HandlerFunc {
	return rl.RateLimit(RateLimitConfig{
		Requests: rl.config.RateLimitRPS,
		Window:   time.Minute,
		KeyFunc:  IPKeyFunc("global"),
	})
}

// AuthRateLimit applies rate limiting for authentication endpoints
func (rl *RateLimiter) AuthRateLimit() gin.HandlerFunc {
	return rl.RateLimit(RateLimitConfig{
		Requests: 5, // 5 attempts per minute
		Window:   time.Minute,
		KeyFunc:  IPKeyFunc("auth"),
		OnLimitFunc: func(c *gin.Context) {
			c.JSON(http.StatusTooManyRequests, gin.H{
				"error":   "Too many authentication attempts",
				"code":    "AUTH_RATE_LIMIT_EXCEEDED",
				"message": "Please try again later",
			})
		},
	})
}

// APIRateLimit applies rate limiting for API endpoints
func (rl *RateLimiter) APIRateLimit() gin.HandlerFunc {
	return rl.RateLimit(RateLimitConfig{
		Requests: 100, // 100 requests per minute
		Window:   time.Minute,
		KeyFunc:  UserKeyFunc("api"),
		SkipFunc: func(c *gin.Context) bool {
			// Skip rate limiting for admin users
			userRoles, exists := c.Get("user_roles")
			if !exists {
				return false
			}
			roles, ok := userRoles.([]string)
			if !ok {
				return false
			}
			for _, role := range roles {
				if role == "admin" {
					return true
				}
			}
			return false
		},
	})
}

// StrictRateLimit applies strict rate limiting for sensitive endpoints
func (rl *RateLimiter) StrictRateLimit() gin.HandlerFunc {
	return rl.RateLimit(RateLimitConfig{
		Requests: 10, // 10 requests per hour
		Window:   time.Hour,
		KeyFunc:  IPKeyFunc("strict"),
	})
}

// BurstRateLimit allows burst requests with a longer window
func (rl *RateLimiter) BurstRateLimit(requests int, window time.Duration) gin.HandlerFunc {
	return rl.RateLimit(RateLimitConfig{
		Requests: requests,
		Window:   window,
		KeyFunc:  UserKeyFunc("burst"),
	})
}

// ProgressiveRateLimit applies progressive rate limiting with increasing restrictions
func (rl *RateLimiter) ProgressiveRateLimit() gin.HandlerFunc {
	return func(c *gin.Context) {
		ip := c.ClientIP()
		
		// Check different time windows with different limits
		windows := []struct {
			requests int
			window   time.Duration
			name     string
		}{
			{requests: 10, window: time.Minute, name: "minute"},
			{requests: 100, window: 10 * time.Minute, name: "10min"},
			{requests: 500, window: time.Hour, name: "hour"},
			{requests: 2000, window: 24 * time.Hour, name: "day"},
		}

		for _, w := range windows {
			key := fmt.Sprintf("progressive:%s:%s", w.name, ip)
			allowed, remaining, resetTime, err := rl.checkRateLimit(key, w.requests, w.window)
			
			if err != nil {
				rl.logger.Error("Progressive rate limiting error", "error", err, "window", w.name)
				continue
			}

			if !allowed {
				rl.logger.Warn("Progressive rate limit exceeded", 
					"ip", ip,
					"window", w.name,
					"limit", w.requests)

				c.Header("X-RateLimit-Limit", strconv.Itoa(w.requests))
				c.Header("X-RateLimit-Remaining", strconv.Itoa(remaining))
				c.Header("X-RateLimit-Reset", strconv.FormatInt(resetTime.Unix(), 10))
				c.Header("X-RateLimit-Window", w.name)

				c.JSON(http.StatusTooManyRequests, gin.H{
					"error":     "Rate limit exceeded",
					"code":      "PROGRESSIVE_RATE_LIMIT_EXCEEDED",
					"window":    w.name,
					"limit":     w.requests,
					"reset_at":  resetTime.Unix(),
				})
				c.Abort()
				return
			}
		}

		c.Next()
	}
}

// CleanupExpiredKeys removes expired rate limit keys (maintenance function)
func (rl *RateLimiter) CleanupExpiredKeys() error {
	// Redis automatically handles TTL expiration, but we can implement
	// custom cleanup logic here if needed for housekeeping
	return nil
}

// GetRateLimitStatus returns the current rate limit status for a key
func (rl *RateLimiter) GetRateLimitStatus(key string, requests int, window time.Duration) (remaining int, resetTime time.Time, err error) {
	ctx := context.Background()
	now := time.Now()
	windowStart := now.Truncate(window)
	resetTime = windowStart.Add(window)

	countKey := fmt.Sprintf("%s:%d", key, windowStart.Unix())
	
	currentCountStr, err := rl.redisClient.Get(ctx, countKey).Result()
	if err != nil {
		if err == redis.Nil {
			// No count yet, full limit available
			return requests, resetTime, nil
		}
		return 0, resetTime, fmt.Errorf("failed to get rate limit status: %w", err)
	}

	currentCount, err := strconv.Atoi(currentCountStr)
	if err != nil {
		return 0, resetTime, fmt.Errorf("invalid count value: %w", err)
	}

	remaining = requests - currentCount
	if remaining < 0 {
		remaining = 0
	}

	return remaining, resetTime, nil
}