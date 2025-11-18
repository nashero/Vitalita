/**
 * Dashboard Router - routes to appropriate dashboard based on user role
 */

import { useAuth } from '../../contexts/AuthContext';
import ExecutiveDashboard from './ExecutiveDashboard';
import MedicalDashboard from './MedicalDashboard';
import AdministrativeDashboard from './AdministrativeDashboard';
import OperationalDashboard from './OperationalDashboard';

export default function DashboardRouter() {
  const { user, hasRole } = useAuth();

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  // Executive roles
  if (
    hasRole('PRESIDENT') ||
    hasRole('VP') ||
    hasRole('Treasurer') ||
    hasRole('SECRETARY') ||
    hasRole('EXEC_COMMITTEE')
  ) {
    return <ExecutiveDashboard />;
  }

  // Medical roles
  if (
    hasRole('HCD') ||
    hasRole('SELECTION_PHYSICIAN') ||
    hasRole('REGISTERED_NURSE') ||
    hasRole('NURSE_COORDINATOR') ||
    hasRole('PHLEBOTOMIST') ||
    hasRole('LAB_TECH')
  ) {
    return <MedicalDashboard />;
  }

  // Operational roles
  if (
    hasRole('VOL_COORDINATOR') ||
    hasRole('QA_OFFICER') ||
    hasRole('MOBILE_COORDINATOR') ||
    hasRole('YOUTH_COMMITTEE')
  ) {
    return <OperationalDashboard />;
  }

  // Administrative roles (default)
  return <AdministrativeDashboard />;
}

