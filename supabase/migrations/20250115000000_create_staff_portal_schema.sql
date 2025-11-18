/*
  # Create Staff Portal Schema for AVIS (Italian Blood Donation Association)

  This migration creates a comprehensive staff portal system integrated with the Vitalita
  blood donation platform, specifically designed for AVIS organizational structure.

  1. Schema Creation
    - Creates 'staff_portal' schema to isolate staff portal tables from donor portal

  2. Core Tables
    - users: Staff members with authentication and personal information
    - roles: AVIS-specific organizational roles (President, Vice President, etc.)
    - user_roles: Many-to-many relationship between users and roles
    - permissions: Granular permissions for resources and actions
    - role_permissions: Many-to-many relationship between roles and permissions
    - avis_centers: Hierarchical AVIS center structure (Municipal, Provincial, Regional, National)
    - audit_logs: Comprehensive audit trail for all user actions

  3. Features
    - UUID primary keys for all tables
    - Hierarchical center structure with parent_center_id
    - Comprehensive indexing for performance
    - Foreign key constraints for data integrity
    - Row Level Security (RLS) policies
    - Automatic timestamp management
    - Audit logging for compliance

  4. AVIS Organizational Levels
    - National (top level)
    - Regional (under National)
    - Provincial (under Regional)
    - Municipal (under Provincial)
*/

-- Create staff_portal schema
CREATE SCHEMA IF NOT EXISTS staff_portal;

-- Set search path to include staff_portal schema
SET search_path TO staff_portal, public;

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

/*
  ============================================================================
  AVIS CENTERS TABLE
  ============================================================================
  Hierarchical structure representing AVIS organizational levels:
  - National (top level, parent_center_id is NULL)
  - Regional (under National)
  - Provincial (under Regional)
  - Municipal (under Provincial, leaf nodes)
*/
CREATE TABLE IF NOT EXISTS staff_portal.avis_centers (
  center_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  center_code varchar(50) UNIQUE NOT NULL,
  name varchar(255) NOT NULL,
  center_type varchar(50) NOT NULL CHECK (center_type IN ('National', 'Regional', 'Provincial', 'Municipal')),
  parent_center_id uuid,
  address text,
  city varchar(100),
  province varchar(100),
  region varchar(100),
  postal_code varchar(20),
  country varchar(100) DEFAULT 'Italy',
  contact_phone varchar(20),
  contact_email varchar(255),
  website_url varchar(500),
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL,
  CONSTRAINT fk_avis_centers_parent 
    FOREIGN KEY (parent_center_id) 
    REFERENCES staff_portal.avis_centers(center_id) 
    ON DELETE RESTRICT
);

COMMENT ON TABLE staff_portal.avis_centers IS 'Hierarchical structure of AVIS centers from National to Municipal level';
COMMENT ON COLUMN staff_portal.avis_centers.center_id IS 'Unique identifier for the AVIS center';
COMMENT ON COLUMN staff_portal.avis_centers.center_code IS 'Unique code for the center (e.g., AVIS-NAZ-001, AVIS-LOM-001)';
COMMENT ON COLUMN staff_portal.avis_centers.center_type IS 'Organizational level: National, Regional, Provincial, or Municipal';
COMMENT ON COLUMN staff_portal.avis_centers.parent_center_id IS 'Reference to parent center for hierarchical structure (NULL for National level)';

-- Indexes for avis_centers
CREATE INDEX IF NOT EXISTS idx_avis_centers_parent ON staff_portal.avis_centers (parent_center_id);
CREATE INDEX IF NOT EXISTS idx_avis_centers_type ON staff_portal.avis_centers (center_type);
CREATE INDEX IF NOT EXISTS idx_avis_centers_code ON staff_portal.avis_centers (center_code);
CREATE INDEX IF NOT EXISTS idx_avis_centers_active ON staff_portal.avis_centers (is_active);
CREATE INDEX IF NOT EXISTS idx_avis_centers_location ON staff_portal.avis_centers (region, province, city);

