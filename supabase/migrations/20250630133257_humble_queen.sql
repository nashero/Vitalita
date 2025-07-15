/*
  # Create audit_logs table

  1. New Tables
    - `audit_logs`
      - `log_id` (uuid, primary key)
      - `timestamp` (timestamptz, default now())
      - `user_id` (varchar, nullable for system actions)
      - `user_type` (varchar, e.g., 'staff', 'donor', 'system')
      - `action` (varchar, action performed)
      - `details` (text, additional context)
      - `ip_address` (varchar, client IP address)
      - `user_agent` (text, browser/client information)
      - `resource_type` (varchar, affected resource type)
      - `resource_id` (varchar, affected resource ID)
      - `status` (varchar, success/failure/error)

  2. Security
    - Enable RLS on `audit_logs` table
    - Add policy for authenticated users to read audit logs
    - Add policy for system to insert audit logs
    - Restrict modification of existing logs

  3. Performance
    - Index on timestamp for chronological queries
    - Index on user_id for user activity tracking
    - Index on action for filtering by action type
    - Index on resource_type for resource-based queries
    - Composite index on user_id, timestamp for user activity history

  4. Data Integrity
    - Check constraint for valid user_type values
    - Check constraint for valid status values
    - Automatic timestamp management
    - Immutable logs (no updates allowed)
*/

-- Create audit_logs table
CREATE TABLE IF NOT EXISTS audit_logs (
  log_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  timestamp timestamptz DEFAULT now() NOT NULL,
  user_id varchar(255),
  user_type varchar(50) NOT NULL,
  action varchar(100) NOT NULL,
  details text,
  ip_address varchar(45),
  user_agent text,
  resource_type varchar(100),
  resource_id varchar(255),
  status varchar(20) DEFAULT 'success'
);

-- Add check constraints for data integrity
ALTER TABLE audit_logs 
ADD CONSTRAINT chk_audit_logs_user_type 
CHECK (user_type IN ('staff', 'donor', 'system', 'admin', 'anonymous'));

