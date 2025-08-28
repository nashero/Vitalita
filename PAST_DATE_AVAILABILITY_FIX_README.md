# Calendar Date Range Display Fix

## Problem Description

When trying to book an appointment for blood & plasma donation, the calendar interface only shows dates available for booking until September 17, 2025, even though the database contains availability slots until August 22, 2026.

## Root Cause Analysis

The issue was caused by a database RLS (Row Level Security) policy that was too restrictive:

### Database RLS Policy Issue
- **File**: `supabase/migrations/20250630132511_empty_cake.sql`
- **Issue**: RLS policy `"Public can read available slots"` had `USING (is_available = true AND slot_datetime > now())`
- **Impact**: The policy was working correctly for business logic (only showing future slots), but the calendar couldn't display the full range of available future dates due to the policy restriction

## Solution

### 1. Frontend Logic (Already Correct)
The frontend code was already correctly implemented:
- **Calendar Component**: Properly marks past dates as unavailable (`isPast: date < today`)
- **Date Selection**: Prevents selecting past dates (`if (date < today) return`)
- **Database Queries**: Only fetch future slots (`.gt('slot_datetime', new Date().toISOString())`)

### 2. Database Fix (Requires Migration)

#### SQL Migration File: `fix-past-date-availability.sql`

This migration:
1. Updates the RLS policy to allow reading all available slots regardless of date
2. Maintains the existing trigger function that correctly marks past dates as unavailable
3. Ensures only future dates with capacity are marked as available

**Key Changes:**
```sql
-- Before: Policy was too restrictive
USING (is_available = true AND slot_datetime > now())

-- After: Policy allows reading all available slots
USING (is_available = true)
```

**Business Logic Preserved:**
- Past dates remain unavailable for booking (maintained by trigger function)
- Only future dates with capacity are marked as available
- Calendar can now display the full range of available future dates

#### Running the Migration

**Option 1: Using the provided scripts**
```bash
# Windows
run-fix-past-date-availability.bat

# Linux/Mac
./run-fix-past-date-availability.sh
```

**Option 2: Manual execution in Supabase**
1. Open your Supabase dashboard
2. Go to the SQL Editor
3. Copy and paste the contents of `fix-past-date-availability.sql`
4. Run the SQL

**Option 3: Using psql command line**
```bash
psql -h YOUR_SUPABASE_HOST -p 5432 -d postgres -U postgres -f fix-past-date-availability.sql
```

## Expected Results

After applying the fixes:

1. **Calendar Display**: The calendar will show all available future dates from the database, including dates until August 22, 2026
2. **Past Date Restriction**: Past dates remain unavailable for booking (maintaining business logic)
3. **Future Date Range**: Users can see and navigate to all months that have available slots
4. **Date Selection**: Users can only select future dates that have available slots

## Verification

To verify the fix is working:

1. **Check Calendar Range**: Navigate to the appointment booking calendar
2. **Verify Date Range**: Confirm that dates beyond September 17, 2025 are now visible
3. **Test Past Date Restriction**: Verify that past dates are still marked as unavailable
4. **Test Future Date Selection**: Try selecting a future date that has available slots
5. **Check Navigation**: Use the calendar navigation to move to future months (should show dates until August 2026)

## Files Modified

### Frontend Changes
- **No changes needed** - Frontend logic was already correct

### Database Changes
- `fix-past-date-availability.sql` - SQL migration file
- `run-fix-past-date-availability.bat` - Windows batch file
- `run-fix-past-date-availability.sh` - Linux/Mac shell script

## Business Logic Maintained

- ✅ **Past dates are unavailable** for booking (business requirement met)
- ✅ **Only future dates** can be selected (business requirement met)
- ✅ **Calendar shows full range** of available future dates (issue fixed)
- ✅ **Data integrity preserved** (existing constraints maintained)

## Notes

- **Past Date Logic**: The system correctly prevents booking past dates
- **Future Date Range**: The calendar now displays the complete range of available future dates
- **User Experience**: Users can see all available future dates and navigate through all months with availability
- **Performance**: No performance impact as the changes only affect RLS policy logic

## Troubleshooting

If the issue persists after applying the fixes:

1. **Check Migration Status**: Ensure the SQL migration ran successfully
2. **Verify RLS Policies**: Check that the new RLS policy is active in Supabase
3. **Clear Browser Cache**: Refresh the application to ensure changes are loaded
4. **Check Console Logs**: Look for any JavaScript errors in the browser console
5. **Database Verification**: Confirm that the RLS policy has been updated
6. **Calendar Navigation**: Try manually navigating to future months using the calendar arrows
