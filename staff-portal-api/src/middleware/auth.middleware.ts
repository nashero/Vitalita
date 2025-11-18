import { Response, NextFunction } from 'express';
import { AuthenticatedRequest, TokenPayload } from '../types/index.js';
import { verifyAccessToken } from '../config/jwt.js';
import { AppError, ErrorMessages } from '../utils/errors.js';
import { getUserWithRolesAndPermissions } from '../models/user.model.js';

/**
 * Authentication middleware - verifies JWT token
 */
export const authenticate = async (
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
      throw new AppError(ErrorMessages.UNAUTHORIZED, 401);
    }

    // Verify token
    const decoded = verifyAccessToken(token) as TokenPayload;

    // Get user with roles and permissions
    const user = await getUserWithRolesAndPermissions(decoded.user_id);

    if (!user) {
      throw new AppError(ErrorMessages.UNAUTHORIZED, 401);
    }

    if (!user.is_active) {
      throw new AppError(ErrorMessages.ACCOUNT_INACTIVE, 403);
    }

    // Attach user to request
    req.user = user;
    req.token = decoded;

    next();
  } catch (error) {
    if (error instanceof AppError) {
      next(error);
    } else {
      next(new AppError(ErrorMessages.UNAUTHORIZED, 401));
    }
  }
};

/**
 * Optional authentication - doesn't fail if no token
 */
export const optionalAuthenticate = async (
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

