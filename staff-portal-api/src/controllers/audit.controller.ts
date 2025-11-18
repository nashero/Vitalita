/**
 * Audit Logs Controller
 * Handles audit log queries and exports
 */

import { Request, Response, NextFunction } from 'express';
import { validationResult, query as queryValidator } from 'express-validator';
import { AuthenticatedRequest } from '../types/index.js';
import { query } from '../config/database.js';
import { AppError, ErrorMessages } from '../utils/errors.js';
import { format } from 'date-fns';

/**
 * GET /api/staff/audit-logs
 * Get audit logs with filtering
 */
export const getAuditLogs = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({
        success: false,
        error: {
          message: 'Validation failed',
          details: errors.array(),
          statusCode: 400,
        },
      });
      return;
    }

    const {
      page = '1',
      limit = '50',
      user_id,
      action,
      resource_type,
      status,
      start_date,
      end_date,
      search,
    } = req.query;

    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const offset = (pageNum - 1) * limitNum;

    // Build WHERE clause
    const conditions: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;

    if (user_id) {
      conditions.push(`al.user_id = $${paramIndex}`);
      params.push(user_id);
      paramIndex++;
    }

    if (action) {
      conditions.push(`al.action ILIKE $${paramIndex}`);
      params.push(`%${action}%`);
      paramIndex++;
    }

    if (resource_type) {
      conditions.push(`al.resource_type = $${paramIndex}`);
      params.push(resource_type);
      paramIndex++;
    }

    if (status) {
      conditions.push(`al.status = $${paramIndex}`);
      params.push(status);
      paramIndex++;
    }

    if (start_date) {
      conditions.push(`al.timestamp >= $${paramIndex}`);
      params.push(start_date);
      paramIndex++;
    }

    if (end_date) {
      conditions.push(`al.timestamp <= $${paramIndex}`);
      params.push(end_date);
      paramIndex++;
    }

    if (search) {
      conditions.push(
        `(al.action ILIKE $${paramIndex} OR al.resource_type ILIKE $${paramIndex} OR al.details::text ILIKE $${paramIndex})`
      );
      params.push(`%${search}%`);
      paramIndex++;
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // Get total count
    const countQuery = `
      SELECT COUNT(*) as total
      FROM staff_portal.audit_logs al
      ${whereClause}
    `;
    const countResult = await query(countQuery, params);
    const total = parseInt(countResult.rows[0].total, 10);

    // Get logs with user information
    const logsQuery = `
      SELECT 
        al.*,
        u.email as user_email,
        u.first_name as user_first_name,
        u.last_name as user_last_name
      FROM staff_portal.audit_logs al
      LEFT JOIN staff_portal.users u ON al.user_id = u.user_id
      ${whereClause}
      ORDER BY al.timestamp DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    const logsResult = await query(logsQuery, [...params, limitNum, offset]);

    res.json({
      success: true,
      data: {
        logs: logsResult.rows,
      },
      meta: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/staff/audit-logs/export
 * Export audit logs as CSV
 */
export const exportAuditLogs = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const {
      user_id,
      action,
      resource_type,
      status,
      start_date,
      end_date,
    } = req.query;

    // Build WHERE clause (same as getAuditLogs)
    const conditions: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;

    if (user_id) {
      conditions.push(`al.user_id = $${paramIndex}`);
      params.push(user_id);
      paramIndex++;
    }

    if (action) {
      conditions.push(`al.action ILIKE $${paramIndex}`);
      params.push(`%${action}%`);
      paramIndex++;
    }

    if (resource_type) {
      conditions.push(`al.resource_type = $${paramIndex}`);
      params.push(resource_type);
      paramIndex++;
    }

    if (status) {
      conditions.push(`al.status = $${paramIndex}`);
      params.push(status);
      paramIndex++;
    }

    if (start_date) {
      conditions.push(`al.timestamp >= $${paramIndex}`);
      params.push(start_date);
      paramIndex++;
    }

    if (end_date) {
      conditions.push(`al.timestamp <= $${paramIndex}`);
      params.push(end_date);
      paramIndex++;
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // Get all logs (no pagination for export)
    const logsQuery = `
      SELECT 
        al.timestamp,
        al.user_id,
        u.email as user_email,
        al.action,
        al.resource_type,
        al.resource_id,
        al.status,
        al.ip_address,
        al.user_agent,
        al.details
      FROM staff_portal.audit_logs al
      LEFT JOIN staff_portal.users u ON al.user_id = u.user_id
      ${whereClause}
      ORDER BY al.timestamp DESC
      LIMIT 10000
    `;

    const logsResult = await query(logsQuery, params);

    // Generate CSV
    const csvHeaders = [
      'Timestamp',
      'User ID',
      'User Email',
      'Action',
      'Resource Type',
      'Resource ID',
      'Status',
      'IP Address',
      'User Agent',
      'Details',
    ];

    const csvRows = logsResult.rows.map((log) => [
      format(new Date(log.timestamp), 'yyyy-MM-dd HH:mm:ss'),
      log.user_id || '',
      log.user_email || '',
      log.action,
      log.resource_type || '',
      log.resource_id || '',
      log.status,
      log.ip_address || '',
      log.user_agent || '',
      JSON.stringify(log.details || {}),
    ]);

    const csvContent = [
      csvHeaders.join(','),
      ...csvRows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')),
    ].join('\n');

    // Set response headers
    const filename = `audit-logs-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    res.send(csvContent);
  } catch (error) {
    next(error);
  }
};

// Validation rules
export const getAuditLogsValidation = [
  queryValidator('page').optional().isInt({ min: 1 }),
  queryValidator('limit').optional().isInt({ min: 1, max: 500 }),
  queryValidator('user_id').optional().isUUID(),
  queryValidator('status').optional().isIn(['success', 'failure', 'error', 'warning']),
  queryValidator('start_date').optional().isISO8601(),
  queryValidator('end_date').optional().isISO8601(),
];

