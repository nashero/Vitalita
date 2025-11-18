/**
 * AVIS Centers Management Controller
 * Handles center-related operations
 */

import { Request, Response, NextFunction } from 'express';
import { validationResult, query as queryValidator } from 'express-validator';
import { AuthenticatedRequest } from '../types/index.js';
import { query } from '../config/database.js';
import { AppError, ErrorMessages } from '../utils/errors.js';
import { createAuditLog } from '../models/audit.model.js';
import { canUserAccessCenter } from '../middleware/rbac.middleware.js';
import { body } from 'express-validator';

/**
 * GET /api/auth/centers (Public)
 * List active AVIS centers for registration (no authentication required)
 */
export const listCentersForRegistration = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    console.log('[listCentersForRegistration] Fetching centers for registration');
    
    // Query to get active centers - bypass RLS by using service role connection
    // The direct PostgreSQL connection should have BYPASSRLS privilege
    const result = await query(
      `SELECT center_id, center_code, name, center_type
       FROM staff_portal.avis_centers
       WHERE is_active = true
       ORDER BY center_type, name`,
      []
    );

    console.log(`[listCentersForRegistration] Found ${result.rows.length} active centers`);
    
    // Debug: If no centers found, check if any centers exist at all
    if (result.rows.length === 0) {
      console.warn('[listCentersForRegistration] No active centers found. Checking if any centers exist...');
      const allCentersCheck = await query(
        `SELECT COUNT(*) as total, COUNT(*) FILTER (WHERE is_active = true) as active_count
         FROM staff_portal.avis_centers`,
        []
      );
      const stats = allCentersCheck.rows[0];
      console.log(`[listCentersForRegistration] DB Stats - Total: ${stats.total}, Active: ${stats.active_count}`);
      
      if (stats.total > 0 && stats.active_count === 0) {
        console.warn('[listCentersForRegistration] WARNING: Centers exist but none have is_active = true');
      } else if (stats.total === 0) {
        console.warn('[listCentersForRegistration] WARNING: No centers found in staff_portal.avis_centers table');
      }
    } else {
      console.log(`[listCentersForRegistration] Sample centers:`, result.rows.slice(0, 3).map(c => ({ 
        code: c.center_code, 
        name: c.name 
      })));
    }
    
    res.json({
      success: true,
      data: {
        centers: result.rows,
      },
    });
  } catch (error: any) {
    console.error('[listCentersForRegistration] Error:', error);
    console.error('[listCentersForRegistration] Error details:', {
      message: error.message,
      code: error.code,
      detail: error.detail,
      hint: error.hint,
    });
    next(error);
  }
};

/**
 * GET /api/staff/centers
 * List AVIS centers (hierarchical)
 */
