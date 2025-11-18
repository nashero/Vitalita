import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types/index.js';
import { AppError, ErrorMessages } from '../utils/errors.js';

/**
 * Permission checking middleware
 * Usage: requirePermission('donors:view', 'donors:manage')
 */
export const requirePermission = (...requiredPermissions: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      throw new AppError(ErrorMessages.UNAUTHORIZED, 401);
    }

    const userPermissions = req.user.permissions.map((p) => p.permission_name);

    // Check if user has at least one of the required permissions
    const hasPermission = requiredPermissions.some((permission) =>
      userPermissions.includes(permission)
    );

    // Also check for system admin permission
    const isSystemAdmin = userPermissions.includes('system:admin');

    if (!hasPermission && !isSystemAdmin) {
      throw new AppError(ErrorMessages.FORBIDDEN, 403);
    }

    next();
  };
};

/**
 * Require any of the specified roles
 */
export const requireRole = (...requiredRoles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      throw new AppError(ErrorMessages.UNAUTHORIZED, 401);
    }

    const userRoles = req.user.roles.map((r) => r.role_code);

    const hasRole = requiredRoles.some((role) => userRoles.includes(role));

    if (!hasRole) {
      throw new AppError(ErrorMessages.FORBIDDEN, 403);
    }

    next();
  };
};

/**
 * Require organizational level
 */
export const requireOrganizationalLevel = (...levels: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      throw new AppError(ErrorMessages.UNAUTHORIZED, 401);
    }

    if (!levels.includes(req.user.organizational_level)) {
      throw new AppError(ErrorMessages.FORBIDDEN, 403);
    }

    next();
  };
};

