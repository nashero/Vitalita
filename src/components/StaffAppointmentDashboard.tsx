import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Filter, 
  Search, 
  Clock, 
  User, 
  Building2, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Eye,
  Edit3,
  History,
  ChevronDown,
  ChevronRight,
  MapPin,
  Phone,
  Mail,
  Loader,
  RefreshCw,
  Download,
  Users,
  Activity
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useStaffAuth } from '../hooks/useStaffAuth';

interface Appointment {
  appointment_id: string;
  donor_hash_id: string;
  staff_id: string | null;
  donation_center_id: string;
  appointment_datetime: string;
  donation_type: string;
  status: string;
  booking_channel: string;
  confirmation_sent: boolean;
  reminder_sent: boolean;
  creation_timestamp: string;
  last_updated_timestamp: string;
  donation_centers?: {
    center_id: string;
    name: string;
    address: string;
    city: string;
    country: string;
    contact_phone: string | null;
    email: string | null;
  };
  donors?: {
    donor_hash_id: string;
    preferred_language: string;
    preferred_communication_channel: string;
    initial_vetting_status: boolean;
    is_active: boolean;
  };
}

interface AuditLog {
  log_id: string;
  timestamp: string;
  user_id: string | null;
  user_type: string;
  action: string;
  details: string | null;
  ip_address: string | null;
  user_agent: string | null;
  resource_type: string | null;
  resource_id: string | null;
  status: string;
}

interface DonationCenter {
  center_id: string;
  name: string;
  city: string;
}

type AppointmentStatus = 'scheduled' | 'confirmed' | 'cancelled' | 'completed' | 'no-show';
type ViewMode = 'appointments' | 'audit';

