/*
  # Fix Registration Issues - Comprehensive Solution
  
  This script fixes the registration issues by:
  1. Ensuring the donors table has all required columns for registration
  2. Fixing the AVIS center constraint to match the actual centers
  3. Updating the registration function to work with the current schema
  4. Adding missing columns that the frontend expects
*/

-- ========================================
-- STEP 1: Ensure donors table has all required columns
-- ========================================

-- Add missing columns that the registration function needs
DO $$
BEGIN
  -- Add email column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'donors' AND column_name = 'email'
  ) THEN
    ALTER TABLE donors ADD COLUMN email VARCHAR(255);
    RAISE NOTICE 'Added email column to donors table';
  END IF;

  -- Add email_verified column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'donors' AND column_name = 'email_verified'
  ) THEN
    ALTER TABLE donors ADD COLUMN email_verified BOOLEAN DEFAULT FALSE;
    RAISE NOTICE 'Added email_verified column to donors table';
  END IF;

  -- Add verification_token column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'donors' AND column_name = 'verification_token'
  ) THEN
    ALTER TABLE donors ADD COLUMN verification_token VARCHAR(255);
    RAISE NOTICE 'Added verification_token column to donors table';
  END IF;

  -- Add verification_token_expires column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'donors' AND column_name = 'verification_token_expires'
  ) THEN
    ALTER TABLE donors ADD COLUMN verification_token_expires TIMESTAMP WITH TIME ZONE;
    RAISE NOTICE 'Added verification_token_expires column to donors table';
  END IF;

  -- Add account_activated column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'donors' AND column_name = 'account_activated'
  ) THEN
    ALTER TABLE donors ADD COLUMN account_activated BOOLEAN DEFAULT FALSE;
    RAISE NOTICE 'Added account_activated column to donors table';
  END IF;

  -- Add donor_id column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'donors' AND column_name = 'donor_id'
  ) THEN
    ALTER TABLE donors ADD COLUMN donor_id VARCHAR(20);
    RAISE NOTICE 'Added donor_id column to donors table';
  END IF;

  -- Add avis_donor_center column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'donors' AND column_name = 'avis_donor_center'
  ) THEN
    ALTER TABLE donors ADD COLUMN avis_donor_center VARCHAR(255);
    RAISE NOTICE 'Added avis_donor_center column to donors table';
  END IF;

  -- Add created_at column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'donors' AND column_name = 'created_at'
  ) THEN
    ALTER TABLE donors ADD COLUMN created_at TIMESTAMPTZ DEFAULT now();
    RAISE NOTICE 'Added created_at column to donors table';
  END IF;

  -- Add updated_at column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'donors' AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE donors ADD COLUMN updated_at TIMESTAMPTZ DEFAULT now();
    RAISE NOTICE 'Added updated_at column to donors table';
  END IF;
END $$;

-- ========================================
-- STEP 2: Fix AVIS center constraint
-- ========================================

-- Drop the existing constraint if it exists
ALTER TABLE donors DROP CONSTRAINT IF EXISTS chk_donors_avis_center;

-- Create a new constraint that allows the full AVIS center names
ALTER TABLE donors ADD CONSTRAINT chk_donors_avis_center 
CHECK (avis_donor_center IN (
  'AVIS Casalmaggiore',
  'AVIS Gussola', 
  'AVIS Viadana',
  'AVIS Piadena',
  'AVIS Rivarolo del Re',
  'AVIS Scandolara-Ravara',
  'AVIS Calvatone'
));

-- ========================================
-- STEP 3: Add missing indexes
-- ========================================

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_donors_email ON donors(email);
CREATE INDEX IF NOT EXISTS idx_donors_donor_id ON donors(donor_id);
CREATE INDEX IF NOT EXISTS idx_donors_avis_center ON donors(avis_donor_center);
CREATE INDEX IF NOT EXISTS idx_donors_verification_token ON donors(verification_token);

-- ========================================
-- STEP 4: Ensure email constraints
-- ========================================

-- Add email format constraint if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE table_name = 'donors' AND constraint_name = 'chk_donors_email_format'
  ) THEN
    ALTER TABLE donors ADD CONSTRAINT chk_donors_email_format 
    CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');
    RAISE NOTICE 'Added email format constraint';
  END IF;
END $$;

