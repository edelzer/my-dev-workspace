package postgres

import (
	"context"
	"fmt"
	"strings"
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"

	"app/internal/models"
	"app/internal/repository/interfaces"
)

// userRepository implements the UserRepository interface using PostgreSQL
type userRepository struct {
	db *gorm.DB
}

// NewUserRepository creates a new user repository
func NewUserRepository(db *gorm.DB) interfaces.UserRepository {
	return &userRepository{db: db}
}

// Create creates a new user
func (r *userRepository) Create(ctx context.Context, user *models.User) error {
	if err := r.db.WithContext(ctx).Create(user).Error; err != nil {
		return fmt.Errorf("failed to create user: %w", err)
	}
	return nil
}

// GetByID retrieves a user by ID
func (r *userRepository) GetByID(ctx context.Context, id uuid.UUID) (*models.User, error) {
	var user models.User
	err := r.db.WithContext(ctx).
		Preload("Roles").
		Where("id = ?", id).
		First(&user).Error
	
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, fmt.Errorf("user not found")
		}
		return nil, fmt.Errorf("failed to get user: %w", err)
	}
	
	return &user, nil
}

// GetByEmail retrieves a user by email
func (r *userRepository) GetByEmail(ctx context.Context, email string) (*models.User, error) {
	var user models.User
	err := r.db.WithContext(ctx).
		Preload("Roles").
		Where("email = ?", email).
		First(&user).Error
	
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, fmt.Errorf("user not found")
		}
		return nil, fmt.Errorf("failed to get user by email: %w", err)
	}
	
	return &user, nil
}

// GetByUsername retrieves a user by username
func (r *userRepository) GetByUsername(ctx context.Context, username string) (*models.User, error) {
	var user models.User
	err := r.db.WithContext(ctx).
		Preload("Roles").
		Where("username = ?", username).
		First(&user).Error
	
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, fmt.Errorf("user not found")
		}
		return nil, fmt.Errorf("failed to get user by username: %w", err)
	}
	
	return &user, nil
}

// GetByEmailOrUsername retrieves a user by email or username
func (r *userRepository) GetByEmailOrUsername(ctx context.Context, login string) (*models.User, error) {
	var user models.User
	err := r.db.WithContext(ctx).
		Preload("Roles").
		Where("email = ? OR username = ?", login, login).
		First(&user).Error
	
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, fmt.Errorf("user not found")
		}
		return nil, fmt.Errorf("failed to get user by login: %w", err)
	}
	
	return &user, nil
}

// Update updates a user
func (r *userRepository) Update(ctx context.Context, user *models.User) error {
	if err := r.db.WithContext(ctx).Save(user).Error; err != nil {
		return fmt.Errorf("failed to update user: %w", err)
	}
	return nil
}

// Delete permanently deletes a user
func (r *userRepository) Delete(ctx context.Context, id uuid.UUID) error {
	if err := r.db.WithContext(ctx).Unscoped().Delete(&models.User{}, id).Error; err != nil {
		return fmt.Errorf("failed to delete user: %w", err)
	}
	return nil
}

// SoftDelete soft deletes a user
func (r *userRepository) SoftDelete(ctx context.Context, id uuid.UUID) error {
	if err := r.db.WithContext(ctx).Delete(&models.User{}, id).Error; err != nil {
		return fmt.Errorf("failed to soft delete user: %w", err)
	}
	return nil
}

// List retrieves users with filters
func (r *userRepository) List(ctx context.Context, filters interfaces.UserFilters) ([]*models.User, error) {
	var users []*models.User
	query := r.buildQuery(filters)
	
	if err := query.WithContext(ctx).Preload("Roles").Find(&users).Error; err != nil {
		return nil, fmt.Errorf("failed to list users: %w", err)
	}
	
	return users, nil
}

// Count counts users with filters
func (r *userRepository) Count(ctx context.Context, filters interfaces.UserFilters) (int64, error) {
	var count int64
	query := r.buildQuery(filters)
	
	if err := query.WithContext(ctx).Model(&models.User{}).Count(&count).Error; err != nil {
		return 0, fmt.Errorf("failed to count users: %w", err)
	}
	
	return count, nil
}

