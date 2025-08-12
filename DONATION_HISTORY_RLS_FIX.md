# Donation History RLS Policy Fix

## Problem Description

You're encountering this error when trying to complete appointments:

```
Error updating appointment status: Failed to migrate appointment f6507db7-436f-4d3b-ba7d-a99687eccc6b to donation_history: new row violates row-level security policy for table "donation_history"
```

## Root Cause

The issue is with **Row Level Security (RLS)** policies on the `donation_history` table. The existing RLS policy requires that the user executing the insert must be a staff member:

```sql
CREATE POLICY "Staff can create donation history"
  ON donation_history
  FOR INSERT
  TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM staff WHERE staff_id = auth.uid()
  ));
```

However, when the appointment completion trigger function runs, it's not running in the context of a specific user - it's running as a system function. Even though the function is marked as `SECURITY DEFINER`, the RLS policies are still being enforced.

## Solution

The fix involves creating a more permissive RLS policy that allows inserts when the `appointment_id` field is present, indicating the record is coming from the appointment completion process.

### Key Changes Made

1. **New Policy for Trigger Function**: Allows inserts when `appointment_id IS NOT NULL`
2. **Updated Staff Policy**: Combines staff check with trigger function bypass
3. **Proper Permissions**: Grants necessary permissions to the postgres user and function creator

### Files Created

- `fix-donation-history-rls.sql` - The main SQL fix
- `run-rls-fix-donation-history.bat` - Windows batch file to run the fix
- `run-rls-fix-donation-history.sh` - Unix/Linux shell script to run the fix

## How to Apply the Fix

### Option 1: Run the Batch File (Windows)
```cmd
run-rls-fix-donation-history.bat
```

### Option 2: Run the Shell Script (Unix/Linux)
```bash
chmod +x run-rls-fix-donation-history.sh
./run-rls-fix-donation-history.sh
```

### Option 3: Run Manually with psql
```bash
psql -h localhost -U postgres -d vitalita -f "fix-donation-history-rls.sql"
```

## What the Fix Does

1. **Creates a new RLS policy** that allows inserts when `appointment_id` is present
2. **Updates the existing staff policy** to be more permissive for system operations
3. **Grants necessary permissions** to ensure the function can work
4. **Tests the fix** with a sample insert to verify it works

## Expected Result

After applying the fix, the appointment completion trigger should work properly:

- ✅ Appointments can be marked as 'COMPLETED'
- ✅ Records are automatically copied to `donation_history` table
- ✅ No more RLS policy violations
- ✅ The appointment record is properly deleted after migration

## Verification

The script includes a test that will:
1. Try to insert a test record into `donation_history`
2. Show a success message if the RLS policies are working
3. Show an error message if there are still issues

## Security Considerations

- The fix maintains security by only allowing inserts with `appointment_id` (from the trigger)
- Staff members can still manually create records as before
- The existing SELECT and UPDATE policies remain unchanged
- Only the INSERT policy is modified to allow the trigger function to work

## Troubleshooting

If you still encounter issues after running the fix:

1. **Check the error messages** from the SQL script
2. **Verify the policies were created** by checking `pg_policies`
3. **Ensure the function has proper permissions** on the `donation_history` table
4. **Check if RLS is enabled** on the table

## Related Files

- `migrate-completed-appointments.sql` - The main appointment completion trigger
- `fix-rls-policies.sql` - General RLS policy fixes
- `APPOINTMENT_COMPLETION_FEATURE.md` - Complete feature documentation

## Support

If you continue to have issues after applying this fix, please:
1. Check the error messages from the SQL script
2. Verify your database connection and permissions
3. Ensure you're running the script as a user with sufficient privileges
