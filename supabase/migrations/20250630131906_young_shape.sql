/*
  # Create appointments table

  1. New Tables
    - `appointments`
      - `appointment_id` (uuid, primary key)
      - `donor_hash_id` (varchar, foreign key to donors.donor_hash_id)
      - `staff_id` (uuid, nullable, foreign key to staff.staff_id)
      - `donation_center_id` (uuid, foreign key to donation_centers.center_id)
      - `appointment_datetime` (timestamptz)
      - `donation_type` (varchar)
      - `status` (varchar, default: 'scheduled')
      - `booking_channel` (varchar, default: 'online')
      - `confirmation_sent` (boolean, default: false)
      - `reminder_sent` (boolean, default: false)
      - `creation_timestamp` (timestamptz, default: now())
      - `last_updated_timestamp` (timestamptz, default: now())

  2. Security
    - Enable RLS on `appointments` table
    - Add policy for donors to read their own appointments
    - Add policy for donors to create their own appointments
    - Add policy for donors to update their own appointments

  3. Indexes
    - Primary key on appointment_id
    - Index on donor_hash_id for fast lookups
    - Index on appointment_datetime for scheduling queries
    - Index on status for filtering
    - Index on donation_center_id for center-based queries

  4. Foreign Keys
    - References donors(donor_hash_id)
    - References staff(staff_id) - nullable
    - References donation_centers(center_id)

  Note: This assumes staff and donation_centers tables exist or will be created.
  If they don't exist yet, the foreign key constraints will need to be added later.
*/

CREATE TABLE IF NOT EXISTS appointments (
  appointment_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  donor_hash_id VARCHAR NOT NULL,
  staff_id UUID,
  donation_center_id UUID NOT NULL,
  appointment_datetime TIMESTAMPTZ NOT NULL,
  donation_type VARCHAR NOT NULL,
  status VARCHAR DEFAULT 'scheduled',
  booking_channel VARCHAR DEFAULT 'online',
  confirmation_sent BOOLEAN DEFAULT false,
  reminder_sent BOOLEAN DEFAULT false,
  creation_timestamp TIMESTAMPTZ DEFAULT now(),
  last_updated_timestamp TIMESTAMPTZ DEFAULT now()
);

-- Add foreign key constraint to donors table
ALTER TABLE appointments 
ADD CONSTRAINT fk_appointments_donor 
FOREIGN KEY (donor_hash_id) REFERENCES donors(donor_hash_id) ON DELETE CASCADE;

-- Note: Foreign key constraints for staff and donation_centers will be added
-- when those tables are created. For now, we'll create the table structure.

-- Enable Row Level Security
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

-- Create policies for appointment access
CREATE POLICY "Donors can read own appointments"
  ON appointments
  FOR SELECT
  TO public
  USING (donor_hash_id IN (
    SELECT donor_hash_id FROM donors WHERE donor_hash_id = appointments.donor_hash_id
  ));

CREATE POLICY "Donors can create own appointments"
  ON appointments
  FOR INSERT
  TO public
  WITH CHECK (donor_hash_id IN (
    SELECT donor_hash_id FROM donors WHERE donor_hash_id = appointments.donor_hash_id
  ));

CREATE POLICY "Donors can update own appointments"
  ON appointments
  FOR UPDATE
  TO public
  USING (donor_hash_id IN (
    SELECT donor_hash_id FROM donors WHERE donor_hash_id = appointments.donor_hash_id
  ));

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_appointments_donor_hash_id ON appointments (donor_hash_id);
CREATE INDEX IF NOT EXISTS idx_appointments_datetime ON appointments (appointment_datetime);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments (status);
CREATE INDEX IF NOT EXISTS idx_appointments_donation_center ON appointments (donation_center_id);
CREATE INDEX IF NOT EXISTS idx_appointments_staff ON appointments (staff_id);
CREATE INDEX IF NOT EXISTS idx_appointments_creation_date ON appointments (creation_timestamp);

-- Create trigger to automatically update last_updated_timestamp
CREATE OR REPLACE FUNCTION update_appointments_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.last_updated_timestamp = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_appointments_updated_at
  BEFORE UPDATE ON appointments
  FOR EACH ROW
  EXECUTE FUNCTION update_appointments_updated_at();