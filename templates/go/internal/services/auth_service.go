package services

import (
	"context"
	"fmt"
	"time"

	"github.com/go-redis/redis/v8"
	"github.com/google/uuid"
	"gorm.io/gorm"

	"app/internal/auth"
	"app/internal/config"
	"app/internal/models"
	"app/internal/repository/interfaces"
	"app/internal/utils"
)

// AuthService handles authentication and authorization logic
type AuthService struct {
	userRepo        interfaces.UserRepository
	jwtService      *auth.JWTService
	passwordService *auth.PasswordService
	sessionService  *auth.SessionService
	redisClient     *redis.Client
	config          *config.Config
	logger          *utils.Logger
	db              *gorm.DB
}

// NewAuthService creates a new authentication service
func NewAuthService(
	userRepo interfaces.UserRepository,
	jwtService *auth.JWTService,
	passwordService *auth.PasswordService,
	sessionService *auth.SessionService,
	redisClient *redis.Client,
	config *config.Config,
	logger *utils.Logger,
	db *gorm.DB,
) *AuthService {
	return &AuthService{
		userRepo:        userRepo,
		jwtService:      jwtService,
		passwordService: passwordService,
		sessionService:  sessionService,
		redisClient:     redisClient,
		config:          config,
		logger:          logger,
		db:              db,
	}
}

// Register registers a new user
func (s *AuthService) Register(ctx context.Context, req *models.UserCreateRequest) (*models.AuthResponse, error) {
	// Validate password strength
	if err := s.passwordService.IsPasswordValid(req.Password); err != nil {
		return nil, fmt.Errorf("password validation failed: %w", err)
	}

	// Check if user already exists
	if _, err := s.userRepo.GetByEmail(ctx, req.Email); err == nil {
		return nil, fmt.Errorf("user with this email already exists")
	}

	if _, err := s.userRepo.GetByUsername(ctx, req.Username); err == nil {
		return nil, fmt.Errorf("user with this username already exists")
	}

	// Hash password
	hashedPassword, err := s.passwordService.HashPassword(req.Password)
	if err != nil {
		return nil, fmt.Errorf("failed to hash password: %w", err)
	}

	// Create user
	user := &models.User{
		Email:        req.Email,
		Username:     req.Username,
		PasswordHash: hashedPassword,
		FirstName:    req.FirstName,
		LastName:     req.LastName,
		IsActive:     true,
		IsVerified:   false, // Email verification required
	}

	// Begin transaction
	tx, err := s.userRepo.BeginTransaction(ctx)
	if err != nil {
		return nil, fmt.Errorf("failed to begin transaction: %w", err)
	}
	defer tx.Rollback()

	// Create user in database
	userRepoTx := s.userRepo.WithTransaction(tx)
	if err := userRepoTx.Create(ctx, user); err != nil {
		return nil, fmt.Errorf("failed to create user: %w", err)
	}

	// Assign default user role
	if err := s.assignDefaultRole(ctx, userRepoTx, user.ID); err != nil {
		return nil, fmt.Errorf("failed to assign default role: %w", err)
	}

	// Reload user with roles
	user, err = userRepoTx.GetByID(ctx, user.ID)
	if err != nil {
		return nil, fmt.Errorf("failed to reload user: %w", err)
	}

	// Commit transaction
	if err := tx.Commit().Error; err != nil {
		return nil, fmt.Errorf("failed to commit transaction: %w", err)
	}

	// Generate tokens
	accessToken, err := s.jwtService.GenerateToken(user)
	if err != nil {
		return nil, fmt.Errorf("failed to generate access token: %w", err)
	}

	refreshToken, err := s.createRefreshToken(ctx, user.ID, "", "")
	if err != nil {
		return nil, fmt.Errorf("failed to create refresh token: %w", err)
	}

	// Log successful registration
	s.logger.Info("User registered successfully", 
		"user_id", user.ID, 
		"email", user.Email,
		"username", user.Username)

	// Create audit log
	s.createAuditLog(ctx, &user.ID, "user.register", "user", &user.ID, nil, "", "", true, nil)

	// Send verification email (implement based on your email service)
	go s.sendVerificationEmail(ctx, user)

	return &models.AuthResponse{
		AccessToken:  accessToken,
		RefreshToken: refreshToken,
		TokenType:    "Bearer",
		ExpiresIn:    int(s.jwtService.GetTokenExpiration().Seconds()),
		User:         user.ToResponse(),
	}, nil
}

