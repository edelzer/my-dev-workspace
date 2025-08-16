package com.company.project.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import org.springframework.data.annotation.CreatedBy;
import org.springframework.data.annotation.LastModifiedBy;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.Instant;
import java.util.HashSet;
import java.util.Set;

/**
 * Role Entity
 * 
 * Role-based access control entity for managing user permissions and authorities.
 * 
 * Security Features:
 * - Hierarchical role structure support
 * - Permission-based authorization
 * - Audit trail for role changes
 * - Role inheritance capabilities
 * - System vs user-defined role distinction
 * 
 * Database Features:
 * - Optimized indexing for role queries
 * - Many-to-many relationships with users
 * - Cascade operations for permissions
 * - Optimistic locking for concurrent updates
 * - Soft delete capabilities
 * 
 * @author Spring Boot Professional Template
 * @version 1.0.0
 * @since 2024-01-01
 */
@Entity
@Table(name = "roles", indexes = {
    @Index(name = "idx_role_name", columnList = "name", unique = true),
    @Index(name = "idx_role_system", columnList = "system_role"),
    @Index(name = "idx_role_enabled", columnList = "enabled")
})
@EntityListeners(AuditingEntityListener.class)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString(exclude = {"users", "permissions"})
@EqualsAndHashCode(of = "id")
public class Role {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Role name is required")
    @Size(min = 2, max = 50, message = "Role name must be between 2 and 50 characters")
    @Column(name = "name", nullable = false, unique = true, length = 50)
    private String name;

    @Size(max = 255, message = "Description must not exceed 255 characters")
    @Column(name = "description", length = 255)
    private String description;

    @Builder.Default
    @Column(name = "enabled", nullable = false)
    private boolean enabled = true;

    @Builder.Default
    @Column(name = "system_role", nullable = false)
    private boolean systemRole = false;

    @Column(name = "color", length = 7)
    private String color; // Hex color code for UI

    @Column(name = "icon", length = 50)
    private String icon; // Icon identifier for UI

    @Builder.Default
    @Column(name = "priority", nullable = false)
    private Integer priority = 0; // Higher number = higher priority

    // Audit fields
    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    @CreatedBy
    @Column(name = "created_by", length = 50)
    private String createdBy;

    @LastModifiedBy
    @Column(name = "last_modified_by", length = 50)
    private String lastModifiedBy;

    @Version
    @Column(name = "version")
    private Long version;

    @Builder.Default
    @Column(name = "deleted", nullable = false)
    private boolean deleted = false;

    @Column(name = "deleted_at")
    private Instant deletedAt;

    @Column(name = "deleted_by", length = 50)
    private String deletedBy;

    // Relationships
    @ManyToMany(mappedBy = "roles", fetch = FetchType.LAZY)
    @Builder.Default
    private Set<User> users = new HashSet<>();

    @ManyToMany(fetch = FetchType.EAGER, cascade = {CascadeType.PERSIST, CascadeType.MERGE})
    @JoinTable(
        name = "role_permissions",
        joinColumns = @JoinColumn(name = "role_id"),
        inverseJoinColumns = @JoinColumn(name = "permission_id"),
        indexes = {
            @Index(name = "idx_role_permissions_role_id", columnList = "role_id"),
            @Index(name = "idx_role_permissions_permission_id", columnList = "permission_id")
        }
    )
    @Builder.Default
    private Set<Permission> permissions = new HashSet<>();

    // Role hierarchy support
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parent_role_id")
    private Role parentRole;

