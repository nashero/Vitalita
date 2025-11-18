/**
 * Authentication Context for Staff Portal
 * Manages authentication state, user data, roles, and permissions
 */

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../lib/api';
import toast from 'react-hot-toast';

// Types
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

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (data: RegisterData) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  hasPermission: (permission: string) => boolean;
  hasRole: (role: string) => boolean;
  hasAnyPermission: (permissions: string[]) => boolean;
  hasAllPermissions: (permissions: string[]) => boolean;
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

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Check authentication status on mount
  useEffect(() => {
    checkAuth();
  }, []);

  // Auto-refresh token before expiry
  useEffect(() => {
    if (!user) return;

    const refreshInterval = setInterval(async () => {
      try {
        await apiClient.post('/api/staff/refresh-token');
      } catch (error) {
        console.error('Token refresh failed:', error);
        handleLogout();
      }
    }, 14 * 60 * 1000); // Refresh every 14 minutes (before 15min expiry)

    return () => clearInterval(refreshInterval);
  }, [user]);

  const checkAuth = async () => {
    try {
      const response = await apiClient.get('/api/staff/me');
      if (response.data.success) {
        setUser(response.data.data.user);
      }
    } catch (error) {
      // Not authenticated or token expired
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      const response = await apiClient.post('/api/staff/login', { email, password });

      if (response.data.success) {
        setUser(response.data.data.user);
        toast.success('Login successful!');
        return { success: true };
      } else {
        const errorMsg = response.data.error?.message || 'Login failed';
        toast.error(errorMsg);
        return { success: false, error: errorMsg };
      }
    } catch (error: any) {
      const errorMsg =
        error.response?.data?.error?.message || error.message || 'Login failed. Please try again.';
      toast.error(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  const register = async (data: RegisterData) => {
    try {
      setLoading(true);
      const response = await apiClient.post('/api/staff/register', data);

      if (response.data.success) {
        toast.success('Registration successful! Your account is pending approval.');
        return { success: true };
      } else {
        const errorMsg = response.data.error?.message || 'Registration failed';
        toast.error(errorMsg);
        return { success: false, error: errorMsg };
      }
    } catch (error: any) {
      const errorMsg =
        error.response?.data?.error?.message ||
        error.message ||
        'Registration failed. Please try again.';
      toast.error(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await apiClient.post('/api/staff/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      // Clear any in-memory data
      navigate('/login', { replace: true });
    }
  };

  const logout = useCallback(async () => {
    await handleLogout();
    toast.success('Logged out successfully');
  }, [navigate]);

  const refreshUser = async () => {
    try {
      const response = await apiClient.get('/api/staff/me');
      if (response.data.success) {
        setUser(response.data.data.user);
      }
    } catch (error) {
      console.error('Failed to refresh user:', error);
      handleLogout();
    }
  };

  // Permission checking functions
  const hasPermission = useCallback(
    (permission: string): boolean => {
      if (!user) return false;
      // System admin has all permissions
      if (user.permissions.some((p) => p.permission_name === 'system:admin')) {
        return true;
      }
      return user.permissions.some((p) => p.permission_name === permission);
    },
    [user]
  );

  const hasRole = useCallback(
    (role: string): boolean => {
      if (!user) return false;
      return user.roles.some((r) => r.role_code === role || r.role_name === role);
    },
    [user]
  );

  const hasAnyPermission = useCallback(
    (permissions: string[]): boolean => {
      if (!user) return false;
      if (user.permissions.some((p) => p.permission_name === 'system:admin')) {
        return true;
      }
      return permissions.some((perm) => hasPermission(perm));
    },
    [user, hasPermission]
  );

  const hasAllPermissions = useCallback(
    (permissions: string[]): boolean => {
      if (!user) return false;
      if (user.permissions.some((p) => p.permission_name === 'system:admin')) {
        return true;
      }
      return permissions.every((perm) => hasPermission(perm));
    },
    [user, hasPermission]
  );

  const value: AuthContextType = {
    user,
    loading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    refreshUser,
    hasPermission,
    hasRole,
    hasAnyPermission,
    hasAllPermissions,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

