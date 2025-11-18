import { Request } from 'express';
import { JwtPayload } from 'jsonwebtoken';

// User types
export interface User {
  user_id: string;
  email: string;
  password_hash: string;
  salt: string;
  first_name: string;
  last_name: string;
  phone_number?: string;
  avis_center_id: string;
  organizational_level: 'National' | 'Regional' | 'Provincial' | 'Municipal';
  is_active: boolean;
  is_email_verified: boolean;
  mfa_enabled: boolean;
  mfa_secret?: string;
  last_login_at?: Date;
  password_changed_at: Date;
  failed_login_attempts: number;
  account_locked_until?: Date;
  created_at: Date;
  updated_at: Date;
}

export interface UserWithRoles extends User {
  roles: Role[];
  permissions: Permission[];
}

export interface Role {
  role_id: string;
  role_name: string;
  role_code: string;
  description?: string;
  role_category: 'Executive' | 'Medical' | 'Administrative' | 'Operational' | 'Volunteer';
  is_system_role: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface Permission {
  permission_id: string;
  permission_name: string;
  resource: string;
  action: string;
  description?: string;
  created_at: Date;
  updated_at: Date;
}

export interface UserRole {
  user_role_id: string;
  user_id: string;
  role_id: string;
  assigned_by?: string;
  assigned_at: Date;
  expires_at?: Date;
  is_active: boolean;
}

export interface AVISCenter {
  center_id: string;
  center_code: string;
  name: string;
  center_type: 'National' | 'Regional' | 'Provincial' | 'Municipal';
  parent_center_id?: string;
  address?: string;
  city?: string;
  province?: string;
  region?: string;
  postal_code?: string;
  country: string;
  contact_phone?: string;
  contact_email?: string;
  website_url?: string;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface AuditLog {
  log_id: string;
  timestamp: Date;
  user_id?: string;
  action: string;
  resource_type?: string;
  resource_id?: string;
  details?: Record<string, unknown>;
  ip_address?: string;
  user_agent?: string;
  session_id?: string;
  status: 'success' | 'failure' | 'error' | 'warning';
  error_message?: string;
}

// Request/Response types
export interface RegisterRequest {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  phone_number?: string;
  avis_center_id: string;
  organizational_level: 'National' | 'Regional' | 'Provincial' | 'Municipal';
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  new_password: string;
}

export interface RefreshTokenRequest {
  refresh_token?: string;
}

export interface AuthResponse {
  user: {
    user_id: string;
    email: string;
    first_name: string;
    last_name: string;
    avis_center_id: string;
    organizational_level: string;
    roles: Array<{
      role_id: string;
      role_name: string;
      role_code: string;
    }>;
    permissions: string[];
  };
  access_token: string;
}

export interface TokenPayload extends JwtPayload {
  user_id: string;
  email: string;
  roles: string[];
  permissions: string[];
}

// Express Request with user
export interface AuthenticatedRequest extends Request {
  user?: UserWithRoles;
  token?: TokenPayload;
}

// Email types
export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

// Error types
export interface ApiError extends Error {
  statusCode: number;
  isOperational: boolean;
}

