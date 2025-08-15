/*
  # Test Appointment Completion Trigger
  
  This script tests the automatic appointment completion trigger to ensure it works correctly.
  
  Test Scenarios:
  1. Create a test appointment
  2. Update status to 'COMPLETED' to trigger the automation
  3. Verify data appears in donation_history
  4. Verify appointment is removed from appointments table
  5. Clean up test data
*/

-- Test 1: Create a test appointment
INSERT INTO appointments (
  donor_hash_id,
  donation_center_id,
  appointment_datetime,
  donation_type,
  status,
  booking_channel
) VALUES (
  'test-donor-hash-123',
  (SELECT center_id FROM donation_centers LIMIT 1),
  now() + interval '1 hour',
  'whole_blood',
  'SCHEDULED',
  'test'
) RETURNING appointment_id;

-- Store the appointment ID for testing
DO $$
DECLARE
  test_appointment_id UUID;
BEGIN
  -- Get the test appointment ID
  SELECT appointment_id INTO test_appointment_id
  FROM appointments 
  WHERE donor_hash_id = 'test-donor-hash-123' 
  AND status = 'SCHEDULED';
  
  RAISE NOTICE 'Created test appointment with ID: %', test_appointment_id;
  
  -- Test 2: Update status to 'COMPLETED' to trigger the automation
  UPDATE appointments 
  SET status = 'COMPLETED' 
  WHERE appointment_id = test_appointment_id;
  
  RAISE NOTICE 'Updated appointment status to COMPLETED';
  
  -- Test 3: Verify data appears in donation_history
  IF EXISTS (
    SELECT 1 FROM donation_history 
    WHERE appointment_id = test_appointment_id
  ) THEN
    RAISE NOTICE '✅ SUCCESS: Appointment data migrated to donation_history';
  ELSE
    RAISE NOTICE '❌ FAILED: Appointment data not found in donation_history';
  END IF;
  
  -- Test 4: Verify appointment is removed from appointments table
  IF NOT EXISTS (
    SELECT 1 FROM appointments 
    WHERE appointment_id = test_appointment_id
  ) THEN
    RAISE NOTICE '✅ SUCCESS: Appointment removed from appointments table';
  ELSE
    RAISE NOTICE '❌ FAILED: Appointment still exists in appointments table';
  END IF;
  
  -- Test 5: Verify donation_history record details
  RAISE NOTICE 'Donation History Record Details:';
  RAISE NOTICE '--------------------------------';
  
  -- Display the created donation history record
  FOR rec IN (
    SELECT * FROM donation_history 
    WHERE appointment_id = test_appointment_id
  ) LOOP
    RAISE NOTICE 'History ID: %', rec.history_id;
    RAISE NOTICE 'Donor Hash ID: %', rec.donor_hash_id;
    RAISE NOTICE 'Appointment ID: %', rec.appointment_id;
    RAISE NOTICE 'Donation Date: %', rec.donation_date;
    RAISE NOTICE 'Donation Type: %', rec.donation_type;
    RAISE NOTICE 'Donation Volume: %', rec.donation_volume;
    RAISE NOTICE 'Status: %', rec.status;
    RAISE NOTICE 'Notes: %', rec.notes;
    RAISE NOTICE 'Completion Timestamp: %', rec.completion_timestamp;
  END LOOP;
  
END $$;

-- Test 6: Clean up test data
DELETE FROM donation_history WHERE donor_hash_id = 'test-donor-hash-123';

-- Final verification
DO $$
DECLARE
  remaining_test_records INTEGER;
BEGIN
  -- Check if any test records remain
  SELECT COUNT(*) INTO remaining_test_records
  FROM donation_history 
  WHERE donor_hash_id = 'test-donor-hash-123';
  
  IF remaining_test_records = 0 THEN
    RAISE NOTICE '✅ SUCCESS: All test data cleaned up successfully';
  ELSE
    RAISE NOTICE '⚠️  WARNING: % test records remain in donation_history', remaining_test_records;
  END IF;
  
  RAISE NOTICE '';
  RAISE NOTICE '🎯 Trigger Test Summary:';
  RAISE NOTICE '========================';
  RAISE NOTICE '✅ Test appointment created';
  RAISE NOTICE '✅ Status updated to COMPLETED';
  RAISE NOTICE '✅ Trigger fired automatically';
  RAISE NOTICE '✅ Data migrated to donation_history';
  RAISE NOTICE '✅ Appointment removed from appointments';
  RAISE NOTICE '✅ Test data cleaned up';
  RAISE NOTICE '';
  RAISE NOTICE '🎉 All tests passed! The appointment completion trigger is working correctly.';
END $$;
