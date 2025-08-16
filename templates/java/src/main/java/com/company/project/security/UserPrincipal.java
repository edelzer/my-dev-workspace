package com.company.project.security;

import com.company.project.model.User;
import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.List;
import java.util.stream.Collectors;

/**
 * User Principal for Spring Security Authentication
 * 
 * Custom UserDetails implementation that provides user information
 * and authorities for Spring Security authentication and authorization.
 * 
 * Security Features:
 * - Secure password handling with JsonIgnore
 * - Role-based authority mapping
 * - Account status management (enabled, locked, expired)
 * - Comprehensive user information for authorization decisions
 * - Integration with JWT token generation and validation
 * 
 * Authentication Properties:
 * - Username and password for credential validation
 * - Granted authorities based on user roles
 * - Account status flags for security controls
 * - User profile information for application context
 * 
 * @author Spring Boot Professional Template
 * @version 1.0.0
 * @since 2024-01-01
 */
@Data
@AllArgsConstructor
@EqualsAndHashCode(of = "id")
public class UserPrincipal implements UserDetails {
    
    private Long id;
    private String username;
    private String email;
    private String firstName;
    private String lastName;
    
    @JsonIgnore
    private String password;
    
    private boolean enabled;
    private boolean accountNonExpired;
    private boolean accountNonLocked;
    private boolean credentialsNonExpired;
    
    private Collection<? extends GrantedAuthority> authorities;

    /**
     * Create UserPrincipal from User entity
     * 
     * Factory method that converts a User entity into a UserPrincipal
     * for Spring Security authentication.
     * 
     * @param user User entity from database
     * @return UserPrincipal configured user principal
     */
    public static UserPrincipal create(User user) {
        List<GrantedAuthority> authorities = user.getRoles().stream()
                .map(role -> new SimpleGrantedAuthority("ROLE_" + role.getName().toUpperCase()))
                .collect(Collectors.toList());

        return new UserPrincipal(
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getFirstName(),
                user.getLastName(),
                user.getPassword(),
                user.isEnabled(),
                user.isAccountNonExpired(),
                user.isAccountNonLocked(),
                user.isCredentialsNonExpired(),
                authorities
        );
    }

    /**
     * Get user authorities for authorization
     * 
     * @return Collection<? extends GrantedAuthority> user authorities
     */
    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return authorities;
    }

    /**
     * Get user password for authentication
     * 
     * @return String encoded password
     */
    @Override
    @JsonIgnore
    public String getPassword() {
        return password;
    }

    /**
     * Get username for authentication
     * 
     * @return String username
     */
    @Override
    public String getUsername() {
        return username;
    }

    /**
     * Check if account is not expired
     * 
     * @return boolean true if account is not expired
     */
    @Override
    public boolean isAccountNonExpired() {
        return accountNonExpired;
    }

    /**
     * Check if account is not locked
     * 
     * @return boolean true if account is not locked
     */
    @Override
    public boolean isAccountNonLocked() {
        return accountNonLocked;
    }

    /**
     * Check if credentials are not expired
     * 
     * @return boolean true if credentials are not expired
     */
    @Override
    public boolean isCredentialsNonExpired() {
        return credentialsNonExpired;
    }

    /**
     * Check if user account is enabled
     * 
     * @return boolean true if account is enabled
     */
    @Override
    public boolean isEnabled() {
        return enabled;
    }

    /**
     * Get full name of user
     * 
     * @return String full name (first + last)
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
        return authorities.stream()
                .anyMatch(authority -> 
                    authority.getAuthority().equals("ROLE_" + roleName.toUpperCase()));
    }

    /**
     * Check if user has any of the specified roles
     * 
     * @param roleNames List of role names to check
     * @return boolean true if user has any of the roles
     */
    public boolean hasAnyRole(List<String> roleNames) {
        return roleNames.stream()
                .anyMatch(this::hasRole);
    }

    /**
     * Get user roles as strings
     * 
     * @return List<String> role names without ROLE_ prefix
     */
    public List<String> getRoleNames() {
        return authorities.stream()
                .map(GrantedAuthority::getAuthority)
                .map(authority -> authority.substring(5)) // Remove "ROLE_" prefix
                .collect(Collectors.toList());
    }

    /**
     * Check if user is administrator
     * 
     * @return boolean true if user has admin role
     */
    public boolean isAdmin() {
        return hasRole("ADMIN");
    }

    /**
     * Check if user is regular user
     * 
     * @return boolean true if user has user role
     */
    public boolean isUser() {
        return hasRole("USER");
    }

    /**
     * Create sanitized user principal for logging
     * 
     * Returns a version without sensitive information for safe logging.
     * 
     * @return UserPrincipal sanitized version for logging
     */
    public UserPrincipal sanitizedForLogging() {
        return new UserPrincipal(
                this.id,
                this.username,
                this.email,
                this.firstName,
                this.lastName,
                "[PROTECTED]", // Remove password
                this.enabled,
                this.accountNonExpired,
                this.accountNonLocked,
                this.credentialsNonExpired,
                this.authorities
        );
    }

    /**
     * String representation without sensitive data
     * 
     * @return String safe string representation
     */
    @Override
    public String toString() {
        return "UserPrincipal{" +
                "id=" + id +
                ", username='" + username + '\'' +
                ", email='" + email + '\'' +
                ", firstName='" + firstName + '\'' +
                ", lastName='" + lastName + '\'' +
                ", enabled=" + enabled +
                ", accountNonExpired=" + accountNonExpired +
                ", accountNonLocked=" + accountNonLocked +
                ", credentialsNonExpired=" + credentialsNonExpired +
                ", authorities=" + authorities +
                '}';
    }
}