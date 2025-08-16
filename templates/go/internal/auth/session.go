package auth

import (
	"context"
	"encoding/json"
	"fmt"
	"time"

	"github.com/go-redis/redis/v8"
	"github.com/google/uuid"
)

// SessionService handles user sessions
type SessionService struct {
	redisClient    *redis.Client
	sessionTimeout time.Duration
	keyPrefix      string
}

// NewSessionService creates a new session service
func NewSessionService(redisClient *redis.Client, sessionTimeout time.Duration) *SessionService {
	return &SessionService{
		redisClient:    redisClient,
		sessionTimeout: sessionTimeout,
		keyPrefix:      "session:",
	}
}

// SessionData represents the data stored in a session
type SessionData struct {
	UserID       uuid.UUID              `json:"user_id"`
	Email        string                 `json:"email"`
	Username     string                 `json:"username"`
	Roles        []string               `json:"roles"`
	Permissions  []string               `json:"permissions"`
	IPAddress    string                 `json:"ip_address"`
	UserAgent    string                 `json:"user_agent"`
	LastActivity time.Time              `json:"last_activity"`
	CreatedAt    time.Time              `json:"created_at"`
	Metadata     map[string]interface{} `json:"metadata,omitempty"`
}

// CreateSession creates a new session and returns the session ID
func (s *SessionService) CreateSession(ctx context.Context, sessionData *SessionData) (string, error) {
	sessionID := uuid.New().String()
	sessionKey := s.getSessionKey(sessionID)

	// Set creation time and last activity
	now := time.Now()
	sessionData.CreatedAt = now
	sessionData.LastActivity = now

	// Serialize session data
	sessionJSON, err := json.Marshal(sessionData)
	if err != nil {
		return "", fmt.Errorf("failed to marshal session data: %w", err)
	}

	// Store session in Redis with expiration
	err = s.redisClient.SetEX(ctx, sessionKey, sessionJSON, s.sessionTimeout).Err()
	if err != nil {
		return "", fmt.Errorf("failed to store session: %w", err)
	}

	return sessionID, nil
}

// GetSession retrieves session data by session ID
func (s *SessionService) GetSession(ctx context.Context, sessionID string) (*SessionData, error) {
	sessionKey := s.getSessionKey(sessionID)

	// Get session data from Redis
	sessionJSON, err := s.redisClient.Get(ctx, sessionKey).Result()
	if err != nil {
		if err == redis.Nil {
			return nil, fmt.Errorf("session not found")
		}
		return nil, fmt.Errorf("failed to get session: %w", err)
	}

	// Deserialize session data
	var sessionData SessionData
	err = json.Unmarshal([]byte(sessionJSON), &sessionData)
	if err != nil {
		return nil, fmt.Errorf("failed to unmarshal session data: %w", err)
	}

	return &sessionData, nil
}

// UpdateSession updates existing session data
func (s *SessionService) UpdateSession(ctx context.Context, sessionID string, sessionData *SessionData) error {
	sessionKey := s.getSessionKey(sessionID)

	// Update last activity
	sessionData.LastActivity = time.Now()

	// Serialize session data
	sessionJSON, err := json.Marshal(sessionData)
	if err != nil {
		return fmt.Errorf("failed to marshal session data: %w", err)
	}

	// Update session in Redis, preserving TTL
	err = s.redisClient.SetKeepTTL(ctx, sessionKey, sessionJSON).Err()
	if err != nil {
		return fmt.Errorf("failed to update session: %w", err)
	}

	return nil
}

// RefreshSession extends the session timeout
func (s *SessionService) RefreshSession(ctx context.Context, sessionID string) error {
	sessionKey := s.getSessionKey(sessionID)

	// Check if session exists
	exists, err := s.redisClient.Exists(ctx, sessionKey).Result()
	if err != nil {
		return fmt.Errorf("failed to check session existence: %w", err)
	}
	if exists == 0 {
		return fmt.Errorf("session not found")
	}

	// Extend expiration
	err = s.redisClient.Expire(ctx, sessionKey, s.sessionTimeout).Err()
	if err != nil {
		return fmt.Errorf("failed to refresh session: %w", err)
	}

	// Update last activity
	sessionData, err := s.GetSession(ctx, sessionID)
	if err != nil {
		return err
	}

	sessionData.LastActivity = time.Now()
	return s.UpdateSession(ctx, sessionID, sessionData)
}

// DeleteSession removes a session
func (s *SessionService) DeleteSession(ctx context.Context, sessionID string) error {
	sessionKey := s.getSessionKey(sessionID)

	err := s.redisClient.Del(ctx, sessionKey).Err()
	if err != nil {
		return fmt.Errorf("failed to delete session: %w", err)
	}

	return nil
}

