package unit

import (
	"testing"
	"time"

	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"

	"app/internal/auth"
	"app/internal/models"
)

func TestJWTService_GenerateToken(t *testing.T) {
	// Arrange
	jwtService := auth.NewJWTService("test-secret-key", "test-issuer", 24)
	
	user := &models.User{
		ID:       uuid.New(),
		Email:    "test@example.com",
		Username: "testuser",
		Roles: []models.Role{
			{
				Name:        "user",
				Permissions: []string{"user:read", "user:update"},
			},
		},
	}

	// Act
	token, err := jwtService.GenerateToken(user)

	// Assert
	require.NoError(t, err)
	assert.NotEmpty(t, token)
}

func TestJWTService_ValidateToken(t *testing.T) {
	// Arrange
	jwtService := auth.NewJWTService("test-secret-key", "test-issuer", 24)
	
	user := &models.User{
		ID:       uuid.New(),
		Email:    "test@example.com",
		Username: "testuser",
		Roles: []models.Role{
			{
				Name:        "user",
				Permissions: []string{"user:read", "user:update"},
			},
		},
	}

	token, err := jwtService.GenerateToken(user)
	require.NoError(t, err)

	// Act
	claims, err := jwtService.ValidateToken(token)

	// Assert
	require.NoError(t, err)
	assert.Equal(t, user.ID, claims.UserID)
	assert.Equal(t, user.Email, claims.Email)
	assert.Equal(t, user.Username, claims.Username)
	assert.Contains(t, claims.Roles, "user")
	assert.Contains(t, claims.Permissions, "user:read")
}

func TestJWTService_ValidateToken_ExpiredToken(t *testing.T) {
	// Arrange
	jwtService := auth.NewJWTService("test-secret-key", "test-issuer", -1) // Expired immediately
	
	user := &models.User{
		ID:       uuid.New(),
		Email:    "test@example.com",
		Username: "testuser",
	}

	token, err := jwtService.GenerateToken(user)
	require.NoError(t, err)

	// Wait for token to expire
	time.Sleep(time.Millisecond * 100)

	// Act
	_, err = jwtService.ValidateToken(token)

	// Assert
	assert.Error(t, err)
	assert.Contains(t, err.Error(), "expired")
}

func TestJWTService_ValidateToken_InvalidSignature(t *testing.T) {
	// Arrange
	jwtService1 := auth.NewJWTService("secret-key-1", "test-issuer", 24)
	jwtService2 := auth.NewJWTService("secret-key-2", "test-issuer", 24)
	
	user := &models.User{
		ID:       uuid.New(),
		Email:    "test@example.com",
		Username: "testuser",
	}

	token, err := jwtService1.GenerateToken(user)
	require.NoError(t, err)

	// Act - try to validate with different service
	_, err = jwtService2.ValidateToken(token)

	// Assert
	assert.Error(t, err)
}

func TestPasswordService_HashPassword(t *testing.T) {
	// Arrange
	passwordService := auth.NewPasswordService(12)
	password := "SecurePassword123!"

	// Act
	hashedPassword, err := passwordService.HashPassword(password)

	// Assert
	require.NoError(t, err)
	assert.NotEmpty(t, hashedPassword)
	assert.NotEqual(t, password, hashedPassword)
}

func TestPasswordService_VerifyPassword(t *testing.T) {
	// Arrange
	passwordService := auth.NewPasswordService(12)
	password := "SecurePassword123!"
	
	hashedPassword, err := passwordService.HashPassword(password)
	require.NoError(t, err)

	// Act & Assert
	err = passwordService.VerifyPassword(hashedPassword, password)
	assert.NoError(t, err)

	// Test wrong password
	err = passwordService.VerifyPassword(hashedPassword, "WrongPassword")
	assert.Error(t, err)
}

