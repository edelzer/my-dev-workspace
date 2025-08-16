package models

import (
	"database/sql/driver"
	"encoding/json"
	"fmt"
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// Permissions represents a list of permissions
type Permissions []string

// Value implements the driver.Valuer interface for database storage
func (p Permissions) Value() (driver.Value, error) {
	return json.Marshal(p)
}

// Scan implements the sql.Scanner interface for database retrieval
func (p *Permissions) Scan(value interface{}) error {
	if value == nil {
		*p = nil
		return nil
	}

	bytes, ok := value.([]byte)
	if !ok {
		return fmt.Errorf("cannot scan %T into Permissions", value)
	}

	return json.Unmarshal(bytes, p)
}

// Role represents a role in the system
type Role struct {
	ID          uuid.UUID   `json:"id" gorm:"type:uuid;primary_key;default:gen_random_uuid()"`
	Name        string      `json:"name" gorm:"uniqueIndex;not null" validate:"required,min=2,max=50"`
	Description string      `json:"description" gorm:"not null" validate:"required,max=255"`
	Permissions Permissions `json:"permissions" gorm:"type:jsonb"`
	IsActive    bool        `json:"is_active" gorm:"default:true"`
	CreatedAt   time.Time   `json:"created_at"`
	UpdatedAt   time.Time   `json:"updated_at"`
	DeletedAt   gorm.DeletedAt `json:"-" gorm:"index"`

	// Relationships
	Users []User `json:"-" gorm:"many2many:user_roles;"`
}

// BeforeCreate is a GORM hook that runs before creating a role
func (r *Role) BeforeCreate(tx *gorm.DB) error {
	if r.ID == uuid.Nil {
		r.ID = uuid.New()
	}
	return nil
}

// HasPermission checks if the role has a specific permission
func (r *Role) HasPermission(permission string) bool {
	// Check for wildcard permission
	for _, perm := range r.Permissions {
		if perm == "*" || perm == permission {
			return true
		}
		// Check for wildcard patterns (e.g., "user:*" matches "user:read")
		if len(perm) > 0 && perm[len(perm)-1] == '*' {
			prefix := perm[:len(perm)-1]
			if len(permission) >= len(prefix) && permission[:len(prefix)] == prefix {
				return true
			}
		}
	}
	return false
}

// AddPermission adds a permission to the role
func (r *Role) AddPermission(permission string) {
	for _, perm := range r.Permissions {
		if perm == permission {
			return // Permission already exists
		}
	}
	r.Permissions = append(r.Permissions, permission)
}

// RemovePermission removes a permission from the role
func (r *Role) RemovePermission(permission string) {
	for i, perm := range r.Permissions {
		if perm == permission {
			r.Permissions = append(r.Permissions[:i], r.Permissions[i+1:]...)
			return
		}
	}
}

// UserRole represents the many-to-many relationship between users and roles
type UserRole struct {
	ID        uuid.UUID `json:"id" gorm:"type:uuid;primary_key;default:gen_random_uuid()"`
	UserID    uuid.UUID `json:"user_id" gorm:"type:uuid;not null;index"`
	RoleID    uuid.UUID `json:"role_id" gorm:"type:uuid;not null;index"`
	GrantedAt time.Time `json:"granted_at" gorm:"default:CURRENT_TIMESTAMP"`
	GrantedBy uuid.UUID `json:"granted_by" gorm:"type:uuid"` // ID of user who granted this role
	ExpiresAt *time.Time `json:"expires_at"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`

	// Relationships
	User Role `json:"-" gorm:"foreignKey:UserID"`
	Role Role `json:"-" gorm:"foreignKey:RoleID"`
}

// IsExpired checks if the user role assignment has expired
func (ur *UserRole) IsExpired() bool {
	return ur.ExpiresAt != nil && ur.ExpiresAt.Before(time.Now())
}

// IsActive checks if the user role assignment is currently active
func (ur *UserRole) IsActive() bool {
	return !ur.IsExpired()
}

// RoleCreateRequest represents the request structure for creating a role
type RoleCreateRequest struct {
	Name        string   `json:"name" validate:"required,min=2,max=50"`
	Description string   `json:"description" validate:"required,max=255"`
	Permissions []string `json:"permissions" validate:"required,min=1"`
}

// RoleUpdateRequest represents the request structure for updating a role
type RoleUpdateRequest struct {
	Name        *string  `json:"name,omitempty" validate:"omitempty,min=2,max=50"`
	Description *string  `json:"description,omitempty" validate:"omitempty,max=255"`
	Permissions []string `json:"permissions,omitempty"`
	IsActive    *bool    `json:"is_active,omitempty"`
}

// RoleResponse represents the response structure for role data
type RoleResponse struct {
	ID          uuid.UUID `json:"id"`
	Name        string    `json:"name"`
	Description string    `json:"description"`
	Permissions []string  `json:"permissions"`
	IsActive    bool      `json:"is_active"`
	UserCount   int       `json:"user_count,omitempty"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

// ToResponse converts a Role model to RoleResponse
func (r *Role) ToResponse() RoleResponse {
	return RoleResponse{
		ID:          r.ID,
		Name:        r.Name,
		Description: r.Description,
		Permissions: []string(r.Permissions),
		IsActive:    r.IsActive,
		CreatedAt:   r.CreatedAt,
		UpdatedAt:   r.UpdatedAt,
	}
}

// AssignRoleRequest represents the request structure for assigning a role to a user
type AssignRoleRequest struct {
	UserID    uuid.UUID  `json:"user_id" validate:"required"`
	RoleID    uuid.UUID  `json:"role_id" validate:"required"`
	ExpiresAt *time.Time `json:"expires_at,omitempty"`
}

// RevokeRoleRequest represents the request structure for revoking a role from a user
type RevokeRoleRequest struct {
	UserID uuid.UUID `json:"user_id" validate:"required"`
	RoleID uuid.UUID `json:"role_id" validate:"required"`
}

// Permission constants
const (
	// User permissions
	PermissionUserRead   = "user:read"
	PermissionUserCreate = "user:create"
	PermissionUserUpdate = "user:update"
	PermissionUserDelete = "user:delete"
	PermissionUserAll    = "user:*"

	// Role permissions
	PermissionRoleRead   = "role:read"
	PermissionRoleCreate = "role:create"
	PermissionRoleUpdate = "role:update"
	PermissionRoleDelete = "role:delete"
	PermissionRoleAssign = "role:assign"
	PermissionRoleRevoke = "role:revoke"
	PermissionRoleAll    = "role:*"

	// System permissions
	PermissionSystemRead   = "system:read"
	PermissionSystemUpdate = "system:update"
	PermissionSystemAll    = "system:*"

	// Admin permission (all permissions)
	PermissionAll = "*"
)

// DefaultPermissions defines permission groups for common roles
var DefaultPermissions = map[string][]string{
	"admin": {
		PermissionAll,
	},
	"user": {
		PermissionUserRead,
		PermissionUserUpdate, // Allow users to update their own profile
	},
	"moderator": {
		PermissionUserRead,
		PermissionUserUpdate,
		PermissionRoleRead,
	},
}