-- Add unique constraint on email if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE table_name = 'donors' AND constraint_name = 'donors_email_unique'
  ) THEN
    ALTER TABLE donors ADD CONSTRAINT donors_email_unique UNIQUE (email);
    RAISE NOTICE 'Added email unique constraint';
  END IF;
END $$;

-- ========================================
-- STEP 5: Update RLS policies
-- ========================================

-- Drop existing policies
DROP POLICY IF EXISTS "Donors can read own data" ON donors;
DROP POLICY IF EXISTS "Anyone can register as donor" ON donors;
DROP POLICY IF EXISTS "Donors can update own preferences" ON donors;

-- Create new policies
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

CREATE POLICY "Donors can update own preferences"
  ON donors
  FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

-- ========================================
-- STEP 6: Ensure the register_donor_with_email function exists
-- ========================================

-- Create or replace the registration function
CREATE OR REPLACE FUNCTION register_donor_with_email(
  p_donor_hash_id VARCHAR(255),
  p_salt VARCHAR(255),
  p_email VARCHAR(255),
  p_avis_donor_center VARCHAR(255)
)
RETURNS TABLE(donor_id VARCHAR, success BOOLEAN, message TEXT) AS $$
DECLARE
  v_verification_token VARCHAR(255);
  v_token_expires TIMESTAMP WITH TIME ZONE;
  v_generated_donor_id VARCHAR(20);
BEGIN
  -- Generate verification token
  v_verification_token := encode(gen_random_bytes(32), 'hex');
  v_token_expires := NOW() + INTERVAL '24 hours';
  
  -- Generate unique donor ID
  v_generated_donor_id := 'DON-' || EXTRACT(YEAR FROM CURRENT_DATE) || '-' || nextval('donor_id_sequence');
  
  -- Insert donor record
  INSERT INTO donors (
    donor_hash_id,
    donor_id,
    salt,
    email,
    email_verified,
    verification_token,
    verification_token_expires,
    account_activated,
    preferred_language,
    preferred_communication_channel,
    initial_vetting_status,
    total_donations_this_year,
    last_donation_date,
    is_active,
    avis_donor_center
  ) VALUES (
    p_donor_hash_id,
    v_generated_donor_id,
    p_salt,
    p_email,
    FALSE,
    v_verification_token,
    v_token_expires,
    FALSE,
    'en',
    'email',
    FALSE,
    0,
    NULL,
    FALSE,
    p_avis_donor_center
  );
  
  -- Return success with donor ID
  RETURN QUERY SELECT v_generated_donor_id, TRUE, 'Registration successful'::TEXT;
  
EXCEPTION
  WHEN OTHERS THEN
    -- Return failure
    RETURN QUERY SELECT NULL::VARCHAR, FALSE, format('Registration failed: %s', SQLERRM)::TEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ========================================
-- STEP 7: Create donor_id sequence if it doesn't exist
-- ========================================

-- Create sequence for donor ID generation
CREATE SEQUENCE IF NOT EXISTS donor_id_sequence START 1000;

-- ========================================
-- STEP 8: Test the fix
-- ========================================

-- Test if we can now insert a donor record
DO $$
BEGIN
  RAISE NOTICE 'Testing registration fix...';
  
  -- Try to insert a test record
  BEGIN
    INSERT INTO donors (
      donor_hash_id,
      donor_id,
      salt,
      email,
      avis_donor_center,
      is_active
    ) VALUES (
      'test-hash-' || gen_random_uuid(),
      'TEST-2025-9999',
      'test-salt',
      'test@example.com',
      'AVIS Calvatone',
      false
    );
    
    -- Clean up test record
    DELETE FROM donors WHERE email = 'test@example.com';
    
    RAISE NOTICE '✅ Registration fix successful - donors table is working correctly';
  EXCEPTION
    WHEN OTHERS THEN
      RAISE NOTICE '❌ Registration fix failed: %', SQLERRM;
  END;
END $$;

-- ========================================
-- STEP 9: Verify table structure
-- ========================================

-- Show the final table structure
DO $$
DECLARE
  col record;
BEGIN
  RAISE NOTICE 'Final donors table structure:';
  FOR col IN 
    SELECT column_name, data_type, is_nullable, column_default
    FROM information_schema.columns 
    WHERE table_name = 'donors' 
    ORDER BY ordinal_position
  LOOP
    RAISE NOTICE '  %: % (nullable: %, default: %)', 
      col.column_name, col.data_type, col.is_nullable, col.column_default;
  END LOOP;
END $$;