/*
  ============================================================================
  ROLES TABLE
  ============================================================================
  AVIS-specific organizational roles including executive, medical, administrative,
  and operational positions.
*/
CREATE TABLE IF NOT EXISTS staff_portal.roles (
  role_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  role_name varchar(100) UNIQUE NOT NULL,
  role_code varchar(50) UNIQUE NOT NULL,
  description text,
  role_category varchar(50) CHECK (role_category IN ('Executive', 'Medical', 'Administrative', 'Operational', 'Volunteer')),
  is_system_role boolean DEFAULT false,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

COMMENT ON TABLE staff_portal.roles IS 'AVIS-specific organizational roles for staff members';
COMMENT ON COLUMN staff_portal.roles.role_id IS 'Unique identifier for the role';
COMMENT ON COLUMN staff_portal.roles.role_name IS 'Human-readable role name (e.g., President, Vice President)';
COMMENT ON COLUMN staff_portal.roles.role_code IS 'Unique code for the role (e.g., PRESIDENT, VP, HCD)';
COMMENT ON COLUMN staff_portal.roles.role_category IS 'Category of the role: Executive, Medical, Administrative, Operational, or Volunteer';
COMMENT ON COLUMN staff_portal.roles.is_system_role IS 'Indicates if this is a system-defined role that cannot be deleted';

-- Indexes for roles
CREATE INDEX IF NOT EXISTS idx_roles_name ON staff_portal.roles (role_name);
CREATE INDEX IF NOT EXISTS idx_roles_code ON staff_portal.roles (role_code);
CREATE INDEX IF NOT EXISTS idx_roles_category ON staff_portal.roles (role_category);

/*
  ============================================================================
  PERMISSIONS TABLE
  ============================================================================
  Granular permissions for resources and actions. Permissions follow the pattern:
  resource:action (e.g., donors:view, appointments:create, centers:manage)
*/
CREATE TABLE IF NOT EXISTS staff_portal.permissions (
  permission_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  permission_name varchar(100) UNIQUE NOT NULL,
  resource varchar(100) NOT NULL,
  action varchar(50) NOT NULL,
  description text,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL,
  CONSTRAINT chk_permission_format CHECK (permission_name = resource || ':' || action)
);

COMMENT ON TABLE staff_portal.permissions IS 'Granular permissions for resources and actions in the staff portal';
COMMENT ON COLUMN staff_portal.permissions.permission_id IS 'Unique identifier for the permission';
COMMENT ON COLUMN staff_portal.permissions.permission_name IS 'Permission identifier in format resource:action (e.g., donors:view)';
COMMENT ON COLUMN staff_portal.permissions.resource IS 'Resource being accessed (e.g., donors, appointments, centers)';
COMMENT ON COLUMN staff_portal.permissions.action IS 'Action being performed (e.g., view, create, update, delete, manage)';

-- Indexes for permissions
CREATE INDEX IF NOT EXISTS idx_permissions_name ON staff_portal.permissions (permission_name);
CREATE INDEX IF NOT EXISTS idx_permissions_resource ON staff_portal.permissions (resource);
CREATE INDEX IF NOT EXISTS idx_permissions_action ON staff_portal.permissions (action);
CREATE INDEX IF NOT EXISTS idx_permissions_resource_action ON staff_portal.permissions (resource, action);

/*
  ============================================================================
  USERS TABLE
  ============================================================================
  Staff members with authentication credentials, personal information, and
  association with AVIS centers.
*/
CREATE TABLE IF NOT EXISTS staff_portal.users (
  user_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email varchar(255) UNIQUE NOT NULL,
  password_hash varchar(255) NOT NULL,
  salt varchar(255) NOT NULL,
  first_name varchar(100) NOT NULL,
  last_name varchar(100) NOT NULL,
  phone_number varchar(20),
  avis_center_id uuid NOT NULL,
  organizational_level varchar(50) NOT NULL CHECK (organizational_level IN ('National', 'Regional', 'Provincial', 'Municipal')),
  is_active boolean DEFAULT true,
  is_email_verified boolean DEFAULT false,
  mfa_enabled boolean DEFAULT false,
  mfa_secret varchar(255),
  last_login_at timestamptz,
  password_changed_at timestamptz DEFAULT now(),
  failed_login_attempts integer DEFAULT 0,
  account_locked_until timestamptz,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL,
  CONSTRAINT fk_users_avis_center 
    FOREIGN KEY (avis_center_id) 
    REFERENCES staff_portal.avis_centers(center_id) 
    ON DELETE RESTRICT
);

COMMENT ON TABLE staff_portal.users IS 'Staff members with authentication and personal information';
COMMENT ON COLUMN staff_portal.users.user_id IS 'Unique identifier for the staff user';
COMMENT ON COLUMN staff_portal.users.email IS 'Email address used for authentication (unique)';
COMMENT ON COLUMN staff_portal.users.password_hash IS 'Hashed password using bcrypt or similar';
COMMENT ON COLUMN staff_portal.users.salt IS 'Cryptographic salt for password hashing';
COMMENT ON COLUMN staff_portal.users.avis_center_id IS 'AVIS center the user is associated with';
COMMENT ON COLUMN staff_portal.users.organizational_level IS 'Organizational level the user operates at: National, Regional, Provincial, or Municipal';
COMMENT ON COLUMN staff_portal.users.mfa_enabled IS 'Whether multi-factor authentication is enabled for this user';
COMMENT ON COLUMN staff_portal.users.account_locked_until IS 'Timestamp when account lock expires (NULL if not locked)';

-- Indexes for users
CREATE INDEX IF NOT EXISTS idx_users_email ON staff_portal.users (email);
CREATE INDEX IF NOT EXISTS idx_users_avis_center ON staff_portal.users (avis_center_id);
CREATE INDEX IF NOT EXISTS idx_users_organizational_level ON staff_portal.users (organizational_level);
CREATE INDEX IF NOT EXISTS idx_users_active ON staff_portal.users (is_active);
CREATE INDEX IF NOT EXISTS idx_users_name ON staff_portal.users (last_name, first_name);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON staff_portal.users (created_at);

/*
  ============================================================================
  USER_ROLES TABLE
  ============================================================================
  Many-to-many relationship between users and roles. A user can have multiple
  roles, and a role can be assigned to multiple users.
*/
CREATE TABLE IF NOT EXISTS staff_portal.user_roles (
  user_role_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  role_id uuid NOT NULL,
  assigned_by uuid,
  assigned_at timestamptz DEFAULT now() NOT NULL,
  expires_at timestamptz,
  is_active boolean DEFAULT true,
  CONSTRAINT fk_user_roles_user 
    FOREIGN KEY (user_id) 
    REFERENCES staff_portal.users(user_id) 
    ON DELETE CASCADE,
  CONSTRAINT fk_user_roles_role 
    FOREIGN KEY (role_id) 
    REFERENCES staff_portal.roles(role_id) 
    ON DELETE CASCADE,
  CONSTRAINT fk_user_roles_assigned_by 
    FOREIGN KEY (assigned_by) 
    REFERENCES staff_portal.users(user_id) 
    ON DELETE SET NULL,
  CONSTRAINT uq_user_role UNIQUE (user_id, role_id)
);

COMMENT ON TABLE staff_portal.user_roles IS 'Many-to-many relationship between users and roles';
COMMENT ON COLUMN staff_portal.user_roles.user_role_id IS 'Unique identifier for the user-role assignment';
COMMENT ON COLUMN staff_portal.user_roles.user_id IS 'Reference to the user';
COMMENT ON COLUMN staff_portal.user_roles.role_id IS 'Reference to the role';
COMMENT ON COLUMN staff_portal.user_roles.assigned_by IS 'User who assigned this role (for audit purposes)';
COMMENT ON COLUMN staff_portal.user_roles.expires_at IS 'Optional expiration date for temporary role assignments';
COMMENT ON COLUMN staff_portal.user_roles.is_active IS 'Whether this role assignment is currently active';

-- Indexes for user_roles
CREATE INDEX IF NOT EXISTS idx_user_roles_user ON staff_portal.user_roles (user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role ON staff_portal.user_roles (role_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_active ON staff_portal.user_roles (is_active);
CREATE INDEX IF NOT EXISTS idx_user_roles_expires ON staff_portal.user_roles (expires_at) WHERE expires_at IS NOT NULL;

/*
  ============================================================================
  ROLE_PERMISSIONS TABLE
  ============================================================================
  Many-to-many relationship between roles and permissions. Defines what
  permissions each role has.
*/
CREATE TABLE IF NOT EXISTS staff_portal.role_permissions (
  role_permission_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  role_id uuid NOT NULL,
  permission_id uuid NOT NULL,
  granted_by uuid,
  granted_at timestamptz DEFAULT now() NOT NULL,
  CONSTRAINT fk_role_permissions_role 
    FOREIGN KEY (role_id) 
    REFERENCES staff_portal.roles(role_id) 
    ON DELETE CASCADE,
  CONSTRAINT fk_role_permissions_permission 
    FOREIGN KEY (permission_id) 
    REFERENCES staff_portal.permissions(permission_id) 
    ON DELETE CASCADE,
  CONSTRAINT fk_role_permissions_granted_by 
    FOREIGN KEY (granted_by) 
    REFERENCES staff_portal.users(user_id) 
    ON DELETE SET NULL,
  CONSTRAINT uq_role_permission UNIQUE (role_id, permission_id)
);

COMMENT ON TABLE staff_portal.role_permissions IS 'Many-to-many relationship between roles and permissions';
COMMENT ON COLUMN staff_portal.role_permissions.role_permission_id IS 'Unique identifier for the role-permission assignment';
COMMENT ON COLUMN staff_portal.role_permissions.role_id IS 'Reference to the role';
COMMENT ON COLUMN staff_portal.role_permissions.permission_id IS 'Reference to the permission';
COMMENT ON COLUMN staff_portal.role_permissions.granted_by IS 'User who granted this permission (for audit purposes)';

-- Indexes for role_permissions
CREATE INDEX IF NOT EXISTS idx_role_permissions_role ON staff_portal.role_permissions (role_id);
CREATE INDEX IF NOT EXISTS idx_role_permissions_permission ON staff_portal.role_permissions (permission_id);

/*
  ============================================================================
  AUDIT_LOGS TABLE
  ============================================================================
  Comprehensive audit trail tracking all user actions, system events, and
  data changes for compliance and security monitoring.
*/
CREATE TABLE IF NOT EXISTS staff_portal.audit_logs (
  log_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  timestamp timestamptz DEFAULT now() NOT NULL,
  user_id uuid,
  action varchar(100) NOT NULL,
  resource_type varchar(100),
  resource_id uuid,
  details jsonb,
  ip_address varchar(45),
  user_agent text,
  session_id varchar(255),
  status varchar(20) DEFAULT 'success' CHECK (status IN ('success', 'failure', 'error', 'warning')),
  error_message text,
  CONSTRAINT fk_audit_logs_user 
    FOREIGN KEY (user_id) 
    REFERENCES staff_portal.users(user_id) 
    ON DELETE SET NULL
);

COMMENT ON TABLE staff_portal.audit_logs IS 'Comprehensive audit trail for all user actions and system events';
COMMENT ON COLUMN staff_portal.audit_logs.log_id IS 'Unique identifier for the audit log entry';
COMMENT ON COLUMN staff_portal.audit_logs.timestamp IS 'When the action occurred';
COMMENT ON COLUMN staff_portal.audit_logs.user_id IS 'User who performed the action (NULL for system actions)';
COMMENT ON COLUMN staff_portal.audit_logs.action IS 'Action performed (e.g., login, create_user, update_appointment)';
COMMENT ON COLUMN staff_portal.audit_logs.resource_type IS 'Type of resource affected (e.g., users, appointments, centers)';
COMMENT ON COLUMN staff_portal.audit_logs.resource_id IS 'ID of the resource affected';
COMMENT ON COLUMN staff_portal.audit_logs.details IS 'Additional context in JSON format';
COMMENT ON COLUMN staff_portal.audit_logs.status IS 'Status of the action: success, failure, error, or warning';

-- Indexes for audit_logs
CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON staff_portal.audit_logs (timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON staff_portal.audit_logs (user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON staff_portal.audit_logs (action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_resource ON staff_portal.audit_logs (resource_type, resource_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_status ON staff_portal.audit_logs (status);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_timestamp ON staff_portal.audit_logs (user_id, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_session ON staff_portal.audit_logs (session_id);

/*
  ============================================================================
  TRIGGER FUNCTIONS
  ============================================================================
  Functions for automatic timestamp updates and audit logging
*/

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION staff_portal.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers to all tables with updated_at column
CREATE TRIGGER trigger_avis_centers_updated_at
  BEFORE UPDATE ON staff_portal.avis_centers
  FOR EACH ROW
  EXECUTE FUNCTION staff_portal.update_updated_at();

CREATE TRIGGER trigger_roles_updated_at
  BEFORE UPDATE ON staff_portal.roles
  FOR EACH ROW
  EXECUTE FUNCTION staff_portal.update_updated_at();

CREATE TRIGGER trigger_permissions_updated_at
  BEFORE UPDATE ON staff_portal.permissions
  FOR EACH ROW
  EXECUTE FUNCTION staff_portal.update_updated_at();

CREATE TRIGGER trigger_users_updated_at
  BEFORE UPDATE ON staff_portal.users
  FOR EACH ROW
  EXECUTE FUNCTION staff_portal.update_updated_at();

/*
  ============================================================================
  ROW LEVEL SECURITY (RLS)
  ============================================================================
  Enable RLS on all tables for security
*/
ALTER TABLE staff_portal.avis_centers ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff_portal.roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff_portal.permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff_portal.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff_portal.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff_portal.role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff_portal.audit_logs ENABLE ROW LEVEL SECURITY;

/*
  ============================================================================
  RLS POLICIES
  ============================================================================
  Basic RLS policies - these should be customized based on your security requirements
*/

-- AVIS Centers policies
CREATE POLICY "Authenticated users can view active centers"
  ON staff_portal.avis_centers
  FOR SELECT
  TO authenticated
  USING (is_active = true);

CREATE POLICY "System admins can manage centers"
  ON staff_portal.avis_centers
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM staff_portal.user_roles ur
      JOIN staff_portal.roles r ON ur.role_id = r.role_id
      WHERE ur.user_id = auth.uid()::uuid
      AND r.role_code = 'SYSTEM_ADMIN'
      AND ur.is_active = true
    )
  );

-- Roles policies
CREATE POLICY "Authenticated users can view roles"
  ON staff_portal.roles
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "System admins can manage roles"
  ON staff_portal.roles
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM staff_portal.user_roles ur
      JOIN staff_portal.roles r ON ur.role_id = r.role_id
      WHERE ur.user_id = auth.uid()::uuid
      AND r.role_code = 'SYSTEM_ADMIN'
      AND ur.is_active = true
    )
  );

-- Permissions policies
CREATE POLICY "Authenticated users can view permissions"
  ON staff_portal.permissions
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "System admins can manage permissions"
  ON staff_portal.permissions
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM staff_portal.user_roles ur
      JOIN staff_portal.roles r ON ur.role_id = r.role_id
      WHERE ur.user_id = auth.uid()::uuid
      AND r.role_code = 'SYSTEM_ADMIN'
      AND ur.is_active = true
    )
  );

-- Users policies
CREATE POLICY "Users can view own profile"
  ON staff_portal.users
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid()::uuid);

CREATE POLICY "Users can update own profile"
  ON staff_portal.users
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid()::uuid);

