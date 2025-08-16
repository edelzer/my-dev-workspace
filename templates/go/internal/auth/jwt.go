package auth

import (
	"fmt"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"

	"app/internal/models"
)

// JWTService handles JWT token operations
type JWTService struct {
	secretKey      []byte
	issuer         string
	expirationTime time.Duration
}

// NewJWTService creates a new JWT service
func NewJWTService(secretKey, issuer string, expirationHours int) *JWTService {
	return &JWTService{
		secretKey:      []byte(secretKey),
		issuer:         issuer,
		expirationTime: time.Duration(expirationHours) * time.Hour,
	}
}

// Claims represents the JWT claims structure
type Claims struct {
	UserID      uuid.UUID `json:"user_id"`
	Email       string    `json:"email"`
	Username    string    `json:"username"`
	Roles       []string  `json:"roles"`
	Permissions []string  `json:"permissions"`
	jwt.RegisteredClaims
}

// GenerateToken generates a JWT token for a user
func (j *JWTService) GenerateToken(user *models.User) (string, error) {
	now := time.Now()
	expirationTime := now.Add(j.expirationTime)

	// Extract roles and permissions
	roles := make([]string, len(user.Roles))
	permissionSet := make(map[string]bool)
	
	for i, role := range user.Roles {
		roles[i] = role.Name
		for _, permission := range role.Permissions {
			permissionSet[permission] = true
		}
	}

	// Convert permission set to slice
	permissions := make([]string, 0, len(permissionSet))
	for permission := range permissionSet {
		permissions = append(permissions, permission)
	}

	claims := Claims{
		UserID:      user.ID,
		Email:       user.Email,
		Username:    user.Username,
		Roles:       roles,
		Permissions: permissions,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(expirationTime),
			IssuedAt:  jwt.NewNumericDate(now),
			NotBefore: jwt.NewNumericDate(now),
			Issuer:    j.issuer,
			Subject:   user.ID.String(),
			ID:        uuid.New().String(),
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	tokenString, err := token.SignedString(j.secretKey)
	if err != nil {
		return "", fmt.Errorf("failed to sign token: %w", err)
	}

	return tokenString, nil
}

// ValidateToken validates a JWT token and returns the claims
func (j *JWTService) ValidateToken(tokenString string) (*Claims, error) {
	token, err := jwt.ParseWithClaims(tokenString, &Claims{}, func(token *jwt.Token) (interface{}, error) {
		// Verify the signing method
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
		}
		return j.secretKey, nil
	})

	if err != nil {
		return nil, fmt.Errorf("failed to parse token: %w", err)
	}

	claims, ok := token.Claims.(*Claims)
	if !ok || !token.Valid {
		return nil, fmt.Errorf("invalid token claims")
	}

	// Check if token is expired
	if claims.ExpiresAt != nil && claims.ExpiresAt.Time.Before(time.Now()) {
		return nil, fmt.Errorf("token has expired")
	}

	// Check if token is not yet valid
	if claims.NotBefore != nil && claims.NotBefore.Time.After(time.Now()) {
		return nil, fmt.Errorf("token not yet valid")
	}

	return claims, nil
}

// RefreshToken generates a new token using existing claims (with updated expiration)
func (j *JWTService) RefreshToken(user *models.User) (string, error) {
	return j.GenerateToken(user)
}

// ExtractTokenFromHeader extracts JWT token from Authorization header
func (j *JWTService) ExtractTokenFromHeader(authHeader string) (string, error) {
	const bearerPrefix = "Bearer "
	if len(authHeader) < len(bearerPrefix) {
		return "", fmt.Errorf("invalid authorization header format")
	}

	if authHeader[:len(bearerPrefix)] != bearerPrefix {
		return "", fmt.Errorf("authorization header must start with 'Bearer '")
	}

	token := authHeader[len(bearerPrefix):]
	if token == "" {
		return "", fmt.Errorf("token is empty")
	}

	return token, nil
}

// GetTokenExpiration returns the expiration time for tokens
func (j *JWTService) GetTokenExpiration() time.Duration {
	return j.expirationTime
}

// CreateTokenClaims creates token claims from user data
func (j *JWTService) CreateTokenClaims(user *models.User) models.TokenClaims {
	now := time.Now()
	exp := now.Add(j.expirationTime)

	// Extract roles and permissions
	roles := make([]string, len(user.Roles))
	permissionSet := make(map[string]bool)
	
	for i, role := range user.Roles {
		roles[i] = role.Name
		for _, permission := range role.Permissions {
			permissionSet[permission] = true
		}
	}

	// Convert permission set to slice
	permissions := make([]string, 0, len(permissionSet))
	for permission := range permissionSet {
		permissions = append(permissions, permission)
	}

	return models.TokenClaims{
		UserID:      user.ID,
		Email:       user.Email,
		Username:    user.Username,
		Roles:       roles,
		Permissions: permissions,
		IssuedAt:    now.Unix(),
		ExpiresAt:   exp.Unix(),
		Subject:     user.ID.String(),
		Issuer:      j.issuer,
	}
}

// TokenBlacklist interface for token blacklisting
type TokenBlacklist interface {
	BlacklistToken(tokenID string, expiresAt time.Time) error
	IsTokenBlacklisted(tokenID string) (bool, error)
	CleanupExpiredTokens() error
}

// BlacklistService handles token blacklisting
type BlacklistService struct {
	blacklist TokenBlacklist
}

// NewBlacklistService creates a new blacklist service
func NewBlacklistService(blacklist TokenBlacklist) *BlacklistService {
	return &BlacklistService{
		blacklist: blacklist,
	}
}

// BlacklistToken adds a token to the blacklist
func (b *BlacklistService) BlacklistToken(claims *Claims) error {
	if claims.ExpiresAt == nil {
		return fmt.Errorf("token claims missing expiration time")
	}
	
	return b.blacklist.BlacklistToken(claims.ID, claims.ExpiresAt.Time)
}

// IsTokenBlacklisted checks if a token is blacklisted
func (b *BlacklistService) IsTokenBlacklisted(tokenID string) (bool, error) {
	return b.blacklist.IsTokenBlacklisted(tokenID)
}

// CleanupExpiredTokens removes expired tokens from the blacklist
func (b *BlacklistService) CleanupExpiredTokens() error {
	return b.blacklist.CleanupExpiredTokens()
}