// Login authenticates a user and returns tokens
func (s *AuthService) Login(ctx context.Context, req *models.LoginRequest, ipAddress, userAgent string) (*models.AuthResponse, error) {
	// Get user by email or username
	user, err := s.userRepo.GetByEmailOrUsername(ctx, req.Login)
	if err != nil {
		// Log failed login attempt
		s.createAuditLog(ctx, nil, "user.login", "user", nil, map[string]interface{}{
			"login":      req.Login,
			"ip_address": ipAddress,
			"user_agent": userAgent,
		}, ipAddress, userAgent, false, &[]string{"user not found"}[0])
		
		return nil, fmt.Errorf("invalid credentials")
	}

	// Check if user can login (active, verified, not locked)
	if !user.CanLogin() {
		var reason string
		if !user.IsActive {
			reason = "account is inactive"
		} else if !user.IsVerified {
			reason = "email not verified"
		} else if user.IsLocked() {
			reason = "account is locked"
		}

		// Log failed login attempt
		s.createAuditLog(ctx, &user.ID, "user.login", "user", &user.ID, map[string]interface{}{
			"reason":     reason,
			"ip_address": ipAddress,
			"user_agent": userAgent,
		}, ipAddress, userAgent, false, &reason)

		return nil, fmt.Errorf("login not allowed: %s", reason)
	}

	// Verify password
	if err := s.passwordService.VerifyPassword(user.PasswordHash, req.Password); err != nil {
		// Increment failed login count
		s.userRepo.IncrementFailedLoginCount(ctx, user.ID)

		// Check if account should be locked
		if user.FailedLoginCount+1 >= 5 {
			s.userRepo.LockUser(ctx, user.ID, 30) // Lock for 30 minutes
			s.logger.Warn("User account locked due to too many failed attempts", 
				"user_id", user.ID, 
				"ip_address", ipAddress)
		}

		// Log failed login attempt
		s.createAuditLog(ctx, &user.ID, "user.login", "user", &user.ID, map[string]interface{}{
			"ip_address": ipAddress,
			"user_agent": userAgent,
		}, ipAddress, userAgent, false, &[]string{"invalid password"}[0])

		return nil, fmt.Errorf("invalid credentials")
	}

	// Update last login and reset failed login count
	if err := s.userRepo.UpdateLastLogin(ctx, user.ID); err != nil {
		s.logger.Error("Failed to update last login", "error", err, "user_id", user.ID)
	}

	// Generate tokens
	accessToken, err := s.jwtService.GenerateToken(user)
	if err != nil {
		return nil, fmt.Errorf("failed to generate access token: %w", err)
	}

	refreshToken, err := s.createRefreshToken(ctx, user.ID, ipAddress, userAgent)
	if err != nil {
		return nil, fmt.Errorf("failed to create refresh token: %w", err)
	}

	// Create session
	sessionData := &auth.SessionData{
		UserID:      user.ID,
		Email:       user.Email,
		Username:    user.Username,
		Roles:       extractRoleNames(user.Roles),
		Permissions: extractPermissions(user.Roles),
		IPAddress:   ipAddress,
		UserAgent:   userAgent,
	}

	sessionID, err := s.sessionService.CreateSession(ctx, sessionData)
	if err != nil {
		s.logger.Error("Failed to create session", "error", err, "user_id", user.ID)
	}

	// Log successful login
	s.logger.Info("User logged in successfully", 
		"user_id", user.ID, 
		"email", user.Email,
		"ip_address", ipAddress,
		"session_id", sessionID)

	// Create audit log
	s.createAuditLog(ctx, &user.ID, "user.login", "user", &user.ID, map[string]interface{}{
		"ip_address": ipAddress,
		"user_agent": userAgent,
		"session_id": sessionID,
	}, ipAddress, userAgent, true, nil)

	return &models.AuthResponse{
		AccessToken:  accessToken,
		RefreshToken: refreshToken,
		TokenType:    "Bearer",
		ExpiresIn:    int(s.jwtService.GetTokenExpiration().Seconds()),
		User:         user.ToResponse(),
	}, nil
}

