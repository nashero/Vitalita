/*
  # Create staff table

  1. New Tables
    - `staff`
      - `staff_id` (uuid, primary key)
      - `username` (varchar, unique)
      - `password_hash` (varchar)
      - `salt` (varchar)
      - `role_id` (uuid, foreign key references roles.role_id)
      - `first_name` (varchar)
      - `last_name` (varchar)
      - `email` (varchar, unique)
      - `phone_number` (varchar)
      - `last_login_timestamp` (timestamptz)
      - `is_active` (boolean, default true)
      - `mfa_enabled` (boolean, default false)

  2. Security
    - Enable RLS on `staff` table
    - Add policies for authenticated staff access
    - Comprehensive indexing for performance

  3. Features
    - Automatic timestamp management
    - Secure password storage with salt
    - Multi-factor authentication support
    - Role-based access control ready
*/

CREATE TABLE IF NOT EXISTS staff (
  staff_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username VARCHAR UNIQUE NOT NULL,
  password_hash VARCHAR NOT NULL,
  salt VARCHAR NOT NULL,
  role_id UUID NOT NULL,
  first_name VARCHAR NOT NULL,
  last_name VARCHAR NOT NULL,
  email VARCHAR UNIQUE NOT NULL,
  phone_number VARCHAR,
  last_login_timestamp TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  mfa_enabled BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Note: Foreign key constraint for role_id will be added when roles table is created
-- For now, we'll prepare the structure

-- Enable Row Level Security
ALTER TABLE staff ENABLE ROW LEVEL SECURITY;

-- Create policies for staff access
CREATE POLICY "Staff can read own data"
  ON staff
  FOR SELECT
  TO authenticated
  USING (auth.uid()::text = staff_id::text);

CREATE POLICY "Staff can update own data"
  ON staff
  FOR UPDATE
  TO authenticated
  USING (auth.uid()::text = staff_id::text);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_staff_username ON staff (username);
CREATE INDEX IF NOT EXISTS idx_staff_email ON staff (email);
CREATE INDEX IF NOT EXISTS idx_staff_role_id ON staff (role_id);
CREATE INDEX IF NOT EXISTS idx_staff_active ON staff (is_active);
CREATE INDEX IF NOT EXISTS idx_staff_last_login ON staff (last_login_timestamp);
CREATE INDEX IF NOT EXISTS idx_staff_full_name ON staff (first_name, last_name);

-- Create trigger to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_staff_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_staff_updated_at
  BEFORE UPDATE ON staff
  FOR EACH ROW
  EXECUTE FUNCTION update_staff_updated_at();

-- Now we can add the foreign key constraint to appointments table for staff_id
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'fk_appointments_staff'
  ) THEN
    ALTER TABLE appointments 
    ADD CONSTRAINT fk_appointments_staff 
    FOREIGN KEY (staff_id) REFERENCES staff(staff_id) ON DELETE SET NULL;
  END IF;
END $$;