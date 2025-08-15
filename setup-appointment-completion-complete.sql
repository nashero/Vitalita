-- Setup Appointment Completion Trigger System
-- This script creates a comprehensive trigger system that:
-- 1. Automatically migrates completed appointments to donation_history
-- 2. Deletes completed appointments from the appointments table
-- 3. Wraps all operations in transactions for data safety
-- 4. Handles proper field mapping and data validation

-- First, let's ensure we have the correct table structure
-- Check if donation_history table exists and has the right structure
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'donation_history') THEN
    RAISE EXCEPTION 'donation_history table does not exist. Please run the donation history migration first.';
  END IF;
END $$;

-- Drop existing trigger and function if they exist
DROP TRIGGER IF EXISTS appointment_completion_trigger ON appointments;
DROP FUNCTION IF EXISTS handle_appointment_completion();

-- Create the comprehensive appointment completion handler function
CREATE OR REPLACE FUNCTION handle_appointment_completion()
RETURNS TRIGGER AS $$
DECLARE
  donation_volume INTEGER;
  normalized_donation_type VARCHAR;
  new_history_id UUID;
BEGIN
  -- Only proceed if status is changed to 'COMPLETED'
  IF NEW.status = 'COMPLETED' AND OLD.status != 'COMPLETED' THEN
    
    -- Start transaction for data safety
    BEGIN
      -- Normalize donation type for consistency
      normalized_donation_type := LOWER(NEW.donation_type);
      
      -- Set donation volume based on donation type
      donation_volume := CASE normalized_donation_type
        WHEN 'whole_blood' OR 'blood' THEN 450
        WHEN 'plasma' THEN 600
        WHEN 'platelets' THEN 200
        WHEN 'double_red' THEN 400
        WHEN 'power_red' THEN 400
        ELSE 450 -- Default fallback
      END;
      
      -- Generate new history ID
      new_history_id := gen_random_uuid();
      
      -- Insert appointment data into donation_history table
      INSERT INTO donation_history (
        history_id,
        donor_hash_id,
        appointment_id,
        donation_date,
        donation_type,
        donation_volume,
        donation_center_id,
        staff_id,
        status,
        notes,
        completion_timestamp
      ) VALUES (
        new_history_id,
        NEW.donor_hash_id,
        NEW.appointment_id,
        NEW.appointment_datetime,
        normalized_donation_type,
        donation_volume,
        NEW.donation_center_id,
        NEW.staff_id,
        'COMPLETED',
        'Donation successfully completed.',
        now()
      );
      
      -- Log the successful completion
      PERFORM create_audit_log(
        p_user_id := NEW.staff_id,
        p_user_type := 'staff',
        p_action := 'appointment_completed',
        p_details := 'Appointment ' || NEW.appointment_id || ' completed and migrated to donation_history with ID: ' || new_history_id,
        p_resource_type := 'appointments',
        p_resource_id := NEW.appointment_id,
        p_status := 'success'
      );
      
      -- Delete the completed appointment from appointments table
      DELETE FROM appointments WHERE appointment_id = NEW.appointment_id;
      
      -- Log the deletion
      PERFORM create_audit_log(
        p_user_id := NEW.staff_id,
        p_user_type := 'staff',
        p_action := 'appointment_deleted_after_completion',
        p_details := 'Completed appointment ' || NEW.appointment_id || ' removed from appointments table after migration to donation_history',
        p_resource_type := 'appointments',
        p_resource_id := NEW.appointment_id,
        p_status := 'success'
      );
      
      -- If we reach here, the transaction was successful
      RAISE NOTICE 'Appointment % successfully completed and migrated to donation_history with ID: %', NEW.appointment_id, new_history_id;
      
    EXCEPTION
      WHEN OTHERS THEN
        -- Log the error
        PERFORM create_audit_log(
          p_user_id := NEW.staff_id,
          p_user_type := 'staff',
          p_action := 'appointment_completion_failed',
          p_details := 'Failed to complete appointment ' || NEW.appointment_id || ': ' || SQLERRM,
          p_resource_type := 'appointments',
          p_resource_id := NEW.appointment_id,
          p_status := 'error'
        );
        
        -- Re-raise the error to prevent the appointment status change
        RAISE EXCEPTION 'Failed to complete appointment %: %', NEW.appointment_id, SQLERRM;
    END;
  END IF;
  
  -- Return NEW to allow the status change to proceed
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger that fires after appointment status updates
CREATE TRIGGER appointment_completion_trigger
  AFTER UPDATE ON appointments
  FOR EACH ROW
  EXECUTE FUNCTION handle_appointment_completion();

