/**
 * Session Debug Test Component
 * 
 * This component helps debug session-related issues by showing
 * the current session state and allowing manual testing.
 */

import React, { useState, useEffect } from 'react';
import { Shield, Key, User, RefreshCw, Trash2, Plus } from 'lucide-react';
import { 
  hasActivePinSession, 
  getSessionInfo, 
  validatePinSession,
  clearPinSession,
  createPinSession,
  getPinSession
} from '../utils/sessionManager';

export default function SessionDebugTest() {
  const [sessionState, setSessionState] = useState<any>(null);
  const [testDonorId, setTestDonorId] = useState('test-donor-123');
  const [testDonorHashId, setTestDonorHashId] = useState('test-hash-456');

  const updateSessionState = () => {
    const hasSession = hasActivePinSession();
    const sessionInfo = getSessionInfo();
    const validation = validatePinSession();
    const rawSession = getPinSession();
    
    setSessionState({
      hasActiveSession: hasSession,
      sessionInfo,
      validation,
      rawSession,
      timestamp: new Date().toISOString()
    });
  };

  useEffect(() => {
    updateSessionState();
  }, []);

  const handleCreateTestSession = () => {
    console.log('Creating test session...');
    createPinSession(testDonorId, testDonorHashId);
    setTimeout(updateSessionState, 100);
  };

  const handleClearSession = () => {
    console.log('Clearing session...');
    clearPinSession();
    setTimeout(updateSessionState, 100);
  };

  const handleRefresh = () => {
    updateSessionState();
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
                <h1 className="text-2xl font-bold text-gray-900">Session Debug Test</h1>
                <p className="text-gray-600">Debug session-related issues</p>
              </div>
            </div>
            <button
              onClick={handleRefresh}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </button>
          </div>
        </div>

        {/* Session State */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Current State */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Key className="w-5 h-5 mr-2" />
              Current Session State
            </h2>
            
            {sessionState ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Has Active Session:</span>
                  <span className={`text-sm font-medium ${
                    sessionState.hasActiveSession ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {sessionState.hasActiveSession ? 'Yes' : 'No'}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Validation Valid:</span>
                  <span className={`text-sm font-medium ${
                    sessionState.validation.isValid ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {sessionState.validation.isValid ? 'Yes' : 'No'}
                  </span>
                </div>

                {sessionState.validation.error && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Error:</span>
                    <span className="text-sm text-red-600">{sessionState.validation.error}</span>
                  </div>
                )}

                {sessionState.sessionInfo && sessionState.sessionInfo.isActive && (
                  <>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Donor ID:</span>
                      <span className="text-sm font-mono text-gray-900">
                        {sessionState.sessionInfo.donorId}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Session ID:</span>
                      <span className="text-sm font-mono text-gray-900">
                        {sessionState.sessionInfo.sessionId?.substring(0, 12)}...
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Expires At:</span>
                      <span className="text-sm text-gray-900">
                        {sessionState.sessionInfo.expiresAt?.toLocaleString()}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Time Remaining:</span>
                      <span className="text-sm text-gray-900">
                        {Math.floor(sessionState.sessionInfo.timeRemaining / (1000 * 60))} minutes
                      </span>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="text-center py-4">
                <RefreshCw className="w-6 h-6 animate-spin text-gray-400 mx-auto mb-2" />
                <p className="text-gray-600">Loading session state...</p>
              </div>
            )}
          </div>

          {/* Raw Session Data */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <User className="w-5 h-5 mr-2" />
              Raw Session Data
            </h2>
            
            {sessionState?.rawSession ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Donor ID:</span>
                  <span className="text-sm font-mono text-gray-900">
                    {sessionState.rawSession.donorId}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Hash ID:</span>
                  <span className="text-sm font-mono text-gray-900">
                    {sessionState.rawSession.donorHashId.substring(0, 12)}...
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Is Authenticated:</span>
                  <span className={`text-sm font-medium ${
                    sessionState.rawSession.isAuthenticated ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {sessionState.rawSession.isAuthenticated ? 'Yes' : 'No'}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Session ID:</span>
                  <span className="text-sm font-mono text-gray-900">
                    {sessionState.rawSession.sessionId}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Created:</span>
                  <span className="text-sm text-gray-900">
                    {new Date(sessionState.rawSession.timestamp).toLocaleString()}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Expires:</span>
                  <span className="text-sm text-gray-900">
                    {new Date(sessionState.rawSession.expiresAt).toLocaleString()}
                  </span>
                </div>
              </div>
            ) : (
              <div className="text-center py-4">
                <User className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-600">No session data found</p>
              </div>
            )}
          </div>
        </div>

        {/* Test Actions */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Test Actions</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Create Test Session */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-gray-700">Create Test Session</h3>
              <div className="space-y-2">
                <input
                  type="text"
                  value={testDonorId}
                  onChange={(e) => setTestDonorId(e.target.value)}
                  placeholder="Donor ID"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
                <input
                  type="text"
                  value={testDonorHashId}
                  onChange={(e) => setTestDonorHashId(e.target.value)}
                  placeholder="Donor Hash ID"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
                <button
                  onClick={handleCreateTestSession}
                  className="w-full flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Test Session
                </button>
              </div>
            </div>

            {/* Clear Session */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-gray-700">Clear Session</h3>
              <button
                onClick={handleClearSession}
                className="w-full flex items-center justify-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Clear Session
              </button>
            </div>
          </div>
        </div>

        {/* Last Update */}
        <div className="text-center text-sm text-gray-500">
          Last updated: {sessionState?.timestamp}
        </div>
      </div>
    </div>
  );
}