// ListWithPagination retrieves users with pagination
func (r *userRepository) ListWithPagination(ctx context.Context, filters interfaces.UserFilters, offset, limit int) ([]*models.User, int64, error) {
	var users []*models.User
	var total int64
	
	query := r.buildQuery(filters)
	
	// Get total count
	if err := query.WithContext(ctx).Model(&models.User{}).Count(&total).Error; err != nil {
		return nil, 0, fmt.Errorf("failed to count users: %w", err)
	}
	
	// Get paginated results
	if err := query.WithContext(ctx).
		Preload("Roles").
		Offset(offset).
		Limit(limit).
		Find(&users).Error; err != nil {
		return nil, 0, fmt.Errorf("failed to list users with pagination: %w", err)
	}
	
	return users, total, nil
}

// UpdatePassword updates a user's password
func (r *userRepository) UpdatePassword(ctx context.Context, userID uuid.UUID, hashedPassword string) error {
	updates := map[string]interface{}{
		"password_hash":       hashedPassword,
		"password_changed_at": time.Now(),
		"failed_login_count":  0,
		"locked_until":        nil,
	}
	
	if err := r.db.WithContext(ctx).
		Model(&models.User{}).
		Where("id = ?", userID).
		Updates(updates).Error; err != nil {
		return fmt.Errorf("failed to update password: %w", err)
	}
	
	return nil
}

// UpdateLastLogin updates the last login timestamp
func (r *userRepository) UpdateLastLogin(ctx context.Context, userID uuid.UUID) error {
	now := time.Now()
	updates := map[string]interface{}{
		"last_login_at":      &now,
		"failed_login_count": 0,
	}
	
	if err := r.db.WithContext(ctx).
		Model(&models.User{}).
		Where("id = ?", userID).
		Updates(updates).Error; err != nil {
		return fmt.Errorf("failed to update last login: %w", err)
	}
	
	return nil
}

// IncrementFailedLoginCount increments the failed login count
func (r *userRepository) IncrementFailedLoginCount(ctx context.Context, userID uuid.UUID) error {
	if err := r.db.WithContext(ctx).
		Model(&models.User{}).
		Where("id = ?", userID).
		UpdateColumn("failed_login_count", gorm.Expr("failed_login_count + 1")).Error; err != nil {
		return fmt.Errorf("failed to increment failed login count: %w", err)
	}
	
	return nil
}

// ResetFailedLoginCount resets the failed login count
func (r *userRepository) ResetFailedLoginCount(ctx context.Context, userID uuid.UUID) error {
	if err := r.db.WithContext(ctx).
		Model(&models.User{}).
		Where("id = ?", userID).
		Update("failed_login_count", 0).Error; err != nil {
		return fmt.Errorf("failed to reset failed login count: %w", err)
	}
	
	return nil
}

// LockUser locks a user account
func (r *userRepository) LockUser(ctx context.Context, userID uuid.UUID, lockDurationMinutes int) error {
	lockUntil := time.Now().Add(time.Duration(lockDurationMinutes) * time.Minute)
	
	if err := r.db.WithContext(ctx).
		Model(&models.User{}).
		Where("id = ?", userID).
		Update("locked_until", lockUntil).Error; err != nil {
		return fmt.Errorf("failed to lock user: %w", err)
	}
	
	return nil
}

// UnlockUser unlocks a user account
func (r *userRepository) UnlockUser(ctx context.Context, userID uuid.UUID) error {
	updates := map[string]interface{}{
		"locked_until":       nil,
		"failed_login_count": 0,
	}
	
	if err := r.db.WithContext(ctx).
		Model(&models.User{}).
		Where("id = ?", userID).
		Updates(updates).Error; err != nil {
		return fmt.Errorf("failed to unlock user: %w", err)
	}
	
	return nil
}

// MarkEmailAsVerified marks a user's email as verified
func (r *userRepository) MarkEmailAsVerified(ctx context.Context, userID uuid.UUID) error {
	if err := r.db.WithContext(ctx).
		Model(&models.User{}).
		Where("id = ?", userID).
		Update("is_verified", true).Error; err != nil {
		return fmt.Errorf("failed to mark email as verified: %w", err)
	}
	
	return nil
}

