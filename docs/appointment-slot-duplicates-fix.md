# Fixing Appointment Slot Duplicates

## Problem Description

The appointment booking system was showing inconsistent "spots left" for the same date and time slots. For example:
- **09:00 AM**: One slot showed "6 spots left" and another showed "8 spots left"
- **12:00 PM**: Both showed "7 spots left" (consistent)

## Root Cause

The database schema was missing a **unique constraint** on the combination of:
- `center_id` (donation center)
- `slot_datetime` (date and time)
- `donation_type` (blood or plasma)

This allowed multiple slots to exist for the same center, date, time, and donation type, each with different `capacity` and `current_bookings` values. The UI calculated "spots left" as `capacity - current_bookings`, so duplicate slots showed different availability numbers.

## Solution

### 1. Database Schema Fix

Added a unique constraint to prevent future duplicates:

```sql
ALTER TABLE availability_slots 
ADD CONSTRAINT uk_availability_slots_unique 
UNIQUE (center_id, slot_datetime, donation_type);
```

### 2. Data Cleanup

Before applying the constraint, existing duplicate data must be cleaned up:

1. **Identify duplicates** using the script in `scripts/cleanup_duplicate_slots.sql`
2. **Decide how to merge** duplicate slots:
   - Keep the slot with highest capacity
   - Sum the current_bookings from all duplicates
   - Delete the duplicate slots
3. **Verify cleanup** was successful
4. **Apply the migration** with the unique constraint

### 3. Prevention

The unique constraint ensures that:
- Only one slot can exist per center/date/time/donation_type combination
- Future attempts to create duplicates will fail with a clear error
- Data integrity is maintained at the database level

## Files Modified

- `supabase/migrations/20250630132511_empty_cake.sql` - Added unique constraint
- `supabase/migrations/20250630132512_add_unique_constraint.sql` - New migration for existing databases
- `scripts/cleanup_duplicate_slots.sql` - Data cleanup script
- `docs/appointment-slot-duplicates-fix.md` - This documentation

## Implementation Steps

1. **Run the cleanup script** to identify and resolve existing duplicates
2. **Apply the migration** to add the unique constraint
3. **Test the booking system** to ensure consistent slot availability
4. **Monitor for any constraint violations** during slot creation

## Benefits

- ✅ Consistent "spots left" display
- ✅ Prevents data duplication
- ✅ Maintains data integrity
- ✅ Clear error messages for constraint violations
- ✅ Better user experience
