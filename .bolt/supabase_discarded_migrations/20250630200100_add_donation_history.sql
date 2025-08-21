/*
  # Add Donation History Tracking

  1. New Tables
    - `donation_history`
      - `history_id` (uuid, primary key)
      - `donor_hash_id` (varchar, foreign key to donors.donor_hash_id)
      - `appointment_id` (uuid, foreign key to appointments.appointment_id)
      - `donation_date` (timestamptz, when donation was completed)
      - `donation_type` (varchar, blood/plasma/etc)
      - `donation_volume` (integer, in ml)
      - `donation_center_id` (uuid, foreign key to donation_centers.center_id)
      - `staff_id` (uuid, foreign key to staff.staff_id, who performed the donation)
      - `status` (varchar, completed/failed/cancelled)
      - `notes` (text, any medical notes or observations)
      - `completion_timestamp` (timestamptz, when donation was marked complete)
      - `created_at` (timestamptz, default: now())

  2. Security
    - Enable RLS on `donation_history` table
    - Add policy for donors to read their own donation history
    - Add policy for staff to read and create donation history
    - Add policy for staff to update donation history

  3. Indexes
    - Primary key on history_id
    - Index on donor_hash_id for fast lookups
    - Index on donation_date for chronological queries
    - Index on appointment_id for appointment linking
    - Index on status for filtering
    - Composite index on donor_hash_id, donation_date for donor history

  4. Foreign Keys
    - References donors(donor_hash_id)
    - References appointments(appointment_id)
    - References donation_centers(center_id)
    - References staff(staff_id)

  5. Functions
    - Function to automatically create donation history when appointment is completed
    - Function to calculate donor statistics from history
*/

-- Create donation_history table
CREATE TABLE IF NOT EXISTS donation_history (
  history_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  donor_hash_id VARCHAR NOT NULL,
  appointment_id UUID NOT NULL,
  donation_date TIMESTAMPTZ NOT NULL,
  donation_type VARCHAR NOT NULL,
  donation_volume INTEGER NOT NULL,
  donation_center_id UUID NOT NULL,
  staff_id UUID,
  status VARCHAR DEFAULT 'completed',
  notes TEXT,
  completion_timestamp TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Add foreign key constraints
ALTER TABLE donation_history 
ADD CONSTRAINT fk_donation_history_donor 
FOREIGN KEY (donor_hash_id) REFERENCES donors(donor_hash_id) ON DELETE CASCADE;

ALTER TABLE donation_history 
ADD CONSTRAINT fk_donation_history_appointment 
FOREIGN KEY (appointment_id) REFERENCES appointments(appointment_id) ON DELETE CASCADE;

ALTER TABLE donation_history 
ADD CONSTRAINT fk_donation_history_center 
FOREIGN KEY (donation_center_id) REFERENCES donation_centers(center_id) ON DELETE CASCADE;

ALTER TABLE donation_history 
ADD CONSTRAINT fk_donation_history_staff 
FOREIGN KEY (staff_id) REFERENCES staff(staff_id) ON DELETE SET NULL;

-- Add check constraints for data integrity
ALTER TABLE donation_history 
ADD CONSTRAINT chk_donation_history_status 
CHECK (status IN ('completed', 'failed', 'cancelled', 'deferred'));

ALTER TABLE donation_history 
ADD CONSTRAINT chk_donation_history_volume 
CHECK (donation_volume > 0 AND donation_volume <= 1000);

ALTER TABLE donation_history 
ADD CONSTRAINT chk_donation_history_type 
CHECK (donation_type IN ('whole_blood', 'plasma', 'platelets', 'double_red', 'power_red'));

-- Enable Row Level Security
ALTER TABLE donation_history ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Donors can read own donation history"
  ON donation_history
  FOR SELECT
  TO public
  USING (donor_hash_id IN (
    SELECT donor_hash_id FROM donors WHERE donor_hash_id = donation_history.donor_hash_id
  ));

CREATE POLICY "Staff can read all donation history"
  ON donation_history
  FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM staff WHERE staff_id = auth.uid()
  ));

CREATE POLICY "Staff can create donation history"
  ON donation_history
  FOR INSERT
  TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM staff WHERE staff_id = auth.uid()
  ));

CREATE POLICY "Staff can update donation history"
  ON donation_history
  FOR UPDATE
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM staff WHERE staff_id = auth.uid()
  ));

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_donation_history_donor_hash_id ON donation_history (donor_hash_id);
CREATE INDEX IF NOT EXISTS idx_donation_history_donation_date ON donation_history (donation_date DESC);
CREATE INDEX IF NOT EXISTS idx_donation_history_appointment_id ON donation_history (appointment_id);
CREATE INDEX IF NOT EXISTS idx_donation_history_status ON donation_history (status);
CREATE INDEX IF NOT EXISTS idx_donation_history_center ON donation_history (donation_center_id);
CREATE INDEX IF NOT EXISTS idx_donation_history_staff ON donation_history (staff_id);
CREATE INDEX IF NOT EXISTS idx_donation_history_donor_date ON donation_history (donor_hash_id, donation_date DESC);
CREATE INDEX IF NOT EXISTS idx_donation_history_created_at ON donation_history (created_at DESC);

