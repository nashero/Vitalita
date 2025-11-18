# Staff Portal Database Schema Documentation

## Overview

The staff portal schema (`staff_portal`) provides a comprehensive database structure for managing AVIS (Italian Blood Donation Association) staff members, roles, permissions, centers, and audit logging. This schema is integrated with the existing Vitalita blood donation platform.

## Schema Structure

### Tables

1. **avis_centers** - Hierarchical structure of AVIS centers
2. **roles** - AVIS-specific organizational roles
3. **permissions** - Granular permissions for resources and actions
4. **users** - Staff members with authentication
5. **user_roles** - Many-to-many relationship between users and roles
6. **role_permissions** - Many-to-many relationship between roles and permissions
7. **audit_logs** - Comprehensive audit trail

## Table Details

### avis_centers

Represents the hierarchical structure of AVIS centers from National to Municipal level.

**Key Columns:**
- `center_id` (uuid, PK) - Unique identifier
- `center_code` (varchar, UNIQUE) - Unique code (e.g., AVIS-NAZ-001)
- `name` (varchar) - Center name
- `center_type` (varchar) - One of: National, Regional, Provincial, Municipal
- `parent_center_id` (uuid, FK) - Reference to parent center (NULL for National)
- `is_active` (boolean) - Whether center is operational

**Hierarchy:**
```
National (parent_center_id = NULL)
  └── Regional (parent_center_id = National center_id)
      └── Provincial (parent_center_id = Regional center_id)
          └── Municipal (parent_center_id = Provincial center_id)
```

### roles

AVIS-specific organizational roles including executive, medical, administrative, and operational positions.

**Key Columns:**
- `role_id` (uuid, PK) - Unique identifier
- `role_name` (varchar, UNIQUE) - Human-readable name (e.g., "President")
- `role_code` (varchar, UNIQUE) - Code identifier (e.g., "PRESIDENT")
- `role_category` (varchar) - One of: Executive, Medical, Administrative, Operational, Volunteer
- `is_system_role` (boolean) - Whether role is system-defined (cannot be deleted)

**Predefined Roles:**
- President (PRESIDENT)
- Vice President (VP)
- Health Care Director (HCD)
- Medical Director (MD)
- Nurse (NURSE)
- Administrative Director (ADMIN_DIR)
- Center Manager (CENTER_MGR)
- Receptionist (RECEPTIONIST)
- Data Entry Clerk (DATA_CLERK)
- Volunteer Coordinator (VOL_COORD)
- System Administrator (SYSTEM_ADMIN)

### permissions

Granular permissions following the pattern `resource:action`.

**Key Columns:**
- `permission_id` (uuid, PK) - Unique identifier
- `permission_name` (varchar, UNIQUE) - Format: `resource:action` (e.g., "donors:view")
- `resource` (varchar) - Resource being accessed (e.g., "donors", "appointments")
- `action` (varchar) - Action being performed (e.g., "view", "create", "manage")

**Common Permissions:**
- `users:view`, `users:create`, `users:update`, `users:delete`, `users:manage`
- `roles:view`, `roles:create`, `roles:update`, `roles:delete`, `roles:manage`
- `permissions:view`, `permissions:manage`
- `centers:view`, `centers:create`, `centers:update`, `centers:delete`, `centers:manage`
- `donors:view`, `donors:create`, `donors:update`, `donors:delete`, `donors:manage`
- `appointments:view`, `appointments:create`, `appointments:update`, `appointments:cancel`, `appointments:manage`
- `reports:view`, `reports:generate`, `reports:export`
- `audit:view`, `audit:export`
- `system:admin`, `system:config`

### users

Staff members with authentication credentials and personal information.

**Key Columns:**
- `user_id` (uuid, PK) - Unique identifier
- `email` (varchar, UNIQUE) - Email for authentication
- `password_hash` (varchar) - Hashed password
- `salt` (varchar) - Cryptographic salt
- `first_name`, `last_name` (varchar) - Personal information
- `avis_center_id` (uuid, FK) - Associated AVIS center
- `organizational_level` (varchar) - One of: National, Regional, Provincial, Municipal
- `is_active` (boolean) - Whether account is active
- `mfa_enabled` (boolean) - Multi-factor authentication status
- `last_login_at` (timestamptz) - Last login timestamp
- `account_locked_until` (timestamptz) - Account lock expiration