CREATE POLICY "System admins can manage users"
  ON staff_portal.users
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM staff_portal.user_roles ur
      JOIN staff_portal.roles r ON ur.role_id = r.role_id
      WHERE ur.user_id = auth.uid()::uuid
      AND r.role_code = 'SYSTEM_ADMIN'
      AND ur.is_active = true
    )
  );

-- User Roles policies
CREATE POLICY "Users can view own roles"
  ON staff_portal.user_roles
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid()::uuid);

CREATE POLICY "System admins can manage user roles"
  ON staff_portal.user_roles
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM staff_portal.user_roles ur
      JOIN staff_portal.roles r ON ur.role_id = r.role_id
      WHERE ur.user_id = auth.uid()::uuid
      AND r.role_code = 'SYSTEM_ADMIN'
      AND ur.is_active = true
    )
  );

-- Role Permissions policies
CREATE POLICY "Authenticated users can view role permissions"
  ON staff_portal.role_permissions
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "System admins can manage role permissions"
  ON staff_portal.role_permissions
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM staff_portal.user_roles ur
      JOIN staff_portal.roles r ON ur.role_id = r.role_id
      WHERE ur.user_id = auth.uid()::uuid
      AND r.role_code = 'SYSTEM_ADMIN'
      AND ur.is_active = true
    )
  );

