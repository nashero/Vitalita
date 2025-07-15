import React, { useState } from 'react';
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
  History
} from 'lucide-react';
import { useStaffAuth } from '../hooks/useStaffAuth';
import StaffAppointmentDashboard from './StaffAppointmentDashboard';
import StaffAvailabilityManager from './StaffAvailabilityManager';
import SystemLogsViewer from './SystemLogsViewer';

export default function StaffDashboard() {
  const { staff, logout } = useStaffAuth();
  const [activeTab, setActiveTab] = useState('overview');

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
    const colors = {
      'admin': 'bg-red-100 text-red-800',
      'manager': 'bg-purple-100 text-purple-800',
      'coordinator': 'bg-blue-100 text-blue-800',
      'staff': 'bg-green-100 text-green-800',
      'default': 'bg-gray-100 text-gray-800'
    };
    return colors[roleName.toLowerCase() as keyof typeof colors] || colors.default;
  };

  const navigationItems = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'appointments', label: 'Appointments', icon: ClipboardList },
    { id: 'availability', label: 'Availability', icon: CalendarDays },
    { id: 'logs', label: 'System Logs', icon: History },
    { id: 'donors', label: 'Donors', icon: Users },
    { id: 'centers', label: 'Centers', icon: Building2 },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Building2 className="w-8 h-8 text-blue-600 mr-3" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">Vitalita Admin</h1>
                <p className="text-xs text-gray-500">Staff Management Portal</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {/* Search */}
              <div className="relative hidden md:block">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search..."
                  className="block w-64 pl-10 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Notifications */}
              <button className="relative p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 right-1 block h-2 w-2 rounded-full bg-red-400"></span>
              </button>

              {/* User Menu */}
              <div className="flex items-center space-x-3">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-medium text-gray-900">
                    {staff.first_name} {staff.last_name}
                  </p>
                  <p className="text-xs text-gray-500">{staff.role?.role_name || 'Staff'}</p>
                </div>
                <div className="bg-blue-100 p-2 rounded-full">
                  <UserCheck className="w-5 h-5 text-blue-600" />
                </div>
                <button
                  onClick={logout}
                  className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  <span className="hidden sm:inline">Sign Out</span>
                </button>
              </div>
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
                          ? 'bg-blue-100 text-blue-700'
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
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-6 text-white">
                  <h2 className="text-2xl font-bold mb-2">
                    Welcome back, {staff.first_name}!
                  </h2>
                  <p className="text-blue-100">
                    Here's what's happening with your donation centers today.
                  </p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center">
                      <div className="bg-blue-100 p-3 rounded-full">
                        <Calendar className="w-6 h-6 text-blue-600" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">Today's Appointments</p>
                        <p className="text-2xl font-bold text-gray-900">24</p>
                      </div>
                    </div>
                    <div className="mt-4 flex items-center text-sm">
                      <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                      <span className="text-green-600">+12% from yesterday</span>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center">
                      <div className="bg-green-100 p-3 rounded-full">
                        <Users className="w-6 h-6 text-green-600" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">Active Donors</p>
                        <p className="text-2xl font-bold text-gray-900">1,247</p>
                      </div>
                    </div>
                    <div className="mt-4 flex items-center text-sm">
                      <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                      <span className="text-green-600">+5% this month</span>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center">
                      <div className="bg-purple-100 p-3 rounded-full">
                        <Building2 className="w-6 h-6 text-purple-600" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">Active Centers</p>
                        <p className="text-2xl font-bold text-gray-900">8</p>
                      </div>
                    </div>
                    <div className="mt-4 flex items-center text-sm">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-1" />
                      <span className="text-green-600">All operational</span>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center">
                      <div className="bg-orange-100 p-3 rounded-full">
                        <Clock className="w-6 h-6 text-orange-600" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">Pending Reviews</p>
                        <p className="text-2xl font-bold text-gray-900">7</p>
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
                            activity.type === 'appointment' ? 'bg-blue-500' :
                            activity.type === 'donor' ? 'bg-green-500' :
                            activity.type === 'center' ? 'bg-purple-500' : 'bg-gray-500'
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

            {(activeTab !== 'overview' && activeTab !== 'appointments' && activeTab !== 'availability' && activeTab !== 'logs') && (
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