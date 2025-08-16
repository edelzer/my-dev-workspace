-- Insert default data for Spring Boot Professional Template
-- Creates essential roles, permissions, and admin user for system initialization

-- Insert system permissions
INSERT INTO permissions (name, description, resource, action, system_permission, created_by) VALUES
-- User management permissions
('USER_READ', 'View user information', 'USER', 'READ', true, 'SYSTEM'),
('USER_CREATE', 'Create new users', 'USER', 'CREATE', true, 'SYSTEM'),
('USER_UPDATE', 'Update user information', 'USER', 'UPDATE', true, 'SYSTEM'),
('USER_DELETE', 'Delete users', 'USER', 'DELETE', true, 'SYSTEM'),
('USER_MANAGE', 'Full user management access', 'USER', 'MANAGE', true, 'SYSTEM'),

-- Role management permissions
('ROLE_READ', 'View role information', 'ROLE', 'READ', true, 'SYSTEM'),
('ROLE_CREATE', 'Create new roles', 'ROLE', 'CREATE', true, 'SYSTEM'),
('ROLE_UPDATE', 'Update role information', 'ROLE', 'UPDATE', true, 'SYSTEM'),
('ROLE_DELETE', 'Delete roles', 'ROLE', 'DELETE', true, 'SYSTEM'),
('ROLE_MANAGE', 'Full role management access', 'ROLE', 'MANAGE', true, 'SYSTEM'),

-- Permission management permissions
('PERMISSION_READ', 'View permission information', 'PERMISSION', 'READ', true, 'SYSTEM'),
('PERMISSION_CREATE', 'Create new permissions', 'PERMISSION', 'CREATE', true, 'SYSTEM'),
('PERMISSION_UPDATE', 'Update permission information', 'PERMISSION', 'UPDATE', true, 'SYSTEM'),
('PERMISSION_DELETE', 'Delete permissions', 'PERMISSION', 'DELETE', true, 'SYSTEM'),
('PERMISSION_MANAGE', 'Full permission management access', 'PERMISSION', 'MANAGE', true, 'SYSTEM'),

-- System administration permissions
('SYSTEM_ADMIN', 'Full system administration access', 'SYSTEM', 'ADMIN', true, 'SYSTEM'),
('SYSTEM_CONFIG', 'System configuration access', 'SYSTEM', 'CONFIG', true, 'SYSTEM'),
('SYSTEM_MONITOR', 'System monitoring access', 'SYSTEM', 'MONITOR', true, 'SYSTEM'),
('SYSTEM_BACKUP', 'System backup operations', 'SYSTEM', 'BACKUP', true, 'SYSTEM'),
('SYSTEM_AUDIT', 'Access audit logs and reports', 'SYSTEM', 'AUDIT', true, 'SYSTEM'),

-- Profile management permissions
('PROFILE_READ', 'View own profile', 'PROFILE', 'READ', true, 'SYSTEM'),
('PROFILE_UPDATE', 'Update own profile', 'PROFILE', 'UPDATE', true, 'SYSTEM'),
('PROFILE_DELETE', 'Delete own profile', 'PROFILE', 'DELETE', true, 'SYSTEM'),

-- Session management permissions
('SESSION_READ', 'View session information', 'SESSION', 'READ', true, 'SYSTEM'),
('SESSION_MANAGE', 'Manage user sessions', 'SESSION', 'MANAGE', true, 'SYSTEM'),
('SESSION_TERMINATE', 'Terminate user sessions', 'SESSION', 'TERMINATE', true, 'SYSTEM'),

-- API access permissions
('API_READ', 'Read access to API endpoints', 'API', 'READ', true, 'SYSTEM'),
('API_WRITE', 'Write access to API endpoints', 'API', 'WRITE', true, 'SYSTEM'),
('API_ADMIN', 'Administrative API access', 'API', 'ADMIN', true, 'SYSTEM'),

-- File management permissions
('FILE_READ', 'Read files', 'FILE', 'READ', true, 'SYSTEM'),
('FILE_UPLOAD', 'Upload files', 'FILE', 'UPLOAD', true, 'SYSTEM'),
('FILE_DELETE', 'Delete files', 'FILE', 'DELETE', true, 'SYSTEM'),

