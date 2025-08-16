package models

import (
	"crypto/rand"
	"encoding/hex"
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// RefreshToken represents a JWT refresh token in the database
type RefreshToken struct {
	ID           uuid.UUID `json:"id" gorm:"type:uuid;primary_key;default:gen_random_uuid()"`
	Token        string    `json:"-" gorm:"uniqueIndex;not null"`
	UserID       uuid.UUID `json:"user_id" gorm:"type:uuid;not null;index"`
	IsRevoked    bool      `json:"is_revoked" gorm:"default:false"`
	ExpiresAt    time.Time `json:"expires_at" gorm:"not null"`
	CreatedAt    time.Time `json:"created_at"`
	UpdatedAt    time.Time `json:"updated_at"`
	LastUsedAt   *time.Time `json:"last_used_at"`
	IPAddress    string    `json:"ip_address"`
	UserAgent    string    `json:"user_agent"`
	DeviceInfo   string    `json:"device_info"`

	// Relationships
	User User `json:"-" gorm:"foreignKey:UserID"`
}

// BeforeCreate is a GORM hook that runs before creating a refresh token
func (rt *RefreshToken) BeforeCreate(tx *gorm.DB) error {
	if rt.ID == uuid.Nil {
		rt.ID = uuid.New()
	}
	if rt.Token == "" {
		token, err := generateSecureToken(32)
		if err != nil {
			return err
		}
		rt.Token = token
	}
	return nil
}

// IsExpired checks if the refresh token has expired
func (rt *RefreshToken) IsExpired() bool {
	return time.Now().After(rt.ExpiresAt)
}

// IsValid checks if the refresh token is valid (not revoked and not expired)
func (rt *RefreshToken) IsValid() bool {
	return !rt.IsRevoked && !rt.IsExpired()
}

// Revoke marks the refresh token as revoked
func (rt *RefreshToken) Revoke() {
	rt.IsRevoked = true
	rt.UpdatedAt = time.Now()
}

// PasswordReset represents a password reset token
type PasswordReset struct {
	ID        uuid.UUID `json:"id" gorm:"type:uuid;primary_key;default:gen_random_uuid()"`
	Email     string    `json:"email" gorm:"not null;index"`
	Token     string    `json:"-" gorm:"uniqueIndex;not null"`
	UserID    uuid.UUID `json:"user_id" gorm:"type:uuid;not null;index"`
	IsUsed    bool      `json:"is_used" gorm:"default:false"`
	ExpiresAt time.Time `json:"expires_at" gorm:"not null"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
	UsedAt    *time.Time `json:"used_at"`
	IPAddress string    `json:"ip_address"`

	// Relationships
	User User `json:"-" gorm:"foreignKey:UserID"`
}

// BeforeCreate is a GORM hook that runs before creating a password reset
func (pr *PasswordReset) BeforeCreate(tx *gorm.DB) error {
	if pr.ID == uuid.Nil {
		pr.ID = uuid.New()
	}
	if pr.Token == "" {
		token, err := generateSecureToken(32)
		if err != nil {
			return err
		}
		pr.Token = token
	}
	// Set expiration to 1 hour from now
	if pr.ExpiresAt.IsZero() {
		pr.ExpiresAt = time.Now().Add(time.Hour)
	}
	return nil
}

// IsExpired checks if the password reset token has expired
func (pr *PasswordReset) IsExpired() bool {
	return time.Now().After(pr.ExpiresAt)
}

// IsValid checks if the password reset token is valid (not used and not expired)
func (pr *PasswordReset) IsValid() bool {
	return !pr.IsUsed && !pr.IsExpired()
}

// MarkAsUsed marks the password reset token as used
func (pr *PasswordReset) MarkAsUsed() {
	pr.IsUsed = true
	now := time.Now()
	pr.UsedAt = &now
	pr.UpdatedAt = now
}

// EmailVerification represents an email verification token
type EmailVerification struct {
	ID        uuid.UUID `json:"id" gorm:"type:uuid;primary_key;default:gen_random_uuid()"`
	Email     string    `json:"email" gorm:"not null;index"`
	Token     string    `json:"-" gorm:"uniqueIndex;not null"`
	UserID    uuid.UUID `json:"user_id" gorm:"type:uuid;not null;index"`
	IsUsed    bool      `json:"is_used" gorm:"default:false"`
	ExpiresAt time.Time `json:"expires_at" gorm:"not null"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
	UsedAt    *time.Time `json:"used_at"`

	// Relationships
	User User `json:"-" gorm:"foreignKey:UserID"`
}

// BeforeCreate is a GORM hook that runs before creating an email verification
func (ev *EmailVerification) BeforeCreate(tx *gorm.DB) error {
	if ev.ID == uuid.Nil {
		ev.ID = uuid.New()
	}
	if ev.Token == "" {
		token, err := generateSecureToken(32)
		if err != nil {
			return err
		}
		ev.Token = token
	}
	// Set expiration to 24 hours from now
	if ev.ExpiresAt.IsZero() {
		ev.ExpiresAt = time.Now().Add(24 * time.Hour)
	}
	return nil
}

// IsExpired checks if the email verification token has expired
func (ev *EmailVerification) IsExpired() bool {
	return time.Now().After(ev.ExpiresAt)
}

// IsValid checks if the email verification token is valid (not used and not expired)
func (ev *EmailVerification) IsValid() bool {
	return !ev.IsUsed && !ev.IsExpired()
}

// MarkAsUsed marks the email verification token as used
func (ev *EmailVerification) MarkAsUsed() {
	ev.IsUsed = true
	now := time.Now()
	ev.UsedAt = &now
	ev.UpdatedAt = now
}

// AuditLog represents an audit log entry for security events
type AuditLog struct {
	ID          uuid.UUID              `json:"id" gorm:"type:uuid;primary_key;default:gen_random_uuid()"`
	UserID      *uuid.UUID             `json:"user_id,omitempty" gorm:"type:uuid;index"`
	Action      string                 `json:"action" gorm:"not null;index"`
	Resource    string                 `json:"resource" gorm:"not null;index"`
	ResourceID  *uuid.UUID             `json:"resource_id,omitempty" gorm:"type:uuid;index"`
	Details     map[string]interface{} `json:"details" gorm:"type:jsonb"`
	IPAddress   string                 `json:"ip_address"`
	UserAgent   string                 `json:"user_agent"`
	Success     bool                   `json:"success" gorm:"default:true;index"`
	ErrorMessage *string               `json:"error_message,omitempty"`
	CreatedAt   time.Time              `json:"created_at"`

	// Relationships
	User *User `json:"-" gorm:"foreignKey:UserID"`
}

// BeforeCreate is a GORM hook that runs before creating an audit log
func (al *AuditLog) BeforeCreate(tx *gorm.DB) error {
	if al.ID == uuid.Nil {
		al.ID = uuid.New()
	}
	return nil
}

// AuthResponse represents the response structure for authentication
type AuthResponse struct {
	AccessToken  string       `json:"access_token"`
	RefreshToken string       `json:"refresh_token"`
	TokenType    string       `json:"token_type"`
	ExpiresIn    int          `json:"expires_in"`
	User         UserResponse `json:"user"`
}

// TokenClaims represents the JWT token claims
type TokenClaims struct {
	UserID      uuid.UUID `json:"user_id"`
	Email       string    `json:"email"`
	Username    string    `json:"username"`
	Roles       []string  `json:"roles"`
	Permissions []string  `json:"permissions"`
	IssuedAt    int64     `json:"iat"`
	ExpiresAt   int64     `json:"exp"`
	Subject     string    `json:"sub"`
	Issuer      string    `json:"iss"`
}

// RefreshTokenRequest represents the request structure for refreshing tokens
type RefreshTokenRequest struct {
	RefreshToken string `json:"refresh_token" validate:"required"`
}

// VerifyEmailRequest represents the request structure for email verification
type VerifyEmailRequest struct {
	Token string `json:"token" validate:"required"`
}

// generateSecureToken generates a cryptographically secure random token
func generateSecureToken(length int) (string, error) {
	bytes := make([]byte, length)
	if _, err := rand.Read(bytes); err != nil {
		return "", err
	}
	return hex.EncodeToString(bytes), nil
}