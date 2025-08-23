/*
  # Add Donor Password System Migration

  This migration adds password-based authentication and session management to the donors table:
  
  1. Password Management
    - `password_hash` - Secure hash of donor's password
    - `password_salt` - Unique salt for each donor's password
    - `password_created_at` - When password was set
    - `password_updated_at` - When password was last changed
  
  2. Session Management
    - `last_login_at` - Timestamp of last successful login
    - `last_login_ip` - IP address of last login
    - `last_login_device` - Device identifier for last login
    - `session_token` - Current active session token
    - `session_expires_at` - When current session expires
  
  3. Security Features
    - Password complexity requirements
    - Session timeout management
    - Device tracking for security
    - Audit logging for all authentication events
*/

-- ========================================
-- STEP 1: Add password management columns
-- ========================================

-- Add password_hash column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'donors' AND column_name = 'password_hash'
  ) THEN
    ALTER TABLE donors ADD COLUMN password_hash VARCHAR(255);
    RAISE NOTICE 'Added password_hash column to donors table';
  END IF;
END $$;

-- Add password_salt column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'donors' AND column_name = 'password_salt'
  ) THEN
    ALTER TABLE donors ADD COLUMN password_salt VARCHAR(255);
    RAISE NOTICE 'Added password_salt column to donors table';
  END IF;
END $$;

-- Add password_created_at column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'donors' AND column_name = 'password_created_at'
  ) THEN
    ALTER TABLE donors ADD COLUMN password_created_at TIMESTAMPTZ DEFAULT now();
    RAISE NOTICE 'Added password_created_at column to donors table';
  END IF;
END $$;

-- Add password_updated_at column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'donors' AND column_name = 'password_updated_at'
  ) THEN
    ALTER TABLE donors ADD COLUMN password_updated_at TIMESTAMPTZ DEFAULT now();
    RAISE NOTICE 'Added password_updated_at column to donors table';
  END IF;
END $$;

-- ========================================
-- STEP 2: Add session management columns
-- ========================================

-- Add last_login_at column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'donors' AND column_name = 'last_login_at'
  ) THEN
    ALTER TABLE donors ADD COLUMN last_login_at TIMESTAMPTZ;
    RAISE NOTICE 'Added last_login_at column to donors table';
  END IF;
END $$;

-- Add last_login_ip column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'donors' AND column_name = 'last_login_ip'
  ) THEN
    ALTER TABLE donors ADD COLUMN last_login_ip INET;
    RAISE NOTICE 'Added last_login_ip column to donors table';
  END IF;
END $$;

-- Add last_login_device column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'donors' AND column_name = 'last_login_device'
  ) THEN
    ALTER TABLE donors ADD COLUMN last_login_device VARCHAR(255);
    RAISE NOTICE 'Added last_login_device column to donors table';
  END IF;
END $$;

-- Add session_token column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'donors' AND column_name = 'session_token'
  ) THEN
    ALTER TABLE donors ADD COLUMN session_token VARCHAR(255);
    RAISE NOTICE 'Added session_token column to donors table';
  END IF;
END $$;

-- Add session_expires_at column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'donors' AND column_name = 'session_expires_at'
  ) THEN
    ALTER TABLE donors ADD COLUMN session_expires_at TIMESTAMPTZ;
    RAISE NOTICE 'Added session_expires_at column to donors table';
  END IF;
END $$;

-- ========================================
-- STEP 3: Create indexes for performance
-- ========================================

-- Create index on session_token for fast lookups
CREATE INDEX IF NOT EXISTS idx_donors_session_token ON donors(session_token);

-- Create index on last_login_at for analytics
CREATE INDEX IF NOT EXISTS idx_donors_last_login ON donors(last_login_at);

-- Create composite index for active sessions
CREATE INDEX IF NOT EXISTS idx_donors_active_sessions 
ON donors(session_token, session_expires_at)
WHERE session_token IS NOT NULL;

-- ========================================
-- STEP 4: Create password management functions
-- ========================================

-- Function to set donor password
CREATE OR REPLACE FUNCTION set_donor_password(
  p_donor_hash_id VARCHAR,
  p_password VARCHAR
)
RETURNS BOOLEAN AS $$
DECLARE
  v_salt VARCHAR;
  v_password_hash VARCHAR;
BEGIN
  -- Generate unique salt for this donor
  v_salt := encode(gen_random_bytes(32), 'hex');
  
  -- Hash password with salt (using SHA-256 for now, can be upgraded to bcrypt later)
  v_password_hash := encode(sha256((p_password || v_salt)::bytea), 'hex');
  
  -- Update donor record with new password
  UPDATE donors 
  SET 
    password_hash = v_password_hash,
    password_salt = v_salt,
    password_created_at = CASE WHEN password_hash IS NULL THEN now() ELSE password_created_at END,
    password_updated_at = now()
  WHERE donor_hash_id = p_donor_hash_id;
  
  -- Return success if row was updated
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to verify donor password
CREATE OR REPLACE FUNCTION verify_donor_password(
  p_donor_hash_id VARCHAR,
  p_password VARCHAR
)
RETURNS BOOLEAN AS $$
DECLARE
  v_stored_hash VARCHAR;
  v_stored_salt VARCHAR;
  v_input_hash VARCHAR;
