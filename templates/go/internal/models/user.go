package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// User represents a user in the system
type User struct {
	ID                uuid.UUID `json:"id" gorm:"type:uuid;primary_key;default:gen_random_uuid()"`
	Email             string    `json:"email" gorm:"uniqueIndex;not null" validate:"required,email"`
	Username          string    `json:"username" gorm:"uniqueIndex;not null" validate:"required,min=3,max=50"`
	PasswordHash      string    `json:"-" gorm:"not null"`
	FirstName         string    `json:"first_name" gorm:"not null" validate:"required,min=1,max=50"`
	LastName          string    `json:"last_name" gorm:"not null" validate:"required,min=1,max=50"`
	IsActive          bool      `json:"is_active" gorm:"default:true"`
	IsVerified        bool      `json:"is_verified" gorm:"default:false"`
	LastLoginAt       *time.Time `json:"last_login_at"`
	FailedLoginCount  int       `json:"-" gorm:"default:0"`
	LockedUntil       *time.Time `json:"-"`
	PasswordChangedAt time.Time `json:"-" gorm:"default:CURRENT_TIMESTAMP"`
	CreatedAt         time.Time `json:"created_at"`
	UpdatedAt         time.Time `json:"updated_at"`
	DeletedAt         gorm.DeletedAt `json:"-" gorm:"index"`

	// Relationships
	Roles        []Role        `json:"roles" gorm:"many2many:user_roles;"`
	RefreshTokens []RefreshToken `json:"-" gorm:"foreignKey:UserID"`
	AuditLogs    []AuditLog    `json:"-" gorm:"foreignKey:UserID"`
}

// BeforeCreate is a GORM hook that runs before creating a user
func (u *User) BeforeCreate(tx *gorm.DB) error {
	if u.ID == uuid.Nil {
		u.ID = uuid.New()
	}
	u.PasswordChangedAt = time.Now()
	return nil
}

// GetFullName returns the user's full name
func (u *User) GetFullName() string {
	return u.FirstName + " " + u.LastName
}

// IsLocked returns true if the user account is locked
func (u *User) IsLocked() bool {
	return u.LockedUntil != nil && u.LockedUntil.After(time.Now())
}

// HasRole checks if the user has a specific role
func (u *User) HasRole(roleName string) bool {
	for _, role := range u.Roles {
		if role.Name == roleName {
			return true
		}
	}
	return false
}

// HasPermission checks if the user has a specific permission
func (u *User) HasPermission(permission string) bool {
	for _, role := range u.Roles {
		if role.HasPermission(permission) {
			return true
		}
	}
	return false
}

// IsAdmin checks if the user has admin role
func (u *User) IsAdmin() bool {
	return u.HasRole("admin")
}

// CanLogin checks if the user can login (active, verified, not locked)
func (u *User) CanLogin() bool {
	return u.IsActive && u.IsVerified && !u.IsLocked()
}

// UserCreateRequest represents the request structure for creating a user
type UserCreateRequest struct {
	Email     string `json:"email" validate:"required,email"`
	Username  string `json:"username" validate:"required,min=3,max=50"`
	Password  string `json:"password" validate:"required,min=8,max=128"`
	FirstName string `json:"first_name" validate:"required,min=1,max=50"`
	LastName  string `json:"last_name" validate:"required,min=1,max=50"`
}

// UserUpdateRequest represents the request structure for updating a user
type UserUpdateRequest struct {
	Email     *string `json:"email,omitempty" validate:"omitempty,email"`
	Username  *string `json:"username,omitempty" validate:"omitempty,min=3,max=50"`
	FirstName *string `json:"first_name,omitempty" validate:"omitempty,min=1,max=50"`
	LastName  *string `json:"last_name,omitempty" validate:"omitempty,min=1,max=50"`
	IsActive  *bool   `json:"is_active,omitempty"`
}

// UserResponse represents the response structure for user data
type UserResponse struct {
	ID          uuid.UUID `json:"id"`
	Email       string    `json:"email"`
	Username    string    `json:"username"`
	FirstName   string    `json:"first_name"`
	LastName    string    `json:"last_name"`
	FullName    string    `json:"full_name"`
	IsActive    bool      `json:"is_active"`
	IsVerified  bool      `json:"is_verified"`
	LastLoginAt *time.Time `json:"last_login_at"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
	Roles       []RoleResponse `json:"roles"`
}

// ToResponse converts a User model to UserResponse
func (u *User) ToResponse() UserResponse {
	roles := make([]RoleResponse, len(u.Roles))
	for i, role := range u.Roles {
		roles[i] = role.ToResponse()
	}

	return UserResponse{
		ID:          u.ID,
		Email:       u.Email,
		Username:    u.Username,
		FirstName:   u.FirstName,
		LastName:    u.LastName,
		FullName:    u.GetFullName(),
		IsActive:    u.IsActive,
		IsVerified:  u.IsVerified,
		LastLoginAt: u.LastLoginAt,
		CreatedAt:   u.CreatedAt,
		UpdatedAt:   u.UpdatedAt,
		Roles:       roles,
	}
}

// LoginRequest represents the login request structure
type LoginRequest struct {
	Login    string `json:"login" validate:"required"` // Can be email or username
	Password string `json:"password" validate:"required"`
}

// ChangePasswordRequest represents the change password request structure
type ChangePasswordRequest struct {
	CurrentPassword string `json:"current_password" validate:"required"`
	NewPassword     string `json:"new_password" validate:"required,min=8,max=128"`
}

// ForgotPasswordRequest represents the forgot password request structure
type ForgotPasswordRequest struct {
	Email string `json:"email" validate:"required,email"`
}

// ResetPasswordRequest represents the reset password request structure
type ResetPasswordRequest struct {
	Token       string `json:"token" validate:"required"`
	NewPassword string `json:"new_password" validate:"required,min=8,max=128"`
}