-- Fix Appointment Completion Error - Complete Solution
-- This script resolves both constraint violations:
-- 1. "chk_donation_history_status" - status case sensitivity
-- 2. "chk_donation_history_type" - donation type format mismatch

-- 1. First, let's check the current constraints
SELECT conname, pg_get_constraintdef(oid) 
FROM pg_constraint 
WHERE conrelid = 'donation_history'::regclass 
AND conname IN ('chk_donation_history_status', 'chk_donation_history_type');

-- 2. Update any existing lowercase statuses in donation_history
UPDATE donation_history 
SET status = 'COMPLETED' 
WHERE status = 'completed';

UPDATE donation_history 
SET status = 'DEFERRED' 
WHERE status = 'deferred';

-- 3. Update any existing donation types to match the constraint
UPDATE donation_history 
SET donation_type = 'whole_blood' 
WHERE donation_type = 'Blood';

UPDATE donation_history 
SET donation_type = 'plasma' 
WHERE donation_type = 'Plasma';

-- 4. Update appointments table to use consistent donation types
UPDATE appointments 
SET donation_type = 'whole_blood' 
WHERE donation_type = 'Blood';

UPDATE appointments 
SET donation_type = 'plasma' 
WHERE donation_type = 'Plasma';

-- 5. Update appointments table to use consistent status values
UPDATE appointments 
SET status = 'COMPLETED' 
WHERE status = 'completed';

-- 6. Drop the existing constraints
ALTER TABLE donation_history DROP CONSTRAINT IF EXISTS chk_donation_history_status;
ALTER TABLE donation_history DROP CONSTRAINT IF EXISTS chk_donation_history_type;

-- 7. Recreate the status constraint with proper uppercase values
ALTER TABLE donation_history 
ADD CONSTRAINT chk_donation_history_status 
CHECK (status IN (
  'COMPLETED', 'DEFERRED', 'SELF_DEFERRED', 'INCOMPLETE', 'ELIGIBILITY_EXPIRED',
  'POST_DONATION_FOLLOWUP', 'TEST_RESULTS_READY', 'UNIT_USED', 'UNIT_DISCARDED'
));

-- 8. Recreate the donation type constraint with both formats for compatibility
ALTER TABLE donation_history 
ADD CONSTRAINT chk_donation_history_type 
CHECK (donation_type IN (
  'whole_blood', 'Blood', 'plasma', 'Plasma', 'platelets', 'Platelets', 
  'double_red', 'Double_Red', 'power_red', 'Power_Red'
));

-- 9. Update the trigger function to handle both status and donation type properly
CREATE OR REPLACE FUNCTION handle_appointment_completion()
RETURNS TRIGGER AS $$
DECLARE
  normalized_donation_type VARCHAR;
  donation_volume INTEGER;
BEGIN
  -- Only proceed if status is COMPLETED
  IF NEW.status = 'COMPLETED' THEN
    -- Normalize donation type to lowercase for consistency
    normalized_donation_type := LOWER(NEW.donation_type);
    
    -- Set donation volume based on normalized type
    donation_volume := CASE normalized_donation_type
      WHEN 'whole_blood' THEN 450
      WHEN 'plasma' THEN 600
      WHEN 'platelets' THEN 200
      WHEN 'double_red' THEN 400
      WHEN 'power_red' THEN 400
      ELSE 450 -- Default fallback
    END;
    
    -- Insert into donation_history with normalized values
    INSERT INTO donation_history (
      donation_id,
      donor_hash_id,
      donation_type,
      donation_volume,
      donation_center_id,
      staff_id,
      status,
      notes,
      completion_timestamp
    ) VALUES (
      gen_random_uuid(),
      NEW.donor_hash_id,
      normalized_donation_type, -- Use normalized type
      donation_volume,
      NEW.donation_center_id,
      NEW.staff_id,
      'COMPLETED', -- Use uppercase status
      'Donation successfully completed.',
      now()
    );
    
    -- Log the completion
    PERFORM create_audit_log(
      NEW.staff_id,
      'staff',
      'appointment_completed',
      'Appointment ' || NEW.appointment_id || ' completed and migrated to donation_history',
      NULL,
      NULL,
      'appointment',
      NEW.appointment_id,
      'success'
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 10. Ensure the trigger is properly attached
DROP TRIGGER IF EXISTS appointment_completion_trigger ON appointments;
CREATE TRIGGER appointment_completion_trigger
  AFTER UPDATE ON appointments
  FOR EACH ROW
  EXECUTE FUNCTION handle_appointment_completion();

-- 11. Verify the fix by checking the constraints
SELECT conname, pg_get_constraintdef(oid) 
FROM pg_constraint 
WHERE conrelid = 'donation_history'::regclass 
AND conname IN ('chk_donation_history_status', 'chk_donation_history_type');

-- 12. Test the trigger function
SELECT pg_get_functiondef(oid) 
FROM pg_proc 
WHERE proname = 'handle_appointment_completion';

-- 13. Show current status and donation type values in both tables
SELECT 'appointments' as table_name, status, donation_type, count(*) 
FROM appointments 
GROUP BY status, donation_type
UNION ALL
SELECT 'donation_history' as table_name, status, donation_type, count(*) 
FROM donation_history 
GROUP BY status, donation_type;

-- 14. Show sample data to verify the fix
SELECT 'appointments' as table_name, appointment_id , status, donation_type
FROM appointments 
LIMIT 5
UNION ALL
SELECT 'donation_history' as table_name, history_id as id, status, donation_type
FROM donation_history 
LIMIT 5;