// DeleteUserSessions removes all sessions for a specific user
func (s *SessionService) DeleteUserSessions(ctx context.Context, userID uuid.UUID) error {
	// Scan for all session keys
	pattern := s.keyPrefix + "*"
	var cursor uint64
	var deletedCount int

	for {
		keys, nextCursor, err := s.redisClient.Scan(ctx, cursor, pattern, 100).Result()
		if err != nil {
			return fmt.Errorf("failed to scan sessions: %w", err)
		}

		// Check each session for the user ID
		for _, key := range keys {
			sessionJSON, err := s.redisClient.Get(ctx, key).Result()
			if err != nil {
				continue // Skip if we can't get the session
			}

			var sessionData SessionData
			if json.Unmarshal([]byte(sessionJSON), &sessionData) == nil {
				if sessionData.UserID == userID {
					s.redisClient.Del(ctx, key)
					deletedCount++
				}
			}
		}

		cursor = nextCursor
		if cursor == 0 {
			break
		}
	}

	return nil
}

// IsSessionValid checks if a session exists and is valid
func (s *SessionService) IsSessionValid(ctx context.Context, sessionID string) (bool, error) {
	sessionKey := s.getSessionKey(sessionID)

	exists, err := s.redisClient.Exists(ctx, sessionKey).Result()
	if err != nil {
		return false, fmt.Errorf("failed to check session: %w", err)
	}

	return exists > 0, nil
}

// GetActiveSessionCount returns the number of active sessions for a user
func (s *SessionService) GetActiveSessionCount(ctx context.Context, userID uuid.UUID) (int, error) {
	pattern := s.keyPrefix + "*"
	var cursor uint64
	var count int

	for {
		keys, nextCursor, err := s.redisClient.Scan(ctx, cursor, pattern, 100).Result()
		if err != nil {
			return 0, fmt.Errorf("failed to scan sessions: %w", err)
		}

		// Check each session for the user ID
		for _, key := range keys {
			sessionJSON, err := s.redisClient.Get(ctx, key).Result()
			if err != nil {
				continue // Skip if we can't get the session
			}

			var sessionData SessionData
			if json.Unmarshal([]byte(sessionJSON), &sessionData) == nil {
				if sessionData.UserID == userID {
					count++
				}
			}
		}

		cursor = nextCursor
		if cursor == 0 {
			break
		}
	}

	return count, nil
}

// GetUserSessions returns all active sessions for a user
func (s *SessionService) GetUserSessions(ctx context.Context, userID uuid.UUID) ([]SessionInfo, error) {
	pattern := s.keyPrefix + "*"
	var cursor uint64
	var sessions []SessionInfo

	for {
		keys, nextCursor, err := s.redisClient.Scan(ctx, cursor, pattern, 100).Result()
		if err != nil {
			return nil, fmt.Errorf("failed to scan sessions: %w", err)
		}

		// Check each session for the user ID
		for _, key := range keys {
			sessionJSON, err := s.redisClient.Get(ctx, key).Result()
			if err != nil {
				continue // Skip if we can't get the session
			}

			var sessionData SessionData
			if json.Unmarshal([]byte(sessionJSON), &sessionData) == nil {
				if sessionData.UserID == userID {
					// Extract session ID from key
					sessionID := key[len(s.keyPrefix):]
					
					// Get TTL
					ttl, _ := s.redisClient.TTL(ctx, key).Result()
					
					sessions = append(sessions, SessionInfo{
						SessionID:    sessionID,
						IPAddress:    sessionData.IPAddress,
						UserAgent:    sessionData.UserAgent,
						CreatedAt:    sessionData.CreatedAt,
						LastActivity: sessionData.LastActivity,
						ExpiresAt:    time.Now().Add(ttl),
					})
				}
			}
		}

		cursor = nextCursor
		if cursor == 0 {
			break
		}
	}

	return sessions, nil
}

// CleanupExpiredSessions removes expired sessions (optional, as Redis handles TTL automatically)
func (s *SessionService) CleanupExpiredSessions(ctx context.Context) error {
	// Redis automatically handles TTL expiration, but we can implement
	// custom cleanup logic here if needed
	return nil
}

// SessionInfo represents basic session information
type SessionInfo struct {
	SessionID    string    `json:"session_id"`
	IPAddress    string    `json:"ip_address"`
	UserAgent    string    `json:"user_agent"`
	CreatedAt    time.Time `json:"created_at"`
	LastActivity time.Time `json:"last_activity"`
	ExpiresAt    time.Time `json:"expires_at"`
}

// getSessionKey generates the Redis key for a session
func (s *SessionService) getSessionKey(sessionID string) string {
	return s.keyPrefix + sessionID
}

// SetSessionTimeout updates the session timeout duration
func (s *SessionService) SetSessionTimeout(timeout time.Duration) {
	s.sessionTimeout = timeout
}

// GetSessionTimeout returns the current session timeout duration
func (s *SessionService) GetSessionTimeout() time.Duration {
	return s.sessionTimeout
}