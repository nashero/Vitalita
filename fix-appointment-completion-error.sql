-- Fix Appointment Completion Error
-- This script resolves the "chk_donation_history_status" constraint violation
-- by ensuring all status values use uppercase format

-- 1. First, let's check the current constraint
SELECT conname, pg_get_constraintdef(oid) 
FROM pg_constraint 
WHERE conrelid = 'donation_history'::regclass 
AND conname = 'chk_donation_history_status';

-- 2. Update any existing lowercase statuses in donation_history
UPDATE donation_history 
SET status = 'COMPLETED' 
WHERE status = 'completed';

UPDATE donation_history 
SET status = 'DEFERRED' 
WHERE status = 'deferred';

-- 3. Drop the existing constraint if it exists
ALTER TABLE donation_history DROP CONSTRAINT IF EXISTS chk_donation_history_status;

-- 4. Recreate the constraint with proper uppercase values
ALTER TABLE donation_history 
ADD CONSTRAINT chk_donation_history_status 
CHECK (status IN (
  'COMPLETED', 'DEFERRED', 'SELF_DEFERRED', 'INCOMPLETE', 'ELIGIBILITY_EXPIRED',
  'POST_DONATION_FOLLOWUP', 'TEST_RESULTS_READY', 'UNIT_USED', 'UNIT_DISCARDED'
));

-- 5. Update the trigger function to use uppercase status
CREATE OR REPLACE FUNCTION handle_appointment_completion()
RETURNS TRIGGER AS $$
BEGIN
  -- Only proceed if status is COMPLETED
  IF NEW.status = 'COMPLETED' THEN
    -- Insert into donation_history with uppercase status
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
      NEW.donation_type,
      450, -- Default donation volume
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

-- 6. Ensure the trigger is properly attached
DROP TRIGGER IF EXISTS appointment_completion_trigger ON appointments;
CREATE TRIGGER appointment_completion_trigger
  AFTER UPDATE ON appointments
  FOR EACH ROW
  EXECUTE FUNCTION handle_appointment_completion();

-- 7. Update any existing appointments with lowercase status
UPDATE appointments 
SET status = 'COMPLETED' 
WHERE status = 'completed';

-- 8. Verify the fix by checking the constraint
SELECT conname, pg_get_constraintdef(oid) 
FROM pg_constraint 
WHERE conrelid = 'donation_history'::regclass 
AND conname = 'chk_donation_history_status';

-- 9. Test the trigger function
-- This will show if there are any syntax errors
SELECT pg_get_functiondef(oid) 
FROM pg_proc 
WHERE proname = 'handle_appointment_completion';

-- 10. Show current status values in both tables
SELECT 'appointments' as table_name, status, count(*) 
FROM appointments 
GROUP BY status
UNION ALL
SELECT 'donation_history' as table_name, status, count(*) 
FROM donation_history 
GROUP BY status;
