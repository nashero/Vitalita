/**
 * TypeScript types for Staff Portal
 */

export interface User {
  user_id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone_number?: string;
  avis_center_id: string;
  organizational_level: 'National' | 'Regional' | 'Provincial' | 'Municipal';
  is_email_verified: boolean;
  mfa_enabled: boolean;
  last_login_at?: string;
  roles: Array<{
    role_id: string;
    role_name: string;
    role_code: string;
  }>;
  permissions: Array<{
    permission_id: string;
    permission_name: string;
    resource: string;
    action: string;
  }>;
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
}

export interface RegisterData {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  phone_number?: string;
  avis_center_id: string;
  organizational_level: 'National' | 'Regional' | 'Provincial' | 'Municipal';
}

export interface LoginData {
  email: string;
  password: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    statusCode: number;
    details?: any;
  };
}

