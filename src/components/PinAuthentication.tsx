/**
 * PIN Authentication Main Component
 * 
 * This component orchestrates the entire PIN authentication flow,
 * including setup, login, reset, and change functionality.
 */

import React, { useState, useEffect } from 'react';
import { usePinAuth } from '../hooks/usePinAuth';
import PinSetup from './PinSetup';
import PinLogin from './PinLogin';
import PinReset from './PinReset';
import PinChange from './PinChange';
import { Shield, Settings, Key, RefreshCw } from 'lucide-react';

export type PinAuthFlow = 'login' | 'setup' | 'reset' | 'change';

interface PinAuthenticationProps {
  initialFlow?: PinAuthFlow;
  onSuccess?: () => void;
  onCancel?: () => void;
  className?: string;
}

export default function PinAuthentication({ 
  initialFlow = 'login',
  onSuccess, 
  onCancel, 
  className = '' 
}: PinAuthenticationProps) {
  const { 
    isPinSetup, 
    isPinAuthenticated, 
    isLoading, 
    error, 
    clearError 
  } = usePinAuth();
  
  const [currentFlow, setCurrentFlow] = useState<PinAuthFlow>(initialFlow);
  const [showFlowSelector, setShowFlowSelector] = useState(false);

  // Clear errors when component mounts
  useEffect(() => {
    clearError();
  }, [clearError]);

  // Determine initial flow based on PIN setup status
  useEffect(() => {
    if (isLoading) return;
    
    if (!isPinSetup) {
      setCurrentFlow('setup');
    } else if (isPinAuthenticated) {
      setCurrentFlow('login');
    } else {
      setCurrentFlow('login');
    }
  }, [isPinSetup, isPinAuthenticated, isLoading]);

  const handleFlowChange = (flow: PinAuthFlow) => {
    setCurrentFlow(flow);
    setShowFlowSelector(false);
    clearError();
  };

  const handleSuccess = () => {
    onSuccess?.();
  };

  const handleCancel = () => {
    onCancel?.();
  };

  const handleForgotPin = () => {
    setCurrentFlow('reset');
  };

  const handleShowFlowSelector = () => {
    setShowFlowSelector(true);
  };

  const handleBackToLogin = () => {
    setCurrentFlow('login');
    setShowFlowSelector(false);
  };

  if (isLoading) {
    return (
      <div className={`pin-auth-loading ${className}`}>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading PIN authentication...</p>
          </div>
        </div>
      </div>
    );
  }

  if (showFlowSelector) {
    return (
      <div className={`pin-auth-selector ${className}`}>
        <div className="text-center mb-6">
          <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <Shield className="w-8 h-8 text-blue-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            PIN Authentication
          </h2>
          <p className="text-gray-600">
            Choose an option to manage your PIN
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <button
            onClick={() => handleFlowChange('login')}
            className="p-4 border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
          >
            <Key className="w-6 h-6 text-blue-600 mx-auto mb-2" />
            <h3 className="font-medium text-gray-900 mb-1">Login with PIN</h3>
            <p className="text-sm text-gray-600">Access your account using your PIN</p>
          </button>

          <button
            onClick={() => handleFlowChange('change')}
            className="p-4 border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
          >
            <Settings className="w-6 h-6 text-blue-600 mx-auto mb-2" />
            <h3 className="font-medium text-gray-900 mb-1">Change PIN</h3>
            <p className="text-sm text-gray-600">Update your current PIN</p>
          </button>

          <button
            onClick={() => handleFlowChange('reset')}
            className="p-4 border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
          >
            <RefreshCw className="w-6 h-6 text-blue-600 mx-auto mb-2" />
            <h3 className="font-medium text-gray-900 mb-1">Reset PIN</h3>
            <p className="text-sm text-gray-600">Reset PIN using identity verification</p>
          </button>

          <button
            onClick={() => handleFlowChange('setup')}
            className="p-4 border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
          >
            <Shield className="w-6 h-6 text-blue-600 mx-auto mb-2" />
            <h3 className="font-medium text-gray-900 mb-1">Setup PIN</h3>
            <p className="text-sm text-gray-600">Create a new PIN for your account</p>
          </button>
        </div>

        <div className="text-center">
          <button
            onClick={handleBackToLogin}
            className="text-sm text-gray-600 hover:text-gray-800 transition-colors"
          >
            ← Back to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`pin-authentication ${className}`}>
      {/* Flow Navigation */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <Shield className="w-5 h-5 text-blue-600" />
          <h1 className="text-lg font-semibold text-gray-900">
            {currentFlow === 'login' && 'PIN Login'}
            {currentFlow === 'setup' && 'PIN Setup'}
            {currentFlow === 'reset' && 'PIN Reset'}
            {currentFlow === 'change' && 'Change PIN'}
          </h1>
        </div>
        
        <button
          onClick={handleShowFlowSelector}
          className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
        >
          Options
        </button>
      </div>

      {/* Flow Content */}
      {currentFlow === 'login' && (
        <PinLogin
          onSuccess={handleSuccess}
          onForgotPin={handleForgotPin}
        />
      )}

      {currentFlow === 'setup' && (
        <PinSetup
          onComplete={handleSuccess}
          onCancel={handleCancel}
        />
      )}

      {currentFlow === 'reset' && (
        <PinReset
          onSuccess={handleSuccess}
          onCancel={handleBackToLogin}
        />
      )}

      {currentFlow === 'change' && (
        <PinChange
          onSuccess={handleSuccess}
          onCancel={handleBackToLogin}
        />
      )}

      {/* Global Error Display */}
      {error && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                Authentication Error
              </h3>
              <div className="mt-1 text-sm text-red-700">
                {error}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Security Footer */}
      <div className="mt-8 pt-4 border-t border-gray-200">
        <div className="text-center">
          <div className="flex items-center justify-center space-x-2 text-xs text-gray-500">
            <Shield className="w-3 h-3" />
            <span>Secure PIN Authentication</span>
            <span>•</span>
            <span>Encrypted Storage</span>
            <span>•</span>
            <span>Device Protected</span>
          </div>
        </div>
      </div>
    </div>
  );
}
