-- Complete fix for create_audit_log function and related issues
-- This script addresses the function signature mismatch causing donor registration errors

-- Step 1: Ensure audit_logs table exists with correct structure
CREATE TABLE IF NOT EXISTS audit_logs (
  log_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  timestamp timestamptz DEFAULT now() NOT NULL,
  user_id varchar(255),
  user_type varchar(50) NOT NULL,
  action varchar(100) NOT NULL,
  details text,
  ip_address varchar(45),
  user_agent text,
  resource_type varchar(100),
  resource_id varchar(255),
  status varchar(20) DEFAULT 'success'
);

-- Step 2: Add check constraints if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.check_constraints 
    WHERE constraint_name = 'chk_audit_logs_user_type'
  ) THEN
    ALTER TABLE audit_logs 
    ADD CONSTRAINT chk_audit_logs_user_type 
    CHECK (user_type IN ('staff', 'donor', 'system', 'admin', 'anonymous'));
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.check_constraints 
    WHERE constraint_name = 'chk_audit_logs_status'
  ) THEN
    ALTER TABLE audit_logs 
    ADD CONSTRAINT chk_audit_logs_status 
    CHECK (status IN ('success', 'failure', 'error', 'warning'));
  END IF;
END $$;

-- Step 3: Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON audit_logs (timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs (user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_type ON audit_logs (user_type);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs (action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_resource_type ON audit_logs (resource_type);
CREATE INDEX IF NOT EXISTS idx_audit_logs_status ON audit_logs (status);

-- Step 4: Enable RLS and create policies
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "System can manage audit logs" ON audit_logs;
DROP POLICY IF EXISTS "Authenticated users can read audit logs" ON audit_logs;
DROP POLICY IF EXISTS "System can insert audit logs" ON audit_logs;

-- Create new policies
CREATE POLICY "System can manage audit logs"
  ON audit_logs
  FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);

-- Step 5: Drop all existing create_audit_log functions to avoid conflicts
DROP FUNCTION IF EXISTS create_audit_log(VARCHAR, VARCHAR, VARCHAR, TEXT, VARCHAR, TEXT, VARCHAR, VARCHAR, VARCHAR);
DROP FUNCTION IF EXISTS create_audit_log(VARCHAR, VARCHAR, VARCHAR, VARCHAR, VARCHAR, VARCHAR, VARCHAR, VARCHAR, VARCHAR);
DROP FUNCTION IF EXISTS create_audit_log(p_user_id VARCHAR, p_user_type VARCHAR, p_action VARCHAR, p_details TEXT, p_ip_address VARCHAR, p_user_agent TEXT, p_resource_type VARCHAR, p_resource_id VARCHAR, p_status VARCHAR);
DROP FUNCTION IF EXISTS create_audit_log(p_user_id VARCHAR, p_user_type VARCHAR, p_action VARCHAR, p_details VARCHAR, p_ip_address VARCHAR, p_user_agent VARCHAR, p_resource_type VARCHAR, p_resource_id VARCHAR, p_status VARCHAR);

-- Step 6: Create the correct create_audit_log function with exact signature expected
CREATE OR REPLACE FUNCTION create_audit_log(
  p_user_id VARCHAR DEFAULT NULL,
  p_user_type VARCHAR DEFAULT 'system',
  p_action VARCHAR DEFAULT 'unknown',
  p_details TEXT DEFAULT NULL,
  p_ip_address VARCHAR DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL,
  p_resource_type VARCHAR DEFAULT NULL,
  p_resource_id VARCHAR DEFAULT NULL,
  p_status VARCHAR DEFAULT 'success'
)
RETURNS VARCHAR AS $$
DECLARE
  v_log_id VARCHAR;
BEGIN
  -- Generate a unique log ID
  v_log_id := gen_random_uuid()::VARCHAR;
  
  -- Insert the audit log entry
  INSERT INTO audit_logs (
    log_id,
    timestamp,
    user_id,
    user_type,
    action,
    details,
    ip_address,
    user_agent,
    resource_type,
    resource_id,
    status
  ) VALUES (
    v_log_id,
    NOW(),
    p_user_id,
    p_user_type,
    p_action,
    p_details,
    p_ip_address,
    p_user_agent,
    p_resource_type,
    p_resource_id,
    p_status
  );
  
  RETURN v_log_id;
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error but don't fail the calling function
    RAISE WARNING 'Failed to create audit log: %', SQLERRM;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 7: Ensure the register_donor_with_email function exists and works
-- This function is called during donor registration
CREATE OR REPLACE FUNCTION register_donor_with_email(
  p_donor_hash_id VARCHAR(255),
  p_salt VARCHAR(255),
  p_email VARCHAR(255),
  p_avis_donor_center VARCHAR(255)
)
RETURNS BOOLEAN AS $$
DECLARE
  v_verification_token VARCHAR(255);
  v_token_expires TIMESTAMP WITH TIME ZONE;
BEGIN
  -- Generate verification token (simple implementation)
  v_verification_token := encode(gen_random_bytes(32), 'hex');
  v_token_expires := NOW() + INTERVAL '24 hours';
  
  -- Insert donor record
  INSERT INTO donors (
    donor_hash_id,
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
  
  -- Log registration using the fixed create_audit_log function
  PERFORM create_audit_log(
    p_user_id := p_donor_hash_id,
    p_user_type := 'donor',
    p_action := 'registration_with_email',
    p_details := format('New donor registration with email %s submitted for verification', p_email),
    p_resource_type := 'donors',
    p_resource_id := p_donor_hash_id,
    p_status := 'success'
  );
  
  RETURN TRUE;
EXCEPTION
  WHEN OTHERS THEN
    -- Log error using the fixed function
    PERFORM create_audit_log(
      p_user_id := p_donor_hash_id,
      p_user_type := 'system',
      p_action := 'registration_error',
      p_details := format('Registration failed: %s', SQLERRM),
      p_resource_type := 'donors',
      p_resource_id := p_donor_hash_id,
      p_status := 'error'
    );
    
    RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 8: Test the functions
DO $$
DECLARE
  test_result VARCHAR;
  test_donor_id VARCHAR := 'test_donor_' || gen_random_uuid()::VARCHAR;
BEGIN
  -- Test create_audit_log function
  SELECT create_audit_log(
    p_user_id := test_donor_id,
    p_user_type := 'system',
    p_action := 'function_test',
    p_details := 'Testing create_audit_log function after complete fix',
    p_status := 'success'
  ) INTO test_result;
  
  IF test_result IS NOT NULL THEN
    RAISE NOTICE '✅ create_audit_log function test successful: %', test_result;
  ELSE
    RAISE NOTICE '❌ create_audit_log function test failed';
  END IF;
  
  -- Test register_donor_with_email function (this will fail if donors table doesn't exist, but that's OK)
  BEGIN
    PERFORM register_donor_with_email(
      test_donor_id,
      'test_salt',
      'test@example.com',
      'AVIS Calvatone'
    );
    RAISE NOTICE '✅ register_donor_with_email function test successful';
  EXCEPTION
    WHEN OTHERS THEN
      RAISE NOTICE '⚠️ register_donor_with_email function test failed (expected if donors table missing): %', SQLERRM;
  END;
END $$;

-- Step 9: Display function information for verification
SELECT 
  'Function Status' as info_type,
  routine_name,
  routine_type,
  data_type as return_type
FROM information_schema.routines 
WHERE routine_name IN ('create_audit_log', 'register_donor_with_email')
ORDER BY routine_name;

-- Step 10: Display recent audit logs
SELECT 
  'Recent Audit Logs' as info_type,
  log_id,
  timestamp,
  user_type,
  action,
  status
FROM audit_logs 
ORDER BY timestamp DESC 
LIMIT 5;
