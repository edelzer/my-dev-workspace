-- Initial database schema for Spring Boot Professional Template
-- Security-first database design with comprehensive audit trails and indexing

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create roles table
CREATE TABLE roles (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    description VARCHAR(255),
    enabled BOOLEAN NOT NULL DEFAULT true,
    system_role BOOLEAN NOT NULL DEFAULT false,
    color VARCHAR(7),
    icon VARCHAR(50),
    priority INTEGER NOT NULL DEFAULT 0,
    parent_role_id BIGINT REFERENCES roles(id),
    
    -- Audit fields
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    created_by VARCHAR(50),
    last_modified_by VARCHAR(50),
    version BIGINT NOT NULL DEFAULT 0,
    
    -- Soft delete fields
    deleted BOOLEAN NOT NULL DEFAULT false,
    deleted_at TIMESTAMP WITH TIME ZONE,
    deleted_by VARCHAR(50)
);

-- Create permissions table
CREATE TABLE permissions (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description VARCHAR(255),
    resource VARCHAR(100),
    action VARCHAR(50),
    enabled BOOLEAN NOT NULL DEFAULT true,
    system_permission BOOLEAN NOT NULL DEFAULT false,
    
    -- Audit fields
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    created_by VARCHAR(50),
    last_modified_by VARCHAR(50),
    version BIGINT NOT NULL DEFAULT 0,
    
    -- Soft delete fields
    deleted BOOLEAN NOT NULL DEFAULT false,
    deleted_at TIMESTAMP WITH TIME ZONE,
    deleted_by VARCHAR(50)
);

-- Create users table
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    password VARCHAR(128) NOT NULL,
    
    -- Account status fields
    enabled BOOLEAN NOT NULL DEFAULT true,
    account_non_expired BOOLEAN NOT NULL DEFAULT true,
    account_non_locked BOOLEAN NOT NULL DEFAULT true,
    credentials_non_expired BOOLEAN NOT NULL DEFAULT true,
    
    -- Email verification fields
    email_verified BOOLEAN NOT NULL DEFAULT false,
    email_verification_token VARCHAR(255),
    email_verification_expires_at TIMESTAMP WITH TIME ZONE,
    
    -- Password reset fields
    password_reset_token VARCHAR(255),
    password_reset_expires_at TIMESTAMP WITH TIME ZONE,
    
    -- Authentication tracking
    last_login_at TIMESTAMP WITH TIME ZONE,
    login_attempts INTEGER NOT NULL DEFAULT 0,
    locked_until TIMESTAMP WITH TIME ZONE,
    password_changed_at TIMESTAMP WITH TIME ZONE,
    
    -- Two-factor authentication
    two_factor_enabled BOOLEAN NOT NULL DEFAULT false,
    two_factor_secret VARCHAR(32),
    
    -- Audit fields
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    created_by VARCHAR(50),
    last_modified_by VARCHAR(50),
    version BIGINT NOT NULL DEFAULT 0,
    
    -- Soft delete fields
    deleted BOOLEAN NOT NULL DEFAULT false,
    deleted_at TIMESTAMP WITH TIME ZONE,
    deleted_by VARCHAR(50)
);

-- Create user_roles junction table
CREATE TABLE user_roles (
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role_id BIGINT NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    
    -- Audit fields
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    created_by VARCHAR(50),
    
    PRIMARY KEY (user_id, role_id)
);

-- Create role_permissions junction table
CREATE TABLE role_permissions (
    role_id BIGINT NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    permission_id BIGINT NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
    
    -- Audit fields
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    created_by VARCHAR(50),
    
    PRIMARY KEY (role_id, permission_id)
);

