/**
 * Reports Controller
 * Custom report generation and export
 */

import { Request, Response, NextFunction } from 'express';
import { body, validationResult } from 'express-validator';
import { AuthenticatedRequest } from '../types/index.js';
import { query } from '../config/database.js';
import { AppError, ErrorMessages } from '../utils/errors.js';
import { createAuditLog } from '../models/audit.model.js';
import { format } from 'date-fns';
import { v4 as uuidv4 } from 'uuid';

/**
 * POST /api/staff/reports/generate
 * Generate custom report
 */
export const generateReport = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
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
      report_type,
      start_date,
      end_date,
      center_id,
      format: reportFormat,
      include_charts,
    } = req.body;
    const currentUser = req.user!;

    // Generate report ID
    const reportId = uuidv4();

    // Store report metadata
    await query(
      `CREATE TABLE IF NOT EXISTS staff_portal.reports (
        report_id UUID PRIMARY KEY,
        user_id UUID NOT NULL REFERENCES staff_portal.users(user_id),
        report_type VARCHAR NOT NULL,
        start_date TIMESTAMPTZ,
        end_date TIMESTAMPTZ,
        center_id UUID,
        format VARCHAR NOT NULL,
        status VARCHAR DEFAULT 'generating',
        created_at TIMESTAMPTZ DEFAULT NOW(),
        file_path TEXT
      )`
    );

    await query(
      `INSERT INTO staff_portal.reports (report_id, user_id, report_type, start_date, end_date, center_id, format)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [reportId, currentUser.user_id, report_type, start_date, end_date, center_id, reportFormat]
    );

    // Generate report based on type
    let reportData: any = {};

    switch (report_type) {
      case 'donations':
        reportData = await generateDonationsReport(start_date, end_date, center_id);
        break;
      case 'donors':
        reportData = await generateDonorsReport(start_date, end_date, center_id);
        break;
      case 'operational':
        reportData = await generateOperationalReport(start_date, end_date, center_id);
        break;
      case 'financial':
        // Check permission
        if (!currentUser.permissions.some((p) => p.permission_name === 'financial:view')) {
          res.status(403).json({
            success: false,
            error: {
              message: 'Insufficient permissions for financial reports',
              statusCode: 403,
            },
          });
          return;
        }
        reportData = await generateFinancialReport(start_date, end_date, center_id);
        break;
      default:
        res.status(400).json({
          success: false,
          error: {
            message: 'Invalid report type',
            statusCode: 400,
          },
        });
        return;
    }

    // Update report status
    await query(
      `UPDATE staff_portal.reports SET status = 'completed' WHERE report_id = $1`,
      [reportId]
    );

    // Audit log
    await createAuditLog({
      user_id: currentUser.user_id,
      action: 'generate_report',
      resource_type: 'reports',
      resource_id: reportId,
      details: {
        report_type,
        format: reportFormat,
        start_date,
        end_date,
        center_id,
      },
      ip_address: req.ip || req.socket.remoteAddress,
      user_agent: req.headers['user-agent'],
      status: 'success',
    });

    res.json({
      success: true,
      data: {
        report_id: reportId,
        report_data: reportData,
        format: reportFormat,
        metadata: {
          generated_at: new Date().toISOString(),
          generated_by: currentUser.email,
          filters: {
            start_date,
            end_date,
            center_id,
          },
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/staff/reports/:id/download
 * Download generated report
 */
export const downloadReport = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const { format: downloadFormat } = req.query;
    const currentUser = req.user!;

    // Get report
    const reportResult = await query(
      `SELECT * FROM staff_portal.reports WHERE report_id = $1`,
      [id]
    );

    if (reportResult.rows.length === 0) {
      res.status(404).json({
        success: false,
        error: {
          message: 'Report not found',
          statusCode: 404,
        },
      });
      return;
    }

    const report = reportResult.rows[0];

    // Check permissions
    if (report.user_id !== currentUser.user_id && 
        !currentUser.permissions.some((p) => p.permission_name === 'reports:view_all')) {
      res.status(403).json({
        success: false,
        error: {
          message: 'Insufficient permissions',
          statusCode: 403,
        },
      });
      return;
    }

    const format = (downloadFormat as string) || report.format;

    // Generate file based on format
    if (format === 'csv') {
      await exportToCSV(report, res);
    } else if (format === 'excel') {
      await exportToExcel(report, res);
    } else if (format === 'pdf') {
      await exportToPDF(report, res);
    } else {
      res.status(400).json({
        success: false,
        error: {
          message: 'Invalid format',
          statusCode: 400,
        },
      });
      return;
    }

    // Audit log
    await createAuditLog({
      user_id: currentUser.user_id,
      action: 'download_report',
      resource_type: 'reports',
      resource_id: id,
      details: {
        format,
      },
      ip_address: req.ip || req.socket.remoteAddress,
      user_agent: req.headers['user-agent'],
      status: 'success',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Generate donations report
 */
async function generateDonationsReport(startDate: string, endDate: string, centerId?: string) {
  const params: any[] = [startDate, endDate];
  let centerFilter = '';

  if (centerId) {
    centerFilter = `AND dh.donation_center_id = $3`;
    params.push(centerId);
  }

  const result = await query(
    `SELECT 
      dh.donation_date,
      dh.donation_type,
      dh.donation_volume,
      dh.status,
      dh.donor_hash_id,
      dc.name as center_name
    FROM donation_history dh
    LEFT JOIN donation_centers dc ON dh.donation_center_id = dc.center_id
    WHERE dh.donation_date >= $1 AND dh.donation_date <= $2
    ${centerFilter}
    ORDER BY dh.donation_date DESC`,
    params
  );

  return {
    type: 'donations',
    data: result.rows,
    summary: {
      total: result.rows.length,
      whole_blood: result.rows.filter((r) => r.donation_type === 'whole_blood').length,
      plasma: result.rows.filter((r) => r.donation_type === 'plasma').length,
    },
  };
}

/**
 * Generate donors report
 */
async function generateDonorsReport(startDate: string, endDate: string, centerId?: string) {
  const params: any[] = [startDate, endDate];
  let centerFilter = '';

  if (centerId) {
    centerFilter = `AND d.avis_donor_center = $3`;
    params.push(centerId);
  }

  const result = await query(
    `SELECT 
      d.donor_hash_id,
      d.is_active,
      d.last_donation_date,
      d.total_donations_this_year,
      dc.name as center_name
    FROM donors d
    LEFT JOIN donation_centers dc ON d.avis_donor_center = dc.center_id::text
    WHERE d.last_donation_date >= $1 AND d.last_donation_date <= $2
    ${centerFilter}
    ORDER BY d.last_donation_date DESC`,
    params
  );

  return {
    type: 'donors',
    data: result.rows.map((r) => ({
      ...r,
      donor_hash_id: `${r.donor_hash_id.substring(0, 8)}...${r.donor_hash_id.substring(r.donor_hash_id.length - 4)}`,
    })),
    summary: {
      total: result.rows.length,
      active: result.rows.filter((r) => r.is_active).length,
    },
  };
}

/**
 * Generate operational report
 */
async function generateOperationalReport(startDate: string, endDate: string, centerId?: string) {
  const params: any[] = [startDate, endDate];
  let centerFilter = '';

  if (centerId) {
    centerFilter = `AND a.donation_center_id = $3`;
    params.push(centerId);
  }

  const result = await query(
    `SELECT 
      a.appointment_id,
      a.appointment_datetime,
      a.status,
      a.donation_type,
      a.donor_hash_id,
      dc.name as center_name
    FROM appointments a
    LEFT JOIN donation_centers dc ON a.donation_center_id = dc.center_id
    WHERE a.appointment_datetime >= $1 AND a.appointment_datetime <= $2
    ${centerFilter}
    ORDER BY a.appointment_datetime DESC`,
    params
  );

  return {
    type: 'operational',
    data: result.rows,
    summary: {
      total: result.rows.length,
      completed: result.rows.filter((r) => r.status === 'completed').length,
      cancelled: result.rows.filter((r) => r.status === 'cancelled').length,
      no_show: result.rows.filter((r) => r.status === 'no-show').length,
    },
  };
}

/**
 * Generate financial report (authorized roles only)
 */
async function generateFinancialReport(startDate: string, endDate: string, centerId?: string) {
  // Placeholder - implement based on financial data structure
  return {
    type: 'financial',
    data: [],
    summary: {
      total_revenue: 0,
      total_expenses: 0,
      net_income: 0,
    },
  };
}

/**
 * Export to CSV
 */
async function exportToCSV(report: any, res: Response) {
  // Get report data
  const reportData = await getReportData(report);

  // Generate CSV
  const headers = Object.keys(reportData.data[0] || {});
  const csvRows = [
    headers.join(','),
    ...reportData.data.map((row: any) =>
      headers.map((header) => `"${String(row[header] || '').replace(/"/g, '""')}"`).join(',')
    ),
  ];

  const filename = `report-${report.report_id.substring(0, 8)}-${format(new Date(), 'yyyy-MM-dd')}.csv`;
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  res.send(csvRows.join('\n'));
}

