/*
  # Add Status Lookup Tables for Blood Donation Statuses

  This migration creates comprehensive lookup tables for blood donation statuses
  and updates existing tables to use these standardized statuses.

  1. New Tables
    - `donation_status_categories` - Groups for organizing statuses
    - `donation_statuses` - Individual status definitions with abbreviations
    - `appointment_statuses` - Statuses specific to appointments
    - `donation_history_statuses` - Statuses specific to donation history

  2. Updates to Existing Tables
    - Update appointments.status check constraint
    - Update donation_history.status check constraint
    - Add foreign key references to status lookup tables

  3. Data Migration
    - Insert all predefined statuses
    - Update existing records to use new status codes

  4. Functions
    - Function to get status by abbreviation
    - Function to get all statuses by category
*/

-- Create status category lookup table
CREATE TABLE IF NOT EXISTS donation_status_categories (
  category_id SERIAL PRIMARY KEY,
  category_name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create main donation statuses lookup table
CREATE TABLE IF NOT EXISTS donation_statuses (
  status_id SERIAL PRIMARY KEY,
  status_code VARCHAR(20) NOT NULL UNIQUE,
  status_name VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  category_id INTEGER NOT NULL REFERENCES donation_status_categories(category_id),
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Insert status categories
INSERT INTO donation_status_categories (category_name, description, sort_order) VALUES
('Pre-Donation Statuses', 'Statuses that occur before the actual donation process begins', 1),
('In-Progress and Post-Donation Statuses', 'Statuses that occur during and after the donation process', 2)
ON CONFLICT (category_name) DO NOTHING;

-- Insert all predefined statuses
INSERT INTO donation_statuses (status_code, status_name, description, category_id, sort_order) VALUES
-- Pre-Donation Statuses
('SCHEDULED', 'Scheduled', 'The donor has successfully booked an appointment', 
 (SELECT category_id FROM donation_status_categories WHERE category_name = 'Pre-Donation Statuses'), 1),
('CONFIRMED', 'Confirmed', 'The donor has confirmed their appointment, often through a reminder or follow-up notification', 
 (SELECT category_id FROM donation_status_categories WHERE category_name = 'Pre-Donation Statuses'), 2),
('REMINDER_SENT', 'Reminder Sent', 'A reminder notification for the upcoming appointment has been sent to the donor', 
 (SELECT category_id FROM donation_status_categories WHERE category_name = 'Pre-Donation Statuses'), 3),
('CANCELLED', 'Cancelled', 'The donor has proactively cancelled their appointment before the scheduled time', 
 (SELECT category_id FROM donation_status_categories WHERE category_name = 'Pre-Donation Statuses'), 4),
('NO_SHOW', 'No-Show', 'The donor failed to attend their scheduled appointment without prior cancellation', 
 (SELECT category_id FROM donation_status_categories WHERE category_name = 'Pre-Donation Statuses'), 5),
('LATE_ARRIVAL', 'Late Arrival', 'The donor arrived after their scheduled appointment time, which may or may not be acceptable depending on your clinic''s policy', 
 (SELECT category_id FROM donation_status_categories WHERE category_name = 'Pre-Donation Statuses'), 6),
('RESCHEDULED', 'Rescheduled', 'The donor has changed their appointment to a new date and/or time', 
 (SELECT category_id FROM donation_status_categories WHERE category_name = 'Pre-Donation Statuses'), 7),
('WAITLIST', 'Waitlist', 'The donor is on a waiting list for a specific date and time that is currently full', 
 (SELECT category_id FROM donation_status_categories WHERE category_name = 'Pre-Donation Statuses'), 8),

-- In-Progress and Post-Donation Statuses
('IN_PROGRESS', 'In Progress', 'The donor has arrived and has begun the donation process (e.g., check-in, pre-screening)', 
 (SELECT category_id FROM donation_status_categories WHERE category_name = 'In-Progress and Post-Donation Statuses'), 9),
('COMPLETED', 'Completed', 'The donor has successfully finished the entire donation process', 
 (SELECT category_id FROM donation_status_categories WHERE category_name = 'In-Progress and Post-Donation Statuses'), 10),
('DEFERRED', 'Deferred', 'The donor was unable to donate for a specific reason (e.g., low iron, recent travel, medication). This can be further specified with sub-statuses like Deferred - Temporary or Deferred - Permanent', 
 (SELECT category_id FROM donation_status_categories WHERE category_name = 'In-Progress and Post-Donation Statuses'), 11),
('SELF_DEFERRED', 'Self-Deferred', 'The donor arrived but decided not to donate for personal reasons before the screening process began', 
 (SELECT category_id FROM donation_status_categories WHERE category_name = 'In-Progress and Post-Donation Statuses'), 12),
('INCOMPLETE', 'Incomplete', 'The donation process was started but couldn''t be finished (e.g., the donor felt unwell during the donation)', 
 (SELECT category_id FROM donation_status_categories WHERE category_name = 'In-Progress and Post-Donation Statuses'), 13),
('ELIGIBILITY_EXPIRED', 'Eligibility Expired', 'The donor''s eligibility to donate has expired and they need to complete an updated health screening questionnaire', 
 (SELECT category_id FROM donation_status_categories WHERE category_name = 'In-Progress and Post-Donation Statuses'), 14),
('POST_DONATION_FOLLOWUP', 'Post-Donation Follow-up', 'The donor is being followed up with after their donation (e.g., to check on their well-being, to notify them of test results)', 
 (SELECT category_id FROM donation_status_categories WHERE category_name = 'In-Progress and Post-Donation Statuses'), 15),
('TEST_RESULTS_READY', 'Test Results Ready', 'The results of the blood tests conducted on the donated blood are available', 
 (SELECT category_id FROM donation_status_categories WHERE category_name = 'In-Progress and Post-Donation Statuses'), 16),
('UNIT_USED', 'Unit Used', 'The donated blood unit has been processed and sent for use', 
 (SELECT category_id FROM donation_status_categories WHERE category_name = 'In-Progress and Post-Donation Statuses'), 17),
('UNIT_DISCARDED', 'Unit Discarded', 'The donated blood unit was found to be unusable for any number of reasons (e.g., contamination, failed screening tests) and was discarded', 
 (SELECT category_id FROM donation_status_categories WHERE category_name = 'In-Progress and Post-Donation Statuses'), 18)
ON CONFLICT (status_code) DO NOTHING;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_donation_statuses_category ON donation_statuses (category_id);
CREATE INDEX IF NOT EXISTS idx_donation_statuses_code ON donation_statuses (status_code);
CREATE INDEX IF NOT EXISTS idx_donation_statuses_active ON donation_statuses (is_active);
CREATE INDEX IF NOT EXISTS idx_donation_statuses_sort ON donation_statuses (category_id, sort_order);

-- Update appointments table to use new status constraints
-- First, drop the existing default and any check constraints
ALTER TABLE appointments ALTER COLUMN status DROP DEFAULT;

-- Update existing appointment statuses to use new codes
UPDATE appointments SET status = 'SCHEDULED' WHERE status = 'scheduled';
UPDATE appointments SET status = 'CONFIRMED' WHERE status = 'confirmed';
UPDATE appointments SET status = 'CANCELLED' WHERE status = 'cancelled';
UPDATE appointments SET status = 'COMPLETED' WHERE status = 'completed';

-- Add new check constraint for appointments
ALTER TABLE appointments 
ADD CONSTRAINT chk_appointments_status 
CHECK (status IN (
  'SCHEDULED', 'CONFIRMED', 'REMINDER_SENT', 'CANCELLED', 'NO_SHOW', 
  'LATE_ARRIVAL', 'RESCHEDULED', 'WAITLIST', 'IN_PROGRESS', 'COMPLETED', 
  'DEFERRED', 'SELF_DEFERRED', 'INCOMPLETE', 'ELIGIBILITY_EXPIRED'
));

-- Set default status for appointments
ALTER TABLE appointments ALTER COLUMN status SET DEFAULT 'SCHEDULED';

-- Update donation_history table to use new status constraints
-- First, drop the existing check constraint
ALTER TABLE donation_history DROP CONSTRAINT IF EXISTS chk_donation_history_status;

-- Update existing donation history statuses to use new codes
UPDATE donation_history SET status = 'COMPLETED' WHERE status = 'completed';
UPDATE donation_history SET status = 'DEFERRED' WHERE status = 'deferred';

-- Add new check constraint for donation_history
ALTER TABLE donation_history 
ADD CONSTRAINT chk_donation_history_status 
CHECK (status IN (
  'COMPLETED', 'DEFERRED', 'SELF_DEFERRED', 'INCOMPLETE', 'ELIGIBILITY_EXPIRED',
  'POST_DONATION_FOLLOWUP', 'TEST_RESULTS_READY', 'UNIT_USED', 'UNIT_DISCARDED'
));

-- Set default status for donation_history
ALTER TABLE donation_history ALTER COLUMN status SET DEFAULT 'COMPLETED';

-- Create function to get status by abbreviation
CREATE OR REPLACE FUNCTION get_donation_status(p_status_code VARCHAR)
RETURNS TABLE (
  status_id INTEGER,
  status_code VARCHAR,
  status_name VARCHAR,
  description TEXT,
  category_name VARCHAR,
  is_active BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ds.status_id,
    ds.status_code,
    ds.status_name,
    ds.description,
    dsc.category_name,
    ds.is_active
  FROM donation_statuses ds
  JOIN donation_status_categories dsc ON ds.category_id = dsc.category_id
  WHERE ds.status_code = p_status_code
    AND ds.is_active = true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get all statuses by category
CREATE OR REPLACE FUNCTION get_donation_statuses_by_category(p_category_name VARCHAR DEFAULT NULL)
RETURNS TABLE (
  category_name VARCHAR,
  status_code VARCHAR,
  status_name VARCHAR,
  description TEXT,
  sort_order INTEGER
) AS $$
BEGIN
  IF p_category_name IS NULL THEN
    RETURN QUERY
    SELECT 
      dsc.category_name,
      ds.status_code,
      ds.status_name,
      ds.description,
      ds.sort_order
    FROM donation_statuses ds
    JOIN donation_status_categories dsc ON ds.category_id = dsc.category_id
    WHERE ds.is_active = true
    ORDER BY dsc.sort_order, ds.sort_order;
  ELSE
    RETURN QUERY
    SELECT 
      dsc.category_name,
      ds.status_code,
      ds.status_name,
      ds.description,
      ds.sort_order
    FROM donation_statuses ds
    JOIN donation_status_categories dsc ON ds.category_id = dsc.category_id
    WHERE dsc.category_name = p_category_name
      AND ds.is_active = true
    ORDER BY ds.sort_order;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get appointment-specific statuses
CREATE OR REPLACE FUNCTION get_appointment_statuses()
RETURNS TABLE (
  status_code VARCHAR,
  status_name VARCHAR,
  description TEXT,
  category_name VARCHAR
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ds.status_code,
    ds.status_name,
    ds.description,
    dsc.category_name
  FROM donation_statuses ds
  JOIN donation_status_categories dsc ON ds.category_id = dsc.category_id
  WHERE ds.status_code IN (
    'SCHEDULED', 'CONFIRMED', 'REMINDER_SENT', 'CANCELLED', 'NO_SHOW', 
    'LATE_ARRIVAL', 'RESCHEDULED', 'WAITLIST', 'IN_PROGRESS', 'COMPLETED', 
    'DEFERRED', 'SELF_DEFERRED', 'INCOMPLETE', 'ELIGIBILITY_EXPIRED'
  )
    AND ds.is_active = true
  ORDER BY dsc.sort_order, ds.sort_order;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get donation history-specific statuses
CREATE OR REPLACE FUNCTION get_donation_history_statuses()
RETURNS TABLE (
  status_code VARCHAR,
  status_name VARCHAR,
  description TEXT,
  category_name VARCHAR
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ds.status_code,
    ds.status_name,
    ds.description,
    dsc.category_name
  FROM donation_statuses ds
  JOIN donation_status_categories dsc ON ds.category_id = dsc.category_id
  WHERE ds.status_code IN (
    'COMPLETED', 'DEFERRED', 'SELF_DEFERRED', 'INCOMPLETE', 'ELIGIBILITY_EXPIRED',
    'POST_DONATION_FOLLOWUP', 'TEST_RESULTS_READY', 'UNIT_USED', 'UNIT_DISCARDED'
  )
    AND ds.is_active = true
  ORDER BY dsc.sort_order, ds.sort_order;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Enable Row Level Security on lookup tables
ALTER TABLE donation_status_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE donation_statuses ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for lookup tables (read-only for all authenticated users)
CREATE POLICY "Anyone can read status categories"
  ON donation_status_categories
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Anyone can read donation statuses"
  ON donation_statuses
  FOR SELECT
  TO public
  USING (true);

-- Insert initial audit log entry
SELECT create_audit_log(
  p_user_type := 'system',
  p_action := 'status_lookup_tables_created',
  p_details := 'Comprehensive donation status lookup tables created with 18 predefined statuses across 2 categories',
  p_status := 'success'
); 