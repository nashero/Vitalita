-- Fix Registration Function Mismatch
-- This script ensures the register_donor_with_email function returns the correct type
-- and all required dependencies exist

-- Step 1: Drop the old function if it exists
DROP FUNCTION IF EXISTS register_donor_with_email(VARCHAR, VARCHAR, VARCHAR, VARCHAR);

-- Step 2: Ensure generate_verification_token function exists
CREATE OR REPLACE FUNCTION generate_verification_token()
RETURNS VARCHAR(255) AS $$
BEGIN
  -- Generate a secure random token
  RETURN encode(gen_random_bytes(32), 'hex');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 3: Ensure generate_donor_id function exists
CREATE OR REPLACE FUNCTION generate_donor_id(p_avis_center VARCHAR)
RETURNS VARCHAR AS $$
DECLARE
  v_prefix VARCHAR(10);
  v_sequence INTEGER;
  v_donor_id VARCHAR(20);
  v_attempts INTEGER := 0;
  v_max_attempts INTEGER := 10;
BEGIN
  -- Generate prefix based on AVIS center (first 3 letters)
  v_prefix := UPPER(SUBSTRING(p_avis_center FROM 1 FOR 3));
  
  -- Ensure prefix is valid (only letters)
  IF v_prefix !~ '^[A-Z]{3}$' THEN
    v_prefix := 'DON';
  END IF;
  
  -- Generate unique donor ID
  LOOP
    v_attempts := v_attempts + 1;
    
    -- Get next sequence number
    v_sequence := nextval('donor_id_sequence');
    
    -- Format: PREFIX-YYYY-SEQUENCE (e.g., CAS-2025-1001)
    v_donor_id := v_prefix || '-' || EXTRACT(YEAR FROM CURRENT_DATE) || '-' || v_sequence;
    
    -- Check if this donor ID already exists
    IF NOT EXISTS (SELECT 1 FROM donors WHERE donor_id = v_donor_id) THEN
      RETURN v_donor_id;
    END IF;
    
    -- Prevent infinite loop
    IF v_attempts >= v_max_attempts THEN
      RAISE EXCEPTION 'Unable to generate unique donor ID after % attempts', v_max_attempts;
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 4: Ensure donor_id_sequence exists
CREATE SEQUENCE IF NOT EXISTS donor_id_sequence START 1000;

-- Step 5: Ensure send_verification_email function exists
CREATE OR REPLACE FUNCTION send_verification_email(
  p_email VARCHAR(255),
  p_verification_token VARCHAR(255),
  p_donor_hash_id VARCHAR(255)
)
RETURNS BOOLEAN AS $$
BEGIN
  -- This is a placeholder function
  -- In production, this would integrate with an email service
  -- For now, we'll just log the email details for testing
  
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
    'system',
    'verification_email_sent',
    format('Verification email sent to %s with token: %s', p_email, p_verification_token),
    'donors',
    p_donor_hash_id,
    'success'
  );
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 6: Create the correct register_donor_with_email function
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
  v_verification_token := generate_verification_token();
  v_token_expires := NOW() + INTERVAL '24 hours';
  
  -- Generate unique donor ID
  v_generated_donor_id := generate_donor_id(p_avis_donor_center);
  
  -- Insert donor record with donor ID
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
  
  -- Send verification email (this function logs to audit_logs)
  PERFORM send_verification_email(p_email, v_verification_token, p_donor_hash_id);
  
  -- Log registration with donor ID
  PERFORM create_audit_log(
    p_user_id := p_donor_hash_id,
    p_user_type := 'donor',
    p_action := 'registration_with_email',
    p_details := format('New donor registration with ID %s and email %s submitted for verification', v_generated_donor_id, p_email),
    p_resource_type := 'donors',
    p_resource_id := p_donor_hash_id,
    p_status := 'success'
  );
  
  -- Return success with donor ID
  RETURN QUERY SELECT v_generated_donor_id, TRUE, 'Registration successful'::TEXT;
  
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
    
    -- Return failure
    RETURN QUERY SELECT NULL::VARCHAR, FALSE, format('Registration failed: %s', SQLERRM)::TEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 7: Test the function
DO $$
DECLARE
  test_result RECORD;
  test_donor_id VARCHAR := 'test_hash_' || gen_random_uuid()::VARCHAR;
BEGIN
  -- Test the function
  SELECT * INTO test_result FROM register_donor_with_email(
    test_donor_id,
    'test_salt',
    'test@example.com',
    'AVIS Test Center'
  );
  
  IF test_result.success THEN
    RAISE NOTICE '✅ Registration function test successful: %', test_result.donor_id;
  ELSE
    RAISE NOTICE '❌ Registration function test failed: %', test_result.message;
  END IF;
  
  -- Clean up test data
  DELETE FROM donors WHERE donor_hash_id = test_donor_id;
  DELETE FROM audit_logs WHERE user_id = test_donor_id;
  
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE '⚠️ Registration function test failed: %', SQLERRM;
END $$;

-- Step 8: Verify function signature
SELECT 
  routine_name,
  routine_type,
  data_type,
  routine_definition
FROM information_schema.routines 
WHERE routine_name = 'register_donor_with_email' 
  AND routine_schema = 'public';
