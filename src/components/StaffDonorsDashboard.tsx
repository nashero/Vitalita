import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  Eye, 
  Calendar, 
  MapPin, 
  User, 
  Droplets, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Clock, 
  Loader,
  Download,
  ChevronDown,
  ChevronRight,
  Building2,
  Users,
  FileText,
  Edit3,
  Save,
  X
} from 'lucide-react';
import { supabase } from '../lib/supabase';

interface DonationRecord {
  history_id: string;
  donor_id: string;
  donor_hash_id: string;
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
  created_at: string;
}

interface AppointmentRecord {
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
  };
  staff?: {
    staff_id: string;
    first_name: string;
    last_name: string;
  };
}

interface DonorInfo {
  donor_id: string;
  donor_hash_id: string;
  avis_donor_center: string;
  total_donations_this_year: number;
  last_donation_date: string | null;
  is_active: boolean;
  initial_vetting_status: boolean;
  preferred_language: string;
  preferred_communication_channel: string;
}



export default function StaffDonorsDashboard() {
  const [donorId, setDonorId] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [donations, setDonations] = useState<DonationRecord[]>([]);
  const [appointments, setAppointments] = useState<AppointmentRecord[]>([]);
  const [donorInfo, setDonorInfo] = useState<DonorInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [expandedDonations, setExpandedDonations] = useState<Set<string>>(new Set());
  const [expandedAppointments, setExpandedAppointments] = useState<Set<string>>(new Set());
  const [showFilters, setShowFilters] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<string | null>(null);
  const [appointmentStatus, setAppointmentStatus] = useState<string>('');
  const [donationStatuses, setDonationStatuses] = useState<string[]>([]);
  const [loadingStatuses, setLoadingStatuses] = useState(true);

  // Fetch donation statuses on component mount
  useEffect(() => {
    fetchDonationStatuses();
  }, []);

  const fetchDonationStatuses = async () => {
    try {
      console.log('Fetching donation statuses...');
      setLoadingStatuses(true);
      
      // Try to use the get_appointment_statuses function first
      console.log('1. Trying get_appointment_statuses function...');
      const { data: functionData, error: functionError } = await supabase
        .rpc('get_appointment_statuses');
      
      if (!functionError && functionData && functionData.length > 0) {
        console.log('✅ Successfully fetched statuses using function:', functionData);
        const statusCodes = functionData.map((item: any) => item.status_code);
        setDonationStatuses(statusCodes);
        return;
      }
      
      if (functionError) {
        console.log('❌ Function call failed:', functionError.message);
      }
      
      // Fallback: Try direct table query
      console.log('2. Trying direct table query...');
      const { data: tableData, error: tableError } = await supabase
        .from('donation_statuses')
        .select('status_code')
        .not('status_code', 'in', ['POST_DONATION_FOLLOWUP', 'TEST_RESULTS_READY', 'UNIT_USED', 'UNIT_DISCARDED'])
        .eq('is_active', true);

      if (!tableError && tableData && tableData.length > 0) {
        console.log('✅ Successfully fetched statuses from table:', tableData);
        const statusCodes = tableData.map((item: any) => item.status_code);
        setDonationStatuses(statusCodes);
        return;
      }
      
      if (tableError) {
        console.log('❌ Table query failed:', tableError.message);
      }
      
      // Fallback: Try alternative table names
      console.log('3. Trying alternative table names...');
      const alternativeTables = ['donation_status', 'statuses', 'status_lookup', 'appointment_statuses'];
      
      for (const tableName of alternativeTables) {
        console.log(`   Trying ${tableName}...`);
        try {
          const { data: altData, error: altError } = await supabase
            .from(tableName)
            .select('*')
            .limit(10);
          
          if (!altError && altData && altData.length > 0) {
            console.log(`✅ Found data in ${tableName}:`, altData);
            // Transform the data to match our interface if needed
            const transformedData = altData.map((item: any) => ({
              status_code: item.status_code || item.code || item.id,
              status_name: item.status_name || item.name || item.description,
              description: item.description || item.desc || ''
            }));
            const statusCodes = transformedData.map(item => item.status_code);
            setDonationStatuses(statusCodes);
            return;
          }
          
          if (altError) {
            console.log(`   ❌ ${tableName} error:`, altError.message);
          }
        } catch (err) {
          console.log(`   ❌ ${tableName} exception:`, err);
        }
      }
      
      // Final fallback: Set default statuses
      console.log('4. Setting default statuses as fallback');
      const defaultStatuses = [
        'SCHEDULED', 'CONFIRMED', 'CANCELLED', 'COMPLETED', 'NO_SHOW', 
        'RESCHEDULED', 'IN_PROGRESS', 'REMINDER_SENT', 'LATE_ARRIVAL', 'WAITLIST'
      ];
      setDonationStatuses(defaultStatuses);
      
    } catch (err) {
      console.error('❌ Error in fetchDonationStatuses:', err);
      // Set default statuses on error
      const defaultStatuses = [
        'SCHEDULED', 'CONFIRMED', 'CANCELLED', 'COMPLETED', 'NO_SHOW', 
        'RESCHEDULED', 'IN_PROGRESS', 'REMINDER_SENT', 'LATE_ARRIVAL', 'WAITLIST'
      ];
      setDonationStatuses(defaultStatuses);
    } finally {
      setLoadingStatuses(false);
    }
  };

  const searchDonations = async () => {
    if (!donorId.trim()) {
      setError('Please enter a Donor ID');
      return;
    }

    setLoading(true);
    setError('');
    setDonations([]);
    setAppointments([]);
    setDonorInfo(null);

    try {
      // First, get donor information
      const { data: donorData, error: donorError } = await supabase
        .from('donors')
        .select('*')
        .eq('donor_id', donorId.trim())
        .single();

      if (donorError) {
        if (donorError.code === 'PGRST116') {
          setError('Donor not found. Please check the Donor ID and try again.');
        } else {
          setError(`Error fetching donor: ${donorError.message}`);
        }
        return;
      }

      setDonorInfo(donorData);

      if (selectedStatus === 'appointments') {
        // Fetch appointments for this donor
        await fetchAppointments(donorData.donor_hash_id);
      } else {
        // Build query for donations
        let query = supabase
          .from('donation_history')
          .select(`
            *,
            donation_centers!inner(
              center_id,
              name,
              address,
              city
            ),
            staff(
              staff_id,
              first_name,
              last_name
            )
          `)
          .eq('donor_hash_id', donorData.donor_hash_id);

        // Add filter based on selected option
        if (selectedStatus === 'history') {
          // Filter for history (completed donations)
          query = query.eq('status', 'COMPLETED');
        }

        // Order by donation date (most recent first)
        query = query.order('donation_date', { ascending: false });

        const { data: donationsData, error: donationsError } = await query;

        if (donationsError) {
          setError(`Error fetching donations: ${donationsError.message}`);
          return;
        }

        // Transform the data to match our interface
        const transformedDonations: DonationRecord[] = (donationsData || []).map(donation => ({
          history_id: donation.history_id,
          donor_id: donation.donor_id || donorData.donor_id,
          donor_hash_id: donation.donor_hash_id,
          appointment_id: donation.appointment_id,
          donation_date: donation.donation_date,
          donation_type: donation.donation_type,
          donation_volume: donation.donation_volume,
          donation_center_name: donation.donation_centers?.name || 'Unknown Center',
          donation_center_address: donation.donation_centers?.address || 'Unknown Address',
          donation_center_city: donation.donation_centers?.city || 'Unknown City',
          staff_name: donation.staff ? 
            `${donation.staff.first_name || ''} ${donation.staff.last_name || ''}`.trim() : 
            null,
          status: donation.status,
          notes: donation.notes,
          completion_timestamp: donation.completion_timestamp,
          created_at: donation.created_at
        }));

        setDonations(transformedDonations);

        if (transformedDonations.length === 0) {
          setError('No donations found for this donor with the selected criteria.');
        }
      }

    } catch (err) {
      console.error('Error searching donations:', err);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchAppointments = async (donorHashId: string) => {
    try {
      const { data: appointmentsData, error: appointmentsError } = await supabase
        .from('appointments')
        .select(`
          *,
          donation_centers!inner(
            center_id,
            name,
            address,
            city,
            country
          ),
          staff(
            staff_id,
            first_name,
            last_name
          )
        `)
        .eq('donor_hash_id', donorHashId)
        .order('appointment_datetime', { ascending: false });

      if (appointmentsError) {
        setError(`Error fetching appointments: ${appointmentsError.message}`);
        return;
      }

      // Transform the data to match our interface
      const transformedAppointments: AppointmentRecord[] = (appointmentsData || []).map(appointment => ({
        appointment_id: appointment.appointment_id,
        donor_hash_id: appointment.donor_hash_id,
        staff_id: appointment.staff_id,
        donation_center_id: appointment.donation_center_id,
        appointment_datetime: appointment.appointment_datetime,
        donation_type: appointment.donation_type,
        status: appointment.status,
        booking_channel: appointment.booking_channel,
        confirmation_sent: appointment.confirmation_sent,
        reminder_sent: appointment.reminder_sent,
        creation_timestamp: appointment.creation_timestamp,
        last_updated_timestamp: appointment.last_updated_timestamp,
        donation_centers: appointment.donation_centers,
        staff: appointment.staff
      }));

      setAppointments(transformedAppointments);

      if (transformedAppointments.length === 0) {
        setError('No appointments found for this donor.');
      }
    } catch (err) {
      console.error('Error fetching appointments:', err);
      setError('Failed to fetch appointments. Please try again.');
    }
  };

  const clearSearch = () => {
    setDonorId('');
    setSelectedStatus('');
    setDonations([]);
    setAppointments([]);
    setDonorInfo(null);
    setError('');
    setExpandedDonations(new Set());
    setExpandedAppointments(new Set());
    setEditingAppointment(null);
  };

  const toggleDonationExpansion = (historyId: string) => {
    const newExpanded = new Set(expandedDonations);
    if (newExpanded.has(historyId)) {
      newExpanded.delete(historyId);
    } else {
      newExpanded.add(historyId);
    }
    setExpandedDonations(newExpanded);
  };

  const toggleAppointmentExpansion = (appointmentId: string) => {
    const newExpanded = new Set(expandedAppointments);
    if (newExpanded.has(appointmentId)) {
      newExpanded.delete(appointmentId);
    } else {
      newExpanded.add(appointmentId);
    }
    setExpandedAppointments(newExpanded);
  };

  const startEditingAppointment = (appointmentId: string, currentStatus: string) => {
    setEditingAppointment(appointmentId);
    setAppointmentStatus(currentStatus);
  };

  const cancelEditingAppointment = () => {
    setEditingAppointment(null);
    setAppointmentStatus('');
  };

  const saveAppointmentStatus = async (appointmentId: string) => {
    try {
      const { error: updateError } = await supabase
        .from('appointments')
        .update({ 
          status: appointmentStatus,
          last_updated_timestamp: new Date().toISOString()
        })
        .eq('appointment_id', appointmentId);

      if (updateError) {
        setError(`Error updating appointment status: ${updateError.message}`);
        return;
      }

      // Update local state
      setAppointments(prev => prev.map(apt => 
        apt.appointment_id === appointmentId 
          ? { ...apt, status: appointmentStatus, last_updated_timestamp: new Date().toISOString() }
          : apt
      ));

      setEditingAppointment(null);
      setAppointmentStatus('');
    } catch (err) {
      console.error('Error updating appointment status:', err);
      setError('Failed to update appointment status. Please try again.');
    }
  };

  const getStatusColor = (status: string) => {
    const statusColors: { [key: string]: string } = {
      'COMPLETED': 'bg-green-100 text-green-800',
      'DEFERRED': 'bg-yellow-100 text-yellow-800',
      'SELF_DEFERRED': 'bg-orange-100 text-orange-800',
      'INCOMPLETE': 'bg-red-100 text-red-800',
      'ELIGIBILITY_EXPIRED': 'bg-gray-100 text-gray-800',
      'POST_DONATION_FOLLOWUP': 'bg-blue-100 text-blue-800',
      'TEST_RESULTS_READY': 'bg-purple-100 text-purple-800',
      'UNIT_USED': 'bg-green-100 text-green-800',
      'UNIT_DISCARDED': 'bg-red-100 text-red-800',
      'SCHEDULED': 'bg-blue-100 text-blue-800',
      'CONFIRMED': 'bg-green-100 text-green-800',
      'CANCELLED': 'bg-red-100 text-red-800',
      'NO_SHOW': 'bg-orange-100 text-orange-800',
      'RESCHEDULED': 'bg-yellow-100 text-yellow-800',
      'IN_PROGRESS': 'bg-blue-100 text-blue-800',
      'REMINDER_SENT': 'bg-blue-100 text-blue-800',
      'LATE_ARRIVAL': 'bg-orange-100 text-orange-800',
      'WAITLIST': 'bg-gray-100 text-gray-800'
    };
    
    return statusColors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusIcon = (status: string) => {
    const statusIcons: { [key: string]: React.ReactNode } = {
      'COMPLETED': <CheckCircle className="w-4 h-4" />,
      'DEFERRED': <AlertCircle className="w-4 h-4" />,
      'SELF_DEFERRED': <AlertCircle className="w-4 h-4" />,
      'INCOMPLETE': <XCircle className="w-4 h-4" />,
      'ELIGIBILITY_EXPIRED': <Clock className="w-4 h-4" />,
      'POST_DONATION_FOLLOWUP': <FileText className="w-4 h-4" />,
      'TEST_RESULTS_READY': <FileText className="w-4 h-4" />,
      'UNIT_USED': <CheckCircle className="w-4 h-4" />,
      'UNIT_DISCARDED': <XCircle className="w-4 h-4" />,
      'SCHEDULED': <Clock className="w-4 h-4" />,
      'CONFIRMED': <CheckCircle className="w-4 h-4" />,
      'CANCELLED': <XCircle className="w-4 h-4" />,
      'NO_SHOW': <AlertCircle className="w-4 h-4" />,
      'RESCHEDULED': <AlertCircle className="w-4 h-4" />,
      'IN_PROGRESS': <Loader className="w-4 h-4" />,
      'REMINDER_SENT': <Clock className="w-4 h-4" />,
      'LATE_ARRIVAL': <AlertCircle className="w-4 h-4" />,
      'WAITLIST': <Clock className="w-4 h-4" />
    };
    
    return statusIcons[status] || <Clock className="w-4 h-4" />;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusDisplayName = (statusCode: string) => {
    if (!statusCode) return 'Unknown';
    
    // Format the status code for display
    return statusCode.replace(/_/g, ' ');
  };

  const exportToCSV = () => {
    if (selectedStatus === 'appointments' && appointments.length === 0) return;
    if (selectedStatus !== 'appointments' && donations.length === 0) return;

    let headers: string[];
    let csvData: any[][];

    if (selectedStatus === 'appointments') {
      headers = [
        'Appointment ID',
        'Donor ID',
        'Appointment Date',
        'Donation Type',
        'Status',
        'Center',
        'City',
        'Staff',
        'Booking Channel'
      ];

      csvData = appointments.map(appointment => [
        appointment.appointment_id,
        donorId,
        formatDate(appointment.appointment_datetime),
        appointment.donation_type,
        appointment.status,
        appointment.donation_centers?.name || 'Unknown Center',
        appointment.donation_centers?.city || 'Unknown City',
        appointment.staff ? 
          `${appointment.staff.first_name || ''} ${appointment.staff.last_name || ''}`.trim() : 
          'No staff assigned',
        appointment.booking_channel
      ]);
    } else {
      headers = [
        'Donor ID',
        'Donation Date',
        'Donation Type',
        'Volume (ml)',
        'Status',
        'Center',
        'City',
        'Staff',
        'Notes'
      ];

      csvData = donations.map(donation => [
        donation.donor_id,
        formatDate(donation.donation_date),
        donation.donation_type,
        donation.donation_volume,
        donation.status,
        donation.donation_center_name,
        donation.donation_center_city,
        donation.staff_name || 'N/A',
        donation.notes || 'N/A'
      ]);
    }

    const csvContent = [headers, ...csvData]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `donor_${donorId}_${selectedStatus === 'appointments' ? 'appointments' : 'donations'}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Donor Search</h2>
            <p className="text-gray-600">Search and view appointments/donation history for specific donors</p>
          </div>
           <div className="flex items-center gap-3">
             <button
               onClick={() => setShowFilters(!showFilters)}
               className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
             >
               <Filter className="w-4 h-4 mr-2" />
               {showFilters ? 'Hide' : 'Show'} Filters
             </button>


             
              <button
                onClick={exportToCSV}
                disabled={(selectedStatus === 'appointments' ? appointments.length === 0 : donations.length === 0)}
                className="flex items-center px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Download className="w-4 h-4 mr-2" />
                Export CSV
              </button>
           </div>
        </div>

        {/* Search Form */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label htmlFor="donorId" className="block text-sm font-medium text-gray-700 mb-2">
                Donor ID *
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  id="donorId"
                  value={donorId}
                  onChange={(e) => setDonorId(e.target.value)}
                  placeholder="Enter Donor ID (e.g., AVIS001)"
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  onKeyPress={(e) => e.key === 'Enter' && searchDonations()}
                />
              </div>
            </div>
            <div className="sm:w-48">
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
                Status Filter
              </label>
              <select
                id="status"
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              >
                <option value="">All</option>
                <option value="appointments">Appointments</option>
                <option value="history">History</option>
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={searchDonations}
                disabled={loading || !donorId.trim()}
                className="px-6 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? <Loader className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                <span className="ml-2">Search</span>
              </button>
            </div>
          </div>

          {donorId && (
            <div className="flex items-center gap-2">
              <button
                onClick={clearSearch}
                className="text-sm text-gray-500 hover:text-gray-700 underline"
              >
                Clear Search
              </button>
            </div>
          )}
        </div>
      </div>

             {/* Error Display */}
       {error && (
         <div className="bg-red-50 border border-red-200 rounded-lg p-4">
           <div className="flex items-center">
             <AlertCircle className="w-5 h-5 text-red-400 mr-2" />
             <p className="text-red-800">{error}</p>
           </div>
         </div>
       )}

       



      {/* Donor Information */}
      {donorInfo && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Donor Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-gray-500">Donor ID</p>
              <p className="text-lg font-medium text-gray-900">{donorInfo.donor_id}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Center</p>
              <p className="text-lg font-medium text-gray-900">{donorInfo.avis_donor_center}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Status</p>
              <div className="flex items-center">
                {donorInfo.is_active ? (
                  <CheckCircle className="w-4 h-4 text-green-500 mr-1" />
                ) : (
                  <XCircle className="w-4 h-4 text-red-500 mr-1" />
                )}
                <span className={`text-lg font-medium ${donorInfo.is_active ? 'text-green-600' : 'text-red-600'}`}>
                  {donorInfo.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-500">Vetting Status</p>
              <div className="flex items-center">
                {donorInfo.initial_vetting_status ? (
                  <CheckCircle className="w-4 h-4 text-green-500 mr-1" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-yellow-500 mr-1" />
                )}
                <span className={`text-lg font-medium ${donorInfo.initial_vetting_status ? 'text-green-600' : 'text-yellow-600'}`}>
                  {donorInfo.initial_vetting_status ? 'Vetted' : 'Pending'}
                </span>
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-500">Donations This Year</p>
              <p className="text-lg font-medium text-gray-900">{donorInfo.total_donations_this_year}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Last Donation</p>
              <p className="text-lg font-medium text-gray-900">
                {donorInfo.last_donation_date ? formatDate(donorInfo.last_donation_date) : 'Never'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Language</p>
              <p className="text-lg font-medium text-gray-900">{donorInfo.preferred_language}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Communication</p>
              <p className="text-lg font-medium text-gray-900">{donorInfo.preferred_communication_channel}</p>
            </div>
          </div>
        </div>
      )}

      {/* Appointments List */}
      {selectedStatus === 'appointments' && appointments.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                Appointments ({appointments.length} records)
              </h3>
              <p className="text-sm text-gray-500">
                Showing {appointments.length} appointment{appointments.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
          
          <div className="divide-y divide-gray-200">
            {appointments.map((appointment) => (
              <div key={appointment.appointment_id} className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <Calendar className="w-5 h-5 text-blue-600" />
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h4 className="text-lg font-medium text-gray-900">
                          {appointment.donation_type.replace('_', ' ').toUpperCase()}
                        </h4>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
                          {getStatusIcon(appointment.status)}
                          <span className="ml-1">{getStatusDisplayName(appointment.status)}</span>
                        </span>
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-gray-500 mt-1">
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-1" />
                          {formatDate(appointment.appointment_datetime)}
                        </div>
                        <div className="flex items-center">
                          <MapPin className="w-4 h-4 mr-1" />
                          {appointment.donation_centers?.name}, {appointment.donation_centers?.city}
                        </div>
                        <div className="flex items-center">
                          <User className="w-4 h-4 mr-1" />
                          {appointment.staff ? 
                            `${appointment.staff.first_name || ''} ${appointment.staff.last_name || ''}`.trim() : 
                            'No staff assigned'}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => toggleAppointmentExpansion(appointment.appointment_id)}
                      className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                    >
                      {expandedAppointments.has(appointment.appointment_id) ? (
                        <ChevronDown className="w-5 h-5" />
                      ) : (
                        <ChevronRight className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Expanded Details */}
                {expandedAppointments.has(appointment.appointment_id) && (
                  <div className="mt-4 pl-14 space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500">Appointment ID</p>
                        <p className="text-sm font-medium text-gray-900 font-mono">{appointment.appointment_id}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Booking Channel</p>
                        <p className="text-sm font-medium text-gray-900">{appointment.booking_channel}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Center Address</p>
                        <p className="text-sm font-medium text-gray-900">{appointment.donation_centers?.address}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Created</p>
                        <p className="text-sm font-medium text-gray-900">{formatDate(appointment.creation_timestamp)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Last Updated</p>
                        <p className="text-sm font-medium text-gray-900">{formatDate(appointment.last_updated_timestamp)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Confirmation Sent</p>
                        <p className="text-sm font-medium text-gray-900">
                          {appointment.confirmation_sent ? 'Yes' : 'No'}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Reminder Sent</p>
                        <p className="text-sm font-medium text-gray-900">
                          {appointment.reminder_sent ? 'Yes' : 'No'}
                        </p>
                      </div>
                      <div className="md:col-span-2">
                        <p className="text-sm text-gray-500">Status</p>
                        {editingAppointment === appointment.appointment_id ? (
                          <div className="flex items-center space-x-2 mt-1">
                                                         <select
                               value={appointmentStatus}
                               onChange={(e) => setAppointmentStatus(e.target.value)}
                               className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent"
                             >
                               <option value="">Select a status</option>
                               {loadingStatuses ? (
                                 <option value="" disabled>Loading statuses...</option>
                               ) : donationStatuses.length === 0 ? (
                                 <option value="" disabled>No statuses available</option>
                               ) : (
                                 donationStatuses.map((status) => (
                                   <option key={status} value={status}>
                                     {status.replace(/_/g, ' ')}
                                   </option>
                                 ))
                               )}
                             </select>
                            <button
                              onClick={() => saveAppointmentStatus(appointment.appointment_id)}
                              className="p-1 text-green-600 hover:text-green-800"
                            >
                              <Save className="w-4 h-4" />
                            </button>
                            <button
                              onClick={cancelEditingAppointment}
                              className="p-1 text-gray-600 hover:text-gray-800"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center space-x-2 mt-1">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
                              {getStatusIcon(appointment.status)}
                              <span className="ml-1">{getStatusDisplayName(appointment.status)}</span>
                            </span>
                            <button
                              onClick={() => startEditingAppointment(appointment.appointment_id, appointment.status)}
                              className="p-1 text-blue-600 hover:text-blue-800"
                              title="Edit Status"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Donations List */}
      {selectedStatus !== 'appointments' && donations.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                Donation History ({donations.length} records)
              </h3>
              <p className="text-sm text-gray-500">
                Showing {donations.length} donation{donations.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
          
          <div className="divide-y divide-gray-200">
            {donations.map((donation) => (
              <div key={donation.history_id} className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                        <Droplets className="w-5 h-5 text-red-600" />
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h4 className="text-lg font-medium text-gray-900">
                          {donation.donation_type.replace('_', ' ').toUpperCase()}
                        </h4>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(donation.status)}`}>
                          {getStatusIcon(donation.status)}
                          <span className="ml-1">{getStatusDisplayName(donation.status)}</span>
                        </span>
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-gray-500 mt-1">
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-1" />
                          {formatDate(donation.donation_date)}
                        </div>
                        <div className="flex items-center">
                          <MapPin className="w-4 h-4 mr-1" />
                          {donation.donation_center_name}, {donation.donation_center_city}
                        </div>
                        <div className="flex items-center">
                          <User className="w-4 h-4 mr-1" />
                          {donation.staff_name || 'No staff assigned'}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => toggleDonationExpansion(donation.history_id)}
                      className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                    >
                      {expandedDonations.has(donation.history_id) ? (
                        <ChevronDown className="w-5 h-5" />) : (
                        <ChevronRight className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Expanded Details */}
                {expandedDonations.has(donation.history_id) && (
                  <div className="mt-4 pl-14 space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500">Volume</p>
                        <p className="text-sm font-medium text-gray-900">{donation.donation_volume} ml</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Appointment ID</p>
                        <p className="text-sm font-medium text-gray-900 font-mono">{donation.appointment_id}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Center Address</p>
                        <p className="text-sm font-medium text-gray-900">{donation.donation_center_address}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Completion Time</p>
                        <p className="text-sm font-medium text-gray-900">{formatDate(donation.completion_timestamp)}</p>
                      </div>
                    </div>
                    {donation.notes && (
                      <div>
                        <p className="text-sm text-gray-500">Notes</p>
                        <p className="text-sm font-medium text-gray-900">{donation.notes}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* No Results */}
      {((selectedStatus === 'appointments' && appointments.length === 0) || 
        (selectedStatus !== 'appointments' && donations.length === 0)) && 
        !loading && donorId && !error && (
        <div className="bg-gray-50 rounded-xl p-8 text-center">
          <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {selectedStatus === 'appointments' ? 'No appointments found' : 'No donations found'}
          </h3>
          <p className="text-gray-600">
            {selectedStatus === 'appointments' 
              ? `No appointment records found for Donor ID "${donorId}".`
              : `No donation records found for Donor ID "${donorId}" with the selected criteria.`
            }
          </p>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
          <Loader className="w-12 h-12 text-red-600 mx-auto mb-4 animate-spin" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {selectedStatus === 'appointments' ? 'Searching appointments...' : 'Searching donations...'}
          </h3>
          <p className="text-gray-600">
            {selectedStatus === 'appointments' 
              ? 'Please wait while we fetch the appointment history.'
              : 'Please wait while we fetch the donation history.'
            }
          </p>
        </div>
      )}
    </div>
  );
} 