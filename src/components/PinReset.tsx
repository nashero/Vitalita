/**
 * PIN Reset Component
 * 
 * This component handles PIN reset through identity verification
 * using First Name, Last Name, DOB, and Donor ID.
 */

import React, { useState, useEffect } from 'react';
import { usePinAuth } from '../hooks/usePinAuth';
import { validateDonorCredentials } from '../utils/validation';
import { User, Calendar, Hash, AlertCircle, CheckCircle, Shield } from 'lucide-react';

interface PinResetFormData {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  donorId: string;
}

interface PinResetProps {
  onSuccess?: () => void;
  onCancel?: () => void;
  className?: string;
}

export default function PinReset({ 
  onSuccess, 
  onCancel, 
  className = '' 
}: PinResetProps) {
  const { resetPin, isLoading, error, clearError, hasCachedCredentials } = usePinAuth();
  const [step, setStep] = useState<'verify' | 'success'>('verify');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [formData, setFormData] = useState<PinResetFormData>({
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    donorId: ''
  });
  const [fieldErrors, setFieldErrors] = useState<Partial<PinResetFormData>>({});

  // Clear errors when component mounts
  useEffect(() => {
    clearError();
  }, [clearError]);

  // Validate form as user types
  useEffect(() => {
    if (formData.firstName && formData.lastName && formData.dateOfBirth && formData.donorId) {
      const validation = validateDonorCredentials({
        firstName: formData.firstName,
        lastName: formData.lastName,
        avisCenter: '', // Not used in PIN reset
        donorId: formData.donorId
      });
      setValidationErrors(validation.errors);
    } else {
      setValidationErrors([]);
    }
  }, [formData]);

  // Handle input changes
  const handleInputChange = (field: keyof PinResetFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear field error when user starts typing
    if (fieldErrors[field]) {
      setFieldErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  // Validate individual field
  const validateField = (field: keyof PinResetFormData, value: string): string | undefined => {
    switch (field) {
      case 'firstName':
        if (!value.trim()) return 'First name is required';
        if (value.trim().length < 2) return 'First name must be at least 2 characters';
        if (value.trim().length > 50) return 'First name must be 50 characters or less';
        break;
      case 'lastName':
        if (!value.trim()) return 'Last name is required';
        if (value.trim().length < 2) return 'Last name must be at least 2 characters';
        if (value.trim().length > 50) return 'Last name must be 50 characters or less';
        break;
      case 'dateOfBirth':
        if (!value) return 'Date of birth is required';
        const date = new Date(value);
        if (isNaN(date.getTime())) return 'Please enter a valid date';
        
        const now = new Date();
        const birthDate = new Date(value);
        
        // Calculate age more accurately
        let age = now.getFullYear() - birthDate.getFullYear();
        const monthDiff = now.getMonth() - birthDate.getMonth();
        const dayDiff = now.getDate() - birthDate.getDate();
        
        // Adjust age if birthday hasn't occurred this year
        if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
          age--;
        }
        
        console.log('Date validation:', { value, age, birthDate, now });
        
        if (age < 18) return 'You must be at least 18 years old';
        if (age > 120) return 'Please enter a valid date of birth';
        if (birthDate > now) return 'Date of birth cannot be in the future';
        break;
      case 'donorId':
        if (!value.trim()) return 'Donor ID is required';
        if (value.trim().length > 5) return 'Donor ID must be 5 characters or less';
        if (!/^[a-zA-Z0-9]+$/.test(value.trim())) return 'Donor ID can only contain letters and numbers';
        break;
    }
    return undefined;
  };

  // Check if form is valid
  const isFormValid = () => {
    const isValid = formData.firstName.trim() && 
           formData.lastName.trim() && 
           formData.dateOfBirth && 
           formData.donorId.trim() &&
           validationErrors.length === 0 &&
           Object.values(fieldErrors).every(error => !error);
    
    console.log('PinReset - isFormValid check:', {
      firstName: !!formData.firstName.trim(),
      lastName: !!formData.lastName.trim(),
      dateOfBirth: !!formData.dateOfBirth,
      donorId: !!formData.donorId.trim(),
      validationErrors: validationErrors.length,
      fieldErrors: Object.keys(fieldErrors).filter(key => fieldErrors[key as keyof PinResetFormData]),
      isValid
    });
    
    return isValid;
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('PinReset - onSubmit called', { isSubmitting, isLoading, formData });
    if (isSubmitting || isLoading) return;
    
    // Validate all fields
    const newFieldErrors: Partial<PinResetFormData> = {};
    Object.keys(formData).forEach(key => {
      const field = key as keyof PinResetFormData;
      const error = validateField(field, formData[field]);
      if (error) {
        newFieldErrors[field] = error;
      }
    });
    
    setFieldErrors(newFieldErrors);
    
    if (Object.keys(newFieldErrors).length > 0) {
      return;
    }
    
    setIsSubmitting(true);
    
    // Format date of birth
    const formattedDOB = new Date(formData.dateOfBirth).toISOString().split('T')[0];
    
    const result = await resetPin({
      firstName: formData.firstName.trim(),
      lastName: formData.lastName.trim(),
      dateOfBirth: formattedDOB,
      donorId: formData.donorId.trim()
    });
    
    if (result.success) {
      setStep('success');
      setTimeout(() => {
        onSuccess?.();
      }, 3000);
    }
    
    setIsSubmitting(false);
  };

  const handleCancel = () => {
    onCancel?.();
  };

  const handleRetry = () => {
    setStep('verify');
    setValidationErrors([]);
    clearError();
  };

  if (step === 'success') {
    return (
      <div className={`pin-reset-success ${className}`}>
        <div className="text-center">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            PIN Reset Successful!
          </h3>
          <p className="text-gray-600 mb-6">
            Your identity has been verified and your PIN has been reset. Failed attempt counter has been cleared. You can now set up a new PIN for secure access.
          </p>
          <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
            <Shield className="w-4 h-4" />
            <span>You will be redirected to PIN setup</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`pin-reset ${className}`}>
      <div className="text-center mb-6">
        <div className="mx-auto w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-4">
          <Shield className="w-8 h-8 text-orange-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Reset Your PIN
        </h2>
        <p className="text-gray-600">
          {hasCachedCredentials() 
            ? "Verify your identity to reset your PIN. Enter the same information you used during registration."
            : "No cached identity data found. Please contact support for assistance with PIN reset."
          }
        </p>
      </div>

      {hasCachedCredentials() ? (
        <>
        <form onSubmit={onSubmit} className="space-y-6">
        {/* First Name */}
        <div>
          <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
            First Name *
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <User className="h-5 w-5 text-gray-400" />
            </div>
            <input
              value={formData.firstName}
              onChange={(e) => handleInputChange('firstName', e.target.value)}
              onBlur={(e) => {
                const error = validateField('firstName', e.target.value);
                setFieldErrors(prev => ({ ...prev, firstName: error }));
              }}
              type="text"
              className={`
                block w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors
                ${fieldErrors.firstName ? 'border-red-300 bg-red-50' : 'border-gray-300'}
              `}
              placeholder="Enter your first name"
              data-testid="first-name-input"
            />
          </div>
          {fieldErrors.firstName && (
            <p className="mt-1 text-sm text-red-600">{fieldErrors.firstName}</p>
          )}
        </div>

        {/* Last Name */}
        <div>
          <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
            Last Name *
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <User className="h-5 w-5 text-gray-400" />
            </div>
            <input
              value={formData.lastName}
              onChange={(e) => handleInputChange('lastName', e.target.value)}
              onBlur={(e) => {
                const error = validateField('lastName', e.target.value);
                setFieldErrors(prev => ({ ...prev, lastName: error }));
              }}
              type="text"
              className={`
                block w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors
                ${fieldErrors.lastName ? 'border-red-300 bg-red-50' : 'border-gray-300'}
              `}
              placeholder="Enter your last name"
              data-testid="last-name-input"
            />
          </div>
          {fieldErrors.lastName && (
            <p className="mt-1 text-sm text-red-600">{fieldErrors.lastName}</p>
          )}
        </div>

        {/* Date of Birth */}
        <div>
          <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-700 mb-2">
            Date of Birth *
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Calendar className="h-5 w-5 text-gray-400" />
            </div>
            <input
              value={formData.dateOfBirth}
              onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
              onBlur={(e) => {
                const error = validateField('dateOfBirth', e.target.value);
                setFieldErrors(prev => ({ ...prev, dateOfBirth: error }));
              }}
              type="date"
              className={`
                block w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors
                ${fieldErrors.dateOfBirth ? 'border-red-300 bg-red-50' : 'border-gray-300'}
              `}
              data-testid="date-of-birth-input"
            />
          </div>
          {fieldErrors.dateOfBirth && (
            <p className="mt-1 text-sm text-red-600">{fieldErrors.dateOfBirth}</p>
          )}
        </div>

        {/* Donor ID */}
        <div>
          <label htmlFor="donorId" className="block text-sm font-medium text-gray-700 mb-2">
            Donor ID *
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Hash className="h-5 w-5 text-gray-400" />
            </div>
            <input
              value={formData.donorId}
              onChange={(e) => handleInputChange('donorId', e.target.value.toUpperCase())}
              onBlur={(e) => {
                const error = validateField('donorId', e.target.value);
                setFieldErrors(prev => ({ ...prev, donorId: error }));
              }}
              type="text"
              className={`
                block w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors
                ${fieldErrors.donorId ? 'border-red-300 bg-red-50' : 'border-gray-300'}
              `}
              placeholder="Enter your donor ID"
              data-testid="donor-id-input"
              maxLength={5}
              pattern="[A-Za-z0-9]{1,5}"
            />
          </div>
          {fieldErrors.donorId && (
            <p className="mt-1 text-sm text-red-600">{fieldErrors.donorId}</p>
          )}
        </div>

        {/* Validation Errors */}
        {validationErrors.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
            <div className="flex items-start">
              <AlertCircle className="w-5 h-5 text-red-600 mr-2 mt-0.5" />
              <div>
                <h4 className="text-sm font-medium text-red-800">Validation Errors</h4>
                <ul className="text-sm text-red-700 mt-1">
                  {validationErrors.map((error, index) => (
                    <li key={index}>• {error}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
            <div className="flex items-start">
              <AlertCircle className="w-5 h-5 text-red-600 mr-2 mt-0.5" />
              <div>
                <h4 className="text-sm font-medium text-red-800">Verification Failed</h4>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex space-x-3">
          <button
            type="button"
            onClick={handleCancel}
            className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
          >
            Cancel
          </button>
          
          <button
            type="submit"
            disabled={isLoading || isSubmitting || !isFormValid()}
            onClick={(e) => {
              console.log('Verify Identity button clicked!', {
                isDisabled: isLoading || isSubmitting || !isFormValid(),
                isLoading,
                isSubmitting,
                isFormValid: isFormValid(),
                formData,
                fieldErrors
              });
            }}
            className="flex-1 px-4 py-2 text-sm font-medium text-white bg-orange-600 border border-transparent rounded-lg hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading || isSubmitting ? 'Verifying...' : 'Verify Identity'}
          </button>
        </div>
        </form>

        {/* Security Notice */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-start">
            <Shield className="w-5 h-5 text-gray-600 mr-2 mt-0.5" />
            <div className="text-sm text-gray-600">
              <p className="font-medium mb-1">Security Notice</p>
              <p>Your identity will be verified against cached local data from your registration. This information is encrypted and used only for PIN reset purposes.</p>
            </div>
          </div>
        </div>
        </>
      ) : (
        /* No cached credentials available */
        <div className="space-y-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start">
              <AlertCircle className="w-5 h-5 text-red-600 mr-2 mt-0.5" />
              <div>
                <h4 className="text-sm font-medium text-red-800">No Cached Identity Data</h4>
                <p className="text-sm text-red-700 mt-1">
                  We couldn't find your registration information on this device. This may happen if you're using a different device or if your browser data has been cleared.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start">
              <Shield className="w-5 h-5 text-blue-600 mr-2 mt-0.5" />
              <div>
                <h4 className="text-sm font-medium text-blue-800">Contact Support</h4>
                <p className="text-sm text-blue-700 mt-1">
                  Please contact your AVIS center administrator for assistance with PIN reset. They can help you regain access to your account.
                </p>
              </div>
            </div>
          </div>

          <div className="flex space-x-3">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
            >
              Back to Login
            </button>
          </div>
        </div>
      )}

      {/* Help Text */}
      <div className="mt-4 text-center">
        <p className="text-xs text-gray-500">
          Having trouble? Contact support for assistance with identity verification.
        </p>
      </div>
    </div>
  );
}
