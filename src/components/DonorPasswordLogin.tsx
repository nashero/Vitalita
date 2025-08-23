import React, { useState, useEffect } from 'react';
import { 
  Lock, 
  User, 
  Eye, 
  EyeOff, 
  AlertCircle, 
  CheckCircle,
  Loader,
  ArrowLeft,
  Shield,
  Smartphone,
  Key,
  Hash,
  ToggleLeft,
  ToggleRight
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { generateSHA256Hash } from '../utils/crypto';
import { getDeviceDisplayInfo, isPasswordCached } from '../utils/deviceUtils';

interface DonorPasswordLoginProps {
  onBack: () => void;
  onSuccess: () => void;
  onBackToLanding?: () => void;
}

interface LoginFormData {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  avisDonorCenter: string;
  password: string;
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

export default function DonorPasswordLogin({ onBack, onSuccess, onBackToLanding }: DonorPasswordLoginProps) {
  const { loginWithPassword, isPasswordSet, setPassword } = useAuth();
  
  const [formData, setFormData] = useState<LoginFormData>({
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    avisDonorCenter: '',
    password: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [authMethod, setAuthMethod] = useState<'hash' | 'password'>('hash');
  const [step, setStep] = useState<'login' | 'set-password'>('login');
  const [donorHashId, setDonorHashId] = useState<string>('');
  const [passwordCached, setPasswordCached] = useState(false);

  const handleInputChange = (field: keyof LoginFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError('');
  };

  const validateForm = (): string | null => {
    if (!formData.firstName.trim()) return 'First name is required';
    if (!formData.lastName.trim()) return 'Last name is required';
    if (!formData.dateOfBirth) return 'Date of birth is required';
    if (!formData.avisDonorCenter) return 'AVIS Donor Center is required';
    
    if (authMethod === 'password') {
      if (step === 'set-password') {
        if (!formData.password) return 'Password is required';
        if (formData.password.length < 8) return 'Password must be at least 8 characters long';
        if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
          return 'Password must contain at least one lowercase letter, one uppercase letter, and one number';
        }
      } else if (step === 'login') {
        if (!formData.password) return 'Password is required';
      }
    }
    
    return null;
  };

  const handleHashBasedLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setLoading(true);
      setError('');

      // Generate donor hash ID from personal information
      const authString = `${formData.firstName}${formData.lastName}${formData.dateOfBirth}${formData.avisDonorCenter}`;
      const donorHashId = await generateSHA256Hash(authString);
      setDonorHashId(donorHashId);

      // For hash-based login, we don't need password verification
      // The hash itself serves as authentication
      setSuccess('Hash-based authentication successful! Redirecting to dashboard...');
      setTimeout(() => {
        onSuccess();
      }, 1500);

    } catch (err) {
      console.error('Hash-based login error:', err);
      setError('An error occurred during authentication. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setLoading(true);
      setError('');

      // Generate donor hash ID from personal information
      const authString = `${formData.firstName}${formData.lastName}${formData.dateOfBirth}${formData.avisDonorCenter}`;
      const donorHashId = await generateSHA256Hash(authString);
      setDonorHashId(donorHashId);

      // Check if password is already set for this donor
      const hasPassword = await isPasswordSet(donorHashId);
      
      if (!hasPassword) {
        // No password set, move to password setup step
        setStep('set-password');
        setLoading(false);
        return;
      }

      // Check if password is cached for this device
      const isCached = isPasswordCached(donorHashId);
      setPasswordCached(isCached);

      // Password exists, proceed with login
      const result = await loginWithPassword({
        donorHashId,
        password: formData.password
      });

      if (result.success) {
        setSuccess('Password authentication successful! Redirecting to dashboard...');
        setTimeout(() => {
          onSuccess();
        }, 1500);
      } else {
        setError(result.error || 'Password authentication failed. Please try again.');
      }
    } catch (err) {
      console.error('Password login error:', err);
      setError('An error occurred during password authentication. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setLoading(true);
      setError('');

      const result = await setPassword(donorHashId, formData.password);

      if (result.success) {
        setSuccess('Password set successfully! Now logging you in...');
        
        // Automatically login with the new password
        setTimeout(async () => {
          const loginResult = await loginWithPassword({
            donorHashId,
            password: formData.password
          });

          if (loginResult.success) {
            setSuccess('Login successful! Redirecting to dashboard...');
            setTimeout(() => {
              onSuccess();
            }, 1500);
          } else {
            setError(loginResult.error || 'Auto-login failed. Please try logging in manually.');
          }
        }, 1000);
      } else {
        setError(result.error || 'Failed to set password. Please try again.');
      }
    } catch (err) {
      console.error('Set password error:', err);
      setError('An error occurred while setting password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleBackToLogin = () => {
    setStep('login');
    setFormData(prev => ({ ...prev, password: '' }));
    setError('');
    setSuccess('');
  };

  const handleAuthMethodChange = (method: 'hash' | 'password') => {
    setAuthMethod(method);
    setStep('login');
    setFormData(prev => ({ ...prev, password: '' }));
    setError('');
    setSuccess('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    if (authMethod === 'hash') {
      handleHashBasedLogin(e);
    } else {
      if (step === 'set-password') {
        handleSetPassword(e);
      } else {
        handlePasswordLogin(e);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-pink-50 p-4">
      {/* Back to Home Button - Outside the main card */}
      {onBackToLanding && (
        <div className="max-w-2xl mx-auto mb-4">
          <button
            onClick={onBackToLanding}
            className="flex items-center text-gray-600 hover:text-gray-800 transition-colors text-sm font-medium"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </button>
        </div>
      )}
      
      <div className="w-full max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-red-600 to-red-700 px-8 py-6">
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <div className="bg-white/20 p-3 rounded-full">
                  <Lock className="w-8 h-8 text-white" />
                </div>
              </div>
              <h1 className="text-2xl font-bold text-white">
                {step === 'login' ? 'Donor Login' : 'Set Your Password'}
              </h1>
              <p className="text-red-100 text-sm mt-1">
                {step === 'login' 
                  ? 'Choose your authentication method' 
                  : 'Create a secure password for your account'
                }
              </p>
              {step === 'set-password' && (
                <div className="flex items-center justify-center mt-2">
                  <div className="bg-white/20 px-3 py-1 rounded-full">
                    <span className="text-white text-xs font-medium">First Time Setup</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Form */}
          <div className="px-8 py-8">
            {success && (
              <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-600 mr-3 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-green-800 font-medium mb-2">Success!</p>
                    <div className="text-green-700 text-sm">{success}</div>
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
                {/* Authentication Method Selection */}
                {step === 'login' && (
                  <div className="mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center">
                        <Shield className="w-5 h-5 text-blue-600 mr-2" />
                        <span className="font-medium text-blue-900">Choose Authentication Method</span>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() => handleAuthMethodChange('hash')}
                        className={`p-3 rounded-lg border-2 transition-all ${
                          authMethod === 'hash'
                            ? 'border-blue-500 bg-blue-100 text-blue-900'
                            : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-center justify-center mb-2">
                          <Hash className="w-5 h-5" />
                        </div>
                        <div className="text-sm font-medium">Hash-based</div>
                        <div className="text-xs opacity-75">Personal info only</div>
                      </button>
                      
                      <button
                        onClick={() => handleAuthMethodChange('password')}
                        className={`p-3 rounded-lg border-2 transition-all ${
                          authMethod === 'password'
                            ? 'border-blue-500 bg-blue-100 text-blue-900'
                            : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-center justify-center mb-2">
                          <Key className="w-5 h-5" />
                        </div>
                        <div className="text-sm font-medium">Password</div>
                        <div className="text-xs opacity-75">Personal info + password</div>
                      </button>
                    </div>
                  </div>
                )}

                {/* Security Notice */}
                <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start">
                    <Shield className="w-5 h-5 text-blue-600 mt-0.5 mr-3" />
                    <div className="text-sm text-blue-800">
                      <p className="font-medium mb-1">Enhanced Security:</p>
                      <p>
                        {authMethod === 'hash' 
                          ? 'Hash-based authentication uses your personal information to create a unique identifier. No password required.'
                          : 'Password authentication adds an extra layer of security with device-specific encryption.'
                        }
                      </p>
                    </div>
                  </div>
                </div>

                {/* Device Information */}
                <div className="mb-6 bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start">
                    <Smartphone className="w-5 h-5 text-gray-600 mt-0.5 mr-3" />
                    <div className="text-sm text-gray-700">
                      <p className="font-medium mb-1">Current Device:</p>
                      <p className="font-mono text-xs">{getDeviceDisplayInfo()}</p>
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
                    <input
                      type="date"
                      id="dateOfBirth"
                      value={formData.dateOfBirth}
                      onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                      className="block w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors duration-200"
                      disabled={loading}
                      required
                      max={new Date(new Date().setFullYear(new Date().getFullYear() - 18)).toISOString().split('T')[0]}
                    />
                  </div>

                  {/* AVIS Donor Center */}
                  <div>
                    <label htmlFor="avisDonorCenter" className="block text-sm font-semibold text-gray-700 mb-2">
                      AVIS Donor Center *
                    </label>
                    <select
                      id="avisDonorCenter"
                      value={formData.avisDonorCenter}
                      onChange={(e) => handleInputChange('avisDonorCenter', e.target.value)}
                      className="block w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors duration-200 appearance-none bg-white"
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

                  {/* Password Field - Only show for password authentication */}
                  {authMethod === 'password' && (
                    <>
                      {/* Password Field for Password Setup */}
                      {step === 'set-password' && (
                        <div>
                          <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                            Create Password *
                          </label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <Lock className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                              type={showPassword ? 'text' : 'password'}
                              id="password"
                              value={formData.password}
                              onChange={(e) => handleInputChange('password', e.target.value)}
                              className="block w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors duration-200"
                              placeholder="Create a secure password"
                              disabled={loading}
                              required
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute inset-y-0 right-0 pr-3 flex items-center"
                            >
                              {showPassword ? (
                                <EyeOff className="h-5 w-5 text-gray-400" />
                              ) : (
                                <Eye className="h-5 w-5 text-gray-400" />
                              )}
                            </button>
                          </div>
                          <div className="mt-2 text-xs text-gray-600">
                            Password must be at least 8 characters with uppercase, lowercase, and number
                          </div>
                        </div>
                      )}

                      {/* Password Field for Login */}
                      {step === 'login' && (
                        <div>
                          <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                            Password *
                          </label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <Lock className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                              type={showPassword ? 'text' : 'password'}
                              id="password"
                              value={formData.password}
                              onChange={(e) => handleInputChange('password', e.target.value)}
                              className="block w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors duration-200"
                              placeholder="Enter your password"
                              disabled={loading}
                              required
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute inset-y-0 right-0 pr-3 flex items-center"
                            >
                              {showPassword ? (
                                <EyeOff className="h-5 w-5 text-gray-400" />
                              ) : (
                                <Eye className="h-5 w-5 text-gray-400" />
                              )}
                            </button>
                          </div>
                        </div>
                      )}
                    </>
                  )}

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-3">
                    {step === 'set-password' && (
                      <button
                        type="button"
                        onClick={handleBackToLogin}
                        className="flex-1 bg-gray-600 text-white px-4 py-3 rounded-lg hover:bg-gray-700 transition-colors text-sm font-medium"
                        disabled={loading}
                      >
                        <ArrowLeft className="w-4 h-4 mr-2 inline" />
                        Back to Login
                      </button>
                    )}
                    
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 bg-gradient-to-r from-red-600 to-red-700 text-white py-3 px-4 rounded-lg font-semibold hover:from-red-700 hover:to-red-800 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
                    >
                      {loading ? (
                        <div className="flex items-center justify-center">
                          <Loader className="w-5 h-5 animate-spin mr-2" />
                          {step === 'login' 
                            ? (authMethod === 'hash' ? 'Authenticating...' : 'Logging In...')
                            : 'Setting Password...'
                          }
                        </div>
                      ) : (
                        <div className="flex items-center justify-center">
                          {authMethod === 'hash' ? (
                            <>
                              <Hash className="w-5 h-5 mr-2" />
                              Authenticate
                            </>
                          ) : (
                            <>
                              <Lock className="w-5 h-5 mr-2" />
                              {step === 'login' ? 'Login' : 'Set Password & Login'}
                            </>
                          )}
                        </div>
                      )}
                    </button>
                  </div>
                </form>

                {/* Additional Options */}
                <div className="mt-6 pt-6 border-t border-gray-100">
                  <div className="text-center">
                    <button
                      onClick={onBack}
                      className="text-gray-600 hover:text-gray-800 transition-colors text-sm font-medium"
                    >
                      Don't have an account? Register here
                    </button>
                  </div>
                </div>

                {/* Security Notice */}
                <div className="mt-6 pt-6 border-t border-gray-100">
                  <div className="flex items-center justify-center text-xs text-gray-500">
                    <Shield className="w-3 h-3 mr-1" />
                    {authMethod === 'hash' 
                      ? 'Hash-based authentication • No password required • Secure personal verification'
                      : 'Device-specific encryption • Session management • Secure authentication'
                    }
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