// IsEmailVerified checks if a user's email is verified
func (r *userRepository) IsEmailVerified(ctx context.Context, userID uuid.UUID) (bool, error) {
	var user models.User
	if err := r.db.WithContext(ctx).
		Select("is_verified").
		Where("id = ?", userID).
		First(&user).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return false, fmt.Errorf("user not found")
		}
		return false, fmt.Errorf("failed to check email verification: %w", err)
	}
	
	return user.IsVerified, nil
}

// ActivateUser activates a user account
func (r *userRepository) ActivateUser(ctx context.Context, userID uuid.UUID) error {
	if err := r.db.WithContext(ctx).
		Model(&models.User{}).
		Where("id = ?", userID).
		Update("is_active", true).Error; err != nil {
		return fmt.Errorf("failed to activate user: %w", err)
	}
	
	return nil
}

// DeactivateUser deactivates a user account
func (r *userRepository) DeactivateUser(ctx context.Context, userID uuid.UUID) error {
	if err := r.db.WithContext(ctx).
		Model(&models.User{}).
		Where("id = ?", userID).
		Update("is_active", false).Error; err != nil {
		return fmt.Errorf("failed to deactivate user: %w", err)
	}
	
	return nil
}

// IsUserActive checks if a user is active
func (r *userRepository) IsUserActive(ctx context.Context, userID uuid.UUID) (bool, error) {
	var user models.User
	if err := r.db.WithContext(ctx).
		Select("is_active").
		Where("id = ?", userID).
		First(&user).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return false, fmt.Errorf("user not found")
		}
		return false, fmt.Errorf("failed to check user status: %w", err)
	}
	
	return user.IsActive, nil
}

// AssignRole assigns a role to a user
func (r *userRepository) AssignRole(ctx context.Context, userID, roleID uuid.UUID) error {
	userRole := &models.UserRole{
		UserID:    userID,
		RoleID:    roleID,
		GrantedAt: time.Now(),
	}
	
	if err := r.db.WithContext(ctx).Create(userRole).Error; err != nil {
		return fmt.Errorf("failed to assign role: %w", err)
	}
	
	return nil
}

// RevokeRole revokes a role from a user
func (r *userRepository) RevokeRole(ctx context.Context, userID, roleID uuid.UUID) error {
	if err := r.db.WithContext(ctx).
		Where("user_id = ? AND role_id = ?", userID, roleID).
		Delete(&models.UserRole{}).Error; err != nil {
		return fmt.Errorf("failed to revoke role: %w", err)
	}
	
	return nil
}

// GetUserRoles retrieves all roles for a user
func (r *userRepository) GetUserRoles(ctx context.Context, userID uuid.UUID) ([]*models.Role, error) {
	var roles []*models.Role
	if err := r.db.WithContext(ctx).
		Table("roles").
		Joins("JOIN user_roles ON roles.id = user_roles.role_id").
		Where("user_roles.user_id = ?", userID).
		Find(&roles).Error; err != nil {
		return nil, fmt.Errorf("failed to get user roles: %w", err)
	}
	
	return roles, nil
}

// HasRole checks if a user has a specific role
func (r *userRepository) HasRole(ctx context.Context, userID uuid.UUID, roleName string) (bool, error) {
	var count int64
	if err := r.db.WithContext(ctx).
		Table("user_roles").
		Joins("JOIN roles ON user_roles.role_id = roles.id").
		Where("user_roles.user_id = ? AND roles.name = ?", userID, roleName).
		Count(&count).Error; err != nil {
		return false, fmt.Errorf("failed to check user role: %w", err)
	}
	
	return count > 0, nil
}

// HasPermission checks if a user has a specific permission
func (r *userRepository) HasPermission(ctx context.Context, userID uuid.UUID, permission string) (bool, error) {
	var count int64
	if err := r.db.WithContext(ctx).
		Table("user_roles").
		Joins("JOIN roles ON user_roles.role_id = roles.id").
		Where("user_roles.user_id = ? AND (roles.permissions @> ? OR roles.permissions @> ?)", 
			userID, `["`+permission+`"]`, `["*"]`).
		Count(&count).Error; err != nil {
		return false, fmt.Errorf("failed to check user permission: %w", err)
	}
	
	return count > 0, nil
}

