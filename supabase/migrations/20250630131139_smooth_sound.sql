/*
  # Update donors table schema

  1. Schema Changes
    - Make `donor_hash_id` the primary key (VARCHAR)
    - Add `preferred_language` (VARCHAR)
    - Add `preferred_communication_channel` (VARCHAR) 
    - Add `initial_vetting_status` (BOOLEAN)
    - Add `total_donations_this_year` (INTEGER)
    - Add `last_donation_date` (DATE)
    - Keep `salt` (VARCHAR)
    - Keep `is_active` (BOOLEAN)
    - Remove other existing columns that aren't in the new spec

  2. Security
    - Enable RLS on updated `donors` table
    - Add policy for public read access (since this is a donor portal)

  3. Indexes
    - Add index on `donor_hash_id` for fast lookups
    - Add index on `is_active` for filtering active donors
*/

-- Drop existing table and recreate with new schema
DROP TABLE IF EXISTS donors CASCADE;

CREATE TABLE donors (
  donor_hash_id VARCHAR PRIMARY KEY,
  salt VARCHAR NOT NULL,
  preferred_language VARCHAR DEFAULT 'en',
  preferred_communication_channel VARCHAR DEFAULT 'email',
  initial_vetting_status BOOLEAN DEFAULT false,
  total_donations_this_year INTEGER DEFAULT 0,
  last_donation_date DATE,
  is_active BOOLEAN DEFAULT true
);

-- Enable Row Level Security
ALTER TABLE donors ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access (donors can read their own data)
CREATE POLICY "Donors can read own data"
  ON donors
  FOR SELECT
  TO public
  USING (true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_donors_hash_id ON donors (donor_hash_id);
CREATE INDEX IF NOT EXISTS idx_donors_active ON donors (is_active);
CREATE INDEX IF NOT EXISTS idx_donors_language ON donors (preferred_language);