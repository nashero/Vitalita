/**
 * PIN Login Screen Component
 * 
 * This component provides a full-screen PIN login interface for repeat donors
 * who have already set up their PIN. It includes fallback to traditional login.
 */

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Key, User, Shield, AlertCircle } from 'lucide-react';
import PinLogin from './PinLogin';
import PinReset from './PinReset';
import LoginForm from './LoginForm';
import { usePinAuth } from '../hooks/usePinAuth';
import { hasValidPinData } from '../utils/pinStorage';
import LanguageSwitcher from './LanguageSwitcher';

interface PinLoginScreenProps {
  onSuccess?: () => void;
  onBackToLanding?: () => void;
  onTraditionalLogin?: () => void;
  onPinSetup?: () => void; // Add callback for PIN setup after reset
  className?: string;
}

export default function PinLoginScreen({ 
  onSuccess, 
  onBackToLanding,
  onTraditionalLogin,
  onPinSetup,
  className = '' 
}: PinLoginScreenProps) {
  const { t } = useTranslation();
  const { isPinSetup, isLoading } = usePinAuth();
  const [showTraditionalLogin, setShowTraditionalLogin] = useState(false);
  const [showPinReset, setShowPinReset] = useState(false);
  const [hasPin, setHasPin] = useState(false);
  const [checkingPin, setCheckingPin] = useState(true);

  // Check if user has a PIN set up
  useEffect(() => {
    const checkPinStatus = async () => {
      try {
        setCheckingPin(true);
        const pinExists = await hasValidPinData();
        setHasPin(pinExists);
        console.log('PIN status check:', { pinExists, isPinSetup });
      } catch (error) {
        console.error('Error checking PIN status:', error);
        setHasPin(false);
      } finally {
        setCheckingPin(false);
      }
    };

    checkPinStatus();
  }, [isPinSetup]);

  const handlePinLoginSuccess = () => {
    console.log('PIN login successful');
    onSuccess?.();
  };

  const handleForgotPin = () => {
    console.log('Forgot PIN - showing PIN reset');
    setShowPinReset(true);
  };

  const handleBackToPinLogin = () => {
    setShowTraditionalLogin(false);
    setShowPinReset(false);
  };

  const handlePinResetSuccess = () => {
    console.log('PIN reset successful - redirecting to PIN setup');
    setShowPinReset(false);
    // After PIN reset, redirect to PIN setup if callback is provided
    if (onPinSetup) {
      onPinSetup();
    } else {
      // Fallback: Force a re-check of PIN status which will show PIN setup
      setHasPin(false);
      setCheckingPin(true);
      setTimeout(async () => {
        const pinExists = await hasValidPinData();
        setHasPin(pinExists);
        setCheckingPin(false);
        console.log('PIN status after reset:', { pinExists });
      }, 100);
    }
  };

  const handlePinResetCancel = () => {
    setShowPinReset(false);
  };

  const handleTraditionalLoginSuccess = () => {
    console.log('Traditional login successful');
    onSuccess?.();
  };

  if (checkingPin || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-pink-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">{t('pin.checkingAuthStatus')}</p>
        </div>
      </div>
    );
  }

  // If no PIN is set up, show traditional login
  if (!hasPin && !isPinSetup) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-pink-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Back to Home Button */}
          {onBackToLanding && (
            <div className="mb-4 flex justify-between items-center">
              <button
                onClick={onBackToLanding}
                className="flex items-center text-gray-600 hover:text-gray-800 transition-colors px-3 py-2 rounded-lg hover:bg-white/50"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                {t('dashboard.backToLanding')}
              </button>
              <LanguageSwitcher variant="minimal" />
            </div>
          )}
          
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-red-600 to-red-700 px-8 py-6">
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <div className="bg-white/20 p-3 rounded-full">
                    <User className="w-8 h-8 text-white" />
                  </div>
                </div>
                <h1 className="text-2xl font-bold text-white">{t('loginMode.donorPortal')}</h1>
                <p className="text-red-100 text-sm mt-1">
                  {t('loginMode.donorPortalDesc')}
                </p>
              </div>
            </div>

            <div className="px-8 py-8">
              <div className="text-center mb-6">
                <Key className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <h2 className="text-lg font-semibold text-gray-900 mb-2">
                  {t('pin.noPinSetUp')}
                </h2>
                <p className="text-gray-600 text-sm mb-6">
                  {t('pin.noPinDescription')}
                </p>
                
                <div className="space-y-3">
                  <button
                    onClick={onSuccess}
                    className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center"
                  >
                    <Key className="w-5 h-5 mr-2" />
                    Set Up PIN
                  </button>
                  
                  {onTraditionalLogin && (
                    <button
                      onClick={onTraditionalLogin}
                      className="w-full bg-gray-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-gray-700 transition-colors flex items-center justify-center"
                    >
                      <User className="w-5 h-5 mr-2" />
                      Use Traditional Login
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show PIN reset if requested
  if (showPinReset) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-pink-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Back to Home Button */}
          {onBackToLanding && (
            <div className="mb-4 flex justify-between items-center">
              <button
                onClick={onBackToLanding}
                className="flex items-center text-gray-600 hover:text-gray-800 transition-colors px-3 py-2 rounded-lg hover:bg-white/50"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                {t('dashboard.backToLanding')}
              </button>
              <LanguageSwitcher variant="minimal" />
            </div>
          )}
          
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-orange-600 to-orange-700 px-8 py-6">
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <div className="bg-white/20 p-3 rounded-full">
                    <Shield className="w-8 h-8 text-white" />
                  </div>
                </div>
                <h1 className="text-2xl font-bold text-white">PIN Reset</h1>
                <p className="text-orange-100 text-sm mt-1">
                  Verify your identity to reset your PIN
                </p>
              </div>
            </div>

            {/* PIN Reset Component */}
            <div className="px-8 py-8">
              <PinReset 
                onSuccess={handlePinResetSuccess}
                onCancel={handlePinResetCancel}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show traditional login if requested - redirect to traditional login route
  if (showTraditionalLogin) {
    // Instead of rendering nested LoginForm, redirect to traditional login
    if (onTraditionalLogin) {
      onTraditionalLogin();
      return null;
    }
    
    // Fallback: show a simple message
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-pink-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-red-600 to-red-700 px-8 py-6">
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <div className="bg-white/20 p-3 rounded-full">
                    <User className="w-8 h-8 text-white" />
                  </div>
                </div>
                <h1 className="text-2xl font-bold text-white">{t('loginMode.donorPortal')}</h1>
                <p className="text-red-100 text-sm mt-1">
                  {t('loginMode.donorPortalDesc')}
                </p>
              </div>
            </div>
            
            <div className="px-8 py-8 text-center">
              <p className="text-gray-600 mb-6">
                Redirecting to traditional login...
              </p>
              <button
                onClick={handleBackToPinLogin}
                className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
              >
                Back to PIN Login
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show PIN login screen
  return (
    <div className={`min-h-screen bg-gradient-to-br from-red-50 via-white to-pink-50 flex items-center justify-center p-4 ${className}`}>
      <div className="w-full max-w-md">
        {/* Back to Home Button */}
        {onBackToLanding && (
          <div className="mb-4 flex justify-between items-center">
            <button
              onClick={onBackToLanding}
              className="flex items-center text-gray-600 hover:text-gray-800 transition-colors px-3 py-2 rounded-lg hover:bg-white/50"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              {t('dashboard.backToLanding')}
            </button>
            <LanguageSwitcher variant="minimal" />
          </div>
        )}
        
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-red-600 to-red-700 px-8 py-6">
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <div className="bg-white/20 p-3 rounded-full">
                  <Key className="w-8 h-8 text-white" />
                </div>
              </div>
              <h1 className="text-2xl font-bold text-white">{t('pin.login')}</h1>
              <p className="text-red-100 text-sm mt-1">
                {t('pin.loginSubtitle')}
              </p>
            </div>
          </div>

          {/* PIN Login Component */}
          <div className="px-8 py-8">
            <PinLogin 
              onSuccess={handlePinLoginSuccess}
              onForgotPin={handleForgotPin}
            />

            {/* Alternative Login Option */}
            <div className="mt-6 pt-6 border-t border-gray-100">
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-3">
                  {t('pin.preferPersonalInfo')}
                </p>
                <button
                  onClick={() => setShowTraditionalLogin(true)}
                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors duration-200"
                >
                  <User className="w-4 h-4 mr-2" />
                  {t('pin.useTraditionalLogin')}
                </button>
              </div>
            </div>

            {/* Security Notice */}
            <div className="mt-6 pt-6 border-t border-gray-100">
              <div className="flex items-center justify-center text-xs text-gray-500">
                <Shield className="w-3 h-3 mr-1" />
                {t('pin.securePinAuth')}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-sm text-gray-500">
            {t('pin.contactAvisAdmin')}
          </p>
        </div>
      </div>
    </div>
  );
}