-- Create user_sessions table for session management
CREATE TABLE user_sessions (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    session_id VARCHAR(255) NOT NULL UNIQUE,
    ip_address INET,
    user_agent TEXT,
    device_info JSONB,
    
    -- Session status
    active BOOLEAN NOT NULL DEFAULT true,
    last_accessed TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    
    -- Security tracking
    login_method VARCHAR(50), -- PASSWORD, SSO, TWO_FACTOR
    login_location VARCHAR(255),
    suspicious_activity BOOLEAN NOT NULL DEFAULT false,
    
    -- Audit fields
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create audit_logs table for comprehensive audit trail
CREATE TABLE audit_logs (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(id),
    entity_type VARCHAR(100) NOT NULL,
    entity_id VARCHAR(100),
    action VARCHAR(50) NOT NULL, -- CREATE, UPDATE, DELETE, LOGIN, LOGOUT, etc.
    
    -- Change tracking
    old_values JSONB,
    new_values JSONB,
    changed_fields TEXT[],
    
    -- Request context
    ip_address INET,
    user_agent TEXT,
    request_id VARCHAR(100),
    session_id VARCHAR(255),
    
    -- Additional metadata
    metadata JSONB,
    severity VARCHAR(20) DEFAULT 'INFO', -- DEBUG, INFO, WARN, ERROR, CRITICAL
    category VARCHAR(50), -- SECURITY, DATA, SYSTEM, USER
    
    -- Audit fields
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    created_by VARCHAR(50)
);

-- Create indexes for performance optimization

-- Users table indexes
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_enabled ON users(enabled);
CREATE INDEX idx_users_created_at ON users(created_at);
CREATE INDEX idx_users_last_login ON users(last_login_at);
CREATE INDEX idx_users_email_verified ON users(email_verified);
CREATE INDEX idx_users_account_locked ON users(account_non_locked, locked_until);
CREATE INDEX idx_users_deleted ON users(deleted);

-- Roles table indexes
CREATE INDEX idx_roles_name ON roles(name);
CREATE INDEX idx_roles_system ON roles(system_role);
CREATE INDEX idx_roles_enabled ON roles(enabled);
CREATE INDEX idx_roles_priority ON roles(priority);
CREATE INDEX idx_roles_parent ON roles(parent_role_id);
CREATE INDEX idx_roles_deleted ON roles(deleted);

-- Permissions table indexes
CREATE INDEX idx_permissions_name ON permissions(name);
CREATE INDEX idx_permissions_resource ON permissions(resource);
CREATE INDEX idx_permissions_enabled ON permissions(enabled);
CREATE INDEX idx_permissions_system ON permissions(system_permission);
CREATE INDEX idx_permissions_deleted ON permissions(deleted);

-- Junction table indexes
CREATE INDEX idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX idx_user_roles_role_id ON user_roles(role_id);
CREATE INDEX idx_role_permissions_role_id ON role_permissions(role_id);
CREATE INDEX idx_role_permissions_permission_id ON role_permissions(permission_id);

-- User sessions indexes
CREATE INDEX idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX idx_user_sessions_session_id ON user_sessions(session_id);
CREATE INDEX idx_user_sessions_active ON user_sessions(active);
CREATE INDEX idx_user_sessions_expires_at ON user_sessions(expires_at);
CREATE INDEX idx_user_sessions_last_accessed ON user_sessions(last_accessed);
CREATE INDEX idx_user_sessions_ip_address ON user_sessions(ip_address);

-- Audit logs indexes
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);
CREATE INDEX idx_audit_logs_severity ON audit_logs(severity);
CREATE INDEX idx_audit_logs_category ON audit_logs(category);
CREATE INDEX idx_audit_logs_ip_address ON audit_logs(ip_address);
CREATE INDEX idx_audit_logs_session_id ON audit_logs(session_id);

-- Create composite indexes for common query patterns
CREATE INDEX idx_users_auth_lookup ON users(username, enabled, account_non_locked, deleted);
CREATE INDEX idx_users_email_verification ON users(email_verification_token, email_verification_expires_at);
CREATE INDEX idx_users_password_reset ON users(password_reset_token, password_reset_expires_at);
CREATE INDEX idx_audit_logs_user_action ON audit_logs(user_id, action, created_at);
CREATE INDEX idx_user_sessions_cleanup ON user_sessions(active, expires_at);

-- Create triggers for automatic timestamp updates
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply update triggers to tables with updated_at columns
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_roles_updated_at BEFORE UPDATE ON roles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_permissions_updated_at BEFORE UPDATE ON permissions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_sessions_updated_at BEFORE UPDATE ON user_sessions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create function for audit logging trigger
CREATE OR REPLACE FUNCTION audit_trigger_function()
RETURNS TRIGGER AS $$
DECLARE
    old_values JSONB := '{}';
    new_values JSONB := '{}';
    changed_fields TEXT[] := '{}';
    audit_action VARCHAR(50);
