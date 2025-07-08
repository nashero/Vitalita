/*
  # Create permissions table

  1. New Tables
    - `permissions`
      - `permission_id` (uuid, primary key)
      - `permission_name` (varchar, unique)
      - `description` (text)
      - `created_at` (timestamptz, default now())
      - `updated_at` (timestamptz, default now())

  2. Security
    - Enable RLS on `permissions` table
    - Add policy for authenticated users to read permissions
    - Add policy for authenticated users to manage permissions

  3. Performance
    - Index on permission_name for efficient lookups
    - Unique constraint on permission_name to prevent duplicates

  4. Data Integrity
    - Automatic timestamp management with triggers
    - Default permissions for common system operations
*/

-- Create permissions table
CREATE TABLE IF NOT EXISTS permissions (
  permission_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  permission_name varchar(100) NOT NULL,
  description text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add unique constraint on permission_name
ALTER TABLE permissions ADD CONSTRAINT permissions_permission_name_key UNIQUE (permission_name);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_permissions_name ON permissions (permission_name);

-- Enable Row Level Security
ALTER TABLE permissions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Authenticated users can read permissions"
  ON permissions
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can manage permissions"
  ON permissions
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create trigger function for updating updated_at timestamp
CREATE OR REPLACE FUNCTION update_permissions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
CREATE TRIGGER trigger_update_permissions_updated_at
  BEFORE UPDATE ON permissions
  FOR EACH ROW
  EXECUTE FUNCTION update_permissions_updated_at();

-- Insert default permissions for common system operations
INSERT INTO permissions (permission_name, description) VALUES
  ('view_dashboard', 'Access to main dashboard and overview'),
  ('manage_appointments', 'Create, update, and cancel appointments'),
  ('view_appointments', 'View appointment schedules and details'),
  ('manage_donors', 'Add, edit, and manage donor information'),
  ('view_donors', 'View donor profiles and history'),
  ('manage_staff', 'Add, edit, and manage staff accounts'),
  ('view_staff', 'View staff profiles and information'),
  ('manage_centers', 'Add, edit, and manage donation centers'),
  ('view_centers', 'View donation center information'),
  ('manage_slots', 'Create and manage availability slots'),
  ('view_slots', 'View availability schedules'),
  ('manage_roles', 'Create and assign user roles'),
  ('view_roles', 'View role definitions and assignments'),
  ('manage_permissions', 'Assign and modify permissions'),
  ('view_permissions', 'View permission definitions'),
  ('generate_reports', 'Access to reporting and analytics'),
  ('system_admin', 'Full system administration access'),
  ('backup_restore', 'Database backup and restore operations'),
  ('audit_logs', 'View system audit logs and activity'),
  ('notification_settings', 'Manage system notifications and alerts')
ON CONFLICT (permission_name) DO NOTHING;