    @OneToMany(mappedBy = "parentRole", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private Set<Role> childRoles = new HashSet<>();

    // Business methods

    /**
     * Check if role has specific permission
     * 
     * @param permissionName Permission name to check
     * @return boolean true if role has the permission
     */
    public boolean hasPermission(String permissionName) {
        // Check direct permissions
        boolean hasDirectPermission = permissions.stream()
                .anyMatch(permission -> 
                    permission.getName().equalsIgnoreCase(permissionName) && permission.isEnabled());
        
        if (hasDirectPermission) {
            return true;
        }
        
        // Check inherited permissions from parent role
        if (parentRole != null && parentRole.isEnabled()) {
            return parentRole.hasPermission(permissionName);
        }
        
        return false;
    }

    /**
     * Add permission to role
     * 
     * @param permission Permission to add
     */
    public void addPermission(Permission permission) {
        permissions.add(permission);
        permission.getRoles().add(this);
    }

    /**
     * Remove permission from role
     * 
     * @param permission Permission to remove
     */
    public void removePermission(Permission permission) {
        permissions.remove(permission);
        permission.getRoles().remove(this);
    }

    /**
     * Get all permissions including inherited ones
     * 
     * @return Set<Permission> all permissions
     */
    public Set<Permission> getAllPermissions() {
        Set<Permission> allPermissions = new HashSet<>(permissions);
        
        // Add inherited permissions from parent role
        if (parentRole != null && parentRole.isEnabled()) {
            allPermissions.addAll(parentRole.getAllPermissions());
        }
        
        return allPermissions;
    }

    /**
     * Check if role is system role (cannot be deleted)
     * 
     * @return boolean true if system role
     */
    public boolean isSystemRole() {
        return systemRole;
    }

    /**
     * Check if role is deletable
     * 
     * @return boolean true if role can be deleted
     */
    public boolean isDeletable() {
        return !systemRole && users.isEmpty();
    }

    /**
     * Get user count for this role
     * 
     * @return int number of users with this role
     */
    public int getUserCount() {
        return users.size();
    }

    /**
     * Set parent role for hierarchy
     * 
     * @param parent Parent role
     */
    public void setParentRole(Role parent) {
        if (this.parentRole != null) {
            this.parentRole.getChildRoles().remove(this);
        }
        
        this.parentRole = parent;
        
        if (parent != null) {
            parent.getChildRoles().add(this);
        }
    }

    /**
     * Remove parent role
     */
    public void removeParentRole() {
        if (this.parentRole != null) {
            this.parentRole.getChildRoles().remove(this);
            this.parentRole = null;
        }
    }

    /**
     * Check if role has child roles
     * 
     * @return boolean true if role has children
     */
    public boolean hasChildRoles() {
        return !childRoles.isEmpty();
    }

    /**
     * Get role hierarchy level (0 = root)
     * 
     * @return int hierarchy level
     */
    public int getHierarchyLevel() {
        if (parentRole == null) {
            return 0;
        }
        return parentRole.getHierarchyLevel() + 1;
    }

    /**
     * Soft delete role
     * 
     * @param deletedBy User who performed the deletion
     */
    public void softDelete(String deletedBy) {
        if (systemRole) {
            throw new IllegalStateException("System roles cannot be deleted");
        }
        
        this.deleted = true;
        this.deletedAt = Instant.now();
        this.deletedBy = deletedBy;
        this.enabled = false;
    }

    /**
     * Restore soft deleted role
     */
    public void restore() {
        this.deleted = false;
        this.deletedAt = null;
        this.deletedBy = null;
        this.enabled = true;
    }

    /**
     * Check if role is deleted
     * 
     * @return boolean true if role is deleted
     */
    public boolean isDeleted() {
        return deleted;
    }

    /**
     * Create display name for role
     * 
     * @return String formatted display name
     */
    public String getDisplayName() {
        return name.substring(0, 1).toUpperCase() + 
               name.substring(1).toLowerCase().replace("_", " ");
    }

    /**
     * Get role authority name for Spring Security
     * 
     * @return String authority name
     */
    public String getAuthority() {
        return "ROLE_" + name.toUpperCase();
    }

    // JPA lifecycle callbacks

    @PrePersist
    protected void prePersist() {
        if (createdAt == null) {
            createdAt = Instant.now();
        }
        if (updatedAt == null) {
            updatedAt = Instant.now();
        }
        
        // Set default color if not provided
        if (color == null) {
            color = generateDefaultColor();
        }
    }

    @PreUpdate
    protected void preUpdate() {
        updatedAt = Instant.now();
    }

    /**
     * Generate default color based on role name
     * 
     * @return String hex color code
     */
    private String generateDefaultColor() {
        // Simple hash-based color generation
        int hash = name.hashCode();
        return String.format("#%06X", (hash & 0xFFFFFF));
    }

    // Static factory methods for common roles

    /**
     * Create ADMIN role
     * 
     * @return Role admin role
     */
    public static Role createAdminRole() {
        return Role.builder()
                .name("ADMIN")
                .description("System Administrator")
                .systemRole(true)
                .priority(1000)
                .color("#FF5722")
                .icon("admin")
                .build();
    }

    /**
     * Create USER role
     * 
     * @return Role user role
     */
    public static Role createUserRole() {
        return Role.builder()
                .name("USER")
                .description("Regular User")
                .systemRole(true)
                .priority(100)
                .color("#2196F3")
                .icon("user")
                .build();
    }

    /**
     * Create MODERATOR role
     * 
     * @return Role moderator role
     */
    public static Role createModeratorRole() {
        return Role.builder()
                .name("MODERATOR")
                .description("Content Moderator")
                .systemRole(true)
                .priority(500)
                .color("#FF9800")
                .icon("moderator")
                .build();
    }
}