-- Reporting permissions
('REPORT_READ', 'View reports', 'REPORT', 'READ', true, 'SYSTEM'),
('REPORT_CREATE', 'Create reports', 'REPORT', 'CREATE', true, 'SYSTEM'),
('REPORT_EXPORT', 'Export reports', 'REPORT', 'EXPORT', true, 'SYSTEM');

-- Insert system roles
INSERT INTO roles (name, description, system_role, priority, color, icon, created_by) VALUES
('ADMIN', 'System Administrator with full access', true, 1000, '#FF5722', 'admin', 'SYSTEM'),
('MODERATOR', 'Content Moderator with limited admin access', true, 500, '#FF9800', 'moderator', 'SYSTEM'),
('USER', 'Regular User with basic access', true, 100, '#2196F3', 'user', 'SYSTEM'),
('GUEST', 'Guest User with read-only access', true, 10, '#9E9E9E', 'guest', 'SYSTEM');

-- Assign permissions to ADMIN role (full access)
INSERT INTO role_permissions (role_id, permission_id, created_by)
SELECT 
    (SELECT id FROM roles WHERE name = 'ADMIN'),
    p.id,
    'SYSTEM'
FROM permissions p;

-- Assign permissions to MODERATOR role (user management + monitoring)
INSERT INTO role_permissions (role_id, permission_id, created_by)
SELECT 
    (SELECT id FROM roles WHERE name = 'MODERATOR'),
    p.id,
    'SYSTEM'
FROM permissions p
WHERE p.name IN (
    'USER_READ', 'USER_UPDATE', 'USER_DELETE',
    'ROLE_READ', 'PERMISSION_READ',
    'SYSTEM_MONITOR', 'SYSTEM_AUDIT',
    'PROFILE_READ', 'PROFILE_UPDATE',
    'SESSION_READ', 'SESSION_MANAGE', 'SESSION_TERMINATE',
    'API_READ', 'API_WRITE',
    'FILE_READ', 'FILE_DELETE',
    'REPORT_READ', 'REPORT_CREATE', 'REPORT_EXPORT'
);

-- Assign permissions to USER role (basic user operations)
INSERT INTO role_permissions (role_id, permission_id, created_by)
SELECT 
    (SELECT id FROM roles WHERE name = 'USER'),
    p.id,
    'SYSTEM'
FROM permissions p
WHERE p.name IN (
    'PROFILE_READ', 'PROFILE_UPDATE',
    'SESSION_READ',
    'API_READ',
    'FILE_READ', 'FILE_UPLOAD',
    'REPORT_READ'
);

-- Assign permissions to GUEST role (read-only access)
INSERT INTO role_permissions (role_id, permission_id, created_by)
SELECT 
    (SELECT id FROM roles WHERE name = 'GUEST'),
    p.id,
    'SYSTEM'
FROM permissions p
WHERE p.name IN (
    'PROFILE_READ',
    'API_READ',
    'FILE_READ'
);

-- Create default admin user
-- Password: Admin123! (BCrypt hashed)
-- Note: In production, this should be changed immediately after first login
INSERT INTO users (
    username,
    email,
    first_name,
    last_name,
    password,
    enabled,
    account_non_expired,
    account_non_locked,
    credentials_non_expired,
    email_verified,
    created_by
) VALUES (
    'admin',
    'admin@company.com',
    'System',
    'Administrator',
    '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/UnuYAOqOTVHgHo7I6', -- Admin123!
    true,
    true,
    true,
    true,
    true,
    'SYSTEM'
);

-- Assign ADMIN role to admin user
INSERT INTO user_roles (user_id, role_id, created_by)
VALUES (
    (SELECT id FROM users WHERE username = 'admin'),
    (SELECT id FROM roles WHERE name = 'ADMIN'),
    'SYSTEM'
);