-- Grant necessary permissions to the function
GRANT EXECUTE ON FUNCTION handle_appointment_completion() TO authenticated;
GRANT EXECUTE ON FUNCTION handle_appointment_completion() TO postgres;

-- Create a function to manually migrate existing completed appointments
CREATE OR REPLACE FUNCTION migrate_existing_completed_appointments()
RETURNS INTEGER AS $$
DECLARE
  appointment_count INTEGER;
  migrated_count INTEGER := 0;
  appointment_record RECORD;
BEGIN
  -- Count existing completed appointments
  SELECT COUNT(*) INTO appointment_count 
  FROM appointments 
  WHERE status = 'COMPLETED';
  
  RAISE NOTICE 'Found % existing completed appointments to migrate', appointment_count;
  
  -- Process each completed appointment
  FOR appointment_record IN 
    SELECT * FROM appointments WHERE status = 'COMPLETED'
  LOOP
    BEGIN
      -- Call the completion handler for each existing completed appointment
      PERFORM handle_appointment_completion();
      migrated_count := migrated_count + 1;
      
      RAISE NOTICE 'Migrated appointment % (% of %)', 
        appointment_record.appointment_id, migrated_count, appointment_count;
        
    EXCEPTION
      WHEN OTHERS THEN
        RAISE NOTICE 'Failed to migrate appointment %: %', 
          appointment_record.appointment_id, SQLERRM;
    END;
  END LOOP;
  
  RAISE NOTICE 'Migration completed. Successfully migrated % of % appointments', 
    migrated_count, appointment_count;
    
  RETURN migrated_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission on migration function
GRANT EXECUTE ON FUNCTION migrate_existing_completed_appointments() TO authenticated;
GRANT EXECUTE ON FUNCTION migrate_existing_completed_appointments() TO postgres;

-- Verify the setup
DO $$
BEGIN
  -- Check if trigger exists
  IF EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'appointment_completion_trigger'
  ) THEN
    RAISE NOTICE '✅ Appointment completion trigger created successfully';
  ELSE
    RAISE NOTICE '❌ Appointment completion trigger creation failed';
  END IF;
  
  -- Check if function exists
  IF EXISTS (
    SELECT 1 FROM pg_proc 
    WHERE proname = 'handle_appointment_completion'
  ) THEN
    RAISE NOTICE '✅ Appointment completion function created successfully';
  ELSE
    RAISE NOTICE '❌ Appointment completion function creation failed';
  END IF;
  
  -- Check if migration function exists
  IF EXISTS (
    SELECT 1 FROM pg_proc 
    WHERE proname = 'migrate_existing_completed_appointments'
  ) THEN
    RAISE NOTICE '✅ Migration function created successfully';
  ELSE
    RAISE NOTICE '❌ Migration function creation failed';
  END IF;
END $$;

-- Display current trigger information
SELECT 
  trigger_name,
  event_manipulation,
  action_timing,
  action_statement
FROM information_schema.triggers 
WHERE trigger_name = 'appointment_completion_trigger';

-- Display function information
SELECT 
  proname as function_name,
  prosrc as source_code
FROM pg_proc 
WHERE proname IN ('handle_appointment_completion', 'migrate_existing_completed_appointments');

-- Instructions for usage:
-- 1. To test the trigger: Update any appointment status to 'COMPLETED'
-- 2. To migrate existing completed appointments: SELECT migrate_existing_completed_appointments();
-- 3. Monitor the process through audit logs and database queries
