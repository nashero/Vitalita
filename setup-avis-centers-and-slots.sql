/*
  # Setup AVIS Centers and Availability Slots
  
  This script sets up the complete AVIS donation center infrastructure:
  
  1. Creates 7 AVIS donation centers in Italy
  2. Generates availability slots for blood and plasma donations for exactly one year into the future
  3. Implements the specified business rules:
     - Operating hours: Monday-Saturday, 7 AM - 3 PM
     - Blood donation: 60 minutes, 450ml collection
     - Plasma donation: 60 minutes, 600-700ml collection
     - 8-hour operational window per day
     - Multiple slots per day with proper capacity management
  
  4. Centers:
     - AVIS Casalmaggiore
     - AVIS Gussola
     - AVIS Viadana
     - AVIS Piadena
     - AVIS Rivarolo del Re
     - AVIS Scandolara-Ravara
     - AVIS Calvatone
*/

-- First, ensure we have the required tables
DO $$
BEGIN
  -- Check if donation_centers table exists
  IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'donation_centers') THEN
    RAISE EXCEPTION 'donation_centers table does not exist. Please run the migration scripts first.';
  END IF;
  
  -- Check if availability_slots table exists
  IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'availability_slots') THEN
    RAISE EXCEPTION 'availability_slots table does not exist. Please run the migration scripts first.';
  END IF;
  
  -- Check if appointments table exists
  IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'appointments') THEN
    RAISE EXCEPTION 'appointments table does not exist. Please run the migration scripts first.';
  END IF;
END $$;

-- Clear existing data (optional - uncomment if you want to start fresh)
-- DELETE FROM availability_slots;
-- DELETE FROM appointments;
-- DELETE FROM donation_centers;

-- Insert AVIS donation centers
INSERT INTO donation_centers (center_id, name, address, city, country, contact_phone, email, is_active, created_at, updated_at)
VALUES 
  (
    gen_random_uuid(),
    'AVIS Casalmaggiore',
    'Via Marconi 15',
    'Casalmaggiore',
    'Italy',
    '+39 0375 200123',
    'casalmaggiore@avis.it',
    true,
    now(),
    now()
  ),
  (
    gen_random_uuid(),
    'AVIS Gussola',
    'Piazza Garibaldi 8',
    'Gussola',
    'Italy',
    '+39 0375 200456',
    'gussola@avis.it',
    true,
    now(),
    now()
  ),
  (
    gen_random_uuid(),
    'AVIS Viadana',
    'Via Roma 22',
    'Viadana',
    'Italy',
    '+39 0375 200789',
    'viadana@avis.it',
    true,
    now(),
    now()
  ),
  (
    gen_random_uuid(),
    'AVIS Piadena',
    'Corso Vittorio Emanuele 12',
    'Piadena',
    'Italy',
    '+39 0375 200321',
    'piadena@avis.it',
    true,
    now(),
    now()
  ),
  (
    gen_random_uuid(),
    'AVIS Rivarolo del Re',
    'Via Nazionale 45',
    'Rivarolo del Re',
    'Italy',
    '+39 0375 200654',
    'rivarolo@avis.it',
    true,
    now(),
    now()
  ),
  (
    gen_random_uuid(),
    'AVIS Scandolara-Ravara',
    'Via della Libertà 7',
    'Scandolara-Ravara',
    'Italy',
    '+39 0375 200987',
    'scandolara@avis.it',
    true,
    now(),
    now()
  ),
  (
    gen_random_uuid(),
    'AVIS Calvatone',
    'Piazza della Repubblica 3',
    'Calvatone',
    'Italy',
    '+39 0375 200147',
    'calvatone@avis.it',
    true,
    now(),
    now()
  )
ON CONFLICT (email) DO UPDATE SET
  name = EXCLUDED.name,
  address = EXCLUDED.address,
  city = EXCLUDED.city,
  country = EXCLUDED.country,
  contact_phone = EXCLUDED.contact_phone,
  updated_at = now();

-- Function to generate availability slots for a specific date range
CREATE OR REPLACE FUNCTION generate_availability_slots(
  p_start_date DATE,
  p_end_date DATE,
  p_blood_capacity INTEGER DEFAULT 8,
  p_plasma_capacity INTEGER DEFAULT 6
)
RETURNS void AS $$
DECLARE
  cur_date DATE;
  cur_time TIME;
  slot_datetime TIMESTAMPTZ;
  center_record RECORD;
  slot_id UUID;
