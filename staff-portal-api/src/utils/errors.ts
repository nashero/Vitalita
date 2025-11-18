import { ApiError } from '../types/index.js';

/**
 * Custom API Error class
 */
export class AppError extends Error implements ApiError {
  statusCode: number;
  isOperational: boolean;

  constructor(message: string, statusCode: number = 500) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Create error response
 */
export const createErrorResponse = (error: unknown) => {
  if (error instanceof AppError) {
    return {
      success: false,
      error: {
        message: error.message,
        statusCode: error.statusCode,
      },
    };
  }

  // Handle database errors
  if (error && typeof error === 'object' && 'code' in error) {
    const dbError = error as { code: string; detail?: string; message?: string };
    
    if (dbError.code === '23505') { // Unique violation
      return {
        success: false,
        error: {
          message: 'A record with this information already exists',
          statusCode: 409,
        },
      };
    }
    
    if (dbError.code === '23503') { // Foreign key violation
      return {
        success: false,
        error: {
          message: 'Referenced record does not exist',
          statusCode: 400,
        },
      };
    }
  }

  // Default error
  return {
    success: false,
    error: {
      message: error instanceof Error ? error.message : 'An unexpected error occurred',
      statusCode: 500,
    },
  };
};

/**
 * Common error messages
 */
export const ErrorMessages = {
  UNAUTHORIZED: 'Authentication required',
  FORBIDDEN: 'Insufficient permissions',
  NOT_FOUND: 'Resource not found',
  VALIDATION_ERROR: 'Validation failed',
  INTERNAL_ERROR: 'Internal server error',
  INVALID_CREDENTIALS: 'Invalid email or password',
  ACCOUNT_LOCKED: 'Account is temporarily locked due to multiple failed login attempts',
  ACCOUNT_INACTIVE: 'Account is inactive. Please contact administrator',
  EMAIL_EXISTS: 'Email already registered',
  INVALID_TOKEN: 'Invalid or expired token',
  TOKEN_EXPIRED: 'Token has expired',
  PASSWORD_TOO_WEAK: 'Password does not meet security requirements',
  RATE_LIMIT_EXCEEDED: 'Too many requests. Please try again later',
} as const;