-- Create default regular user for testing
-- Password: User123! (BCrypt hashed)
INSERT INTO users (
    username,
    email,
    first_name,
    last_name,
    password,
    enabled,
    account_non_expired,
    account_non_locked,
    credentials_non_expired,
    email_verified,
    created_by
) VALUES (
    'user',
    'user@company.com',
    'Regular',
    'User',
    '$2a$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.', -- User123!
    true,
    true,
    true,
    true,
    true,
    'SYSTEM'
);

-- Assign USER role to regular user
INSERT INTO user_roles (user_id, role_id, created_by)
VALUES (
    (SELECT id FROM users WHERE username = 'user'),
    (SELECT id FROM roles WHERE name = 'USER'),
    'SYSTEM'
);

-- Insert initial audit log entry
INSERT INTO audit_logs (
    entity_type,
    entity_id,
    action,
    new_values,
    severity,
    category,
    metadata,
    created_by
) VALUES (
    'SYSTEM',
    'INITIALIZATION',
    'SYSTEM_INIT',
    '{"message": "Database initialized with default data"}',
    'INFO',
    'SYSTEM',
    '{"version": "1.0.0", "environment": "initialization"}',
    'SYSTEM'
);

-- Create additional useful data

-- Insert application-specific permissions (examples)
INSERT INTO permissions (name, description, resource, action, system_permission, created_by) VALUES
-- Dashboard permissions
('DASHBOARD_VIEW', 'View dashboard', 'DASHBOARD', 'VIEW', false, 'SYSTEM'),
('DASHBOARD_ADMIN', 'Administer dashboard', 'DASHBOARD', 'ADMIN', false, 'SYSTEM'),

-- Content management permissions
('CONTENT_READ', 'View content', 'CONTENT', 'READ', false, 'SYSTEM'),
('CONTENT_CREATE', 'Create content', 'CONTENT', 'CREATE', false, 'SYSTEM'),
('CONTENT_UPDATE', 'Update content', 'CONTENT', 'UPDATE', false, 'SYSTEM'),
('CONTENT_DELETE', 'Delete content', 'CONTENT', 'DELETE', false, 'SYSTEM'),
('CONTENT_PUBLISH', 'Publish content', 'CONTENT', 'PUBLISH', false, 'SYSTEM'),

-- Analytics permissions
('ANALYTICS_VIEW', 'View analytics', 'ANALYTICS', 'VIEW', false, 'SYSTEM'),
('ANALYTICS_EXPORT', 'Export analytics data', 'ANALYTICS', 'EXPORT', false, 'SYSTEM');

-- Create department-specific roles (examples)
INSERT INTO roles (name, description, system_role, priority, color, icon, created_by) VALUES
('MANAGER', 'Department Manager', false, 300, '#4CAF50', 'manager', 'SYSTEM'),
('EMPLOYEE', 'Department Employee', false, 200, '#03A9F4', 'employee', 'SYSTEM'),
('CONTRACTOR', 'External Contractor', false, 150, '#FFC107', 'contractor', 'SYSTEM');

-- Assign permissions to new roles
INSERT INTO role_permissions (role_id, permission_id, created_by)
SELECT 
    (SELECT id FROM roles WHERE name = 'MANAGER'),
    p.id,
    'SYSTEM'
FROM permissions p
WHERE p.name IN (
    'USER_READ', 'PROFILE_READ', 'PROFILE_UPDATE',
    'SESSION_READ', 'API_READ', 'API_WRITE',
    'FILE_READ', 'FILE_UPLOAD', 'FILE_DELETE',
    'REPORT_READ', 'REPORT_CREATE', 'REPORT_EXPORT',
    'DASHBOARD_VIEW', 'DASHBOARD_ADMIN',
    'CONTENT_READ', 'CONTENT_CREATE', 'CONTENT_UPDATE', 'CONTENT_PUBLISH',
    'ANALYTICS_VIEW', 'ANALYTICS_EXPORT'
);

INSERT INTO role_permissions (role_id, permission_id, created_by)
SELECT 
    (SELECT id FROM roles WHERE name = 'EMPLOYEE'),
    p.id,
    'SYSTEM'
