/**
 * PIN Change Component
 * 
 * This component allows authenticated users to change their PIN
 * with current PIN verification and new PIN validation.
 */

import React, { useState, useEffect } from 'react';
import { usePinAuth } from '../hooks/usePinAuth';
import PinInput from './PinInput';
import { Lock, Shield, CheckCircle, AlertCircle, Eye, EyeOff } from 'lucide-react';

interface PinChangeProps {
  onSuccess?: () => void;
  onCancel?: () => void;
  className?: string;
}

export default function PinChange({ 
  onSuccess, 
  onCancel, 
  className = '' 
}: PinChangeProps) {
  const { changePin, isLoading, error, clearError } = usePinAuth();
  
  const [currentPin, setCurrentPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [showCurrentPin, setShowCurrentPin] = useState(false);
  const [showNewPin, setShowNewPin] = useState(false);
  const [showConfirmPin, setShowConfirmPin] = useState(false);
  const [step, setStep] = useState<'current' | 'new' | 'confirm' | 'success'>('current');
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [warnings, setWarnings] = useState<string[]>([]);

  // Clear errors when component mounts
  useEffect(() => {
    clearError();
  }, [clearError]);

  // Validate new PIN as user types
  useEffect(() => {
    if (newPin.length === 5) {
      const { errors, warnings } = validatePin(newPin);
      setValidationErrors(errors);
      setWarnings(warnings);
    } else {
      setValidationErrors([]);
      setWarnings([]);
    }
  }, [newPin]);

  const validatePin = (pinValue: string) => {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Check length
    if (pinValue.length !== 5) {
      errors.push('PIN must be exactly 5 digits');
    }

    // Check if all digits
    if (!/^\d{5}$/.test(pinValue)) {
      errors.push('PIN must contain only numbers');
    }

    // Check for sequential patterns
    if (/^(?:01234|12345|23456|34567|45678|56789|98765|87654|76543|65432|54321|43210)$/.test(pinValue)) {
      errors.push('PIN cannot be sequential (e.g., 12345, 54321)');
    }

    // Check for repeated digits
    if (/^(\d)\1{4}$/.test(pinValue)) {
      errors.push('PIN cannot have repeated digits (e.g., 11111, 22222)');
    }

    // Check for common patterns
    if (/^(?:12345|54321|11111|22222|33333|44444|55555|66666|77777|88888|99999|00000)$/.test(pinValue)) {
      warnings.push('This PIN is commonly used and may be less secure');
    }

    // Check if new PIN is different from current
    if (currentPin && pinValue === currentPin) {
      errors.push('New PIN must be different from current PIN');
    }

    return { errors, warnings };
  };

  const handleCurrentPinChange = (value: string) => {
    setCurrentPin(value);
    if (value.length === 5) {
      setStep('new');
    }
  };

  const handleNewPinChange = (value: string) => {
    setNewPin(value);
    if (value.length === 5) {
      setStep('confirm');
    }
  };

  const handleConfirmPinChange = (value: string) => {
    setConfirmPin(value);
  };

  const handleCurrentPinComplete = (value: string) => {
    setCurrentPin(value);
    setStep('new');
  };

  const handleNewPinComplete = (value: string) => {
    setNewPin(value);
    setStep('confirm');
  };

  const handleConfirmPinComplete = async (value: string) => {
    setConfirmPin(value);
    if (value.length === 5) {
      await handleSubmit();
    }
  };

  const handleSubmit = async () => {
    if (currentPin.length !== 5 || newPin.length !== 5 || confirmPin.length !== 5) {
      return;
    }

    if (newPin !== confirmPin) {
      setValidationErrors(['New PINs do not match']);
      return;
    }

    if (validationErrors.length > 0) {
      return;
    }

    const result = await changePin(currentPin, newPin, confirmPin);
    if (result.success) {
      setStep('success');
      setTimeout(() => {
        onSuccess?.();
      }, 2000);
    } else {
      setValidationErrors([result.error || 'Failed to change PIN']);
    }
  };

  const handleBack = () => {
    if (step === 'confirm') {
      setStep('new');
      setConfirmPin('');
    } else if (step === 'new') {
      setStep('current');
      setNewPin('');
      setConfirmPin('');
    } else if (step === 'current') {
      onCancel?.();
    }
  };

  const handleRetry = () => {
    setStep('current');
    setCurrentPin('');
    setNewPin('');
    setConfirmPin('');
    setValidationErrors([]);
    setWarnings([]);
    clearError();
  };

  if (step === 'success') {
    return (
      <div className={`pin-change-success ${className}`}>
        <div className="text-center">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            PIN Changed Successfully!
          </h3>
          <p className="text-gray-600 mb-6">
            Your PIN has been updated. You can now use your new PIN for future logins.
          </p>
          <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
            <Shield className="w-4 h-4" />
            <span>Your new PIN is encrypted and stored securely</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`pin-change ${className}`}>
      <div className="text-center mb-6">
        <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
          <Lock className="w-8 h-8 text-blue-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Change Your PIN
        </h2>
        <p className="text-gray-600">
          {step === 'current' && 'Enter your current PIN to continue'}
          {step === 'new' && 'Create a new secure PIN'}
          {step === 'confirm' && 'Confirm your new PIN'}
        </p>
      </div>

      <div className="space-y-6">
        {/* Current PIN */}
        {step === 'current' && (
          <div>
            <label htmlFor="currentPin" className="block text-sm font-medium text-gray-700 mb-2">
              Current PIN
            </label>
            <PinInput
              value={currentPin}
              onChange={handleCurrentPinChange}
              onComplete={handleCurrentPinComplete}
              length={5}
              maskInput={!showCurrentPin}
              autoFocus={true}
              placeholder="Enter current PIN"
              className="mb-4"
              data-testid="current-pin-input"
            />
            
            {/* Show/Hide Current PIN Toggle */}
            <div className="flex items-center justify-center">
              <button
                type="button"
                onClick={() => setShowCurrentPin(!showCurrentPin)}
                className="flex items-center text-sm text-gray-600 hover:text-gray-800 transition-colors"
              >
                {showCurrentPin ? <EyeOff className="w-4 h-4 mr-1" /> : <Eye className="w-4 h-4 mr-1" />}
                {showCurrentPin ? 'Hide PIN' : 'Show PIN'}
              </button>
            </div>
          </div>
        )}

        {/* New PIN */}
        {step === 'new' && (
          <div>
            <label htmlFor="newPin" className="block text-sm font-medium text-gray-700 mb-2">
              New PIN
            </label>
            <PinInput
              value={newPin}
              onChange={handleNewPinChange}
              onComplete={handleNewPinComplete}
              length={5}
              error={validationErrors.length > 0 ? validationErrors[0] : undefined}
              showStrength={true}
              maskInput={!showNewPin}
              autoFocus={true}
              placeholder="Enter new PIN"
              className="mb-4"
              data-testid="new-pin-input"
            />
            
            {/* ATM PIN Warning */}
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <div className="flex items-start">
                <AlertCircle className="w-5 h-5 text-red-600 mr-2 mt-0.5" />
                <div>
                  <h4 className="text-sm font-medium text-red-800">Important Security Notice</h4>
                  <p className="text-sm text-red-700 mt-1">
                    <strong>Do not use your ATM card PIN or any banking PIN.</strong> Create a unique PIN that is different from any financial account PINs for your security.
                  </p>
                </div>
              </div>
            </div>

            {/* PIN Requirements */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <h4 className="text-sm font-medium text-blue-900 mb-2">PIN Requirements:</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li className="flex items-center">
                  <CheckCircle className={`w-4 h-4 mr-2 ${newPin.length === 5 ? 'text-green-500' : 'text-gray-400'}`} />
                  Exactly 5 digits
                </li>
                <li className="flex items-center">
                  <CheckCircle className={`w-4 h-4 mr-2 ${!/^(?:01234|12345|23456|34567|45678|56789|98765|87654|76543|65432|54321|43210)$/.test(newPin) ? 'text-green-500' : 'text-gray-400'}`} />
                  Not sequential (e.g., 12345, 54321)
                </li>
                <li className="flex items-center">
                  <CheckCircle className={`w-4 h-4 mr-2 ${!/^(\d)\1{4}$/.test(newPin) ? 'text-green-500' : 'text-gray-400'}`} />
                  Not repeated digits (e.g., 11111, 22222)
                </li>
                <li className="flex items-center">
                  <CheckCircle className={`w-4 h-4 mr-2 ${currentPin && newPin !== currentPin ? 'text-green-500' : 'text-gray-400'}`} />
                  Different from current PIN
                </li>
              </ul>
            </div>

            {/* Warnings */}
            {warnings.length > 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                <div className="flex items-start">
                  <AlertCircle className="w-5 h-5 text-yellow-600 mr-2 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-medium text-yellow-800">Security Warning</h4>
                    <ul className="text-sm text-yellow-700 mt-1">
                      {warnings.map((warning, index) => (
                        <li key={index}>• {warning}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* Show/Hide New PIN Toggle */}
            <div className="flex items-center justify-center">
              <button
                type="button"
                onClick={() => setShowNewPin(!showNewPin)}
                className="flex items-center text-sm text-gray-600 hover:text-gray-800 transition-colors"
              >
                {showNewPin ? <EyeOff className="w-4 h-4 mr-1" /> : <Eye className="w-4 h-4 mr-1" />}
                {showNewPin ? 'Hide PIN' : 'Show PIN'}
              </button>
            </div>
          </div>
        )}

        {/* Confirm PIN */}
        {step === 'confirm' && (
          <div>
            <label htmlFor="confirmPin" className="block text-sm font-medium text-gray-700 mb-2">
              Confirm New PIN
            </label>
            <PinInput
              value={confirmPin}
              onChange={handleConfirmPinChange}
              onComplete={handleConfirmPinComplete}
              length={5}
              error={newPin !== confirmPin && confirmPin.length === 5 ? 'PINs do not match' : undefined}
              maskInput={!showConfirmPin}
              autoFocus={true}
              placeholder="Confirm new PIN"
              className="mb-4"
              data-testid="confirm-pin-input"
            />

            {/* PIN Match Indicator */}
            {confirmPin.length === 5 && (
              <div className={`flex items-center justify-center text-sm mb-4 ${
                newPin === confirmPin ? 'text-green-600' : 'text-red-600'
              }`}>
                {newPin === confirmPin ? (
                  <>
                    <CheckCircle className="w-4 h-4 mr-1" />
                    PINs match
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-4 h-4 mr-1" />
                    PINs do not match
                  </>
                )}
              </div>
            )}

            {/* Show/Hide Confirm PIN Toggle */}
            <div className="flex items-center justify-center">
              <button
                type="button"
                onClick={() => setShowConfirmPin(!showConfirmPin)}
                className="flex items-center text-sm text-gray-600 hover:text-gray-800 transition-colors"
              >
                {showConfirmPin ? <EyeOff className="w-4 h-4 mr-1" /> : <Eye className="w-4 h-4 mr-1" />}
                {showConfirmPin ? 'Hide PIN' : 'Show PIN'}
              </button>
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
            <div className="flex items-start">
              <AlertCircle className="w-5 h-5 text-red-600 mr-2 mt-0.5" />
              <div>
                <h4 className="text-sm font-medium text-red-800">Change Failed</h4>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex space-x-3">
          <button
            type="button"
            onClick={handleBack}
            className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
          >
            {step === 'current' ? 'Cancel' : 'Back'}
          </button>
          
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isLoading || 
              (step === 'current' && currentPin.length !== 5) ||
              (step === 'new' && (newPin.length !== 5 || validationErrors.length > 0)) ||
              (step === 'confirm' && (confirmPin.length !== 5 || newPin !== confirmPin))
            }
            className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? 'Changing...' : 
             step === 'current' ? 'Continue' :
             step === 'new' ? 'Continue' : 'Change PIN'}
          </button>
        </div>
      </div>

      {/* Security Notice */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <div className="flex items-start">
          <Shield className="w-5 h-5 text-gray-600 mr-2 mt-0.5" />
          <div className="text-sm text-gray-600">
            <p className="font-medium mb-1">Security Notice</p>
            <p>Your new PIN will be encrypted and stored securely. The old PIN will be immediately invalidated.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
