/*
  # Create donation_centers table

  1. New Tables
    - `donation_centers`
      - `center_id` (uuid, primary key) - Unique identifier for each donation center
      - `name` (varchar) - Name of the donation center
      - `address` (text) - Full street address of the center
      - `city` (varchar) - City where the center is located
      - `country` (varchar) - Country where the center is located
      - `contact_phone` (varchar) - Primary contact phone number
      - `email` (varchar) - Contact email address
      - `is_active` (boolean, default: true) - Whether the center is currently operational
      - `created_at` (timestamptz) - Record creation timestamp
      - `updated_at` (timestamptz) - Last update timestamp

  2. Security
    - Enable RLS on `donation_centers` table
    - Add policy for public read access to active centers
    - Add policy for authenticated users to read all centers

  3. Performance
    - Index on `is_active` for filtering active centers
    - Index on `city` and `country` for location-based queries
    - Index on `name` for search functionality
    - Composite index on `city, country` for geographic queries

  4. Data Integrity
    - Unique constraint on email to prevent duplicates
    - Auto-update timestamp trigger for `updated_at`
    - Default values for boolean and timestamp fields
*/

-- Create donation_centers table
CREATE TABLE IF NOT EXISTS donation_centers (
  center_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name varchar(255) NOT NULL,
  address text NOT NULL,
  city varchar(100) NOT NULL,
  country varchar(100) NOT NULL,
  contact_phone varchar(20),
  email varchar(255),
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add unique constraint on email
ALTER TABLE donation_centers ADD CONSTRAINT donation_centers_email_key UNIQUE (email);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_donation_centers_active ON donation_centers (is_active);
CREATE INDEX IF NOT EXISTS idx_donation_centers_city ON donation_centers (city);
CREATE INDEX IF NOT EXISTS idx_donation_centers_country ON donation_centers (country);
CREATE INDEX IF NOT EXISTS idx_donation_centers_name ON donation_centers (name);
CREATE INDEX IF NOT EXISTS idx_donation_centers_location ON donation_centers (city, country);

-- Enable Row Level Security
ALTER TABLE donation_centers ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Public can read active donation centers"
  ON donation_centers
  FOR SELECT
  TO public
  USING (is_active = true);

CREATE POLICY "Authenticated users can read all donation centers"
  ON donation_centers
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can manage donation centers"
  ON donation_centers
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create trigger function for updating updated_at timestamp
CREATE OR REPLACE FUNCTION update_donation_centers_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
CREATE TRIGGER trigger_update_donation_centers_updated_at
  BEFORE UPDATE ON donation_centers
  FOR EACH ROW
  EXECUTE FUNCTION update_donation_centers_updated_at();

-- Now add the foreign key constraint to appointments table
ALTER TABLE appointments 
ADD CONSTRAINT fk_appointments_donation_center 
FOREIGN KEY (donation_center_id) REFERENCES donation_centers(center_id) ON DELETE RESTRICT;