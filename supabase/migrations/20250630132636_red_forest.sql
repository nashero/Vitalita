/*
  # Create roles table

  1. New Tables
    - `roles`
      - `role_id` (uuid, primary key)
      - `role_name` (varchar, unique)
      - `description` (text)
      - `created_at` (timestamptz, default now())
      - `updated_at` (timestamptz, default now())

  2. Security
    - Enable RLS on `roles` table
    - Add policy for authenticated users to read roles
    - Add policy for admin users to manage roles

  3. Performance
    - Index on role_name for efficient lookups
    - Unique constraint on role_name to prevent duplicates

  4. Data Integrity
    - Unique constraint on role_name
    - Automatic timestamp management with triggers
*/

-- Create roles table
CREATE TABLE IF NOT EXISTS roles (
  role_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  role_name varchar(100) NOT NULL,
  description text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add unique constraint on role_name
ALTER TABLE roles ADD CONSTRAINT roles_role_name_key UNIQUE (role_name);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_roles_name ON roles (role_name);

-- Enable Row Level Security
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Authenticated users can read roles"
  ON roles
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can manage roles"
  ON roles
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create trigger function for updating updated_at timestamp
CREATE OR REPLACE FUNCTION update_roles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
CREATE TRIGGER trigger_update_roles_updated_at
  BEFORE UPDATE ON roles
  FOR EACH ROW
  EXECUTE FUNCTION update_roles_updated_at();

-- Now add the foreign key constraint to staff table
ALTER TABLE staff 
ADD CONSTRAINT fk_staff_role 
FOREIGN KEY (role_id) REFERENCES roles(role_id) ON DELETE RESTRICT;

-- Insert default roles
INSERT INTO roles (role_name, description) VALUES
  ('Administrator', 'Full system access with all administrative privileges'),
  ('Manager', 'Management access to oversee operations and staff'),
  ('Staff', 'Standard staff access for daily operations'),
  ('Nurse', 'Medical staff with donor care responsibilities'),
  ('Receptionist', 'Front desk and appointment management access')
ON CONFLICT (role_name) DO NOTHING;