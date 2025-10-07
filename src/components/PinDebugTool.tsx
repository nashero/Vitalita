/**
 * PIN Debug Tool Component
 * 
 * This component provides debugging utilities for PIN authentication
 * and helps troubleshoot PIN-related issues.
 */

import React, { useState, useEffect } from 'react';
import { usePinAuth } from '../hooks/usePinAuth';
import { hasValidPinData, clearPinData } from '../utils/pinStorage';
import { AlertCircle, CheckCircle, Trash2, RefreshCw } from 'lucide-react';

export default function PinDebugTool() {
  const { isPinSetup, isPinAuthenticated, isLoading, error, lockoutInfo } = usePinAuth();
  const [pinStatus, setPinStatus] = useState<any>(null);
  const [isChecking, setIsChecking] = useState(false);

  const checkPinStatus = async () => {
    setIsChecking(true);
    try {
      const hasPin = await hasValidPinData();
      setPinStatus({
        hasPin,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        localStorage: {
          available: typeof localStorage !== 'undefined',
          keys: typeof localStorage !== 'undefined' ? Object.keys(localStorage) : []
        }
      });
    } catch (error) {
      console.error('Error checking PIN status:', error);
      setPinStatus({ error: error.message });
    } finally {
      setIsChecking(false);
    }
  };

  const clearAllPinData = () => {
    if (window.confirm('Are you sure you want to clear all PIN data? This cannot be undone.')) {
      clearPinData();
      checkPinStatus();
    }
  };

  useEffect(() => {
    checkPinStatus();
  }, []);

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">PIN Authentication Debug Tool</h1>
      
      {/* PIN Auth Hook Status */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <h2 className="text-lg font-semibold text-gray-800 mb-3">PIN Auth Hook Status</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className={`w-8 h-8 rounded-full mx-auto mb-2 flex items-center justify-center ${isPinSetup ? 'bg-green-100' : 'bg-red-100'}`}>
              {isPinSetup ? <CheckCircle className="w-5 h-5 text-green-600" /> : <AlertCircle className="w-5 h-5 text-red-600" />}
            </div>
            <p className="text-sm font-medium text-gray-700">PIN Setup</p>
            <p className="text-xs text-gray-500">{isPinSetup ? 'Yes' : 'No'}</p>
          </div>
          
          <div className="text-center">
            <div className={`w-8 h-8 rounded-full mx-auto mb-2 flex items-center justify-center ${isPinAuthenticated ? 'bg-green-100' : 'bg-gray-100'}`}>
              {isPinAuthenticated ? <CheckCircle className="w-5 h-5 text-green-600" /> : <AlertCircle className="w-5 h-5 text-gray-600" />}
            </div>
            <p className="text-sm font-medium text-gray-700">Authenticated</p>
            <p className="text-xs text-gray-500">{isPinAuthenticated ? 'Yes' : 'No'}</p>
          </div>
          
          <div className="text-center">
            <div className={`w-8 h-8 rounded-full mx-auto mb-2 flex items-center justify-center ${isLoading ? 'bg-yellow-100' : 'bg-gray-100'}`}>
              {isLoading ? <RefreshCw className="w-5 h-5 text-yellow-600 animate-spin" /> : <CheckCircle className="w-5 h-5 text-gray-600" />}
            </div>
            <p className="text-sm font-medium text-gray-700">Loading</p>
            <p className="text-xs text-gray-500">{isLoading ? 'Yes' : 'No'}</p>
          </div>
          
          <div className="text-center">
            <div className={`w-8 h-8 rounded-full mx-auto mb-2 flex items-center justify-center ${error ? 'bg-red-100' : 'bg-green-100'}`}>
              {error ? <AlertCircle className="w-5 h-5 text-red-600" /> : <CheckCircle className="w-5 h-5 text-green-600" />}
            </div>
            <p className="text-sm font-medium text-gray-700">Error</p>
            <p className="text-xs text-gray-500">{error ? 'Yes' : 'No'}</p>
          </div>
        </div>
        
        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}
      </div>

      {/* Lockout Info */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <h2 className="text-lg font-semibold text-gray-800 mb-3">Lockout Information</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div>
            <p className="text-sm font-medium text-gray-700">Is Locked</p>
            <p className="text-xs text-gray-500">{lockoutInfo.isLocked ? 'Yes' : 'No'}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-700">Attempts Remaining</p>
            <p className="text-xs text-gray-500">{lockoutInfo.attemptsRemaining}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-700">Lockout Expires</p>
            <p className="text-xs text-gray-500">
              {lockoutInfo.lockoutExpiresAt 
                ? new Date(lockoutInfo.lockoutExpiresAt).toLocaleString()
                : 'N/A'
              }
            </p>
          </div>
        </div>
      </div>

      {/* PIN Storage Status */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <h2 className="text-lg font-semibold text-gray-800 mb-3">PIN Storage Status</h2>
        <div className="flex items-center justify-between mb-3">
          <button
            onClick={checkPinStatus}
            disabled={isChecking}
            className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isChecking ? 'animate-spin' : ''}`} />
            {isChecking ? 'Checking...' : 'Check Status'}
          </button>
          
          <button
            onClick={clearAllPinData}
            className="flex items-center px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Clear All PIN Data
          </button>
        </div>
        
        {pinStatus && (
          <div className="bg-white p-4 rounded-lg border">
            <pre className="text-xs text-gray-700 overflow-auto">
              {JSON.stringify(pinStatus, null, 2)}
            </pre>
          </div>
        )}
      </div>

      {/* Browser Compatibility */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <h2 className="text-lg font-semibold text-gray-800 mb-3">Browser Compatibility</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-sm font-medium text-gray-700">Local Storage</p>
            <p className="text-xs text-gray-500">{typeof localStorage !== 'undefined' ? 'Available' : 'Not Available'}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-700">Session Storage</p>
            <p className="text-xs text-gray-500">{typeof sessionStorage !== 'undefined' ? 'Available' : 'Not Available'}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-700">Crypto API</p>
            <p className="text-xs text-gray-500">{typeof crypto !== 'undefined' ? 'Available' : 'Not Available'}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-700">HTTPS</p>
            <p className="text-xs text-gray-500">{window.location.protocol === 'https:' ? 'Yes' : 'No'}</p>
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="p-4 bg-blue-50 rounded-lg">
        <h2 className="text-lg font-semibold text-blue-800 mb-3">Debug Instructions</h2>
        <ul className="text-sm text-blue-700 space-y-2">
          <li>• Use "Check Status" to verify PIN storage state</li>
          <li>• Use "Clear All PIN Data" to reset PIN authentication</li>
          <li>• Check browser compatibility if PIN features aren't working</li>
          <li>• Review lockout information if login attempts are failing</li>
          <li>• Check console for detailed error messages</li>
        </ul>
      </div>
    </div>
  );
}