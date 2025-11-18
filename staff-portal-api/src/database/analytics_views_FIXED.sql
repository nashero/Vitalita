/**
 * Materialized Views for Analytics Performance (FIXED)
 * Pre-computed aggregations for fast analytics queries
 * 
 * FIXED: Removed references to non-existent center_type and region columns
 * Uses city and country from donation_centers table instead
 */

-- Daily donation aggregations
CREATE MATERIALIZED VIEW IF NOT EXISTS staff_portal.daily_donation_stats AS
SELECT 
  DATE_TRUNC('day', donation_date) as date,
  donation_center_id,
  COUNT(*) as donation_count,
  COUNT(*) FILTER (WHERE donation_type = 'whole_blood') as whole_blood_count,
  COUNT(*) FILTER (WHERE donation_type = 'plasma') as plasma_count,
  COUNT(DISTINCT donor_hash_id) as unique_donors,
  AVG(donation_volume) as avg_volume,
  SUM(donation_volume) as total_volume
FROM donation_history
GROUP BY DATE_TRUNC('day', donation_date), donation_center_id;

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_daily_donation_stats_date 
ON staff_portal.daily_donation_stats (date DESC);

CREATE INDEX IF NOT EXISTS idx_daily_donation_stats_center 
ON staff_portal.daily_donation_stats (donation_center_id);

-- Monthly donor statistics
CREATE MATERIALIZED VIEW IF NOT EXISTS staff_portal.monthly_donor_stats AS
SELECT 
  DATE_TRUNC('month', last_donation_date) as month,
  avis_donor_center as center_id,
  COUNT(DISTINCT donor_hash_id) FILTER (WHERE is_active = true) as active_donors,
  COUNT(DISTINCT donor_hash_id) FILTER (WHERE last_donation_date >= DATE_TRUNC('month', last_donation_date)) as new_donors,
  AVG(total_donations_this_year) as avg_donations_per_donor,
  COUNT(DISTINCT donor_hash_id) FILTER (WHERE last_donation_date >= NOW() - INTERVAL '90 days') as eligible_donors
FROM donors
WHERE last_donation_date IS NOT NULL
GROUP BY DATE_TRUNC('month', last_donation_date), avis_donor_center;

CREATE INDEX IF NOT EXISTS idx_monthly_donor_stats_month 
ON staff_portal.monthly_donor_stats (month DESC);

-- Center performance aggregations (FIXED: uses city/country instead of center_type/region)
CREATE MATERIALIZED VIEW IF NOT EXISTS staff_portal.center_performance_stats AS
SELECT 
  dc.center_id,
  dc.name as center_name,
  dc.city,
  dc.country,
  COUNT(DISTINCT dh.donation_id) as total_donations,
  COUNT(DISTINCT dh.donor_hash_id) as unique_donors,
  COUNT(DISTINCT a.appointment_id) FILTER (WHERE a.status = 'completed') as completed_appointments,
  COUNT(DISTINCT a.appointment_id) FILTER (WHERE a.status = 'no-show') as no_shows,
  CASE 
    WHEN COUNT(DISTINCT a.appointment_id) > 0
    THEN (COUNT(DISTINCT a.appointment_id) FILTER (WHERE a.status = 'completed')::float / 
          COUNT(DISTINCT a.appointment_id)::float * 100)
    ELSE 0
  END as success_rate,
  AVG(dh.donation_volume) as avg_donation_volume,
  DATE_TRUNC('month', CURRENT_DATE) as period
FROM donation_centers dc
LEFT JOIN donation_history dh ON dc.center_id = dh.donation_center_id
  AND dh.donation_date >= DATE_TRUNC('month', CURRENT_DATE)
LEFT JOIN appointments a ON dc.center_id = a.donation_center_id
  AND a.appointment_datetime >= DATE_TRUNC('month', CURRENT_DATE)
GROUP BY dc.center_id, dc.name, dc.city, dc.country;

CREATE INDEX IF NOT EXISTS idx_center_performance_center 
ON staff_portal.center_performance_stats (center_id);

-- Staff productivity aggregations
CREATE MATERIALIZED VIEW IF NOT EXISTS staff_portal.staff_productivity_stats AS
SELECT 
  u.user_id,
  u.first_name,
  u.last_name,
  u.avis_center_id,
  COUNT(DISTINCT dh.donation_id) as donations_processed,
  COUNT(DISTINCT a.appointment_id) FILTER (WHERE a.status = 'completed') as appointments_completed,
  DATE_TRUNC('month', CURRENT_DATE) as period
FROM staff_portal.users u
LEFT JOIN donation_history dh ON u.user_id = dh.staff_id
  AND dh.donation_date >= DATE_TRUNC('month', CURRENT_DATE)
LEFT JOIN appointments a ON u.user_id = a.staff_id
  AND a.appointment_datetime >= DATE_TRUNC('month', CURRENT_DATE)
WHERE u.is_active = true
GROUP BY u.user_id, u.first_name, u.last_name, u.avis_center_id;

CREATE INDEX IF NOT EXISTS idx_staff_productivity_user 
ON staff_portal.staff_productivity_stats (user_id);

-- Function to refresh all materialized views
CREATE OR REPLACE FUNCTION staff_portal.refresh_analytics_views()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY staff_portal.daily_donation_stats;
  REFRESH MATERIALIZED VIEW CONCURRENTLY staff_portal.monthly_donor_stats;
  REFRESH MATERIALIZED VIEW CONCURRENTLY staff_portal.center_performance_stats;
  REFRESH MATERIALIZED VIEW CONCURRENTLY staff_portal.staff_productivity_stats;
END;
$$ LANGUAGE plpgsql;

-- Create indexes on base tables for analytics queries
CREATE INDEX IF NOT EXISTS idx_donation_history_date_center 
ON donation_history (donation_date DESC, donation_center_id);

CREATE INDEX IF NOT EXISTS idx_donation_history_type_date 
ON donation_history (donation_type, donation_date DESC);

CREATE INDEX IF NOT EXISTS idx_appointments_datetime_status 
ON appointments (appointment_datetime DESC, status);

CREATE INDEX IF NOT EXISTS idx_donors_last_donation_active 
ON donors (last_donation_date DESC, is_active) 
WHERE last_donation_date IS NOT NULL;

-- Comments
COMMENT ON MATERIALIZED VIEW staff_portal.daily_donation_stats IS 
  'Pre-computed daily donation statistics for fast analytics queries';

COMMENT ON MATERIALIZED VIEW staff_portal.monthly_donor_stats IS 
  'Pre-computed monthly donor statistics for analytics';

COMMENT ON MATERIALIZED VIEW staff_portal.center_performance_stats IS 
  'Pre-computed center performance metrics';

COMMENT ON MATERIALIZED VIEW staff_portal.staff_productivity_stats IS 
  'Pre-computed staff productivity metrics';

