-- Update Related Tables for Donor Seed Data
-- This script updates all necessary tables to ensure the donor can schedule appointments

-- 1. Update availability_slots to ensure proper capacity and availability
UPDATE availability_slots 
SET current_bookings = LEAST(current_bookings, capacity - 1),
    is_available = (current_bookings < capacity) AND (slot_datetime > now())
WHERE center_id IN (
  SELECT center_id FROM donation_centers 
  WHERE name = 'AVIS Casalmaggiore'
);

-- 2. Ensure all donation centers are active
UPDATE donation_centers 
SET is_active = true 
WHERE name = 'AVIS Casalmaggiore';

-- 3. Update donor preferences if needed
UPDATE donors 
SET preferred_language = 'en',
    preferred_communication_channel = 'email',
    initial_vetting_status = true,
    is_active = true,
    email_verified = true,
    account_activated = true
WHERE avis_donor_center = 'AVIS Casalmaggiore'
  AND email = 'alessandro.moretti@example.com';

-- 4. Create additional availability slots if needed
INSERT INTO availability_slots (center_id, slot_datetime, donation_type, capacity, current_bookings, is_available)
SELECT 
  dc.center_id,
  generate_series(
    now() + interval '1 day',
    now() + interval '30 days',
    interval '1 day'
  )::timestamp + interval '9 hours' as slot_datetime,
  dt.donation_type,
  8 as capacity,
  0 as current_bookings,
  true as is_available
FROM donation_centers dc
CROSS JOIN (VALUES ('Blood'), ('Plasma')) as dt(donation_type)
WHERE dc.name = 'AVIS Casalmaggiore'
  AND NOT EXISTS (
    SELECT 1 FROM availability_slots as2 
    WHERE as2.center_id = dc.center_id 
      AND as2.donation_type = dt.donation_type
      AND as2.slot_datetime::date = (generate_series(
        now() + interval '1 day',
        now() + interval '30 days',
        interval '1 day'
      )::timestamp + interval '9 hours')::date
  );

-- 5. Create additional time slots (12 PM and 3 PM) for existing dates
INSERT INTO availability_slots (center_id, slot_datetime, donation_type, capacity, current_bookings, is_available)
SELECT 
  dc.center_id,
  (slot_date + interval '12 hours') as slot_datetime,
  dt.donation_type,
  8 as capacity,
  0 as current_bookings,
  true as is_available
FROM donation_centers dc
CROSS JOIN (VALUES ('Blood'), ('Plasma')) as dt(donation_type)
CROSS JOIN (
  SELECT DISTINCT slot_datetime::date as slot_date
  FROM availability_slots as2
  JOIN donation_centers dc2 ON as2.center_id = dc2.center_id
  WHERE dc2.name = 'AVIS Casalmaggiore'
    AND as2.slot_datetime > now()
) existing_slots
WHERE dc.name = 'AVIS Casalmaggiore'
  AND NOT EXISTS (
    SELECT 1 FROM availability_slots as3
    WHERE as3.center_id = dc.center_id
      AND as3.donation_type = dt.donation_type
      AND as3.slot_datetime::date = slot_date
      AND as3.slot_datetime::time = '12:00:00'
  );

INSERT INTO availability_slots (center_id, slot_datetime, donation_type, capacity, current_bookings, is_available)
SELECT 
  dc.center_id,
  (slot_date + interval '15 hours') as slot_datetime,
  dt.donation_type,
  8 as capacity,
  0 as current_bookings,
  true as is_available
FROM donation_centers dc
CROSS JOIN (VALUES ('Blood'), ('Plasma')) as dt(donation_type)
CROSS JOIN (
  SELECT DISTINCT slot_datetime::date as slot_date
  FROM availability_slots as2
  JOIN donation_centers dc2 ON as2.center_id = dc2.center_id
  WHERE dc2.name = 'AVIS Casalmaggiore'
    AND as2.slot_datetime > now()
) existing_slots
WHERE dc.name = 'AVIS Casalmaggiore'
  AND NOT EXISTS (
    SELECT 1 FROM availability_slots as3
    WHERE as3.center_id = dc.center_id
      AND as3.donation_type = dt.donation_type
      AND as3.slot_datetime::date = slot_date
      AND as3.slot_datetime::time = '15:00:00'
  );

-- 6. Update audit logs to track the updates
INSERT INTO audit_logs (user_id, user_type, action, details, resource_type, resource_id, status)
VALUES 
  ('system', 'system', 'update_related_tables', 'Updated availability slots and donor preferences for seed data', 'availability_slots', NULL, 'success'),
  ('system', 'system', 'update_related_tables', 'Ensured donation center is active for seed donor', 'donation_centers', NULL, 'success'),
  ('system', 'system', 'update_related_tables', 'Updated donor preferences and verification status', 'donors', NULL, 'success');

-- 7. Verify the updates
SELECT 
  'Donation Centers' as table_name,
  COUNT(*) as record_count,
  COUNT(CASE WHEN is_active = true THEN 1 END) as active_count
FROM donation_centers
WHERE name = 'AVIS Casalmaggiore'

UNION ALL

SELECT 
  'Availability Slots' as table_name,
  COUNT(*) as record_count,
  COUNT(CASE WHEN is_available = true THEN 1 END) as available_count
FROM availability_slots as2
JOIN donation_centers dc ON as2.center_id = dc.center_id
WHERE dc.name = 'AVIS Casalmaggiore'
  AND as2.slot_datetime > now()

UNION ALL

SELECT 
  'Donors' as table_name,
  COUNT(*) as record_count,
  COUNT(CASE WHEN is_active = true AND email_verified = true THEN 1 END) as active_verified_count
FROM donors
WHERE avis_donor_center = 'AVIS Casalmaggiore'
  AND email = 'alessandro.moretti@example.com';

-- 8. Display summary of available slots for the next 7 days
SELECT 
  slot_datetime::date as date,
  donation_type,
  COUNT(*) as total_slots,
  COUNT(CASE WHEN is_available = true THEN 1 END) as available_slots,
  COUNT(CASE WHEN current_bookings > 0 THEN 1 END) as booked_slots
FROM availability_slots as2
JOIN donation_centers dc ON as2.center_id = dc.center_id
WHERE dc.name = 'AVIS Casalmaggiore'
  AND as2.slot_datetime BETWEEN now() AND now() + interval '7 days'
GROUP BY slot_datetime::date, donation_type
ORDER BY date, donation_type; 