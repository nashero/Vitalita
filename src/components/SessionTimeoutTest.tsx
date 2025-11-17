/**
 * Session Timeout Test Component
 * 
 * This component provides a simple interface to test session timeout functionality
 * in development mode.
 */

import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { usePinAuth } from '../hooks/usePinAuth';
import { Clock, Play, Pause, RotateCcw, AlertTriangle } from 'lucide-react';

export default function SessionTimeoutTest() {
  const { 
    donor,
    getSessionTimeoutState: authGetSessionTimeoutState,
    resetSessionTimeout: authResetSessionTimeout,
    extendSession: authExtendSession,
    pauseSessionTimeout: authPauseSessionTimeout,
    resumeSessionTimeout: authResumeSessionTimeout
  } = useAuth();
  
  const { 
    isPinAuthenticated,
    getSessionTimeoutState: pinGetSessionTimeoutState,
    resetSessionTimeout: pinResetSessionTimeout,
    extendSession: pinExtendSession,
    pauseSessionTimeout: pinPauseSessionTimeout,
    resumeSessionTimeout: pinResumeSessionTimeout
  } = usePinAuth();

  const [isPaused, setIsPaused] = useState(false);

  // Get current timeout state
  const getCurrentTimeoutState = () => {
    if (isPinAuthenticated) {
      return pinGetSessionTimeoutState();
    }
    return authGetSessionTimeoutState();
  };

  const timeoutState = getCurrentTimeoutState();

  // Control functions
  const resetTimeout = () => {
    if (isPinAuthenticated) {
      pinResetSessionTimeout();
    } else {
      authResetSessionTimeout();
    }
  };

  const extendSession = () => {
    if (isPinAuthenticated) {
      pinExtendSession();
    } else {
      authExtendSession();
    }
  };

  const pauseTimeout = () => {
    if (isPinAuthenticated) {
      pinPauseSessionTimeout();
    } else {
      authPauseSessionTimeout();
    }
    setIsPaused(true);
  };

  const resumeTimeout = () => {
    if (isPinAuthenticated) {
      pinResumeSessionTimeout();
    } else {
      authResumeSessionTimeout();
    }
    setIsPaused(false);
  };

  const formatTime = (ms: number): string => {
    const minutes = Math.floor(ms / (1000 * 60));
    const seconds = Math.floor((ms % (1000 * 60)) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const getStatusColor = () => {
    if (timeoutState.isExpired) return 'text-red-600';
    if (timeoutState.isWarning) return 'text-orange-600';
    return 'text-green-600';
  };

  const getStatusIcon = () => {
    if (timeoutState.isExpired) return <AlertTriangle className="w-5 h-5" />;
    if (timeoutState.isWarning) return <AlertTriangle className="w-5 h-5" />;
    return <Clock className="w-5 h-5" />;
  };

  if (!donor && !isPinAuthenticated) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-center">
          <AlertTriangle className="w-5 h-5 text-yellow-600 mr-2" />
          <span className="text-yellow-800">
            Session timeout test is only available when authenticated.
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
        <Clock className="w-5 h-5 mr-2" />
        Session Timeout Test
      </h3>

      {/* Status Display */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Status:</span>
          <span className={`text-sm font-semibold ${getStatusColor()} flex items-center`}>
            {getStatusIcon()}
            <span className="ml-1">
              {timeoutState.isExpired ? 'Expired' : 
               timeoutState.isWarning ? 'Warning' : 
               timeoutState.isActive ? 'Active' : 'Inactive'}
            </span>
          </span>
        </div>

        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Time Remaining:</span>
          <span className={`text-lg font-mono font-semibold ${getStatusColor()}`}>
            {formatTime(timeoutState.timeRemaining)}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">Authentication:</span>
          <span className="text-sm text-gray-600">
            {isPinAuthenticated ? 'PIN Authenticated' : 'Traditional Auth'}
          </span>
        </div>
      </div>

      {/* Control Buttons */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={resetTimeout}
          className="bg-blue-600 text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors flex items-center justify-center"
        >
          <RotateCcw className="w-4 h-4 mr-2" />
          Reset
        </button>

        <button
          onClick={extendSession}
          className="bg-green-600 text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-green-700 transition-colors flex items-center justify-center"
        >
          <Clock className="w-4 h-4 mr-2" />
          Extend
        </button>

        {!isPaused ? (
          <button
            onClick={pauseTimeout}
            className="bg-orange-600 text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-orange-700 transition-colors flex items-center justify-center"
          >
            <Pause className="w-4 h-4 mr-2" />
            Pause
          </button>
        ) : (
          <button
            onClick={resumeTimeout}
            className="bg-green-600 text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-green-700 transition-colors flex items-center justify-center"
          >
            <Play className="w-4 h-4 mr-2" />
            Resume
          </button>
        )}

        <div className="bg-gray-100 rounded-md p-2 text-center">
          <span className="text-xs text-gray-600">
            {isPaused ? 'Paused' : 'Running'}
          </span>
        </div>
      </div>

      {/* Info */}
      <div className="mt-4 p-3 bg-gray-50 rounded-md">
        <p className="text-xs text-gray-600">
          <strong>Note:</strong> This test component allows you to control session timeout behavior. 
          In production, sessions automatically expire after 15 minutes of inactivity with a 2-minute warning.
        </p>
      </div>
    </div>
  );
}
