export default function StaffAppointmentDashboard() {
  const { staff } = useStaffAuth();
  const [viewMode, setViewMode] = useState<ViewMode>('appointments');
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [donationCenters, setDonationCenters] = useState<DonationCenter[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCenter, setSelectedCenter] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [showFilters, setShowFilters] = useState(false);
  
  // Grouping and pagination
  const [expandedDays, setExpandedDays] = useState<Set<string>>(new Set());
  const [auditPage, setAuditPage] = useState(1);
  const auditPageSize = 20;

  const appointmentStatuses: { value: AppointmentStatus; label: string; color: string; icon: React.ComponentType<any> }[] = [
    { value: 'scheduled', label: 'Scheduled', color: 'bg-blue-100 text-blue-800', icon: Clock },
    { value: 'confirmed', label: 'Confirmed', color: 'bg-green-100 text-green-800', icon: CheckCircle },
    { value: 'cancelled', label: 'Cancelled', color: 'bg-red-100 text-red-800', icon: XCircle },
    { value: 'completed', label: 'Completed', color: 'bg-purple-100 text-purple-800', icon: CheckCircle },
    { value: 'no-show', label: 'No Show', color: 'bg-gray-100 text-gray-800', icon: AlertCircle },
  ];

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (viewMode === 'appointments') {
      fetchAppointments();
    } else {
      fetchAuditLogs();
    }
  }, [viewMode, selectedCenter, selectedStatus, selectedDate, searchTerm]);

  const fetchInitialData = async () => {
    try {
      const { data: centers, error: centersError } = await supabase
        .from('donation_centers')
        .select('center_id, name, city')
        .eq('is_active', true)
        .order('name');

      if (centersError) throw centersError;
      setDonationCenters(centers || []);

      await fetchAppointments();
    } catch (err) {
      console.error('Error fetching initial data:', err);
      setError('Failed to load dashboard data');
    }
  };

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      setError('');

      let query = supabase
        .from('appointments')
        .select(`
          *,
          donation_centers:donation_center_id (
            center_id,
            name,
            address,
            city,
            country,
            contact_phone,
            email
          ),
          donors:donor_hash_id (
            donor_hash_id,
            preferred_language,
            preferred_communication_channel,
            initial_vetting_status,
            is_active
          )
        `)
        .order('appointment_datetime', { ascending: true });

      // Apply filters
      if (selectedCenter) {
        query = query.eq('donation_center_id', selectedCenter);
      }
      if (selectedStatus) {
        query = query.eq('status', selectedStatus);
      }
      if (selectedDate) {
        const startDate = new Date(selectedDate);
        const endDate = new Date(selectedDate);
        endDate.setDate(endDate.getDate() + 1);
        query = query.gte('appointment_datetime', startDate.toISOString())
                   .lt('appointment_datetime', endDate.toISOString());
      }

      const { data, error } = await query;

      if (error) throw error;

      let filteredData = data || [];

      // Apply search filter
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        filteredData = filteredData.filter(appointment => 
          appointment.donor_hash_id.toLowerCase().includes(searchLower) ||
          appointment.donation_centers?.name.toLowerCase().includes(searchLower) ||
          appointment.donation_type.toLowerCase().includes(searchLower) ||
          appointment.status.toLowerCase().includes(searchLower)
        );
      }

      setAppointments(filteredData);
    } catch (err) {
      console.error('Error fetching appointments:', err);
      setError('Failed to load appointments');
    } finally {
      setLoading(false);
    }
  };

  const fetchAuditLogs = async () => {
    try {
      setLoading(true);
      setError('');

      const { data, error } = await supabase
        .from('audit_logs')
        .select('*')
        .order('timestamp', { ascending: false })
        .range((auditPage - 1) * auditPageSize, auditPage * auditPageSize - 1);

      if (error) throw error;
      setAuditLogs(data || []);
    } catch (err) {
      console.error('Error fetching audit logs:', err);
      setError('Failed to load audit logs');
    } finally {
      setLoading(false);
    }
  };

  const updateAppointmentStatus = async (appointmentId: string, newStatus: AppointmentStatus) => {
    try {
      const { error } = await supabase
        .from('appointments')
        .update({ 
          status: newStatus,
          last_updated_timestamp: new Date().toISOString()
        })
        .eq('appointment_id', appointmentId);

      if (error) throw error;

      // Update local state
      setAppointments(prev => 
        prev.map(apt => 
          apt.appointment_id === appointmentId 
            ? { ...apt, status: newStatus, last_updated_timestamp: new Date().toISOString() }
            : apt
        )
      );

      // Create audit log entry
      await supabase.from('audit_logs').insert({
        user_id: staff?.staff_id,
        user_type: 'staff',
        action: 'update_appointment_status',
        details: `Changed appointment status to ${newStatus}`,
        resource_type: 'appointment',
        resource_id: appointmentId,
        status: 'success'
      });

    } catch (err) {
      console.error('Error updating appointment status:', err);
      setError('Failed to update appointment status');
    }
  };

  const groupAppointmentsByDay = () => {
    const grouped: { [key: string]: Appointment[] } = {};
    
    appointments.forEach(appointment => {
      const date = new Date(appointment.appointment_datetime).toDateString();
      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(appointment);
    });

    return grouped;
  };

  const toggleDayExpansion = (day: string) => {
    const newExpanded = new Set(expandedDays);
    if (newExpanded.has(day)) {
      newExpanded.delete(day);
    } else {
      newExpanded.add(day);
    }
    setExpandedDays(newExpanded);
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
      time: date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
      }),
      shortDate: date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      })
    };
  };

  const getStatusConfig = (status: string) => {
    return appointmentStatuses.find(s => s.value === status) || appointmentStatuses[0];
  };

  const renderFilters = () => (
    <div className={`bg-white rounded-lg border border-gray-200 transition-all duration-200 ${showFilters ? 'p-6' : 'p-4'}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search appointments..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Filter className="w-4 h-4 mr-2" />
            Filters
            {showFilters ? <ChevronDown className="w-4 h-4 ml-1" /> : <ChevronRight className="w-4 h-4 ml-1" />}
          </button>
        </div>
        <button
          onClick={fetchAppointments}
          className="flex items-center px-4 py-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </button>
      </div>

      {showFilters && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-200">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Donation Center</label>
            <select
              value={selectedCenter}
              onChange={(e) => setSelectedCenter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Centers</option>
              {donationCenters.map(center => (
                <option key={center.center_id} value={center.center_id}>
                  {center.name} - {center.city}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Statuses</option>
              {appointmentStatuses.map(status => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
      )}
    </div>
  );

  const renderAppointmentCard = (appointment: Appointment) => {
    const dateTime = formatDateTime(appointment.appointment_datetime);
    const statusConfig = getStatusConfig(appointment.status);
    const StatusIcon = statusConfig.icon;

    return (
      <div key={appointment.appointment_id} className="bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusConfig.color}`}>
                  <StatusIcon className="w-3 h-3 mr-1" />
                  {statusConfig.label}
                </span>
                <span className="text-sm text-gray-500">
                  {appointment.donation_type}
                </span>
              </div>
              <p className="text-sm text-gray-600 mb-1">
                Donor: {appointment.donor_hash_id.substring(0, 8)}...
              </p>
              <p className="text-sm text-gray-600">
                {appointment.donation_centers?.name}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">{dateTime.time}</p>
              <p className="text-xs text-gray-500">
                {appointment.booking_channel}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 text-xs text-gray-500">
              {appointment.confirmation_sent && (
                <span className="flex items-center">
                  <CheckCircle className="w-3 h-3 mr-1 text-green-500" />
                  Confirmed
                </span>
              )}
              {appointment.reminder_sent && (
                <span className="flex items-center">
                  <Clock className="w-3 h-3 mr-1 text-blue-500" />
                  Reminded
                </span>
              )}
            </div>

            <div className="flex items-center space-x-2">
              <select
                value={appointment.status}
                onChange={(e) => updateAppointmentStatus(appointment.appointment_id, e.target.value as AppointmentStatus)}
                className="text-xs px-2 py-1 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              >
                {appointmentStatuses.map(status => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>
              <button className="p-1 text-gray-400 hover:text-gray-600 rounded">
                <Eye className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderAppointmentsView = () => {
    const groupedAppointments = groupAppointmentsByDay();
    const sortedDays = Object.keys(groupedAppointments).sort((a, b) => new Date(a).getTime() - new Date(b).getTime());

    if (loading) {
      return (
        <div className="flex items-center justify-center py-12">
          <Loader className="w-8 h-8 animate-spin text-blue-600" />
          <span className="ml-3 text-gray-600">Loading appointments...</span>
        </div>
      );
    }

    if (sortedDays.length === 0) {
      return (
        <div className="text-center py-12">
          <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No appointments found</h3>
          <p className="text-gray-600">Try adjusting your filters or search criteria.</p>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {sortedDays.map(day => {
          const dayAppointments = groupedAppointments[day];
          const isExpanded = expandedDays.has(day);
          const dateTime = formatDateTime(dayAppointments[0].appointment_datetime);

          return (
            <div key={day} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <button
                onClick={() => toggleDayExpansion(day)}
                className="w-full px-6 py-4 bg-gray-50 hover:bg-gray-100 transition-colors flex items-center justify-between"
              >
                <div className="flex items-center space-x-4">
                  <div className="text-left">
                    <h3 className="text-lg font-semibold text-gray-900">{dateTime.date}</h3>
                    <p className="text-sm text-gray-600">{dayAppointments.length} appointments</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    {appointmentStatuses.map(status => {
                      const count = dayAppointments.filter(apt => apt.status === status.value).length;
                      if (count === 0) return null;
                      return (
                        <span key={status.value} className={`px-2 py-1 rounded-full text-xs font-medium ${status.color}`}>
                          {count}
                        </span>
                      );
                    })}
                  </div>
                  {isExpanded ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                </div>
              </button>

              {isExpanded && (
                <div className="p-6 border-t border-gray-200">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {dayAppointments.map(appointment => renderAppointmentCard(appointment))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  const renderAuditLogsView = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center py-12">
          <Loader className="w-8 h-8 animate-spin text-blue-600" />
          <span className="ml-3 text-gray-600">Loading audit logs...</span>
        </div>
      );
    }

    return (
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">System Audit Trail</h3>
          <p className="text-sm text-gray-600">Complete log of all system activities</p>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Timestamp
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Action
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Resource
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Details
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {auditLogs.map((log) => (
                <tr key={log.log_id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(log.timestamp).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {log.user_id ? log.user_id.substring(0, 8) + '...' : 'System'}
                    </div>
                    <div className="text-xs text-gray-500">{log.user_type}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {log.action}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{log.resource_type || '-'}</div>
                    {log.resource_id && (
                      <div className="text-xs text-gray-500">{log.resource_id.substring(0, 8)}...</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      log.status === 'success' ? 'bg-green-100 text-green-800' :
                      log.status === 'error' ? 'bg-red-100 text-red-800' :
                      log.status === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {log.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                    {log.details || '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {auditLogs.length === auditPageSize && (
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-center">
            <button
              onClick={() => setAuditPage(prev => prev + 1)}
              className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700"
            >
              Load More
            </button>
          </div>
        )}
      </div>
    );
  };

  const getAppointmentStats = () => {
    const total = appointments.length;
    const today = new Date().toDateString();
    const todayAppointments = appointments.filter(apt => 
      new Date(apt.appointment_datetime).toDateString() === today
    );

    const statusCounts = appointmentStatuses.reduce((acc, status) => {
      acc[status.value] = appointments.filter(apt => apt.status === status.value).length;
      return acc;
    }, {} as Record<string, number>);

    return { total, todayCount: todayAppointments.length, statusCounts };
  };

  const stats = getAppointmentStats();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Appointment Management</h1>
          <p className="text-gray-600">Manage appointments and view system activity</p>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('appointments')}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                viewMode === 'appointments'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Calendar className="w-4 h-4 mr-2 inline" />
              Appointments
            </button>
            <button
              onClick={() => setViewMode('audit')}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                viewMode === 'audit'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <History className="w-4 h-4 mr-2 inline" />
              Audit Trail
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      {viewMode === 'appointments' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center">
              <div className="bg-blue-100 p-2 rounded-lg">
                <Calendar className="w-5 h-5 text-blue-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Total</p>
                <p className="text-lg font-bold text-gray-900">{stats.total}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center">
              <div className="bg-green-100 p-2 rounded-lg">
                <Clock className="w-5 h-5 text-green-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Today</p>
                <p className="text-lg font-bold text-gray-900">{stats.todayCount}</p>
              </div>
            </div>
          </div>

          {appointmentStatuses.slice(0, 3).map(status => (
            <div key={status.value} className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex items-center">
                <div className={`p-2 rounded-lg ${status.color.replace('text-', 'text-').replace('bg-', 'bg-').replace('800', '100')}`}>
                  <status.icon className={`w-5 h-5 ${status.color.replace('bg-', 'text-').replace('100', '600')}`} />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600">{status.label}</p>
                  <p className="text-lg font-bold text-gray-900">{stats.statusCounts[status.value] || 0}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 text-red-600 mr-3" />
            <p className="text-red-800 font-medium">{error}</p>
          </div>
        </div>
      )}

      {/* Filters (only for appointments view) */}
      {viewMode === 'appointments' && renderFilters()}

      {/* Main Content */}
      {viewMode === 'appointments' ? renderAppointmentsView() : renderAuditLogsView()}
    </div>
  );
}