FROM permissions p
WHERE p.name IN (
    'PROFILE_READ', 'PROFILE_UPDATE',
    'SESSION_READ', 'API_READ',
    'FILE_READ', 'FILE_UPLOAD',
    'REPORT_READ',
    'DASHBOARD_VIEW',
    'CONTENT_READ', 'CONTENT_CREATE',
    'ANALYTICS_VIEW'
);

INSERT INTO role_permissions (role_id, permission_id, created_by)
SELECT 
    (SELECT id FROM roles WHERE name = 'CONTRACTOR'),
    p.id,
    'SYSTEM'
FROM permissions p
WHERE p.name IN (
    'PROFILE_READ', 'PROFILE_UPDATE',
    'API_READ',
    'FILE_READ',
    'CONTENT_READ'
);

-- Update statistics for better query planning
ANALYZE users;
ANALYZE roles;
ANALYZE permissions;
ANALYZE user_roles;
ANALYZE role_permissions;
ANALYZE audit_logs;

-- Create summary view for role permissions
CREATE VIEW role_permission_summary AS
SELECT 
    r.id as role_id,
    r.name as role_name,
    r.description as role_description,
    r.system_role,
    r.priority,
    COUNT(rp.permission_id) as permission_count,
    array_agg(p.name ORDER BY p.name) as permissions
FROM roles r
LEFT JOIN role_permissions rp ON r.id = rp.role_id
LEFT JOIN permissions p ON rp.permission_id = p.id AND p.enabled = true
WHERE r.enabled = true AND r.deleted = false
GROUP BY r.id, r.name, r.description, r.system_role, r.priority
ORDER BY r.priority DESC;

-- Create view for user role summary
CREATE VIEW user_role_summary AS
SELECT 
    u.id as user_id,
    u.username,
    u.email,
    u.enabled,
    u.last_login_at,
    COUNT(ur.role_id) as role_count,
    array_agg(r.name ORDER BY r.priority DESC) as roles,
    array_agg(r.priority ORDER BY r.priority DESC) as role_priorities,
    MAX(r.priority) as highest_role_priority
FROM users u
LEFT JOIN user_roles ur ON u.id = ur.user_id
LEFT JOIN roles r ON ur.role_id = r.id AND r.enabled = true
WHERE u.enabled = true AND u.deleted = false
GROUP BY u.id, u.username, u.email, u.enabled, u.last_login_at
ORDER BY MAX(r.priority) DESC, u.username;

-- Final validation and summary
DO $$
DECLARE
    user_count INTEGER;
    role_count INTEGER;
    permission_count INTEGER;
    admin_exists BOOLEAN;
BEGIN
    SELECT COUNT(*) INTO user_count FROM users WHERE enabled = true;
    SELECT COUNT(*) INTO role_count FROM roles WHERE enabled = true;
    SELECT COUNT(*) INTO permission_count FROM permissions WHERE enabled = true;
    SELECT EXISTS(SELECT 1 FROM users u JOIN user_roles ur ON u.id = ur.user_id JOIN roles r ON ur.role_id = r.id WHERE u.username = 'admin' AND r.name = 'ADMIN') INTO admin_exists;
    
    ASSERT user_count >= 2, 'Insufficient users created';
    ASSERT role_count >= 4, 'Insufficient roles created';
    ASSERT permission_count >= 20, 'Insufficient permissions created';
    ASSERT admin_exists, 'Admin user with ADMIN role not properly created';
    
    RAISE NOTICE 'Default data inserted successfully:';
    RAISE NOTICE '  Users: %', user_count;
    RAISE NOTICE '  Roles: %', role_count;
    RAISE NOTICE '  Permissions: %', permission_count;
    RAISE NOTICE '  Admin user created and configured';
    
    -- Log the initialization
    INSERT INTO audit_logs (
        entity_type,
        action,
        new_values,
        severity,
        category,
        metadata,
        created_by
    ) VALUES (
        'SYSTEM',
        'DATA_INIT',
        json_build_object('users', user_count, 'roles', role_count, 'permissions', permission_count),
        'INFO',
        'SYSTEM',
        json_build_object('version', '1.0.0', 'timestamp', NOW()),
        'SYSTEM'
    );
END $$;