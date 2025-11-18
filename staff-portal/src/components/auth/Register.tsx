/**
 * Registration component for staff portal
 */

import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '../../contexts/AuthContext';
import { validateEmail, validatePassword, validatePhone, validateRequired } from '../../utils/validation';
import { Loader2, Mail, Lock, User, Phone, Building } from 'lucide-react';
import apiClient from '../../lib/api';

interface RegisterFormData {
  email: string;
  password: string;
  confirmPassword: string;
  first_name: string;
  last_name: string;
  phone_number?: string;
  avis_center_id: string;
  organizational_level: 'National' | 'Regional' | 'Provincial' | 'Municipal';
}

interface AVISCenter {
  center_id: string;
  center_code: string;
  name: string;
  center_type: string;
}

export default function Register() {
  const navigate = useNavigate();
  const { register: registerUser, loading } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [centers, setCenters] = useState<AVISCenter[]>([]);
  const [loadingCenters, setLoadingCenters] = useState(true);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>();

  const password = watch('password');

  // Load AVIS centers
  useEffect(() => {
    const loadCenters = async () => {
      try {
        console.log('Loading AVIS centers from /api/staff/public/centers');
        const response = await apiClient.get('/api/staff/public/centers');
        console.log('Centers API response:', response.data);
        
        if (response.data.success) {
          const centersData = response.data.data?.centers || [];
          console.log('Centers loaded:', centersData.length, centersData);
          setCenters(centersData);
        } else {
          console.error('API returned success=false:', response.data);
        }
      } catch (error: any) {
        console.error('Failed to load centers:', error);
        console.error('Error response:', error.response?.data);
        console.error('Error status:', error.response?.status);
        console.error('Error message:', error.message);
        
        // Show user-friendly error
        if (error.response?.status === 401) {
          console.warn('Got 401 - endpoint might require auth, but it should be public');
        }
      } finally {
        setLoadingCenters(false);
      }
    };

    loadCenters();
  }, []);

  const onSubmit = async (data: RegisterFormData) => {
    const { confirmPassword, ...registerData } = data;

    const result = await registerUser(registerData);

    if (result.success) {
      setSuccess(true);
      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate('/login', { replace: true });
      }, 3000);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-red-100 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
              <svg
                className="h-6 w-6 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Registration Successful!</h2>
            <p className="text-gray-600 mb-4">
              Your registration has been submitted and is pending approval from your center administrator.
            </p>
            <p className="text-sm text-gray-500">
              You will receive an email once your account has been approved. Redirecting to login...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-red-100 px-4 sm:px-6 lg:px-8 py-12">
      <div className="max-w-2xl w-full space-y-8">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Staff Registration</h2>
            <p className="text-gray-600">Create your staff portal account</p>
          </div>

          {/* Registration Form */}
          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)} noValidate>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* First Name */}
              <div>
                <label htmlFor="first_name" className="block text-sm font-medium text-gray-700 mb-1">
                  First Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" aria-hidden="true" />
                  </div>
                  <input
                    id="first_name"
                    type="text"
                    autoComplete="given-name"
                    className={`block w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 ${
                      errors.first_name ? 'border-red-300' : 'border-gray-300'
                    }`}
                    aria-invalid={errors.first_name ? 'true' : 'false'}
                    {...register('first_name', {
                      required: 'First name is required',
                      validate: (value) => validateRequired(value) || 'First name is required',
                    })}
                  />
                </div>
                {errors.first_name && (
                  <p className="mt-1 text-sm text-red-600" role="alert">
                    {errors.first_name.message}
                  </p>
                )}
              </div>

              {/* Last Name */}
              <div>
                <label htmlFor="last_name" className="block text-sm font-medium text-gray-700 mb-1">
                  Last Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" aria-hidden="true" />
                  </div>
                  <input
                    id="last_name"
                    type="text"
                    autoComplete="family-name"
                    className={`block w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 ${
                      errors.last_name ? 'border-red-300' : 'border-gray-300'
                    }`}
                    aria-invalid={errors.last_name ? 'true' : 'false'}
                    {...register('last_name', {
                      required: 'Last name is required',
                      validate: (value) => validateRequired(value) || 'Last name is required',
                    })}
                  />
                </div>
                {errors.last_name && (
                  <p className="mt-1 text-sm text-red-600" role="alert">
                    {errors.last_name.message}
                  </p>
                )}
              </div>
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email Address <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" aria-hidden="true" />
                </div>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  className={`block w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 ${
                    errors.email ? 'border-red-300' : 'border-gray-300'
                  }`}
                  aria-invalid={errors.email ? 'true' : 'false'}
                  {...register('email', {
                    required: 'Email is required',
                    validate: (value) => validateEmail(value) || 'Please enter a valid email address',
                  })}
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-sm text-red-600" role="alert">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Phone Number */}
            <div>
              <label htmlFor="phone_number" className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number <span className="text-gray-400">(Optional)</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Phone className="h-5 w-5 text-gray-400" aria-hidden="true" />
                </div>
                <input
                  id="phone_number"
                  type="tel"
                  autoComplete="tel"
                  className={`block w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 ${
                    errors.phone_number ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="+39 123 456 7890"
                  aria-invalid={errors.phone_number ? 'true' : 'false'}
                  {...register('phone_number', {
                    validate: (value) =>
                      !value || validatePhone(value) || 'Please enter a valid phone number',
                  })}
                />
              </div>
              {errors.phone_number && (
                <p className="mt-1 text-sm text-red-600" role="alert">
                  {errors.phone_number.message}
                </p>
              )}
            </div>

            {/* AVIS Center */}
            <div>
              <label htmlFor="avis_center_id" className="block text-sm font-medium text-gray-700 mb-1">
                AVIS Center <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Building className="h-5 w-5 text-gray-400" aria-hidden="true" />
                </div>
                <select
                  id="avis_center_id"
                  className={`block w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 ${
                    errors.avis_center_id ? 'border-red-300' : 'border-gray-300'
                  }`}
                  aria-invalid={errors.avis_center_id ? 'true' : 'false'}
                  disabled={loadingCenters}
                  {...register('avis_center_id', {
                    required: 'Please select an AVIS center',
                  })}
                >
                  <option value="">
                    {loadingCenters ? 'Loading centers...' : 'Select a center...'}
                  </option>
                  {centers.length === 0 && !loadingCenters ? (
                    <option value="" disabled>
                      No centers available
                    </option>
                  ) : (
                    centers.map((center) => (
                      <option key={center.center_id} value={center.center_code}>
                        {center.name}
                      </option>
                    ))
                  )}
                </select>
              </div>
              {errors.avis_center_id && (
                <p className="mt-1 text-sm text-red-600" role="alert">
                  {errors.avis_center_id.message}
                </p>
              )}
            </div>

            {/* Organizational Level */}
            <div>
              <label htmlFor="organizational_level" className="block text-sm font-medium text-gray-700 mb-1">
                Organizational Level <span className="text-red-500">*</span>
              </label>
              <select
                id="organizational_level"
                className={`block w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 ${
                  errors.organizational_level ? 'border-red-300' : 'border-gray-300'
                }`}
                aria-invalid={errors.organizational_level ? 'true' : 'false'}
                {...register('organizational_level', {
                  required: 'Please select your organizational level',
                })}
              >
                <option value="">Select level...</option>
                <option value="National">National</option>
                <option value="Regional">Regional</option>
                <option value="Provincial">Provincial</option>
                <option value="Municipal">Municipal</option>
              </select>
              {errors.organizational_level && (
                <p className="mt-1 text-sm text-red-600" role="alert">
                  {errors.organizational_level.message}
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" aria-hidden="true" />
                </div>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  className={`block w-full pl-10 pr-10 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 ${
                    errors.password ? 'border-red-300' : 'border-gray-300'
                  }`}
                  aria-invalid={errors.password ? 'true' : 'false'}
                  {...register('password', {
                    required: 'Password is required',
                    validate: (value) => {
                      const validation = validatePassword(value);
                      return validation.isValid || validation.errors[0];
                    },
                  })}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <Lock className="h-5 w-5 text-gray-400" aria-hidden="true" />
                  ) : (
                    <Lock className="h-5 w-5 text-gray-400" aria-hidden="true" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-600" role="alert">
                  {errors.password.message}
                </p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                Must be at least 8 characters with uppercase, lowercase, number, and special character
              </p>
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                Confirm Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" aria-hidden="true" />
                </div>
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  className={`block w-full pl-10 pr-10 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 ${
                    errors.confirmPassword ? 'border-red-300' : 'border-gray-300'
                  }`}
                  aria-invalid={errors.confirmPassword ? 'true' : 'false'}
                  {...register('confirmPassword', {
                    required: 'Please confirm your password',
                    validate: (value) => value === password || 'Passwords do not match',
                  })}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                >
                  {showConfirmPassword ? (
                    <Lock className="h-5 w-5 text-gray-400" aria-hidden="true" />
                  ) : (
                    <Lock className="h-5 w-5 text-gray-400" aria-hidden="true" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600" role="alert">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting || loading || loadingCenters}
              className="w-full flex justify-center items-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting || loading ? (
                <>
                  <Loader2 className="animate-spin -ml-1 mr-2 h-5 w-5" aria-hidden="true" />
                  Registering...
                </>
              ) : (
                'Register'
              )}
            </button>

            {/* Login Link */}
            <div className="text-center">
              <p className="text-sm text-gray-600">
                Already have an account?{' '}
                <Link
                  to="/login"
                  className="font-medium text-red-600 hover:text-red-500 focus:outline-none focus:underline"
                >
                  Sign in here
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

