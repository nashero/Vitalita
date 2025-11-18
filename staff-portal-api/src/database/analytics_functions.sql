/**
 * Analytics Helper Functions
 * Reusable functions for complex analytics calculations
 */

/**
 * Calculate donor retention rate
 */
CREATE OR REPLACE FUNCTION staff_portal.calculate_retention_rate(
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  center_id UUID DEFAULT NULL
)
RETURNS TABLE (
  total_donors BIGINT,
  repeat_donors BIGINT,
  retention_rate NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(DISTINCT dh.donor_hash_id) as total_donors,
    COUNT(DISTINCT dh.donor_hash_id) FILTER (WHERE dh.donation_count > 1) as repeat_donors,
    CASE 
      WHEN COUNT(DISTINCT dh.donor_hash_id) > 0
      THEN (COUNT(DISTINCT dh.donor_hash_id) FILTER (WHERE dh.donation_count > 1)::NUMERIC / 
            COUNT(DISTINCT dh.donor_hash_id)::NUMERIC * 100)
      ELSE 0
    END as retention_rate
  FROM (
    SELECT 
      donor_hash_id,
      COUNT(*) as donation_count
    FROM donation_history dh
    WHERE dh.donation_date >= start_date 
      AND dh.donation_date <= end_date
      AND (center_id IS NULL OR dh.donation_center_id = center_id)
    GROUP BY donor_hash_id
  ) dh;
END;
$$ LANGUAGE plpgsql;

/**
 * Calculate average donations per donor
 */
CREATE OR REPLACE FUNCTION staff_portal.avg_donations_per_donor(
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  center_id UUID DEFAULT NULL
)
RETURNS NUMERIC AS $$
DECLARE
  result NUMERIC;
BEGIN
  SELECT AVG(donation_count) INTO result
  FROM (
    SELECT COUNT(*) as donation_count
    FROM donation_history dh
    WHERE dh.donation_date >= start_date 
      AND dh.donation_date <= end_date
      AND (center_id IS NULL OR dh.donation_center_id = center_id)
    GROUP BY donor_hash_id
  ) subquery;
  
  RETURN COALESCE(result, 0);
END;
$$ LANGUAGE plpgsql;

/**
 * Get peak donation times
 */
CREATE OR REPLACE FUNCTION staff_portal.get_peak_donation_times(
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  center_id UUID DEFAULT NULL
)
RETURNS TABLE (
  hour_of_day INTEGER,
  donation_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    EXTRACT(HOUR FROM dh.donation_date)::INTEGER as hour_of_day,
    COUNT(*)::BIGINT as donation_count
  FROM donation_history dh
  WHERE dh.donation_date >= start_date 
    AND dh.donation_date <= end_date
    AND (center_id IS NULL OR dh.donation_center_id = center_id)
  GROUP BY EXTRACT(HOUR FROM dh.donation_date)
  ORDER BY donation_count DESC
  LIMIT 10;
END;
$$ LANGUAGE plpgsql;

/**
 * Calculate success rate
 */
CREATE OR REPLACE FUNCTION staff_portal.calculate_success_rate(
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  center_id UUID DEFAULT NULL
)
RETURNS NUMERIC AS $$
DECLARE
  result NUMERIC;
BEGIN
  SELECT 
    CASE 
      WHEN COUNT(*) > 0
      THEN (COUNT(*) FILTER (WHERE status = 'completed')::NUMERIC / COUNT(*)::NUMERIC * 100)
      ELSE 0
    END INTO result
  FROM appointments a
  WHERE a.appointment_datetime >= start_date 
    AND a.appointment_datetime <= end_date
    AND (center_id IS NULL OR a.donation_center_id = center_id);
  
  RETURN COALESCE(result, 0);
END;
$$ LANGUAGE plpgsql;

-- Comments
COMMENT ON FUNCTION staff_portal.calculate_retention_rate IS 
  'Calculates donor retention rate for a given period';

COMMENT ON FUNCTION staff_portal.avg_donations_per_donor IS 
  'Calculates average number of donations per donor';

COMMENT ON FUNCTION staff_portal.get_peak_donation_times IS 
  'Returns top 10 peak donation hours';

COMMENT ON FUNCTION staff_portal.calculate_success_rate IS 
  'Calculates appointment success rate (completed vs total)';

