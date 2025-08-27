/*
  # Create availability_slots table

  1. New Tables
    - `availability_slots`
      - `slot_id` (uuid, primary key)
      - `center_id` (uuid, foreign key to donation_centers)
      - `slot_datetime` (timestamptz)
      - `donation_type` (varchar)
      - `capacity` (integer)
      - `current_bookings` (integer, default 0)
      - `is_available` (boolean, default true)
      - `created_at` (timestamptz, default now())
      - `updated_at` (timestamptz, default now())

  2. Security
    - Enable RLS on `availability_slots` table
    - Add policy for public users to read available slots
    - Add policy for authenticated users to manage slots

  3. Performance
    - Index on center_id for filtering by donation center
    - Index on slot_datetime for time-based queries
    - Index on donation_type for filtering by donation type
    - Index on is_available for filtering available slots
    - Composite index on center_id, slot_datetime for efficient scheduling queries

  4. Data Integrity
    - Foreign key constraint to donation_centers
    - Check constraint to ensure current_bookings <= capacity
    - Check constraint to ensure capacity > 0
    - Unique constraint to prevent duplicate slots (center_id, slot_datetime, donation_type)
    - Automatic timestamp management with triggers
*/

-- Create availability_slots table
CREATE TABLE IF NOT EXISTS availability_slots (
  slot_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  center_id uuid NOT NULL,
  slot_datetime timestamptz NOT NULL,
  donation_type varchar(50) NOT NULL,
  capacity integer NOT NULL,
  current_bookings integer DEFAULT 0,
  is_available boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add foreign key constraint
ALTER TABLE availability_slots 
ADD CONSTRAINT fk_availability_slots_center 
FOREIGN KEY (center_id) REFERENCES donation_centers(center_id) ON DELETE CASCADE;

-- Add check constraints for data integrity
ALTER TABLE availability_slots 
ADD CONSTRAINT chk_availability_slots_capacity_positive 
CHECK (capacity > 0);

ALTER TABLE availability_slots 
ADD CONSTRAINT chk_availability_slots_bookings_valid 
CHECK (current_bookings >= 0 AND current_bookings <= capacity);

-- Add unique constraint to prevent duplicate slots
ALTER TABLE availability_slots 
ADD CONSTRAINT uk_availability_slots_unique 
UNIQUE (center_id, slot_datetime, donation_type);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_availability_slots_center ON availability_slots (center_id);
CREATE INDEX IF NOT EXISTS idx_availability_slots_datetime ON availability_slots (slot_datetime);
CREATE INDEX IF NOT EXISTS idx_availability_slots_donation_type ON availability_slots (donation_type);
CREATE INDEX IF NOT EXISTS idx_availability_slots_available ON availability_slots (is_available);
CREATE INDEX IF NOT EXISTS idx_availability_slots_center_datetime ON availability_slots (center_id, slot_datetime);
CREATE INDEX IF NOT EXISTS idx_availability_slots_center_type ON availability_slots (center_id, donation_type);

-- Enable Row Level Security
ALTER TABLE availability_slots ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Public can read available slots"
  ON availability_slots
  FOR SELECT
  TO public
  USING (is_available = true);

CREATE POLICY "Authenticated users can read all slots"
  ON availability_slots
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can manage slots"
  ON availability_slots
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create trigger function for updating updated_at timestamp
CREATE OR REPLACE FUNCTION update_availability_slots_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
CREATE TRIGGER trigger_update_availability_slots_updated_at
  BEFORE UPDATE ON availability_slots
  FOR EACH ROW
  EXECUTE FUNCTION update_availability_slots_updated_at();

-- Create function to automatically update is_available based on capacity
CREATE OR REPLACE FUNCTION update_slot_availability()
RETURNS TRIGGER AS $$
BEGIN
  -- Update is_available based on current_bookings vs capacity
  -- Removed date restriction to allow future slots to be marked as available
  NEW.is_available = (NEW.current_bookings < NEW.capacity);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update availability
CREATE TRIGGER trigger_update_slot_availability
  BEFORE INSERT OR UPDATE ON availability_slots
  FOR EACH ROW
  EXECUTE FUNCTION update_slot_availability();