// SearchUsers searches for users by query
func (r *userRepository) SearchUsers(ctx context.Context, query string, filters interfaces.UserFilters) ([]*models.User, error) {
	var users []*models.User
	dbQuery := r.buildQuery(filters)
	
	// Add search conditions
	searchQuery := "%" + strings.ToLower(query) + "%"
	dbQuery = dbQuery.Where(
		"LOWER(email) LIKE ? OR LOWER(username) LIKE ? OR LOWER(first_name) LIKE ? OR LOWER(last_name) LIKE ?",
		searchQuery, searchQuery, searchQuery, searchQuery)
	
	if err := dbQuery.WithContext(ctx).Preload("Roles").Find(&users).Error; err != nil {
		return nil, fmt.Errorf("failed to search users: %w", err)
	}
	
	return users, nil
}

// GetActiveUsers retrieves all active users
func (r *userRepository) GetActiveUsers(ctx context.Context) ([]*models.User, error) {
	return r.List(ctx, interfaces.UserFilters{IsActive: &[]bool{true}[0]})
}

// GetInactiveUsers retrieves all inactive users
func (r *userRepository) GetInactiveUsers(ctx context.Context) ([]*models.User, error) {
	return r.List(ctx, interfaces.UserFilters{IsActive: &[]bool{false}[0]})
}

// GetUsersCreatedAfter retrieves users created after a specific time
func (r *userRepository) GetUsersCreatedAfter(ctx context.Context, after time.Time) ([]*models.User, error) {
	return r.List(ctx, interfaces.UserFilters{CreatedFrom: &after})
}

// GetUsersWithRole retrieves users with a specific role
func (r *userRepository) GetUsersWithRole(ctx context.Context, roleName string) ([]*models.User, error) {
	return r.List(ctx, interfaces.UserFilters{RoleName: roleName})
}

// GetUserStats retrieves user statistics
func (r *userRepository) GetUserStats(ctx context.Context) (*interfaces.UserStats, error) {
	stats := &interfaces.UserStats{}
	
	// Total users
	r.db.WithContext(ctx).Model(&models.User{}).Count(&stats.TotalUsers)
	
	// Active users
	r.db.WithContext(ctx).Model(&models.User{}).Where("is_active = ?", true).Count(&stats.ActiveUsers)
	
	// Inactive users
	r.db.WithContext(ctx).Model(&models.User{}).Where("is_active = ?", false).Count(&stats.InactiveUsers)
	
	// Verified users
	r.db.WithContext(ctx).Model(&models.User{}).Where("is_verified = ?", true).Count(&stats.VerifiedUsers)
	
	// Unverified users
	r.db.WithContext(ctx).Model(&models.User{}).Where("is_verified = ?", false).Count(&stats.UnverifiedUsers)
	
	// Locked users
	r.db.WithContext(ctx).Model(&models.User{}).Where("locked_until > ?", time.Now()).Count(&stats.LockedUsers)
	
	// New users today
	today := time.Now().Truncate(24 * time.Hour)
	r.db.WithContext(ctx).Model(&models.User{}).Where("created_at >= ?", today).Count(&stats.NewUsersToday)
	
	// New users this week
	weekStart := today.AddDate(0, 0, -int(today.Weekday()))
	r.db.WithContext(ctx).Model(&models.User{}).Where("created_at >= ?", weekStart).Count(&stats.NewUsersThisWeek)
	
	// New users this month
	monthStart := time.Date(today.Year(), today.Month(), 1, 0, 0, 0, 0, today.Location())
	r.db.WithContext(ctx).Model(&models.User{}).Where("created_at >= ?", monthStart).Count(&stats.NewUsersThisMonth)
	
	return stats, nil
}

