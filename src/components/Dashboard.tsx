import React, { useState, useEffect } from 'react';
import { LogOut, Calendar, User, Globe, MessageCircle, CheckCircle, XCircle, Plus, MapPin, Heart, ArrowLeft, Clock, AlertCircle, Lock, Shield, Smartphone, Key, X, Eye, EyeOff, Info } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import AppointmentBooking from './AppointmentBooking';
import DonorHistory from './DonorHistory';
import SessionManager from './SessionManager';
import LanguageSwitcher from './LanguageSwitcher';

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
  const { t } = useTranslation();
  const { donor, logout, isPasswordSet, setPassword } = useAuth();
  const [showBooking, setShowBooking] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showPasswordSetup, setShowPasswordSetup] = useState(false);
  const [passwordSetupData, setPasswordSetupData] = useState({
    password: '',
    confirmPassword: '',
    showPassword: false
  });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [hasPassword, setHasPassword] = useState<boolean | null>(null);

  useEffect(() => {
    if (donor) {
      fetchAppointments();
      checkPasswordStatus();
    }
  }, [donor]);

  const checkPasswordStatus = async () => {
    if (donor) {
      const status = await isPasswordSet(donor.donor_hash_id);
      setHasPassword(status);
    }
  };

  const handlePasswordSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwordSetupData.password !== passwordSetupData.confirmPassword) {
      setPasswordError(t('dashboard.passwordsDoNotMatch'));
      return;
    }

    if (passwordSetupData.password.length < 8) {
      setPasswordError(t('dashboard.passwordRequirements'));
      return;
    }

    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(passwordSetupData.password)) {
      setPasswordError(t('dashboard.passwordRequirements'));
      return;
    }

    try {
      setPasswordLoading(true);
      setPasswordError('');

      const result = await setPassword(donor!.donor_hash_id, passwordSetupData.password);

      if (result.success) {
        setPasswordSuccess(t('dashboard.passwordSetSuccess'));
        setHasPassword(true);
        setTimeout(() => {
          setShowPasswordSetup(false);
          setPasswordSetupData({ password: '', confirmPassword: '', showPassword: false });
          setPasswordSuccess('');
        }, 3000);
      } else {
        setPasswordError(result.error || t('dashboard.passwordSetError'));
      }
    } catch (err) {
      console.error('Set password error:', err);
      setPasswordError(t('dashboard.passwordError'));
    } finally {
      setPasswordLoading(false);
    }
  };

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
          donation_centers!donation_center_id (
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
      const transformedAppointments: Appointment[] = (data || []).map((appointment: any) => {
        // Handle donation_centers data structure
        let donationCenter = {
          name: 'Unknown Center',
          address: 'Address not available',
          city: 'City not available'
        };

        if (appointment.donation_centers) {
          // If it's an array, take the first item
          if (Array.isArray(appointment.donation_centers)) {
            donationCenter = appointment.donation_centers[0] || donationCenter;
          } else {
            // If it's a single object
            donationCenter = appointment.donation_centers;
          }
        }

        return {
          appointment_id: appointment.appointment_id,
          appointment_datetime: appointment.appointment_datetime,
          donation_type: appointment.donation_type,
          status: appointment.status,
          donation_centers: donationCenter
        };
      });

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

  if (showHistory) {
    return <DonorHistory 
      onBack={() => setShowHistory(false)} 
      onBookAppointment={() => setShowBooking(true)}
    />;
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
      case 'COMPLETED': return 'bg-green-100 text-green-800';
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
                <h1 className="text-xl font-bold text-gray-900">{t('dashboard.title')}</h1>
                <p className="text-xs text-gray-500">Saving lives through donation</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <LanguageSwitcher variant="minimal" />
              {onBackToLanding && (
                <button
                  onClick={onBackToLanding}
                  className="flex items-center px-4 py-2 text-sm font-medium text-red-600 border border-red-200 bg-white hover:bg-red-50 rounded-lg transition-colors duration-200"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  {t('dashboard.backToLanding')}
                </button>
              )}
              <button
                onClick={logout}
                className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors duration-200"
              >
                <LogOut className="w-4 h-4 mr-2" />
                {t('dashboard.logout')}
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
                {t('dashboard.welcome')}, {donor.first_name}!
              </h2>
              <p className="text-gray-600">
                {donor.avis_donor_center} • ID: {donor.donor_hash_id.substring(0, 8)}...
              </p>
              {!hasPassword && (
                <div className="mt-2 flex items-center text-sm text-blue-600">
                  <Key className="w-4 h-4 mr-2" />
                  <span>{t('dashboard.passwordSetupDesc')}</span>
                </div>
              )}
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
                  <span>Preferred Method of Contact: {donor.preferred_communication_channel}</span>
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
                  <span className="text-sm">
                    {hasPassword ? 'Dual Authentication (Hash + Password)' : 'Hash-based Authentication'}
                  </span>
                </div>
                <div className="flex items-center text-green-600">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  <span className="text-sm">No PII Stored</span>
                </div>
                {hasPassword && (
                  <div className="flex items-center text-blue-600">
                    <Lock className="w-4 h-4 mr-2" />
                    <span className="text-sm">Password Authentication Available</span>
                  </div>
                )}
              </div>
            </div>
          </div>


        </div>

        {/* Dashboard Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Quick Actions */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('dashboard.appointments')}</h3>
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
                  <h4 className="font-semibold text-gray-900 mb-1">{t('dashboard.bookAppointment')}</h4>
                  <p className="text-sm text-gray-600">Book your next donation appointment</p>
                </button>
                <button 
                  onClick={() => setShowHistory(true)}
                  className="p-6 border border-gray-200 rounded-lg hover:bg-green-50 hover:border-green-300 transition-all duration-200 text-left group"
                >
                  <div className="flex items-center mb-3">
                    <div className="bg-green-100 p-2 rounded-lg group-hover:bg-green-200 transition-colors">
                      <User className="w-5 h-5 text-green-600" />
                    </div>
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-1">{t('dashboard.viewHistory')}</h4>
                  <p className="text-sm text-gray-600">See past appointments and donations</p>
                </button>
              </div>
            </div>

            {/* Recent Appointments */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('dashboard.upcomingAppointments')}</h3>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Clock className="w-6 h-6 animate-spin text-red-600 mr-2" />
                  <span className="text-gray-600">{t('common.loading')}</span>
                </div>
              ) : error ? (
                <div className="flex items-center justify-center py-8">
                  <AlertCircle className="w-6 h-6 text-red-600 mr-2" />
                  <span className="text-red-600">{error}</span>
                </div>
              ) : appointments.length === 0 ? (
                <div className="text-center py-8">
                  <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600">{t('dashboard.noAppointments')}</p>
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

            {/* Authentication Options */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200 p-6 mt-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <div className="bg-blue-100 p-3 rounded-full mr-4">
                    <Key className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Authentication Options</h3>
                    <p className="text-sm text-gray-600">
                      Choose your preferred authentication method
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Current Authentication Method */}
                <div className="bg-white rounded-lg p-4 border border-blue-200">
                  <div className="flex items-center mb-3">
                    <Shield className="w-5 h-5 text-blue-600 mr-2" />
                    <h4 className="font-medium text-gray-900">Current Method</h4>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center text-sm">
                      <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                      <span className="text-gray-700">
                        {hasPassword ? 'Password Authentication' : 'Hash-based Authentication'}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500">
                      {hasPassword 
                        ? 'You can log in with your password on any device'
                        : 'You log in using your personal information (name, DOB, center)'
                      }
                    </div>
                  </div>
                </div>

                {/* Password Setup */}
                <div className="bg-white rounded-lg p-4 border border-blue-200">
                  <div className="flex items-center mb-3">
                    <Lock className="w-5 h-5 text-green-600 mr-2" />
                    <h4 className="font-medium text-gray-900">Password Setup</h4>
                  </div>
                  <div className="space-y-3">
                    {hasPassword ? (
                      <div className="text-sm text-green-600">
                        <CheckCircle className="w-4 h-4 inline mr-2" />
                        Password is already set up
                      </div>
                    ) : (
                      <button
                        onClick={() => setShowPasswordSetup(true)}
                        className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                      >
                        <Lock className="w-4 h-4 inline mr-2" />
                        Set Up Password
                      </button>
                    )}
                    <div className="text-xs text-gray-500">
                      {hasPassword 
                        ? 'You can use either authentication method'
                        : 'Add password authentication for easier login'
                      }
                    </div>
                  </div>
                </div>
              </div>

              {/* Authentication Method Comparison */}
              <div className="mt-6 bg-white rounded-lg border border-blue-200 p-4">
                <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                  <Info className="w-4 h-4 mr-2 text-blue-600" />
                  Authentication Methods Comparison
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <h5 className="font-medium text-gray-700 mb-2 flex items-center">
                      <Key className="w-4 h-4 mr-2 text-blue-600" />
                      Hash-based Authentication
                    </h5>
                    <ul className="space-y-1 text-gray-600 text-xs">
                      <li>• No password to remember</li>
                      <li>• Uses your personal information</li>
                      <li>• Secure and GDPR compliant</li>
                      <li>• Works on any device</li>
                    </ul>
                  </div>
                  <div>
                    <h5 className="font-medium text-gray-700 mb-2 flex items-center">
                      <Lock className="w-4 h-4 mr-2 text-green-600" />
                      Password Authentication
                    </h5>
                    <ul className="space-y-1 text-gray-600 text-xs">
                      <li>• Faster login process</li>
                      <li>• More convenient for regular use</li>
                      <li>• Device-specific sessions</li>
                      <li>• Enhanced security features</li>
                    </ul>
                  </div>
                </div>
                <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                  <p className="text-xs text-blue-800">
                    <strong>Note:</strong> You can use both methods simultaneously. Setting up a password doesn't disable hash-based authentication.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            {/* Session Manager */}
            <SessionManager onLogout={logout} />

            {/* Donation Summary */}
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
        </div>
      </main>

      {/* Password Setup Modal */}
      {showPasswordSetup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 rounded-t-xl">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white">{t('dashboard.passwordSetupTitle')}</h3>
                <button
                  onClick={() => setShowPasswordSetup(false)}
                  className="text-white hover:text-blue-100 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6">
              {passwordSuccess ? (
                <div className="text-center">
                  <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-4" />
                  <p className="text-green-800 font-medium">{passwordSuccess}</p>
                </div>
              ) : (
                <form onSubmit={handlePasswordSetup} className="space-y-4">
                  <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                      {t('dashboard.newPassword')}
                    </label>
                    <div className="relative">
                      <input
                        type={passwordSetupData.showPassword ? 'text' : 'password'}
                        id="password"
                        value={passwordSetupData.password}
                        onChange={(e) => setPasswordSetupData(prev => ({ ...prev, password: e.target.value }))}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder={t('dashboard.newPassword')}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setPasswordSetupData(prev => ({ ...prev, showPassword: !prev.showPassword }))}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      >
                        {passwordSetupData.showPassword ? (
                          <EyeOff className="w-4 h-4 text-gray-400" />
                        ) : (
                          <Eye className="w-4 h-4 text-gray-400" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                      {t('dashboard.confirmPassword')}
                    </label>
                    <input
                      type="password"
                      id="confirmPassword"
                      value={passwordSetupData.confirmPassword}
                      onChange={(e) => setPasswordSetupData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder={t('dashboard.confirmPassword')}
                      required
                    />
                  </div>

                  {passwordError && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                      <p className="text-sm text-red-600">{passwordError}</p>
                    </div>
                  )}

                  <div className="text-xs text-gray-500">
                    {t('dashboard.passwordRequirements')}
                  </div>

                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setShowPasswordSetup(false)}
                      className="flex-1 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
                    >
                      {t('common.cancel')}
                    </button>
                    <button
                      type="submit"
                      disabled={passwordLoading}
                      className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                    >
                      {passwordLoading ? t('common.loading') : t('dashboard.passwordSetup')}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}