/**
 * Export to Excel
 */
async function exportToExcel(report: any, res: Response) {
  // Placeholder - implement with xlsx library
  res.status(501).json({
    success: false,
    error: {
      message: 'Excel export not yet implemented',
      statusCode: 501,
    },
  });
}

/**
 * Export to PDF
 */
async function exportToPDF(report: any, res: Response) {
  // Placeholder - implement with react-pdf or pdfkit
  res.status(501).json({
    success: false,
    error: {
      message: 'PDF export not yet implemented',
      statusCode: 501,
    },
  });
}

/**
 * Get report data
 */
async function getReportData(report: any) {
  switch (report.report_type) {
    case 'donations':
      return await generateDonationsReport(report.start_date, report.end_date, report.center_id);
    case 'donors':
      return await generateDonorsReport(report.start_date, report.end_date, report.center_id);
    case 'operational':
      return await generateOperationalReport(report.start_date, report.end_date, report.center_id);
    case 'financial':
      return await generateFinancialReport(report.start_date, report.end_date, report.center_id);
    default:
      return { data: [], summary: {} };
  }
}

// Validation rules
export const generateReportValidation = [
  body('report_type').isIn(['donations', 'donors', 'operational', 'financial']),
  body('start_date').isISO8601(),
  body('end_date').isISO8601(),
  body('center_id').optional().isUUID(),
  body('format').isIn(['csv', 'excel', 'pdf']),
  body('include_charts').optional().isBoolean(),
];

