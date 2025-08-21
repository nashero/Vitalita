# Registration Function Fix Summary

## Problem Identified

The donor registration was failing due to a **function signature mismatch** between the frontend code and the database function:

### Frontend Expectation
- **Function**: `register_donor_with_email()`
- **Return Type**: `TABLE(donor_id VARCHAR, success BOOLEAN, message TEXT)`
- **Usage**: Expects an array result with `{donor_id, success, message}`

### Database Reality
- **Function**: `register_donor_with_email()`
- **Return Type**: `BOOLEAN` (old version)
- **Usage**: Returns a simple boolean value

## Root Cause

The database had **two different versions** of the same function:

1. **Old Version** (from `20250630200000_add_email_verification.sql`):
   ```sql
   RETURNS BOOLEAN
   ```

2. **New Version** (from `20250630200700_add_donor_id_field.sql`):
   ```sql
   RETURNS TABLE(donor_id VARCHAR, success BOOLEAN, message TEXT)
   ```

The frontend code was updated to expect the new version, but the database still had the old version, causing:
- **406 (Not Acceptable) errors** from Supabase API calls
- **Registration function returning `true`** but frontend expecting array
- **Generic error messages** being displayed to users

## Why Login Works But Registration Fails

### Login Process
- Uses **direct table queries** (`supabase.from('donors').select()`)
- **No function calls** involved
- **Simple data retrieval** that works with RLS policies

### Registration Process
- Calls **database function** (`supabase.rpc('register_donor_with_email')`)
- **Function signature mismatch** causes 406 errors
- **Complex transaction** involving multiple operations

## Solution Applied

### 1. Fixed Frontend Code
- Updated error handling to properly check for `result?.success`
- Added null safety checks for the result object
- Improved error messages for better debugging

### 2. Fixed Database Function
- **Dropped old function** with wrong signature
- **Created new function** with correct return type
- **Ensured all dependencies** exist:
  - `generate_verification_token()`
  - `generate_donor_id()`
  - `send_verification_email()`
  - `create_audit_log()`

### 3. Updated TypeScript Types
- Fixed `supabase.ts` to reflect correct function return type
- Ensured type safety between frontend and backend

## Files Modified

### Frontend
- `src/components/DonorRegistration.tsx` - Fixed error handling
- `src/lib/supabase.ts` - Updated function return types

### Database
- `fix-registration-function.sql` - Complete function fix
- `test-registration-fix.js` - Test script to verify fix

## How to Apply the Fix

### Option 1: Run SQL Script (Recommended)
```bash
# Apply the database fix
psql -h your-host -U your-user -d your-db -f fix-registration-function.sql
```

### Option 2: Run Test Script
```bash
# Test if the fix works
node test-registration-fix.js
```

## Expected Result After Fix

1. **Registration function** returns proper table structure
2. **No more 406 errors** from Supabase API calls
3. **Clear success/error messages** displayed to users
4. **Donor ID generation** works correctly
5. **Audit logging** functions properly

## Verification Steps

1. **Check function signature** in database
2. **Test registration** with test data
3. **Verify donor creation** in database
4. **Check audit logs** are created
5. **Test frontend registration** form

## Prevention

To avoid similar issues in the future:

1. **Always check function signatures** when updating database functions
2. **Use migration versioning** to track function changes
3. **Test both frontend and backend** after database changes
4. **Keep TypeScript types** synchronized with database schema
5. **Use comprehensive testing** scripts for critical functions

## Related Issues

This fix also resolves:
- **Donor ID generation** problems
- **Email verification token** creation issues
- **Audit logging** failures during registration
- **Type mismatch** errors in TypeScript
