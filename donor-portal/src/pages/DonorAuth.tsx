import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Heart,
  Droplet,
  User,
  Calendar,
  Hash,
  Mail,
  Shield,
  AlertCircle,
  Lock,
  CheckCircle,
  Loader2,
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { generateDonorHashId, generateSalt } from '../utils/hash';

type TabType = 'login' | 'register';

interface LoginFormData {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  donorId: string;
}

interface RegisterFormData extends LoginFormData {
  email: string;
}

const DonorAuth = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<TabType>('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [showForgotModal, setShowForgotModal] = useState(false);

  const [loginData, setLoginData] = useState<LoginFormData>({
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    donorId: '',
  });

  const [registerData, setRegisterData] = useState<RegisterFormData>({
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    donorId: '',
    email: '',
  });

  // Calculate max date (18 years ago)
  const maxDate = new Date();
  maxDate.setFullYear(maxDate.getFullYear() - 18);
  const maxDateString = maxDate.toISOString().split('T')[0];

  // Validate Donor ID format
  const validateDonorId = (donorId: string): boolean => {
    const donorIdRegex = /^[A-Za-z0-9]{5}$/;
    return donorIdRegex.test(donorId);
  };

  // Validate email format
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
    return emailRegex.test(email);
  };

  // Handle input changes for login
  const handleLoginChange = (field: keyof LoginFormData, value: string) => {
    setLoginData((prev) => ({ ...prev, [field]: value }));
    setError('');
    if (fieldErrors[field]) {
      setFieldErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  // Handle input changes for register
  const handleRegisterChange = (field: keyof RegisterFormData, value: string) => {
    setRegisterData((prev) => ({ ...prev, [field]: value }));
    setError('');
    if (fieldErrors[field]) {
      setFieldErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  // Validate login form
  const validateLoginForm = (): string | null => {
    const errors: Record<string, string> = {};

    if (!loginData.firstName.trim()) {
      errors.firstName = 'First name is required';
    }
    if (!loginData.lastName.trim()) {
      errors.lastName = 'Last name is required';
    }
    if (!loginData.dateOfBirth) {
      errors.dateOfBirth = 'Date of birth is required';
    }
    if (!loginData.donorId.trim()) {
      errors.donorId = 'Donor ID is required';
    } else if (!validateDonorId(loginData.donorId)) {
      errors.donorId = 'Donor ID must be 5 alphanumeric characters';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length > 0 ? 'Please fix the errors above' : null;
  };

  // Validate register form
  const validateRegisterForm = (): string | null => {
    const errors: Record<string, string> = {};

    if (!registerData.firstName.trim()) {
      errors.firstName = 'First name is required';
    }
    if (!registerData.lastName.trim()) {
      errors.lastName = 'Last name is required';
    }
    if (!registerData.dateOfBirth) {
      errors.dateOfBirth = 'Date of birth is required';
    }
    if (!registerData.donorId.trim()) {
      errors.donorId = 'Donor ID is required';
    } else if (!validateDonorId(registerData.donorId)) {
      errors.donorId = 'Donor ID must be 5 alphanumeric characters';
    }
    if (!registerData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!validateEmail(registerData.email)) {
      errors.email = 'Please enter a valid email address';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length > 0 ? 'Please fix the errors above' : null;
  };

  // Handle login submission
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const validationError = validateLoginForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setLoading(true);
      setError('');

      const donorHashId = await generateDonorHashId(
        loginData.firstName.toUpperCase(),
        loginData.lastName.toUpperCase(),
        loginData.dateOfBirth,
        loginData.donorId.toUpperCase()
      );

      const { data: donorData, error: donorError } = await supabase
        .from('donors')
        .select('donor_hash_id, donor_id, email_verified, account_activated, is_active, email')
        .eq('donor_hash_id', donorHashId)
        .single();

      if (donorError || !donorData) {
        setError('Account not found. Please check your information or register as a new donor.');
        return;
      }

      if (!donorData.is_active) {
        setError('Your account is not active. Please contact AVIS for assistance.');
        return;
      }

      if (!donorData.account_activated) {
        setError('Your account is pending activation. Please wait for AVIS to activate your account.');
        return;
      }

      if (!donorData.email_verified) {
        setError('Please verify your email address before logging in.');
        return;
      }

      sessionStorage.setItem('donor_hash_id', donorData.donor_hash_id);
      sessionStorage.setItem('donor_id', donorData.donor_id || loginData.donorId.toUpperCase());
      sessionStorage.setItem('donor_email', donorData.email || '');

      window.dispatchEvent(new Event('auth-change'));

      navigate('/appointments');
    } catch (err) {
      console.error('Login error:', err);
      setError('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle register submission
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const validationError = validateRegisterForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setLoading(true);
      setError('');

      const donorHashId = await generateDonorHashId(
        registerData.firstName.toUpperCase(),
        registerData.lastName.toUpperCase(),
        registerData.dateOfBirth,
        registerData.donorId.toUpperCase()
      );

      const { data: existingDonor } = await supabase
        .from('donors')
        .select('donor_hash_id')
        .eq('donor_hash_id', donorHashId)
        .single();

      if (existingDonor) {
        setError('An account with this information already exists. Please log in instead.');
        return;
      }

      const { data: existingEmail } = await supabase
        .from('donors')
        .select('email')
        .eq('email', registerData.email.toLowerCase())
        .single();

      if (existingEmail) {
        setError('An account with this email already exists. Please log in instead.');
        return;
      }

      const salt = generateSalt();

      const { data: registrationResult, error: registrationError } = await supabase.rpc(
        'register_donor_with_email',
        {
          p_donor_hash_id: donorHashId,
          p_salt: salt,
          p_email: registerData.email.toLowerCase(),
          p_donor_id: registerData.donorId.toUpperCase(),
        }
      );

      if (registrationError) {
        console.error('Registration error:', registrationError);
        setError(registrationError.message || 'Registration failed. Please try again.');
        return;
      }

      if (registrationResult && registrationResult.length > 0) {
        const result = registrationResult[0];
        if (result.success) {
          setSuccess(true);
          setRegisterData({
            firstName: '',
            lastName: '',
            dateOfBirth: '',
            donorId: '',
            email: '',
          });
          setTimeout(() => {
            navigate('/');
          }, 3000);
        } else {
          setError(result.message || 'Registration failed. Please try again.');
        }
      } else {
        setError('Registration failed. Please try again.');
      }
    } catch (err) {
      console.error('Registration error:', err);
      setError('Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Real-time validation for Donor ID
  useEffect(() => {
    if (activeTab === 'login' && loginData.donorId && !validateDonorId(loginData.donorId)) {
      if (!fieldErrors.donorId) {
        setFieldErrors((prev) => ({
          ...prev,
          donorId: 'Donor ID must be exactly 5 alphanumeric characters',
        }));
      }
    } else if (activeTab === 'register' && registerData.donorId && !validateDonorId(registerData.donorId)) {
      if (!fieldErrors.donorId) {
        setFieldErrors((prev) => ({
          ...prev,
          donorId: 'Donor ID must be exactly 5 alphanumeric characters',
        }));
      }
    }
  }, [loginData.donorId, registerData.donorId, activeTab]);

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8" style={{ background: 'linear-gradient(to bottom, #FDF6E9, #F9F0E0)' }}>
      {/* Subtle "Benvenuto" watermark */}
      <div className="fixed inset-0 pointer-events-none opacity-5" style={{ fontFamily: 'serif', fontSize: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3E2723' }}>
        Benvenuto
      </div>

      <div className="w-[90%] max-w-[500px]">
        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden" style={{ boxShadow: '0 10px 40px rgba(217, 119, 87, 0.15)' }}>
          {/* Terracotta accent bar */}
          <div className="h-2 bg-terracotta"></div>

          {/* Header */}
          <div className="px-6 sm:px-10 pt-6 sm:pt-8 pb-4 sm:pb-6 text-center">
            {/* Heart with droplet icon */}
            <div className="flex justify-center mb-4">
              <div className="relative">
                <Heart className="w-14 h-14 sm:w-16 sm:h-16 text-terracotta" fill="currentColor" />
                <Droplet className="w-5 h-5 sm:w-6 sm:h-6 text-terracotta absolute -bottom-1 -right-1" fill="currentColor" />
              </div>
            </div>

            {/* Italian flag decorative element */}
            <div className="flex justify-center gap-1 mb-4" style={{ fontSize: '12px' }}>
              <span className="inline-block w-4 h-3 bg-green-600"></span>
              <span className="inline-block w-4 h-3 bg-white border border-gray-300"></span>
              <span className="inline-block w-4 h-3 bg-red-600"></span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold text-espresso mb-2">Donor Login</h1>
            <p className="text-sm text-taupe">Access your donation dashboard and schedule appointments</p>
          </div>

          {/* Tab Switcher */}
          <div className="flex border-b border-taupe/20">
            <button
              type="button"
              onClick={() => {
                setActiveTab('login');
                setError('');
                setFieldErrors({});
              }}
              className={`flex-1 py-3 px-2 sm:px-4 text-sm font-medium transition-all duration-300 ${
                activeTab === 'login'
                  ? 'bg-terracotta text-white rounded-tl-lg sm:rounded-tl-lg'
                  : 'text-taupe bg-transparent hover:text-espresso'
              }`}
            >
              Login
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab('register');
                setError('');
                setFieldErrors({});
              }}
              className={`flex-1 py-3 px-2 sm:px-4 text-sm font-medium transition-all duration-300 ${
                activeTab === 'register'
                  ? 'bg-terracotta text-white rounded-tr-lg sm:rounded-tr-lg'
                  : 'text-taupe bg-transparent hover:text-espresso'
              }`}
            >
              Register
            </button>
          </div>

          {/* Form Content */}
          <div className="px-6 sm:px-10 py-6 sm:py-8">
            {error && (
              <div className="mb-6 p-4 rounded-lg bg-red-50 border-2 border-burnt-orange">
                <p className="text-sm text-espresso">{error}</p>
              </div>
            )}

            {success && activeTab === 'register' && (
              <div className="mb-6 p-4 rounded-lg bg-green-50 border-2 border-olive-green">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="w-5 h-5 text-olive-green" />
                  <p className="text-sm font-semibold text-espresso">Registration Submitted Successfully!</p>
                </div>
                <p className="text-sm text-espresso">
                  AVIS staff will review and activate your account. You'll receive a notification by email once verified.
                </p>
              </div>
            )}

            {/* Login Form */}
            {activeTab === 'login' && (
              <form onSubmit={handleLoginSubmit} className="space-y-5 transition-opacity duration-300">
                {/* First Name */}
                <div>
                  <label htmlFor="loginFirstName" className="block text-sm font-semibold text-espresso mb-2">
                    First Name <span className="text-burnt-orange">*</span>
                  </label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-mediterranean-blue" />
                    <input
                      type="text"
                      id="loginFirstName"
                      value={loginData.firstName}
                      onChange={(e) => handleLoginChange('firstName', e.target.value.toUpperCase())}
                      placeholder="Enter your first name"
                      className={`w-full pl-12 pr-4 py-4 rounded-lg border transition-all ${
                        fieldErrors.firstName
                          ? 'border-burnt-orange border-2'
                          : 'border-taupe hover:bg-cream focus:border-mediterranean-blue focus:border-2'
                      }`}
                      disabled={loading}
                      required
                    />
                  </div>
                  {fieldErrors.firstName && (
                    <p className="mt-1 text-xs text-burnt-orange">{fieldErrors.firstName}</p>
                  )}
                </div>

                {/* Last Name */}
                <div>
                  <label htmlFor="loginLastName" className="block text-sm font-semibold text-espresso mb-2">
                    Last Name <span className="text-burnt-orange">*</span>
                  </label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-mediterranean-blue" />
                    <input
                      type="text"
                      id="loginLastName"
                      value={loginData.lastName}
                      onChange={(e) => handleLoginChange('lastName', e.target.value.toUpperCase())}
                      placeholder="Enter your last name"
                      className={`w-full pl-12 pr-4 py-4 rounded-lg border transition-all ${
                        fieldErrors.lastName
                          ? 'border-burnt-orange border-2'
                          : 'border-taupe hover:bg-cream focus:border-mediterranean-blue focus:border-2'
                      }`}
                      disabled={loading}
                      required
                    />
                  </div>
                  {fieldErrors.lastName && (
                    <p className="mt-1 text-xs text-burnt-orange">{fieldErrors.lastName}</p>
                  )}
                </div>

                {/* Date of Birth */}
                <div>
                  <label htmlFor="loginDateOfBirth" className="block text-sm font-semibold text-espresso mb-2">
                    Date of Birth <span className="text-burnt-orange">*</span>
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-mediterranean-blue" />
                    <input
                      type="date"
                      id="loginDateOfBirth"
                      value={loginData.dateOfBirth}
                      onChange={(e) => handleLoginChange('dateOfBirth', e.target.value)}
                      max={maxDateString}
                      className={`w-full pl-12 pr-4 py-4 rounded-lg border transition-all ${
                        fieldErrors.dateOfBirth
                          ? 'border-burnt-orange border-2'
                          : 'border-taupe hover:bg-cream focus:border-mediterranean-blue focus:border-2'
                      }`}
                      disabled={loading}
                      required
                    />
                  </div>
                  <p className="mt-1 text-xs text-taupe">You must be at least 18 years old to donate</p>
                  {fieldErrors.dateOfBirth && (
                    <p className="mt-1 text-xs text-burnt-orange">{fieldErrors.dateOfBirth}</p>
                  )}
                </div>

                {/* Donor ID */}
                <div>
                  <label htmlFor="loginDonorId" className="block text-sm font-semibold text-espresso mb-2">
                    Donor ID <span className="text-burnt-orange">*</span>
                  </label>
                  <div className="relative">
                    <Hash className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-mediterranean-blue" />
                    <input
                      type="text"
                      id="loginDonorId"
                      value={loginData.donorId}
                      onChange={(e) => handleLoginChange('donorId', e.target.value.toUpperCase().slice(0, 5))}
                      placeholder="Enter your 5-digit alphanumeric donor ID"
                      maxLength={5}
                      className={`w-full pl-12 pr-4 py-4 rounded-lg border transition-all ${
                        fieldErrors.donorId
                          ? 'border-burnt-orange border-2'
                          : 'border-taupe hover:bg-cream focus:border-mediterranean-blue focus:border-2'
                      }`}
                      disabled={loading}
                      required
                    />
                  </div>
                  <p className="mt-1 text-xs text-taupe">Enter the 5-digit alphanumeric ID provided by AVIS</p>
                  {fieldErrors.donorId && (
                    <p className="mt-1 text-xs text-burnt-orange">{fieldErrors.donorId}</p>
                  )}
                </div>

                {/* Login Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-12 bg-terracotta text-white rounded-lg font-semibold flex items-center justify-center gap-2 hover:bg-opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
                  style={{ boxShadow: loading ? 'none' : '0 4px 12px rgba(217, 119, 87, 0.3)' }}
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin text-olive-green" />
                      <span>Logging in...</span>
                    </>
                  ) : (
                    <>
                      <span>🩸</span>
                      <span>Log In</span>
                    </>
                  )}
                </button>

                {/* Forgot ID Link */}
                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => setShowForgotModal(true)}
                    className="text-sm text-mediterranean-blue hover:underline"
                  >
                    Forgot your Donor ID?
                  </button>
                </div>

                {/* Registration Link */}
                <div className="text-center pt-2">
                  <p className="text-sm text-taupe mb-1">New to Vitalita?</p>
                  <button
                    type="button"
                    onClick={() => setActiveTab('register')}
                    className="text-sm text-mediterranean-blue hover:underline font-medium"
                  >
                    Register as a donor
                  </button>
                </div>
              </form>
            )}

            {/* Register Form */}
            {activeTab === 'register' && (
              <form onSubmit={handleRegisterSubmit} className="space-y-5 transition-opacity duration-300">
                {/* First Name */}
                <div>
                  <label htmlFor="regFirstName" className="block text-sm font-semibold text-espresso mb-2">
                    First Name <span className="text-burnt-orange">*</span>
                  </label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-mediterranean-blue" />
                    <input
                      type="text"
                      id="regFirstName"
                      value={registerData.firstName}
                      onChange={(e) => handleRegisterChange('firstName', e.target.value.toUpperCase())}
                      placeholder="Enter your first name"
                      className={`w-full pl-12 pr-4 py-4 rounded-lg border transition-all ${
                        fieldErrors.firstName
                          ? 'border-burnt-orange border-2'
                          : 'border-taupe hover:bg-cream focus:border-mediterranean-blue focus:border-2'
                      }`}
                      disabled={loading}
                      required
                    />
                  </div>
                  {fieldErrors.firstName && (
                    <p className="mt-1 text-xs text-burnt-orange">{fieldErrors.firstName}</p>
                  )}
                </div>

                {/* Last Name */}
                <div>
                  <label htmlFor="regLastName" className="block text-sm font-semibold text-espresso mb-2">
                    Last Name <span className="text-burnt-orange">*</span>
                  </label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-mediterranean-blue" />
                    <input
                      type="text"
                      id="regLastName"
                      value={registerData.lastName}
                      onChange={(e) => handleRegisterChange('lastName', e.target.value.toUpperCase())}
                      placeholder="Enter your last name"
                      className={`w-full pl-12 pr-4 py-4 rounded-lg border transition-all ${
                        fieldErrors.lastName
                          ? 'border-burnt-orange border-2'
                          : 'border-taupe hover:bg-cream focus:border-mediterranean-blue focus:border-2'
                      }`}
                      disabled={loading}
                      required
                    />
                  </div>
                  {fieldErrors.lastName && (
                    <p className="mt-1 text-xs text-burnt-orange">{fieldErrors.lastName}</p>
                  )}
                </div>

                {/* Date of Birth */}
                <div>
                  <label htmlFor="regDateOfBirth" className="block text-sm font-semibold text-espresso mb-2">
                    Date of Birth <span className="text-burnt-orange">*</span>
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-mediterranean-blue" />
                    <input
                      type="date"
                      id="regDateOfBirth"
                      value={registerData.dateOfBirth}
                      onChange={(e) => handleRegisterChange('dateOfBirth', e.target.value)}
                      max={maxDateString}
                      className={`w-full pl-12 pr-4 py-4 rounded-lg border transition-all ${
                        fieldErrors.dateOfBirth
                          ? 'border-burnt-orange border-2'
                          : 'border-taupe hover:bg-cream focus:border-mediterranean-blue focus:border-2'
                      }`}
                      disabled={loading}
                      required
                    />
                  </div>
                  <p className="mt-1 text-xs text-taupe">You must be at least 18 years old to donate</p>
                  {fieldErrors.dateOfBirth && (
                    <p className="mt-1 text-xs text-burnt-orange">{fieldErrors.dateOfBirth}</p>
                  )}
                </div>

                {/* Donor ID */}
                <div>
                  <label htmlFor="regDonorId" className="block text-sm font-semibold text-espresso mb-2">
                    Donor ID <span className="text-burnt-orange">*</span>
                  </label>
                  <div className="relative">
                    <Hash className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-mediterranean-blue" />
                    <input
                      type="text"
                      id="regDonorId"
                      value={registerData.donorId}
                      onChange={(e) => handleRegisterChange('donorId', e.target.value.toUpperCase().slice(0, 5))}
                      placeholder="Enter your 5-digit alphanumeric donor ID"
                      maxLength={5}
                      className={`w-full pl-12 pr-4 py-4 rounded-lg border transition-all ${
                        fieldErrors.donorId
                          ? 'border-burnt-orange border-2'
                          : 'border-taupe hover:bg-cream focus:border-mediterranean-blue focus:border-2'
                      }`}
                      disabled={loading}
                      required
                    />
                  </div>
                  <p className="mt-1 text-xs text-taupe">Enter the 5-digit alphanumeric ID provided by AVIS</p>
                  {fieldErrors.donorId && (
                    <p className="mt-1 text-xs text-burnt-orange">{fieldErrors.donorId}</p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label htmlFor="regEmail" className="block text-sm font-semibold text-espresso mb-2">
                    Email Address <span className="text-burnt-orange">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-mediterranean-blue" />
                    <input
                      type="email"
                      id="regEmail"
                      value={registerData.email}
                      onChange={(e) => handleRegisterChange('email', e.target.value)}
                      placeholder="Enter your email address"
                      className={`w-full pl-12 pr-4 py-4 rounded-lg border transition-all ${
                        fieldErrors.email
                          ? 'border-burnt-orange border-2'
                          : 'border-taupe hover:bg-cream focus:border-mediterranean-blue focus:border-2'
                      }`}
                      disabled={loading}
                      required
                    />
                  </div>
                  <p className="mt-1 text-xs text-taupe">We'll send a verification email to this address</p>
                  {fieldErrors.email && (
                    <p className="mt-1 text-xs text-burnt-orange">{fieldErrors.email}</p>
                  )}
                </div>

                {/* Privacy & Security Notice */}
                <div className="p-4 rounded-lg bg-cream border-l-4 border-mediterranean-blue">
                  <div className="flex gap-3">
                    <Shield className="w-5 h-5 text-mediterranean-blue flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-espresso">
                      Your personal information will be securely handled and the original data will not be stored. This ensures GDPR compliance while maintaining secure authentication.
                    </p>
                  </div>
                </div>

                {/* Important Notice */}
                <div className="p-4 rounded-lg bg-cream border-l-4 border-burnt-orange">
                  <div className="flex gap-3 mb-3">
                    <AlertCircle className="w-5 h-5 text-burnt-orange flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-espresso mb-2">Before You Continue</p>
                      <ul className="text-xs text-taupe space-y-1 list-disc list-inside mb-3">
                        <li>Double-check details before submitting—they cannot be changed once submitted</li>
                      </ul>
                      <p className="text-xs font-semibold text-espresso mb-2">Verification Process:</p>
                      <ol className="text-xs text-taupe space-y-1 list-decimal list-inside">
                        <li>Submit registration form</li>
                        <li>AVIS staff will review and activate your account</li>
                        <li>The process takes about 2-5 days</li>
                        <li>Once verified, you'll receive a notification by email</li>
                        <li>You can then verify your email and create a 5-digit PIN to log into the system</li>
                      </ol>
                    </div>
                  </div>
                </div>

                {/* Register Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-12 bg-mediterranean-blue text-white rounded-lg font-semibold flex items-center justify-center gap-2 hover:bg-opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
                  style={{ boxShadow: loading ? 'none' : '0 4px 12px rgba(91, 155, 213, 0.3)' }}
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin text-olive-green" />
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <>
                      <span>📋</span>
                      <span>Submit Registration</span>
                    </>
                  )}
                </button>

                {/* Back to Login */}
                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={() => setActiveTab('login')}
                    className="text-sm text-terracotta hover:underline font-medium"
                  >
                    Already have an account? Log in
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Trust Indicators */}
          <div className="px-6 sm:px-10 py-4 sm:py-6 border-t border-taupe/20 bg-cream/30">
            <div className="flex flex-wrap justify-center gap-3 sm:gap-4 text-xs text-taupe">
              <div className="flex items-center gap-1.5">
                <Shield className="w-4 h-4 text-mediterranean-blue" />
                <span>GDPR Compliant</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-mediterranean-blue" />
                <span>Verified by AVIS</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Lock className="w-4 h-4 text-mediterranean-blue" />
                <span>SSL Encrypted</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Forgot ID Modal (Placeholder) */}
      {showForgotModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-espresso mb-4">Forgot Your Donor ID?</h3>
            <p className="text-sm text-taupe mb-6">
              Please contact AVIS directly to retrieve your Donor ID. This feature will be available soon.
            </p>
            <button
              onClick={() => setShowForgotModal(false)}
              className="w-full py-3 bg-terracotta text-white rounded-lg font-semibold hover:bg-opacity-90 transition-all"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DonorAuth;

