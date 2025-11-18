import { Request, Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types/index.js';
import { createAuditLog } from '../models/audit.model.js';

/**
 * Request logging middleware
 */
export const requestLogger = async (
  req: Request | AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const start = Date.now();

  // Log request
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);

  // Override res.end to log response
  const originalEnd = res.end;
  res.end = function (chunk?: unknown, encoding?: unknown) {
    const duration = Date.now() - start;
    const statusCode = res.statusCode;

    console.log(
      `${new Date().toISOString()} - ${req.method} ${req.path} - ${statusCode} - ${duration}ms`
    );

    // Log to audit if authenticated
    if ('user' in req && req.user) {
      const auditReq = req as AuthenticatedRequest;
      createAuditLog({
        user_id: auditReq.user.user_id,
        action: `${req.method} ${req.path}`,
        resource_type: 'api_request',
        details: {
          method: req.method,
          path: req.path,
          statusCode,
          duration,
        },
        ip_address: req.ip || req.socket.remoteAddress,
        user_agent: req.headers['user-agent'],
        status: statusCode >= 400 ? (statusCode >= 500 ? 'error' : 'failure') : 'success',
      }).catch((err) => {
        console.error('Failed to create audit log:', err);
      });
    }

    originalEnd.call(this, chunk, encoding);
  };

  next();
};

/**
 * Error logging middleware
 */
export const errorLogger = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  console.error(`${new Date().toISOString()} - ERROR:`, {
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    ip: req.ip,
  });

  next(err);
};

