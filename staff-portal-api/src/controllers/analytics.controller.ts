/**
 * Analytics Controller
 * Comprehensive analytics and reporting system
 */

import { Request, Response, NextFunction } from 'express';
import { validationResult, query as queryValidator } from 'express-validator';
import { AuthenticatedRequest } from '../types/index.js';
import { query } from '../config/database.js';
import { AppError, ErrorMessages } from '../utils/errors.js';
import { createAuditLog } from '../models/audit.model.js';
import { format, subDays, subMonths, startOfDay, endOfDay } from 'date-fns';

/**
 * GET /api/staff/analytics/dashboard
 * Overall dashboard metrics
 */
export const getDashboardMetrics = async (
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

    const { start_date, end_date, center_id } = req.query;
    const currentUser = req.user!;

    const startDate = start_date ? new Date(start_date as string) : subDays(new Date(), 30);
    const endDate = end_date ? new Date(end_date as string) : new Date();

    // Build center filter based on user permissions
    let centerFilter = '';
    const params: any[] = [startDate, endDate];
    let paramIndex = 3;

    if (center_id) {
      centerFilter = `AND dc.center_id = $${paramIndex}`;
      params.push(center_id);
      paramIndex++;
    }

    // Get overall metrics
    const metricsQuery = `
      SELECT 
        -- Donation metrics
        COUNT(DISTINCT dh.history_id) as total_donations,
        COUNT(DISTINCT dh.history_id) FILTER (WHERE dh.donation_type = 'whole_blood') as whole_blood_donations,
        COUNT(DISTINCT dh.history_id) FILTER (WHERE dh.donation_type = 'plasma') as plasma_donations,
        COUNT(DISTINCT dh.donor_hash_id) as unique_donors,
        AVG(dh.donation_volume) as avg_donation_volume,
        
        -- Appointment metrics
        COUNT(DISTINCT a.appointment_id) FILTER (WHERE a.status = 'completed') as completed_appointments,
        COUNT(DISTINCT a.appointment_id) FILTER (WHERE a.status = 'cancelled') as cancelled_appointments,
        COUNT(DISTINCT a.appointment_id) FILTER (WHERE a.status = 'no-show') as no_show_appointments,
        COUNT(DISTINCT a.appointment_id) as total_appointments,
        
        -- Donor metrics
        COUNT(DISTINCT d.donor_hash_id) FILTER (WHERE d.is_active = true) as active_donors,
        COUNT(DISTINCT d.donor_hash_id) FILTER (WHERE d.last_donation_date >= $1) as new_donors,
        
        -- Success rate
        CASE 
          WHEN COUNT(DISTINCT a.appointment_id) > 0 
          THEN (COUNT(DISTINCT a.appointment_id) FILTER (WHERE a.status = 'completed')::float / 
                COUNT(DISTINCT a.appointment_id)::float * 100)
          ELSE 0
        END as success_rate
      FROM donation_history dh
      LEFT JOIN appointments a ON dh.appointment_id = a.appointment_id
      LEFT JOIN donors d ON dh.donor_hash_id = d.donor_hash_id
      LEFT JOIN donation_centers dc ON dh.donation_center_id = dc.center_id
      WHERE dh.donation_date >= $1 AND dh.donation_date <= $2
      ${centerFilter}
    `;

    const metricsResult = await query(metricsQuery, params);

    // Get previous period for comparison
    const periodDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    const prevStartDate = new Date(startDate.getTime() - periodDays * 24 * 60 * 60 * 1000);
    const prevEndDate = startDate;

    const prevParams = [prevStartDate, prevEndDate, ...params.slice(2)];
    const prevMetricsResult = await query(metricsQuery.replace('$1', '$1').replace('$2', '$2'), prevParams);

    const metrics = metricsResult.rows[0];
    const prevMetrics = prevMetricsResult.rows[0];

    // Calculate trends
    const calculateTrend = (current: number, previous: number) => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return ((current - previous) / previous) * 100;
    };

    const trends = {
      total_donations: calculateTrend(parseFloat(metrics.total_donations) || 0, parseFloat(prevMetrics.total_donations) || 0),
      unique_donors: calculateTrend(parseFloat(metrics.unique_donors) || 0, parseFloat(prevMetrics.unique_donors) || 0),
      success_rate: calculateTrend(parseFloat(metrics.success_rate) || 0, parseFloat(prevMetrics.success_rate) || 0),
      active_donors: calculateTrend(parseFloat(metrics.active_donors) || 0, parseFloat(prevMetrics.active_donors) || 0),
    };

    // Audit log
    await createAuditLog({
      user_id: currentUser.user_id,
      action: 'view_analytics_dashboard',
      resource_type: 'analytics',
      resource_id: null,
      details: {
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString(),
        center_id: center_id || null,
      },
      ip_address: req.ip || req.socket.remoteAddress,
      user_agent: req.headers['user-agent'],
      status: 'success',
    });

    res.json({
      success: true,
      data: {
        metrics: {
          ...metrics,
          trends,
        },
        period: {
          start: startDate.toISOString(),
          end: endDate.toISOString(),
          previous_start: prevStartDate.toISOString(),
          previous_end: prevEndDate.toISOString(),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/staff/analytics/donations
 * Donation trends and patterns
 */
export const getDonationTrends = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { start_date, end_date, center_id, group_by = 'day' } = req.query;
    const currentUser = req.user!;

    const startDate = start_date ? new Date(start_date as string) : subDays(new Date(), 30);
    const endDate = end_date ? new Date(end_date as string) : new Date();

    let dateTrunc = 'day';
    if (group_by === 'week') dateTrunc = 'week';
    if (group_by === 'month') dateTrunc = 'month';

    const params: any[] = [startDate, endDate];
    let paramIndex = 3;
    let centerFilter = '';

    if (center_id) {
      centerFilter = `AND dh.donation_center_id = $${paramIndex}`;
      params.push(center_id);
      paramIndex++;
    }

    // Get donation trends by time period
    const trendsQuery = `
      SELECT 
        DATE_TRUNC('${dateTrunc}', dh.donation_date) as period,
        COUNT(*) as donation_count,
        COUNT(*) FILTER (WHERE dh.donation_type = 'whole_blood') as whole_blood_count,
        COUNT(*) FILTER (WHERE dh.donation_type = 'plasma') as plasma_count,
        AVG(dh.donation_volume) as avg_volume,
        COUNT(DISTINCT dh.donor_hash_id) as unique_donors
      FROM donation_history dh
      WHERE dh.donation_date >= $1 AND dh.donation_date <= $2
      ${centerFilter}
      GROUP BY DATE_TRUNC('${dateTrunc}', dh.donation_date)
      ORDER BY period
    `;

    const trendsResult = await query(trendsQuery, params);

    // Get peak times (by hour of day)
    const peakTimesQuery = `
      SELECT 
        EXTRACT(HOUR FROM dh.donation_date) as hour,
        COUNT(*) as donation_count
      FROM donation_history dh
      WHERE dh.donation_date >= $1 AND dh.donation_date <= $2
      ${centerFilter}
      GROUP BY EXTRACT(HOUR FROM dh.donation_date)
      ORDER BY hour
    `;

    const peakTimesResult = await query(peakTimesQuery, params);

    // Get peak days (by day of week)
    const peakDaysQuery = `
      SELECT 
        EXTRACT(DOW FROM dh.donation_date) as day_of_week,
        TO_CHAR(dh.donation_date, 'Day') as day_name,
        COUNT(*) as donation_count
      FROM donation_history dh
      WHERE dh.donation_date >= $1 AND dh.donation_date <= $2
      ${centerFilter}
      GROUP BY EXTRACT(DOW FROM dh.donation_date), TO_CHAR(dh.donation_date, 'Day')
      ORDER BY day_of_week
    `;

    const peakDaysResult = await query(peakDaysQuery, params);

    res.json({
      success: true,
      data: {
        trends: trendsResult.rows,
        peak_times: peakTimesResult.rows,
        peak_days: peakDaysResult.rows,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/staff/analytics/donors
 * Donor statistics and demographics
 */
export const getDonorStatistics = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { start_date, end_date, center_id } = req.query;
    const currentUser = req.user!;

    const startDate = start_date ? new Date(start_date as string) : subDays(new Date(), 30);
    const endDate = end_date ? new Date(end_date as string) : new Date();

    const params: any[] = [startDate, endDate];
    let paramIndex = 3;
    let centerFilter = '';

    if (center_id) {
      centerFilter = `AND d.avis_donor_center = $${paramIndex}`;
      params.push(center_id);
      paramIndex++;
    }

    // Get donor statistics (aggregated, anonymized)
    const statsQuery = `
      SELECT 
        COUNT(DISTINCT d.donor_hash_id) as total_donors,
        COUNT(DISTINCT d.donor_hash_id) FILTER (WHERE d.is_active = true) as active_donors,
        COUNT(DISTINCT d.donor_hash_id) FILTER (WHERE d.last_donation_date >= $1) as new_donors,
        COUNT(DISTINCT d.donor_hash_id) FILTER (WHERE d.last_donation_date < $1 AND d.is_active = true) as returning_donors,
        AVG(d.total_donations_this_year) as avg_donations_per_donor,
        COUNT(DISTINCT d.donor_hash_id) FILTER (WHERE d.last_donation_date >= NOW() - INTERVAL '90 days') as eligible_donors,
        COUNT(DISTINCT d.donor_hash_id) FILTER (WHERE d.last_donation_date < NOW() - INTERVAL '90 days' AND d.is_active = true) as ineligible_donors
      FROM donors d
      WHERE d.last_donation_date IS NOT NULL
      ${centerFilter}
    `;

    const statsResult = await query(statsQuery, params);

    // Get retention rate (donors who donated multiple times)
    const retentionQuery = `
      SELECT 
        COUNT(DISTINCT dh.donor_hash_id) FILTER (WHERE donation_count > 1) as repeat_donors,
        COUNT(DISTINCT dh.donor_hash_id) as total_donors,
        CASE 
          WHEN COUNT(DISTINCT dh.donor_hash_id) > 0
          THEN (COUNT(DISTINCT dh.donor_hash_id) FILTER (WHERE donation_count > 1)::float / 
                COUNT(DISTINCT dh.donor_hash_id)::float * 100)
          ELSE 0
        END as retention_rate
      FROM (
        SELECT 
          donor_hash_id,
          COUNT(*) as donation_count
        FROM donation_history dh
        WHERE dh.donation_date >= $1 AND dh.donation_date <= $2
        ${centerFilter.replace('d.', 'dh.')}
        GROUP BY donor_hash_id
      ) dh
    `;

    const retentionResult = await query(retentionQuery, params);

    res.json({
      success: true,
      data: {
        statistics: statsResult.rows[0],
        retention: retentionResult.rows[0],
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/staff/analytics/centers
 * Center performance comparison
 */
export const getCenterPerformance = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { start_date, end_date } = req.query;
    const currentUser = req.user!;

    const startDate = start_date ? new Date(start_date as string) : subDays(new Date(), 30);
    const endDate = end_date ? new Date(end_date as string) : new Date();

    // Get center performance metrics (FIXED: uses history_id instead of donation_id)
    const performanceQuery = `
      SELECT 
        dc.center_id,
        dc.name as center_name,
        dc.city,
        dc.country,
        COUNT(DISTINCT dh.history_id) as total_donations,
        COUNT(DISTINCT dh.donor_hash_id) as unique_donors,
        COUNT(DISTINCT a.appointment_id) FILTER (WHERE a.status = 'completed') as completed_appointments,
        COUNT(DISTINCT a.appointment_id) FILTER (WHERE a.status = 'no-show') as no_shows,
        CASE 
          WHEN COUNT(DISTINCT a.appointment_id) > 0
          THEN (COUNT(DISTINCT a.appointment_id) FILTER (WHERE a.status = 'completed')::float / 
                COUNT(DISTINCT a.appointment_id)::float * 100)
          ELSE 0
        END as success_rate,
        AVG(dh.donation_volume) as avg_donation_volume
      FROM donation_centers dc
      LEFT JOIN donation_history dh ON dc.center_id = dh.donation_center_id 
        AND dh.donation_date >= $1 AND dh.donation_date <= $2
      LEFT JOIN appointments a ON dc.center_id = a.donation_center_id
        AND a.appointment_datetime >= $1 AND a.appointment_datetime <= $2
      GROUP BY dc.center_id, dc.name, dc.city, dc.country
      ORDER BY total_donations DESC
    `;

    const performanceResult = await query(performanceQuery, [startDate, endDate]);

    res.json({
      success: true,
      data: {
        centers: performanceResult.rows,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/staff/analytics/staff
 * Staff productivity metrics
 */
export const getStaffProductivity = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { start_date, end_date, center_id } = req.query;
    const currentUser = req.user!;

    const startDate = start_date ? new Date(start_date as string) : subDays(new Date(), 30);
    const endDate = end_date ? new Date(end_date as string) : new Date();

    const params: any[] = [startDate, endDate];
    let paramIndex = 3;
    let centerFilter = '';

    if (center_id) {
      centerFilter = `AND dc.center_id = $${paramIndex}`;
      params.push(center_id);
      paramIndex++;
    }

    // Get staff productivity
    const productivityQuery = `
      SELECT 
        u.user_id,
        u.first_name,
        u.last_name,
        u.email,
        COUNT(DISTINCT dh.history_id) as donations_processed,
        COUNT(DISTINCT a.appointment_id) FILTER (WHERE a.status = 'completed') as appointments_completed,
        COUNT(DISTINCT a.appointment_id) FILTER (WHERE a.status = 'cancelled') as appointments_cancelled,
        AVG(EXTRACT(EPOCH FROM (a.last_updated_timestamp - a.appointment_datetime))/60) as avg_processing_time_minutes
      FROM staff_portal.users u
      LEFT JOIN donation_history dh ON u.user_id = dh.staff_id
        AND dh.donation_date >= $1 AND dh.donation_date <= $2
      LEFT JOIN appointments a ON u.user_id = a.staff_id
        AND a.appointment_datetime >= $1 AND a.appointment_datetime <= $2
      LEFT JOIN donation_centers dc ON u.avis_center_id = dc.center_id
      WHERE u.is_active = true
      ${centerFilter}
      GROUP BY u.user_id, u.first_name, u.last_name, u.email
      HAVING COUNT(DISTINCT dh.history_id) > 0 OR COUNT(DISTINCT a.appointment_id) > 0
      ORDER BY donations_processed DESC, appointments_completed DESC
    `;

    const productivityResult = await query(productivityQuery, params);

    res.json({
      success: true,
      data: {
        staff: productivityResult.rows,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Validation rules
export const analyticsValidation = [
  queryValidator('start_date').optional().isISO8601(),
  queryValidator('end_date').optional().isISO8601(),
  queryValidator('center_id').optional().isUUID(),
  queryValidator('group_by').optional().isIn(['day', 'week', 'month']),
];

