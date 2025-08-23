import React, { useState, useEffect } from 'react';
import { 
  Clock, 
  Smartphone, 
  Shield, 
  RefreshCw, 
  LogOut, 
  AlertTriangle,
  CheckCircle,
  Info,
  Key,
  Lock
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { getSessionData, getRemainingSessionTime, isSessionExpired } from '../utils/deviceUtils';

interface SessionManagerProps {
  onLogout: () => void;
}

export default function SessionManager({ onLogout }: SessionManagerProps) {
  const { getSessionInfo, refreshSession, isPasswordSet } = useAuth();
  const [sessionData, setSessionData] = useState(getSessionData());
  const [remainingTime, setRemainingTime] = useState<number>(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [hasPassword, setHasPassword] = useState<boolean | null>(null);

  useEffect(() => {
    // Update session data and remaining time every minute
    const interval = setInterval(() => {
      const currentSessionData = getSessionData();
      setSessionData(currentSessionData);
      
      if (currentSessionData) {
        const remaining = getRemainingSessionTime(currentSessionData);
        setRemainingTime(remaining);
        
        // Auto-logout if session expired
        if (isSessionExpired(currentSessionData)) {
          onLogout();
        }
      }
    }, 60000); // Check every minute

    // Initial check
    const currentSessionData = getSessionData();
    setSessionData(currentSessionData);
    
    if (currentSessionData) {
      const remaining = getRemainingSessionTime(currentSessionData);
      setRemainingTime(remaining);
      
      // Check if user has password set up
      checkPasswordStatus();
    }

    return () => clearInterval(interval);
  }, [onLogout]);

  const checkPasswordStatus = async () => {
    if (sessionData) {
      const status = await isPasswordSet(sessionData.donorHashId);
      setHasPassword(status);
    }
  };

  const handleRefreshSession = async () => {
    setIsRefreshing(true);
    try {
      const success = await refreshSession();
      if (success) {
        // Update local state
        const currentSessionData = getSessionData();
        setSessionData(currentSessionData);
        if (currentSessionData) {
          const remaining = getRemainingSessionTime(currentSessionData);
          setRemainingTime(remaining);
        }
      }
    } catch (error) {
      console.error('Failed to refresh session:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const formatTime = (minutes: number): string => {
    if (minutes < 60) {
      return `${minutes}m`;
    }
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const getSessionStatusColor = (): string => {
    if (remainingTime <= 0) return 'text-red-600';
    if (remainingTime <= 30) return 'text-orange-600';
    if (remainingTime <= 60) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getSessionStatusIcon = () => {
    if (remainingTime <= 0) return <AlertTriangle className="w-4 h-4" />;
    if (remainingTime <= 30) return <AlertTriangle className="w-4 h-4" />;
    if (remainingTime <= 60) return <Clock className="w-4 h-4" />;
    return <CheckCircle className="w-4 h-4" />;
  };

  if (!sessionData) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <Shield className="w-5 h-5 mr-2 text-blue-600" />
          Session Status
        </h3>
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="text-gray-500 hover:text-gray-700 transition-colors"
        >
          <Info className="w-4 h-4" />
        </button>
      </div>

      {/* Session Status */}
      <div className="space-y-3">
        {/* Authentication Method */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">Auth Method:</span>
          <span className="text-sm text-gray-600 flex items-center">
            {hasPassword ? (
              <>
                <Lock className="w-4 h-4 mr-1 text-green-600" />
                Password
              </>
            ) : (
              <>
                <Key className="w-4 h-4 mr-1 text-blue-600" />
                Hash-based
              </>
            )}
          </span>
        </div>

        {/* Time Remaining */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">Time Remaining:</span>
          <span className={`text-sm font-semibold ${getSessionStatusColor()} flex items-center`}>
            {getSessionStatusIcon()}
            <span className="ml-1">{formatTime(remainingTime)}</span>
          </span>
        </div>

        {/* Device Info */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">Device:</span>
          <span className="text-sm text-gray-600 flex items-center">
            <Smartphone className="w-4 h-4 mr-1" />
            {getSessionInfo().deviceInfo}
          </span>
        </div>

        {/* Last Login */}
        {getSessionInfo().lastLogin && (
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Last Login:</span>
            <span className="text-sm text-gray-600">
              {new Date(getSessionInfo().lastLogin).toLocaleString()}
            </span>
          </div>
        )}

        {/* Session Expires */}
        {getSessionInfo().sessionExpires && (
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Expires:</span>
            <span className="text-sm text-gray-600">
              {new Date(getSessionInfo().sessionExpires).toLocaleString()}
            </span>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2 mt-4 pt-4 border-t border-gray-200">
        <button
          onClick={handleRefreshSession}
          disabled={isRefreshing || remainingTime <= 0}
          className="flex-1 bg-blue-600 text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
        >
          {isRefreshing ? (
            <RefreshCw className="w-4 h-4 animate-spin mr-2" />
          ) : (
            <RefreshCw className="w-4 h-4 mr-2" />
          )}
          Refresh Session
        </button>

        <button
          onClick={onLogout}
          className="flex-1 bg-red-600 text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-red-700 transition-colors flex items-center justify-center"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Logout
        </button>
      </div>

      {/* Session Details */}
      {showDetails && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <h4 className="text-sm font-medium text-gray-900 mb-2">Session Details</h4>
          <div className="bg-gray-50 rounded-md p-3 text-xs font-mono text-gray-700 space-y-1">
            <div><span className="font-semibold">Session Token:</span> {sessionData.sessionToken.substring(0, 16)}...</div>
            <div><span className="font-semibold">Device ID:</span> {sessionData.deviceId}</div>
            <div><span className="font-semibold">Donor Hash:</span> {sessionData.donorHashId.substring(0, 16)}...</div>
            {sessionData.lastLoginIp && (
              <div><span className="font-semibold">Last IP:</span> {sessionData.lastLoginIp}</div>
            )}
          </div>
        </div>
      )}

      {/* Warning Messages */}
      {remainingTime <= 30 && remainingTime > 0 && (
        <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-md">
          <div className="flex items-center">
            <AlertTriangle className="w-4 h-4 text-orange-600 mr-2" />
            <span className="text-sm text-orange-800">
              Your session will expire soon. Please refresh or save your work.
            </span>
          </div>
        </div>
      )}

      {remainingTime <= 0 && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <div className="flex items-center">
            <AlertTriangle className="w-4 h-4 text-red-600 mr-2" />
            <span className="text-sm text-red-800">
              Your session has expired. You will be logged out automatically.
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
