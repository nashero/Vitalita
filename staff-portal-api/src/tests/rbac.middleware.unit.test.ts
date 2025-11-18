/**
 * Unit tests for RBAC middleware
 * 
 * These tests mock all dependencies and test middleware logic in isolation
 */

import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { Request, Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types/index.js';
import * as jwt from '../config/jwt.js';
import * as userModel from '../models/user.model.js';
import * as auditModel from '../models/audit.model.js';
import {
  requireAuth,
  requireRole,
  requirePermission,
  requireOrgLevel,
  requireSameCenter,
} from '../middleware/rbac.middleware.js';
import { AppError } from '../utils/errors.js';

// Mock dependencies
jest.mock('../config/jwt.js');
jest.mock('../models/user.model.js');
jest.mock('../models/audit.model.js');
jest.mock('../config/database.js');

describe('RBAC Middleware Unit Tests', () => {
  let mockRequest: Partial<AuthenticatedRequest>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;

  const mockUser = {
    user_id: 'user-123',
    email: 'test@example.com',
    first_name: 'Test',
    last_name: 'User',
    avis_center_id: 'center-123',
    organizational_level: 'Municipal' as const,
    is_active: true,
    roles: [
      { role_id: 'role-1', role_code: 'NURSE', role_name: 'Nurse' },
    ],
    permissions: [
      { permission_id: 'perm-1', permission_name: 'donors:view', resource: 'donors', action: 'view' },
    ],
  };

  beforeEach(() => {
    jest.clearAllMocks();

    mockRequest = {
      cookies: {},
      headers: {},
      ip: '127.0.0.1',
      path: '/test',
      method: 'GET',
      socket: { remoteAddress: '127.0.0.1' } as any,
    };

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };

    mockNext = jest.fn();
  });

  describe('requireAuth', () => {
    it('should authenticate user with valid token in cookie', async () => {
      const token = 'valid-token';
      mockRequest.cookies = { access_token: token };

      (jwt.verifyAccessToken as jest.Mock).mockReturnValue({
        user_id: 'user-123',
        email: 'test@example.com',
        roles: ['NURSE'],
        permissions: ['donors:view'],
      });

      (userModel.getUserWithRolesAndPermissions as jest.Mock).mockResolvedValue(mockUser);
      (auditModel.createAuditLog as jest.Mock).mockResolvedValue({});

      await requireAuth(
        mockRequest as AuthenticatedRequest,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith();
      expect(mockRequest.user).toEqual(mockUser);
    });

    it('should authenticate user with valid token in Authorization header', async () => {
      const token = 'valid-token';
      mockRequest.headers = { authorization: `Bearer ${token}` };

      (jwt.verifyAccessToken as jest.Mock).mockReturnValue({
        user_id: 'user-123',
        email: 'test@example.com',
        roles: ['NURSE'],
        permissions: ['donors:view'],
      });

      (userModel.getUserWithRolesAndPermissions as jest.Mock).mockResolvedValue(mockUser);
      (auditModel.createAuditLog as jest.Mock).mockResolvedValue({});

      await requireAuth(
        mockRequest as AuthenticatedRequest,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith();
      expect(mockRequest.user).toEqual(mockUser);
    });

    it('should reject request without token', async () => {
      await requireAuth(
        mockRequest as AuthenticatedRequest,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(expect.any(AppError));
      expect(auditModel.createAuditLog).toHaveBeenCalled();
    });

    it('should reject request with invalid token', async () => {
      mockRequest.cookies = { access_token: 'invalid-token' };

      (jwt.verifyAccessToken as jest.Mock).mockImplementation(() => {
        throw new Error('Invalid token');
      });

      await requireAuth(
        mockRequest as AuthenticatedRequest,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(expect.any(AppError));
    });

    it('should reject inactive user', async () => {
      const inactiveUser = { ...mockUser, is_active: false };
      mockRequest.cookies = { access_token: 'valid-token' };

      (jwt.verifyAccessToken as jest.Mock).mockReturnValue({
        user_id: 'user-123',
        email: 'test@example.com',
        roles: ['NURSE'],
        permissions: ['donors:view'],
      });

      (userModel.getUserWithRolesAndPermissions as jest.Mock).mockResolvedValue(inactiveUser);

      await requireAuth(
        mockRequest as AuthenticatedRequest,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(expect.any(AppError));
    });
  });

  describe('requireRole', () => {
    it('should allow user with required role', async () => {
      mockRequest.user = mockUser;

      const middleware = requireRole('NURSE');
      await middleware(
        mockRequest as AuthenticatedRequest,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith();
    });

    it('should reject user without required role', async () => {
      mockRequest.user = mockUser;

      const middleware = requireRole('PRESIDENT');
      await middleware(
        mockRequest as AuthenticatedRequest,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(expect.any(AppError));
      expect(auditModel.createAuditLog).toHaveBeenCalled();
    });

    it('should allow system admin regardless of role requirement', async () => {
      const adminUser = {
        ...mockUser,
        roles: [{ role_id: 'role-1', role_code: 'SYSTEM_ADMIN', role_name: 'System Admin' }],
      };
      mockRequest.user = adminUser;

      const middleware = requireRole('PRESIDENT');
      await middleware(
        mockRequest as AuthenticatedRequest,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith();
    });
  });

  describe('requirePermission', () => {
    it('should allow user with required permission', async () => {
      mockRequest.user = mockUser;

      const middleware = requirePermission('donors:view');
      await middleware(
        mockRequest as AuthenticatedRequest,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith();
    });

    it('should reject user without required permission', async () => {
      mockRequest.user = mockUser;

      const middleware = requirePermission('donors:manage');
      await middleware(
        mockRequest as AuthenticatedRequest,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(expect.any(AppError));
      expect(auditModel.createAuditLog).toHaveBeenCalled();
    });

    it('should allow system admin regardless of permission requirement', async () => {
      const adminUser = {
        ...mockUser,
        permissions: [
          { permission_id: 'perm-1', permission_name: 'system:admin', resource: 'system', action: 'admin' },
        ],
      };
      mockRequest.user = adminUser;

      const middleware = requirePermission('donors:manage');
      await middleware(
        mockRequest as AuthenticatedRequest,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith();
    });
  });

  describe('requireOrgLevel', () => {
    it('should allow user with required organizational level', async () => {
      mockRequest.user = mockUser;

      const middleware = requireOrgLevel('Municipal', 'Provincial');
      await middleware(
        mockRequest as AuthenticatedRequest,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith();
    });

    it('should reject user without required organizational level', async () => {
      mockRequest.user = mockUser;

      const middleware = requireOrgLevel('National', 'Regional');
      await middleware(
        mockRequest as AuthenticatedRequest,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(expect.any(AppError));
      expect(auditModel.createAuditLog).toHaveBeenCalled();
    });
  });

  describe('requireSameCenter', () => {
    it('should allow access when no center_id specified', async () => {
      mockRequest.user = mockUser;

      const middleware = requireSameCenter();
      await middleware(
        mockRequest as AuthenticatedRequest,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith();
    });

    // Note: Full center access tests require database mocking
    // See integration tests for complete coverage
  });
});

