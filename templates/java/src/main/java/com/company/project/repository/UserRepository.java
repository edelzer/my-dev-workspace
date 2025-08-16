package com.company.project.repository;

import com.company.project.model.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

/**
 * User Repository Interface
 * 
 * Comprehensive data access layer for User entity with security-optimized queries
 * and performance-focused database operations.
 * 
 * Repository Features:
 * - Standard CRUD operations with JpaRepository
 * - Dynamic query support with JpaSpecificationExecutor
 * - Custom security-focused query methods
 * - Optimized bulk operations for performance
 * - Soft delete support and filtering
 * - Advanced search and filtering capabilities
 * 
 * Security Features:
 * - Automatic soft delete filtering
 * - Account status validation queries
 * - Authentication-specific lookups
 * - Audit trail support queries
 * - Session management queries
 * 
 * Performance Features:
 * - Index-optimized query methods
 * - Efficient pagination support
 * - Bulk operations for mass updates
 * - Projected queries for specific use cases
 * - Database-level filtering to reduce data transfer
 * 
 * @author Spring Boot Professional Template
 * @version 1.0.0
 * @since 2024-01-01
 */
@Repository
public interface UserRepository extends JpaRepository<User, Long>, JpaSpecificationExecutor<User> {

    // Basic lookup methods

    /**
     * Find user by username (case-insensitive, active users only)
     * 
     * @param username Username to search for
     * @return Optional<User> user if found
     */
    @Query("SELECT u FROM User u WHERE LOWER(u.username) = LOWER(:username) AND u.deleted = false")
    Optional<User> findByUsername(@Param("username") String username);

    /**
     * Find user by email (case-insensitive, active users only)
     * 
     * @param email Email to search for
     * @return Optional<User> user if found
     */
    @Query("SELECT u FROM User u WHERE LOWER(u.email) = LOWER(:email) AND u.deleted = false")
    Optional<User> findByEmail(@Param("email") String email);

    /**
     * Find user by username or email (case-insensitive, active users only)
     * 
     * @param identifier Username or email to search for
     * @return Optional<User> user if found
     */
    @Query("SELECT u FROM User u WHERE (LOWER(u.username) = LOWER(:identifier) OR LOWER(u.email) = LOWER(:identifier)) AND u.deleted = false")
    Optional<User> findByUsernameOrEmail(@Param("identifier") String identifier);

    /**
     * Check if username exists (case-insensitive, including deleted users)
     * 
     * @param username Username to check
     * @return boolean true if username exists
     */
    @Query("SELECT COUNT(u) > 0 FROM User u WHERE LOWER(u.username) = LOWER(:username)")
    boolean existsByUsername(@Param("username") String username);

    /**
     * Check if email exists (case-insensitive, including deleted users)
     * 
     * @param email Email to check
     * @return boolean true if email exists
     */
    @Query("SELECT COUNT(u) > 0 FROM User u WHERE LOWER(u.email) = LOWER(:email)")
    boolean existsByEmail(@Param("email") String email);

    /**
     * Check if username exists for different user (for updates)
     * 
     * @param username Username to check
     * @param userId Current user ID to exclude
     * @return boolean true if username exists for different user
     */
    @Query("SELECT COUNT(u) > 0 FROM User u WHERE LOWER(u.username) = LOWER(:username) AND u.id != :userId")
    boolean existsByUsernameAndIdNot(@Param("username") String username, @Param("userId") Long userId);

    /**
     * Check if email exists for different user (for updates)
     * 
     * @param email Email to check
     * @param userId Current user ID to exclude
     * @return boolean true if email exists for different user
     */
    @Query("SELECT COUNT(u) > 0 FROM User u WHERE LOWER(u.email) = LOWER(:email) AND u.id != :userId")
    boolean existsByEmailAndIdNot(@Param("email") String email, @Param("userId") Long userId);

    // Authentication and security methods

    /**
     * Find user for authentication (includes all status checks)
     * 
     * @param username Username for authentication
     * @return Optional<User> user with roles eagerly loaded
     */
    @Query("SELECT u FROM User u LEFT JOIN FETCH u.roles WHERE LOWER(u.username) = LOWER(:username) AND u.deleted = false")
    Optional<User> findByUsernameWithRoles(@Param("username") String username);