// GetLoginStats retrieves login statistics for a user
func (r *userRepository) GetLoginStats(ctx context.Context, userID uuid.UUID) (*interfaces.LoginStats, error) {
	var user models.User
	if err := r.db.WithContext(ctx).
		Select("id", "last_login_at", "failed_login_count", "locked_until").
		Where("id = ?", userID).
		First(&user).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, fmt.Errorf("user not found")
		}
		return nil, fmt.Errorf("failed to get user login stats: %w", err)
	}
	
	return &interfaces.LoginStats{
		UserID:      user.ID,
		LastLogin:   user.LastLoginAt,
		IsLocked:    user.IsLocked(),
		LockedUntil: user.LockedUntil,
	}, nil
}

// BulkUpdate updates multiple users
func (r *userRepository) BulkUpdate(ctx context.Context, userIDs []uuid.UUID, updates map[string]interface{}) error {
	if err := r.db.WithContext(ctx).
		Model(&models.User{}).
		Where("id IN ?", userIDs).
		Updates(updates).Error; err != nil {
		return fmt.Errorf("failed to bulk update users: %w", err)
	}
	
	return nil
}

// BulkDelete deletes multiple users
func (r *userRepository) BulkDelete(ctx context.Context, userIDs []uuid.UUID) error {
	if err := r.db.WithContext(ctx).
		Delete(&models.User{}, userIDs).Error; err != nil {
		return fmt.Errorf("failed to bulk delete users: %w", err)
	}
	
	return nil
}

// BulkAssignRole assigns a role to multiple users
func (r *userRepository) BulkAssignRole(ctx context.Context, userIDs []uuid.UUID, roleID uuid.UUID) error {
	userRoles := make([]*models.UserRole, len(userIDs))
	now := time.Now()
	
	for i, userID := range userIDs {
		userRoles[i] = &models.UserRole{
			UserID:    userID,
			RoleID:    roleID,
			GrantedAt: now,
		}
	}
	
	if err := r.db.WithContext(ctx).Create(&userRoles).Error; err != nil {
		return fmt.Errorf("failed to bulk assign role: %w", err)
	}
	
	return nil
}

// BeginTransaction starts a new transaction
func (r *userRepository) BeginTransaction(ctx context.Context) (*gorm.DB, error) {
	return r.db.WithContext(ctx).Begin(), nil
}

// WithTransaction returns a repository instance with the given transaction
func (r *userRepository) WithTransaction(tx *gorm.DB) interfaces.UserRepository {
	return &userRepository{db: tx}
}

// buildQuery builds a GORM query with filters
func (r *userRepository) buildQuery(filters interfaces.UserFilters) *gorm.DB {
	query := r.db.Model(&models.User{})
	
	if filters.IsActive != nil {
		query = query.Where("is_active = ?", *filters.IsActive)
	}
	
	if filters.IsVerified != nil {
		query = query.Where("is_verified = ?", *filters.IsVerified)
	}
	
	if filters.Email != "" {
		query = query.Where("email = ?", filters.Email)
	}
	
	if filters.Username != "" {
		query = query.Where("username = ?", filters.Username)
	}
	
	if filters.RoleName != "" {
		query = query.Joins("JOIN user_roles ON users.id = user_roles.user_id").
			Joins("JOIN roles ON user_roles.role_id = roles.id").
			Where("roles.name = ?", filters.RoleName)
	}
	
	if filters.CreatedFrom != nil {
		query = query.Where("created_at >= ?", *filters.CreatedFrom)
	}
	
	if filters.CreatedTo != nil {
		query = query.Where("created_at <= ?", *filters.CreatedTo)
	}
	
	if filters.LastLoginFrom != nil {
		query = query.Where("last_login_at >= ?", *filters.LastLoginFrom)
	}
	
	if filters.LastLoginTo != nil {
		query = query.Where("last_login_at <= ?", *filters.LastLoginTo)
	}
	
	// Add sorting
	sortBy := filters.SortBy
	if sortBy == "" {
		sortBy = "created_at"
	}
	
	sortOrder := filters.SortOrder
	if sortOrder == "" {
		sortOrder = "desc"
	}
	
	query = query.Order(fmt.Sprintf("%s %s", sortBy, sortOrder))
	
	return query
}