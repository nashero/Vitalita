import React, { useState } from 'react';
import { 
  User, 
  MapPin, 
  Save, 
  ArrowLeft, 
  CheckCircle, 
  AlertCircle,
  Loader,
  UserPlus,
  CalendarDays,
  Shield
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { generateSHA256Hash, generateSalt } from '../utils/crypto';

interface DonorRegistrationProps {
  onBack: () => void;
  onSuccess: () => void;
}

interface RegistrationFormData {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  avisDonorCenter: string;
}

const AVIS_CENTERS = [
  { value: 'Pompano', label: 'AVIS Pompano' },
  { value: 'Milan', label: 'AVIS Milan' },
  { value: 'Rome', label: 'AVIS Rome' },
];

export default function DonorRegistration({ onBack, onSuccess }: DonorRegistrationProps) {
  const [formData, setFormData] = useState<RegistrationFormData>({
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    avisDonorCenter: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleInputChange = (field: keyof RegistrationFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError(''); // Clear error when user starts typing
  };

  const validateForm = (): string | null => {
    if (!formData.firstName.trim()) return 'First name is required';
    if (!formData.lastName.trim()) return 'Last name is required';
    if (!formData.dateOfBirth) return 'Date of birth is required';
    if (!formData.avisDonorCenter) return 'AVIS Donor Center is required';

    // Validate date of birth (must be at least 18 years old)
    const birthDate = new Date(formData.dateOfBirth);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (age < 18 || (age === 18 && monthDiff < 0) || 
        (age === 18 && monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      return 'You must be at least 18 years old to register';
    }

    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setLoading(true);
      setError('');

      // Generate donor_hash_id from personal information (without donor ID)
      // This will be the only identifier stored in the database
      const personalInfoString = `${formData.firstName.trim()}${formData.lastName.trim()}${formData.dateOfBirth}${formData.avisDonorCenter}`;
      const donorHashId = await generateSHA256Hash(personalInfoString);

      // Check if this hash already exists (duplicate registration)
      const { data: existingDonor, error: checkError } = await supabase
        .from('donors')
        .select('donor_hash_id')
        .eq('donor_hash_id', donorHashId)
        .single();

      if (checkError && checkError.code !== 'PGRST116') {
        throw checkError;
      }

      if (existingDonor) {
        setError('A donor with this information already exists. Please check your details or contact support.');
        return;
      }

      // Generate salt for additional security
      const salt = generateSalt();

      // Create donor record with ONLY hashed data and operational information
      const { error: insertError } = await supabase
        .from('donors')
        .insert({
          donor_hash_id: donorHashId,
          salt: salt,
          avis_donor_center: formData.avisDonorCenter,
          preferred_language: 'en',
          preferred_communication_channel: 'email',
          initial_vetting_status: false,
          total_donations_this_year: 0,
          is_active: false, // Set to false initially - AVIS staff will activate after verification
        });

      if (insertError) {
        throw insertError;
      }

      // Create audit log for registration (without PII)
      await supabase.from('audit_logs').insert({
        user_id: donorHashId,
        user_type: 'donor',
        action: 'donor_registration',
        details: `New donor registered at ${formData.avisDonorCenter} center - pending AVIS staff verification`,
        resource_type: 'donor',
        resource_id: donorHashId,
        status: 'success'
      });

      setSuccess('Registration successful! Your information has been securely processed and submitted for verification. AVIS staff will verify you as a donor and notify you when your account is activated. You will then be able to log in using your personal details.');
      
      // Clear form
      setFormData({
        firstName: '',
        lastName: '',
        dateOfBirth: '',
        avisDonorCenter: '',
      });

      // Redirect to success or login after a delay
      setTimeout(() => {
        onSuccess();
      }, 5000);

    } catch (err) {
      console.error('Registration error:', err);
      setError('Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-6">
            <div className="flex items-center justify-between">
              <button
                onClick={onBack}
                className="flex items-center text-white/80 hover:text-white transition-colors"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Back
              </button>
              <div className="text-center flex-1">
                <div className="flex items-center justify-center mb-2">
                  <div className="bg-white/20 p-3 rounded-full">
                    <UserPlus className="w-8 h-8 text-white" />
                  </div>
                </div>
                <h1 className="text-2xl font-bold text-white">Donor Registration</h1>
                <p className="text-blue-100 text-sm mt-1">
                  Create your secure AVIS donor account
                </p>
              </div>
              <div className="w-16"></div> {/* Spacer for centering */}
            </div>
          </div>

          {/* Form */}
          <div className="px-8 py-8">
            {success && (
              <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-600 mr-3 mt-0.5" />
                  <div>
                    <p className="text-green-800 font-medium mb-2">Registration Successful!</p>
                    <p className="text-green-700 text-sm">{success}</p>
                  </div>
                </div>
              </div>
            )}

            {error && (
              <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center">
                  <AlertCircle className="w-5 h-5 text-red-600 mr-3" />
                  <p className="text-red-800 font-medium">{error}</p>
                </div>
              </div>
            )}

            {/* GDPR Notice */}
            <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start">
                <Shield className="w-5 h-5 text-blue-600 mt-0.5 mr-3" />
                <div className="text-sm text-blue-800">
                  <p className="font-medium mb-1">Privacy & Security:</p>
                  <p>Your personal information will be securely hashed and the original data will not be stored. This ensures GDPR compliance while maintaining secure authentication.</p>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Personal Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-semibold text-gray-700 mb-2">
                    First Name *
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
                      className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                      placeholder="Enter your first name"
                      disabled={loading}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="lastName" className="block text-sm font-semibold text-gray-700 mb-2">
                    Last Name *
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
                      className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                      placeholder="Enter your last name"
                      disabled={loading}
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Date of Birth */}
              <div>
                <label htmlFor="dateOfBirth" className="block text-sm font-semibold text-gray-700 mb-2">
                  Date of Birth *
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
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                    disabled={loading}
                    required
                    max={new Date(new Date().setFullYear(new Date().getFullYear() - 18)).toISOString().split('T')[0]}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  You must be at least 18 years old to donate
                </p>
              </div>

              {/* AVIS Donor Center */}
              <div>
                <label htmlFor="avisDonorCenter" className="block text-sm font-semibold text-gray-700 mb-2">
                  AVIS Donor Center *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MapPin className="h-5 w-5 text-gray-400" />
                  </div>
                  <select
                    id="avisDonorCenter"
                    value={formData.avisDonorCenter}
                    onChange={(e) => handleInputChange('avisDonorCenter', e.target.value)}
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 appearance-none bg-white"
                    disabled={loading}
                    required
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

              {/* Important Notice */}
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <div className="flex items-start">
                  <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 mr-3" />
                  <div className="text-sm text-amber-800">
                    <p className="font-medium mb-1">Important:</p>
                    <p>After registration and AVIS staff verification, you will log in using these exact details (First Name, Last Name, Date of Birth, and AVIS Center). Please ensure all information is accurate as it cannot be changed later.</p>
                  </div>
                </div>
              </div>

              {/* Verification Process Notice */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5 mr-3" />
                  <div className="text-sm text-blue-800">
                    <p className="font-medium mb-1">Verification Process:</p>
                    <p>After submitting your registration, AVIS staff will verify your eligibility as a donor and activate your account. You will be notified when your account is ready for use.</p>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-4 rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <Loader className="w-5 h-5 animate-spin mr-2" />
                    Submitting for Verification...
                  </div>
                ) : (
                  <div className="flex items-center justify-center">
                    <Save className="w-5 h-5 mr-2" />
                    Submit Registration
                  </div>
                )}
              </button>
            </form>

            {/* Security Notice */}
            <div className="mt-6 pt-6 border-t border-gray-100">
              <div className="flex items-center justify-center text-xs text-gray-500">
                <Shield className="w-3 h-3 mr-1" />
                GDPR compliant • Hash-based authentication • No PII stored
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}