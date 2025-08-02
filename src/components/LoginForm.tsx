import React, { useState } from 'react';
import { User, Calendar, LogIn, UserPlus, MapPin, CalendarDays, ArrowLeft } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

interface LoginFormProps {
  onShowRegistration?: () => void;
  onBackToLanding?: () => void;
}

const AVIS_CENTERS = [
  { value: 'AVIS Casalmaggiore', label: 'AVIS Casalmaggiore' },
  { value: 'AVIS Gussola', label: 'AVIS Gussola' },
  { value: 'AVIS Viadana', label: 'AVIS Viadana' },
   { value: 'AVIS Piadena', label: 'AVIS Piadena' },
  { value: 'AVIS Rivarolo del Re', label: 'AVIS Rivarolo del Re' },
  { value: 'AVIS Scandolara-Ravara', label: 'AVIS Scandolara-Ravara' },
  { value: 'AVIS Calvatone', label: 'AVIS Calvatone' },
];

export default function LoginForm({ onShowRegistration, onBackToLanding }: LoginFormProps) {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    avisDonorCenter: '',
  });
  const [error, setError] = useState('');
  const { login, loading } = useAuth();

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError(''); // Clear error when user starts typing
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validate all fields are filled
    if (!formData.firstName.trim() || !formData.lastName.trim() || 
        !formData.dateOfBirth || !formData.avisDonorCenter) {
      setError('Please fill in all fields');
      return;
    }

    // Create authentication data object (without donorId)
    const authData = {
      firstName: formData.firstName.trim(),
      lastName: formData.lastName.trim(),
      donorId: '', // Not used anymore, but keeping for compatibility
      dateOfBirth: formData.dateOfBirth,
      avisDonorCenter: formData.avisDonorCenter,
    };

    const result = await login(authData);
    if (!result.success) {
      setError(result.error || 'Authentication failed');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-pink-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-red-600 to-red-700 px-8 py-6">
            <div className="flex items-center justify-between">
              {onBackToLanding && (
                <button
                  onClick={onBackToLanding}
                  className="flex items-center text-white/80 hover:text-white transition-colors"
                >
                  <ArrowLeft className="w-5 h-5 mr-2" />
                  Back to Home
                </button>
              )}
              <div className="text-center flex-1">
                <div className="flex items-center justify-center mb-2">
                  <div className="bg-white/20 p-3 rounded-full">
                    <LogIn className="w-8 h-8 text-white" />
                  </div>
                </div>
                <h1 className="text-2xl font-bold text-white">Donor Portal</h1>
                <p className="text-red-100 text-sm mt-1">
                  Sign in to access your AVIS account
                </p>
              </div>
              <div className="w-16"></div> {/* Spacer for centering */}
            </div>
          </div>

          {/* Form */}
          <div className="px-8 py-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* First Name */}
              <div>
                <label htmlFor="firstName" className="block text-sm font-semibold text-gray-700 mb-2">
                  First Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors duration-200 text-gray-900 placeholder-gray-500"
                    placeholder="Enter your first name"
                    disabled={loading}
                    autoComplete="given-name"
                  />
                </div>
              </div>

              {/* Last Name */}
              <div>
                <label htmlFor="lastName" className="block text-sm font-semibold text-gray-700 mb-2">
                  Last Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors duration-200 text-gray-900 placeholder-gray-500"
                    placeholder="Enter your last name"
                    disabled={loading}
                    autoComplete="family-name"
                  />
                </div>
              </div>

              {/* Date of Birth */}
              <div>
                <label htmlFor="dateOfBirth" className="block text-sm font-semibold text-gray-700 mb-2">
                  Date of Birth
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <CalendarDays className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="date"
                    id="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors duration-200 text-gray-900"
                    disabled={loading}
                    autoComplete="bday"
                  />
                </div>
              </div>

              {/* AVIS Donor Center */}
              <div>
                <label htmlFor="avisDonorCenter" className="block text-sm font-semibold text-gray-700 mb-2">
                  AVIS Donor Center
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MapPin className="h-5 w-5 text-gray-400" />
                  </div>
                  <select
                    id="avisDonorCenter"
                    value={formData.avisDonorCenter}
                    onChange={(e) => handleInputChange('avisDonorCenter', e.target.value)}
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors duration-200 appearance-none bg-white text-gray-900"
                    disabled={loading}
                  >
                    <option value="">Select your AVIS center</option>
                    {AVIS_CENTERS.map(center => (
                      <option key={center.value} value={center.value}>
                        {center.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-sm text-red-600 font-medium">{error}</p>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-red-600 to-red-700 text-white py-3 px-4 rounded-lg font-semibold hover:from-red-700 hover:to-red-800 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Authenticating...
                  </div>
                ) : (
                  <div className="flex items-center justify-center">
                    <LogIn className="w-5 h-5 mr-2" />
                    Sign In
                  </div>
                )}
              </button>
            </form>

            {/* Registration Link */}
            {onShowRegistration && (
              <div className="mt-6 pt-6 border-t border-gray-100">
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-3">
                    Don't have an account?
                  </p>
                  <button
                    onClick={onShowRegistration}
                    className="inline-flex items-center px-4 py-2 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors duration-200"
                  >
                    <UserPlus className="w-4 h-4 mr-2" />
                    Register as New Donor
                  </button>
                </div>
              </div>
            )}

            {/* Security Notice */}
            <div className="mt-6 pt-6 border-t border-gray-100">
              <div className="flex items-center justify-center text-xs text-gray-500">
                <Calendar className="w-3 h-3 mr-1" />
                Secure authentication using your personal information
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-sm text-gray-500">
            Need help? Contact your AVIS center administrator
          </p>
        </div>
      </div>
    </div>
  );
}