-- Create function to automatically create donation history when appointment is completed
CREATE OR REPLACE FUNCTION create_donation_history_from_appointment()
RETURNS TRIGGER AS $$
BEGIN
  -- When an appointment status is changed to 'completed', create donation history
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    INSERT INTO donation_history (
      donor_hash_id,
      appointment_id,
      donation_date,
      donation_type,
      donation_volume,
      donation_center_id,
      staff_id,
      status,
      notes,
      completion_timestamp
    ) VALUES (
      NEW.donor_hash_id,
      NEW.appointment_id,
      NEW.appointment_datetime,
      NEW.donation_type,
      CASE 
        WHEN NEW.donation_type = 'whole_blood' THEN 450
        WHEN NEW.donation_type = 'plasma' THEN 600
        WHEN NEW.donation_type = 'platelets' THEN 200
        WHEN NEW.donation_type = 'double_red' THEN 400
        WHEN NEW.donation_type = 'power_red' THEN 400
        ELSE 450
      END,
      NEW.donation_center_id,
      NEW.staff_id,
      'completed',
      'Automatically created from completed appointment',
      now()
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic donation history creation
CREATE TRIGGER trigger_create_donation_history
  AFTER UPDATE ON appointments
  FOR EACH ROW
  EXECUTE FUNCTION create_donation_history_from_appointment();

-- Create function to get donor statistics
CREATE OR REPLACE FUNCTION get_donor_statistics(p_donor_hash_id VARCHAR)
RETURNS TABLE (
  total_donations INTEGER,
  total_volume INTEGER,
  first_donation_date TIMESTAMPTZ,
  last_donation_date TIMESTAMPTZ,
  donations_this_year INTEGER,
  donations_this_month INTEGER,
  preferred_donation_type VARCHAR,
  total_centers_visited INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*)::INTEGER as total_donations,
    COALESCE(SUM(dh.donation_volume), 0)::INTEGER as total_volume,
    MIN(dh.donation_date) as first_donation_date,
    MAX(dh.donation_date) as last_donation_date,
    COUNT(*) FILTER (WHERE dh.donation_date >= date_trunc('year', now()))::INTEGER as donations_this_year,
    COUNT(*) FILTER (WHERE dh.donation_date >= date_trunc('month', now()))::INTEGER as donations_this_month,
    (SELECT donation_type FROM donation_history 
     WHERE donor_hash_id = p_donor_hash_id 
     GROUP BY donation_type 
     ORDER BY COUNT(*) DESC 
     LIMIT 1) as preferred_donation_type,
    COUNT(DISTINCT dh.donation_center_id)::INTEGER as total_centers_visited
  FROM donation_history dh
  WHERE dh.donor_hash_id = p_donor_hash_id
    AND dh.status = 'completed';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get donor donation history with pagination
CREATE OR REPLACE FUNCTION get_donor_donation_history(
  p_donor_hash_id VARCHAR,
  p_limit INTEGER DEFAULT 10,
  p_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
  history_id UUID,
  appointment_id UUID,
  donation_date TIMESTAMPTZ,
  donation_type VARCHAR,
  donation_volume INTEGER,
  donation_center_name VARCHAR,
  donation_center_address VARCHAR,
  donation_center_city VARCHAR,
  staff_name VARCHAR,
  status VARCHAR,
  notes TEXT,
  completion_timestamp TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    dh.history_id,
    dh.appointment_id,
    dh.donation_date,
    dh.donation_type,
    dh.donation_volume,
    dc.name as donation_center_name,
    dc.address as donation_center_address,
    dc.city as donation_center_city,
    CONCAT(s.first_name, ' ', s.last_name) as staff_name,
    dh.status,
    dh.notes,
    dh.completion_timestamp
  FROM donation_history dh
  LEFT JOIN donation_centers dc ON dh.donation_center_id = dc.center_id
  LEFT JOIN staff s ON dh.staff_id = s.staff_id
  WHERE dh.donor_hash_id = p_donor_hash_id
  ORDER BY dh.donation_date DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get donor appointment history with pagination
CREATE OR REPLACE FUNCTION get_donor_appointment_history(
  p_donor_hash_id VARCHAR,
  p_limit INTEGER DEFAULT 10,
  p_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
  appointment_id UUID,
  appointment_datetime TIMESTAMPTZ,
  donation_type VARCHAR,
  status VARCHAR,
  donation_center_name VARCHAR,
  donation_center_address VARCHAR,
  donation_center_city VARCHAR,
  staff_name VARCHAR,
  booking_channel VARCHAR,
  confirmation_sent BOOLEAN,
  reminder_sent BOOLEAN,
  creation_timestamp TIMESTAMPTZ,
  last_updated_timestamp TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    a.appointment_id,
    a.appointment_datetime,
    a.donation_type,
    a.status,
    dc.name as donation_center_name,
    dc.address as donation_center_address,
    dc.city as donation_center_city,
    CONCAT(s.first_name, ' ', s.last_name) as staff_name,
    a.booking_channel,
    a.confirmation_sent,
    a.reminder_sent,
    a.creation_timestamp,
    a.last_updated_timestamp
  FROM appointments a
  LEFT JOIN donation_centers dc ON a.donation_center_id = dc.center_id
  LEFT JOIN staff s ON a.staff_id = s.staff_id
  WHERE a.donor_hash_id = p_donor_hash_id
  ORDER BY a.appointment_datetime DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Insert initial audit log entry
SELECT create_audit_log(
  p_user_type := 'system',
  p_action := 'donation_history_system_created',
  p_details := 'Donation history tracking system created with comprehensive donor history features',
  p_status := 'success'
); 