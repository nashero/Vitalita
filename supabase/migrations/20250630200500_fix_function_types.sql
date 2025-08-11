/*
  # Fix Function Type Mismatches

  The get_donor_donation_history and get_donor_appointment_history functions
  have type mismatches where CONCAT returns TEXT but the function expects VARCHAR.
  
  This migration fixes these type issues by casting the CONCAT results to VARCHAR.
*/

-- Fix get_donor_donation_history function
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
    CONCAT(s.first_name, ' ', s.last_name)::VARCHAR as staff_name,
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

-- Fix get_donor_appointment_history function
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
    CONCAT(s.first_name, ' ', s.last_name)::VARCHAR as staff_name,
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

-- Insert audit log entry
SELECT create_audit_log(
  p_user_type := 'system',
  p_action := 'function_types_fixed',
  p_details := 'Fixed type mismatches in donor history functions',
  p_status := 'success'
); 