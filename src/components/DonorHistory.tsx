import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Calendar, 
  MapPin, 
  User, 
  Clock, 
  Heart, 
  BarChart3, 
  TrendingUp, 
  Award, 
  CheckCircle, 
  XCircle,
  AlertCircle,
  Info,
  Search,
  RefreshCw
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';

interface DonationHistoryItem {
  history_id: string;
  appointment_id: string;
  donation_date: string;
  donation_type: string;
  donation_volume: number;
  donation_center_name: string;
  donation_center_address: string;
  donation_center_city: string;
  staff_name: string | null;
  status: string;
  notes: string | null;
  completion_timestamp: string;
}

interface AppointmentHistoryItem {
  appointment_id: string;
  appointment_datetime: string;
  donation_type: string;
  status: string;
  donation_center_name: string;
  donation_center_address: string;
  donation_center_city: string;
  staff_name: string | null;
  booking_channel: string;
  confirmation_sent: boolean;
  reminder_sent: boolean;
  creation_timestamp: string;
  last_updated_timestamp: string;
}

interface DonorStatistics {
  total_donations: number;
  total_volume: number;
  first_donation_date: string | null;
  last_donation_date: string | null;
  donations_this_year: number;
  donations_this_month: number;
  preferred_donation_type: string | null;
  total_centers_visited: number;
}