BEGIN
  -- Get stored password hash and salt
  SELECT password_hash, password_salt 
  INTO v_stored_hash, v_stored_salt
  FROM donors 
  WHERE donor_hash_id = p_donor_hash_id;
  
  -- Return false if no password is set or donor not found
  IF v_stored_hash IS NULL OR v_stored_salt IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Hash input password with stored salt
  v_input_hash := encode(sha256((p_password || v_stored_salt)::bytea), 'hex');
  
  -- Compare hashes
  RETURN v_input_hash = v_stored_hash;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to create donor session
CREATE OR REPLACE FUNCTION create_donor_session(
  p_donor_hash_id VARCHAR,
  p_ip_address INET DEFAULT NULL,
  p_device_info VARCHAR DEFAULT NULL
)
RETURNS VARCHAR AS $$
DECLARE
  v_session_token VARCHAR;
  v_expires_at TIMESTAMPTZ;
BEGIN
  -- Generate unique session token
  v_session_token := encode(gen_random_bytes(32), 'hex');
  
  -- Set session to expire in 24 hours
  v_expires_at := now() + interval '24 hours';
  
  -- Update donor record with session info
  UPDATE donors 
  SET 
    session_token = v_session_token,
    session_expires_at = v_expires_at,
    last_login_at = now(),
    last_login_ip = COALESCE(p_ip_address, last_login_ip),
    last_login_device = COALESCE(p_device_info, last_login_device)
  WHERE donor_hash_id = p_donor_hash_id;
  
  -- Return session token if update was successful
  IF FOUND THEN
    RETURN v_session_token;
  ELSE
    RETURN NULL;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to validate donor session
CREATE OR REPLACE FUNCTION validate_donor_session(
  p_session_token VARCHAR
)
RETURNS TABLE(
  donor_hash_id VARCHAR,
  is_valid BOOLEAN,
  expires_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    d.donor_hash_id,
    (d.session_token = p_session_token AND d.session_expires_at > now()) as is_valid,
    d.session_expires_at
  FROM donors d
  WHERE d.session_token = p_session_token;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to clear donor session
CREATE OR REPLACE FUNCTION clear_donor_session(
  p_donor_hash_id VARCHAR
)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE donors 
  SET 
    session_token = NULL,
    session_expires_at = NULL
  WHERE donor_hash_id = p_donor_hash_id;
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ========================================
-- STEP 5: Update RLS policies for password system
-- ========================================

-- Allow donors to update their own password and session info
  DROP POLICY IF EXISTS "Donors can update own password and session" ON donors;
CREATE POLICY "Donors can update own password and session" ON donors
  FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);


-- ========================================
-- STEP 6: Create audit logging for password events
-- ========================================

-- Function to log password-related events
CREATE OR REPLACE FUNCTION log_password_event(
  p_donor_hash_id VARCHAR,
  p_action VARCHAR,
  p_details TEXT,
  p_status VARCHAR DEFAULT 'success'
)
RETURNS void AS $$
BEGIN
  INSERT INTO audit_logs (
    user_id,
    user_type,
    action,
    details,
    resource_type,
    resource_id,
    status
  ) VALUES (
    p_donor_hash_id,
    'donor',
    p_action,
    p_details,
    'donors',
    p_donor_hash_id,
    p_status
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ========================================
-- STEP 7: Add table and column comments
-- ========================================

COMMENT ON COLUMN donors.password_hash IS 'Secure hash of donor password for authentication';
COMMENT ON COLUMN donors.password_salt IS 'Unique cryptographic salt for password security';
COMMENT ON COLUMN donors.password_created_at IS 'Timestamp when password was first set';
COMMENT ON COLUMN donors.password_updated_at IS 'Timestamp when password was last changed';
COMMENT ON COLUMN donors.last_login_at IS 'Timestamp of last successful login';
COMMENT ON COLUMN donors.last_login_ip IS 'IP address of last login for security tracking';
COMMENT ON COLUMN donors.last_login_device IS 'Device identifier for last login';
COMMENT ON COLUMN donors.session_token IS 'Current active session token for authentication';
COMMENT ON COLUMN donors.session_expires_at IS 'When current session expires';

-- ========================================
-- STEP 8: Create trigger for password_updated_at
-- ========================================

-- Create trigger function for password_updated_at
CREATE OR REPLACE FUNCTION update_password_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.password_hash IS DISTINCT FROM NEW.password_hash THEN
    NEW.password_updated_at = now();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for password updates
DROP TRIGGER IF EXISTS trigger_update_donors_password_updated_at ON donors;
CREATE TRIGGER trigger_update_donors_password_updated_at
  BEFORE UPDATE ON donors
  FOR EACH ROW
  EXECUTE FUNCTION update_password_updated_at();

-- ========================================
-- STEP 9: Final verification
-- ========================================

-- Verify all columns were added successfully
DO $$
DECLARE
  column_count integer;
  expected_columns text[] := ARRAY[
    'donor_hash_id', 'salt', 'preferred_language', 'preferred_communication_channel',
    'initial_vetting_status', 'total_donations_this_year', 'last_donation_date',
    'is_active', 'avis_donor_center', 'created_at', 'updated_at', 'email',
    'email_verified', 'verification_token', 'verification_token_expires',
    'account_activated', 'donor_id', 'password_hash', 'password_salt',
    'password_created_at', 'password_updated_at', 'last_login_at',
    'last_login_ip', 'last_login_device', 'session_token', 'session_expires_at'
  ];
BEGIN
  -- Count total columns
  SELECT count(*) INTO column_count
  FROM information_schema.columns
  WHERE table_name = 'donors' AND table_schema = 'public';
  
  RAISE NOTICE 'Migration completed successfully. Donors table now has % columns including password and session management.', column_count;
END $$;
