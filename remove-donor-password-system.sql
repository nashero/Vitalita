/*
  # Remove Donor Password System Only
  
  This script removes password-related functionality from DONORS only:
  - Staff authentication will continue to use passwords
  - Donor authentication will use hash-based authentication only
  
  1. Drop donor password-related functions
  2. Remove donor password-related columns
  3. Keep staff password system intact
  4. Clean up donor password-related audit logs
  
  WARNING: This will permanently remove donor password data. 
  Staff passwords will remain unaffected.
*/

-- ========================================
-- STEP 1: Drop donor password-related functions
-- ========================================

-- Drop donor password functions (but keep staff password system)
DROP FUNCTION IF EXISTS set_donor_password(VARCHAR, VARCHAR);
DROP FUNCTION IF EXISTS verify_donor_password(VARCHAR, VARCHAR);
DROP FUNCTION IF EXISTS create_donor_session(VARCHAR, INET, VARCHAR);
DROP FUNCTION IF EXISTS validate_donor_session(VARCHAR);
DROP FUNCTION IF EXISTS clear_donor_session(VARCHAR);
DROP FUNCTION IF EXISTS log_password_event(VARCHAR, VARCHAR, TEXT, VARCHAR);

-- Drop password update trigger function for donors
DROP FUNCTION IF EXISTS update_password_updated_at();

-- ========================================
-- STEP 2: Remove password columns from donors table only
-- ========================================

-- Remove password management columns from donors table
ALTER TABLE donors DROP COLUMN IF EXISTS password_hash CASCADE;
ALTER TABLE donors DROP COLUMN IF EXISTS password_salt CASCADE;
ALTER TABLE donors DROP COLUMN IF EXISTS password_created_at CASCADE;
ALTER TABLE donors DROP COLUMN IF EXISTS password_updated_at CASCADE;

-- Remove session management columns from donors table
ALTER TABLE donors DROP COLUMN IF EXISTS last_login_at CASCADE;
ALTER TABLE donors DROP COLUMN IF EXISTS last_login_ip CASCADE;
ALTER TABLE donors DROP COLUMN IF EXISTS last_login_device CASCADE;
ALTER TABLE donors DROP COLUMN IF EXISTS session_token CASCADE;
ALTER TABLE donors DROP COLUMN IF EXISTS session_expires_at CASCADE;

-- ========================================
-- STEP 3: Drop donor password-related indexes
-- ========================================

-- Drop session-related indexes for donors
DROP INDEX IF EXISTS idx_donors_session_token;
DROP INDEX IF EXISTS idx_donors_last_login;
DROP INDEX IF EXISTS idx_donors_active_sessions;

-- ========================================
-- STEP 4: Remove donor password-related triggers
-- ========================================

-- Drop password update trigger for donors
DROP TRIGGER IF EXISTS trigger_update_donors_password_updated_at ON donors;

-- ========================================
-- STEP 5: Clean up donor password-related policies
-- ========================================

-- Drop password-related RLS policies for donors
DROP POLICY IF EXISTS "Donors can update own password and session" ON donors;

-- ========================================
-- STEP 6: Clean up donor password-related audit logs
-- ========================================

-- Remove donor password-related audit log entries
DELETE FROM audit_logs WHERE action LIKE '%password%' AND user_type = 'donor';
DELETE FROM audit_logs WHERE action LIKE '%session%' AND user_type = 'donor';

-- ========================================
-- STEP 7: Update table comments
-- ========================================

-- Update donor table comment
COMMENT ON TABLE donors IS 'Donor table with hash-based authentication only (no passwords)';

-- Remove donor password-related column comments
COMMENT ON TABLE donors IS 'Donor table with hash-based authentication only';

-- ========================================
-- STEP 8: Verification
-- ========================================

-- Verify donor password columns are removed but staff passwords remain
DO $$
DECLARE
  donor_password_columns integer;
  staff_password_columns integer;
BEGIN
  -- Check for remaining password columns in donors table
  SELECT count(*) INTO donor_password_columns
  FROM information_schema.columns
  WHERE table_name = 'donors' 
    AND table_schema = 'public'
    AND column_name LIKE '%password%';
    
  -- Check for remaining password columns in staff table
  SELECT count(*) INTO staff_password_columns
  FROM information_schema.columns
  WHERE table_name = 'staff' 
    AND table_schema = 'public'
    AND column_name LIKE '%password%';
    
  IF donor_password_columns = 0 THEN
    RAISE NOTICE '✅ Donor password system successfully removed';
  ELSE
    RAISE NOTICE '⚠️ Warning: % password columns still exist in donors table', donor_password_columns;
  END IF;
  
  IF staff_password_columns > 0 THEN
    RAISE NOTICE '✅ Staff password system preserved (% password columns)', staff_password_columns;
  ELSE
    RAISE NOTICE '⚠️ Warning: No password columns found in staff table';
  END IF;
END $$;

-- ========================================
-- STEP 9: Show final table structures
-- ========================================

-- Show donors table structure (should have no password columns)
SELECT 
  'donors' as table_name,
  column_name,
  data_type
FROM information_schema.columns
WHERE table_name = 'donors'
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- Show staff table structure (should have password columns)
SELECT 
  'staff' as table_name,
  column_name,
  data_type
FROM information_schema.columns
WHERE table_name = 'staff'
  AND table_schema = 'public'
ORDER BY ordinal_position;
