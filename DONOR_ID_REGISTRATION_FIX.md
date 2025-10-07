# Donor ID Registration Fix

## Problem
The donor registration was failing because the database function expected `p_avis_donor_center` parameter but the frontend was sending `p_donor_id` parameter. This caused a function signature mismatch and registration failures.

## Solution
Update the database function `register_donor_with_email` to accept the `p_donor_id` parameter that the frontend is already sending, and use the provided donor ID directly instead of generating a new one.

## Changes Made

### 1. Frontend (Already Correct)
The frontend in `src/components/DonorRegistration.tsx` is already sending the correct parameters:
```javascript
const registrationParams = {
  p_donor_hash_id: donorHashId,
  p_salt: salt,
  p_email: formData.email,
  p_donor_id: formData.donorId  // ✅ This is correct
};
```

### 2. Database Function (Needs Update)
The database function needs to be updated to accept `p_donor_id` instead of `p_avis_donor_center`.

## Required Database Changes

### Step 1: Drop the existing function
```sql
DROP FUNCTION IF EXISTS register_donor_with_email(VARCHAR, VARCHAR, VARCHAR, VARCHAR);
```

### Step 2: Create the updated function
```sql
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
  
  -- Send verification email
  PERFORM send_verification_email(p_email, v_verification_token, p_donor_hash_id);
  
  -- Log registration
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
    -- Log error
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
```

## How to Apply the Fix

### Option 1: Supabase Dashboard (Recommended)
1. Go to your Supabase dashboard
2. Navigate to SQL Editor
3. Copy and paste the SQL commands above
4. Execute them in order

### Option 2: Migration File
1. The migration file `supabase/migrations/20250101000000_fix_registration_donor_id.sql` has been created
2. Apply it using your Supabase CLI or dashboard

### Option 3: Test Script
1. Run `node update-registration-function.cjs` to see the required SQL
2. Copy the SQL output and run it in your Supabase dashboard

## Testing the Fix

After applying the database changes, test the registration:

```bash
node update-registration-function.cjs
```

This should show:
- ✅ Function works with donor_id parameter
- ✅ Registration successful
- ✅ Returns the provided donor_id

## Expected Result

After the fix:
1. **Frontend** sends: `p_donor_id` with the user's entered donor ID
2. **Database function** accepts: `p_donor_id` parameter
3. **Registration** uses: The provided donor ID directly (no generation needed)
4. **Result**: Successful registration with the user's chosen donor ID

## Key Benefits

1. **Uses user's donor ID**: The registration now uses the donor ID that the user enters in the form
2. **No generation needed**: The function no longer generates random donor IDs
3. **Consistent with frontend**: The database function now matches what the frontend sends
4. **Maintains constraints**: Still uses a valid AVIS center for database constraints
5. **Preserves functionality**: All existing features (verification, audit logs, etc.) remain intact

## Files Modified

- ✅ `src/components/DonorRegistration.tsx` - Already correct (sends `p_donor_id`)
- 🔄 `register_donor_with_email` function - Needs database update
- ✅ `supabase/migrations/20250101000000_fix_registration_donor_id.sql` - Created
- ✅ `update-registration-function.cjs` - Created for testing