BEGIN
  -- Loop through each date in the range
  cur_date := p_start_date;
  
  WHILE cur_date <= p_end_date LOOP
    -- Only generate slots for Monday (1) through Saturday (6)
    IF EXTRACT(DOW FROM cur_date) BETWEEN 1 AND 6 THEN
      -- Loop through each center
      FOR center_record IN SELECT center_id FROM donation_centers WHERE is_active = true LOOP
        -- Generate slots from 7 AM to 2 PM (last slot starts at 2 PM, ends at 3 PM)
        cur_time := '07:00:00';
        
        WHILE cur_time < '15:00:00' LOOP
          slot_datetime := (cur_date + cur_time)::TIMESTAMPTZ;
          
          -- Generate Blood donation slot
          slot_id := gen_random_uuid();
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
          
          -- Generate Plasma donation slot
          slot_id := gen_random_uuid();
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
      END LOOP;
    END IF;
    
    -- Move to next date
    cur_date := cur_date + INTERVAL '1 day';
  END LOOP;
  
  RAISE NOTICE 'Generated availability slots from % to %', p_start_date, p_end_date;
END;
$$ LANGUAGE plpgsql;

-- Function to generate slots for exactly one year into the future
CREATE OR REPLACE FUNCTION generate_one_year_slots()
RETURNS void AS $$
DECLARE
  start_date DATE;
  end_date DATE;
  total_days INTEGER;
BEGIN
  start_date := CURRENT_DATE;
  end_date := start_date + INTERVAL '365 days';
  total_days := end_date - start_date;
  
  -- Generate slots for exactly one year (365 days)
  PERFORM generate_availability_slots(start_date, end_date);
  
  RAISE NOTICE 'Generated availability slots for exactly one year: % days from % to %', 
    total_days, start_date, end_date;
END;
$$ LANGUAGE plpgsql;

-- Function to generate slots for a specific month
CREATE OR REPLACE FUNCTION generate_month_slots(p_year INTEGER, p_month INTEGER)
RETURNS void AS $$
DECLARE
  start_date DATE;
  end_date DATE;
BEGIN
  start_date := make_date(p_year, p_month, 1);
  end_date := (start_date + INTERVAL '1 month')::DATE - INTERVAL '1 day';
  
  -- Generate slots for the specified month
  PERFORM generate_availability_slots(start_date, end_date);
  
  RAISE NOTICE 'Generated availability slots for % %', 
    to_char(start_date, 'Month'), p_year;
END;
$$ LANGUAGE plpgsql;

