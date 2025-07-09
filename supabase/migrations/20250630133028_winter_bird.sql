/*
  # Create role_permissions junction table

  1. New Tables
    - `role_permissions`
      - `role_id` (uuid, foreign key to roles)
      - `permission_id` (uuid, foreign key to permissions)
      - `created_at` (timestamptz, default now())

  2. Security
    - Enable RLS on `role_permissions` table
    - Add policy for authenticated users to read role permissions
    - Add policy for authenticated users to manage role permissions

  3. Performance
    - Primary key on (role_id, permission_id) for uniqueness
    - Index on role_id for efficient role-based queries
    - Index on permission_id for efficient permission-based queries

  4. Data Integrity
    - Foreign key constraints to roles and permissions tables
    - Composite primary key prevents duplicate assignments
    - Cascade delete when roles or permissions are removed

  5. Default Assignments
    - Administrator role gets all permissions
    - Manager role gets management permissions
    - Staff role gets basic operational permissions
    - Nurse role gets donor care permissions
    - Receptionist role gets appointment management permissions
*/

-- Create role_permissions junction table
CREATE TABLE IF NOT EXISTS role_permissions (
  role_id uuid NOT NULL,
  permission_id uuid NOT NULL,
  created_at timestamptz DEFAULT now(),
  PRIMARY KEY (role_id, permission_id)
);

-- Add foreign key constraints
ALTER TABLE role_permissions 
ADD CONSTRAINT fk_role_permissions_role 
FOREIGN KEY (role_id) REFERENCES roles(role_id) ON DELETE CASCADE;

ALTER TABLE role_permissions 
ADD CONSTRAINT fk_role_permissions_permission 
FOREIGN KEY (permission_id) REFERENCES permissions(permission_id) ON DELETE CASCADE;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_role_permissions_role ON role_permissions (role_id);
CREATE INDEX IF NOT EXISTS idx_role_permissions_permission ON role_permissions (permission_id);

-- Enable Row Level Security
ALTER TABLE role_permissions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Authenticated users can read role permissions"
  ON role_permissions
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can manage role permissions"
  ON role_permissions
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Insert default role-permission assignments
DO $$
DECLARE
  admin_role_id uuid;
  manager_role_id uuid;
  staff_role_id uuid;
  nurse_role_id uuid;
  receptionist_role_id uuid;
BEGIN
  -- Get role IDs
  SELECT role_id INTO admin_role_id FROM roles WHERE role_name = 'Administrator';
  SELECT role_id INTO manager_role_id FROM roles WHERE role_name = 'Manager';
  SELECT role_id INTO staff_role_id FROM roles WHERE role_name = 'Staff';
  SELECT role_id INTO nurse_role_id FROM roles WHERE role_name = 'Nurse';
  SELECT role_id INTO receptionist_role_id FROM roles WHERE role_name = 'Receptionist';

  -- Administrator gets all permissions
  IF admin_role_id IS NOT NULL THEN
    INSERT INTO role_permissions (role_id, permission_id)
    SELECT admin_role_id, permission_id FROM permissions
    ON CONFLICT (role_id, permission_id) DO NOTHING;
  END IF;

  -- Manager gets management and operational permissions
  IF manager_role_id IS NOT NULL THEN
    INSERT INTO role_permissions (role_id, permission_id)
    SELECT manager_role_id, permission_id FROM permissions 
    WHERE permission_name IN (
      'view_dashboard', 'manage_appointments', 'view_appointments',
      'manage_donors', 'view_donors', 'view_staff', 'manage_centers',
      'view_centers', 'manage_slots', 'view_slots', 'view_roles',
      'generate_reports', 'audit_logs', 'notification_settings'
    )
    ON CONFLICT (role_id, permission_id) DO NOTHING;
  END IF;

  -- Staff gets basic operational permissions
  IF staff_role_id IS NOT NULL THEN
    INSERT INTO role_permissions (role_id, permission_id)
    SELECT staff_role_id, permission_id FROM permissions 
    WHERE permission_name IN (
      'view_dashboard', 'manage_appointments', 'view_appointments',
      'view_donors', 'view_centers', 'view_slots'
    )
    ON CONFLICT (role_id, permission_id) DO NOTHING;
  END IF;

  -- Nurse gets donor care and appointment permissions
  IF nurse_role_id IS NOT NULL THEN
    INSERT INTO role_permissions (role_id, permission_id)
    SELECT nurse_role_id, permission_id FROM permissions 
    WHERE permission_name IN (
      'view_dashboard', 'manage_appointments', 'view_appointments',
      'manage_donors', 'view_donors', 'view_centers', 'view_slots'
    )
    ON CONFLICT (role_id, permission_id) DO NOTHING;
  END IF;

  -- Receptionist gets appointment and basic management permissions
  IF receptionist_role_id IS NOT NULL THEN
    INSERT INTO role_permissions (role_id, permission_id)
    SELECT receptionist_role_id, permission_id FROM permissions 
    WHERE permission_name IN (
      'view_dashboard', 'manage_appointments', 'view_appointments',
      'view_donors', 'view_centers', 'view_slots', 'notification_settings'
    )
    ON CONFLICT (role_id, permission_id) DO NOTHING;
  END IF;
END $$;