-- Audit Logs policies
CREATE POLICY "System can insert audit logs"
  ON staff_portal.audit_logs
  FOR INSERT
  TO authenticated, anon
  WITH CHECK (true);

CREATE POLICY "System admins can view audit logs"
  ON staff_portal.audit_logs
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM staff_portal.user_roles ur
      JOIN staff_portal.roles r ON ur.role_id = r.role_id
      WHERE ur.user_id = auth.uid()::uuid
      AND r.role_code = 'SYSTEM_ADMIN'
      AND ur.is_active = true
    )
  );

-- Prevent modifications to audit logs
CREATE POLICY "No updates to audit logs"
  ON staff_portal.audit_logs
  FOR UPDATE
  TO authenticated
  USING (false);

CREATE POLICY "No deletes from audit logs"
  ON staff_portal.audit_logs
  FOR DELETE
  TO authenticated
  USING (false);

/*
  ============================================================================
  SEED DATA
  ============================================================================
  Insert initial AVIS-specific roles and common permissions
*/

-- Insert AVIS-specific roles
INSERT INTO staff_portal.roles (role_name, role_code, description, role_category, is_system_role) VALUES
  ('President', 'PRESIDENT', 'National or Regional President of AVIS', 'Executive', true),
  ('Vice President', 'VP', 'Vice President of AVIS', 'Executive', true),
  ('Health Care Director', 'HCD', 'Director of Health Care Services', 'Medical', true),
  ('Medical Director', 'MD', 'Medical Director overseeing medical operations', 'Medical', true),
  ('Nurse', 'NURSE', 'Registered nurse providing donor care', 'Medical', true),
  ('Administrative Director', 'ADMIN_DIR', 'Director of administrative operations', 'Administrative', true),
  ('Center Manager', 'CENTER_MGR', 'Manager of a donation center', 'Operational', true),
  ('Receptionist', 'RECEPTIONIST', 'Front desk and appointment management', 'Operational', true),
  ('Data Entry Clerk', 'DATA_CLERK', 'Staff member handling data entry', 'Operational', true),
  ('Volunteer Coordinator', 'VOL_COORD', 'Coordinates volunteer activities', 'Volunteer', true),
  ('System Administrator', 'SYSTEM_ADMIN', 'Full system administration access', 'Administrative', true)
