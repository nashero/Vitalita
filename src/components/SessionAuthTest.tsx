/**
 * Session Authentication Test Component
 * 
 * This component provides a simple interface to test the session-based PIN authentication
 * functionality. It shows session status and allows testing the flow.
 */

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Shield, Key, User, Clock, CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { usePinAuth } from '../hooks/usePinAuth';
import { 
  hasActivePinSession, 
  getSessionInfo, 
  validatePinSession,
  clearPinSession,
  extendPinSession
} from '../utils/sessionManager';

interface SessionAuthTestProps {
  onBack?: () => void;
}

export default function SessionAuthTest({ onBack }: SessionAuthTestProps) {
  const { t } = useTranslation();
  const { donor, hasActivePinSession: authHasActivePinSession, getPinSessionInfo } = useAuth();
  const { isPinAuthenticated, hasActivePinSession: pinAuthHasActivePinSession } = usePinAuth();
  
  const [sessionStatus, setSessionStatus] = useState<any>(null);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  const updateSessionStatus = () => {
    const hasSession = hasActivePinSession();
    const sessionInfo = getSessionInfo();
    const validation = validatePinSession();
    
    setSessionStatus({
      hasActiveSession: hasSession,
      sessionInfo,
      validation,
      donor: donor ? {
        donorId: donor.donor_id,
        donorHashId: donor.donor_hash_id.substring(0, 8) + '...',
        isActive: donor.is_active
      } : null,
      isPinAuthenticated,
      timestamp: new Date()
    });
    setLastUpdate(new Date());
  };

  useEffect(() => {
    updateSessionStatus();
    
    // Update every 5 seconds
    const interval = setInterval(updateSessionStatus, 5000);
    return () => clearInterval(interval);
  }, [donor, isPinAuthenticated]);

  const handleClearSession = () => {
    clearPinSession();
    updateSessionStatus();
  };

  const handleExtendSession = () => {
    const extended = extendPinSession();
    if (extended) {
      updateSessionStatus();
    }
  };

  const formatTimeRemaining = (timeRemaining: number) => {
    if (timeRemaining <= 0) return 'Expired';
    
    const hours = Math.floor(timeRemaining / 60);
    const minutes = timeRemaining % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Shield className="w-8 h-8 text-blue-600 mr-3" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Session Authentication Test</h1>
                <p className="text-gray-600">Test session-based PIN authentication functionality</p>
              </div>
            </div>
            {onBack && (
              <button
                onClick={onBack}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Back
              </button>
            )}
          </div>
        </div>

        {/* Session Status */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Current Session Status */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Key className="w-5 h-5 mr-2" />
              Current Session Status
            </h2>
            
            {sessionStatus ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Active Session:</span>
                  <div className="flex items-center">
                    {sessionStatus.hasActiveSession ? (
                      <CheckCircle className="w-4 h-4 text-green-600 mr-1" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-600 mr-1" />
                    )}
                    <span className={`text-sm font-medium ${
                      sessionStatus.hasActiveSession ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {sessionStatus.hasActiveSession ? 'Yes' : 'No'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">PIN Authenticated:</span>
                  <div className="flex items-center">
                    {sessionStatus.isPinAuthenticated ? (
                      <CheckCircle className="w-4 h-4 text-green-600 mr-1" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-600 mr-1" />
                    )}
                    <span className={`text-sm font-medium ${
                      sessionStatus.isPinAuthenticated ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {sessionStatus.isPinAuthenticated ? 'Yes' : 'No'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Donor Authenticated:</span>
                  <div className="flex items-center">
                    {sessionStatus.donor ? (
                      <CheckCircle className="w-4 h-4 text-green-600 mr-1" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-600 mr-1" />
                    )}
                    <span className={`text-sm font-medium ${
                      sessionStatus.donor ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {sessionStatus.donor ? 'Yes' : 'No'}
                    </span>
                  </div>
                </div>

                {sessionStatus.sessionInfo && sessionStatus.sessionInfo.isActive && (
                  <>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Session ID:</span>
                      <span className="text-sm font-mono text-gray-900">
                        {sessionStatus.sessionInfo.sessionId?.substring(0, 12)}...
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Time Remaining:</span>
                      <span className="text-sm font-medium text-gray-900">
                        {formatTimeRemaining(Math.floor(sessionStatus.sessionInfo.timeRemaining / (1000 * 60)))}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Expires At:</span>
                      <span className="text-sm text-gray-900">
                        {sessionStatus.sessionInfo.expiresAt?.toLocaleTimeString()}
                      </span>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="text-center py-4">
                <RefreshCw className="w-6 h-6 animate-spin text-gray-400 mx-auto mb-2" />
                <p className="text-gray-600">Loading session status...</p>
              </div>
            )}
          </div>

          {/* Donor Information */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <User className="w-5 h-5 mr-2" />
              Donor Information
            </h2>
            
            {sessionStatus?.donor ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Donor ID:</span>
                  <span className="text-sm font-mono text-gray-900">
                    {sessionStatus.donor.donorId}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Hash ID:</span>
                  <span className="text-sm font-mono text-gray-900">
                    {sessionStatus.donor.donorHashId}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Account Status:</span>
                  <div className="flex items-center">
                    {sessionStatus.donor.isActive ? (
                      <CheckCircle className="w-4 h-4 text-green-600 mr-1" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-600 mr-1" />
                    )}
                    <span className={`text-sm font-medium ${
                      sessionStatus.donor.isActive ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {sessionStatus.donor.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-4">
                <User className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-600">No donor authenticated</p>
              </div>
            )}
          </div>
        </div>

        {/* Session Actions */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Session Actions</h2>
          
          <div className="flex flex-wrap gap-4">
            <button
              onClick={updateSessionStatus}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh Status
            </button>

            {sessionStatus?.hasActiveSession && (
              <button
                onClick={handleExtendSession}
                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Clock className="w-4 h-4 mr-2" />
                Extend Session
              </button>
            )}

            {sessionStatus?.hasActiveSession && (
              <button
                onClick={handleClearSession}
                className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                <XCircle className="w-4 h-4 mr-2" />
                Clear Session
              </button>
            )}
          </div>
        </div>

        {/* Last Update */}
        <div className="text-center text-sm text-gray-500">
          Last updated: {lastUpdate.toLocaleTimeString()}
        </div>
      </div>
    </div>
  );
}
