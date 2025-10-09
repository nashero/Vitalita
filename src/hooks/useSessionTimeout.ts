/**
 * Session Timeout Hook
 * 
 * This hook manages session timeout functionality with:
 * - 15-minute inactivity timeout
 * - User activity tracking
 * - Automatic logout on timeout
 * - Warning notifications before timeout
 */

import { useState, useEffect, useCallback, useRef } from 'react';

export interface SessionTimeoutConfig {
  timeoutMinutes: number;
  warningMinutes: number;
  checkIntervalMs: number;
}

export interface SessionTimeoutState {
  isActive: boolean;
  timeRemaining: number;
  isWarning: boolean;
  isExpired: boolean;
}

export interface SessionTimeoutActions {
  resetTimeout: () => void;
  extendSession: () => void;
  forceLogout: () => void;
  pauseTimeout: () => void;
  resumeTimeout: () => void;
}

const DEFAULT_CONFIG: SessionTimeoutConfig = {
  timeoutMinutes: 15,
  warningMinutes: 2,
  checkIntervalMs: 1000, // Check every second for smooth countdown
};

export function useSessionTimeout(
  onTimeout: () => void,
  onWarning?: () => void,
  config: Partial<SessionTimeoutConfig> = {}
) {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };
  const timeoutMs = finalConfig.timeoutMinutes * 60 * 1000;
  const warningMs = finalConfig.warningMinutes * 60 * 1000;
  
  const [state, setState] = useState<SessionTimeoutState>({
    isActive: false,
    timeRemaining: timeoutMs,
    isWarning: false,
    isExpired: false,
  });
  
  const [isPaused, setIsPaused] = useState(false);
  const lastActivityRef = useRef<number>(Date.now());
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const warningShownRef = useRef<boolean>(false);

  // Activity tracking events
  const activityEvents = [
    'mousedown',
    'mousemove',
    'keypress',
    'scroll',
    'touchstart',
    'click',
    'focus',
    'blur',
  ];

  // Handle user activity
  const handleActivity = useCallback(() => {
    if (isPaused) return;
    
    lastActivityRef.current = Date.now();
    warningShownRef.current = false;
    
    setState(prev => ({
      ...prev,
      isActive: true,
      timeRemaining: timeoutMs,
      isWarning: false,
      isExpired: false,
    }));
  }, [isPaused, timeoutMs]);

  // Reset timeout to full duration
  const resetTimeout = useCallback(() => {
    lastActivityRef.current = Date.now();
    warningShownRef.current = false;
    
    setState(prev => ({
      ...prev,
      isActive: true,
      timeRemaining: timeoutMs,
      isWarning: false,
      isExpired: false,
    }));
  }, [timeoutMs]);

  // Extend session by specified minutes
  const extendSession = useCallback((minutes: number = finalConfig.timeoutMinutes) => {
    const extendMs = minutes * 60 * 1000;
    lastActivityRef.current = Date.now();
    warningShownRef.current = false;
    
    setState(prev => ({
      ...prev,
      isActive: true,
      timeRemaining: extendMs,
      isWarning: false,
      isExpired: false,
    }));
  }, [finalConfig.timeoutMinutes]);

  // Force logout
  const forceLogout = useCallback(() => {
    setState(prev => ({
      ...prev,
      isActive: false,
      timeRemaining: 0,
      isWarning: false,
      isExpired: true,
    }));
    onTimeout();
  }, [onTimeout]);

  // Pause timeout (useful during PIN entry, etc.)
  const pauseTimeout = useCallback(() => {
    setIsPaused(true);
  }, []);

  // Resume timeout
  const resumeTimeout = useCallback(() => {
    setIsPaused(false);
    lastActivityRef.current = Date.now();
  }, []);

  // Main timeout checking logic
  useEffect(() => {
    if (!state.isActive || isPaused) return;

    const checkTimeout = () => {
      const now = Date.now();
      const timeSinceActivity = now - lastActivityRef.current;
      const remaining = Math.max(0, timeoutMs - timeSinceActivity);
      
      // Check if session has expired
      if (remaining <= 0) {
        setState(prev => ({
          ...prev,
          timeRemaining: 0,
          isWarning: false,
          isExpired: true,
        }));
        onTimeout();
        return;
      }
      
      // Check if we should show warning
      const shouldShowWarning = remaining <= warningMs && !warningShownRef.current;
      if (shouldShowWarning) {
        warningShownRef.current = true;
        setState(prev => ({
          ...prev,
          timeRemaining: remaining,
          isWarning: true,
        }));
        onWarning?.();
      } else {
        setState(prev => ({
          ...prev,
          timeRemaining: remaining,
          isWarning: remaining <= warningMs,
        }));
      }
    };

    // Initial check
    checkTimeout();
    
    // Set up interval
    intervalRef.current = setInterval(checkTimeout, finalConfig.checkIntervalMs);
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [state.isActive, isPaused, timeoutMs, warningMs, onTimeout, onWarning, finalConfig.checkIntervalMs]);

  // Set up activity listeners
  useEffect(() => {
    if (!state.isActive || isPaused) return;

    // Add event listeners
    activityEvents.forEach(event => {
      document.addEventListener(event, handleActivity, { passive: true });
    });

    return () => {
      // Remove event listeners
      activityEvents.forEach(event => {
        document.removeEventListener(event, handleActivity);
      });
    };
  }, [state.isActive, isPaused, handleActivity]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  // Helper functions
  const getTimeRemainingMinutes = useCallback(() => {
    return Math.ceil(state.timeRemaining / (1000 * 60));
  }, [state.timeRemaining]);

  const getTimeRemainingSeconds = useCallback(() => {
    return Math.ceil(state.timeRemaining / 1000);
  }, [state.timeRemaining]);

  const formatTimeRemaining = useCallback(() => {
    const minutes = Math.floor(state.timeRemaining / (1000 * 60));
    const seconds = Math.floor((state.timeRemaining % (1000 * 60)) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }, [state.timeRemaining]);

  const actions: SessionTimeoutActions = {
    resetTimeout,
    extendSession,
    forceLogout,
    pauseTimeout,
    resumeTimeout,
  };

  return {
    state,
    actions,
    isPaused,
    getTimeRemainingMinutes,
    getTimeRemainingSeconds,
    formatTimeRemaining,
  };
}