    /**
     * Find user by email verification token
     * 
     * @param token Email verification token
     * @return Optional<User> user if token is valid and not expired
     */
    @Query("SELECT u FROM User u WHERE u.emailVerificationToken = :token AND u.emailVerificationExpiresAt > :now AND u.deleted = false")
    Optional<User> findByEmailVerificationToken(@Param("token") String token, @Param("now") Instant now);

    /**
     * Find user by password reset token
     * 
     * @param token Password reset token
     * @return Optional<User> user if token is valid and not expired
     */
    @Query("SELECT u FROM User u WHERE u.passwordResetToken = :token AND u.passwordResetExpiresAt > :now AND u.deleted = false")
    Optional<User> findByPasswordResetToken(@Param("token") String token, @Param("now") Instant now);

    // Status and filtering methods

    /**
     * Find all active (enabled and not deleted) users
     * 
     * @param pageable Pagination parameters
     * @return Page<User> paginated active users
     */
    @Query("SELECT u FROM User u WHERE u.enabled = true AND u.deleted = false ORDER BY u.createdAt DESC")
    Page<User> findActiveUsers(Pageable pageable);

    /**
     * Find all enabled users (including soft deleted for admin purposes)
     * 
     * @param pageable Pagination parameters
     * @return Page<User> paginated enabled users
     */
    Page<User> findByEnabledTrueOrderByCreatedAtDesc(Pageable pageable);

    /**
     * Find users by enabled status
     * 
     * @param enabled Enabled status to filter by
     * @param pageable Pagination parameters
     * @return Page<User> paginated users
     */
    @Query("SELECT u FROM User u WHERE u.enabled = :enabled AND u.deleted = false ORDER BY u.createdAt DESC")
    Page<User> findByEnabledAndNotDeleted(@Param("enabled") boolean enabled, Pageable pageable);

    /**
     * Find locked users
     * 
     * @param now Current timestamp
     * @param pageable Pagination parameters
     * @return Page<User> locked users
     */
    @Query("SELECT u FROM User u WHERE (u.accountNonLocked = false OR u.lockedUntil > :now) AND u.deleted = false ORDER BY u.lockedUntil DESC")
    Page<User> findLockedUsers(@Param("now") Instant now, Pageable pageable);

    /**
     * Find users with unverified emails
     * 
     * @param pageable Pagination parameters
     * @return Page<User> users with unverified emails
     */
    Page<User> findByEmailVerifiedFalseAndDeletedFalseOrderByCreatedAtDesc(Pageable pageable);

    /**
     * Find users created within time range
     * 
     * @param start Start timestamp
     * @param end End timestamp
     * @param pageable Pagination parameters
     * @return Page<User> users created in range
     */
    @Query("SELECT u FROM User u WHERE u.createdAt BETWEEN :start AND :end AND u.deleted = false ORDER BY u.createdAt DESC")
    Page<User> findByCreatedAtBetweenAndNotDeleted(@Param("start") Instant start, @Param("end") Instant end, Pageable pageable);

    /**
     * Find users with recent login activity
     * 
     * @param since Timestamp threshold
     * @param pageable Pagination parameters
     * @return Page<User> recently active users
     */
    @Query("SELECT u FROM User u WHERE u.lastLoginAt > :since AND u.deleted = false ORDER BY u.lastLoginAt DESC")
    Page<User> findRecentlyActiveUsers(@Param("since") Instant since, Pageable pageable);

    // Role-based queries

    /**
     * Find users by role name
     * 
     * @param roleName Role name to filter by
     * @param pageable Pagination parameters
     * @return Page<User> users with specified role
     */
    @Query("SELECT DISTINCT u FROM User u JOIN u.roles r WHERE LOWER(r.name) = LOWER(:roleName) AND u.deleted = false AND r.enabled = true ORDER BY u.createdAt DESC")
    Page<User> findByRoleName(@Param("roleName") String roleName, Pageable pageable);

