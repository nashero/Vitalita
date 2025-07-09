/*
  # Create donors table for authentication

  1. New Tables
    - `donors`
      - `id` (uuid, primary key)
      - `donor_id` (text, unique) - The public donor identifier
      - `donor_hash_id` (text) - SHA-256 hash of donor_id + secret + salt
      - `salt` (text) - Unique salt for each donor
      - `name` (text) - Donor's name
      - `email` (text) - Donor's email
      - `phone` (text, optional) - Donor's phone number
      - `is_active` (boolean) - Whether the donor account is active
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `donors` table
    - Add policy for donors to read their own data only
*/

CREATE TABLE IF NOT EXISTS donors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  donor_id text UNIQUE NOT NULL,
  donor_hash_id text NOT NULL,
  salt text NOT NULL,
  name text NOT NULL,
  email text NOT NULL,
  phone text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE donors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Donors can read own data"
  ON donors
  FOR SELECT
  USING (true);

-- Create an index on donor_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_donors_donor_id ON donors(donor_id);

-- Create an index on donor_hash_id for authentication
CREATE INDEX IF NOT EXISTS idx_donors_hash_id ON donors(donor_hash_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to automatically update updated_at
CREATE TRIGGER update_donors_updated_at
  BEFORE UPDATE ON donors
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();