// RefreshToken refreshes an access token using a refresh token
func (s *AuthService) RefreshToken(ctx context.Context, refreshTokenStr string, ipAddress, userAgent string) (*models.AuthResponse, error) {
	// Find refresh token in database
	var refreshToken models.RefreshToken
	if err := s.db.WithContext(ctx).
		Preload("User.Roles").
		Where("token = ?", refreshTokenStr).
		First(&refreshToken).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, fmt.Errorf("invalid refresh token")
		}
		return nil, fmt.Errorf("failed to find refresh token: %w", err)
	}

	// Check if token is valid
	if !refreshToken.IsValid() {
		return nil, fmt.Errorf("refresh token expired or revoked")
	}

	// Update token usage
	refreshToken.LastUsedAt = &[]time.Time{time.Now()}[0]
	if err := s.db.WithContext(ctx).Save(&refreshToken).Error; err != nil {
		s.logger.Error("Failed to update refresh token usage", "error", err)
	}

	// Generate new access token
	accessToken, err := s.jwtService.GenerateToken(&refreshToken.User)
	if err != nil {
		return nil, fmt.Errorf("failed to generate access token: %w", err)
	}

	// Optionally generate new refresh token (token rotation)
	newRefreshToken, err := s.createRefreshToken(ctx, refreshToken.UserID, ipAddress, userAgent)
	if err != nil {
		return nil, fmt.Errorf("failed to create new refresh token: %w", err)
	}

	// Revoke old refresh token
	refreshToken.Revoke()
	if err := s.db.WithContext(ctx).Save(&refreshToken).Error; err != nil {
		s.logger.Error("Failed to revoke old refresh token", "error", err)
	}

	// Log token refresh
	s.logger.Info("Token refreshed successfully", 
		"user_id", refreshToken.UserID,
		"ip_address", ipAddress)

	// Create audit log
	s.createAuditLog(ctx, &refreshToken.UserID, "user.token_refresh", "token", nil, map[string]interface{}{
		"ip_address": ipAddress,
		"user_agent": userAgent,
	}, ipAddress, userAgent, true, nil)

	return &models.AuthResponse{
		AccessToken:  accessToken,
		RefreshToken: newRefreshToken,
		TokenType:    "Bearer",
		ExpiresIn:    int(s.jwtService.GetTokenExpiration().Seconds()),
		User:         refreshToken.User.ToResponse(),
	}, nil
}

// Logout logs out a user and revokes tokens
func (s *AuthService) Logout(ctx context.Context, userID uuid.UUID, refreshTokenStr string) error {
	// Revoke refresh token if provided
	if refreshTokenStr != "" {
		var refreshToken models.RefreshToken
		if err := s.db.WithContext(ctx).
			Where("token = ? AND user_id = ?", refreshTokenStr, userID).
			First(&refreshToken).Error; err == nil {
			refreshToken.Revoke()
			s.db.WithContext(ctx).Save(&refreshToken)
		}
	}

	// Delete user sessions
	if err := s.sessionService.DeleteUserSessions(ctx, userID); err != nil {
		s.logger.Error("Failed to delete user sessions", "error", err, "user_id", userID)
	}

	// Log logout
	s.logger.Info("User logged out successfully", "user_id", userID)

	// Create audit log
	s.createAuditLog(ctx, &userID, "user.logout", "user", &userID, nil, "", "", true, nil)

	return nil
}

// ChangePassword changes a user's password
func (s *AuthService) ChangePassword(ctx context.Context, userID uuid.UUID, req *models.ChangePasswordRequest) error {
	// Get user
	user, err := s.userRepo.GetByID(ctx, userID)
	if err != nil {
		return fmt.Errorf("user not found: %w", err)
	}

	// Verify current password
	if err := s.passwordService.VerifyPassword(user.PasswordHash, req.CurrentPassword); err != nil {
		return fmt.Errorf("current password is incorrect")
	}

	// Validate new password
	if err := s.passwordService.IsPasswordValid(req.NewPassword); err != nil {
		return fmt.Errorf("new password validation failed: %w", err)
	}

	// Hash new password
	hashedPassword, err := s.passwordService.HashPassword(req.NewPassword)
	if err != nil {
		return fmt.Errorf("failed to hash new password: %w", err)
	}

	// Update password
	if err := s.userRepo.UpdatePassword(ctx, userID, hashedPassword); err != nil {
		return fmt.Errorf("failed to update password: %w", err)
	}

	// Revoke all refresh tokens for the user
	if err := s.revokeAllUserTokens(ctx, userID); err != nil {
		s.logger.Error("Failed to revoke user tokens after password change", "error", err, "user_id", userID)
	}

	// Delete user sessions
	if err := s.sessionService.DeleteUserSessions(ctx, userID); err != nil {
		s.logger.Error("Failed to delete user sessions after password change", "error", err, "user_id", userID)
	}

	// Log password change
	s.logger.Info("Password changed successfully", "user_id", userID)

	// Create audit log
	s.createAuditLog(ctx, &userID, "user.password_change", "user", &userID, nil, "", "", true, nil)

	return nil
}

