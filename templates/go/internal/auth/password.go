package auth

import (
	"crypto/rand"
	"fmt"
	"regexp"
	"strings"
	"unicode"

	"golang.org/x/crypto/bcrypt"
)

// PasswordService handles password operations
type PasswordService struct {
	cost int
}

// NewPasswordService creates a new password service
func NewPasswordService(cost int) *PasswordService {
	// Ensure cost is within valid range
	if cost < bcrypt.MinCost {
		cost = bcrypt.MinCost
	}
	if cost > bcrypt.MaxCost {
		cost = bcrypt.MaxCost
	}
	
	return &PasswordService{
		cost: cost,
	}
}

// HashPassword hashes a password using bcrypt
func (p *PasswordService) HashPassword(password string) (string, error) {
	hashedBytes, err := bcrypt.GenerateFromPassword([]byte(password), p.cost)
	if err != nil {
		return "", fmt.Errorf("failed to hash password: %w", err)
	}
	return string(hashedBytes), nil
}

// VerifyPassword verifies a password against its hash
func (p *PasswordService) VerifyPassword(hashedPassword, password string) error {
	return bcrypt.CompareHashAndPassword([]byte(hashedPassword), []byte(password))
}

// IsPasswordValid checks if a password is valid (returns true) or provides error
func (p *PasswordService) IsPasswordValid(password string) error {
	return ValidatePassword(password)
}

// ValidatePassword validates password strength
func ValidatePassword(password string) error {
	var (
		hasMinLen  = false
		hasUpper   = false
		hasLower   = false
		hasNumber  = false
		hasSpecial = false
	)

	// Check minimum length
	if len(password) >= 8 {
		hasMinLen = true
	}

	// Check maximum length
	if len(password) > 128 {
		return fmt.Errorf("password must be no more than 128 characters long")
	}

	// Check for character types
	for _, char := range password {
		switch {
		case unicode.IsUpper(char):
			hasUpper = true
		case unicode.IsLower(char):
			hasLower = true
		case unicode.IsNumber(char):
			hasNumber = true
		case unicode.IsPunct(char) || unicode.IsSymbol(char):
			hasSpecial = true
		}
	}

	// Build error message for missing requirements
	var missing []string
	if !hasMinLen {
		missing = append(missing, "at least 8 characters")
	}
	if !hasUpper {
		missing = append(missing, "at least one uppercase letter")
	}
	if !hasLower {
		missing = append(missing, "at least one lowercase letter")
	}
	if !hasNumber {
		missing = append(missing, "at least one number")
	}
	if !hasSpecial {
		missing = append(missing, "at least one special character")
	}

	if len(missing) > 0 {
		return fmt.Errorf("password must contain: %s", strings.Join(missing, ", "))
	}

	// Check for common patterns
	if err := checkCommonPatterns(password); err != nil {
		return err
	}

	return nil
}

// checkCommonPatterns checks for common weak password patterns
func checkCommonPatterns(password string) error {
	lower := strings.ToLower(password)

	// Check for common passwords
	commonPasswords := []string{
		"password", "123456", "123456789", "qwerty", "abc123",
		"password123", "admin", "letmein", "welcome", "monkey",
	}

	for _, common := range commonPasswords {
		if strings.Contains(lower, common) {
			return fmt.Errorf("password contains a common pattern and is not secure")
		}
	}

	// Check for sequential characters
	if hasSequentialChars(password) {
		return fmt.Errorf("password contains sequential characters and is not secure")
	}

	// Check for repeated characters
	if hasRepeatedChars(password) {
		return fmt.Errorf("password contains too many repeated characters")
	}

	return nil
}

// hasSequentialChars checks for sequential characters (abc, 123, etc.)
func hasSequentialChars(password string) bool {
	sequentialPatterns := []string{
		"abcdefghijklmnopqrstuvwxyz",
		"zyxwvutsrqponmlkjihgfedcba",
		"0123456789",
		"9876543210",
		"qwertyuiopasdfghjklzxcvbnm",
	}

	lower := strings.ToLower(password)

	for _, pattern := range sequentialPatterns {
		for i := 0; i <= len(pattern)-3; i++ {
			if strings.Contains(lower, pattern[i:i+3]) {
				return true
			}
		}
	}

	return false
}

// hasRepeatedChars checks for too many repeated characters
func hasRepeatedChars(password string) bool {
	if len(password) < 4 {
		return false
	}

	// Check for 3 or more consecutive identical characters
	for i := 0; i <= len(password)-3; i++ {
		if password[i] == password[i+1] && password[i+1] == password[i+2] {
			return true
		}
	}

	return false
}

