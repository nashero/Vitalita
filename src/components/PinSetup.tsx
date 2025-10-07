/**
 * PIN Setup Component
 * 
 * This component handles the initial PIN setup process with validation,
 * confirmation, and security features.
 */

import React, { useState, useEffect } from 'react';
import { usePinAuth } from '../hooks/usePinAuth';
import PinInput from './PinInput';
import { validatePin, PIN_PATTERNS } from '../utils/pinUtils';
import { Lock, Shield, CheckCircle, AlertCircle, Eye, EyeOff } from 'lucide-react';

interface PinSetupFormData {
  pin: string;
  confirmPin: string;
}

interface PinSetupProps {
  onComplete?: () => void;
  onCancel?: () => void;
  className?: string;
}

export default function PinSetup({ 
  onComplete, 
  onCancel, 
  className = '' 
}: PinSetupProps) {
  const { setupPin, isLoading, error, clearError } = usePinAuth();
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [showConfirmPin, setShowConfirmPin] = useState(false);
  const [step, setStep] = useState<'pin' | 'confirm' | 'success'>('pin');
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [warnings, setWarnings] = useState<string[]>([]);

  // Form validation state
  const [isFormValid, setIsFormValid] = useState(false);

  // Clear errors when component mounts
  useEffect(() => {
    clearError();
  }, [clearError]);

  // Validate PIN as user types
  useEffect(() => {
    if (pin.length === 5) {
      const validationResult = validatePin(pin);
      console.log('PIN validation result:', {
        pin: pin.substring(0, 2) + '***',
        validationResult
      });
      setValidationErrors(validationResult.errors);
      setWarnings(validationResult.warnings);
    } else {
      setValidationErrors([]);
      setWarnings([]);
    }
  }, [pin]);

  // Check form validity
  useEffect(() => {
    const isValid = pin.length === 5 && 
                   confirmPin.length === 5 && 
                   pin === confirmPin && 
                   validationErrors.length === 0;
    
    console.log('Form validation check:', {
      pinLength: pin.length,
      confirmPinLength: confirmPin.length,
      pinsMatch: pin === confirmPin,
      validationErrorsCount: validationErrors.length,
      pinValue: pin,
      confirmPinValue: confirmPin,
      isValid
    });
    
    setIsFormValid(isValid);
  }, [pin, confirmPin, validationErrors]);

  // Clear validation errors when PINs match in confirmation step
  useEffect(() => {
    if (step === 'confirm' && pin === confirmPin && confirmPin.length === 5) {
      setValidationErrors([]);
    }
  }, [pin, confirmPin, step]);


  const handlePinChange = (value: string) => {
    setPin(value);
    if (value.length === 5) {
      setStep('confirm');
    }
  };

  const handleConfirmPinChange = (value: string) => {
    setConfirmPin(value);
    // Clear validation errors if PINs match
    if (value.length === 5 && value === pin) {
      setValidationErrors([]);
    }
  };

  const handlePinComplete = (value: string) => {
    setPin(value);
    setStep('confirm');
  };

  const handleConfirmPinComplete = (value: string) => {
    console.log('handleConfirmPinComplete called:', {
      value: value.substring(0, 2) + '***',
      currentPin: pin.substring(0, 2) + '***',
      validationErrors: validationErrors.length
    });
    setConfirmPin(value);
    if (value.length === 5) {
      // Use setTimeout to ensure state updates are processed
      setTimeout(() => {
        console.log('handleConfirmPinComplete timeout check:', {
          pin: pin.substring(0, 2) + '***',
          value: value.substring(0, 2) + '***',
          pinsMatch: pin === value,
          validationErrors: validationErrors.length,
          willSubmit: pin === value && validationErrors.length === 0
        });
        if (pin === value && validationErrors.length === 0) {
          console.log('Auto-submitting form from handleConfirmPinComplete');
          handleSubmit(undefined, pin, value);
        } else {
          console.log('Not auto-submitting - validation failed');
        }
      }, 200); // Increased timeout to 200ms
    }
  };

  const handleSubmit = async (e?: React.FormEvent, pinValue?: string, confirmPinValue?: string) => {
    // Use provided values or fall back to state
    const currentPin = pinValue ?? pin;
    const currentConfirmPin = confirmPinValue ?? confirmPin;
    
    console.log('=== HANDLE SUBMIT CALLED ===');
    console.log('handleSubmit called:', { 
      pin: currentPin.substring(0, 2) + '***', 
      confirmPin: currentConfirmPin.substring(0, 2) + '***',
      validationErrors: validationErrors.length,
      isFormValid,
      isLoading,
      step,
      usingProvidedValues: pinValue !== undefined
    });
    
    if (e) {
      e.preventDefault();
    }
    
    if (currentPin !== currentConfirmPin) {
      console.log('❌ PINs do not match');
      setValidationErrors(['PINs do not match']);
      return;
    }

    if (validationErrors.length > 0) {
      console.log('❌ Validation errors present:', validationErrors);
      return;
    }

    console.log('✅ All validations passed, calling setupPin...');
    
    try {
      const result = await setupPin(currentPin, currentConfirmPin);
      console.log('setupPin result:', result);
    
      if (result.success) {
        console.log('PIN setup successful, showing success screen');
        setStep('success');
        setTimeout(() => {
          console.log('Calling onComplete callback');
          onComplete?.();
        }, 2000);
      } else {
        console.log('PIN setup failed:', result.error);
        setValidationErrors([result.error || 'Failed to set up PIN']);
      }
    } catch (error) {
      console.error('Error setting up PIN:', error);
      setError('An unexpected error occurred');
    }
  };

  const handleBack = () => {
    if (step === 'confirm') {
      setStep('pin');
      setConfirmPin('');
    } else if (step === 'pin') {
      onCancel?.();
    }
  };

  const handleRetry = () => {
    setStep('pin');
    setPin('');
    setConfirmPin('');
    setValidationErrors([]);
    setWarnings([]);
    clearError();
  };

  if (step === 'success') {
    return (
      <div className={`pin-setup-success ${className}`}>
        <div className="text-center">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            PIN Setup Complete!
          </h3>
          <p className="text-gray-600 mb-6">
            Your PIN has been set up successfully. You can now use it to log in securely.
          </p>
          <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
            <Shield className="w-4 h-4" />
            <span>Your PIN is encrypted and stored securely</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`pin-setup ${className}`}>
      <div className="text-center mb-6">
        <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
          <Lock className="w-8 h-8 text-blue-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Set Up Your PIN
        </h2>
        <p className="text-gray-600">
          {step === 'pin' 
            ? 'Create a secure 5-digit PIN for quick access to your account'
            : 'Confirm your PIN to complete the setup'
          }
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {step === 'pin' && (
          <div>
            <label htmlFor="pin" className="block text-sm font-medium text-gray-700 mb-2">
              Enter your 5-digit PIN
            </label>
            <PinInput
              value={pin}
              onChange={handlePinChange}
              onComplete={handlePinComplete}
              length={5}
              error={validationErrors.length > 0 ? validationErrors[0] : undefined}
              showStrength={true}
              maskInput={!showPin}
              autoFocus={true}
              placeholder="Enter PIN"
              className="mb-4"
              data-testid="pin-input"
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
                  <CheckCircle className={`w-4 h-4 mr-2 ${pin.length === 5 ? 'text-green-500' : 'text-gray-400'}`} />
                  Exactly 5 digits
                </li>
                <li className="flex items-center">
                  <CheckCircle className={`w-4 h-4 mr-2 ${!PIN_PATTERNS.SEQUENTIAL.test(pin) ? 'text-green-500' : 'text-gray-400'}`} />
                  Not sequential (e.g., 12345, 54321)
                </li>
                <li className="flex items-center">
                  <CheckCircle className={`w-4 h-4 mr-2 ${!PIN_PATTERNS.REPEATED.test(pin) ? 'text-green-500' : 'text-gray-400'}`} />
                  Not repeated digits (e.g., 11111, 22222)
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

            {/* Show/Hide PIN Toggle */}
            <div className="flex items-center justify-center">
              <button
                type="button"
                onClick={() => setShowPin(!showPin)}
                className="flex items-center text-sm text-gray-600 hover:text-gray-800 transition-colors"
              >
                {showPin ? <EyeOff className="w-4 h-4 mr-1" /> : <Eye className="w-4 h-4 mr-1" />}
                {showPin ? 'Hide PIN' : 'Show PIN'}
              </button>
            </div>
          </div>
        )}

        {step === 'confirm' && (
          <div>
            <label htmlFor="confirmPin" className="block text-sm font-medium text-gray-700 mb-2">
              Confirm your PIN
            </label>
            <PinInput
              value={confirmPin}
              onChange={handleConfirmPinChange}
              onComplete={handleConfirmPinComplete}
              length={5}
              error={pin !== confirmPin && confirmPin.length === 5 ? 'PINs do not match' : undefined}
              maskInput={!showConfirmPin}
              autoFocus={true}
              placeholder="Confirm PIN"
              className="mb-4"
              data-testid="confirm-pin-input"
            />

            {/* PIN Match Indicator */}
            {confirmPin.length === 5 && (
              <div className={`flex items-center justify-center text-sm mb-4 ${
                pin === confirmPin ? 'text-green-600' : 'text-red-600'
              }`}>
                {pin === confirmPin ? (
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
                <h4 className="text-sm font-medium text-red-800">Setup Error</h4>
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
            {step === 'pin' ? 'Cancel' : 'Back'}
          </button>
          
        <button
          type="button"
          disabled={isLoading || !isFormValid}
          onClick={(e) => {
            console.log('=== COMPLETE SETUP BUTTON CLICKED ===');
            alert('Button clicked! Check console for details.');
            console.log('Button state:', { 
              isLoading, 
              isFormValid, 
              disabled: isLoading || !isFormValid,
              pin: pin.substring(0, 2) + '***',
              confirmPin: confirmPin.substring(0, 2) + '***',
              step,
              validationErrors,
              pinLength: pin.length,
              confirmPinLength: confirmPin.length,
              pinsMatch: pin === confirmPin
            });
            
            // Double-check form validity before submitting
            const isActuallyValid = pin.length === 5 && 
                                  confirmPin.length === 5 && 
                                  pin === confirmPin && 
                                  validationErrors.length === 0;
            
            console.log('Double-check validation:', {
              isActuallyValid,
              pinLength: pin.length,
              confirmPinLength: confirmPin.length,
              pinsMatch: pin === confirmPin,
              validationErrorsCount: validationErrors.length
            });
            
            if (!isLoading && isActuallyValid) {
              console.log('✅ Calling handleSubmit...');
              handleSubmit(e, pin, confirmPin);
            } else {
              console.log('❌ Button click ignored - form not valid or loading');
              console.log('Reasons:', {
                isLoading,
                isActuallyValid,
                pinLength: pin.length,
                confirmPinLength: confirmPin.length,
                pinsMatch: pin === confirmPin,
                validationErrorsCount: validationErrors.length
              });
            }
          }}
          className={`flex-1 px-4 py-2 text-sm font-medium text-white border border-transparent rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors ${
            isLoading || !isFormValid 
              ? 'bg-gray-400 cursor-not-allowed opacity-50' 
              : 'bg-blue-600 hover:bg-blue-700 cursor-pointer'
          }`}
        >
          {isLoading ? 'Setting up...' : 'Complete Setup'}
        </button>
        
        {/* Debug button - remove this after testing */}
        <button
          type="button"
          onClick={() => {
            console.log('=== DEBUG BUTTON CLICKED ===');
            console.log('Current state:', {
              pin: pin.substring(0, 2) + '***',
              confirmPin: confirmPin.substring(0, 2) + '***',
              isFormValid,
              validationErrors,
              step
            });
            alert('Debug button clicked! Check console.');
          }}
          className="mt-2 w-full px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
        >
          DEBUG: Test Button
        </button>
        </div>
      </form>

      {/* Security Notice */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <div className="flex items-start">
          <Shield className="w-5 h-5 text-gray-600 mr-2 mt-0.5" />
          <div className="text-sm text-gray-600">
            <p className="font-medium mb-1">Security Notice</p>
            <p>Your PIN is encrypted using industry-standard security measures and stored securely on your device. It will be required for all future logins.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
