import { ReactNode } from 'react';
import { usePermissions } from '../hooks/usePermissions';

interface PermissionGateProps {
  children: ReactNode;
  permission?: string;
  permissions?: string[];
  requireAll?: boolean;
  role?: string;
  fallback?: ReactNode;
}

/**
 * Component to conditionally render content based on permissions or roles
 */
export function PermissionGate({
  children,
  permission,
  permissions,
  requireAll = false,
  role,
  fallback = null
}: PermissionGateProps) {
  const { hasPermission, hasAnyPermission, hasAllPermissions, hasRole, isAdmin } = usePermissions();

  // Admin always has access
  if (isAdmin) {
    return <>{children}</>;
  }

  // Check role requirement
  if (role && !hasRole(role)) {
    return <>{fallback}</>;
  }

  // Check single permission
  if (permission && !hasPermission(permission)) {
    return <>{fallback}</>;
  }

  // Check multiple permissions
  if (permissions && permissions.length > 0) {
    const hasAccess = requireAll
      ? hasAllPermissions(permissions)
      : hasAnyPermission(permissions);
    
    if (!hasAccess) {
      return <>{fallback}</>;
    }
  }

  return <>{children}</>;
}

