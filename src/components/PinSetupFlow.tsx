/**
 * PIN Setup Flow Component
 * 
 * This component handles the complete PIN setup flow for verified donors,
 * including verification status checking and credential validation.
 */

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { usePinAuth } from '../hooks/usePinAuth';
import PinSetup from './PinSetup';
import { 
  Shield, 
  CheckCircle, 
  AlertCircle, 
  Loader, 
  ArrowLeft,
  User,
  Calendar,
  Hash,
  Info,
  Clock
} from 'lucide-react';
import { 
  getDonorCredentials, 
  DonorCredentials,
  validateDonorCredentials 
} from '../utils/cookieStorage';
import { 
  checkVerificationStatus, 
  verifyDonorIdentity,
  getVerificationStatusMessage 
} from '../utils/verificationUtils';

interface PinSetupFlowProps {
  onComplete?: () => void;
  onCancel?: () => void;
  onBackToLanding?: () => void;
  className?: string;
}

type FlowStep = 'loading' | 'verification' | 'credentials' | 'pin-setup' | 'success' | 'error' | 'unverified';

export default function PinSetupFlow({ 
  onComplete, 
  onCancel, 
  onBackToLanding,
  className = '' 
}: PinSetupFlowProps) {
  const { t } = useTranslation();
  const { setupPin, isLoading: pinLoading } = usePinAuth();
  
  const [currentStep, setCurrentStep] = useState<FlowStep>('loading');
  const [credentials, setCredentials] = useState<DonorCredentials | null>(null);
  const [verificationStatus, setVerificationStatus] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  // Initialize the flow
  useEffect(() => {
    initializeFlow();
  }, []);

  const initializeFlow = async () => {
    try {
      setCurrentStep('loading');
      setError(null);

      // Get credentials from cookies
      const storedCredentials = getDonorCredentials();
      if (!storedCredentials) {
        setError('No registration credentials found. Please complete registration first.');
        setCurrentStep('error');
        return;
      }

      // Validate credentials format
      const validation = validateDonorCredentials(storedCredentials);
      if (!validation.isValid) {
        setError(`Invalid credentials: ${validation.errors.join(', ')}`);
        setCurrentStep('error');
        return;
      }

      setCredentials(storedCredentials);
      setCurrentStep('verification');
      
      // Check verification status with the credentials
      await checkVerification(storedCredentials);
    } catch (error) {
      console.error('Error initializing PIN setup flow:', error);
      setError('Failed to initialize PIN setup flow');
      setCurrentStep('error');
    }
  };

  const checkVerification = async (credentialsToCheck?: DonorCredentials) => {
    try {
      setIsVerifying(true);
      setError(null);

      const creds = credentialsToCheck || credentials;
      if (!creds) {
        setError('No credentials available');
        setCurrentStep('error');
        return;
      }

      // Verify donor identity
      const identityResult = await verifyDonorIdentity(creds);
      if (!identityResult.isValid) {
        // Check if this is specifically an unverified email case
        if (identityResult.isUnverified) {
          setCurrentStep('unverified');
          return;
        }
        setError(identityResult.error || 'Identity verification failed');
        setCurrentStep('error');
        return;
      }

      // Check verification status
      const status = await checkVerificationStatus();
      setVerificationStatus(status);

      if (status.error) {
        setError(status.error);
        setCurrentStep('error');
        return;
      }

      if (!status.isVerified) {
        setCurrentStep('unverified');
        return;
      }

      // If verified, proceed to PIN setup
      setCurrentStep('pin-setup');
    } catch (error) {
      console.error('Error checking verification:', error);
      setError('Failed to verify your account status');
      setCurrentStep('error');
    } finally {
      setIsVerifying(false);
    }
  };

  const handlePinSetupComplete = () => {
    // PIN setup is handled by the PinSetup component
    setCurrentStep('success');
    // Auto-redirect after success
    setTimeout(() => {
      onComplete?.();
    }, 2000);
  };

  const handleRetry = () => {
    setError(null);
    initializeFlow();
  };

  const handleBackToLanding = () => {
    onBackToLanding?.();
  };

  // Loading step
  if (currentStep === 'loading') {
    return (
      <div className={`pin-setup-flow ${className}`}>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Initializing PIN setup...</p>
          </div>
        </div>
      </div>
    );
  }

  // Verification step
  if (currentStep === 'verification') {
    return (
      <div className={`pin-setup-flow ${className}`}>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md">
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <div className="text-center mb-6">
                <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                  <Shield className="w-8 h-8 text-blue-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Verifying Your Account
                </h2>
                <p className="text-gray-600">
                  Please wait while we verify your account status...
                </p>
              </div>

              {isVerifying && (
                <div className="flex items-center justify-center mb-6">
                  <Loader className="w-6 h-6 animate-spin text-blue-600 mr-2" />
                  <span className="text-gray-600">Checking verification status...</span>
                </div>
              )}

              <div className="text-center">
                <button
                  onClick={handleBackToLanding}
                  className="text-sm text-gray-600 hover:text-gray-800 transition-colors"
                >
                  ← {t('pin.backToHome')}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Credentials display step
  if (currentStep === 'credentials' && credentials) {
    return (
      <div className={`pin-setup-flow ${className}`}>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md">
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <div className="text-center mb-6">
                <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Account Verified!
                </h2>
                <p className="text-gray-600">
                  Your account has been verified. Please confirm your details and set up your PIN.
                </p>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <h3 className="text-sm font-medium text-gray-700 mb-3">Your Registration Details:</h3>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <User className="w-4 h-4 text-gray-400 mr-2" />
                    <span className="text-sm text-gray-600">
                      {credentials.firstName} {credentials.lastName}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                    <span className="text-sm text-gray-600">
                      {new Date(credentials.dateOfBirth).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <Hash className="w-4 h-4 text-gray-400 mr-2" />
                    <span className="text-sm text-gray-600">
                      Donor ID: {credentials.donorId}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={handleBackToLanding}
                  className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => setCurrentStep('pin-setup')}
                  className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                >
                  Continue to PIN Setup
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // PIN setup step
  if (currentStep === 'pin-setup') {
    return (
      <div className={`pin-setup-flow ${className}`}>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md">
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <div className="text-center mb-6">
                <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Set Up Your PIN
                </h2>
                <p className="text-gray-600">
                  Create a secure 5-digit PIN for quick access to your account.
                </p>
              </div>

              <PinSetup
                onComplete={handlePinSetupComplete}
                onCancel={onCancel}
              />

              {error && (
                <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-3">
                  <div className="flex items-start">
                    <AlertCircle className="w-5 h-5 text-red-600 mr-2 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-medium text-red-800">Setup Error</h4>
                      <p className="text-sm text-red-700 mt-1">{error}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Success step
  if (currentStep === 'success') {
    return (
      <div className={`pin-setup-flow ${className}`}>
        <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md">
            <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                PIN Setup Complete!
              </h2>
              <p className="text-gray-600 mb-6">
                Your PIN has been set up successfully. You can now use it to log in securely.
              </p>
              <div className="flex items-center justify-center space-x-2 text-sm text-gray-500 mb-6">
                <Shield className="w-4 h-4" />
                <span>Your PIN is encrypted and stored securely</span>
              </div>
              <button
                onClick={onComplete}
                className="w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
              >
                Continue to Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Unverified email step
  if (currentStep === 'unverified') {
    return (
      <div className={`pin-setup-flow ${className}`}>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md">
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <div className="text-center mb-6">
                <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                  <Info className="w-8 h-8 text-blue-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  {t('pin.emailVerificationPending')}
                </h2>
                <p className="text-gray-600">
                  {t('pin.emailVerificationMessage')}
                </p>
              </div>

              <div className="flex justify-center">
                <button
                  onClick={handleBackToLanding}
                  className="px-8 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                >
                  {t('pin.backToHome')}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error step
  if (currentStep === 'error') {
    return (
      <div className={`pin-setup-flow ${className}`}>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md">
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <div className="text-center mb-6">
                <div className="mx-auto w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-4">
                  <Shield className="w-8 h-8 text-orange-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  {t('pin.accountVerificationPending')}
                </h2>
                <div className="text-gray-600 space-y-3 text-left">
                  <p>{t('pin.thankYouForSetup')}</p>
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <p className="font-medium text-gray-700 mb-2">{t('pin.questionsContactUs')}</p>
                    <p className="text-sm">📧 {t('pin.supportEmail')}</p>
                    <p className="text-sm">📞 {t('pin.supportPhone')}</p>
                  </div>
                </div>
              </div>

              <div className="flex justify-center">
                <button
                  onClick={handleBackToLanding}
                  className="px-6 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                >
                  {t('pin.backToHomePage')}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
