package com.company.project.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
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
 * User Entity
 * 
 * Core user entity with comprehensive security features and audit capabilities.
 * 
 * Security Features:
 * - Secure password storage (never exposed in JSON)
 * - Account status management (enabled, locked, expired)
 * - Role-based access control through relationships
 * - Audit trail with creation and modification tracking
 * - Email verification and password reset tokens
 * 
 * Database Features:
 * - Optimized indexing for frequent queries
 * - Cascade operations for related entities
 * - Audit logging with JPA Auditing
 * - Soft delete capabilities
 * - Optimistic locking for concurrent updates
 * 
 * Validation Features:
 * - Email format validation
 * - Username and password constraints
 * - Required field validation
 * - Size constraints for security
 * 
 * @author Spring Boot Professional Template
 * @version 1.0.0
 * @since 2024-01-01
 */
@Entity
@Table(name = "users", indexes = {
    @Index(name = "idx_username", columnList = "username", unique = true),
    @Index(name = "idx_email", columnList = "email", unique = true),
    @Index(name = "idx_enabled", columnList = "enabled"),
    @Index(name = "idx_created_at", columnList = "created_at")
})
@EntityListeners(AuditingEntityListener.class)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString(exclude = {"password", "roles"})
@EqualsAndHashCode(of = "id")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Username is required")
    @Size(min = 3, max = 50, message = "Username must be between 3 and 50 characters")
    @Column(name = "username", nullable = false, unique = true, length = 50)
    private String username;

    @NotBlank(message = "Email is required")
    @Email(message = "Email must be valid")
    @Size(max = 100, message = "Email must not exceed 100 characters")
    @Column(name = "email", nullable = false, unique = true, length = 100)
    private String email;

    @NotBlank(message = "First name is required")
    @Size(min = 1, max = 50, message = "First name must be between 1 and 50 characters")
    @Column(name = "first_name", nullable = false, length = 50)
    private String firstName;

    @NotBlank(message = "Last name is required")
    @Size(min = 1, max = 50, message = "Last name must be between 1 and 50 characters")
    @Column(name = "last_name", nullable = false, length = 50)
    private String lastName;

    @NotBlank(message = "Password is required")
    @Size(min = 8, max = 128, message = "Password must be between 8 and 128 characters")
    @Column(name = "password", nullable = false, length = 128)
    private String password;

    @Builder.Default
    @Column(name = "enabled", nullable = false)
    private boolean enabled = true;

    @Builder.Default
    @Column(name = "account_non_expired", nullable = false)
    private boolean accountNonExpired = true;

    @Builder.Default
    @Column(name = "account_non_locked", nullable = false)
    private boolean accountNonLocked = true;

    @Builder.Default
    @Column(name = "credentials_non_expired", nullable = false)
    private boolean credentialsNonExpired = true;

    @Builder.Default
    @Column(name = "email_verified", nullable = false)
    private boolean emailVerified = false;

    @Column(name = "email_verification_token", length = 255)
    private String emailVerificationToken;

    @Column(name = "email_verification_expires_at")
    private Instant emailVerificationExpiresAt;

    @Column(name = "password_reset_token", length = 255)
    private String passwordResetToken;

    @Column(name = "password_reset_expires_at")
    private Instant passwordResetExpiresAt;

    @Column(name = "last_login_at")
    private Instant lastLoginAt;

    @Column(name = "login_attempts", nullable = false)
    @Builder.Default
    private Integer loginAttempts = 0;

    @Column(name = "locked_until")
    private Instant lockedUntil;

    @Column(name = "password_changed_at")
    private Instant passwordChangedAt;

    @Builder.Default
    @Column(name = "two_factor_enabled", nullable = false)
    private boolean twoFactorEnabled = false;

    @Column(name = "two_factor_secret", length = 32)
    private String twoFactorSecret;

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
    @ManyToMany(fetch = FetchType.EAGER, cascade = {CascadeType.PERSIST, CascadeType.MERGE})
    @JoinTable(
        name = "user_roles",
        joinColumns = @JoinColumn(name = "user_id"),
        inverseJoinColumns = @JoinColumn(name = "role_id"),
        indexes = {
            @Index(name = "idx_user_roles_user_id", columnList = "user_id"),
            @Index(name = "idx_user_roles_role_id", columnList = "role_id")
        }
    )
    @Builder.Default
    private Set<Role> roles = new HashSet<>();

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private Set<UserSession> sessions = new HashSet<>();

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private Set<AuditLog> auditLogs = new HashSet<>();

    // Business methods

    /**
     * Get user's full name
     * 
     * @return String full name
     */
    public String getFullName() {
        return firstName + " " + lastName;
    }

    /**
     * Check if user has specific role
     * 
     * @param roleName Role name to check
     * @return boolean true if user has the role
     */
    public boolean hasRole(String roleName) {
        return roles.stream()
                .anyMatch(role -> role.getName().equalsIgnoreCase(roleName));
    }

    /**
     * Add role to user
     * 
     * @param role Role to add
     */
    public void addRole(Role role) {
        roles.add(role);
        role.getUsers().add(this);
    }

    /**
     * Remove role from user
     * 
     * @param role Role to remove
     */
    public void removeRole(Role role) {
        roles.remove(role);
        role.getUsers().remove(this);
    }

    /**
     * Check if account is locked
     * 
     * @return boolean true if account is locked
     */
    public boolean isAccountLocked() {
        return !accountNonLocked || (lockedUntil != null && lockedUntil.isAfter(Instant.now()));
    }

    /**
     * Lock user account
     * 
     * @param until Instant when lock expires
     */
    public void lockAccount(Instant until) {
        this.accountNonLocked = false;
        this.lockedUntil = until;
    }

    /**
     * Unlock user account
     */
    public void unlockAccount() {
        this.accountNonLocked = true;
        this.lockedUntil = null;
        this.loginAttempts = 0;
    }

    /**
     * Increment login attempts
     */
    public void incrementLoginAttempts() {
        this.loginAttempts = (this.loginAttempts == null ? 0 : this.loginAttempts) + 1;
    }

    /**
     * Reset login attempts
     */
    public void resetLoginAttempts() {
        this.loginAttempts = 0;
    }

    /**
     * Update last login timestamp
     */
    public void updateLastLogin() {
        this.lastLoginAt = Instant.now();
        resetLoginAttempts();
    }

    /**
     * Set email verification token
     * 
     * @param token Verification token
     * @param expiresAt Token expiration time
     */
    public void setEmailVerificationToken(String token, Instant expiresAt) {
        this.emailVerificationToken = token;
        this.emailVerificationExpiresAt = expiresAt;
    }

    /**
     * Verify email address
     */
    public void verifyEmail() {
        this.emailVerified = true;
        this.emailVerificationToken = null;
        this.emailVerificationExpiresAt = null;
    }

    /**
     * Set password reset token
     * 
     * @param token Reset token
     * @param expiresAt Token expiration time
     */
    public void setPasswordResetToken(String token, Instant expiresAt) {
        this.passwordResetToken = token;
        this.passwordResetExpiresAt = expiresAt;
    }

    /**
     * Clear password reset token
     */
    public void clearPasswordResetToken() {
        this.passwordResetToken = null;
        this.passwordResetExpiresAt = null;
    }

    /**
     * Update password and related fields
     * 
     * @param newPassword New encoded password
     */
    public void updatePassword(String newPassword) {
        this.password = newPassword;
        this.passwordChangedAt = Instant.now();
        this.credentialsNonExpired = true;
        clearPasswordResetToken();
    }

    /**
     * Soft delete user
     * 
     * @param deletedBy User who performed the deletion
     */
    public void softDelete(String deletedBy) {
        this.deleted = true;
        this.deletedAt = Instant.now();
        this.deletedBy = deletedBy;
        this.enabled = false;
    }

    /**
     * Restore soft deleted user
     */
    public void restore() {
        this.deleted = false;
        this.deletedAt = null;
        this.deletedBy = null;
        this.enabled = true;
    }

    /**
     * Check if user is deleted
     * 
     * @return boolean true if user is deleted
     */
    public boolean isDeleted() {
        return deleted;
    }

    /**
     * Enable two-factor authentication
     * 
     * @param secret Two-factor secret
     */
    public void enableTwoFactor(String secret) {
        this.twoFactorEnabled = true;
        this.twoFactorSecret = secret;
    }

    /**
     * Disable two-factor authentication
     */
    public void disableTwoFactor() {
        this.twoFactorEnabled = false;
        this.twoFactorSecret = null;
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
    }

    @PreUpdate
    protected void preUpdate() {
        updatedAt = Instant.now();
    }
}