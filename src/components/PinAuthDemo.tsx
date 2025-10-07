/**
 * PIN Authentication Demo Component
 * 
 * This component demonstrates the PIN authentication system
 * with all its features and flows.
 */

import React, { useState } from 'react';
import { usePinAuth } from '../hooks/usePinAuth';
import PinAuthentication from './PinAuthentication';
import PinAuthTest from './PinAuthTest';
import { 
  Shield, 
  Key, 
  Settings, 
  RefreshCw, 
  CheckCircle, 
  AlertCircle,
  ArrowLeft,
  Info,
  TestTube
} from 'lucide-react';

interface PinAuthDemoProps {
  onBackToLanding?: () => void;
  className?: string;
}

export default function PinAuthDemo({ 
  onBackToLanding, 
  className = '' 
}: PinAuthDemoProps) {
  const { 
    isPinSetup, 
    isPinAuthenticated, 
    isLoading, 
    error, 
    clearError 
  } = usePinAuth();
  
  const [showDemo, setShowDemo] = useState(false);
  const [showTests, setShowTests] = useState(false);
  const [selectedFlow, setSelectedFlow] = useState<'login' | 'setup' | 'reset' | 'change'>('login');

  const handleFlowSelect = (flow: 'login' | 'setup' | 'reset' | 'change') => {
    setSelectedFlow(flow);
    setShowDemo(true);
    clearError();
  };

  const handleBackToSelector = () => {
    setShowDemo(false);
    setShowTests(false);
    clearError();
  };

  const handleShowTests = () => {
    setShowTests(true);
    setShowDemo(false);
    clearError();
  };

  const handleSuccess = () => {
    // Show success message and return to selector
    setTimeout(() => {
      setShowDemo(false);
    }, 2000);
  };

  if (showTests) {
    return (
      <PinAuthTest
        onBack={handleBackToSelector}
        className={className}
      />
    );
  }

  if (showDemo) {
    return (
      <div className={`pin-auth-demo ${className}`}>
        <div className="min-h-screen bg-gray-50 py-8">
          <div className="max-w-2xl mx-auto px-4">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-2">
                <Shield className="w-6 h-6 text-blue-600" />
                <h1 className="text-2xl font-bold text-gray-900">
                  PIN Authentication Demo
                </h1>
              </div>
              <button
                onClick={handleBackToSelector}
                className="flex items-center text-sm text-gray-600 hover:text-gray-800 transition-colors"
              >
                <ArrowLeft className="w-4 h-4 mr-1" />
                Back to Demo
              </button>
            </div>

            {/* PIN Authentication Component */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <PinAuthentication
                initialFlow={selectedFlow}
                onSuccess={handleSuccess}
                onCancel={handleBackToSelector}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`pin-auth-demo-selector ${className}`}>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
        <div className="w-full max-w-4xl">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <Shield className="w-8 h-8 text-blue-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              PIN Authentication System Demo
            </h1>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Experience our comprehensive 5-digit PIN authentication system with 
              security features, validation, and mobile-responsive design.
            </p>
          </div>

          {/* Status Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-white rounded-lg shadow-md p-4">
              <div className="flex items-center">
                <div className={`w-3 h-3 rounded-full mr-3 ${
                  isLoading ? 'bg-yellow-400' : 
                  isPinSetup ? 'bg-green-400' : 'bg-gray-400'
                }`} />
                <div>
                  <p className="text-sm font-medium text-gray-900">PIN Status</p>
                  <p className="text-xs text-gray-600">
                    {isLoading ? 'Loading...' : 
                     isPinSetup ? 'PIN is set up' : 'No PIN set up'}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-4">
              <div className="flex items-center">
                <div className={`w-3 h-3 rounded-full mr-3 ${
                  isLoading ? 'bg-yellow-400' : 
                  isPinAuthenticated ? 'bg-green-400' : 'bg-gray-400'
                }`} />
                <div>
                  <p className="text-sm font-medium text-gray-900">Authentication</p>
                  <p className="text-xs text-gray-600">
                    {isLoading ? 'Loading...' : 
                     isPinAuthenticated ? 'Authenticated' : 'Not authenticated'}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-4">
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full mr-3 bg-green-400" />
                <div>
                  <p className="text-sm font-medium text-gray-900">System Status</p>
                  <p className="text-xs text-gray-600">Ready for demo</p>
                </div>
              </div>
            </div>
          </div>

          {/* Demo Options */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <button
              onClick={() => handleFlowSelect('login')}
              className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 hover:shadow-xl hover:border-blue-300 transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] group"
            >
              <div className="text-center">
                <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-3 group-hover:bg-blue-200 transition-colors">
                  <Key className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">PIN Login</h3>
                <p className="text-sm text-gray-600 mb-3">
                  Experience secure PIN-based authentication with 3-attempt lockout protection.
                </p>
                <div className="flex items-center justify-center text-xs text-blue-600">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  <span>3-attempt lockout</span>
                </div>
              </div>
            </button>

            <button
              onClick={() => handleFlowSelect('setup')}
              className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 hover:shadow-xl hover:border-green-300 transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] group"
            >
              <div className="text-center">
                <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-3 group-hover:bg-green-200 transition-colors">
                  <Shield className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">PIN Setup</h3>
                <p className="text-sm text-gray-600 mb-3">
                  Create a new PIN with validation, confirmation, and security checks.
                </p>
                <div className="flex items-center justify-center text-xs text-green-600">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  <span>Secure validation</span>
                </div>
              </div>
            </button>

            <button
              onClick={() => handleFlowSelect('change')}
              className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 hover:shadow-xl hover:border-purple-300 transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] group"
            >
              <div className="text-center">
                <div className="mx-auto w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-3 group-hover:bg-purple-200 transition-colors">
                  <Settings className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Change PIN</h3>
                <p className="text-sm text-gray-600 mb-3">
                  Update your PIN with current PIN verification and new PIN validation.
                </p>
                <div className="flex items-center justify-center text-xs text-purple-600">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  <span>Secure update</span>
                </div>
              </div>
            </button>

            <button
              onClick={() => handleFlowSelect('reset')}
              className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 hover:shadow-xl hover:border-orange-300 transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] group"
            >
              <div className="text-center">
                <div className="mx-auto w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mb-3 group-hover:bg-orange-200 transition-colors">
                  <RefreshCw className="w-6 h-6 text-orange-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Reset PIN</h3>
                <p className="text-sm text-gray-600 mb-3">
                  Reset your PIN using identity verification with personal information.
                </p>
                <div className="flex items-center justify-center text-xs text-orange-600">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  <span>Identity verified</span>
                </div>
              </div>
            </button>
          </div>

          {/* Features List */}
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Info className="w-5 h-5 text-blue-600 mr-2" />
              System Features
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h4 className="font-medium text-gray-900">Security Features</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• 5-digit PIN validation with pattern detection</li>
                  <li>• 3-attempt lockout mechanism (15 minutes)</li>
                  <li>• bcrypt password hashing (12 rounds)</li>
                  <li>• Device-specific encryption</li>
                  <li>• Rate limiting and security measures</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium text-gray-900">User Experience</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Mobile-responsive design</li>
                  <li>• Accessibility features (ARIA labels)</li>
                  <li>• Real-time validation feedback</li>
                  <li>• PIN strength indicators</li>
                  <li>• Show/hide PIN functionality</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <div className="flex items-start">
                <AlertCircle className="w-5 h-5 text-red-600 mr-2 mt-0.5" />
                <div>
                  <h4 className="text-sm font-medium text-red-800">System Error</h4>
                  <p className="text-sm text-red-700 mt-1">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={handleShowTests}
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-purple-600 border border-transparent rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-colors"
            >
              <TestTube className="w-4 h-4 mr-2" />
              Run Test Suite
            </button>
            <button
              onClick={onBackToLanding}
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Landing Page
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
