import { query } from '../config/database.js';
import { AuditLog } from '../types/index.js';

/**
 * Create audit log entry
 */
export const createAuditLog = async (logData: {
  user_id?: string;
  action: string;
  resource_type?: string;
  resource_id?: string;
  details?: Record<string, unknown>;
  ip_address?: string;
  user_agent?: string;
  session_id?: string;
  status?: 'success' | 'failure' | 'error' | 'warning';
  error_message?: string;
}): Promise<AuditLog> => {
  const result = await query(
    `INSERT INTO staff_portal.audit_logs (
      user_id, action, resource_type, resource_id, details,
      ip_address, user_agent, session_id, status, error_message
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
    RETURNING *`,
    [
      logData.user_id || null,
      logData.action,
      logData.resource_type || null,
      logData.resource_id || null,
      logData.details ? JSON.stringify(logData.details) : null,
      logData.ip_address || null,
      logData.user_agent || null,
      logData.session_id || null,
      logData.status || 'success',
      logData.error_message || null,
    ]
  );

  return result.rows[0] as AuditLog;
};

