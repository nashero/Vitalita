import React, { useState } from 'react';
import { LogOut, Calendar, User, Globe, MessageCircle, CheckCircle, XCircle, Plus, MapPin, Heart } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import AppointmentBooking from './AppointmentBooking';

export default function Dashboard() {
  const { donor, logout } = useAuth();
  const [showBooking, setShowBooking] = useState(false);

  if (!donor) return null;

  if (showBooking) {
    return <AppointmentBooking onBack={() => setShowBooking(false)} />;
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString();
  };

  const getStatusColor = (status: boolean) => {
    return status ? 'text-green-600' : 'text-red-600';
  };

  const getStatusIcon = (status: boolean) => {
    return status ? CheckCircle : XCircle;
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
            <button
              onClick={logout}
              className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors duration-200"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex items-center mb-6">
            <div className="bg-blue-100 p-3 rounded-full mr-4">
              <User className="w-6 h-6 text-blue-600" />
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
                  className="p-6 border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-all duration-200 text-left group"
                >
                  <div className="flex items-center mb-3">
                    <div className="bg-blue-100 p-2 rounded-lg group-hover:bg-blue-200 transition-colors">
                      <Plus className="w-5 h-5 text-blue-600" />
                    </div>
                    <Calendar className="w-6 h-6 text-blue-600 ml-2" />
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