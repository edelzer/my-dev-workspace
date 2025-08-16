package interfaces

import (
	"context"
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"

	"app/internal/models"
)

// UserRepository defines the interface for user data operations
type UserRepository interface {
	// Basic CRUD operations
	Create(ctx context.Context, user *models.User) error
	GetByID(ctx context.Context, id uuid.UUID) (*models.User, error)
	GetByEmail(ctx context.Context, email string) (*models.User, error)
	GetByUsername(ctx context.Context, username string) (*models.User, error)
	GetByEmailOrUsername(ctx context.Context, login string) (*models.User, error)
	Update(ctx context.Context, user *models.User) error
	Delete(ctx context.Context, id uuid.UUID) error
	SoftDelete(ctx context.Context, id uuid.UUID) error

	// List operations
	List(ctx context.Context, filters UserFilters) ([]*models.User, error)
	Count(ctx context.Context, filters UserFilters) (int64, error)
	ListWithPagination(ctx context.Context, filters UserFilters, offset, limit int) ([]*models.User, int64, error)

	// Authentication related
	UpdatePassword(ctx context.Context, userID uuid.UUID, hashedPassword string) error
	UpdateLastLogin(ctx context.Context, userID uuid.UUID) error
	IncrementFailedLoginCount(ctx context.Context, userID uuid.UUID) error
	ResetFailedLoginCount(ctx context.Context, userID uuid.UUID) error
	LockUser(ctx context.Context, userID uuid.UUID, lockDuration int) error
	UnlockUser(ctx context.Context, userID uuid.UUID) error

	// Email verification
	MarkEmailAsVerified(ctx context.Context, userID uuid.UUID) error
	IsEmailVerified(ctx context.Context, userID uuid.UUID) (bool, error)

	// User status
	ActivateUser(ctx context.Context, userID uuid.UUID) error
	DeactivateUser(ctx context.Context, userID uuid.UUID) error
	IsUserActive(ctx context.Context, userID uuid.UUID) (bool, error)

	// Role management
	AssignRole(ctx context.Context, userID, roleID uuid.UUID) error
	RevokeRole(ctx context.Context, userID, roleID uuid.UUID) error
	GetUserRoles(ctx context.Context, userID uuid.UUID) ([]*models.Role, error)
	HasRole(ctx context.Context, userID uuid.UUID, roleName string) (bool, error)
	HasPermission(ctx context.Context, userID uuid.UUID, permission string) (bool, error)

	// Search and filtering
	SearchUsers(ctx context.Context, query string, filters UserFilters) ([]*models.User, error)
	GetActiveUsers(ctx context.Context) ([]*models.User, error)
	GetInactiveUsers(ctx context.Context) ([]*models.User, error)
	GetUsersCreatedAfter(ctx context.Context, after time.Time) ([]*models.User, error)
	GetUsersWithRole(ctx context.Context, roleName string) ([]*models.User, error)

	// Statistics
	GetUserStats(ctx context.Context) (*UserStats, error)
	GetLoginStats(ctx context.Context, userID uuid.UUID) (*LoginStats, error)

	// Bulk operations
	BulkUpdate(ctx context.Context, userIDs []uuid.UUID, updates map[string]interface{}) error
	BulkDelete(ctx context.Context, userIDs []uuid.UUID) error
	BulkAssignRole(ctx context.Context, userIDs []uuid.UUID, roleID uuid.UUID) error

	// Database operations
	BeginTransaction(ctx context.Context) (*gorm.DB, error)
	WithTransaction(tx *gorm.DB) UserRepository
}

// UserFilters represents filters for user queries
type UserFilters struct {
	IsActive    *bool
	IsVerified  *bool
	RoleName    string
	Email       string
	Username    string
	CreatedFrom *time.Time
	CreatedTo   *time.Time
	LastLoginFrom *time.Time
	LastLoginTo   *time.Time
	SortBy      string // "created_at", "updated_at", "email", "username", "last_login_at"
	SortOrder   string // "asc", "desc"
}

// UserStats represents user statistics
type UserStats struct {
	TotalUsers      int64 `json:"total_users"`
	ActiveUsers     int64 `json:"active_users"`
	InactiveUsers   int64 `json:"inactive_users"`
	VerifiedUsers   int64 `json:"verified_users"`
	UnverifiedUsers int64 `json:"unverified_users"`
	LockedUsers     int64 `json:"locked_users"`
	NewUsersToday   int64 `json:"new_users_today"`
	NewUsersThisWeek int64 `json:"new_users_this_week"`
	NewUsersThisMonth int64 `json:"new_users_this_month"`
}

// LoginStats represents login statistics for a user
type LoginStats struct {
	UserID           uuid.UUID  `json:"user_id"`
	TotalLogins      int64      `json:"total_logins"`
	SuccessfulLogins int64      `json:"successful_logins"`
	FailedLogins     int64      `json:"failed_logins"`
	LastLogin        *time.Time `json:"last_login"`
	LastFailedLogin  *time.Time `json:"last_failed_login"`
	IsLocked         bool       `json:"is_locked"`
	LockedUntil      *time.Time `json:"locked_until"`
}