ON CONFLICT (role_code) DO NOTHING;

-- Insert common permissions
INSERT INTO staff_portal.permissions (permission_name, resource, action, description) VALUES
  -- User management
  ('users:view', 'users', 'view', 'View user profiles'),
  ('users:create', 'users', 'create', 'Create new user accounts'),
  ('users:update', 'users', 'update', 'Update user information'),
  ('users:delete', 'users', 'delete', 'Delete user accounts'),
  ('users:manage', 'users', 'manage', 'Full user management access'),
  
  -- Role management
  ('roles:view', 'roles', 'view', 'View role definitions'),
  ('roles:create', 'roles', 'create', 'Create new roles'),
  ('roles:update', 'roles', 'update', 'Update role information'),
  ('roles:delete', 'roles', 'delete', 'Delete roles'),
  ('roles:manage', 'roles', 'manage', 'Full role management access'),
  
  -- Permission management
  ('permissions:view', 'permissions', 'view', 'View permission definitions'),
  ('permissions:manage', 'permissions', 'manage', 'Full permission management access'),
  
  -- Center management
  ('centers:view', 'centers', 'view', 'View AVIS center information'),
  ('centers:create', 'centers', 'create', 'Create new AVIS centers'),
  ('centers:update', 'centers', 'update', 'Update center information'),
  ('centers:delete', 'centers', 'delete', 'Delete centers'),
  ('centers:manage', 'centers', 'manage', 'Full center management access'),
  
  -- Donor management
  ('donors:view', 'donors', 'view', 'View donor profiles'),
  ('donors:create', 'donors', 'create', 'Create new donor records'),
  ('donors:update', 'donors', 'update', 'Update donor information'),
  ('donors:delete', 'donors', 'delete', 'Delete donor records'),
  ('donors:manage', 'donors', 'manage', 'Full donor management access'),
  
  -- Appointment management
  ('appointments:view', 'appointments', 'view', 'View appointment schedules'),
  ('appointments:create', 'appointments', 'create', 'Create new appointments'),
  ('appointments:update', 'appointments', 'update', 'Update appointment details'),
  ('appointments:cancel', 'appointments', 'cancel', 'Cancel appointments'),
  ('appointments:manage', 'appointments', 'manage', 'Full appointment management access'),
  
  -- Reports and analytics
  ('reports:view', 'reports', 'view', 'View reports and analytics'),
  ('reports:generate', 'reports', 'generate', 'Generate custom reports'),
  ('reports:export', 'reports', 'export', 'Export report data'),
  
  -- Audit and compliance
  ('audit:view', 'audit', 'view', 'View audit logs'),
  ('audit:export', 'audit', 'export', 'Export audit log data'),
  
  -- System administration
  ('system:admin', 'system', 'admin', 'Full system administration access'),
  ('system:config', 'system', 'config', 'Configure system settings')
ON CONFLICT (permission_name) DO NOTHING;

-- Assign permissions to System Administrator role
DO $$
DECLARE
  admin_role_id uuid;
BEGIN
  SELECT role_id INTO admin_role_id 
  FROM staff_portal.roles 
  WHERE role_code = 'SYSTEM_ADMIN';
  
  IF admin_role_id IS NOT NULL THEN
    INSERT INTO staff_portal.role_permissions (role_id, permission_id)
    SELECT admin_role_id, permission_id 
    FROM staff_portal.permissions
    ON CONFLICT (role_id, permission_id) DO NOTHING;
  END IF;
END $$;

-- Reset search path
RESET search_path;

