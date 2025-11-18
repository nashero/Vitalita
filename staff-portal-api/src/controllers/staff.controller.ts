/**
 * Staff Management Controller
 * Handles CRUD operations for staff users
 */

import { Request, Response, NextFunction } from 'express';
import { body, validationResult, query as queryValidator } from 'express-validator';
import { AuthenticatedRequest } from '../types/index.js';
import {
  getUserById,
  getUserWithRolesAndPermissions,
  createUser,
  updateUserPassword,
  activateUser,
  getCenterAdministrators,
  assignRoleToUser,
} from '../models/user.model.js';
import { query } from '../config/database.js';
import { AppError, ErrorMessages } from '../utils/errors.js';
import { createAuditLog } from '../models/audit.model.js';

/**
 * GET /api/staff/users
 * List all staff members with filtering, pagination, and search
 */
export const listUsers = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
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
      role,
      status,
      center,
      organizational_level,
      search,
      sort = 'created_at',
      order = 'desc',
    } = req.query;

    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const offset = (pageNum - 1) * limitNum;

    // Build WHERE clause
    const conditions: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;

    if (status) {
      conditions.push(`u.is_active = $${paramIndex}`);
      params.push(status === 'active');
      paramIndex++;
    }

    if (center) {
      conditions.push(`u.avis_center_id = $${paramIndex}`);
      params.push(center);
      paramIndex++;
    }

    if (organizational_level) {
      conditions.push(`u.organizational_level = $${paramIndex}`);
      params.push(organizational_level);
      paramIndex++;
    }

    if (search) {
      conditions.push(
        `(u.first_name ILIKE $${paramIndex} OR u.last_name ILIKE $${paramIndex} OR u.email ILIKE $${paramIndex})`
      );
      params.push(`%${search}%`);
      paramIndex++;
    }

    // Role filtering (if specified)
    if (role) {
      conditions.push(`EXISTS (
        SELECT 1 FROM staff_portal.user_roles ur_filter
        INNER JOIN staff_portal.roles r_filter ON ur_filter.role_id = r_filter.role_id
        WHERE ur_filter.user_id = u.user_id
        AND ur_filter.is_active = true
        AND r_filter.role_code = $${paramIndex}
      )`);
      params.push(role);
      paramIndex++;
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // Get total count
    const countQuery = `
      SELECT COUNT(DISTINCT u.user_id) as total
      FROM staff_portal.users u
      ${whereClause}
    `;
    const countResult = await query(countQuery, params);
    const total = parseInt(countResult.rows[0].total, 10);

    // Get users with roles
    const usersQuery = `
      SELECT 
        u.user_id,
        u.email,
        u.first_name,
        u.last_name,
        u.phone_number,
        u.avis_center_id,
        u.organizational_level,
        u.is_active,
        u.is_email_verified,
        u.last_login_at,
        u.created_at,
        u.updated_at,
        c.name as center_name,
        c.center_code,
        json_agg(
          json_build_object(
            'role_id', r.role_id,
            'role_name', r.role_name,
            'role_code', r.role_code,
            'role_category', r.role_category
          )
        ) FILTER (WHERE r.role_id IS NOT NULL) as roles
      FROM staff_portal.users u
      LEFT JOIN staff_portal.avis_centers c ON u.avis_center_id = c.center_id
      LEFT JOIN staff_portal.user_roles ur ON u.user_id = ur.user_id AND ur.is_active = true
      LEFT JOIN staff_portal.roles r ON ur.role_id = r.role_id
      ${whereClause}
      GROUP BY u.user_id, c.name, c.center_code
      ORDER BY u.${sort} ${order.toUpperCase()}
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    const finalParams = [...params, limitNum, offset];

    const usersResult = await query(usersQuery, finalParams);

    // Format response
    const users = usersResult.rows.map((row) => ({
      ...row,
      roles: row.roles || [],
    }));

    res.json({
      success: true,
      data: users,
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
 * GET /api/staff/users/:id
 * Get specific staff member details with roles and permissions
 */
export const getUser = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;

    const user = await getUserWithRolesAndPermissions(id);

    if (!user) {
      res.status(404).json({
        success: false,
        error: {
          message: ErrorMessages.NOT_FOUND,
          statusCode: 404,
        },
      });
      return;
    }

    // Get center information
    const centerResult = await query(
      `SELECT * FROM staff_portal.avis_centers WHERE center_id = $1`,
      [user.avis_center_id]
    );
    const center = centerResult.rows[0] || null;

    res.json({
      success: true,
      data: {
        user: {
          ...user,
          center,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/staff/users
 * Create new staff member (admin only)
 */
export const createStaffUser = async (
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

    const { email, password, first_name, last_name, phone_number, avis_center_id, organizational_level } = req.body;
    const currentUser = req.user!;

    // Check if email already exists
    const existingUser = await query(
      `SELECT user_id FROM staff_portal.users WHERE email = $1`,
      [email]
    );

    if (existingUser.rows.length > 0) {
      res.status(409).json({
        success: false,
        error: {
          message: ErrorMessages.EMAIL_EXISTS,
          statusCode: 409,
        },
      });
      return;
    }

    // Create user
    const user = await createUser({
      email,
      password,
      first_name,
      last_name,
      phone_number,
      avis_center_id,
      organizational_level,
    });

    // Audit log
    await createAuditLog({
      user_id: currentUser.user_id,
      action: 'create_user',
      resource_type: 'users',
      resource_id: user.user_id,
      details: {
        email: user.email,
        avis_center_id,
        organizational_level,
      },
      ip_address: req.ip || req.socket.remoteAddress,
      user_agent: req.headers['user-agent'],
      status: 'success',
    });

    res.status(201).json({
      success: true,
      data: {
        user: {
          user_id: user.user_id,
          email: user.email,
          first_name: user.first_name,
          last_name: user.last_name,
          avis_center_id: user.avis_center_id,
          organizational_level: user.organizational_level,
          is_active: user.is_active,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/staff/users/:id
 * Update staff member
 */
export const updateUser = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
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
    const { first_name, last_name, phone_number, avis_center_id, organizational_level } = req.body;

    // Check if user exists
    const existingUser = await getUserById(id);
    if (!existingUser) {
      res.status(404).json({
        success: false,
        error: {
          message: ErrorMessages.NOT_FOUND,
          statusCode: 404,
        },
      });
      return;
    }

    // Check permissions: users can update own profile, admins can update anyone
    const isAdmin = currentUser.permissions.some((p) => p.permission_name === 'system:admin');
    const isOwnProfile = currentUser.user_id === id;
    const canManageStaff = currentUser.permissions.some((p) => p.permission_name === 'staff:manage');

    if (!isOwnProfile && !isAdmin && !canManageStaff) {
      res.status(403).json({
        success: false,
        error: {
          message: ErrorMessages.FORBIDDEN,
          statusCode: 403,
        },
      });
      return;
    }

    // Users can only update certain fields on their own profile
    // Restrict avis_center_id and organizational_level for non-admins
    let allowedAvisCenterId = avis_center_id;
    let allowedOrganizationalLevel = organizational_level;
    
    if (isOwnProfile && !isAdmin && !canManageStaff) {
      // Regular users can't change their center or organizational level
      allowedAvisCenterId = undefined;
      allowedOrganizationalLevel = undefined;
    }

    // Build update query
    const updateFields: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;

    if (first_name !== undefined) {
      updateFields.push(`first_name = $${paramIndex}`);
      params.push(first_name);
      paramIndex++;
    }
    if (last_name !== undefined) {
      updateFields.push(`last_name = $${paramIndex}`);
      params.push(last_name);
      paramIndex++;
    }
    if (phone_number !== undefined) {
      updateFields.push(`phone_number = $${paramIndex}`);
      params.push(phone_number);
      paramIndex++;
    }
    if (allowedAvisCenterId !== undefined) {
      updateFields.push(`avis_center_id = $${paramIndex}`);
      params.push(allowedAvisCenterId);
      paramIndex++;
    }
    if (allowedOrganizationalLevel !== undefined) {
      updateFields.push(`organizational_level = $${paramIndex}`);
      params.push(allowedOrganizationalLevel);
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

    updateFields.push(`updated_at = NOW()`);
    params.push(id);

    const updateQuery = `
      UPDATE staff_portal.users
      SET ${updateFields.join(', ')}
      WHERE user_id = $${paramIndex}
      RETURNING *
    `;

    const result = await query(updateQuery, params);
    const updatedUser = result.rows[0];

    // Audit log
    await createAuditLog({
      user_id: currentUser.user_id,
      action: 'update_user',
      resource_type: 'users',
      resource_id: id,
      details: {
        changes: {
          first_name: first_name !== undefined ? first_name : undefined,
          last_name: last_name !== undefined ? last_name : undefined,
          phone_number: phone_number !== undefined ? phone_number : undefined,
          avis_center_id: allowedAvisCenterId !== undefined ? allowedAvisCenterId : undefined,
          organizational_level: allowedOrganizationalLevel !== undefined ? allowedOrganizationalLevel : undefined,
        },
        previous: existingUser,
        updated: updatedUser,
      },
      ip_address: req.ip || req.socket.remoteAddress,
      user_agent: req.headers['user-agent'],
      status: 'success',
    });

    res.json({
      success: true,
      data: {
        user: updatedUser,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/staff/users/:id
 * Deactivate staff member (soft delete)
 */
export const deleteUser = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const currentUser = req.user!;

    // Check if user exists
    const existingUser = await getUserById(id);
    if (!existingUser) {
      res.status(404).json({
        success: false,
        error: {
          message: ErrorMessages.NOT_FOUND,
          statusCode: 404,
        },
      });
      return;
    }

    // Prevent self-deletion
    if (currentUser.user_id === id) {
      res.status(400).json({
        success: false,
        error: {
          message: 'Cannot deactivate your own account',
          statusCode: 400,
        },
      });
      return;
    }

    // Soft delete (deactivate)
    await query(
      `UPDATE staff_portal.users 
       SET is_active = false, updated_at = NOW() 
       WHERE user_id = $1`,
      [id]
    );

    // Audit log
    await createAuditLog({
      user_id: currentUser.user_id,
      action: 'deactivate_user',
      resource_type: 'users',
      resource_id: id,
      details: {
        deactivated_user: existingUser.email,
      },
      ip_address: req.ip || req.socket.remoteAddress,
      user_agent: req.headers['user-agent'],
      status: 'success',
    });

    res.json({
      success: true,
      message: 'User deactivated successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/staff/users/:id/status
 * Approve or suspend user
 */
export const updateUserStatus = async (
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
    const { status, role_ids } = req.body;
    const currentUser = req.user!;

    // Check if user exists
    const existingUser = await getUserById(id);
    if (!existingUser) {
      res.status(404).json({
        success: false,
        error: {
          message: ErrorMessages.NOT_FOUND,
          statusCode: 404,
        },
      });
      return;
    }

    // Update status
    if (status === 'active') {
      await activateUser(id, currentUser.user_id);

      // Assign roles if provided
      if (role_ids && Array.isArray(role_ids)) {
        for (const roleId of role_ids) {
          await assignRoleToUser(id, roleId, currentUser.user_id);
        }
      }
    } else if (status === 'suspended') {
      await query(
        `UPDATE staff_portal.users SET is_active = false, updated_at = NOW() WHERE user_id = $1`,
        [id]
      );
    }

    // Audit log
    await createAuditLog({
      user_id: currentUser.user_id,
      action: `user_status_${status}`,
      resource_type: 'users',
      resource_id: id,
      details: {
        previous_status: existingUser.is_active ? 'active' : 'inactive',
        new_status: status,
        role_ids: role_ids || [],
      },
      ip_address: req.ip || req.socket.remoteAddress,
      user_agent: req.headers['user-agent'],
      status: 'success',
    });

    res.json({
      success: true,
      message: `User ${status === 'active' ? 'approved' : 'suspended'} successfully`,
    });
  } catch (error) {
    next(error);
  }
};

// Validation rules
export const listUsersValidation = [
  queryValidator('page').optional().isInt({ min: 1 }),
  queryValidator('limit').optional().isInt({ min: 1, max: 100 }),
  queryValidator('status').optional().isIn(['active', 'inactive']),
  queryValidator('organizational_level').optional().isIn(['National', 'Regional', 'Provincial', 'Municipal']),
  queryValidator('sort').optional().isIn(['first_name', 'last_name', 'email', 'created_at', 'last_login_at']),
  queryValidator('order').optional().isIn(['asc', 'desc']),
];

export const createUserValidation = [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 8 }).matches(/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/),
  body('first_name').trim().isLength({ min: 1, max: 100 }),
  body('last_name').trim().isLength({ min: 1, max: 100 }),
  body('phone_number').optional().trim(),
  body('avis_center_id').isUUID(),
  body('organizational_level').isIn(['National', 'Regional', 'Provincial', 'Municipal']),
];

export const updateUserValidation = [
  body('first_name').optional().trim().isLength({ min: 1, max: 100 }),
  body('last_name').optional().trim().isLength({ min: 1, max: 100 }),
  body('phone_number').optional().trim(),
  body('avis_center_id').optional().isUUID(),
  body('organizational_level').optional().isIn(['National', 'Regional', 'Provincial', 'Municipal']),
];

export const updateStatusValidation = [
  body('status').isIn(['active', 'suspended']),
  body('role_ids').optional().isArray(),
  body('role_ids.*').optional().isUUID(),
];