BEGIN
    -- Determine action type
    IF TG_OP = 'INSERT' THEN
        audit_action := 'CREATE';
        new_values := to_jsonb(NEW);
    ELSIF TG_OP = 'UPDATE' THEN
        audit_action := 'UPDATE';
        old_values := to_jsonb(OLD);
        new_values := to_jsonb(NEW);
        
        -- Find changed fields
        SELECT array_agg(key) INTO changed_fields
        FROM jsonb_each(old_values) o
        WHERE o.value IS DISTINCT FROM (new_values->>o.key)::jsonb;
        
    ELSIF TG_OP = 'DELETE' THEN
        audit_action := 'DELETE';
        old_values := to_jsonb(OLD);
    END IF;
    
    -- Insert audit record
    INSERT INTO audit_logs (
        entity_type,
        entity_id,
        action,
        old_values,
        new_values,
        changed_fields,
        created_at
    ) VALUES (
        TG_TABLE_NAME,
        COALESCE(NEW.id::TEXT, OLD.id::TEXT),
        audit_action,
        old_values,
        new_values,
        changed_fields,
        NOW()
    );
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Apply audit triggers to important tables
CREATE TRIGGER audit_users_trigger
    AFTER INSERT OR UPDATE OR DELETE ON users
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

CREATE TRIGGER audit_roles_trigger
    AFTER INSERT OR UPDATE OR DELETE ON roles
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

CREATE TRIGGER audit_permissions_trigger
    AFTER INSERT OR UPDATE OR DELETE ON permissions
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

-- Create function for session cleanup
CREATE OR REPLACE FUNCTION cleanup_expired_sessions()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM user_sessions 
    WHERE expires_at < NOW() 
       OR (active = false AND updated_at < NOW() - INTERVAL '7 days');
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Create function for audit log cleanup (keep 1 year by default)
CREATE OR REPLACE FUNCTION cleanup_old_audit_logs(retention_days INTEGER DEFAULT 365)
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM audit_logs 
    WHERE created_at < NOW() - (retention_days || ' days')::INTERVAL
      AND severity NOT IN ('ERROR', 'CRITICAL'); -- Keep error logs longer
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Add comments for documentation
COMMENT ON TABLE users IS 'User accounts with comprehensive security features';
COMMENT ON TABLE roles IS 'Role-based access control definitions with hierarchy support';
COMMENT ON TABLE permissions IS 'Fine-grained permissions for authorization';
COMMENT ON TABLE user_sessions IS 'Active user sessions for session management';
COMMENT ON TABLE audit_logs IS 'Comprehensive audit trail for all system changes';

COMMENT ON COLUMN users.password IS 'BCrypt hashed password - never stored in plain text';
COMMENT ON COLUMN users.email_verification_token IS 'Token for email address verification';
COMMENT ON COLUMN users.password_reset_token IS 'Token for password reset functionality';
COMMENT ON COLUMN users.two_factor_secret IS 'TOTP secret for two-factor authentication';
COMMENT ON COLUMN user_sessions.device_info IS 'JSON metadata about user device and browser';
COMMENT ON COLUMN audit_logs.metadata IS 'Additional context-specific audit information';

-- Create views for common queries
CREATE VIEW active_users AS
SELECT 
    u.id,
    u.username,
    u.email,
    u.first_name,
    u.last_name,
    u.enabled,
    u.last_login_at,
    u.created_at,
    string_agg(r.name, ', ') as roles
FROM users u
LEFT JOIN user_roles ur ON u.id = ur.user_id
LEFT JOIN roles r ON ur.role_id = r.id AND r.enabled = true
WHERE u.enabled = true 
  AND u.deleted = false
  AND u.account_non_locked = true
GROUP BY u.id, u.username, u.email, u.first_name, u.last_name, u.enabled, u.last_login_at, u.created_at;

CREATE VIEW security_events AS
SELECT 
    al.id,
    al.user_id,
    u.username,
    al.action,
    al.entity_type,
    al.ip_address,
    al.severity,
    al.created_at,
    al.metadata
FROM audit_logs al
LEFT JOIN users u ON al.user_id = u.id
WHERE al.category = 'SECURITY'
   OR al.action IN ('LOGIN', 'LOGOUT', 'LOGIN_FAILED', 'ACCOUNT_LOCKED', 'PASSWORD_CHANGED')
ORDER BY al.created_at DESC;

-- Grant appropriate permissions
GRANT SELECT ON active_users TO PUBLIC;
GRANT SELECT ON security_events TO PUBLIC;

-- Final schema validation
DO $$
BEGIN
    ASSERT (SELECT COUNT(*) FROM information_schema.tables WHERE table_name IN ('users', 'roles', 'permissions', 'user_roles', 'role_permissions', 'user_sessions', 'audit_logs')) = 7,
           'Not all required tables were created';
    
    ASSERT (SELECT COUNT(*) FROM information_schema.views WHERE table_name IN ('active_users', 'security_events')) = 2,
           'Not all required views were created';
           
    RAISE NOTICE 'Database schema created successfully with all tables, indexes, triggers, and views';
END $$;