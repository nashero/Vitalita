import { Request, Response, NextFunction } from 'express';
import { body, validationResult } from 'express-validator';
import {
  createUser,
  getUserByEmail,
  verifyPassword,
  updateLastLogin,
  incrementFailedLoginAttempts,
  getUserWithRolesAndPermissions,
  updateUserPassword,
  activateUser,
  getCenterAdministrators,
  assignRoleToUser,
} from '../models/user.model.js';
import { generateTokenPair, verifyRefreshToken } from '../config/jwt.js';
import { AppError, ErrorMessages } from '../utils/errors.js';
import {
  sendRegistrationApprovalEmail,
  sendWelcomeEmail,
  sendPasswordResetEmail,
} from '../services/email.service.js';
import { createAuditLog } from '../models/audit.model.js';
import { query } from '../config/database.js';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../config/jwt.js';

/**
 * Register new staff member (pending approval)
 */
export const register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    // Check validation errors
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

    // avis_center_id is actually center_code from the form, convert it to center_id
    const centerResult = await query(
      `SELECT center_id, name FROM staff_portal.avis_centers WHERE center_code = $1 AND is_active = true`,
      [avis_center_id]
    );

    if (centerResult.rows.length === 0) {
      res.status(400).json({
        success: false,
        error: {
          message: 'Invalid AVIS center selected',
          statusCode: 400,
        },
      });
      return;
    }

    const centerId = centerResult.rows[0].center_id;
    const centerName = centerResult.rows[0].name || 'Unknown Center';

    // Check if email already exists
    const existingUser = await getUserByEmail(email);
    if (existingUser) {
      res.status(409).json({
        success: false,
        error: {
          message: ErrorMessages.EMAIL_EXISTS,
          statusCode: 409,
        },
      });
      return;
    }

    // Validate password strength
    if (password.length < 8 || !/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
      res.status(400).json({
        success: false,
        error: {
          message: ErrorMessages.PASSWORD_TOO_WEAK,
          statusCode: 400,
        },
      });
      return;
    }

    // Create user with pending status
    const user = await createUser({
      email,
      password,
      first_name,
      last_name,
      phone_number,
      avis_center_id: centerId,
      organizational_level,
    });

    // Get center administrators
    const administrators = await getCenterAdministrators(centerId);

    // Send approval request emails to administrators
    for (const admin of administrators) {
      try {
        await sendRegistrationApprovalEmail(
          admin.email,
          user.email,
          `${user.first_name} ${user.last_name}`,
          centerName
        );
      } catch (emailError) {
        console.error('Failed to send approval email:', emailError);
        // Continue even if email fails
      }
    }

    // Log registration
    await createAuditLog({
      action: 'user_registration',
      resource_type: 'users',
      resource_id: user.user_id,
      details: {
        email: user.email,
        center_id: centerId,
        center_code: avis_center_id,
        organizational_level,
      },
      ip_address: req.ip || req.socket.remoteAddress,
      user_agent: req.headers['user-agent'],
      status: 'success',
    });

    res.status(201).json({
      success: true,
      message: 'Registration successful. Your account is pending approval.',
      data: {
        user_id: user.user_id,
        email: user.email,
        status: 'pending',
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Login staff member
 */
export const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
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

    const { email, password } = req.body;

    // Get user
    const user = await getUserByEmail(email);
    if (!user) {
      // Log failed attempt
      await createAuditLog({
        action: 'login_attempt',
        details: { email, reason: 'user_not_found' },
        ip_address: req.ip || req.socket.remoteAddress,
        user_agent: req.headers['user-agent'],
        status: 'failure',
      });

      res.status(401).json({
        success: false,
        error: {
          message: ErrorMessages.INVALID_CREDENTIALS,
          statusCode: 401,
        },
      });
      return;
    }

    // Check if account is locked
    if (user.account_locked_until && new Date(user.account_locked_until) > new Date()) {
      res.status(403).json({
        success: false,
        error: {
          message: ErrorMessages.ACCOUNT_LOCKED,
          statusCode: 403,
        },
      });
      return;
    }

    // Check if account is active
    if (!user.is_active) {
      res.status(403).json({
        success: false,
        error: {
          message: ErrorMessages.ACCOUNT_INACTIVE,
          statusCode: 403,
        },
      });
      return;
    }

    // Verify password
    const isValid = await verifyPassword(email, password);
    if (!isValid) {
      await incrementFailedLoginAttempts(user.user_id);

      await createAuditLog({
        user_id: user.user_id,
        action: 'login_attempt',
        details: { email, reason: 'invalid_password' },
        ip_address: req.ip || req.socket.remoteAddress,
        user_agent: req.headers['user-agent'],
        status: 'failure',
      });

      res.status(401).json({
        success: false,
        error: {
          message: ErrorMessages.INVALID_CREDENTIALS,
          statusCode: 401,
        },
      });
      return;
    }

    // Update last login
    await updateLastLogin(user.user_id);

    // Get user with roles and permissions
    const userWithRoles = await getUserWithRolesAndPermissions(user.user_id);
    if (!userWithRoles) {
      throw new AppError('Failed to load user data', 500);
    }

    // Generate tokens
    const { accessToken, refreshToken } = generateTokenPair({
      user_id: user.user_id,
      email: user.email,
      roles: userWithRoles.roles.map((r) => r.role_code),
      permissions: userWithRoles.permissions.map((p) => p.permission_name),
    });

    // Set cookies
    res.cookie('access_token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 15 * 60 * 1000, // 15 minutes
    });

    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    // Log successful login
    await createAuditLog({
      user_id: user.user_id,
      action: 'login_success',
      ip_address: req.ip || req.socket.remoteAddress,
      user_agent: req.headers['user-agent'],
      status: 'success',
    });

    res.json({
      success: true,
      data: {
        user: {
          user_id: user.user_id,
          email: user.email,
          first_name: user.first_name,
          last_name: user.last_name,
          avis_center_id: user.avis_center_id,
          organizational_level: user.organizational_level,
          roles: userWithRoles.roles.map((r) => ({
            role_id: r.role_id,
            role_name: r.role_name,
            role_code: r.role_code,
          })),
          permissions: userWithRoles.permissions.map((p) => p.permission_name),
        },
        access_token: accessToken,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Logout
 */
export const logout = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    // Clear cookies
    res.clearCookie('access_token');
    res.clearCookie('refresh_token');

    res.json({
      success: true,
      message: 'Logged out successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Refresh access token
 */
export const refreshToken = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const refreshToken = req.cookies?.refresh_token || req.body.refresh_token;

    if (!refreshToken) {
      res.status(401).json({
        success: false,
        error: {
          message: ErrorMessages.UNAUTHORIZED,
          statusCode: 401,
        },
      });
      return;
    }

    // Verify refresh token
    const decoded = verifyRefreshToken(refreshToken);

    // Get user with roles and permissions
    const userWithRoles = await getUserWithRolesAndPermissions(decoded.user_id);
    if (!userWithRoles || !userWithRoles.is_active) {
      res.status(401).json({
        success: false,
        error: {
          message: ErrorMessages.UNAUTHORIZED,
          statusCode: 401,
        },
      });
      return;
    }

    // Generate new token pair
    const { accessToken, refreshToken: newRefreshToken } = generateTokenPair({
      user_id: userWithRoles.user_id,
      email: userWithRoles.email,
      roles: userWithRoles.roles.map((r) => r.role_code),
      permissions: userWithRoles.permissions.map((p) => p.permission_name),
    });

    // Set new cookies
    res.cookie('access_token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 15 * 60 * 1000,
    });

    res.cookie('refresh_token', newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({
      success: true,
      data: {
        access_token: accessToken,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Forgot password
 */
export const forgotPassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
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

    const { email } = req.body;

    const user = await getUserByEmail(email);
    if (!user) {
      // Don't reveal if email exists
      res.json({
        success: true,
        message: 'If the email exists, a password reset link has been sent.',
      });
      return;
    }

    // Generate reset token (JWT with 1 hour expiry)
    const resetToken = jwt.sign(
      { user_id: user.user_id, email: user.email, type: 'password_reset' },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    // Send reset email
    try {
      await sendPasswordResetEmail(user.email, resetToken, `${user.first_name} ${user.last_name}`);
    } catch (emailError) {
      console.error('Failed to send password reset email:', emailError);
    }

    // Log password reset request
    await createAuditLog({
      user_id: user.user_id,
      action: 'password_reset_requested',
      ip_address: req.ip || req.socket.remoteAddress,
      user_agent: req.headers['user-agent'],
      status: 'success',
    });

    res.json({
      success: true,
      message: 'If the email exists, a password reset link has been sent.',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Reset password
 */
export const resetPassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
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

    const { token, new_password } = req.body;

    // Verify token
    let decoded: { user_id: string; email: string; type?: string };
    try {
      decoded = jwt.verify(token, JWT_SECRET) as { user_id: string; email: string; type?: string };
      if (decoded.type !== 'password_reset') {
        throw new Error('Invalid token type');
      }
    } catch (error) {
      res.status(400).json({
        success: false,
        error: {
          message: ErrorMessages.INVALID_TOKEN,
          statusCode: 400,
        },
      });
      return;
    }

    // Validate password strength
    if (new_password.length < 8 || !/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(new_password)) {
      res.status(400).json({
        success: false,
        error: {
          message: ErrorMessages.PASSWORD_TOO_WEAK,
          statusCode: 400,
        },
      });
      return;
    }

    // Update password
    await updateUserPassword(decoded.user_id, new_password);

    // Log password reset
    await createAuditLog({
      user_id: decoded.user_id,
      action: 'password_reset_completed',
      ip_address: req.ip || req.socket.remoteAddress,
      user_agent: req.headers['user-agent'],
      status: 'success',
    });

    res.json({
      success: true,
      message: 'Password reset successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get current user profile
 */
export const getCurrentUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    // This middleware should be used with authenticate middleware
    const userId = (req as any).user?.user_id;
    if (!userId) {
      res.status(401).json({
        success: false,
        error: {
          message: ErrorMessages.UNAUTHORIZED,
          statusCode: 401,
        },
      });
      return;
    }

    const userWithRoles = await getUserWithRolesAndPermissions(userId);
    if (!userWithRoles) {
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
        user: {
          user_id: userWithRoles.user_id,
          email: userWithRoles.email,
          first_name: userWithRoles.first_name,
          last_name: userWithRoles.last_name,
          phone_number: userWithRoles.phone_number,
          avis_center_id: userWithRoles.avis_center_id,
          organizational_level: userWithRoles.organizational_level,
          is_email_verified: userWithRoles.is_email_verified,
          mfa_enabled: userWithRoles.mfa_enabled,
          last_login_at: userWithRoles.last_login_at,
          roles: userWithRoles.roles.map((r) => ({
            role_id: r.role_id,
            role_name: r.role_name,
            role_code: r.role_code,
            role_category: r.role_category,
          })),
          permissions: userWithRoles.permissions.map((p) => ({
            permission_id: p.permission_id,
            permission_name: p.permission_name,
            resource: p.resource,
            action: p.action,
          })),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// Validation rules
export const registerValidation = [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 8 }).matches(/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/),
  body('first_name').trim().isLength({ min: 1, max: 100 }),
  body('last_name').trim().isLength({ min: 1, max: 100 }),
  body('phone_number').optional().trim(),
  body('avis_center_id').trim().isLength({ min: 1 }).withMessage('AVIS center is required'),
  body('organizational_level').isIn(['National', 'Regional', 'Provincial', 'Municipal']),
];

export const loginValidation = [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty(),
];

export const forgotPasswordValidation = [
  body('email').isEmail().normalizeEmail(),
];

export const resetPasswordValidation = [
  body('token').notEmpty(),
  body('new_password').isLength({ min: 8 }).matches(/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/),
];

