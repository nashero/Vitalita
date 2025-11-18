/**
 * Staff Management Routes
 */

import { Router } from 'express';
import {
  listUsers,
  getUser,
  createStaffUser,
  updateUser,
  deleteUser,
  updateUserStatus,
  listUsersValidation,
  createUserValidation,
  updateUserValidation,
  updateStatusValidation,
} from '../controllers/staff.controller.js';
import {
  listRoles,
  getRolePermissions,
  assignRole,
  removeRole,
  assignRoleValidation,
} from '../controllers/roles.controller.js';
import {
  listCenters,
  getCenter,
  getCenterStaff,
  updateCenter,
  listCentersValidation,
  updateCenterValidation,
} from '../controllers/centers.controller.js';
import {
  getAuditLogs,
  exportAuditLogs,
  getAuditLogsValidation,
} from '../controllers/audit.controller.js';
import { requireAuth, requirePermission, requireRole } from '../middleware/rbac.middleware.js';

const router = Router();

// All routes require authentication
router.use(requireAuth);

/**
 * Staff User Management Routes
 */
router.get(
  '/users',
  listUsersValidation,
  requirePermission('staff:view'),
  listUsers
);

router.get(
  '/users/:id',
  requirePermission('staff:view'),
  getUser
);

router.post(
  '/users',
  createUserValidation,
  requirePermission('staff:manage'),
  createStaffUser
);

router.put(
  '/users/:id',
  updateUserValidation,
  updateUser // Users can update own profile, admins can update anyone
);

router.delete(
  '/users/:id',
  requirePermission('staff:manage'),
  deleteUser
);

router.patch(
  '/users/:id/status',
  updateStatusValidation,
  requirePermission('staff:manage'),
  updateUserStatus
);

/**
 * Role Management Routes
 */
router.get(
  '/roles',
  requirePermission('roles:view'),
  listRoles
);

router.get(
  '/roles/:id/permissions',
  requirePermission('roles:view'),
  getRolePermissions
);

router.post(
  '/users/:id/roles',
  assignRoleValidation,
  requirePermission('staff:assign_roles'),
  assignRole
);

router.delete(
  '/users/:id/roles/:roleId',
  requirePermission('staff:assign_roles'),
  removeRole
);

/**
 * AVIS Centers Routes
 */
router.get(
  '/centers',
  listCentersValidation,
  requirePermission('centers:view'),
  listCenters
);

router.get(
  '/centers/:id',
  requirePermission('centers:view'),
  getCenter
);

router.get(
  '/centers/:id/staff',
  requirePermission('staff:view'),
  getCenterStaff
);

router.put(
  '/centers/:id',
  updateCenterValidation,
  requirePermission('centers:update'),
  updateCenter
);

/**
 * Audit Logs Routes
 */
router.get(
  '/audit-logs',
  getAuditLogsValidation,
  requirePermission('audit:view'),
  getAuditLogs
);

router.get(
  '/audit-logs/export',
  getAuditLogsValidation,
  requirePermission('audit:export'),
  exportAuditLogs
);

export default router;