-- Function to clean up old slots (older than 1 year)
CREATE OR REPLACE FUNCTION cleanup_old_slots()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM availability_slots 
  WHERE slot_datetime < (CURRENT_DATE - INTERVAL '1 year');
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  
  RAISE NOTICE 'Cleaned up % old availability slots', deleted_count;
  
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Function to get slot statistics
CREATE OR REPLACE FUNCTION get_slot_statistics(
  p_start_date DATE DEFAULT CURRENT_DATE,
  p_end_date DATE DEFAULT (CURRENT_DATE + INTERVAL '30 days')
)
RETURNS TABLE (
  center_name TEXT,
  total_slots INTEGER,
  blood_slots INTEGER,
  plasma_slots INTEGER,
  available_slots INTEGER,
  booked_slots INTEGER,
  utilization_rate NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    dc.name::TEXT as center_name,
    COUNT(*)::INTEGER as total_slots,
    COUNT(*) FILTER (WHERE asl.donation_type = 'Blood')::INTEGER as blood_slots,
    COUNT(*) FILTER (WHERE asl.donation_type = 'Plasma')::INTEGER as plasma_slots,
    COUNT(*) FILTER (WHERE asl.is_available = true)::INTEGER as available_slots,
    COUNT(*) FILTER (WHERE asl.is_available = false)::INTEGER as booked_slots,
    ROUND(
      (COUNT(*) FILTER (WHERE asl.is_available = false)::NUMERIC / COUNT(*)::NUMERIC) * 100, 2
    ) as utilization_rate
  FROM availability_slots asl
  JOIN donation_centers dc ON asl.center_id = dc.center_id
  WHERE asl.slot_datetime BETWEEN p_start_date AND p_end_date
  GROUP BY dc.center_id, dc.name
  ORDER BY dc.name;
END;
$$ LANGUAGE plpgsql;

-- Generate initial slots for exactly one year into the future
SELECT generate_one_year_slots();

-- Create indexes for better performance on slot queries
CREATE INDEX IF NOT EXISTS idx_availability_slots_slot_datetime 
ON availability_slots (slot_datetime);

CREATE INDEX IF NOT EXISTS idx_availability_slots_center_type_date 
ON availability_slots (center_id, donation_type, slot_datetime);

CREATE INDEX IF NOT EXISTS idx_availability_slots_available_date 
ON availability_slots (is_available, slot_datetime) 
WHERE is_available = true;

-- Create a view for easy slot availability queries
CREATE OR REPLACE VIEW available_slots_view AS
SELECT 
  asl.slot_id,
  asl.center_id,
  dc.name as center_name,
  dc.address,
  dc.city,
  dc.country,
  asl.slot_datetime,
  asl.donation_type,
  asl.capacity,
  asl.current_bookings,
  (asl.capacity - asl.current_bookings) as available_spots,
  asl.is_available,
  EXTRACT(DOW FROM asl.slot_datetime) as day_of_week,
  EXTRACT(HOUR FROM asl.slot_datetime) as hour_of_day,
  CASE 
    WHEN EXTRACT(DOW FROM asl.slot_datetime) BETWEEN 1 AND 6 
    AND EXTRACT(HOUR FROM asl.slot_datetime) BETWEEN 7 AND 14 
    THEN true 
    ELSE false 
  END as is_operating_hours
FROM availability_slots asl
JOIN donation_centers dc ON asl.center_id = dc.center_id
WHERE asl.is_available = true 
AND asl.slot_datetime > now()
ORDER BY asl.slot_datetime, dc.name, asl.donation_type;

-- Create a view for center operating hours
CREATE OR REPLACE VIEW center_operating_hours AS
SELECT 
  dc.center_id,
  dc.name,
  dc.city,
  'Monday-Saturday' as operating_days,
  '7:00 AM - 3:00 PM' as operating_hours,
  '60 minutes' as blood_donation_duration,
  '450ml' as blood_collection_amount,
  '60 minutes' as plasma_donation_duration,
  '600-700ml' as plasma_collection_amount
FROM donation_centers dc
WHERE dc.is_active = true
ORDER BY dc.name;

-- Display summary
DO $$
DECLARE
  center_count INTEGER;
  slot_count INTEGER;
  blood_slots INTEGER;
  plasma_slots INTEGER;
BEGIN
  -- Count centers
  SELECT COUNT(*) INTO center_count FROM donation_centers WHERE is_active = true;
  
  -- Count total slots
  SELECT COUNT(*) INTO slot_count FROM availability_slots;
  
  -- Count slots by type
  SELECT COUNT(*) INTO blood_slots FROM availability_slots WHERE donation_type = 'Blood';
  SELECT COUNT(*) INTO plasma_slots FROM availability_slots WHERE donation_type = 'Plasma';
  
  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'AVIS Centers and Slots Setup Complete!';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Centers created: %', center_count;
  RAISE NOTICE 'Total slots generated: %', slot_count;
  RAISE NOTICE 'Blood donation slots: %', blood_slots;
  RAISE NOTICE 'Plasma donation slots: %', plasma_slots;
  RAISE NOTICE 'Operating hours: Monday-Saturday, 7 AM - 3 PM';
  RAISE NOTICE 'Blood donation: 60 minutes, 450ml collection';
  RAISE NOTICE 'Plasma donation: 60 minutes, 600-700ml collection';
  RAISE NOTICE '========================================';
  RAISE NOTICE '';
END $$;

-- Grant necessary permissions
GRANT SELECT ON available_slots_view TO public;
GRANT SELECT ON center_operating_hours TO public;
GRANT EXECUTE ON FUNCTION get_slot_statistics(DATE, DATE) TO public;
GRANT EXECUTE ON FUNCTION generate_availability_slots(DATE, DATE, INTEGER, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION generate_one_year_slots() TO authenticated;
GRANT EXECUTE ON FUNCTION generate_month_slots(INTEGER, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION cleanup_old_slots() TO authenticated;
