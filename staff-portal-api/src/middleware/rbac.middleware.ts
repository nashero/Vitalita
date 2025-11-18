import { Response, NextFunction, Request } from 'express';
import { AuthenticatedRequest, TokenPayload } from '../types/index.js';
import { verifyAccessToken } from '../config/jwt.js';
import { AppError, ErrorMessages } from '../utils/errors.js';
import { getUserWithRolesAndPermissions } from '../models/user.model.js';
import { createAuditLog } from '../models/audit.model.js';
import { query } from '../config/database.js';

/**
 * Authentication middleware - verifies JWT token and loads user
 * This is the base middleware that must be used before other RBAC middleware
 */
export const requireAuth = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Get token from cookie or Authorization header
    let token: string | undefined;

    // Try cookie first
    if (req.cookies && req.cookies.access_token) {
      token = req.cookies.access_token;
    }
    // Fallback to Authorization header
    else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.substring(7);
    }

    if (!token) {
      await logAuthorizationFailure(req, 'requireAuth', 'No token provided', null);
      throw new AppError(ErrorMessages.UNAUTHORIZED, 401);
    }

    // Verify token
    let decoded: TokenPayload;
    try {
      decoded = verifyAccessToken(token) as TokenPayload;
    } catch (error) {
      await logAuthorizationFailure(req, 'requireAuth', 'Invalid or expired token', null);
      throw new AppError(ErrorMessages.UNAUTHORIZED, 401);
    }

    // Get user with roles and permissions
    const user = await getUserWithRolesAndPermissions(decoded.user_id);

    if (!user) {
      await logAuthorizationFailure(req, 'requireAuth', 'User not found', decoded.user_id);
      throw new AppError(ErrorMessages.UNAUTHORIZED, 401);
    }

    if (!user.is_active) {
      await logAuthorizationFailure(req, 'requireAuth', 'Account inactive', user.user_id);
      throw new AppError(ErrorMessages.ACCOUNT_INACTIVE, 403);
    }

    // Verify token permissions match current user permissions (refresh if needed)
    const tokenPermissions = decoded.permissions || [];
    const currentPermissions = user.permissions.map((p) => p.permission_name);
    const tokenRoles = decoded.roles || [];
    const currentRoles = user.roles.map((r) => r.role_code);

    // Check if permissions/roles have changed (token might be stale)
    const permissionsMatch =
      tokenPermissions.length === currentPermissions.length &&
      tokenPermissions.every((p) => currentPermissions.includes(p));
    const rolesMatch =
      tokenRoles.length === currentRoles.length &&
      tokenRoles.every((r) => currentRoles.includes(r));

    if (!permissionsMatch || !rolesMatch) {
      // Token is stale, but allow request (client should refresh token)
      console.warn(`Token permissions/roles mismatch for user ${user.user_id}`);
    }

    // Attach user to request
    req.user = user;
    req.token = decoded;

    next();
  } catch (error) {
    if (error instanceof AppError) {
      next(error);
    } else {
      await logAuthorizationFailure(req, 'requireAuth', 'Unexpected error', null);
      next(new AppError(ErrorMessages.UNAUTHORIZED, 401));
    }
  }
};

/**
 * Require specific role(s) - user must have at least one of the specified roles
 * Usage: requireRole('PRESIDENT', 'VP')
 */