    /**
     * Find users with any of the specified roles
     * 
     * @param roleNames List of role names
     * @param pageable Pagination parameters
     * @return Page<User> users with any of the specified roles
     */
    @Query("SELECT DISTINCT u FROM User u JOIN u.roles r WHERE LOWER(r.name) IN :roleNames AND u.deleted = false AND r.enabled = true ORDER BY u.createdAt DESC")
    Page<User> findByRoleNameIn(@Param("roleNames") List<String> roleNames, Pageable pageable);

    /**
     * Count users by role
     * 
     * @param roleName Role name to count
     * @return long count of users with role
     */
    @Query("SELECT COUNT(DISTINCT u) FROM User u JOIN u.roles r WHERE LOWER(r.name) = LOWER(:roleName) AND u.deleted = false AND r.enabled = true")
    long countByRoleName(@Param("roleName") String roleName);

    // Search and filtering methods

    /**
     * Search users by name or email (case-insensitive)
     * 
     * @param searchTerm Search term
     * @param pageable Pagination parameters
     * @return Page<User> matching users
     */
    @Query("SELECT u FROM User u WHERE (LOWER(u.firstName) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(u.lastName) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(u.email) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(u.username) LIKE LOWER(CONCAT('%', :searchTerm, '%'))) AND u.deleted = false " +
           "ORDER BY u.lastLoginAt DESC NULLS LAST, u.createdAt DESC")
    Page<User> searchUsers(@Param("searchTerm") String searchTerm, Pageable pageable);

