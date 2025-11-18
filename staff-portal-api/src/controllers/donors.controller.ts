/**
 * Donors Controller
 * Privacy-first donor management with hash-based identification
 */

import { Request, Response, NextFunction } from 'express';
import { body, validationResult, query as queryValidator } from 'express-validator';
import { AuthenticatedRequest } from '../types/index.js';
import { query } from '../config/database.js';
import { AppError, ErrorMessages } from '../utils/errors.js';
import { createAuditLog } from '../models/audit.model.js';
import { format, parseISO, differenceInDays, addDays } from 'date-fns';

/**
 * GET /api/staff/donors
 * List donors with filtering, pagination, and search
 * Privacy: Only returns hashed IDs and minimal PII
 */
export const listDonors = async (
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
      center_id,
      eligibility_status,
      donation_type,
      start_date,
      end_date,
      search,
      sort = 'last_donation_date',
      order = 'desc',
    } = req.query;

    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const offset = (pageNum - 1) * limitNum;
    const currentUser = req.user!;

    // Build WHERE clause
    const conditions: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;

    if (center_id) {
      conditions.push(`d.avis_donor_center = $${paramIndex}`);
      params.push(center_id);
      paramIndex++;
    }

    if (eligibility_status) {
      if (eligibility_status === 'eligible') {
        conditions.push(`d.is_active = true AND (d.last_donation_date IS NULL OR d.last_donation_date < NOW() - INTERVAL '90 days')`);
      } else if (eligibility_status === 'ineligible') {
        conditions.push(`(d.is_active = false OR d.last_donation_date >= NOW() - INTERVAL '90 days')`);
      }
    }

    if (search) {
      // Search by hash (partial match on first 8 characters)
      conditions.push(`d.donor_hash_id LIKE $${paramIndex}`);
      params.push(`${search}%`);
      paramIndex++;
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // Get total count
    const countQuery = `
      SELECT COUNT(*) as total
      FROM donors d
      ${whereClause}
    `;
    const countResult = await query(countQuery, params);
    const total = parseInt(countResult.rows[0].total, 10);

    // Get donors with donation stats (privacy: only hash, no PII)
    const donorsQuery = `
      SELECT 
        d.donor_hash_id,
        d.is_active,
        d.last_donation_date,
        d.total_donations_this_year,
        d.avis_donor_center,
        dc.name as center_name,
        COUNT(DISTINCT dh.donation_id) as total_donations,
        MAX(dh.donation_date) as most_recent_donation
      FROM donors d
      LEFT JOIN donation_centers dc ON d.avis_donor_center = dc.center_id::text
      LEFT JOIN donation_history dh ON d.donor_hash_id = dh.donor_hash_id
      ${whereClause}
      GROUP BY d.donor_hash_id, d.is_active, d.last_donation_date, d.total_donations_this_year, d.avis_donor_center, dc.name
      ORDER BY d.${sort} ${order.toUpperCase()} NULLS LAST
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    const donorsResult = await query(donorsQuery, [...params, limitNum, offset]);

    // Calculate eligibility for each donor
    const donors = donorsResult.rows.map((row) => {
      const eligibility = calculateEligibility(row.last_donation_date, row.is_active);
      return {
        donor_hash_id: row.donor_hash_id,
        hash_display: `${row.donor_hash_id.substring(0, 8)}...${row.donor_hash_id.substring(row.donor_hash_id.length - 4)}`,
        is_active: row.is_active,
        last_donation_date: row.last_donation_date,
        total_donations: parseInt(row.total_donations, 10) || 0,
        total_donations_this_year: row.total_donations_this_year || 0,
        center_name: row.center_name || 'Unknown',
        eligibility_status: eligibility.status,
        next_eligible_date: eligibility.nextEligibleDate,
        days_until_eligible: eligibility.daysUntilEligible,
      };
    });

    // Audit log - log access to donor list
    await createAuditLog({
      user_id: currentUser.user_id,
      action: 'view_donor_list',
      resource_type: 'donors',
      resource_id: null,
      details: {
        filters: req.query,
        result_count: donors.length,
      },
      ip_address: req.ip || req.socket.remoteAddress,
      user_agent: req.headers['user-agent'],
      status: 'success',
    });

    res.json({
      success: true,
      data: {
        donors,
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
 * GET /api/staff/donors/:hash
 * Get donor by hash (privacy: only hash-based lookup)
 */
export const getDonorByHash = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { hash } = req.params;
    const currentUser = req.user!;

    // Get donor by hash (never by actual ID)
    const donorResult = await query(
      `SELECT 
        d.donor_hash_id,
        d.is_active,
        d.last_donation_date,
        d.total_donations_this_year,
        d.avis_donor_center,
        d.preferred_language,
        d.preferred_communication_channel,
        d.initial_vetting_status,
        dc.name as center_name,
        dc.address as center_address,
        dc.city as center_city
      FROM donors d
      LEFT JOIN donation_centers dc ON d.avis_donor_center = dc.center_id::text
      WHERE d.donor_hash_id = $1`,
      [hash]
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

    // Calculate eligibility
    const eligibility = calculateEligibility(donor.last_donation_date, donor.is_active);

    // Get staff notes (if user has permission)
    let staffNotes = null;
    if (currentUser.permissions.some((p) => p.permission_name === 'donors:view_notes')) {
      const notesResult = await query(
        `SELECT note_id, note_text, created_by, created_at
         FROM staff_portal.donor_notes
         WHERE donor_hash_id = $1
         ORDER BY created_at DESC
         LIMIT 10`,
        [hash]
      );
      staffNotes = notesResult.rows;
    }

    // Audit log - log access to specific donor record
    await createAuditLog({
      user_id: currentUser.user_id,
      action: 'view_donor_profile',
      resource_type: 'donors',
      resource_id: hash,
      details: {
        donor_hash_id: hash,
        accessed_by: currentUser.email,
      },
      ip_address: req.ip || req.socket.remoteAddress,
      user_agent: req.headers['user-agent'],
      status: 'success',
    });

    res.json({
      success: true,
      data: {
        donor: {
          ...donor,
          hash_display: `${donor.donor_hash_id.substring(0, 8)}...${donor.donor_hash_id.substring(donor.donor_hash_id.length - 4)}`,
          eligibility,
          staff_notes: staffNotes,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/staff/donors/:hash/history
 * Get donation history for a donor
 */
export const getDonorHistory = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { hash } = req.params;
    const currentUser = req.user!;

    // Verify donor exists
    const donorCheck = await query(
      `SELECT donor_hash_id FROM donors WHERE donor_hash_id = $1`,
      [hash]
    );

    if (donorCheck.rows.length === 0) {
      res.status(404).json({
        success: false,
        error: {
          message: 'Donor not found',
          statusCode: 404,
        },
      });
      return;
    }

    // Get donation history
    const historyResult = await query(
      `SELECT 
        dh.donation_id,
        dh.donation_date,
        dh.donation_type,
        dh.donation_volume,
        dh.status,
        dh.notes,
        dh.donation_center_id,
        dc.name as center_name,
        u.first_name as staff_first_name,
        u.last_name as staff_last_name
      FROM donation_history dh
      LEFT JOIN donation_centers dc ON dh.donation_center_id = dc.center_id
      LEFT JOIN staff_portal.users u ON dh.staff_id = u.user_id
      WHERE dh.donor_hash_id = $1
      ORDER BY dh.donation_date DESC`,
      [hash]
    );

    // Audit log
    await createAuditLog({
      user_id: currentUser.user_id,
      action: 'view_donor_history',
      resource_type: 'donors',
      resource_id: hash,
      details: {
        donor_hash_id: hash,
        history_count: historyResult.rows.length,
      },
      ip_address: req.ip || req.socket.remoteAddress,
      user_agent: req.headers['user-agent'],
      status: 'success',
    });

    res.json({
      success: true,
      data: {
        history: historyResult.rows,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/staff/donors/:hash/eligibility
 * Check current eligibility status
 */
export const getDonorEligibility = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { hash } = req.params;
    const { donation_type = 'whole_blood' } = req.query;
    const currentUser = req.user!;

    // Get donor info
    const donorResult = await query(
      `SELECT 
        donor_hash_id,
        is_active,
        last_donation_date,
        total_donations_this_year
      FROM donors
      WHERE donor_hash_id = $1`,
      [hash]
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
    const eligibility = calculateDetailedEligibility(
      donor.last_donation_date,
      donor.is_active,
      donor.total_donations_this_year,
      donation_type as string
    );

    // Audit log
    await createAuditLog({
      user_id: currentUser.user_id,
      action: 'check_donor_eligibility',
      resource_type: 'donors',
      resource_id: hash,
      details: {
        donor_hash_id: hash,
        donation_type,
        eligibility_status: eligibility.status,
      },
      ip_address: req.ip || req.socket.remoteAddress,
      user_agent: req.headers['user-agent'],
      status: 'success',
    });

    res.json({
      success: true,
      data: {
        eligibility,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/staff/donors/:hash/notes
 * Add staff notes (privacy: only medical/admin staff)
 */
export const addDonorNotes = async (
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

    const { hash } = req.params;
    const { note_text, note_type = 'general' } = req.body;
    const currentUser = req.user!;

    // Verify donor exists
    const donorCheck = await query(
      `SELECT donor_hash_id FROM donors WHERE donor_hash_id = $1`,
      [hash]
    );

    if (donorCheck.rows.length === 0) {
      res.status(404).json({
        success: false,
        error: {
          message: 'Donor not found',
          statusCode: 404,
        },
      });
      return;
    }

    // Check if notes table exists, create if not
    await query(`
      CREATE TABLE IF NOT EXISTS staff_portal.donor_notes (
        note_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        donor_hash_id VARCHAR NOT NULL,
        note_text TEXT NOT NULL,
        note_type VARCHAR DEFAULT 'general',
        created_by UUID NOT NULL REFERENCES staff_portal.users(user_id),
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `);

    // Insert note
    const noteResult = await query(
      `INSERT INTO staff_portal.donor_notes (donor_hash_id, note_text, note_type, created_by)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [hash, note_text, note_type, currentUser.user_id]
    );

    // Audit log
    await createAuditLog({
      user_id: currentUser.user_id,
      action: 'add_donor_note',
      resource_type: 'donors',
      resource_id: hash,
      details: {
        donor_hash_id: hash,
        note_type,
        note_length: note_text.length,
      },
      ip_address: req.ip || req.socket.remoteAddress,
      user_agent: req.headers['user-agent'],
      status: 'success',
    });

    res.json({
      success: true,
      data: {
        note: noteResult.rows[0],
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/staff/donors/stats
 * Get aggregated donor statistics (privacy: no individual data)
 */
export const getDonorStats = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { center_id, start_date, end_date } = req.query;

    const conditions: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;

    if (center_id) {
      conditions.push(`d.avis_donor_center = $${paramIndex}`);
      params.push(center_id);
      paramIndex++;
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // Get aggregated statistics (no individual donor data)
    const statsResult = await query(
      `SELECT 
        COUNT(DISTINCT d.donor_hash_id) as total_donors,
        COUNT(DISTINCT d.donor_hash_id) FILTER (WHERE d.is_active = true) as active_donors,
        COUNT(DISTINCT d.donor_hash_id) FILTER (WHERE d.last_donation_date >= NOW() - INTERVAL '1 year') as donors_last_year,
        AVG(d.total_donations_this_year) as avg_donations_per_donor,
        COUNT(DISTINCT dh.donation_id) as total_donations,
        COUNT(DISTINCT dh.donation_id) FILTER (WHERE dh.donation_type = 'whole_blood') as whole_blood_donations,
        COUNT(DISTINCT dh.donation_id) FILTER (WHERE dh.donation_type = 'plasma') as plasma_donations
      FROM donors d
      LEFT JOIN donation_history dh ON d.donor_hash_id = dh.donor_hash_id
      ${whereClause}`,
      params
    );

    // Get donation frequency trends (aggregated by month)
    const trendsResult = await query(
      `SELECT 
        DATE_TRUNC('month', dh.donation_date) as month,
        COUNT(*) as donation_count
      FROM donation_history dh
      ${whereClause.replace('d.', 'dh.')}
      GROUP BY DATE_TRUNC('month', dh.donation_date)
      ORDER BY month DESC
      LIMIT 12`,
      params
    );

    res.json({
      success: true,
      data: {
        stats: statsResult.rows[0],
        trends: trendsResult.rows,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/staff/donors/search
 * Search donors by various criteria (privacy: hash-based only)
 */
export const searchDonors = async (
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

    const { hash_prefix, center_id, last_donation_after, last_donation_before } = req.body;
    const currentUser = req.user!;

    const conditions: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;

    if (hash_prefix) {
      conditions.push(`d.donor_hash_id LIKE $${paramIndex}`);
      params.push(`${hash_prefix}%`);
      paramIndex++;
    }

    if (center_id) {
      conditions.push(`d.avis_donor_center = $${paramIndex}`);
      params.push(center_id);
      paramIndex++;
    }

    if (last_donation_after) {
      conditions.push(`d.last_donation_date >= $${paramIndex}`);
      params.push(last_donation_after);
      paramIndex++;
    }

    if (last_donation_before) {
      conditions.push(`d.last_donation_date <= $${paramIndex}`);
      params.push(last_donation_before);
      paramIndex++;
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const result = await query(
      `SELECT 
        d.donor_hash_id,
        d.is_active,
        d.last_donation_date,
        d.total_donations_this_year,
        dc.name as center_name
      FROM donors d
      LEFT JOIN donation_centers dc ON d.avis_donor_center = dc.center_id::text
      ${whereClause}
      LIMIT 50`,
      params
    );

    // Audit log
    await createAuditLog({
      user_id: currentUser.user_id,
      action: 'search_donors',
      resource_type: 'donors',
      resource_id: null,
      details: {
        search_criteria: req.body,
        result_count: result.rows.length,
      },
      ip_address: req.ip || req.socket.remoteAddress,
      user_agent: req.headers['user-agent'],
      status: 'success',
    });

    res.json({
      success: true,
      data: {
        donors: result.rows.map((row) => ({
          ...row,
          hash_display: `${row.donor_hash_id.substring(0, 8)}...${row.donor_hash_id.substring(row.donor_hash_id.length - 4)}`,
        })),
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Calculate eligibility status
 */
function calculateEligibility(
  lastDonationDate: string | null,
  isActive: boolean
): { status: string; nextEligibleDate: string | null; daysUntilEligible: number | null } {
  if (!isActive) {
    return { status: 'inactive', nextEligibleDate: null, daysUntilEligible: null };
  }

  if (!lastDonationDate) {
    return { status: 'eligible', nextEligibleDate: null, daysUntilEligible: 0 };
  }

  const lastDonation = parseISO(lastDonationDate);
  const daysSince = differenceInDays(new Date(), lastDonation);

  if (daysSince >= 90) {
    return { status: 'eligible', nextEligibleDate: null, daysUntilEligible: 0 };
  }

  const nextEligible = addDays(lastDonation, 90);
  const daysUntil = differenceInDays(nextEligible, new Date());

  return {
    status: 'ineligible',
    nextEligibleDate: format(nextEligible, 'yyyy-MM-dd'),
    daysUntilEligible: daysUntil,
  };
}

/**
 * Calculate detailed eligibility with Italian rules
 */
function calculateDetailedEligibility(
  lastDonationDate: string | null,
  isActive: boolean,
  totalDonationsThisYear: number,
  donationType: string
): {
  status: string;
  eligible: boolean;
  nextEligibleDate: string | null;
  daysUntilEligible: number | null;
  reasons: string[];
  rules: {
    minDays: number;
    maxPerYear: number;
    daysSinceLast: number | null;
    donationsThisYear: number;
  };
} {
  const reasons: string[] = [];

  if (!isActive) {
    reasons.push('Donor account is inactive');
    return {
      status: 'ineligible',
      eligible: false,
      nextEligibleDate: null,
      daysUntilEligible: null,
      reasons,
      rules: {
        minDays: donationType === 'plasma' ? 14 : 90,
        maxPerYear: donationType === 'plasma' ? 12 : 4,
        daysSinceLast: null,
        donationsThisYear: totalDonationsThisYear || 0,
      },
    };
  }

  const minDays = donationType === 'plasma' ? 14 : 90;
  const maxPerYear = donationType === 'plasma' ? 12 : 4;

  if (!lastDonationDate) {
    return {
      status: 'eligible',
      eligible: true,
      nextEligibleDate: null,
      daysUntilEligible: 0,
      reasons: [],
      rules: {
        minDays,
        maxPerYear,
        daysSinceLast: null,
        donationsThisYear: totalDonationsThisYear || 0,
      },
    };
  }

  const lastDonation = parseISO(lastDonationDate);
  const daysSince = differenceInDays(new Date(), lastDonation);

  if (daysSince < minDays) {
    const nextEligible = addDays(lastDonation, minDays);
    const daysUntil = differenceInDays(nextEligible, new Date());
    reasons.push(`Minimum ${minDays} days required since last donation (${daysSince} days elapsed)`);
    return {
      status: 'ineligible',
      eligible: false,
      nextEligibleDate: format(nextEligible, 'yyyy-MM-dd'),
      daysUntilEligible: daysUntil,
      reasons,
      rules: {
        minDays,
        maxPerYear,
        daysSinceLast: daysSince,
        donationsThisYear: totalDonationsThisYear || 0,
      },
    };
  }

  if (totalDonationsThisYear >= maxPerYear) {
    reasons.push(`Maximum ${maxPerYear} ${donationType === 'plasma' ? 'liters' : 'donations'} per year reached`);
    return {
      status: 'ineligible',
      eligible: false,
      nextEligibleDate: null,
      daysUntilEligible: null,
      reasons,
      rules: {
        minDays,
        maxPerYear,
        daysSinceLast: daysSince,
        donationsThisYear: totalDonationsThisYear || 0,
      },
    };
  }

  return {
    status: 'eligible',
    eligible: true,
    nextEligibleDate: null,
    daysUntilEligible: 0,
    reasons: [],
    rules: {
      minDays,
      maxPerYear,
      daysSinceLast: daysSince,
      donationsThisYear: totalDonationsThisYear || 0,
    },
  };
}

// Validation rules
export const listDonorsValidation = [
  queryValidator('page').optional().isInt({ min: 1 }),
  queryValidator('limit').optional().isInt({ min: 1, max: 100 }),
  queryValidator('eligibility_status').optional().isIn(['eligible', 'ineligible']),
  queryValidator('donation_type').optional().isIn(['whole_blood', 'plasma']),
  queryValidator('start_date').optional().isISO8601(),
  queryValidator('end_date').optional().isISO8601(),
  queryValidator('sort').optional().isIn(['last_donation_date', 'total_donations_this_year', 'donor_hash_id']),
  queryValidator('order').optional().isIn(['asc', 'desc']),
];

export const addNotesValidation = [
  body('note_text').trim().isLength({ min: 1, max: 5000 }),
  body('note_type').optional().isIn(['general', 'medical', 'administrative']),
];

export const searchDonorsValidation = [
  body('hash_prefix').optional().trim().isLength({ min: 4, max: 64 }),
  body('center_id').optional().isUUID(),
  body('last_donation_after').optional().isISO8601(),
  body('last_donation_before').optional().isISO8601(),
];

