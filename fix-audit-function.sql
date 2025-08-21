-- Fix for create_audit_log function signature mismatch
-- This script fixes the function signature to match what the application expects

-- Drop the existing function with any signature
DROP FUNCTION IF EXISTS create_audit_log(VARCHAR, VARCHAR, VARCHAR, TEXT, VARCHAR, TEXT, VARCHAR, VARCHAR, VARCHAR);
DROP FUNCTION IF EXISTS create_audit_log(VARCHAR, VARCHAR, VARCHAR, VARCHAR, VARCHAR, VARCHAR, VARCHAR, VARCHAR, VARCHAR);
DROP FUNCTION IF EXISTS create_audit_log(p_user_id VARCHAR, p_user_type VARCHAR, p_action VARCHAR, p_details TEXT, p_ip_address VARCHAR, p_user_agent TEXT, p_resource_type VARCHAR, p_resource_id VARCHAR, p_status VARCHAR);

-- Create the correct function with the exact signature expected by the application
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

-- Verify the function was created correctly
SELECT 
  routine_name,
  routine_type,
  data_type,
  parameter_name,
  parameter_mode,
  parameter_default,
  data_type as parameter_type
FROM information_schema.routines r
LEFT JOIN information_schema.parameters p ON r.specific_name = p.specific_name
WHERE routine_name = 'create_audit_log'
ORDER BY p.ordinal_position;

-- Test the function
SELECT create_audit_log(
  p_user_id := 'test_user',
  p_user_type := 'system',
  p_action := 'function_test',
  p_details := 'Testing create_audit_log function after fix',
  p_status := 'success'
) as test_result;