    /**
     * Advanced search with multiple criteria
     * 
     * @param searchTerm General search term
     * @param enabled Enabled status filter
     * @param emailVerified Email verification status filter
     * @param pageable Pagination parameters
     * @return Page<User> filtered users
     */
    @Query("SELECT u FROM User u WHERE " +
           "(:searchTerm IS NULL OR " +
           " LOWER(u.firstName) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           " LOWER(u.lastName) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           " LOWER(u.email) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           " LOWER(u.username) LIKE LOWER(CONCAT('%', :searchTerm, '%'))) AND " +
           "(:enabled IS NULL OR u.enabled = :enabled) AND " +
           "(:emailVerified IS NULL OR u.emailVerified = :emailVerified) AND " +
           "u.deleted = false " +
           "ORDER BY u.createdAt DESC")
    Page<User> advancedSearch(@Param("searchTerm") String searchTerm,
                             @Param("enabled") Boolean enabled,
                             @Param("emailVerified") Boolean emailVerified,
                             Pageable pageable);

    // Bulk operations and updates

    /**
     * Update last login timestamp
     * 
     * @param userId User ID
     * @param loginTime Login timestamp
     * @return int number of updated records
     */
    @Modifying
    @Query("UPDATE User u SET u.lastLoginAt = :loginTime, u.loginAttempts = 0 WHERE u.id = :userId")
    int updateLastLogin(@Param("userId") Long userId, @Param("loginTime") Instant loginTime);

    /**
     * Increment login attempts
     * 
     * @param userId User ID
     * @return int number of updated records
     */
    @Modifying
    @Query("UPDATE User u SET u.loginAttempts = COALESCE(u.loginAttempts, 0) + 1 WHERE u.id = :userId")
    int incrementLoginAttempts(@Param("userId") Long userId);

    /**
     * Lock user account
     * 
     * @param userId User ID
     * @param lockedUntil Lock expiration time
     * @return int number of updated records
     */
    @Modifying
    @Query("UPDATE User u SET u.accountNonLocked = false, u.lockedUntil = :lockedUntil WHERE u.id = :userId")
    int lockAccount(@Param("userId") Long userId, @Param("lockedUntil") Instant lockedUntil);

    /**
     * Unlock user account
     * 
     * @param userId User ID
     * @return int number of updated records
     */
    @Modifying
    @Query("UPDATE User u SET u.accountNonLocked = true, u.lockedUntil = NULL, u.loginAttempts = 0 WHERE u.id = :userId")
    int unlockAccount(@Param("userId") Long userId);

    /**
     * Clear expired password reset tokens
     * 
     * @param now Current timestamp
     * @return int number of updated records
     */
    @Modifying
    @Query("UPDATE User u SET u.passwordResetToken = NULL, u.passwordResetExpiresAt = NULL WHERE u.passwordResetExpiresAt < :now")
    int clearExpiredPasswordResetTokens(@Param("now") Instant now);

    /**
     * Clear expired email verification tokens
     * 
     * @param now Current timestamp
     * @return int number of updated records
     */
    @Modifying
    @Query("UPDATE User u SET u.emailVerificationToken = NULL, u.emailVerificationExpiresAt = NULL WHERE u.emailVerificationExpiresAt < :now")
    int clearExpiredEmailVerificationTokens(@Param("now") Instant now);

    /**
     * Unlock accounts with expired lock time
     * 
     * @param now Current timestamp
     * @return int number of updated records
     */
    @Modifying
    @Query("UPDATE User u SET u.accountNonLocked = true, u.lockedUntil = NULL WHERE u.lockedUntil IS NOT NULL AND u.lockedUntil < :now")
    int unlockExpiredAccounts(@Param("now") Instant now);

    // Statistics and analytics methods

    /**
     * Count total active users
     * 
     * @return long count of active users
     */
    @Query("SELECT COUNT(u) FROM User u WHERE u.enabled = true AND u.deleted = false")
    long countActiveUsers();

    /**
     * Count users by email verification status
     * 
     * @param emailVerified Email verification status
     * @return long count of users
     */
    long countByEmailVerifiedAndDeletedFalse(boolean emailVerified);

    /**
     * Count users registered in time period
     * 
     * @param start Start timestamp
     * @param end End timestamp
     * @return long count of users
     */
    @Query("SELECT COUNT(u) FROM User u WHERE u.createdAt BETWEEN :start AND :end AND u.deleted = false")
    long countUsersRegisteredBetween(@Param("start") Instant start, @Param("end") Instant end);

    /**
     * Find users who never logged in
     * 
     * @param pageable Pagination parameters
     * @return Page<User> users who never logged in
     */
    @Query("SELECT u FROM User u WHERE u.lastLoginAt IS NULL AND u.deleted = false ORDER BY u.createdAt DESC")
    Page<User> findUsersNeverLoggedIn(Pageable pageable);

    /**
     * Find inactive users (no login within specified period)
     * 
     * @param inactiveSince Timestamp threshold for inactivity
     * @param pageable Pagination parameters
     * @return Page<User> inactive users
     */
    @Query("SELECT u FROM User u WHERE (u.lastLoginAt IS NULL OR u.lastLoginAt < :inactiveSince) AND u.deleted = false ORDER BY u.lastLoginAt ASC NULLS FIRST")
    Page<User> findInactiveUsers(@Param("inactiveSince") Instant inactiveSince, Pageable pageable);

    // Soft delete operations

    /**
     * Soft delete user
     * 
     * @param userId User ID
     * @param deletedBy User who performed deletion
     * @param deletedAt Deletion timestamp
     * @return int number of updated records
     */
    @Modifying
    @Query("UPDATE User u SET u.deleted = true, u.deletedAt = :deletedAt, u.deletedBy = :deletedBy, u.enabled = false WHERE u.id = :userId")
    int softDeleteUser(@Param("userId") Long userId, @Param("deletedBy") String deletedBy, @Param("deletedAt") Instant deletedAt);

    /**
     * Restore soft deleted user
     * 
     * @param userId User ID
     * @return int number of updated records
     */
    @Modifying
    @Query("UPDATE User u SET u.deleted = false, u.deletedAt = NULL, u.deletedBy = NULL, u.enabled = true WHERE u.id = :userId")
    int restoreUser(@Param("userId") Long userId);

    /**
     * Find soft deleted users
     * 
     * @param pageable Pagination parameters
     * @return Page<User> soft deleted users
     */
    Page<User> findByDeletedTrueOrderByDeletedAtDesc(Pageable pageable);

    /**
     * Find users deleted by specific user
     * 
     * @param deletedBy User who performed deletions
     * @param pageable Pagination parameters
     * @return Page<User> users deleted by specified user
     */
    Page<User> findByDeletedTrueAndDeletedByOrderByDeletedAtDesc(String deletedBy, Pageable pageable);
}