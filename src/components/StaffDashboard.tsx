import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import i18n from '../i18n';
import { getCurrentLocale } from '../utils/languageUtils';
import { 
  LogOut, 
  Calendar, 
  Users, 
  Building2, 
  BarChart3, 
  Settings, 
  Bell,
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
  ArrowLeft
} from 'lucide-react';
import { useStaffAuth } from '../hooks/useStaffAuth';
import { supabase } from '../lib/supabase';
import StaffAppointmentDashboard from './StaffAppointmentDashboard';
import StaffAvailabilityManager from './StaffAvailabilityManager';
import SystemLogsViewer from './SystemLogsViewer';
import StaffDonorsDashboard from './StaffDonorsDashboard';

interface DashboardStats {
  todayAppointments: number;
  activeDonors: number;
  activeCenters: number;
  pendingReviews: number;
}

export default function StaffDashboard({ onBackToLanding }: { onBackToLanding?: () => void }) {
  const { t } = useTranslation();
  const { staff, logout } = useStaffAuth();
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

      // Fetch today's appointments
      const { count: todayAppointments } = await supabase
        .from('appointments')
        .select('*', { count: 'exact', head: true })
        .gte('appointment_datetime', startOfDay)
        .lte('appointment_datetime', endOfDay);

      // Fetch active donors count
      const { count: activeDonors } = await supabase
        .from('donors')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true);

      // Fetch active centers count
      const { count: activeCenters } = await supabase
        .from('donation_centers')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true);

      // Fetch pending reviews (donors with initial_vetting_status = false)
      const { count: pendingReviews } = await supabase
        .from('donors')
        .select('*', { count: 'exact', head: true })
        .eq('initial_vetting_status', false);

      setStats({
        todayAppointments: todayAppointments || 0,
        activeDonors: activeDonors || 0,
        activeCenters: activeCenters || 0,
        pendingReviews: pendingReviews || 0,
      });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!staff) return null;

  const formatDate = (dateString: string | null) => {
    if (!dateString) return t('dashboard.never');
    return new Date(dateString).toLocaleDateString(getCurrentLocale(i18n.language), {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getRoleColor = (roleName: string) => {
    const colors = {
      'admin': 'bg-red-100 text-red-800',
      'manager': 'bg-red-100 text-red-800',
      'coordinator': 'bg-red-100 text-red-800',
      'staff': 'bg-red-100 text-red-800',
      'default': 'bg-gray-100 text-gray-800'
    };
    return colors[roleName.toLowerCase() as keyof typeof colors] || colors.default;
  };

  const navigationItems = [
    { id: 'overview', label: t('staff.dashboard'), icon: BarChart3 },
    { id: 'appointments', label: t('staff.appointments'), icon: ClipboardList },
    { id: 'availability', label: t('staff.availability'), icon: CalendarDays },
    { id: 'logs', label: t('staff.logs'), icon: History },
    { id: 'donors', label: t('staff.donors'), icon: Users },
    { id: 'centers', label: t('staff.centers'), icon: Building2 },
    { id: 'settings', label: t('staff.settings'), icon: Settings },
  ];

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
              {onBackToLanding && (
                <button
                  onClick={onBackToLanding}
                  className="flex items-center px-4 py-2 text-sm font-medium text-red-600 border border-red-200 bg-white hover:bg-red-50 rounded-lg transition-colors duration-200"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Home
                </button>
              )}
              <button
                onClick={logout}
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
                  <p className="text-xs text-gray-500">Role</p>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleColor(staff.role?.role_name || 'staff')}`}>
                    {staff.role?.role_name || 'Staff'}
                  </span>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Email</p>
                  <p className="text-sm text-gray-900 truncate">{staff.email}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Last Login</p>
                  <p className="text-sm text-gray-900">{formatDate(staff.last_login_timestamp)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Status</p>
                  <div className="flex items-center">
                    <CheckCircle className="w-3 h-3 text-green-500 mr-1" />
                    <span className="text-sm text-green-600">Active</span>
                  </div>
                </div>
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
                    <div className="mt-4 flex items-center text-sm">
                      <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                      <span className="text-green-600">Scheduled for today</span>
                    </div>
                  </div>

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
                    <div className="mt-4 flex items-center text-sm">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-1" />
                      <span className="text-green-600">Verified and active</span>
                    </div>
                  </div>

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
                    <div className="mt-4 flex items-center text-sm">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-1" />
                      <span className="text-green-600">All operational</span>
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
                    <div className="mt-4 flex items-center text-sm">
                      <AlertCircle className="w-4 h-4 text-orange-500 mr-1" />
                      <span className="text-orange-600">Requires attention</span>
                    </div>
                  </div>
                </div>

                {/* Recent Activity */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
                  </div>
                  <div className="p-6">
                    <div className="space-y-4">
                      {[
                        { action: 'New appointment scheduled', time: '2 minutes ago', type: 'appointment' },
                        { action: 'Donor profile updated', time: '15 minutes ago', type: 'donor' },
                        { action: 'Center capacity increased', time: '1 hour ago', type: 'center' },
                        { action: 'Staff member logged in', time: '2 hours ago', type: 'staff' },
                      ].map((activity, index) => (
                        <div key={index} className="flex items-center space-x-3">
                          <div className={`w-2 h-2 rounded-full ${
                            activity.type === 'appointment' ? 'bg-red-500' :
                            activity.type === 'donor' ? 'bg-red-500' :
                            activity.type === 'center' ? 'bg-red-500' : 'bg-gray-500'
                          }`}></div>
                          <div className="flex-1">
                            <p className="text-sm text-gray-900">{activity.action}</p>
                            <p className="text-xs text-gray-500">{activity.time}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'appointments' && <StaffAppointmentDashboard />}
            {activeTab === 'availability' && <StaffAvailabilityManager />}
            {activeTab === 'logs' && <SystemLogsViewer />}
            {activeTab === 'donors' && <StaffDonorsDashboard />}

            {(activeTab !== 'overview' && activeTab !== 'appointments' && activeTab !== 'availability' && activeTab !== 'logs' && activeTab !== 'donors') && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
                <div className="bg-gray-100 p-4 rounded-full w-16 h-16 mx-auto mb-4">
                  <Settings className="w-8 h-8 text-gray-400 mx-auto mt-1" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {navigationItems.find(item => item.id === activeTab)?.label} Section
                </h3>
                <p className="text-gray-600">
                  This section is under development. Full functionality will be available soon.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}