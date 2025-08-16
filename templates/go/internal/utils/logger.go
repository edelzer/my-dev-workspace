package utils

import (
	"os"

	"log/slog"
)

// Logger wraps the structured logger
type Logger struct {
	*slog.Logger
}

// NewLogger creates a new structured logger
func NewLogger(level string, environment string) *Logger {
	var logLevel slog.Level
	switch level {
	case "debug":
		logLevel = slog.LevelDebug
	case "info":
		logLevel = slog.LevelInfo
	case "warn":
		logLevel = slog.LevelWarn
	case "error":
		logLevel = slog.LevelError
	default:
		logLevel = slog.LevelInfo
	}

	opts := &slog.HandlerOptions{
		Level: logLevel,
	}

	var handler slog.Handler
	if environment == "production" {
		// JSON handler for production
		handler = slog.NewJSONHandler(os.Stdout, opts)
	} else {
		// Text handler for development
		handler = slog.NewTextHandler(os.Stdout, opts)
	}

	logger := slog.New(handler)
	return &Logger{Logger: logger}
}

// WithRequestID adds request ID to logger context
func (l *Logger) WithRequestID(requestID string) *Logger {
	return &Logger{Logger: l.Logger.With("request_id", requestID)}
}

// WithUserID adds user ID to logger context
func (l *Logger) WithUserID(userID string) *Logger {
	return &Logger{Logger: l.Logger.With("user_id", userID)}
}

// HTTP request logging helpers
func (l *Logger) LogHTTPRequest(method, path, userAgent, ip string, statusCode int, duration int64) {
	l.Logger.Info("HTTP request",
		"method", method,
		"path", path,
		"user_agent", userAgent,
		"ip", ip,
		"status_code", statusCode,
		"duration_ms", duration,
	)
}

// Security event logging
func (l *Logger) LogSecurityEvent(event string, userID, ip string, details map[string]interface{}) {
	args := []interface{}{
		"event", event,
		"user_id", userID,
		"ip", ip,
	}
	
	for key, value := range details {
		args = append(args, key, value)
	}
	
	l.Logger.Warn("Security event", args...)
}

// Error logging with stack trace
func (l *Logger) LogError(message string, err error, context map[string]interface{}) {
	args := []interface{}{
		"error", err.Error(),
	}
	
	for key, value := range context {
		args = append(args, key, value)
	}
	
	l.Logger.Error(message, args...)
}