// PasswordStrength represents the strength level of a password
type PasswordStrength int

const (
	PasswordStrengthWeak PasswordStrength = iota
	PasswordStrengthMedium
	PasswordStrengthStrong
	PasswordStrengthVeryStrong
)

// String returns the string representation of password strength
func (ps PasswordStrength) String() string {
	switch ps {
	case PasswordStrengthWeak:
		return "weak"
	case PasswordStrengthMedium:
		return "medium"
	case PasswordStrengthStrong:
		return "strong"
	case PasswordStrengthVeryStrong:
		return "very_strong"
	default:
		return "unknown"
	}
}

// GetPasswordStrength calculates the strength of a password
func GetPasswordStrength(password string) PasswordStrength {
	score := 0

	// Length score
	length := len(password)
	if length >= 8 {
		score++
	}
	if length >= 12 {
		score++
	}
	if length >= 16 {
		score++
	}

	// Character type scores
	if regexp.MustCompile(`[a-z]`).MatchString(password) {
		score++
	}
	if regexp.MustCompile(`[A-Z]`).MatchString(password) {
		score++
	}
	if regexp.MustCompile(`[0-9]`).MatchString(password) {
		score++
	}
	if regexp.MustCompile(`[^a-zA-Z0-9]`).MatchString(password) {
		score++
	}

	// Complexity bonus
	charSets := 0
	if regexp.MustCompile(`[a-z]`).MatchString(password) {
		charSets++
	}
	if regexp.MustCompile(`[A-Z]`).MatchString(password) {
		charSets++
	}
	if regexp.MustCompile(`[0-9]`).MatchString(password) {
		charSets++
	}
	if regexp.MustCompile(`[^a-zA-Z0-9]`).MatchString(password) {
		charSets++
	}

	if charSets >= 3 {
		score++
	}
	if charSets == 4 {
		score++
	}

	// No common patterns bonus
	if checkCommonPatterns(password) == nil {
		score++
	}

	// Convert score to strength level
	switch {
	case score >= 8:
		return PasswordStrengthVeryStrong
	case score >= 6:
		return PasswordStrengthStrong
	case score >= 4:
		return PasswordStrengthMedium
	default:
		return PasswordStrengthWeak
	}
}

// GenerateSecurePassword generates a cryptographically secure password
func GenerateSecurePassword(length int) (string, error) {
	if length < 8 {
		length = 8
	}
	if length > 128 {
		length = 128
	}

	const (
		lowercase = "abcdefghijklmnopqrstuvwxyz"
		uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
		numbers   = "0123456789"
		symbols   = "!@#$%^&*()_+-=[]{}|;:,.<>?"
	)

	// Ensure at least one character from each set
	var password strings.Builder
	charSets := []string{lowercase, uppercase, numbers, symbols}
	
	// Add one character from each set
	for _, set := range charSets {
		if password.Len() < length {
			char, err := getRandomChar(set)
			if err != nil {
				return "", err
			}
			password.WriteByte(char)
		}
	}

	// Fill remaining length with random characters from all sets
	allChars := lowercase + uppercase + numbers + symbols
	for password.Len() < length {
		char, err := getRandomChar(allChars)
		if err != nil {
			return "", err
		}
		password.WriteByte(char)
	}

	// Shuffle the password
	passwordBytes := []byte(password.String())
	if err := shuffleBytes(passwordBytes); err != nil {
		return "", err
	}

	return string(passwordBytes), nil
}

// getRandomChar returns a random character from the given set
func getRandomChar(set string) (byte, error) {
	if len(set) == 0 {
		return 0, fmt.Errorf("character set is empty")
	}
	
	// Use crypto/rand for secure random number generation
	randomBytes := make([]byte, 1)
	_, err := rand.Read(randomBytes)
	if err != nil {
		return 0, err
	}
	
	return set[int(randomBytes[0])%len(set)], nil
}

// shuffleBytes shuffles a byte slice using Fisher-Yates algorithm
func shuffleBytes(bytes []byte) error {
	for i := len(bytes) - 1; i > 0; i-- {
		randomBytes := make([]byte, 1)
		_, err := rand.Read(randomBytes)
		if err != nil {
			return err
		}
		
		j := int(randomBytes[0]) % (i + 1)
		bytes[i], bytes[j] = bytes[j], bytes[i]
	}
	return nil
}