// ForgotPassword initiates password reset process
func (s *AuthService) ForgotPassword(ctx context.Context, req *models.ForgotPasswordRequest, ipAddress string) error {
	// Get user by email
	user, err := s.userRepo.GetByEmail(ctx, req.Email)
	if err != nil {
		// Don't reveal if email exists or not
		s.logger.Warn("Password reset requested for non-existent email", 
			"email", req.Email, 
			"ip_address", ipAddress)
		return nil
	}

	// Create password reset token
	resetToken := &models.PasswordReset{
		Email:     req.Email,
		UserID:    user.ID,
		IPAddress: ipAddress,
	}

	if err := s.db.WithContext(ctx).Create(resetToken).Error; err != nil {
		return fmt.Errorf("failed to create password reset token: %w", err)
	}

	// Send password reset email (implement based on your email service)
	go s.sendPasswordResetEmail(ctx, user, resetToken.Token)

	// Log password reset request
	s.logger.Info("Password reset requested", 
		"user_id", user.ID, 
		"email", req.Email,
		"ip_address", ipAddress)

	// Create audit log
	s.createAuditLog(ctx, &user.ID, "user.password_reset_request", "user", &user.ID, map[string]interface{}{
		"ip_address": ipAddress,
	}, ipAddress, "", true, nil)

	return nil
}

// ResetPassword resets a user's password using a reset token
func (s *AuthService) ResetPassword(ctx context.Context, req *models.ResetPasswordRequest, ipAddress string) error {
	// Find password reset token
	var resetToken models.PasswordReset
	if err := s.db.WithContext(ctx).
		Preload("User").
		Where("token = ?", req.Token).
		First(&resetToken).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return fmt.Errorf("invalid or expired reset token")
		}
		return fmt.Errorf("failed to find reset token: %w", err)
	}

	// Check if token is valid
	if !resetToken.IsValid() {
		return fmt.Errorf("reset token expired or already used")
	}

	// Validate new password
	if err := s.passwordService.IsPasswordValid(req.NewPassword); err != nil {
		return fmt.Errorf("password validation failed: %w", err)
	}

	// Hash new password
	hashedPassword, err := s.passwordService.HashPassword(req.NewPassword)
	if err != nil {
		return fmt.Errorf("failed to hash password: %w", err)
	}

	// Begin transaction
	tx := s.db.WithContext(ctx).Begin()
	defer tx.Rollback()

	// Update password
	if err := tx.Model(&models.User{}).
		Where("id = ?", resetToken.UserID).
		Updates(map[string]interface{}{
			"password_hash":       hashedPassword,
			"password_changed_at": time.Now(),
			"failed_login_count":  0,
			"locked_until":        nil,
		}).Error; err != nil {
		return fmt.Errorf("failed to update password: %w", err)
	}

	// Mark reset token as used
	resetToken.MarkAsUsed()
	if err := tx.Save(&resetToken).Error; err != nil {
		return fmt.Errorf("failed to mark reset token as used: %w", err)
	}

	// Revoke all refresh tokens for the user
	if err := tx.Model(&models.RefreshToken{}).
		Where("user_id = ?", resetToken.UserID).
		Update("is_revoked", true).Error; err != nil {
		s.logger.Error("Failed to revoke user tokens after password reset", "error", err, "user_id", resetToken.UserID)
	}

	// Commit transaction
	if err := tx.Commit().Error; err != nil {
		return fmt.Errorf("failed to commit transaction: %w", err)
	}

	// Delete user sessions
	if err := s.sessionService.DeleteUserSessions(ctx, resetToken.UserID); err != nil {
		s.logger.Error("Failed to delete user sessions after password reset", "error", err, "user_id", resetToken.UserID)
	}

	// Log password reset
	s.logger.Info("Password reset successfully", 
		"user_id", resetToken.UserID,
		"ip_address", ipAddress)

	// Create audit log
	s.createAuditLog(ctx, &resetToken.UserID, "user.password_reset", "user", &resetToken.UserID, map[string]interface{}{
		"ip_address": ipAddress,
	}, ipAddress, "", true, nil)

	return nil
}

