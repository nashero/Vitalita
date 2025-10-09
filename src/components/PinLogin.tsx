/**
 * PIN Login Component
 * 
 * This component handles PIN-based authentication with 3-attempt lockout
 * mechanism and comprehensive error handling.
 */

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { usePinAuth } from '../hooks/usePinAuth';
import PinInput from './PinInput';
import { Lock, AlertCircle, Clock, Shield, Eye, EyeOff } from 'lucide-react';

interface PinLoginProps {
  onSuccess?: () => void;
  onForgotPin?: () => void;
  className?: string;
}

export default function PinLogin({ 
  onSuccess, 
  onForgotPin, 
  className = '' 
}: PinLoginProps) {
  const { t } = useTranslation();
  const { 
    authenticateWithPin, 
    isLoading, 
    error, 
    clearError, 
    lockoutInfo 
  } = usePinAuth();
  
  const [pin, setPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [attemptCount, setAttemptCount] = useState(0);

  // Clear errors when component mounts
  useEffect(() => {
    clearError();
  }, [clearError]);

  // Update attempt count from lockout info
  useEffect(() => {
    setAttemptCount(3 - lockoutInfo.attemptsRemaining);
  }, [lockoutInfo.attemptsRemaining]);

  const handlePinChange = (value: string) => {
    setPin(value);
    if (error) {
      clearError();
    }
  };

  const handlePinComplete = async (value: string) => {
    if (isSubmitting || isLoading) return;
    
    setIsSubmitting(true);
    console.log('PIN authentication starting...');
    const result = await authenticateWithPin(value);
    
    if (result.success) {
      console.log('PIN authentication successful, calling onSuccess');
      onSuccess?.();
    } else {
      console.log('PIN authentication failed:', result.error);
      setPin(''); // Clear PIN on failure
    }
    
    setIsSubmitting(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pin.length === 5 && !isSubmitting && !isLoading) {
      await handlePinComplete(pin);
    }
  };

  const handleForgotPin = () => {
    onForgotPin?.();
  };

  const formatTimeRemaining = (timestamp: number): string => {
    const now = Date.now();
    const remaining = timestamp - now;
    
    if (remaining <= 0) return '0 minutes';
    
    const minutes = Math.ceil(remaining / (1000 * 60));
    return `${minutes} minute${minutes !== 1 ? 's' : ''}`;
  };

  const isLocked = lockoutInfo.isLocked;
  const canAttempt = !isLocked && lockoutInfo.attemptsRemaining > 0;
  const isDisabled = isLocked || isLoading || isSubmitting;

  return (
    <div className={`pin-login ${className}`}>
      <div className="text-center mb-6">
        <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
          <Lock className="w-8 h-8 text-blue-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          {t('pin.enterPin')}
        </h2>
        <p className="text-gray-600">
          {isLocked 
            ? t('pin.accountLockedDescription')
            : t('pin.enterPinDescription')
          }
        </p>
      </div>

      {/* Show PIN Input Form only if not locked */}
      {!isLocked ? (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* PIN Input */}
          <div>
            <label htmlFor="pin" className="block text-sm font-medium text-gray-700 mb-2">
              {t('pin.pinLabel')}
            </label>
            <PinInput
              value={pin}
              onChange={handlePinChange}
              onComplete={handlePinComplete}
              length={5}
              disabled={isDisabled}
              error={error || undefined}
              maskInput={!showPin}
              autoFocus={!isLocked}
              placeholder={t('pin.enterPinPlaceholder')}
              className="mb-4"
              data-testid="pin-login-input"
            />
            
            {/* Show/Hide PIN Toggle */}
            <div className="flex items-center justify-center">
              <button
                type="button"
                onClick={() => setShowPin(!showPin)}
                className="flex items-center text-sm text-gray-600 hover:text-gray-800 transition-colors"
              >
                {showPin ? <EyeOff className="w-4 h-4 mr-1" /> : <Eye className="w-4 h-4 mr-1" />}
                {showPin ? t('pin.hidePin') : t('pin.showPin')}
              </button>
            </div>
          </div>

          {/* Attempt Counter */}
          {lockoutInfo.attemptsRemaining < 3 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
              <div className="flex items-center">
                <AlertCircle className="w-4 h-4 text-yellow-600 mr-2" />
                <span className="text-sm text-yellow-800">
                  {t('pin.attemptsRemaining', { 
                    count: lockoutInfo.attemptsRemaining,
                    plural: lockoutInfo.attemptsRemaining !== 1 ? 's' : ''
                  })}
                </span>
              </div>
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
              <div className="flex items-start">
                <AlertCircle className="w-5 h-5 text-red-600 mr-2 mt-0.5" />
                <div>
                  <h4 className="text-sm font-medium text-red-800">{t('pin.loginFailed')}</h4>
                  <p className="text-sm text-red-700 mt-1">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isDisabled || pin.length !== 5}
            className="w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading || isSubmitting ? t('pin.authenticating') : t('pin.loginButton')}
          </button>

          {/* Forgot PIN Link */}
          <div className="text-center">
            <button
              type="button"
              onClick={handleForgotPin}
              className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
            >
              {t('pin.forgotPin')}
            </button>
          </div>
        </form>
      ) : (
        /* Lockout State - Only show reset option */
        <div className="space-y-6">
          {/* Lockout Information */}
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <div className="flex items-start">
              <Clock className="w-5 h-5 text-red-600 mr-2 mt-0.5" />
              <div>
                <h4 className="text-sm font-medium text-red-800">{t('pin.accountLocked')}</h4>
                <p className="text-sm text-red-700 mt-1">
                  {t('pin.tooManyAttempts', { 
                    time: lockoutInfo.lockoutExpiresAt 
                      ? formatTimeRemaining(lockoutInfo.lockoutExpiresAt)
                      : '15 minutes'
                  })}
                </p>
              </div>
            </div>
          </div>

          {/* PIN Reset Option */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <div className="flex items-start">
              <Shield className="w-5 h-5 text-blue-600 mr-2 mt-0.5" />
              <div>
                <h4 className="text-sm font-medium text-blue-800">PIN Reset Required</h4>
                <p className="text-sm text-blue-700 mt-1">
                  Your account is locked due to multiple failed attempts. You must reset your PIN using identity verification.
                </p>
              </div>
            </div>
          </div>

          {/* Reset PIN Button */}
          <button
            type="button"
            onClick={handleForgotPin}
            className="w-full px-4 py-2 text-sm font-medium text-white bg-orange-600 border border-transparent rounded-lg hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 transition-colors"
          >
            Reset PIN with Identity Verification
          </button>
        </div>
      )}

      {/* Security Information */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <div className="flex items-start">
          <Shield className="w-5 h-5 text-gray-600 mr-2 mt-0.5" />
          <div className="text-sm text-gray-600">
            <p className="font-medium mb-1">{t('pin.securityFeatures')}</p>
            <ul className="space-y-1">
              <li>• {t('pin.lockoutProtection')}</li>
              <li>• {t('pin.encryptedStorage')}</li>
              <li>• {t('pin.deviceAuth')}</li>
              <li>• {t('pin.sessionTimeout')}</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Help Text */}
      <div className="mt-4 text-center">
        <p className="text-xs text-gray-500">
          {t('pin.needHelp')}
        </p>
      </div>
    </div>
  );
}
