/**
 * Appointments Controller
 * Handles appointment management for staff portal
 */

import { Request, Response, NextFunction } from 'express';
import { body, validationResult, query as queryValidator } from 'express-validator';
import { AuthenticatedRequest } from '../types/index.js';
import { query } from '../config/database.js';
import { AppError, ErrorMessages } from '../utils/errors.js';
import { createAuditLog } from '../models/audit.model.js';
import { format, parseISO, addDays, differenceInDays, startOfDay, endOfDay } from 'date-fns';
import { broadcastAppointmentUpdate, broadcastNewArrival } from '../routes/appointments.sse.js';

/**
 * GET /api/staff/appointments
 * List appointments with filtering, pagination, and search
 */
export const listAppointments = async (
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
      page = '1',
      limit = '20',
      status,
      donation_type,
      center_id,
      start_date,
      end_date,
      search,
      sort = 'appointment_datetime',
      order = 'asc',
    } = req.query;

    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const offset = (pageNum - 1) * limitNum;

    // Build WHERE clause
    const conditions: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;

    if (status) {
      conditions.push(`a.status = $${paramIndex}`);
      params.push(status);
      paramIndex++;
    }

    if (donation_type) {
      conditions.push(`a.donation_type = $${paramIndex}`);
      params.push(donation_type);
      paramIndex++;
    }

    if (center_id) {
      conditions.push(`a.donation_center_id = $${paramIndex}`);
      params.push(center_id);
      paramIndex++;
    }

    if (start_date) {
      conditions.push(`a.appointment_datetime >= $${paramIndex}`);
      params.push(start_date);
      paramIndex++;
    }

    if (end_date) {
      conditions.push(`a.appointment_datetime <= $${paramIndex}`);
      params.push(end_date);
      paramIndex++;
    }

    if (search) {
      conditions.push(`a.donor_hash_id ILIKE $${paramIndex}`);
      params.push(`%${search}%`);
      paramIndex++;
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // Get total count
    const countQuery = `
      SELECT COUNT(*) as total
      FROM appointments a
      ${whereClause}
    `;
    const countResult = await query(countQuery, params);
    const total = parseInt(countResult.rows[0].total, 10);

    // Get appointments with related data
    const appointmentsQuery = `
      SELECT 
        a.appointment_id,
        a.donor_hash_id,
        a.staff_id,
        a.donation_center_id,
        a.appointment_datetime,
        a.donation_type,
        a.status,
        a.booking_channel,
        a.confirmation_sent,
        a.reminder_sent,
        a.creation_timestamp,
        a.last_updated_timestamp,
        dc.name as center_name,
        dc.address as center_address,
        dc.city as center_city,
        u.first_name as staff_first_name,
        u.last_name as staff_last_name,
        d.preferred_language,
        d.is_active as donor_active
      FROM appointments a
      LEFT JOIN donation_centers dc ON a.donation_center_id = dc.center_id
      LEFT JOIN staff_portal.users u ON a.staff_id = u.user_id
      LEFT JOIN donors d ON a.donor_hash_id = d.donor_hash_id
      ${whereClause}
      ORDER BY a.${sort} ${order.toUpperCase()}
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    const appointmentsResult = await query(appointmentsQuery, [...params, limitNum, offset]);

    res.json({
      success: true,
      data: {
        appointments: appointmentsResult.rows,
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
 * GET /api/staff/appointments/:id
 * Get appointment details
 */
export const getAppointment = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;

    const result = await query(
      `SELECT 
        a.*,
        dc.name as center_name,
        dc.address as center_address,
        dc.city as center_city,
        dc.contact_phone as center_phone,
        u.first_name as staff_first_name,
        u.last_name as staff_last_name,
        d.preferred_language,
        d.preferred_communication_channel,
        d.is_active as donor_active,
        d.last_donation_date,
        d.total_donations_this_year
      FROM appointments a
      LEFT JOIN donation_centers dc ON a.donation_center_id = dc.center_id
      LEFT JOIN staff_portal.users u ON a.staff_id = u.user_id
      LEFT JOIN donors d ON a.donor_hash_id = d.donor_hash_id
      WHERE a.appointment_id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      res.status(404).json({
        success: false,
        error: {
          message: ErrorMessages.NOT_FOUND,
          statusCode: 404,
        },
      });
      return;
    }

    // Get donation history for this donor
    const historyResult = await query(
      `SELECT 
        donation_date,
        donation_type,
        donation_volume,
        status
      FROM donation_history
      WHERE donor_hash_id = $1
      ORDER BY donation_date DESC
      LIMIT 10`,
      [result.rows[0].donor_hash_id]
    );

    res.json({
      success: true,
      data: {
        appointment: result.rows[0],
        donation_history: historyResult.rows,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/staff/appointments/calendar
 * Get calendar view data for appointments
 */
export const getCalendarData = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { start, end, center_id } = req.query;

    if (!start || !end) {
      res.status(400).json({
        success: false,
        error: {
          message: 'Start and end dates are required',
          statusCode: 400,
        },
      });
      return;
    }

    const conditions: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;

    conditions.push(`a.appointment_datetime >= $${paramIndex}`);
    params.push(start);
    paramIndex++;

    conditions.push(`a.appointment_datetime < $${paramIndex}`);
    params.push(end);
    paramIndex++;

    if (center_id) {
      conditions.push(`a.donation_center_id = $${paramIndex}`);
      params.push(center_id);
      paramIndex++;
    }

    const whereClause = `WHERE ${conditions.join(' AND ')}`;

    const result = await query(
      `SELECT 
        a.appointment_id,
        a.donor_hash_id,
        a.appointment_datetime,
        a.donation_type,
        a.status,
        a.donation_center_id,
        dc.name as center_name
      FROM appointments a
      LEFT JOIN donation_centers dc ON a.donation_center_id = dc.center_id
      ${whereClause}
      ORDER BY a.appointment_datetime`,
      params
    );

    res.json({
      success: true,
      data: {
        appointments: result.rows,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/staff/appointments
 * Create appointment (manual booking)
 */
export const createAppointment = async (
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

    const { donor_hash_id, donation_center_id, appointment_datetime, donation_type, notes } = req.body;
    const currentUser = req.user!;

    // Validate donor exists and is active
    const donorResult = await query(
      `SELECT donor_hash_id, is_active, last_donation_date, total_donations_this_year
       FROM donors
       WHERE donor_hash_id = $1`,
      [donor_hash_id]
    );

    if (donorResult.rows.length === 0) {
      res.status(404).json({
        success: false,
        error: {
          message: 'Donor not found',
          statusCode: 404,
        },
      });
      return;
    }

    const donor = donorResult.rows[0];

    if (!donor.is_active) {
      res.status(400).json({
        success: false,
        error: {
          message: 'Donor account is not active',
          statusCode: 400,
        },
      });
      return;
    }

    // Check Italian donation rules
    const appointmentDate = parseISO(appointment_datetime);
    const validationError = await validateDonationRules(
      donor_hash_id,
      donation_type,
      appointmentDate,
      donor.last_donation_date,
      donor.total_donations_this_year
    );

    if (validationError) {
      res.status(400).json({
        success: false,
        error: {
          message: validationError,
          statusCode: 400,
        },
      });
      return;
    }

    // Check center capacity and prevent double-booking
    const capacityCheck = await checkCenterCapacity(donation_center_id, appointment_datetime);
    if (!capacityCheck.available) {
      res.status(409).json({
        success: false,
        error: {
          message: capacityCheck.message || 'Time slot not available',
          statusCode: 409,
        },
      });
      return;
    }

    // Create appointment
    const insertResult = await query(
      `INSERT INTO appointments (
        donor_hash_id,
        staff_id,
        donation_center_id,
        appointment_datetime,
        donation_type,
        status,
        booking_channel,
        creation_timestamp,
        last_updated_timestamp
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
      RETURNING *`,
      [donor_hash_id, currentUser.user_id, donation_center_id, appointment_datetime, donation_type, 'scheduled', 'staff_portal']
    );

    const appointment = insertResult.rows[0];

    // Audit log
    await createAuditLog({
      user_id: currentUser.user_id,
      action: 'create_appointment',
      resource_type: 'appointments',
      resource_id: appointment.appointment_id,
      details: {
        donor_hash_id,
        donation_center_id,
        appointment_datetime,
        donation_type,
        notes: notes || null,
      },
      ip_address: req.ip || req.socket.remoteAddress,
      user_agent: req.headers['user-agent'],
      status: 'success',
    });

    // Broadcast real-time update
    broadcastAppointmentUpdate({
      type: 'appointment_created',
      appointment,
    });

    res.status(201).json({
      success: true,
      data: {
        appointment,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/staff/appointments/:id
 * Update appointment
 */
export const updateAppointment = async (
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

    const { id } = req.params;
    const currentUser = req.user!;
    const { appointment_datetime, donation_type, donation_center_id, notes } = req.body;

    // Get existing appointment
    const existingResult = await query(
      `SELECT * FROM appointments WHERE appointment_id = $1`,
      [id]
    );

    if (existingResult.rows.length === 0) {
      res.status(404).json({
        success: false,
        error: {
          message: ErrorMessages.NOT_FOUND,
          statusCode: 404,
        },
      });
      return;
    }

    const existing = existingResult.rows[0];

    // Build update query
    const updateFields: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;

    if (appointment_datetime !== undefined) {
      // Check capacity if time changed
      const newDateTime = appointment_datetime || existing.appointment_datetime;
      const centerId = donation_center_id || existing.donation_center_id;
      
      if (appointment_datetime !== existing.appointment_datetime) {
        const capacityCheck = await checkCenterCapacity(centerId, newDateTime, id);
        if (!capacityCheck.available) {
          res.status(409).json({
            success: false,
            error: {
              message: capacityCheck.message || 'Time slot not available',
              statusCode: 409,
            },
          });
          return;
        }
      }

      updateFields.push(`appointment_datetime = $${paramIndex}`);
      params.push(appointment_datetime);
      paramIndex++;
    }

    if (donation_type !== undefined) {
      // Validate donation rules if type changed
      if (donation_type !== existing.donation_type) {
        const donorResult = await query(
          `SELECT last_donation_date, total_donations_this_year FROM donors WHERE donor_hash_id = $1`,
          [existing.donor_hash_id]
        );
        const donor = donorResult.rows[0];
        const appointmentDate = appointment_datetime ? parseISO(appointment_datetime) : parseISO(existing.appointment_datetime);
        
        const validationError = await validateDonationRules(
          existing.donor_hash_id,
          donation_type,
          appointmentDate,
          donor.last_donation_date,
          donor.total_donations_this_year
        );

        if (validationError) {
          res.status(400).json({
            success: false,
            error: {
              message: validationError,
              statusCode: 400,
            },
          });
          return;
        }
      }

      updateFields.push(`donation_type = $${paramIndex}`);
      params.push(donation_type);
      paramIndex++;
    }

    if (donation_center_id !== undefined) {
      updateFields.push(`donation_center_id = $${paramIndex}`);
      params.push(donation_center_id);
      paramIndex++;
    }

    if (updateFields.length === 0) {
      res.status(400).json({
        success: false,
        error: {
          message: 'No fields to update',
          statusCode: 400,
        },
      });
      return;
    }

    updateFields.push(`last_updated_timestamp = NOW()`);
    params.push(id);

    const updateQuery = `
      UPDATE appointments
      SET ${updateFields.join(', ')}
      WHERE appointment_id = $${paramIndex}
      RETURNING *
    `;

    const result = await query(updateQuery, params);
    const updated = result.rows[0];

    // Audit log
    await createAuditLog({
      user_id: currentUser.user_id,
      action: 'update_appointment',
      resource_type: 'appointments',
      resource_id: id,
      details: {
        changes: req.body,
        previous: existing,
        updated,
        notes: notes || null,
      },
      ip_address: req.ip || req.socket.remoteAddress,
      user_agent: req.headers['user-agent'],
      status: 'success',
    });

    // Broadcast real-time update
    broadcastAppointmentUpdate({
      type: 'appointment_updated',
      appointment: updated,
    });

    res.json({
      success: true,
      data: {
        appointment: updated,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/staff/appointments/:id/status
 * Update appointment status
 */
export const updateAppointmentStatus = async (
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

    const { id } = req.params;
    const { status, notes } = req.body;
    const currentUser = req.user!;

    // Get existing appointment
    const existingResult = await query(
      `SELECT * FROM appointments WHERE appointment_id = $1`,
      [id]
    );

    if (existingResult.rows.length === 0) {
      res.status(404).json({
        success: false,
        error: {
          message: ErrorMessages.NOT_FOUND,
          statusCode: 404,
        },
      });
      return;
    }

    const existing = existingResult.rows[0];

    // Validate status transition
    const validStatuses = ['scheduled', 'confirmed', 'arrived', 'in-progress', 'completed', 'cancelled', 'no-show'];
    if (!validStatuses.includes(status)) {
      res.status(400).json({
        success: false,
        error: {
          message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`,
          statusCode: 400,
        },
      });
      return;
    }

    // Update status
    const result = await query(
      `UPDATE appointments
       SET status = $1, last_updated_timestamp = NOW()
       WHERE appointment_id = $2
       RETURNING *`,
      [status, id]
    );

    const updated = result.rows[0];

    // If completed, update donor stats
    if (status === 'completed') {
      await query(
        `UPDATE donors
         SET last_donation_date = $1,
             total_donations_this_year = total_donations_this_year + 1
         WHERE donor_hash_id = $2`,
        [existing.appointment_datetime, existing.donor_hash_id]
      );
    }

    // Audit log
    await createAuditLog({
      user_id: currentUser.user_id,
      action: 'update_appointment_status',
      resource_type: 'appointments',
      resource_id: id,
      details: {
        previous_status: existing.status,
        new_status: status,
        notes: notes || null,
      },
      ip_address: req.ip || req.socket.remoteAddress,
      user_agent: req.headers['user-agent'],
      status: 'success',
    });

    // Broadcast real-time update
    broadcastAppointmentUpdate({
      type: 'appointment_status_changed',
      appointment: updated,
    });

    // If status is 'arrived', broadcast new arrival notification
    if (status === 'arrived') {
      const centerResult = await query(
        `SELECT name FROM donation_centers WHERE center_id = $1`,
        [updated.donation_center_id]
      );
      broadcastNewArrival({
        appointment_id: updated.appointment_id,
        donor_hash_id: updated.donor_hash_id,
        center_id: updated.donation_center_id,
        center_name: centerResult.rows[0]?.name || 'Unknown Center',
      });
    }

    res.json({
      success: true,
      data: {
        appointment: updated,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/staff/appointments/stats
 * Get appointment statistics
 */
export const getAppointmentStats = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { start_date, end_date, center_id } = req.query;

    const conditions: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;

    if (start_date) {
      conditions.push(`appointment_datetime >= $${paramIndex}`);
      params.push(start_date);
      paramIndex++;
    }

    if (end_date) {
      conditions.push(`appointment_datetime <= $${paramIndex}`);
      params.push(end_date);
      paramIndex++;
    }

    if (center_id) {
      conditions.push(`donation_center_id = $${paramIndex}`);
      params.push(center_id);
      paramIndex++;
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const statsResult = await query(
      `SELECT 
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE status = 'scheduled') as scheduled,
        COUNT(*) FILTER (WHERE status = 'confirmed') as confirmed,
        COUNT(*) FILTER (WHERE status = 'arrived') as arrived,
        COUNT(*) FILTER (WHERE status = 'completed') as completed,
        COUNT(*) FILTER (WHERE status = 'cancelled') as cancelled,
        COUNT(*) FILTER (WHERE status = 'no-show') as no_show,
        COUNT(*) FILTER (WHERE donation_type = 'whole_blood') as whole_blood,
        COUNT(*) FILTER (WHERE donation_type = 'plasma') as plasma
      FROM appointments
      ${whereClause}`,
      params
    );

    res.json({
      success: true,
      data: {
        stats: statsResult.rows[0],
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/staff/appointments/export
 * Export appointments to CSV
 */
export const exportAppointments = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { start_date, end_date, status, center_id } = req.query;

    const conditions: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;

    if (start_date) {
      conditions.push(`a.appointment_datetime >= $${paramIndex}`);
      params.push(start_date);
      paramIndex++;
    }

    if (end_date) {
      conditions.push(`a.appointment_datetime <= $${paramIndex}`);
      params.push(end_date);
      paramIndex++;
    }

    if (status) {
      conditions.push(`a.status = $${paramIndex}`);
      params.push(status);
      paramIndex++;
    }

    if (center_id) {
      conditions.push(`a.donation_center_id = $${paramIndex}`);
      params.push(center_id);
      paramIndex++;
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const result = await query(
      `SELECT 
        a.appointment_id,
        a.donor_hash_id,
        a.appointment_datetime,
        a.donation_type,
        a.status,
        a.booking_channel,
        dc.name as center_name,
        dc.city as center_city
      FROM appointments a
      LEFT JOIN donation_centers dc ON a.donation_center_id = dc.center_id
      ${whereClause}
      ORDER BY a.appointment_datetime
      LIMIT 10000`,
      params
    );

    // Generate CSV
    const csvHeaders = [
      'Appointment ID',
      'Donor Hash ID',
      'Date/Time',
      'Donation Type',
      'Status',
      'Booking Channel',
      'Center Name',
      'Center City',
    ];

    const csvRows = result.rows.map((row) => [
      row.appointment_id,
      row.donor_hash_id,
      format(new Date(row.appointment_datetime), 'yyyy-MM-dd HH:mm:ss'),
      row.donation_type,
      row.status,
      row.booking_channel,
      row.center_name || '',
      row.center_city || '',
    ]);

    const csvContent = [
      csvHeaders.join(','),
      ...csvRows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')),
    ].join('\n');

    const filename = `appointments-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    res.send(csvContent);
  } catch (error) {
    next(error);
  }
};

/**
 * Validate Italian donation rules
 */
async function validateDonationRules(
  donor_hash_id: string,
  donation_type: string,
  appointmentDate: Date,
  lastDonationDate: string | null,
  totalDonationsThisYear: number
): Promise<string | null> {
  if (!lastDonationDate) {
    return null; // First donation, no restrictions
  }

  const lastDonation = parseISO(lastDonationDate);
  const daysSinceLastDonation = differenceInDays(appointmentDate, lastDonation);

  if (donation_type === 'whole_blood') {
    // Whole blood: 90 days between donations, max 4/year
    if (daysSinceLastDonation < 90) {
      return `Minimum 90 days required between whole blood donations. Last donation was ${daysSinceLastDonation} days ago.`;
    }
    if (totalDonationsThisYear >= 4) {
      return 'Maximum 4 whole blood donations per year allowed.';
    }
  } else if (donation_type === 'plasma') {
    // Plasma: 14 days between donations, max 12 liters/year
    if (daysSinceLastDonation < 14) {
      return `Minimum 14 days required between plasma donations. Last donation was ${daysSinceLastDonation} days ago.`;
    }
    
    // Check plasma volume (assuming 650ml per donation)
    const plasmaVolumeThisYear = totalDonationsThisYear * 0.65;
    if (plasmaVolumeThisYear >= 12) {
      return 'Maximum 12 liters of plasma per year allowed.';
    }
  }

  return null;
}

/**
 * Check center capacity and prevent double-booking
 */
async function checkCenterCapacity(
  centerId: string,
  appointmentDateTime: string,
  excludeAppointmentId?: string
): Promise<{ available: boolean; message?: string }> {
  // Get center capacity (assuming centers table has capacity field)
  const centerResult = await query(
    `SELECT capacity, name FROM donation_centers WHERE center_id = $1`,
    [centerId]
  );

  if (centerResult.rows.length === 0) {
    return { available: false, message: 'Center not found' };
  }

  const center = centerResult.rows[0];
  const capacity = center.capacity || 10; // Default capacity

  // Count existing appointments at the same time (within 30 minutes)
  const timeWindowStart = new Date(new Date(appointmentDateTime).getTime() - 30 * 60 * 1000).toISOString();
  const timeWindowEnd = new Date(new Date(appointmentDateTime).getTime() + 30 * 60 * 1000).toISOString();

  let countQuery = `
    SELECT COUNT(*) as count
    FROM appointments
    WHERE donation_center_id = $1
      AND appointment_datetime >= $2
      AND appointment_datetime <= $3
      AND status NOT IN ('cancelled', 'no-show')
  `;
  const params: any[] = [centerId, timeWindowStart, timeWindowEnd];

  if (excludeAppointmentId) {
    countQuery += ` AND appointment_id != $4`;
    params.push(excludeAppointmentId);
  }

  const countResult = await query(countQuery, params);
  const existingCount = parseInt(countResult.rows[0].count, 10);

  if (existingCount >= capacity) {
    return {
      available: false,
      message: `Center is at capacity. ${existingCount}/${capacity} appointments scheduled.`,
    };
  }

  return { available: true };
}

// Validation rules
export const listAppointmentsValidation = [
  queryValidator('page').optional().isInt({ min: 1 }),
  queryValidator('limit').optional().isInt({ min: 1, max: 100 }),
  queryValidator('status').optional().isIn(['scheduled', 'confirmed', 'arrived', 'in-progress', 'completed', 'cancelled', 'no-show']),
  queryValidator('donation_type').optional().isIn(['whole_blood', 'plasma']),
  queryValidator('start_date').optional().isISO8601(),
  queryValidator('end_date').optional().isISO8601(),
  queryValidator('sort').optional().isIn(['appointment_datetime', 'status', 'donation_type', 'creation_timestamp']),
  queryValidator('order').optional().isIn(['asc', 'desc']),
];

export const createAppointmentValidation = [
  body('donor_hash_id').trim().isLength({ min: 1 }),
  body('donation_center_id').isUUID(),
  body('appointment_datetime').isISO8601(),
  body('donation_type').isIn(['whole_blood', 'plasma']),
  body('notes').optional().trim(),
];

export const updateAppointmentValidation = [
  body('appointment_datetime').optional().isISO8601(),
  body('donation_type').optional().isIn(['whole_blood', 'plasma']),
  body('donation_center_id').optional().isUUID(),
  body('notes').optional().trim(),
];

export const updateStatusValidation = [
  body('status').isIn(['scheduled', 'confirmed', 'arrived', 'in-progress', 'completed', 'cancelled', 'no-show']),
  body('notes').optional().trim(),
];

