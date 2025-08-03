import React, { useState, useEffect } from 'react';
import { LogOut, Calendar, User, Globe, MessageCircle, CheckCircle, XCircle, Plus, MapPin, Heart, ArrowLeft, Clock, AlertCircle } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import AppointmentBooking from './AppointmentBooking';

interface Appointment {
  appointment_id: string;
  appointment_datetime: string;
  donation_type: string;
  status: string;
  donation_centers: {
    name: string;
    address: string;
    city: string;
  };
}

export default function Dashboard({ onBackToLanding }: { onBackToLanding?: () => void }) {
  const { donor, logout } = useAuth();
  const [showBooking, setShowBooking] = useState(false);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (donor) {
      fetchAppointments();
    }
  }, [donor]);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      setError('');

      const { data, error: fetchError } = await supabase
        .from('appointments')
        .select(`
          appointment_id,
          appointment_datetime,
          donation_type,
          status,
          donation_centers (
            name,
            address,
            city
          )
        `)
        .eq('donor_hash_id', donor?.donor_hash_id)
        .order('appointment_datetime', { ascending: false })
        .limit(5);

      if (fetchError) {
        console.error('Error fetching appointments:', fetchError);
        setError('Failed to load appointment history');
        return;
      }

      // Transform the data to match our interface
      const transformedAppointments: Appointment[] = (data || []).map(appointment => ({
        appointment_id: appointment.appointment_id,
        appointment_datetime: appointment.appointment_datetime,
        donation_type: appointment.donation_type,
        status: appointment.status,
        donation_centers: (appointment.donation_centers as any)?.[0] || {
          name: 'Unknown Center',
          address: 'Address not available',
          city: 'City not available'
        }
      }));

      setAppointments(transformedAppointments);
    } catch (err) {
      console.error('Error fetching appointments:', err);
      setError('Failed to load appointment history');
    } finally {
      setLoading(false);
    }
  };

  if (!donor) return null;

  if (showBooking) {
    return <AppointmentBooking onBack={() => setShowBooking(false)} />;
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString();
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
  };

  const getStatusColor = (status: boolean) => {
    return status ? 'text-green-600' : 'text-red-600';
  };

  const getStatusIcon = (status: boolean) => {
    return status ? CheckCircle : XCircle;
  };

  const getAppointmentStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-red-100 text-red-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
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
                <h1 className="text-xl font-bold text-gray-900">Vitalita Donor Portal</h1>
                <p className="text-xs text-gray-500">Saving lives through donation</p>
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

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex items-center mb-6">
            <div className="bg-red-100 p-3 rounded-full mr-4">
              <User className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                Welcome back, Donor!
              </h2>
              <p className="text-gray-600">
                {donor.avis_donor_center} • ID: {donor.donor_hash_id.substring(0, 8)}...
              </p>
            </div>
          </div>

          {/* Donor Information Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Center Information</h3>
              <div className="space-y-2">
                <div className="flex items-center text-gray-900">
                  <MapPin className="w-4 h-4 mr-2 text-red-600" />
                  <span className="font-medium">{donor.avis_donor_center}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <Globe className="w-4 h-4 mr-2" />
                  <span>Language: {donor.preferred_language.toUpperCase()}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <MessageCircle className="w-4 h-4 mr-2" />
                  <span>Contact: {donor.preferred_communication_channel}</span>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Account Status</h3>
              <div className="space-y-2">
                <div className="flex items-center">
                  {React.createElement(getStatusIcon(donor.initial_vetting_status), {
                    className: `w-4 h-4 mr-2 ${getStatusColor(donor.initial_vetting_status)}`
                  })}
                  <span className={`text-sm ${getStatusColor(donor.initial_vetting_status)}`}>
                    Vetting: {donor.initial_vetting_status ? 'Completed' : 'Pending'}
                  </span>
                </div>
                <div className="flex items-center">
                  {React.createElement(getStatusIcon(donor.is_active), {
                    className: `w-4 h-4 mr-2 ${getStatusColor(donor.is_active)}`
                  })}
                  <span className={`text-sm ${getStatusColor(donor.is_active)}`}>
                    Status: {donor.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Privacy & Security</h3>
              <div className="space-y-2">
                <div className="flex items-center text-green-600">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  <span className="text-sm">GDPR Compliant</span>
                </div>
                <div className="flex items-center text-green-600">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  <span className="text-sm">Hash Authentication</span>
                </div>
                <div className="flex items-center text-green-600">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  <span className="text-sm">No PII Stored</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Dashboard Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Quick Actions */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button 
                  onClick={() => setShowBooking(true)}
                  className="p-6 border border-gray-200 rounded-lg hover:bg-red-50 hover:border-red-300 transition-all duration-200 text-left group"
                >
                  <div className="flex items-center mb-3">
                    <div className="bg-red-100 p-2 rounded-lg group-hover:bg-red-200 transition-colors">
                      <Plus className="w-5 h-5 text-red-600" />
                    </div>
                    <Calendar className="w-6 h-6 text-red-600 ml-2" />
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-1">Schedule Appointment</h4>
                  <p className="text-sm text-gray-600">Book your next donation appointment</p>
                </button>
                <button className="p-6 border border-gray-200 rounded-lg hover:bg-green-50 hover:border-green-300 transition-all duration-200 text-left group">
                  <div className="flex items-center mb-3">
                    <div className="bg-green-100 p-2 rounded-lg group-hover:bg-green-200 transition-colors">
                      <User className="w-5 h-5 text-green-600" />
                    </div>
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-1">View History</h4>
                  <p className="text-sm text-gray-600">See past appointments and donations</p>
                </button>
              </div>
            </div>

            {/* Recent Appointments */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Appointments</h3>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Clock className="w-6 h-6 animate-spin text-red-600 mr-2" />
                  <span className="text-gray-600">Loading appointments...</span>
                </div>
              ) : error ? (
                <div className="flex items-center justify-center py-8">
                  <AlertCircle className="w-6 h-6 text-red-600 mr-2" />
                  <span className="text-red-600">{error}</span>
                </div>
              ) : appointments.length === 0 ? (
                <div className="text-center py-8">
                  <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600">No appointments found</p>
                  <p className="text-sm text-gray-500">Schedule your first donation appointment</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {appointments.map((appointment) => {
                    const dateTime = formatDateTime(appointment.appointment_datetime);
                    return (
                      <div key={appointment.appointment_id} className="flex items-center justify-between p-4 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors">
                        <div className="flex items-center space-x-4">
                                          <div className="bg-red-100 p-2 rounded-lg">
                  <Calendar className="w-4 h-4 text-red-600" />
                </div>
                          <div>
                            <p className="font-medium text-gray-900">{appointment.donation_type} Donation</p>
                            <p className="text-sm text-gray-600">
                              {dateTime.date} at {dateTime.time}
                            </p>
                            <p className="text-xs text-gray-500">
                              {appointment.donation_centers.name}, {appointment.donation_centers.city}
                            </p>
                          </div>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getAppointmentStatusColor(appointment.status)}`}>
                          {appointment.status}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Status Panel */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Donation Summary</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Status</span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  {donor.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">This Year</span>
                <span className="text-sm font-semibold text-gray-900">
                  {donor.total_donations_this_year} donations
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Last Donation</span>
                <span className="text-sm text-gray-900">
                  {formatDate(donor.last_donation_date)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Vetting Status</span>
                <span className={`text-sm font-medium ${getStatusColor(donor.initial_vetting_status)}`}>
                  {donor.initial_vetting_status ? 'Approved' : 'Pending'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Center</span>
                <span className="text-sm font-medium text-gray-900">
                  {donor.avis_donor_center}
                </span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}