import { useMemo } from 'react';
import { useStaffAuth } from './useStaffAuth';

/**
 * Hook to check if staff has specific permissions
 */
export function usePermissions() {
  const { staff } = useStaffAuth();

  const hasPermission = useMemo(() => {
    return (permissionName: string): boolean => {
      if (!staff || !staff.permissions) return false;
      
      // Administrator role has all permissions
      if (staff.roles?.role_name === 'Administrator') {
        return true;
      }

      return staff.permissions.some(
        (perm) => perm.permission_name === permissionName
      );
    };
  }, [staff]);

  const hasAnyPermission = useMemo(() => {
    return (permissionNames: string[]): boolean => {
      if (!staff || !staff.permissions) return false;
      
      // Administrator role has all permissions
      if (staff.roles?.role_name === 'Administrator') {
        return true;
      }

      return permissionNames.some((permName) =>
        staff.permissions?.some((perm) => perm.permission_name === permName)
      );
    };
  }, [staff]);

  const hasAllPermissions = useMemo(() => {
    return (permissionNames: string[]): boolean => {
      if (!staff || !staff.permissions) return false;
      
      // Administrator role has all permissions
      if (staff.roles?.role_name === 'Administrator') {
        return true;
      }

      return permissionNames.every((permName) =>
        staff.permissions?.some((perm) => perm.permission_name === permName)
      );
    };
  }, [staff]);

  const hasRole = useMemo(() => {
    return (roleName: string): boolean => {
      if (!staff || !staff.roles) return false;
      return staff.roles.role_name.toLowerCase() === roleName.toLowerCase();
    };
  }, [staff]);

  return {
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    hasRole,
    permissions: staff?.permissions || [],
    role: staff?.roles?.role_name || null,
    isAdmin: staff?.roles?.role_name === 'Administrator'
  };
}