export const requireRole = (...requiredRoles: string[]) => {
  return async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      if (!req.user) {
        await logAuthorizationFailure(req, 'requireRole', 'User not authenticated', null);
        throw new AppError(ErrorMessages.UNAUTHORIZED, 401);
      }

      const userRoles = req.user.roles.map((r) => r.role_code);
      const hasRole = requiredRoles.some((role) => userRoles.includes(role));

      // System admin bypass
      const isSystemAdmin = userRoles.includes('SYSTEM_ADMIN');

      if (!hasRole && !isSystemAdmin) {
        await logAuthorizationFailure(
          req,
          'requireRole',
          `Required roles: ${requiredRoles.join(', ')}, User roles: ${userRoles.join(', ')}`,
          req.user.user_id
        );
        throw new AppError(ErrorMessages.FORBIDDEN, 403);
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Require specific permission(s) - user must have at least one of the specified permissions
 * Usage: requirePermission('donors:view', 'donors:manage')
 */
export const requirePermission = (...requiredPermissions: string[]) => {
  return async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      if (!req.user) {
        await logAuthorizationFailure(req, 'requirePermission', 'User not authenticated', null);
        throw new AppError(ErrorMessages.UNAUTHORIZED, 401);
      }

      const userPermissions = req.user.permissions.map((p) => p.permission_name);

      // Check if user has at least one of the required permissions
      const hasPermission = requiredPermissions.some((permission) =>
        userPermissions.includes(permission)
      );

      // System admin bypass
      const isSystemAdmin = userPermissions.includes('system:admin');

      if (!hasPermission && !isSystemAdmin) {
        await logAuthorizationFailure(
          req,
          'requirePermission',
          `Required permissions: ${requiredPermissions.join(', ')}, User permissions: ${userPermissions.join(', ')}`,
          req.user.user_id
        );
        throw new AppError(ErrorMessages.FORBIDDEN, 403);
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Require organizational level - user must be at one of the specified levels
 * Usage: requireOrgLevel('National', 'Regional')
 */
export const requireOrgLevel = (...requiredLevels: string[]) => {
  return async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      if (!req.user) {
        await logAuthorizationFailure(req, 'requireOrgLevel', 'User not authenticated', null);
        throw new AppError(ErrorMessages.UNAUTHORIZED, 401);
      }

      const userLevel = req.user.organizational_level;

      if (!requiredLevels.includes(userLevel)) {
        await logAuthorizationFailure(
          req,
          'requireOrgLevel',
          `Required levels: ${requiredLevels.join(', ')}, User level: ${userLevel}`,
          req.user.user_id
        );
        throw new AppError(ErrorMessages.FORBIDDEN, 403);
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Require same center - user can only access data from their own center
 * Optionally accepts center_id from params, query, or body
 */
export const requireSameCenter = (centerIdParam: string = 'center_id') => {
  return async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      if (!req.user) {
        await logAuthorizationFailure(req, 'requireSameCenter', 'User not authenticated', null);
        throw new AppError(ErrorMessages.UNAUTHORIZED, 401);
      }

      // Get center_id from params, query, or body
      const requestedCenterId =
        req.params[centerIdParam] ||
        req.query[centerIdParam] ||
        req.body[centerIdParam];

      if (!requestedCenterId) {
        // If no center_id specified, allow (might be a list endpoint)
        next();
        return;
      }

      const userCenterId = req.user.avis_center_id;

      // Check if user can access this center (hierarchical check)
      const canAccess = await canUserAccessCenter(req.user.user_id, requestedCenterId as string);

      if (!canAccess) {
        await logAuthorizationFailure(
          req,
          'requireSameCenter',
          `User center: ${userCenterId}, Requested center: ${requestedCenterId}`,
          req.user.user_id
        );
        throw new AppError(ErrorMessages.FORBIDDEN, 403);
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Check if user can access a specific center based on hierarchical structure
 * - National level can access all centers
 * - Regional can access all provincial/municipal in their region
 * - Provincial can access all municipal in their province
 * - Municipal can only access their own center
 */
export const canUserAccessCenter = async (
  userId: string,
  targetCenterId: string
): Promise<boolean> => {
  try {
    // Get user's center and level
    const userResult = await query(
      `SELECT u.avis_center_id, u.organizational_level, c.center_type, c.region, c.province
       FROM staff_portal.users u
       JOIN staff_portal.avis_centers c ON u.avis_center_id = c.center_id
       WHERE u.user_id = $1`,
      [userId]
    );

    if (userResult.rows.length === 0) {
      return false;
    }

    const user = userResult.rows[0];
    const userCenterId = user.avis_center_id;
    const userLevel = user.organizational_level;

    // If same center, always allow
    if (userCenterId === targetCenterId) {
      return true;
    }

    // National level can access all centers
    if (userLevel === 'National') {
      return true;
    }

    // Get target center information
    const targetResult = await query(
      `SELECT center_id, center_type, region, province, parent_center_id
       FROM staff_portal.avis_centers
       WHERE center_id = $1`,
      [targetCenterId]
    );

    if (targetResult.rows.length === 0) {
      return false;
    }

    const targetCenter = targetResult.rows[0];

    // Regional level can access provincial/municipal in their region
    if (userLevel === 'Regional' && user.region === targetCenter.region) {
      return true;
    }

    // Provincial level can access municipal in their province
    if (userLevel === 'Provincial' && user.province === targetCenter.province) {
      return true;
    }

    // Check if target center is a child of user's center (recursive check)
    const isChild = await isCenterChildOf(targetCenterId, userCenterId);
    if (isChild) {
      return true;
    }

    return false;
  } catch (error) {
    console.error('Error checking center access:', error);
    return false;
  }
};

/**
 * Check if a center is a child (descendant) of another center
 */
const isCenterChildOf = async (childCenterId: string, parentCenterId: string): Promise<boolean> => {
  try {
    // Use recursive CTE to check hierarchy
    const result = await query(
      `WITH RECURSIVE center_hierarchy AS (
        SELECT center_id, parent_center_id, 0 as depth
        FROM staff_portal.avis_centers
        WHERE center_id = $1
        
        UNION ALL
        
        SELECT c.center_id, c.parent_center_id, ch.depth + 1
        FROM staff_portal.avis_centers c
        INNER JOIN center_hierarchy ch ON c.center_id = ch.parent_center_id
        WHERE ch.depth < 10  -- Prevent infinite loops
      )
      SELECT EXISTS(SELECT 1 FROM center_hierarchy WHERE center_id = $2) as is_child`,
      [childCenterId, parentCenterId]
    );

    return result.rows[0]?.is_child || false;
  } catch (error) {
    console.error('Error checking center hierarchy:', error);
    return false;
  }
};

/**
 * Log authorization failure to audit log
 */
const logAuthorizationFailure = async (
  req: Request | AuthenticatedRequest,
  middleware: string,
  reason: string,
  userId: string | null
): Promise<void> => {
  try {
    await createAuditLog({
      user_id: userId || (req as AuthenticatedRequest).user?.user_id || null,
      action: `authorization_failure_${middleware}`,
      resource_type: 'authorization',
      details: {
        middleware,
        reason,
        path: req.path,
        method: req.method,
        ip_address: req.ip || req.socket.remoteAddress,
      },
      ip_address: req.ip || req.socket.remoteAddress,
      user_agent: req.headers['user-agent'],
      status: 'failure',
      error_message: reason,
    });
  } catch (error) {
    // Don't throw - logging failures shouldn't break the request
    console.error('Failed to log authorization failure:', error);
  }
};

/**
 * Combined middleware helper - require auth AND permission
 */
export const requireAuthAndPermission = (...permissions: string[]) => {
  return [requireAuth, requirePermission(...permissions)];
};

/**
 * Combined middleware helper - require auth AND role
 */
export const requireAuthAndRole = (...roles: string[]) => {
  return [requireAuth, requireRole(...roles)];
};

/**
 * Combined middleware helper - require auth, role, AND permission
 */
export const requireAuthRoleAndPermission = (
  roles: string[],
  permissions: string[]
) => {
  return [requireAuth, requireRole(...roles), requirePermission(...permissions)];
};

/**
 * Optional authentication - doesn't fail if no token, but attaches user if present
 */
export const optionalAuth = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    let token: string | undefined;

    if (req.cookies && req.cookies.access_token) {
      token = req.cookies.access_token;
    } else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.substring(7);
    }

    if (token) {
      const decoded = verifyAccessToken(token) as TokenPayload;
      const user = await getUserWithRolesAndPermissions(decoded.user_id);
      if (user && user.is_active) {
        req.user = user;
        req.token = decoded;
      }
    }

    next();
  } catch (error) {
    // Continue without authentication
    next();
  }
};

