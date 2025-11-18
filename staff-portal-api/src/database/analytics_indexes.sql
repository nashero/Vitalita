/**
 * Additional Indexes for Analytics Performance
 * 
 * These indexes optimize common analytics query patterns
 */

-- Donation history indexes for time-based queries
CREATE INDEX IF NOT EXISTS idx_donation_history_date_type 
ON donation_history (donation_date DESC, donation_type);

CREATE INDEX IF NOT EXISTS idx_donation_history_donor_date 
ON donation_history (donor_hash_id, donation_date DESC);

-- Appointment indexes for operational analytics
CREATE INDEX IF NOT EXISTS idx_appointments_center_datetime 
ON appointments (donation_center_id, appointment_datetime DESC);

CREATE INDEX IF NOT EXISTS idx_appointments_status_datetime 
ON appointments (status, appointment_datetime DESC);

-- Donor indexes for demographic analytics
CREATE INDEX IF NOT EXISTS idx_donors_center_active 
ON donors (avis_donor_center, is_active, last_donation_date DESC);

-- Composite index for center performance queries
CREATE INDEX IF NOT EXISTS idx_donation_history_center_date_volume 
ON donation_history (donation_center_id, donation_date DESC, donation_volume);

-- Partial index for active donors only
CREATE INDEX IF NOT EXISTS idx_donors_active_last_donation 
ON donors (last_donation_date DESC) 
WHERE is_active = true AND last_donation_date IS NOT NULL;

-- Index for staff productivity queries
CREATE INDEX IF NOT EXISTS idx_donation_history_staff_date 
ON donation_history (staff_id, donation_date DESC) 
WHERE staff_id IS NOT NULL;

-- Comments
COMMENT ON INDEX idx_donation_history_date_type IS 
  'Optimizes queries filtering by date and donation type';

COMMENT ON INDEX idx_appointments_center_datetime IS 
  'Optimizes center-specific appointment queries';

COMMENT ON INDEX idx_donors_center_active IS 
  'Optimizes center-based donor statistics queries';

