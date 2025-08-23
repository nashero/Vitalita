import React, { useState, useEffect } from 'react';
import { 
  validateDonorCredentials, 
  sanitizeInput, 
  AVIS_CENTERS,
  validateBrowserCompatibility 
} from '../../utils/validation';
import { 
  storeCredentials, 
  retrieveCredentials, 
  hasValidCredentials,
  clearCredentials 
} from '../../utils/secureStorage';
import { authenticateDevice, isDeviceAuthenticated } from '../../utils/deviceAuth';
import { DonorCredentials } from '../../utils/encryption';

interface CredentialFormProps {
  onCredentialsStored?: (credentials: DonorCredentials) => void;
  onCredentialsRetrieved?: (credentials: DonorCredentials) => void;
  showPrivacyNotice?: boolean;
  className?: string;
}

export const CredentialForm: React.FC<CredentialFormProps> = ({
  onCredentialsStored,
  onCredentialsRetrieved,
  showPrivacyNotice = true,
  className = ''
}) => {
  const [formData, setFormData] = useState<DonorCredentials>({
    firstName: '',
    lastName: '',
    avisCenter: '',
    donorId: ''
  });

  const [errors, setErrors] = useState<string[]>([]);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isStoring, setIsStoring] = useState(false);
  const [isRetrieving, setIsRetrieving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [browserCompatibility, setBrowserCompatibility] = useState<{
    isCompatible: boolean;
    issues: string[];
  } | null>(null);
  const [deviceAuthStatus, setDeviceAuthStatus] = useState<{
    isAuthenticated: boolean;
    deviceInfo: string;
  } | null>(null);

  // Check browser compatibility and device authentication on mount
  useEffect(() => {
    const checkCompatibility = () => {
      const compatibility = validateBrowserCompatibility();
      setBrowserCompatibility(compatibility);
      
      if (compatibility.isCompatible) {
        checkDeviceAuth();
        checkExistingCredentials();
      }
    };

    checkCompatibility();
  }, []);

  const checkDeviceAuth = async () => {
    try {
      const isAuth = await isDeviceAuthenticated();
      if (isAuth) {
        const deviceInfo = await authenticateDevice();
        setDeviceAuthStatus({
          isAuthenticated: true,
          deviceInfo: `${deviceInfo.platform} - ${deviceInfo.screenResolution}`
        });
      } else {
        setDeviceAuthStatus({
          isAuthenticated: false,
          deviceInfo: 'Not authenticated'
        });
      }
    } catch (error) {
      console.error('Device auth check failed:', error);
      setDeviceAuthStatus({
        isAuthenticated: false,
        deviceInfo: 'Authentication failed'
      });
    }
  };

  const checkExistingCredentials = async () => {
    try {
      const hasCredentials = await hasValidCredentials();
      if (hasCredentials) {
        setSuccessMessage('You have stored credentials on this device');
      }
    } catch (error) {
      console.error('Failed to check existing credentials:', error);
    }
  };

  const handleInputChange = (field: keyof DonorCredentials, value: string) => {
    const sanitizedValue = sanitizeInput(value, 
      field === 'firstName' || field === 'lastName' ? 'name' : 
      field === 'donorId' ? 'donorId' : 'general'
    );

    setFormData(prev => ({ ...prev, [field]: sanitizedValue }));
    
    // Clear errors when user starts typing
    if (errors.length > 0) {
      setErrors([]);
      setWarnings([]);
    }
    
    // Clear success message
    if (successMessage) {
      setSuccessMessage('');
    }
  };

  const validateForm = (): boolean => {
    const validation = validateDonorCredentials(formData);
    setErrors(validation.errors);
    setWarnings(validation.warnings);
    return validation.isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsStoring(true);
    setErrors([]);
    setWarnings([]);
    setSuccessMessage('');

    try {
      // Ensure device is authenticated
      await authenticateDevice();
      
      // Store credentials securely
      const success = await storeCredentials(formData);
      
      if (success) {
        setSuccessMessage('Your credentials have been stored securely on this device');
        onCredentialsStored?.(formData);
        
        // Clear form after successful storage
        setFormData({
          firstName: '',
          lastName: '',
          avisCenter: '',
          donorId: ''
        });
      } else {
        setErrors(['Failed to store credentials securely. Please try again.']);
      }
    } catch (error) {
      console.error('Failed to store credentials:', error);
      setErrors([`Storage failed: ${error instanceof Error ? error.message : 'Unknown error'}`]);
    } finally {
      setIsStoring(false);
    }
  };

  const handleRetrieveCredentials = async () => {
    setIsRetrieving(true);
    setErrors([]);
    setWarnings([]);
    setSuccessMessage('');

    try {
      const credentials = await retrieveCredentials();
      
      if (credentials) {
        setFormData(credentials);
        setSuccessMessage('Your stored credentials have been retrieved');
        onCredentialsRetrieved?.(credentials);
      } else {
        setErrors(['No stored credentials found on this device']);
      }
    } catch (error) {
      console.error('Failed to retrieve credentials:', error);
      setErrors([`Retrieval failed: ${error instanceof Error ? error.message : 'Unknown error'}`]);
    } finally {
      setIsRetrieving(false);
    }
  };

  const handleClearCredentials = async () => {
    try {
      clearCredentials();
      setSuccessMessage('Your stored credentials have been cleared');
      setFormData({
        firstName: '',
        lastName: '',
        avisCenter: '',
        donorId: ''
      });
    } catch (error) {
      console.error('Failed to clear credentials:', error);
      setErrors(['Failed to clear credentials']);
    }
  };

  // Show browser compatibility warning
  if (browserCompatibility && !browserCompatibility.isCompatible) {
    return (
      <div className={`bg-yellow-50 border border-yellow-200 rounded-lg p-6 ${className}`}>
        <div className="flex items-center mb-4">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-yellow-800">
              Browser Compatibility Issues
            </h3>
          </div>
        </div>
        <div className="text-sm text-yellow-700">
          <ul className="list-disc pl-5 space-y-1">
            {browserCompatibility.issues.map((issue, index) => (
              <li key={index}>{issue}</li>
            ))}
          </ul>
          <p className="mt-3">
            Please use a modern browser with Web Crypto API support to securely store your credentials.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow-lg p-6 ${className}`}>
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Secure Donor Credentials
        </h2>
        <p className="text-gray-600">
          Store your donor information securely on this device only. Your data is encrypted and never sent to our servers.
        </p>
      </div>

      {/* Device Authentication Status */}
      {deviceAuthStatus && (
        <div className={`mb-4 p-3 rounded-md ${
          deviceAuthStatus.isAuthenticated 
            ? 'bg-green-50 border border-green-200' 
            : 'bg-blue-50 border border-blue-200'
        }`}>
          <div className="flex items-center">
            <div className="flex-shrink-0">
              {deviceAuthStatus.isAuthenticated ? (
                <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              )}
            </div>
            <div className="ml-3">
              <p className={`text-sm font-medium ${
                deviceAuthStatus.isAuthenticated ? 'text-green-800' : 'text-blue-800'
              }`}>
                {deviceAuthStatus.isAuthenticated ? 'Device Authenticated' : 'Device Authentication Required'}
              </p>
              <p className={`text-xs ${
                deviceAuthStatus.isAuthenticated ? 'text-green-700' : 'text-blue-700'
              }`}>
                {deviceAuthStatus.deviceInfo}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Success Message */}
      {successMessage && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-green-800">{successMessage}</p>
            </div>
          </div>
        </div>
      )}

      {/* Error Messages */}
      {errors.length > 0 && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <ul className="text-sm text-red-800 space-y-1">
                {errors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Warning Messages */}
      {warnings.length > 0 && (
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <ul className="text-sm text-yellow-700 space-y-1">
                {warnings.map((warning, index) => (
                  <li key={index}>{warning}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="mb-6 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={handleRetrieveCredentials}
          disabled={isRetrieving || isLoading}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isRetrieving ? 'Retrieving...' : 'Retrieve Stored Credentials'}
        </button>
        
        <button
          type="button"
          onClick={handleClearCredentials}
          disabled={isLoading}
          className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Clear Stored Credentials
        </button>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* First Name */}
          <div>
            <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
              First Name *
            </label>
            <input
              type="text"
              id="firstName"
              value={formData.firstName}
              onChange={(e) => handleInputChange('firstName', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter your first name"
              required
              minLength={2}
              maxLength={50}
            />
          </div>

          {/* Last Name */}
          <div>
            <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
              Last Name *
            </label>
            <input
              type="text"
              id="lastName"
              value={formData.lastName}
              onChange={(e) => handleInputChange('lastName', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter your last name"
              required
              minLength={2}
              maxLength={50}
            />
          </div>
        </div>

        {/* AVIS Center */}
        <div>
          <label htmlFor="avisCenter" className="block text-sm font-medium text-gray-700 mb-1">
            AVIS Center *
          </label>
          <select
            id="avisCenter"
            value={formData.avisCenter}
            onChange={(e) => handleInputChange('avisCenter', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          >
            <option value="">Select an AVIS center</option>
            {AVIS_CENTERS.map((center) => (
              <option key={center} value={center}>
                {center}
              </option>
            ))}
          </select>
        </div>

        {/* Donor ID */}
        <div>
          <label htmlFor="donorId" className="block text-sm font-medium text-gray-700 mb-1">
            Donor ID *
          </label>
          <input
            type="text"
            id="donorId"
            value={formData.donorId}
            onChange={(e) => handleInputChange('donorId', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter your donor ID"
            required
            minLength={3}
            maxLength={20}
          />
        </div>

        {/* Submit Button */}
        <div className="pt-4">
          <button
            type="submit"
            disabled={isStoring || isLoading}
            className="w-full px-6 py-3 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isStoring ? 'Storing Credentials Securely...' : 'Store Credentials Securely'}
          </button>
        </div>
      </form>

      {/* Privacy Notice */}
      {showPrivacyNotice && (
        <div className="mt-6 p-4 bg-gray-50 rounded-md">
          <h3 className="text-sm font-medium text-gray-900 mb-2">Privacy & Security</h3>
          <ul className="text-xs text-gray-600 space-y-1">
            <li>• Your credentials are encrypted using AES-256-GCM encryption</li>
            <li>• Data is stored locally on this device only - never sent to our servers</li>
            <li>• Device authentication ensures only you can access your stored data</li>
            <li>• Data automatically expires after 7 days for security</li>
            <li>• You can clear stored data at any time</li>
          </ul>
        </div>
      )}
    </div>
  );
};
