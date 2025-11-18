/**
 * Roles Management Controller
 * Handles role-related operations
 */

import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { AuthenticatedRequest } from '../types/index.js';
import { query } from '../config/database.js';
import { AppError, ErrorMessages } from '../utils/errors.js';
import { createAuditLog } from '../models/audit.model.js';
import { assignRoleToUser } from '../models/user.model.js';

/**
 * GET /api/staff/roles
 * List all available roles
 */
export const listRoles = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { category } = req.query;

    let rolesQuery = `
      SELECT 
        r.*,
        COUNT(DISTINCT ur.user_id) as user_count
      FROM staff_portal.roles r
      LEFT JOIN staff_portal.user_roles ur ON r.role_id = ur.role_id AND ur.is_active = true
    `;

    const params: any[] = [];

    if (category) {
      rolesQuery += ` WHERE r.role_category = $1`;
      params.push(category);
    }

    rolesQuery += ` GROUP BY r.role_id ORDER BY r.role_category, r.role_name`;

    const result = await query(rolesQuery, params);

    res.json({
      success: true,
      data: {
        roles: result.rows,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/staff/roles/:id/permissions
 * Get permissions for a specific role
 */
export const getRolePermissions = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;

    const result = await query(
      `SELECT 
        p.*
       FROM staff_portal.permissions p
       INNER JOIN staff_portal.role_permissions rp ON p.permission_id = rp.permission_id
       WHERE rp.role_id = $1
       ORDER BY p.resource, p.action`,
      [id]
    );

    const roleResult = await query(`SELECT * FROM staff_portal.roles WHERE role_id = $1`, [id]);

    if (roleResult.rows.length === 0) {
      res.status(404).json({
        success: false,
        error: {
          message: ErrorMessages.NOT_FOUND,
          statusCode: 404,
        },
      });
      return;
    }

    res.json({
      success: true,
      data: {
        role: roleResult.rows[0],
        permissions: result.rows,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/staff/users/:id/roles
 * Assign role to user
 */
export const assignRole = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
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
    const { role_id, expires_at } = req.body;
    const currentUser = req.user!;

    // Verify user exists
    const userResult = await query(`SELECT user_id FROM staff_portal.users WHERE user_id = $1`, [id]);
    if (userResult.rows.length === 0) {
      res.status(404).json({
        success: false,
        error: {
          message: 'User not found',
          statusCode: 404,
        },
      });
      return;
    }

    // Verify role exists
    const roleResult = await query(`SELECT role_id FROM staff_portal.roles WHERE role_id = $1`, [role_id]);
    if (roleResult.rows.length === 0) {
      res.status(404).json({
        success: false,
        error: {
          message: 'Role not found',
          statusCode: 404,
        },
      });
      return;
    }

    // Assign role
    await assignRoleToUser(id, role_id, currentUser.user_id);

    // Set expiration if provided
    if (expires_at) {
      await query(
        `UPDATE staff_portal.user_roles 
         SET expires_at = $1 
         WHERE user_id = $2 AND role_id = $3`,
        [expires_at, id, role_id]
      );
    }

    // Audit log
    await createAuditLog({
      user_id: currentUser.user_id,
      action: 'assign_role',
      resource_type: 'user_roles',
      resource_id: id,
      details: {
        user_id: id,
        role_id,
        expires_at: expires_at || null,
      },
      ip_address: req.ip || req.socket.remoteAddress,
      user_agent: req.headers['user-agent'],
      status: 'success',
    });

    res.json({
      success: true,
      message: 'Role assigned successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/staff/users/:id/roles/:roleId
 * Remove role from user
 */
export const removeRole = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id, roleId } = req.params;
    const currentUser = req.user!;

    // Check if assignment exists
    const assignmentResult = await query(
      `SELECT * FROM staff_portal.user_roles WHERE user_id = $1 AND role_id = $2`,
      [id, roleId]
    );

    if (assignmentResult.rows.length === 0) {
      res.status(404).json({
        success: false,
        error: {
          message: 'Role assignment not found',
          statusCode: 404,
        },
      });
      return;
    }

    // Deactivate role assignment (soft delete)
    await query(
      `UPDATE staff_portal.user_roles 
       SET is_active = false 
       WHERE user_id = $1 AND role_id = $2`,
      [id, roleId]
    );

    // Audit log
    await createAuditLog({
      user_id: currentUser.user_id,
      action: 'remove_role',
      resource_type: 'user_roles',
      resource_id: id,
      details: {
        user_id: id,
        role_id: roleId,
      },
      ip_address: req.ip || req.socket.remoteAddress,
      user_agent: req.headers['user-agent'],
      status: 'success',
    });

    res.json({
      success: true,
      message: 'Role removed successfully',
    });
  } catch (error) {
    next(error);
  }
};

// Validation rules
import { body } from 'express-validator';

export const assignRoleValidation = [
  body('role_id').isUUID().withMessage('Invalid role ID'),
  body('expires_at').optional().isISO8601().withMessage('Invalid date format'),
];

