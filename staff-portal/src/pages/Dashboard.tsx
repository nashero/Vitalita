import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LogOut,
  Calendar,
  Users,
  Building2,
  BarChart3,
  Settings,
  Search,
  Plus,
  Clock,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  UserCheck,
  MapPin,
  ClipboardList,
  CalendarDays,
  History,
  Heart,
  ArrowLeft,
  Shield,
  FileText,
  Bell
} from 'lucide-react';
import { useStaffAuth } from '../hooks/useStaffAuth';
import { usePermissions } from '../hooks/usePermissions';
import { supabase } from '../lib/supabase';
import { ProtectedRoute } from '../components/ProtectedRoute';

interface DashboardStats {
  todayAppointments: number;
  activeDonors: number;
  activeCenters: number;
  pendingReviews: number;
}

interface NavigationItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  permission?: string;
  permissions?: string[];
  requireAll?: boolean;
  role?: string;
}

function DashboardContent() {
  const { staff, logout } = useStaffAuth();
  const { hasPermission, hasAnyPermission, hasRole, isAdmin } = usePermissions();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState<DashboardStats>({
    todayAppointments: 0,
    activeDonors: 0,
    activeCenters: 0,
    pendingReviews: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (staff) {
      fetchDashboardStats();
    }
  }, [staff]);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);

      // Get today's date range
      const today = new Date();
      const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate()).toISOString();
      const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59).toISOString();

      // Fetch today's appointments (if has permission)
      if (hasPermission('view_appointments') || isAdmin) {
        const { count: todayAppointments } = await supabase
          .from('appointments')
          .select('*', { count: 'exact', head: true })
          .gte('appointment_datetime', startOfDay)
          .lte('appointment_datetime', endOfDay);
        setStats(prev => ({ ...prev, todayAppointments: todayAppointments || 0 }));
      }

      // Fetch active donors count (if has permission)
      if (hasPermission('view_donors') || isAdmin) {
        const { count: activeDonors } = await supabase
          .from('donors')
          .select('*', { count: 'exact', head: true })
          .eq('is_active', true);
        setStats(prev => ({ ...prev, activeDonors: activeDonors || 0 }));
      }

      // Fetch active centers count (if has permission)
      if (hasPermission('view_centers') || isAdmin) {
        const { count: activeCenters } = await supabase
          .from('donation_centers')
          .select('*', { count: 'exact', head: true })
          .eq('is_active', true);
        setStats(prev => ({ ...prev, activeCenters: activeCenters || 0 }));
      }

      // Fetch pending reviews (if has permission)
      if (hasPermission('view_donors') || isAdmin) {
        const { count: pendingReviews } = await supabase
          .from('donors')
          .select('*', { count: 'exact', head: true })
          .eq('initial_vetting_status', false);
        setStats(prev => ({ ...prev, pendingReviews: pendingReviews || 0 }));
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!staff) return null;

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getRoleColor = (roleName: string) => {
    const colors: Record<string, string> = {
      'Administrator': 'bg-red-100 text-red-800',
      'Manager': 'bg-blue-100 text-blue-800',
      'Staff': 'bg-green-100 text-green-800',
      'Nurse': 'bg-purple-100 text-purple-800',
      'Receptionist': 'bg-yellow-100 text-yellow-800',
    };
    return colors[roleName] || 'bg-gray-100 text-gray-800';
  };

  // Define navigation items with permission checks
  const allNavigationItems: NavigationItem[] = [
    { id: 'overview', label: 'Dashboard', icon: BarChart3 },
    { id: 'appointments', label: 'Appointments', icon: ClipboardList, permission: 'view_appointments' },
    { id: 'donors', label: 'Donors', icon: Users, permission: 'view_donors' },
    { id: 'centers', label: 'Centers', icon: Building2, permission: 'view_centers' },
    { id: 'availability', label: 'Availability', icon: CalendarDays, permission: 'view_slots' },
    { id: 'reports', label: 'Reports', icon: FileText, permission: 'generate_reports' },
    { id: 'staff', label: 'Staff Management', icon: Shield, permission: 'view_staff' },
    { id: 'logs', label: 'Audit Logs', icon: History, permission: 'audit_logs' },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  // Filter navigation items based on permissions
  const navigationItems = allNavigationItems.filter(item => {
    if (isAdmin) return true; // Admin sees everything
    if (item.permission) return hasPermission(item.permission);
    if (item.permissions) {
      return item.requireAll
        ? item.permissions.every(p => hasPermission(p))
        : item.permissions.some(p => hasPermission(p));
    }
    if (item.role) return hasRole(item.role);
    return true; // Items without restrictions are always visible
  });

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Heart className="w-8 h-8 text-red-600 mr-3" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">Vitalita Staff Portal</h1>
                <p className="text-xs text-gray-500">Administrative dashboard and management</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleLogout}
                className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors duration-200"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:w-64 flex-shrink-0">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
              <nav className="space-y-2">
                {navigationItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveTab(item.id)}
                      className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${
                        activeTab === item.id
                          ? 'bg-red-100 text-red-700'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                      }`}
                    >
                      <Icon className="w-4 h-4 mr-3" />
                      {item.label}
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Staff Info Card */}
            <div className="mt-6 bg-white rounded-xl shadow-sm border border-gray-200 p-4">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Staff Information</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-gray-500">Name</p>
                  <p className="text-sm font-medium text-gray-900">
                    {staff.first_name} {staff.last_name}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Role</p>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleColor(staff.roles?.role_name || 'Staff')}`}>
                    {staff.roles?.role_name || 'Staff'}
                  </span>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Email</p>
                  <p className="text-sm text-gray-900 truncate">{staff.email}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Last Login</p>
                  <p className="text-sm text-gray-900">{formatDate(staff.last_login_timestamp || null)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Status</p>
                  <div className="flex items-center">
                    <CheckCircle className="w-3 h-3 text-green-500 mr-1" />
                    <span className="text-sm text-green-600">Active</span>
                  </div>
                </div>
                {staff.permissions && staff.permissions.length > 0 && (
                  <div>
                    <p className="text-xs text-gray-500">Permissions</p>
                    <p className="text-sm text-gray-900">{staff.permissions.length} assigned</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Welcome Section */}
                <div className="bg-gradient-to-r from-red-600 to-red-700 rounded-xl p-6 text-white">
                  <h2 className="text-2xl font-bold mb-2">
                    Welcome back, {staff.first_name}!
                  </h2>
                  <p className="text-red-100">
                    Here's what's happening with your donation centers today.
                  </p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {(hasPermission('view_appointments') || isAdmin) && (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                      <div className="flex items-center">
                        <div className="bg-red-100 p-3 rounded-full">
                          <Calendar className="w-6 h-6 text-red-600" />
                        </div>
                        <div className="ml-4">
                          <p className="text-sm font-medium text-gray-600">Today's Appointments</p>
                          <p className="text-2xl font-bold text-gray-900">
                            {loading ? '...' : stats.todayAppointments}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {(hasPermission('view_donors') || isAdmin) && (
                    <>
                      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center">
                          <div className="bg-red-100 p-3 rounded-full">
                            <Users className="w-6 h-6 text-red-600" />
                          </div>
                          <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Active Donors</p>
                            <p className="text-2xl font-bold text-gray-900">
                              {loading ? '...' : stats.activeDonors}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center">
                          <div className="bg-red-100 p-3 rounded-full">
                            <Clock className="w-6 h-6 text-red-600" />
                          </div>
                          <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Pending Reviews</p>
                            <p className="text-2xl font-bold text-gray-900">
                              {loading ? '...' : stats.pendingReviews}
                            </p>
                          </div>
                        </div>
                      </div>
                    </>
                  )}

                  {(hasPermission('view_centers') || isAdmin) && (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                      <div className="flex items-center">
                        <div className="bg-red-100 p-3 rounded-full">
                          <Building2 className="w-6 h-6 text-red-600" />
                        </div>
                        <div className="ml-4">
                          <p className="text-sm font-medium text-gray-600">Active Centers</p>
                          <p className="text-2xl font-bold text-gray-900">
                            {loading ? '...' : stats.activeCenters}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Quick Actions */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {(hasPermission('manage_appointments') || isAdmin) && (
                      <button className="flex items-center px-4 py-3 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors">
                        <Plus className="w-5 h-5 mr-2" />
                        Create Appointment
                      </button>
                    )}
                    {(hasPermission('manage_donors') || isAdmin) && (
                      <button className="flex items-center px-4 py-3 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors">
                        <UserCheck className="w-5 h-5 mr-2" />
                        Add Donor
                      </button>
                    )}
                    {(hasPermission('generate_reports') || isAdmin) && (
                      <button className="flex items-center px-4 py-3 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors">
                        <FileText className="w-5 h-5 mr-2" />
                        Generate Report
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'appointments' && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Appointments</h2>
                <p className="text-gray-600">Appointment management interface coming soon...</p>
              </div>
            )}

            {activeTab === 'donors' && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Donors</h2>
                <p className="text-gray-600">Donor management interface coming soon...</p>
              </div>
            )}

            {activeTab === 'centers' && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Centers</h2>
                <p className="text-gray-600">Center management interface coming soon...</p>
              </div>
            )}

            {activeTab === 'availability' && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Availability</h2>
                <p className="text-gray-600">Availability management interface coming soon...</p>
              </div>
            )}

            {activeTab === 'reports' && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Reports</h2>
                <p className="text-gray-600">Reporting interface coming soon...</p>
              </div>
            )}

            {activeTab === 'staff' && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Staff Management</h2>
                <p className="text-gray-600">Staff management interface coming soon...</p>
              </div>
            )}

            {activeTab === 'logs' && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Audit Logs</h2>
                <p className="text-gray-600">Audit logs interface coming soon...</p>
              </div>
            )}

            {activeTab === 'settings' && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Settings</h2>
                <p className="text-gray-600">Settings interface coming soon...</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  // Allow access if user has view_dashboard permission OR if permissions aren't set up yet
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}
