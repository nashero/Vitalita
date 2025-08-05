/*
  # Fix Audit Logs and Functions Migration

  This migration fixes several issues:
  1. RLS policies on audit_logs table that prevent system functions from working
  2. Missing or incorrect create_audit_log function signature
  3. Ensures the register_donor_with_email function can properly log audit events
*/

-- Drop existing RLS policies on audit_logs table
DROP POLICY IF EXISTS "Public can read audit logs" ON audit_logs;
DROP POLICY IF EXISTS "Authenticated users can create audit logs" ON audit_logs;
DROP POLICY IF EXISTS "Authenticated users can update audit logs" ON audit_logs;

-- Create new RLS policies for audit_logs that allow system functions to work
CREATE POLICY "System can manage audit logs"
  ON audit_logs
  FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);

-- Drop the existing create_audit_log function if it exists
DROP FUNCTION IF EXISTS create_audit_log(p_user_id varchar, p_user_type varchar, p_action varchar, p_details varchar, p_ip_address varchar, p_user_agent varchar, p_resource_type varchar, p_resource_id varchar, p_status varchar);

-- Create the correct create_audit_log function
CREATE OR REPLACE FUNCTION create_audit_log(
  p_user_id VARCHAR DEFAULT NULL,
  p_user_type VARCHAR DEFAULT 'system',
  p_action VARCHAR DEFAULT 'unknown',
  p_details TEXT DEFAULT NULL,
  p_ip_address VARCHAR DEFAULT NULL,
  p_user_agent VARCHAR DEFAULT NULL,
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

-- Update the register_donor_with_email function to handle audit log failures gracefully
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
  -- Generate verification token
  v_verification_token := generate_verification_token();
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
  
  -- Send verification email (this function logs to audit_logs)
  PERFORM send_verification_email(p_email, v_verification_token, p_donor_hash_id);
  
  -- Log registration (use the new create_audit_log function)
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
    -- Log error using the new function
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

-- Log the migration completion
SELECT create_audit_log(
  p_user_type := 'system',
  p_action := 'audit_logs_fix_migration',
  p_details := 'Fixed audit_logs RLS policies and create_audit_log function for donor registration',
  p_status := 'success'
); 