func TestValidatePassword(t *testing.T) {
	tests := []struct {
		name     string
		password string
		wantErr  bool
	}{
		{
			name:     "valid strong password",
			password: "SecurePass123!",
			wantErr:  false,
		},
		{
			name:     "too short",
			password: "Short1!",
			wantErr:  true,
		},
		{
			name:     "no uppercase",
			password: "securepass123!",
			wantErr:  true,
		},
		{
			name:     "no lowercase",
			password: "SECUREPASS123!",
			wantErr:  true,
		},
		{
			name:     "no number",
			password: "SecurePassword!",
			wantErr:  true,
		},
		{
			name:     "no special character",
			password: "SecurePassword123",
			wantErr:  true,
		},
		{
			name:     "common password",
			password: "Password123!",
			wantErr:  true,
		},
		{
			name:     "sequential characters",
			password: "Abcdef123!",
			wantErr:  true,
		},
		{
			name:     "repeated characters",
			password: "Secuuure123!",
			wantErr:  true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			err := auth.ValidatePassword(tt.password)
			if tt.wantErr {
				assert.Error(t, err)
			} else {
				assert.NoError(t, err)
			}
		})
	}
}

func TestGetPasswordStrength(t *testing.T) {
	tests := []struct {
		name     string
		password string
		expected auth.PasswordStrength
	}{
		{
			name:     "weak password",
			password: "weak",
			expected: auth.PasswordStrengthWeak,
		},
		{
			name:     "medium password",
			password: "Medium1!",
			expected: auth.PasswordStrengthMedium,
		},
		{
			name:     "strong password",
			password: "StrongPassword123!",
			expected: auth.PasswordStrengthStrong,
		},
		{
			name:     "very strong password",
			password: "VeryStrongP@ssw0rd123!WithMoreComplexity",
			expected: auth.PasswordStrengthVeryStrong,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			strength := auth.GetPasswordStrength(tt.password)
			assert.Equal(t, tt.expected, strength)
		})
	}
}

func TestGenerateSecurePassword(t *testing.T) {
	tests := []struct {
		name   string
		length int
	}{
		{"minimum length", 8},
		{"medium length", 16},
		{"long length", 32},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			password, err := auth.GenerateSecurePassword(tt.length)
			
			require.NoError(t, err)
			assert.Len(t, password, tt.length)
			
			// Verify password meets strength requirements
			err = auth.ValidatePassword(password)
			assert.NoError(t, err)
			
			// Verify password strength is at least strong
			strength := auth.GetPasswordStrength(password)
			assert.True(t, strength >= auth.PasswordStrengthStrong)
		})
	}
}

func BenchmarkJWTService_GenerateToken(b *testing.B) {
	jwtService := auth.NewJWTService("test-secret-key", "test-issuer", 24)
	user := &models.User{
		ID:       uuid.New(),
		Email:    "test@example.com",
		Username: "testuser",
		Roles: []models.Role{
			{
				Name:        "user",
				Permissions: []string{"user:read", "user:update"},
			},
		},
	}

	b.ResetTimer()
	for i := 0; i < b.N; i++ {
		_, err := jwtService.GenerateToken(user)
		if err != nil {
			b.Fatal(err)
		}
	}
}

func BenchmarkJWTService_ValidateToken(b *testing.B) {
	jwtService := auth.NewJWTService("test-secret-key", "test-issuer", 24)
	user := &models.User{
		ID:       uuid.New(),
		Email:    "test@example.com",
		Username: "testuser",
		Roles: []models.Role{
			{
				Name:        "user",
				Permissions: []string{"user:read", "user:update"},
			},
		},
	}

	token, err := jwtService.GenerateToken(user)
	if err != nil {
		b.Fatal(err)
	}

	b.ResetTimer()
	for i := 0; i < b.N; i++ {
		_, err := jwtService.ValidateToken(token)
		if err != nil {
			b.Fatal(err)
		}
	}
}

func BenchmarkPasswordService_HashPassword(b *testing.B) {
	passwordService := auth.NewPasswordService(12)
	password := "SecurePassword123!"

	b.ResetTimer()
	for i := 0; i < b.N; i++ {
		_, err := passwordService.HashPassword(password)
		if err != nil {
			b.Fatal(err)
		}
	}
}

func BenchmarkPasswordService_VerifyPassword(b *testing.B) {
	passwordService := auth.NewPasswordService(12)
	password := "SecurePassword123!"
	hashedPassword, err := passwordService.HashPassword(password)
	if err != nil {
		b.Fatal(err)
	}

	b.ResetTimer()
	for i := 0; i < b.N; i++ {
		err := passwordService.VerifyPassword(hashedPassword, password)
		if err != nil {
			b.Fatal(err)
		}
	}
}