### user_roles

Many-to-many relationship between users and roles.

**Key Columns:**
- `user_role_id` (uuid, PK) - Unique identifier
- `user_id` (uuid, FK) - Reference to user
- `role_id` (uuid, FK) - Reference to role
- `assigned_by` (uuid, FK) - User who assigned the role
- `assigned_at` (timestamptz) - Assignment timestamp
- `expires_at` (timestamptz) - Optional expiration for temporary assignments
- `is_active` (boolean) - Whether assignment is active

**Unique Constraint:** `(user_id, role_id)` - Prevents duplicate role assignments

### role_permissions

Many-to-many relationship between roles and permissions.

**Key Columns:**
- `role_permission_id` (uuid, PK) - Unique identifier
- `role_id` (uuid, FK) - Reference to role
- `permission_id` (uuid, FK) - Reference to permission
- `granted_by` (uuid, FK) - User who granted the permission
- `granted_at` (timestamptz) - Grant timestamp

**Unique Constraint:** `(role_id, permission_id)` - Prevents duplicate permission assignments

### audit_logs

Comprehensive audit trail for all user actions and system events.

**Key Columns:**
- `log_id` (uuid, PK) - Unique identifier
- `timestamp` (timestamptz) - When action occurred
- `user_id` (uuid, FK) - User who performed action (NULL for system)
- `action` (varchar) - Action performed (e.g., "login", "create_user")
- `resource_type` (varchar) - Type of resource affected
- `resource_id` (uuid) - ID of resource affected
- `details` (jsonb) - Additional context in JSON format
- `ip_address` (varchar) - Client IP address
- `user_agent` (text) - Browser/client information
- `session_id` (varchar) - Session identifier
- `status` (varchar) - One of: success, failure, error, warning
- `error_message` (text) - Error details if status is failure/error

## Indexes

All tables include comprehensive indexes for optimal query performance:

- **Primary keys** on all tables (UUID)
- **Foreign key indexes** for all relationships
- **Unique indexes** for email, codes, and composite unique constraints
- **Composite indexes** for common query patterns (e.g., user_id + timestamp for audit logs)
- **Filtered indexes** for active records and expiration dates

## Row Level Security (RLS)

All tables have RLS enabled with policies that:

- Allow users to view their own data
- Restrict management operations to system administrators
- Allow system to insert audit logs
- Prevent modifications to audit logs

**Note:** RLS policies use `auth.uid()` which requires Supabase Auth integration. Adjust policies based on your authentication system.

## Triggers

### Automatic Timestamp Updates

All tables with `updated_at` columns have triggers that automatically update the timestamp on row updates using the `staff_portal.update_updated_at()` function.

## Usage Examples

### Create a National AVIS Center

```sql
INSERT INTO staff_portal.avis_centers (
  center_code, name, center_type, country
) VALUES (
  'AVIS-NAZ-001',
  'AVIS Nazionale',
  'National',
  'Italy'
) RETURNING center_id;
```

### Create a Regional Center Under National

```sql
INSERT INTO staff_portal.avis_centers (
  center_code, name, center_type, parent_center_id, region
) VALUES (
  'AVIS-LOM-001',
  'AVIS Lombardia',
  'Regional',
  (SELECT center_id FROM staff_portal.avis_centers WHERE center_code = 'AVIS-NAZ-001'),
  'Lombardia'
) RETURNING center_id;
```

### Create a User with Role Assignment

```sql
-- First create the user
INSERT INTO staff_portal.users (
  email, password_hash, salt, first_name, last_name,
  avis_center_id, organizational_level
) VALUES (
  'president@avis.it',
  '$2b$10$...', -- bcrypt hash
  'random_salt',
  'Mario',
  'Rossi',
  (SELECT center_id FROM staff_portal.avis_centers WHERE center_code = 'AVIS-NAZ-001'),
  'National'
) RETURNING user_id;

-- Then assign a role
INSERT INTO staff_portal.user_roles (
  user_id, role_id, assigned_by
) VALUES (
  (SELECT user_id FROM staff_portal.users WHERE email = 'president@avis.it'),
  (SELECT role_id FROM staff_portal.roles WHERE role_code = 'PRESIDENT'),
  (SELECT user_id FROM staff_portal.users WHERE email = 'president@avis.it')
);
```

