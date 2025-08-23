import React, { useState } from 'react';
import { CredentialForm, DonorCredentials, getStorageInfo, getDeviceAuthStats } from './index';

export const DemoPage: React.FC = () => {
  const [storageInfo, setStorageInfo] = useState(getStorageInfo());
  const [deviceStats, setDeviceStats] = useState(getDeviceAuthStats());
  const [lastAction, setLastAction] = useState<string>('');

  const handleCredentialsStored = (credentials: DonorCredentials) => {
    setLastAction(`Credentials stored for ${credentials.firstName} ${credentials.lastName}`);
    setStorageInfo(getStorageInfo());
    setDeviceStats(getDeviceAuthStats());
  };

  const handleCredentialsRetrieved = (credentials: DonorCredentials) => {
    setLastAction(`Credentials retrieved for ${credentials.firstName} ${credentials.lastName}`);
    setStorageInfo(getStorageInfo());
  };

  const refreshStats = () => {
    setStorageInfo(getStorageInfo());
    setDeviceStats(getDeviceAuthStats());
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Secure Donor Credentials Demo
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            This demo showcases the secure donor credential collection system with local-only encrypted storage, 
            device authentication, and comprehensive validation.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2">
            <CredentialForm
              onCredentialsStored={handleCredentialsStored}
              onCredentialsRetrieved={handleCredentialsRetrieved}
              showPrivacyNotice={true}
            />
          </div>

          {/* Sidebar with Stats and Info */}
          <div className="space-y-6">
            {/* Storage Information */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Storage Status</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Has Credentials:</span>
                  <span className={`font-medium ${
                    storageInfo.hasCredentials ? 'text-green-600' : 'text-gray-400'
                  }`}>
                    {storageInfo.hasCredentials ? 'Yes' : 'No'}
                  </span>
                </div>
                
                {storageInfo.storedAt && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Stored At:</span>
                    <span className="text-sm text-gray-900">
                      {new Date(storageInfo.storedAt).toLocaleString()}
                    </span>
                  </div>
                )}
                
                {storageInfo.expiresAt && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Expires At:</span>
                    <span className={`text-sm ${
                      storageInfo.isExpired ? 'text-red-600' : 'text-gray-900'
                    }`}>
                      {new Date(storageInfo.expiresAt).toLocaleString()}
                    </span>
                  </div>
                )}
                
                {storageInfo.hasCredentials && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status:</span>
                    <span className={`text-sm font-medium ${
                      storageInfo.isExpired ? 'text-red-600' : 'text-green-600'
                    }`}>
                      {storageInfo.isExpired ? 'Expired' : 'Valid'}
                    </span>
                  </div>
                )}
              </div>
              
              <button
                onClick={refreshStats}
                className="mt-4 w-full px-3 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
              >
                Refresh Stats
              </button>
            </div>

            {/* Device Authentication Stats */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Device Authentication</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Auths:</span>
                  <span className="font-medium text-gray-900">
                    {deviceStats.totalAuthentications}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Failed Attempts:</span>
                  <span className={`font-medium ${
                    deviceStats.failedAttempts > 0 ? 'text-red-600' : 'text-gray-900'
                  }`}>
                    {deviceStats.failedAttempts}
                  </span>
                </div>
                
                {deviceStats.lastSuccessfulAuth && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Last Auth:</span>
                    <span className="text-sm text-gray-900">
                      {new Date(deviceStats.lastSuccessfulAuth).toLocaleString()}
                    </span>
                  </div>
                )}
                
                {deviceStats.deviceInfo && (
                  <div className="pt-2 border-t border-gray-200">
                    <div className="text-xs text-gray-500">
                      <div>Platform: {deviceStats.deviceInfo.platform}</div>
                      <div>Screen: {deviceStats.deviceInfo.screenResolution}</div>
                      <div>Browser: {deviceStats.deviceInfo.userAgent.split(' ').slice(-2).join(' ')}</div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Last Action */}
            {lastAction && (
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Last Action</h3>
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                  <p className="text-sm text-blue-800">{lastAction}</p>
                </div>
              </div>
            )}

            {/* Security Features */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Security Features</h3>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center">
                  <svg className="h-4 w-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  AES-256-GCM Encryption
                </div>
                <div className="flex items-center">
                  <svg className="h-4 w-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Device Fingerprinting
                </div>
                <div className="flex items-center">
                  <svg className="h-4 w-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Local-Only Storage
                </div>
                <div className="flex items-center">
                  <svg className="h-4 w-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Input Validation
                </div>
                <div className="flex items-center">
                  <svg className="h-4 w-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Auto-Expiration
                </div>
              </div>
            </div>

            {/* Browser Compatibility */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Browser Support</h3>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center">
                  <svg className="h-4 w-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Chrome 60+
                </div>
                <div className="flex items-center">
                  <svg className="h-4 w-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Firefox 55+
                </div>
                <div className="flex items-center">
                  <svg className="h-4 w-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Safari 11+
                </div>
                <div className="flex items-center">
                  <svg className="h-4 w-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Edge 79+
                </div>
              </div>
              <div className="mt-3 p-2 bg-blue-50 border border-blue-200 rounded text-xs text-blue-800">
                Requires Web Crypto API support
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 text-center text-gray-500">
          <p className="text-sm">
            This is a demonstration of the secure donor credential collection system. 
            All data is stored locally and encrypted on your device only.
          </p>
        </div>
      </div>
    </div>
  );
};