export default function DonorHistory({ onBack, onBookAppointment }: { onBack: () => void; onBookAppointment: () => void }) {
  const { donor } = useAuth();
  const [activeTab, setActiveTab] = useState<'donations' | 'appointments'>('donations');
  const [donationHistory, setDonationHistory] = useState<DonationHistoryItem[]>([]);
  const [appointmentHistory, setAppointmentHistory] = useState<AppointmentHistoryItem[]>([]);
  const [statistics, setStatistics] = useState<DonorStatistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [filterType, setFilterType] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const itemsPerPage = 10;

  useEffect(() => {
    if (donor) {
      fetchStatistics();
      fetchHistory();
    }
  }, [donor, activeTab, currentPage, filterType]);

  const fetchStatistics = async () => {
    try {
      // Use direct query instead of RPC function due to type issues
      const { data: fallbackData, error: fallbackError } = await supabase
        .from('donation_history')
        .select('*')
        .eq('donor_hash_id', donor?.donor_hash_id)
        .eq('status', 'COMPLETED');

      if (fallbackError) {
        console.error('Error fetching donation history for statistics:', fallbackError);
        // Set default statistics for new donors
        setStatistics({
          total_donations: 0,
          total_volume: 0,
          first_donation_date: null,
          last_donation_date: null,
          donations_this_year: 0,
          donations_this_month: 0,
          preferred_donation_type: null,
          total_centers_visited: 0
        });
        return;
      }

      // Calculate statistics from data
      const donations = fallbackData || [];
      const now = new Date();
      const thisYear = new Date(now.getFullYear(), 0, 1);
      const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      
      const totalDonations = donations.length;
      const totalVolume = donations.reduce((sum, d) => sum + (d.donation_volume || 0), 0);
      const firstDonationDate = donations.length > 0 ? Math.min(...donations.map(d => new Date(d.donation_date).getTime())) : null;
      const lastDonationDate = donations.length > 0 ? Math.max(...donations.map(d => new Date(d.donation_date).getTime())) : null;
      const donationsThisYear = donations.filter(d => new Date(d.donation_date) >= thisYear).length;
      const donationsThisMonth = donations.filter(d => new Date(d.donation_date) >= thisMonth).length;
      
      // Calculate preferred donation type
      const typeCounts = donations.reduce((acc, d) => {
        acc[d.donation_type] = (acc[d.donation_type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      const preferredType = Object.keys(typeCounts).length > 0 
        ? Object.entries(typeCounts).sort(([,a], [,b]) => b - a)[0][0] 
        : null;
      
      const totalCentersVisited = new Set(donations.map(d => d.donation_center_id)).size;

      setStatistics({
        total_donations: totalDonations,
        total_volume: totalVolume,
        first_donation_date: firstDonationDate ? new Date(firstDonationDate).toISOString() : null,
        last_donation_date: lastDonationDate ? new Date(lastDonationDate).toISOString() : null,
        donations_this_year: donationsThisYear,
        donations_this_month: donationsThisMonth,
        preferred_donation_type: preferredType,
        total_centers_visited: totalCentersVisited
      });
    } catch (err) {
      console.error('Error fetching statistics:', err);
      // Set default statistics on error
      setStatistics({
        total_donations: 0,
        total_volume: 0,
        first_donation_date: null,
        last_donation_date: null,
        donations_this_year: 0,
        donations_this_month: 0,
        preferred_donation_type: null,
        total_centers_visited: 0
      });
    }
  };

  const fetchHistory = async () => {
    try {
      setLoading(true);
      setError('');

      const offset = (currentPage - 1) * itemsPerPage;

      if (activeTab === 'donations') {
        // Use direct query instead of RPC function due to type issues
        const { data: fallbackData, error: fallbackError } = await supabase
          .from('donation_history')
          .select(`
            history_id,
            appointment_id,
            donation_date,
            donation_type,
            donation_volume,
            status,
            notes,
            completion_timestamp,
            donation_centers!inner(name, address, city),
            staff(first_name, last_name)
          `)
          .eq('donor_hash_id', donor?.donor_hash_id)
          .order('donation_date', { ascending: false })
          .limit(itemsPerPage)
          .range(offset, offset + itemsPerPage - 1);

        if (fallbackError) {
          console.error('Error fetching donation history:', fallbackError);
          setDonationHistory([]);
          setHasMore(false);
          return;
        }

        // Transform data to match expected format
        const transformedData = (fallbackData || []).map(item => ({
          history_id: item.history_id,
          appointment_id: item.appointment_id,
          donation_date: item.donation_date,
          donation_type: item.donation_type,
          donation_volume: item.donation_volume,
          donation_center_name: item.donation_centers?.name || 'Unknown Center',
          donation_center_address: item.donation_centers?.address || '',
          donation_center_city: item.donation_centers?.city || '',
          staff_name: item.staff ? `${item.staff.first_name} ${item.staff.last_name}` : null,
          status: item.status,
          notes: item.notes,
          completion_timestamp: item.completion_timestamp
        }));

        setDonationHistory(transformedData);
        setHasMore(transformedData.length === itemsPerPage);
      } else {
        // Use direct query instead of RPC function due to type issues
        const { data: fallbackData, error: fallbackError } = await supabase
          .from('appointments')
          .select(`
            appointment_id,
            appointment_datetime,
            donation_type,
            status,
            booking_channel,
            confirmation_sent,
            reminder_sent,
            creation_timestamp,
            last_updated_timestamp,
            donation_centers!inner(name, address, city),
            staff(first_name, last_name)
          `)
          .eq('donor_hash_id', donor?.donor_hash_id)
          .order('appointment_datetime', { ascending: false })
          .limit(itemsPerPage)
          .range(offset, offset + itemsPerPage - 1);

        if (fallbackError) {
          console.error('Error fetching appointment history:', fallbackError);
          setAppointmentHistory([]);
          setHasMore(false);
          return;
        }

        // Transform data to match expected format
        const transformedData = (fallbackData || []).map(item => ({
          appointment_id: item.appointment_id,
          appointment_datetime: item.appointment_datetime,
          donation_type: item.donation_type,
          status: item.status,
          donation_center_name: item.donation_centers?.name || 'Unknown Center',
          donation_center_address: item.donation_centers?.address || '',
          donation_center_city: item.donation_centers?.city || '',
          staff_name: item.staff ? `${item.staff.first_name} ${item.staff.last_name}` : null,
          booking_channel: item.booking_channel,
          confirmation_sent: item.confirmation_sent,
          reminder_sent: item.reminder_sent,
          creation_timestamp: item.creation_timestamp,
          last_updated_timestamp: item.last_updated_timestamp
        }));

        setAppointmentHistory(transformedData);
        setHasMore(transformedData.length === itemsPerPage);
      }
    } catch (err) {
      console.error('Error fetching history:', err);
      // Handle network errors or other issues gracefully
      if (err instanceof Error && err.message.includes('fetch')) {
        setError('Network error. Please check your connection and try again.');
      } else {
        setError('Failed to load history');
      }
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDonationType = (type: string) => {
    return type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED': return 'bg-green-100 text-green-800';
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'deferred': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED': return <CheckCircle className="w-4 h-4" />;
      case 'scheduled': return <Clock className="w-4 h-4" />;
      case 'cancelled': return <XCircle className="w-4 h-4" />;
      case 'failed': return <XCircle className="w-4 h-4" />;
      case 'deferred': return <AlertCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const filteredDonationHistory = donationHistory.filter(item => {
    if (filterType !== 'all' && item.donation_type !== filterType) return false;
    if (searchTerm && !item.donation_center_name.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  const filteredAppointmentHistory = appointmentHistory.filter(item => {
    if (filterType !== 'all' && item.donation_type !== filterType) return false;
    if (searchTerm && !item.donation_center_name.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14">
            <div className="flex items-center">
              <button
                onClick={onBack}
                className="flex items-center px-3 py-2 text-sm font-medium text-red-600 border border-red-200 bg-white hover:bg-red-50 rounded-lg transition-colors duration-200 mr-3"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </button>
              <Heart className="w-7 h-7 text-red-600 mr-3" />
              <div>
                <h1 className="text-lg font-bold text-gray-900">Donation History</h1>
                <p className="text-xs text-gray-500">Your complete donation journey</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Statistics Overview */}
        {statistics && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Your Donation Statistics</h2>
              {statistics.total_donations === 0 && (
                <div className="flex items-center px-3 py-2 bg-blue-50 border border-blue-200 rounded-lg">
                  <Heart className="h-4 w-4 text-blue-400 mr-2" />
                  <span className="text-sm text-blue-700">New donor - stats will populate after first donation</span>
                </div>
              )}
            </div>
            
            <div className="grid grid-cols-4 gap-3">
              <div className="bg-gray-50 rounded-lg p-3 text-center">
                <div className="bg-red-100 p-2 rounded-full w-10 h-10 mx-auto mb-2 flex items-center justify-center">
                  <Heart className="w-5 h-5 text-red-600" />
                </div>
                <p className="text-xl font-bold text-gray-900">{statistics.total_donations}</p>
                <p className="text-xs text-gray-600">Total Donations</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3 text-center">
                <div className="bg-blue-100 p-2 rounded-full w-10 h-10 mx-auto mb-2 flex items-center justify-center">
                  <BarChart3 className="w-5 h-5 text-blue-600" />
                </div>
                <p className="text-xl font-bold text-gray-900">{statistics.total_volume}ml</p>
                <p className="text-xs text-gray-600">Total Volume</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3 text-center">
                <div className="bg-green-100 p-2 rounded-full w-10 h-10 mx-auto mb-2 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                </div>
                <p className="text-xl font-bold text-gray-900">{statistics.donations_this_year}</p>
                <p className="text-xs text-gray-600">This Year</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3 text-center">
                <div className="bg-purple-100 p-2 rounded-full w-10 h-10 mx-auto mb-2 flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-purple-600" />
                </div>
                <p className="text-xl font-bold text-gray-900">{statistics.total_centers_visited}</p>
                <p className="text-xs text-gray-600">Centers Visited</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3 text-center">
                <div className="bg-yellow-100 p-2 rounded-full w-10 h-10 mx-auto mb-2 flex items-center justify-center">
                  <Award className="w-5 h-5 text-yellow-600" />
                </div>
                <p className="text-sm font-bold text-gray-900">
                  {statistics.preferred_donation_type ? formatDonationType(statistics.preferred_donation_type) : 'N/A'}
                </p>
                <p className="text-xs text-gray-600">Preferred Type</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3 text-center">
                <div className="bg-indigo-100 p-2 rounded-full w-10 h-10 mx-auto mb-2 flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-indigo-600" />
                </div>
                <p className="text-xl font-bold text-gray-900">{statistics.donations_this_month}</p>
                <p className="text-xs text-gray-600">This Month</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3 text-center">
                <div className="bg-pink-100 p-2 rounded-full w-10 h-10 mx-auto mb-2 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-pink-600" />
                </div>
                <p className="text-sm font-bold text-gray-900">
                  {statistics.first_donation_date ? formatDate(statistics.first_donation_date) : 'N/A'}
                </p>
                <p className="text-xs text-gray-600">First Donation</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3 text-center">
                <div className="bg-orange-100 p-2 rounded-full w-10 h-10 mx-auto mb-2 flex items-center justify-center">
                  <User className="w-5 h-5 text-orange-600" />
                </div>
                <p className="text-sm font-bold text-gray-900">
                  {statistics.last_donation_date ? formatDate(statistics.last_donation_date) : 'N/A'}
                </p>
                <p className="text-xs text-gray-600">Last Donation</p>
              </div>
            </div>
          </div>
        )}

        {/* Tabs and Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            {/* Tabs */}
            <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
              <button
                onClick={() => {
                  setActiveTab('donations');
                  setCurrentPage(1);
                }}
                className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  activeTab === 'donations'
                    ? 'bg-white text-red-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Heart className="w-4 h-4 inline mr-2" />
                Completed Donations
              </button>
              <button
                onClick={() => {
                  setActiveTab('appointments');
                  setCurrentPage(1);
                }}
                className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  activeTab === 'appointments'
                    ? 'bg-white text-red-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Calendar className="w-4 h-4 inline mr-2" />
                All Appointments
              </button>
            </div>

            {/* Filters and Search */}
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search centers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              >
                <option value="all">All Types</option>
                <option value="whole_blood">Whole Blood</option>
                <option value="plasma">Plasma</option>
                <option value="platelets">Platelets</option>
                <option value="double_red">Double Red</option>
                <option value="power_red">Power Red</option>
              </select>
              <button
                onClick={() => {
                  setCurrentPage(1);
                  fetchHistory();
                }}
                className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </button>

            </div>
          </div>
        </div>

        {/* History Content */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <RefreshCw className="w-6 h-6 animate-spin text-red-600 mr-2" />
              <span className="text-gray-600">Loading history...</span>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center py-12">
              <AlertCircle className="w-6 h-6 text-red-600 mr-2" />
              <span className="text-red-600">{error}</span>
            </div>
          ) : activeTab === 'donations' ? (
            <>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Completed Donations</h3>
              {filteredDonationHistory.length === 0 ? (
                <div className="text-center py-12">
                  <Heart className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600">No completed donations found</p>
                  <p className="text-sm text-gray-500">
                    {donationHistory.length === 0 
                      ? "You haven't completed any donations yet. This is normal for new donors. Your donation history will appear here once you complete your first donation."
                      : "No donations match your current filters. Try adjusting your search criteria."
                    }
                  </p>
                  <div className="mt-6">
                    <div className="text-xs text-gray-500">
                      💡 Tip: After completing a donation, your history will automatically appear here
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredDonationHistory.map((item) => (
                    <div key={item.history_id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-4">
                          <div className="bg-red-100 p-3 rounded-lg">
                            <Heart className="w-6 h-6 text-red-600" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <h4 className="font-semibold text-gray-900">
                                {formatDonationType(item.donation_type)} Donation
                              </h4>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(item.status)} flex items-center`}>
                                {getStatusIcon(item.status)}
                                <span className="ml-1">{item.status}</span>
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 mb-1">
                              {formatDateTime(item.donation_date)} • {item.donation_volume}ml
                            </p>
                            <div className="flex items-center text-sm text-gray-500 mb-2">
                              <MapPin className="w-4 h-4 mr-1" />
                              <span>{item.donation_center_name}, {item.donation_center_city}</span>
                            </div>
                            {item.staff_name && (
                              <p className="text-sm text-gray-500">
                                <User className="w-4 h-4 inline mr-1" />
                                Staff: {item.staff_name}
                              </p>
                            )}
                            {item.notes && (
                              <p className="text-sm text-gray-600 mt-2 italic">"{item.notes}"</p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            <>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">All Appointments</h3>
              {filteredAppointmentHistory.length === 0 ? (
                <div className="text-center py-12">
                  <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600">No appointments found</p>
                  <p className="text-sm text-gray-500">
                    {appointmentHistory.length === 0 
                      ? "You haven't booked any appointments yet. Schedule your first donation appointment to get started!"
                      : "No appointments match your current filters. Try adjusting your search criteria."
                    }
                  </p>
                  {appointmentHistory.length === 0 && (
                    <div className="mt-6 space-y-3">
                      <button
                        onClick={onBookAppointment}
                        className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                      >
                        Book Your First Appointment
                      </button>
                      <div className="text-xs text-gray-500">
                        💡 Tip: Your appointment history will appear here once you book appointments
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredAppointmentHistory.map((item) => (
                    <div key={item.appointment_id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-4">
                          <div className="bg-blue-100 p-3 rounded-lg">
                            <Calendar className="w-6 h-6 text-blue-600" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <h4 className="font-semibold text-gray-900">
                                {formatDonationType(item.donation_type)} Appointment
                              </h4>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(item.status)} flex items-center`}>
                                {getStatusIcon(item.status)}
                                <span className="ml-1">{item.status}</span>
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 mb-1">
                              {formatDateTime(item.appointment_datetime)} • Booked via {item.booking_channel}
                            </p>
                            <div className="flex items-center text-sm text-gray-500 mb-2">
                              <MapPin className="w-4 h-4 mr-1" />
                              <span>{item.donation_center_name}, {item.donation_center_city}</span>
                            </div>
                            <div className="flex items-center space-x-4 text-xs text-gray-500">
                              {item.staff_name && (
                                <span>
                                  <User className="w-3 h-3 inline mr-1" />
                                  {item.staff_name}
                                </span>
                              )}
                              <span>
                                Created: {formatDate(item.creation_timestamp)}
                              </span>
                              {item.confirmation_sent && (
                                <span className="text-green-600">✓ Confirmed</span>
                              )}
                              {item.reminder_sent && (
                                <span className="text-blue-600">✓ Reminded</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {/* Pagination */}
          {hasMore && (
            <div className="mt-6 flex justify-center">
              <button
                onClick={() => setCurrentPage(currentPage + 1)}
                className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Load More
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
} 