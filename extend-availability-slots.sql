/*
  # Extend Availability Slots
  
  This script extends the existing availability slots to cover more dates into the future.
  It will generate slots for dates beyond the current end date (September 2, 2025).
  
  The script will:
  1. Find the latest existing slot date
  2. Generate new slots from that date forward for an additional year
  3. Maintain the same business rules and center configurations
*/

-- Function to extend availability slots from a given date
CREATE OR REPLACE FUNCTION extend_availability_slots(
  p_start_date DATE,
  p_end_date DATE,
  p_blood_capacity INTEGER DEFAULT 4,
  p_plasma_capacity INTEGER DEFAULT 2
)
RETURNS void AS $$
DECLARE
  center_record RECORD;
  cur_date DATE;
  cur_time TIME;
  slot_id UUID;
  slot_datetime TIMESTAMP;
BEGIN
  -- Validate input dates
  IF p_start_date >= p_end_date THEN
    RAISE EXCEPTION 'Start date must be before end date';
  END IF;
  
  -- Loop through each donation center
  FOR center_record IN 
    SELECT center_id, name 
    FROM donation_centers 
    WHERE is_active = true 
    ORDER BY name
  LOOP
    RAISE NOTICE 'Generating slots for center: %', center_record.name;
    
    -- Loop through each date
    cur_date := p_start_date;
    WHILE cur_date <= p_end_date LOOP
      -- Skip Sundays (day 0) - only operate Monday-Saturday
      IF EXTRACT(DOW FROM cur_date) BETWEEN 1 AND 6 THEN
        -- Start at 7 AM for each day
        cur_time := '07:00:00'::TIME;
        
        -- Generate slots until 3 PM (8 hours of operation)
        WHILE cur_time < '15:00:00'::TIME LOOP
          slot_datetime := (cur_date + cur_time)::TIMESTAMP;
          
          -- Generate unique slot ID
          slot_id := gen_random_uuid();
          
          -- Insert blood donation slot
          INSERT INTO availability_slots (
            slot_id,
            center_id,
            slot_datetime,
            donation_type,
            capacity,
            current_bookings,
            is_available,
            created_at,
            updated_at
          ) VALUES (
            slot_id,
            center_record.center_id,
            slot_datetime,
            'Blood',
            p_blood_capacity,
            0,
            true,
            now(),
            now()
          );
          
          -- Generate unique slot ID for plasma
          slot_id := gen_random_uuid();
          
          -- Insert plasma donation slot
          INSERT INTO availability_slots (
            slot_id,
            center_id,
            slot_datetime,
            donation_type,
            capacity,
            current_bookings,
            is_available,
            created_at,
            updated_at
          ) VALUES (
            slot_id,
            center_record.center_id,
            slot_datetime,
            'Plasma',
            p_plasma_capacity,
            0,
            true,
            now(),
            now()
          );
          
          -- Move to next hour
          cur_time := cur_time + INTERVAL '1 hour';
        END LOOP;
      END IF;
      
      -- Move to next date
      cur_date := cur_date + INTERVAL '1 day';
    END LOOP;
  END LOOP;
  
  RAISE NOTICE 'Extended availability slots from % to %', p_start_date, p_end_date;
END;
$$ LANGUAGE plpgsql;

-- Function to automatically extend slots for the next year
CREATE OR REPLACE FUNCTION extend_slots_next_year()
RETURNS void AS $$
DECLARE
  latest_slot_date DATE;
  new_end_date DATE;
  total_new_slots INTEGER;
BEGIN
  -- Find the latest existing slot date
  SELECT MAX(slot_datetime::DATE) INTO latest_slot_date 
  FROM availability_slots;
  
  IF latest_slot_date IS NULL THEN
    RAISE EXCEPTION 'No existing slots found. Please run the initial setup first.';
  END IF;
  
  -- Set the new end date to one year from the latest slot
  new_end_date := latest_slot_date + INTERVAL '1 year';
  
  RAISE NOTICE 'Latest existing slot date: %', latest_slot_date;
  RAISE NOTICE 'Extending slots to: %', new_end_date;
  
  -- Extend slots from the day after the latest slot
  PERFORM extend_availability_slots(latest_slot_date + INTERVAL '1 day', new_end_date);
  
  -- Count the new slots created
  SELECT COUNT(*) INTO total_new_slots 
  FROM availability_slots 
  WHERE slot_datetime::DATE > latest_slot_date;
  
  RAISE NOTICE 'Successfully created % new availability slots', total_new_slots;
END;
$$ LANGUAGE plpgsql;

-- Execute the extension
SELECT extend_slots_next_year();

-- Verify the extension
DO $$
DECLARE
  total_slots INTEGER;
  earliest_date DATE;
  latest_date DATE;
  blood_slots INTEGER;
  plasma_slots INTEGER;
BEGIN
  SELECT COUNT(*) INTO total_slots FROM availability_slots;
  SELECT MIN(slot_datetime::DATE) INTO earliest_date FROM availability_slots;
  SELECT MAX(slot_datetime::DATE) INTO latest_date FROM availability_slots;
  SELECT COUNT(*) INTO blood_slots FROM availability_slots WHERE donation_type = 'Blood';
  SELECT COUNT(*) INTO plasma_slots FROM availability_slots WHERE donation_type = 'Plasma';
  
  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Availability Slots Extension Complete!';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Total slots: %', total_slots;
  RAISE NOTICE 'Date range: % to %', earliest_date, latest_date;
  RAISE NOTICE 'Blood donation slots: %', blood_slots;
  RAISE NOTICE 'Plasma donation slots: %', plasma_slots;
  RAISE NOTICE '========================================';
  RAISE NOTICE '';
END $$;

-- Grant permissions for the new functions
GRANT EXECUTE ON FUNCTION extend_availability_slots(DATE, DATE, INTEGER, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION extend_slots_next_year() TO authenticated;
