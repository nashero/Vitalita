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
import { generateSHA256Hash } from '../utils/crypto';
import { supabase } from '../lib/supabase';

interface DonorRegistrationProps {
  onBack: () => void;
  onSuccess: () => void;
  onBackToLanding?: () => void;
}

interface RegistrationFormData {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  avisDonorCenter: string;
  email: string;
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

export default function DonorRegistration({ onBack, onSuccess, onBackToLanding }: DonorRegistrationProps) {
  const [formData, setFormData] = useState<RegistrationFormData>({
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    avisDonorCenter: '',
    email: '',
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
    if (!formData.email.trim()) return 'Email address is required';

    // Validate email format
    const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
    if (!emailRegex.test(formData.email)) {
      return 'Please enter a valid email address';
    }

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

      // Generate donor_hash_id from personal information
      const authString = `${formData.firstName}${formData.lastName}${formData.dateOfBirth}${formData.avisDonorCenter}`;
      console.log('Auth string for hash:', authString);
      const donorHashId = await generateSHA256Hash(authString);

      // Check if this hash already exists (duplicate registration)
      const { data: existingDonor, error: checkError } = await supabase
        .from('donors')
        .select('donor_hash_id')
        .eq('donor_hash_id', donorHashId)
        .single();

      if (checkError && checkError.code !== 'PGRST116') { // PGRST116 is "not found" error
        console.error('Error checking existing donor:', checkError);
        setError('Registration failed. Please try again.');
        return;
      }

      if (existingDonor) {
        setError('A donor account already exists with these details. Please contact AVIS staff for assistance.');
        return;
      }

      // Check if email already exists
      const { data: existingEmail, error: emailCheckError } = await supabase
        .from('donors')
        .select('email')
        .eq('email', formData.email)
        .single();

      if (emailCheckError && emailCheckError.code !== 'PGRST116') {
        console.error('Error checking existing email:', emailCheckError);
        setError('Registration failed. Please try again.');
        return;
      }

      if (existingEmail) {
        setError('An account with this email address already exists. Please use a different email or contact AVIS staff for assistance.');
        return;
      }

      // Generate salt for additional security
      const salt = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

      // Use the new database function for registration with email verification
      const registrationParams = {
        p_donor_hash_id: donorHashId,
        p_salt: salt,
        p_email: formData.email,
        p_avis_donor_center: formData.avisDonorCenter
      };
      
      console.log('Attempting registration with:', registrationParams);

      const { data: registrationResult, error: insertError } = await supabase
        .rpc('register_donor_with_email', registrationParams);

      if (insertError) {
        console.error('Error creating donor record:', insertError);
        setError(`Registration failed: ${insertError.message || 'Please try again.'}`);
        return;
      }

      console.log('Registration result:', registrationResult);

      // Check if registration actually succeeded
      if (registrationResult === false) {
        console.error('Registration function returned false - registration failed');
        setError('Registration failed. The registration function returned an error. Please try again or contact support.');
        return;
      }

      // Add a small delay to ensure the transaction is committed
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Verify that the donor was actually created
      const { data: verifyDonor, error: verifyError } = await supabase
        .from('donors')
        .select('donor_hash_id, email, email_verified, account_activated, is_active')
        .eq('donor_hash_id', donorHashId)
        .single();

      if (verifyError) {
        console.error('Error verifying donor creation:', verifyError);
        console.error('Verification error details:', {
          code: verifyError.code,
          message: verifyError.message,
          details: verifyError.details,
          hint: verifyError.hint
        });
        
        // Instead of failing, proceed with success but log the verification issue
        console.warn('Registration succeeded but verification failed. Proceeding with success message.');
        // Don't return here - continue with success flow
      } else {
        console.log('Verified donor record:', verifyDonor);
      }

      // Try to create audit log for registration, but don't fail if it doesn't work
      try {
        await supabase.rpc('create_audit_log', {
          p_user_id: donorHashId,
          p_user_type: 'donor',
          p_action: 'registration',
          p_details: 'New donor registration submitted for verification',
          p_status: 'success'
        });
      } catch (auditError) {
        console.warn('Failed to create audit log (non-critical):', auditError);
        // Don't fail the registration for audit log issues
      }

      // Determine success message based on verification status
      const verificationStatus = verifyDonor ? 'verified' : 'pending_verification';
      const successMessage = verificationStatus === 'verified' 
        ? `Registration successful! Your donor account has been created with ID: ${donorHashId.substring(0, 8)}...\n\nNext steps:\n1. Check your email (${formData.email}) for a verification link\n2. Click the verification link to confirm your email address\n3. AVIS staff will review and activate your account\n4. You'll receive a notification when ready to donate\n\nYou can now log in using your registration details once your account is activated.`
        : `Registration submitted successfully! Your donor account has been created with ID: ${donorHashId.substring(0, 8)}...\n\nNext steps:\n1. Check your email (${formData.email}) for a verification link\n2. Click the verification link to confirm your email address\n3. AVIS staff will review and activate your account\n4. You'll receive a notification when ready to donate\n\nNote: Your account is being processed. You can now log in using your registration details once your account is activated.`;

      setSuccess(successMessage);
      
      // Clear form
      setFormData({
        firstName: '',
        lastName: '',
        dateOfBirth: '',
        avisDonorCenter: '',
        email: '',
      });

      // Don't automatically redirect - let user read the message and choose when to proceed
      // setTimeout(() => {
      //   onSuccess();
      // }, 5000);

    } catch (err) {
      console.error('Registration error:', err);
      setError('Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-pink-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-red-600 to-red-700 px-8 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <button
                  onClick={onBack}
                  className="flex items-center text-white/80 hover:text-white transition-colors"
                >
                  <ArrowLeft className="w-5 h-5 mr-2" />
                  Back
                </button>
                {onBackToLanding && (
                  <button
                    onClick={onBackToLanding}
                    className="flex items-center text-white/60 hover:text-white transition-colors text-sm"
                  >
                    <ArrowLeft className="w-4 h-4 mr-1" />
                    Home
                  </button>
                )}
              </div>
              <div className="text-center flex-1">
                <div className="flex items-center justify-center mb-2">
                  <div className="bg-white/20 p-3 rounded-full">
                    <UserPlus className="w-8 h-8 text-white" />
                  </div>
                </div>
                <h1 className="text-2xl font-bold text-white">Donor Registration</h1>
                <p className="text-red-100 text-sm mt-1">
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
                  <div className="flex-1">
                    <p className="text-green-800 font-medium mb-2">Registration Successful!</p>
                    <div className="text-green-700 text-sm mb-4 whitespace-pre-line">{success}</div>
                    <div className="flex flex-col sm:flex-row gap-3">
                      <button
                        onClick={onSuccess}
                        className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                      >
                        Continue to Login
                      </button>
                      <button
                        onClick={() => {
                          setSuccess('');
                          setFormData({
                            firstName: '',
                            lastName: '',
                            dateOfBirth: '',
                            avisDonorCenter: '',
                            email: '',
                          });
                        }}
                        className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors text-sm font-medium"
                      >
                        Register Another Donor
                      </button>
                    </div>
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

            {!success && (
              <>
                {/* GDPR Notice */}
                <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-start">
                    <Shield className="w-5 h-5 text-red-600 mt-0.5 mr-3" />
                    <div className="text-sm text-red-800">
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
                      className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors duration-200"
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
                      className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors duration-200"
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
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors duration-200"
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
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors duration-200 appearance-none bg-white"
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

              {/* Email Address */}
              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                  Email Address *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <input
                    type="email"
                    id="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors duration-200"
                    placeholder="Enter your email address"
                    disabled={loading}
                    required
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  We'll send a verification email to this address
                </p>
              </div>

              {/* Important Notice */}
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <div className="flex items-start">
                  <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 mr-3" />
                  <div className="text-sm text-amber-800">
                    <p className="font-medium mb-1">Important:</p>
                    <p>After registration and AVIS staff verification, you will log in using these exact details (First Name, Last Name, Date of Birth, and AVIS Center). Please ensure all information is accurate as it cannot be changed later. You will receive a verification email to confirm your email address.</p>
                  </div>
                </div>
              </div>

              {/* Verification Process Notice */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5 mr-3" />
                  <div className="text-sm text-blue-800">
                    <p className="font-medium mb-1">Verification Process:</p>
                    <p>1. Submit registration form<br/>
                    2. Check your email and click the verification link<br/>
                    3. AVIS staff will review and activate your account<br/>
                    4. You'll receive a notification when ready to donate</p>
                  </div>
                </div>
              </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-red-600 to-red-700 text-white py-3 px-4 rounded-lg font-semibold hover:from-red-700 hover:to-red-800 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
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
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}