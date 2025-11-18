/**
 * Hook for checking user permissions
 * Updated to work with new AuthContext
 */

import { useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';

export function usePermissions() {
  const { user, hasPermission, hasRole, hasAnyPermission, hasAllPermissions } = useAuth();

  const permissions = useMemo(() => {
    return user?.permissions.map((p) => p.permission_name) || [];
  }, [user]);

  const roles = useMemo(() => {
    return user?.roles.map((r) => r.role_code) || [];
  }, [user]);

  const isSystemAdmin = useMemo(() => {
    return hasPermission('system:admin');
  }, [hasPermission]);

  return {
    hasPermission,
    hasRole,
    hasAnyPermission,
    hasAllPermissions,
    permissions,
    roles,
    isSystemAdmin,
    user,
  };
}