// VerifyEmail verifies a user's email address
func (s *AuthService) VerifyEmail(ctx context.Context, req *models.VerifyEmailRequest) error {
	// Find email verification token
	var verificationToken models.EmailVerification
	if err := s.db.WithContext(ctx).
		Where("token = ?", req.Token).
		First(&verificationToken).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return fmt.Errorf("invalid or expired verification token")
		}
		return fmt.Errorf("failed to find verification token: %w", err)
	}

	// Check if token is valid
	if !verificationToken.IsValid() {
		return fmt.Errorf("verification token expired or already used")
	}

	// Begin transaction
	tx := s.db.WithContext(ctx).Begin()
	defer tx.Rollback()

	// Mark email as verified
	if err := s.userRepo.WithTransaction(tx).MarkEmailAsVerified(ctx, verificationToken.UserID); err != nil {
		return fmt.Errorf("failed to mark email as verified: %w", err)
	}

	// Mark verification token as used
	verificationToken.MarkAsUsed()
	if err := tx.Save(&verificationToken).Error; err != nil {
		return fmt.Errorf("failed to mark verification token as used: %w", err)
	}

	// Commit transaction
	if err := tx.Commit().Error; err != nil {
		return fmt.Errorf("failed to commit transaction: %w", err)
	}

	// Log email verification
	s.logger.Info("Email verified successfully", "user_id", verificationToken.UserID)

	// Create audit log
	s.createAuditLog(ctx, &verificationToken.UserID, "user.email_verify", "user", &verificationToken.UserID, nil, "", "", true, nil)

	return nil
}

// Helper functions

func (s *AuthService) assignDefaultRole(ctx context.Context, userRepo interfaces.UserRepository, userID uuid.UUID) error {
	// Find default user role
	var role models.Role
	if err := s.db.WithContext(ctx).Where("name = ?", "user").First(&role).Error; err != nil {
		return fmt.Errorf("default user role not found: %w", err)
	}

	return userRepo.AssignRole(ctx, userID, role.ID)
}

func (s *AuthService) createRefreshToken(ctx context.Context, userID uuid.UUID, ipAddress, userAgent string) (string, error) {
	refreshToken := &models.RefreshToken{
		UserID:    userID,
		ExpiresAt: time.Now().Add(7 * 24 * time.Hour), // 7 days
		IPAddress: ipAddress,
		UserAgent: userAgent,
	}

	if err := s.db.WithContext(ctx).Create(refreshToken).Error; err != nil {
		return "", fmt.Errorf("failed to create refresh token: %w", err)
	}

	return refreshToken.Token, nil
}

func (s *AuthService) revokeAllUserTokens(ctx context.Context, userID uuid.UUID) error {
	return s.db.WithContext(ctx).
		Model(&models.RefreshToken{}).
		Where("user_id = ?", userID).
		Update("is_revoked", true).Error
}

func (s *AuthService) createAuditLog(ctx context.Context, userID *uuid.UUID, action, resource string, resourceID *uuid.UUID, details map[string]interface{}, ipAddress, userAgent string, success bool, errorMessage *string) {
	auditLog := &models.AuditLog{
		UserID:       userID,
		Action:       action,
		Resource:     resource,
		ResourceID:   resourceID,
		Details:      details,
		IPAddress:    ipAddress,
		UserAgent:    userAgent,
		Success:      success,
		ErrorMessage: errorMessage,
	}

	if err := s.db.WithContext(ctx).Create(auditLog).Error; err != nil {
		s.logger.Error("Failed to create audit log", "error", err)
	}
}

func (s *AuthService) sendVerificationEmail(ctx context.Context, user *models.User) {
	// Implement email sending logic
	s.logger.Info("Verification email would be sent", "user_id", user.ID, "email", user.Email)
}

func (s *AuthService) sendPasswordResetEmail(ctx context.Context, user *models.User, token string) {
	// Implement email sending logic
	s.logger.Info("Password reset email would be sent", "user_id", user.ID, "email", user.Email)
}

func extractRoleNames(roles []models.Role) []string {
	roleNames := make([]string, len(roles))
	for i, role := range roles {
		roleNames[i] = role.Name
	}
	return roleNames
}

func extractPermissions(roles []models.Role) []string {
	permissionSet := make(map[string]bool)
	for _, role := range roles {
		for _, permission := range role.Permissions {
			permissionSet[permission] = true
		}
	}

	permissions := make([]string, 0, len(permissionSet))
	for permission := range permissionSet {
		permissions = append(permissions, permission)
	}
	return permissions
}