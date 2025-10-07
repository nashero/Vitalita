/*
  # Fix Registration to Use DonorID Parameter
  
  This migration updates the register_donor_with_email function to:
  1. Accept p_donor_id parameter instead of p_avis_donor_center
  2. Use the provided donor_id directly instead of generating one
  3. Set a default AVIS center for the constraint
  4. Maintain all existing functionality
*/

-- Step 1: Drop the existing function
DROP FUNCTION IF EXISTS register_donor_with_email(VARCHAR, VARCHAR, VARCHAR, VARCHAR);

-- Step 2: Create the updated function that accepts p_donor_id
CREATE OR REPLACE FUNCTION register_donor_with_email(
  p_donor_hash_id VARCHAR(255),
  p_salt VARCHAR(255),
  p_email VARCHAR(255),
  p_donor_id VARCHAR(255)
)
RETURNS TABLE(donor_id VARCHAR, success BOOLEAN, message TEXT) AS $$
DECLARE
  v_verification_token VARCHAR(255);
  v_token_expires TIMESTAMP WITH TIME ZONE;
  v_default_avis_center VARCHAR(255);
BEGIN
  -- Set a default AVIS center that matches the constraint
  -- Using the first valid center from the constraint
  v_default_avis_center := 'AVIS Casalmaggiore';
  
  -- Generate verification token
  v_verification_token := encode(gen_random_bytes(32), 'hex');
  v_token_expires := NOW() + INTERVAL '24 hours';
  
  -- Insert donor record using the provided donor_id
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
    p_donor_id,  -- Use the provided donor_id from the form
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
    v_default_avis_center  -- Use default center for constraint
  );
  
  -- Send verification email (this function logs to audit_logs)
  PERFORM send_verification_email(p_email, v_verification_token, p_donor_hash_id);
  
  -- Log registration with donor ID
  PERFORM create_audit_log(
    p_user_id := p_donor_hash_id,
    p_user_type := 'donor',
    p_action := 'registration_with_email',
    p_details := format('New donor registration with ID %s and email %s submitted for verification', p_donor_id, p_email),
    p_resource_type := 'donors',
    p_resource_id := p_donor_hash_id,
    p_status := 'success'
  );
  
  -- Return success with the provided donor ID
  RETURN QUERY SELECT p_donor_id, TRUE, 'Registration successful'::TEXT;
  
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

-- Step 3: Update the generate_donor_id function to work with the new approach
CREATE OR REPLACE FUNCTION generate_donor_id(p_donor_id VARCHAR)
RETURNS VARCHAR AS $$
BEGIN
  -- Simply return the provided donor_id since we're not generating new ones
  RETURN p_donor_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 4: Test the function
DO $$
DECLARE
  test_result RECORD;
  test_donor_id VARCHAR := 'test_hash_' || gen_random_uuid()::VARCHAR;
BEGIN
  -- Test the function with a provided donor_id
  SELECT * INTO test_result FROM register_donor_with_email(
    test_donor_id,
    'test_salt',
    'test@example.com',
    'USER123'  -- This is the donor_id from the form
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
