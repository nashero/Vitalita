/*
  # Add Donor ID Field for Registration System

  This migration adds a unique donor_id field to the donors table and updates
  the registration system to generate and store unique donor identifiers.

  1. Schema Changes
    - Add `donor_id` (VARCHAR, unique) - Unique public identifier for each donor
    - Add `donor_id_prefix` (VARCHAR) - Prefix for donor ID generation
    - Add `donor_id_sequence` (INTEGER) - Sequence number for donor ID generation

  2. Functions
    - Function to generate unique donor IDs
    - Updated registration function to include donor ID generation

  3. Data Integrity
    - Unique constraint on donor_id
    - Index for fast donor ID lookups
    - Audit logging for donor ID generation

  4. Associated Tables
    - Update any foreign key references to include donor_id
    - Ensure donor_id is propagated to related tables
*/

-- Add donor_id field to donors table
ALTER TABLE donors ADD COLUMN IF NOT EXISTS donor_id VARCHAR(20) UNIQUE;
ALTER TABLE donors ADD COLUMN IF NOT EXISTS donor_id_prefix VARCHAR(10) DEFAULT 'DON';
ALTER TABLE donors ADD COLUMN IF NOT EXISTS donor_id_sequence INTEGER;

-- Create index for donor_id lookups
CREATE INDEX IF NOT EXISTS idx_donors_donor_id ON donors (donor_id);

-- Create sequence for donor ID generation
CREATE SEQUENCE IF NOT EXISTS donor_id_sequence START 1000;

-- Function to generate unique donor ID
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

-- Function to get donor ID by hash
CREATE OR REPLACE FUNCTION get_donor_id_by_hash(p_donor_hash_id VARCHAR)
RETURNS VARCHAR AS $$
DECLARE
  v_donor_id VARCHAR;
BEGIN
  SELECT donor_id INTO v_donor_id
  FROM donors
  WHERE donor_hash_id = p_donor_hash_id;
  
  RETURN v_donor_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update the register_donor_with_email function to include donor ID generation
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
  v_verification_token_id UUID;
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

-- Function to update donor ID in associated tables
CREATE OR REPLACE FUNCTION update_donor_id_in_associated_tables(
  p_donor_hash_id VARCHAR,
  p_donor_id VARCHAR
)
RETURNS BOOLEAN AS $$
DECLARE
  v_success BOOLEAN := TRUE;
BEGIN
  -- Update appointments table if it exists and has donor_hash_id
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'appointments') THEN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'appointments' AND column_name = 'donor_hash_id') THEN
      UPDATE appointments 
      SET donor_id = p_donor_id 
      WHERE donor_hash_id = p_donor_hash_id;
    END IF;
  END IF;
  
  -- Update donation_history table if it exists and has donor_hash_id
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'donation_history') THEN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'donation_history' AND column_name = 'donor_hash_id') THEN
      UPDATE donation_history 
      SET donor_id = p_donor_id 
      WHERE donor_hash_id = p_donor_hash_id;
    END IF;
  END IF;
  
  -- Update audit_logs table if it exists and has donor_hash_id
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'audit_logs') THEN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'audit_logs' AND column_name = 'donor_hash_id') THEN
      UPDATE audit_logs 
      SET donor_id = p_donor_id 
      WHERE donor_hash_id = p_donor_hash_id;
    END IF;
  END IF;
  
  RETURN v_success;
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error but don't fail
    PERFORM create_audit_log(
      p_user_id := p_donor_hash_id,
      p_user_type := 'system',
      p_action := 'update_donor_id_error',
      p_details := format('Failed to update donor ID in associated tables: %s', SQLERRM),
      p_resource_type := 'donors',
      p_resource_id := p_donor_hash_id,
      p_status := 'error'
    );
    RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add donor_id column to associated tables if they don't exist
DO $$
BEGIN
  -- Add donor_id to appointments table if it exists
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'appointments') THEN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'appointments' AND column_name = 'donor_id') THEN
      ALTER TABLE appointments ADD COLUMN donor_id VARCHAR(20);
      CREATE INDEX IF NOT EXISTS idx_appointments_donor_id ON appointments (donor_id);
    END IF;
  END IF;
  
  -- Add donor_id to donation_history table if it exists
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'donation_history') THEN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'donation_history' AND column_name = 'donor_id') THEN
      ALTER TABLE donation_history ADD COLUMN donor_id VARCHAR(20);
      CREATE INDEX IF NOT EXISTS idx_donation_history_donor_id ON donation_history (donor_id);
    END IF;
  END IF;
  
  -- Add donor_id to audit_logs table if it exists
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'audit_logs') THEN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'audit_logs' AND column_name = 'donor_id') THEN
      ALTER TABLE audit_logs ADD COLUMN donor_id VARCHAR(20);
      CREATE INDEX IF NOT EXISTS idx_audit_logs_donor_id ON audit_logs (donor_id);
    END IF;
  END IF;
END $$;

-- Create trigger to automatically update donor_id in associated tables
CREATE OR REPLACE FUNCTION trigger_update_donor_id()
RETURNS TRIGGER AS $$
BEGIN
  -- If donor_id is being set for the first time, update associated tables
  IF NEW.donor_id IS NOT NULL AND (OLD.donor_id IS NULL OR OLD.donor_id != NEW.donor_id) THEN
    PERFORM update_donor_id_in_associated_tables(NEW.donor_hash_id, NEW.donor_id);
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger on donors table
DROP TRIGGER IF EXISTS trigger_update_donor_id ON donors;
CREATE TRIGGER trigger_update_donor_id
  AFTER INSERT OR UPDATE ON donors
  FOR EACH ROW
  EXECUTE FUNCTION trigger_update_donor_id();

-- Update existing donors with generated donor IDs if they don't have one
DO $$
DECLARE
  v_donor RECORD;
  v_new_donor_id VARCHAR;
BEGIN
  FOR v_donor IN SELECT donor_hash_id, avis_donor_center FROM donors WHERE donor_id IS NULL LOOP
    v_new_donor_id := generate_donor_id(v_donor.avis_donor_center);
    
    UPDATE donors 
    SET donor_id = v_new_donor_id 
    WHERE donor_hash_id = v_donor.donor_hash_id;
    
    -- Update associated tables
    PERFORM update_donor_id_in_associated_tables(v_donor.donor_hash_id, v_new_donor_id);
  END LOOP;
END $$;

-- Log the migration completion
SELECT create_audit_log(
  p_user_type := 'system',
  p_action := 'donor_id_migration',
  p_details := 'Added donor_id field to donors table with automatic generation and propagation to associated tables',
  p_status := 'success'
); 