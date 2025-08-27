-- Fix Calendar Date Range Display Issue
-- This migration allows the calendar to show all future available dates from the database
-- while maintaining the business logic that past dates are unavailable for booking

-- 1. Update the RLS policy to allow reading all available slots regardless of date
-- This enables the calendar to display the full range of available dates
DROP POLICY IF EXISTS "Public can read available slots" ON availability_slots;

CREATE POLICY "Public can read available slots"
  ON availability_slots
  FOR SELECT
  TO public
  USING (is_available = true);

-- 2. Keep the existing trigger function that marks past dates as unavailable
-- This maintains business logic that past dates cannot be booked
-- The function update_slot_availability() already handles this correctly

-- 3. Update existing slots to mark them as available if they have capacity
-- This ensures all slots with available capacity are marked as available for booking
UPDATE availability_slots 
SET is_available = (current_bookings < capacity)
WHERE is_available = false AND current_bookings < capacity;

-- 4. Add a comment explaining the change
COMMENT ON POLICY "Public can read available slots" ON availability_slots IS 
'Updated to allow reading all available slots, enabling the calendar to show the full range of future dates while maintaining past date restrictions';