ALTER TABLE audit_logs 
ADD CONSTRAINT chk_audit_logs_status 
CHECK (status IN ('success', 'failure', 'error', 'warning'));

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON audit_logs (timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs (user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_type ON audit_logs (user_type);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs (action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_resource_type ON audit_logs (resource_type);
CREATE INDEX IF NOT EXISTS idx_audit_logs_status ON audit_logs (status);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_activity ON audit_logs (user_id, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_resource_activity ON audit_logs (resource_type, resource_id, timestamp DESC);

-- Enable Row Level Security
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Authenticated users can read audit logs"
  ON audit_logs
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "System can insert audit logs"
  ON audit_logs
  FOR INSERT
  TO authenticated, anon
  WITH CHECK (true);

-- Prevent updates and deletes to maintain audit integrity
CREATE POLICY "No updates allowed on audit logs"
  ON audit_logs
  FOR UPDATE
  TO authenticated
  USING (false);

CREATE POLICY "No deletes allowed on audit logs"
  ON audit_logs
  FOR DELETE
  TO authenticated
  USING (false);

-- Create function to automatically log database changes
CREATE OR REPLACE FUNCTION create_audit_log(
  p_user_id varchar DEFAULT NULL,
  p_user_type varchar DEFAULT 'system',
  p_action varchar DEFAULT NULL,
  p_details text DEFAULT NULL,
  p_ip_address varchar DEFAULT NULL,
  p_user_agent text DEFAULT NULL,
  p_resource_type varchar DEFAULT NULL,
  p_resource_id varchar DEFAULT NULL,
  p_status varchar DEFAULT 'success'
)
RETURNS uuid AS $$
DECLARE
  log_id uuid;
BEGIN
  INSERT INTO audit_logs (
    user_id, user_type, action, details, ip_address, 
    user_agent, resource_type, resource_id, status
  ) VALUES (
    p_user_id, p_user_type, p_action, p_details, p_ip_address,
    p_user_agent, p_resource_type, p_resource_id, p_status
  ) RETURNING audit_logs.log_id INTO log_id;
  
  RETURN log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger function for automatic audit logging on key tables
CREATE OR REPLACE FUNCTION trigger_audit_log()
RETURNS TRIGGER AS $$
DECLARE
  action_type varchar;
  old_data jsonb;
  new_data jsonb;
  changed_fields text[];
BEGIN
  -- Determine action type
  IF TG_OP = 'INSERT' THEN
    action_type := 'create_' || TG_TABLE_NAME;
    new_data := to_jsonb(NEW);
  ELSIF TG_OP = 'UPDATE' THEN
    action_type := 'update_' || TG_TABLE_NAME;
    old_data := to_jsonb(OLD);
    new_data := to_jsonb(NEW);
    
    -- Find changed fields
    SELECT array_agg(key) INTO changed_fields
    FROM jsonb_each(new_data) 
    WHERE value != COALESCE(old_data->key, 'null'::jsonb);
    
  ELSIF TG_OP = 'DELETE' THEN
    action_type := 'delete_' || TG_TABLE_NAME;
    old_data := to_jsonb(OLD);
  END IF;

  -- Insert audit log
  PERFORM create_audit_log(
    p_user_id := COALESCE(current_setting('app.current_user_id', true), 'system'),
    p_user_type := COALESCE(current_setting('app.current_user_type', true), 'system'),
    p_action := action_type,
    p_details := jsonb_build_object(
      'table', TG_TABLE_NAME,
      'operation', TG_OP,
      'old_data', old_data,
      'new_data', new_data,
      'changed_fields', changed_fields
    )::text,
    p_resource_type := TG_TABLE_NAME,
    p_resource_id := CASE 
      WHEN TG_OP = 'DELETE' THEN old_data->>'id'
      ELSE new_data->>'id'
    END
  );

  -- Return appropriate record
  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  ELSE
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Add audit triggers to key tables
CREATE TRIGGER trigger_audit_staff
  AFTER INSERT OR UPDATE OR DELETE ON staff
  FOR EACH ROW EXECUTE FUNCTION trigger_audit_log();

CREATE TRIGGER trigger_audit_donors
  AFTER INSERT OR UPDATE OR DELETE ON donors
  FOR EACH ROW EXECUTE FUNCTION trigger_audit_log();

CREATE TRIGGER trigger_audit_appointments
  AFTER INSERT OR UPDATE OR DELETE ON appointments
  FOR EACH ROW EXECUTE FUNCTION trigger_audit_log();

CREATE TRIGGER trigger_audit_donation_centers
  AFTER INSERT OR UPDATE OR DELETE ON donation_centers
  FOR EACH ROW EXECUTE FUNCTION trigger_audit_log();

CREATE TRIGGER trigger_audit_availability_slots
  AFTER INSERT OR UPDATE OR DELETE ON availability_slots
  FOR EACH ROW EXECUTE FUNCTION trigger_audit_log();

CREATE TRIGGER trigger_audit_roles
  AFTER INSERT OR UPDATE OR DELETE ON roles
  FOR EACH ROW EXECUTE FUNCTION trigger_audit_log();

CREATE TRIGGER trigger_audit_permissions
  AFTER INSERT OR UPDATE OR DELETE ON permissions
  FOR EACH ROW EXECUTE FUNCTION trigger_audit_log();

CREATE TRIGGER trigger_audit_role_permissions
  AFTER INSERT OR UPDATE OR DELETE ON role_permissions
  FOR EACH ROW EXECUTE FUNCTION trigger_audit_log();

-- Insert initial audit log entry
SELECT create_audit_log(
  p_user_type := 'system',
  p_action := 'system_initialization',
  p_details := 'Audit logging system initialized with comprehensive tracking',
  p_status := 'success'
);