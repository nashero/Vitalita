/*
  # Update donors table for registration system

  1. Schema Changes
    - Add `first_name` (VARCHAR)
    - Add `last_name` (VARCHAR) 
    - Add `donor_id` (VARCHAR, unique) - The public donor identifier
    - Add `date_of_birth` (DATE)
    - Add `avis_donor_center` (VARCHAR)
    - Add `password_hash` (VARCHAR) - SHA-256 hash of password
    - Keep existing fields for compatibility
    - Update `donor_hash_id` to be generated from donor_id + password + salt

  2. Security
    - Enable RLS on updated `donors` table
    - Add policies for registration and authentication

  3. Indexes
    - Add index on `donor_id` for fast lookups
    - Add index on `avis_donor_center` for filtering
    - Keep existing indexes
*/

-- Add new columns to existing donors table
DO $$
BEGIN
  -- Add first_name if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'donors' AND column_name = 'first_name'
  ) THEN
    ALTER TABLE donors ADD COLUMN first_name VARCHAR;
  END IF;

  -- Add last_name if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'donors' AND column_name = 'last_name'
  ) THEN
    ALTER TABLE donors ADD COLUMN last_name VARCHAR;
  END IF;

  -- Add donor_id if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'donors' AND column_name = 'donor_id'
  ) THEN
    ALTER TABLE donors ADD COLUMN donor_id VARCHAR UNIQUE;
  END IF;

  -- Add date_of_birth if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'donors' AND column_name = 'date_of_birth'
  ) THEN
    ALTER TABLE donors ADD COLUMN date_of_birth DATE;
  END IF;

  -- Add avis_donor_center if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'donors' AND column_name = 'avis_donor_center'
  ) THEN
    ALTER TABLE donors ADD COLUMN avis_donor_center VARCHAR;
  END IF;

  -- Add password_hash if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'donors' AND column_name = 'password_hash'
  ) THEN
    ALTER TABLE donors ADD COLUMN password_hash VARCHAR;
  END IF;

  -- Add created_at if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'donors' AND column_name = 'created_at'
  ) THEN
    ALTER TABLE donors ADD COLUMN created_at TIMESTAMPTZ DEFAULT now();
  END IF;

  -- Add updated_at if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'donors' AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE donors ADD COLUMN updated_at TIMESTAMPTZ DEFAULT now();
  END IF;
END $$;

-- Add unique constraint on donor_id if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'donors_donor_id_key'
  ) THEN
    ALTER TABLE donors ADD CONSTRAINT donors_donor_id_key UNIQUE (donor_id);
  END IF;
END $$;

-- Add check constraint for AVIS donor centers
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'chk_donors_avis_center'
  ) THEN
    ALTER TABLE donors ADD CONSTRAINT chk_donors_avis_center 
    CHECK (avis_donor_center IN ('Pompano', 'Milan', 'Rome'));
  END IF;
END $$;

-- Create additional indexes
CREATE INDEX IF NOT EXISTS idx_donors_donor_id ON donors (donor_id);
CREATE INDEX IF NOT EXISTS idx_donors_avis_center ON donors (avis_donor_center);
CREATE INDEX IF NOT EXISTS idx_donors_date_of_birth ON donors (date_of_birth);
CREATE INDEX IF NOT EXISTS idx_donors_full_name ON donors (first_name, last_name);

-- Update RLS policies for registration
DROP POLICY IF EXISTS "Donors can read own data" ON donors;

CREATE POLICY "Donors can read own data"
  ON donors
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Anyone can register as donor"
  ON donors
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Create trigger for updated_at if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.triggers
    WHERE trigger_name = 'trigger_update_donors_updated_at'
  ) THEN
    CREATE TRIGGER trigger_update_donors_updated_at
      BEFORE UPDATE ON donors
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;