### Check User Permissions

```sql
-- Get all permissions for a user (through their roles)
SELECT DISTINCT p.permission_name, p.resource, p.action, p.description
FROM staff_portal.users u
JOIN staff_portal.user_roles ur ON u.user_id = ur.user_id
JOIN staff_portal.role_permissions rp ON ur.role_id = rp.role_id
JOIN staff_portal.permissions p ON rp.permission_id = p.permission_id
WHERE u.email = 'president@avis.it'
  AND ur.is_active = true
  AND (ur.expires_at IS NULL OR ur.expires_at > now());
```

### Query Hierarchical Centers

```sql
-- Get all centers under a parent (recursive)
WITH RECURSIVE center_hierarchy AS (
  -- Base case: start with parent center
  SELECT center_id, center_code, name, center_type, parent_center_id, 0 as level
  FROM staff_portal.avis_centers
  WHERE center_code = 'AVIS-NAZ-001'
  
  UNION ALL
  
  -- Recursive case: get children
  SELECT c.center_id, c.center_code, c.name, c.center_type, c.parent_center_id, ch.level + 1
  FROM staff_portal.avis_centers c
  JOIN center_hierarchy ch ON c.parent_center_id = ch.center_id
)
SELECT * FROM center_hierarchy ORDER BY level, name;
```

### Audit Log Query

```sql
-- Get recent audit logs for a user
SELECT 
  timestamp,
  action,
  resource_type,
  resource_id,
  status,
  details
FROM staff_portal.audit_logs
WHERE user_id = (SELECT user_id FROM staff_portal.users WHERE email = 'president@avis.it')
ORDER BY timestamp DESC
LIMIT 50;
```

## Migration Files

### Forward Migration
- **File:** `supabase/migrations/20250115000000_create_staff_portal_schema.sql`
- **Purpose:** Creates the entire staff_portal schema with all tables, indexes, triggers, and seed data

### Rollback Migration
- **File:** `supabase/migrations/20250115000001_rollback_staff_portal_schema.sql`
- **Purpose:** Drops all tables, functions, and the schema (use with caution!)

## Running Migrations

### Using Supabase CLI

```bash
# Apply forward migration
supabase db push

# Or run specific migration
psql -h your-db-host -U postgres -d postgres -f supabase/migrations/20250115000000_create_staff_portal_schema.sql
```

### Using psql Directly

```bash
# Forward migration
psql -h your-db-host -U postgres -d postgres -f supabase/migrations/20250115000000_create_staff_portal_schema.sql

# Rollback (WARNING: Deletes all data!)
psql -h your-db-host -U postgres -d postgres -f supabase/migrations/20250115000001_rollback_staff_portal_schema.sql
```

## Security Considerations

1. **Password Storage:** Always use bcrypt or similar secure hashing with salts
2. **RLS Policies:** Review and customize RLS policies based on your security requirements
3. **Audit Logging:** Ensure all sensitive operations are logged
4. **Role Assignments:** Use expiration dates for temporary role assignments
5. **Account Locking:** Implement account locking after failed login attempts

## Integration with Existing Vitalita Schema

The staff_portal schema is designed to coexist with the existing Vitalita donor portal schema. Consider:

1. **Cross-schema queries:** Use fully qualified names (e.g., `staff_portal.users`, `public.donors`)
2. **Shared resources:** You may want to create views or functions that join data across schemas
3. **Unified audit:** Consider extending audit_logs to track actions in both schemas

## Next Steps

1. **Customize RLS Policies:** Adjust policies based on your authentication system
2. **Add More Permissions:** Define additional permissions as needed for your use cases
3. **Create Helper Functions:** Add utility functions for common operations
4. **Set Up Seed Data:** Create initial AVIS centers and admin users
5. **Integration:** Connect with your application's authentication and authorization system

## Support

For questions or issues with the staff portal schema, refer to:
- Migration files for implementation details
- This documentation for usage examples
- PostgreSQL documentation for advanced queries