export const listCenters = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { type, parent_id, region, province, active_only = 'true' } = req.query;
    const currentUser = req.user!;

    let centersQuery = `
      SELECT 
        c.*,
        COUNT(DISTINCT u.user_id) as staff_count
      FROM staff_portal.avis_centers c
      LEFT JOIN staff_portal.users u ON c.center_id = u.avis_center_id AND u.is_active = true
    `;

    const conditions: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;

    if (active_only === 'true') {
      conditions.push(`c.is_active = $${paramIndex}`);
      params.push(true);
      paramIndex++;
    }

    if (type) {
      conditions.push(`c.center_type = $${paramIndex}`);
      params.push(type);
      paramIndex++;
    }

    if (parent_id) {
      conditions.push(`c.parent_center_id = $${paramIndex}`);
      params.push(parent_id);
      paramIndex++;
    }

    if (region) {
      conditions.push(`c.region = $${paramIndex}`);
      params.push(region);
      paramIndex++;
    }

    if (province) {
      conditions.push(`c.province = $${paramIndex}`);
      params.push(province);
      paramIndex++;
    }

    if (conditions.length > 0) {
      centersQuery += ` WHERE ${conditions.join(' AND ')}`;
    }

    centersQuery += ` GROUP BY c.center_id ORDER BY c.center_type, c.name`;

    const result = await query(centersQuery, params);

    // Filter centers based on user's access level
    const accessibleCenters = [];
    for (const center of result.rows) {
      const canAccess = await canUserAccessCenter(currentUser.user_id, center.center_id);
      if (canAccess) {
        accessibleCenters.push(center);
      }
    }

    res.json({
      success: true,
      data: {
        centers: accessibleCenters,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/staff/centers/:id
 * Get center details with hierarchy
 */
export const getCenter = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const currentUser = req.user!;

    // Check access
    const canAccess = await canUserAccessCenter(currentUser.user_id, id);
    if (!canAccess) {
      res.status(403).json({
        success: false,
        error: {
          message: ErrorMessages.FORBIDDEN,
          statusCode: 403,
        },
      });
      return;
    }

    // Get center
    const centerResult = await query(
      `SELECT * FROM staff_portal.avis_centers WHERE center_id = $1`,
      [id]
    );

    if (centerResult.rows.length === 0) {
      res.status(404).json({
        success: false,
        error: {
          message: ErrorMessages.NOT_FOUND,
          statusCode: 404,
        },
      });
      return;
    }

    const center = centerResult.rows[0];

    // Get parent center if exists
    let parent = null;
    if (center.parent_center_id) {
      const parentResult = await query(
        `SELECT center_id, center_code, name, center_type 
         FROM staff_portal.avis_centers 
         WHERE center_id = $1`,
        [center.parent_center_id]
      );
      parent = parentResult.rows[0] || null;
    }

    // Get child centers
    const childrenResult = await query(
      `SELECT center_id, center_code, name, center_type 
       FROM staff_portal.avis_centers 
       WHERE parent_center_id = $1 AND is_active = true
       ORDER BY center_type, name`,
      [id]
    );

    res.json({
      success: true,
      data: {
        center: {
          ...center,
          parent,
          children: childrenResult.rows,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/staff/centers/:id/staff
 * Get staff members at a specific center
 */
export const getCenterStaff = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const { page = '1', limit = '20' } = req.query;
    const currentUser = req.user!;

    // Check access
    const canAccess = await canUserAccessCenter(currentUser.user_id, id);
    if (!canAccess) {
      res.status(403).json({
        success: false,
        error: {
          message: ErrorMessages.FORBIDDEN,
          statusCode: 403,
        },
      });
      return;
    }

    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const offset = (pageNum - 1) * limitNum;

    // Get total count
    const countResult = await query(
      `SELECT COUNT(*) as total 
       FROM staff_portal.users 
       WHERE avis_center_id = $1 AND is_active = true`,
      [id]
    );
    const total = parseInt(countResult.rows[0].total, 10);

    // Get staff with roles
    const staffResult = await query(
      `SELECT 
        u.user_id,
        u.email,
        u.first_name,
        u.last_name,
        u.organizational_level,
        u.is_active,
        u.last_login_at,
        json_agg(
          json_build_object(
            'role_id', r.role_id,
            'role_name', r.role_name,
            'role_code', r.role_code
          )
        ) FILTER (WHERE r.role_id IS NOT NULL) as roles
       FROM staff_portal.users u
       LEFT JOIN staff_portal.user_roles ur ON u.user_id = ur.user_id AND ur.is_active = true
       LEFT JOIN staff_portal.roles r ON ur.role_id = r.role_id
       WHERE u.avis_center_id = $1 AND u.is_active = true
       GROUP BY u.user_id
       ORDER BY u.last_name, u.first_name
       LIMIT $2 OFFSET $3`,
      [id, limitNum, offset]
    );

    res.json({
      success: true,
      data: {
        staff: staffResult.rows.map((row) => ({
          ...row,
          roles: row.roles || [],
        })),
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
 * PUT /api/staff/centers/:id
 * Update center information
 */
export const updateCenter = async (
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
    const updates = req.body;

    // Check access
    const canAccess = await canUserAccessCenter(currentUser.user_id, id);
    if (!canAccess) {
      res.status(403).json({
        success: false,
        error: {
          message: ErrorMessages.FORBIDDEN,
          statusCode: 403,
        },
      });
      return;
    }

    // Get existing center
    const existingResult = await query(
      `SELECT * FROM staff_portal.avis_centers WHERE center_id = $1`,
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

    const existingCenter = existingResult.rows[0];

    // Build update query
    const allowedFields = [
      'name',
      'address',
      'city',
      'province',
      'region',
      'postal_code',
      'contact_phone',
      'contact_email',
      'website_url',
      'is_active',
    ];

    const updateFields: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;

    for (const field of allowedFields) {
      if (updates[field] !== undefined) {
        updateFields.push(`${field} = $${paramIndex}`);
        params.push(updates[field]);
        paramIndex++;
      }
    }

    if (updateFields.length === 0) {
      res.status(400).json({
        success: false,
        error: {
          message: 'No valid fields to update',
          statusCode: 400,
        },
      });
      return;
    }

    updateFields.push(`updated_at = NOW()`);
    params.push(id);

    const updateQuery = `
      UPDATE staff_portal.avis_centers
      SET ${updateFields.join(', ')}
      WHERE center_id = $${paramIndex}
      RETURNING *
    `;

    const result = await query(updateQuery, params);
    const updatedCenter = result.rows[0];

    // Audit log
    await createAuditLog({
      user_id: currentUser.user_id,
      action: 'update_center',
      resource_type: 'avis_centers',
      resource_id: id,
      details: {
        changes: updates,
        previous: existingCenter,
        updated: updatedCenter,
      },
      ip_address: req.ip || req.socket.remoteAddress,
      user_agent: req.headers['user-agent'],
      status: 'success',
    });

    res.json({
      success: true,
      data: {
        center: updatedCenter,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Validation rules
export const listCentersValidation = [
  queryValidator('type').optional().isIn(['National', 'Regional', 'Provincial', 'Municipal']),
  queryValidator('parent_id').optional().isUUID(),
  queryValidator('active_only').optional().isIn(['true', 'false']),
];

export const updateCenterValidation = [
  body('name').optional().trim().isLength({ min: 1, max: 255 }),
  body('address').optional().trim(),
  body('city').optional().trim().isLength({ max: 100 }),
  body('province').optional().trim().isLength({ max: 100 }),
  body('region').optional().trim().isLength({ max: 100 }),
  body('postal_code').optional().trim().isLength({ max: 20 }),
  body('contact_phone').optional().trim(),
  body('contact_email').optional().isEmail(),
  body('website_url').optional().isURL(),
  body('is_active').optional().isBoolean(),
];

