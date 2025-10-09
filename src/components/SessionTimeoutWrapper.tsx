/**
 * Session Timeout Wrapper Component
 * 
 * This component wraps authenticated content and provides session timeout functionality
 * including warning modals and automatic logout.
 */

import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { usePinAuth } from '../hooks/usePinAuth';
import SessionTimeoutModal from './SessionTimeoutModal';

export interface SessionTimeoutWrapperProps {
  children: React.ReactNode;
  onLogout?: () => void;
  className?: string;
}

export default function SessionTimeoutWrapper({ 
  children, 
  onLogout,
  className = '' 
}: SessionTimeoutWrapperProps) {
  const { 
    donor, 
    logout: authLogout,
    getSessionTimeoutState: authGetSessionTimeoutState,
    extendSession: authExtendSession
  } = useAuth();
  
  // Conditionally use PinAuth hook - only if PinAuthProvider is available
  let pinAuthData = null;
  try {
    pinAuthData = usePinAuth();
  } catch (error) {
    // PinAuthProvider is not available, continue without PIN auth
    console.log('PinAuthProvider not available, using traditional auth only');
  }
  
  const { 
    isPinAuthenticated = false,
    getSessionTimeoutState: pinGetSessionTimeoutState = null,
    extendSession: pinExtendSession = null
  } = pinAuthData || {};
  
  const [showTimeoutModal, setShowTimeoutModal] = useState(false);
  const [timeoutState, setTimeoutState] = useState({
    timeRemaining: 0,
    isWarning: false,
    isExpired: false,
  });

  // Check if user is authenticated (either through auth or PIN)
  const isAuthenticated = donor || isPinAuthenticated;

  // Get the appropriate session timeout state
  const getCurrentTimeoutState = () => {
    if (isPinAuthenticated && pinGetSessionTimeoutState) {
      return pinGetSessionTimeoutState();
    }
    return authGetSessionTimeoutState();
  };

  // Handle session timeout
  const handleLogout = () => {
    if (isPinAuthenticated && pinAuthData) {
      // Use PIN auth logout which will also call auth logout
      pinAuthData.logout();
    } else {
      authLogout();
    }
    setShowTimeoutModal(false);
    onLogout?.();
  };

  // Handle extending session
  const handleExtendSession = () => {
    if (isPinAuthenticated && pinExtendSession) {
      pinExtendSession();
    } else {
      authExtendSession();
    }
    setShowTimeoutModal(false);
  };

  // Monitor session timeout state
  useEffect(() => {
    if (!isAuthenticated) {
      setShowTimeoutModal(false);
      return;
    }

    const checkTimeoutState = () => {
      const currentState = getCurrentTimeoutState();
      setTimeoutState({
        timeRemaining: currentState.timeRemaining,
        isWarning: currentState.isWarning,
        isExpired: currentState.isExpired,
      });

      // Show modal when warning or expired
      if (currentState.isWarning || currentState.isExpired) {
        setShowTimeoutModal(true);
      } else {
        setShowTimeoutModal(false);
      }
    };

    // Check immediately
    checkTimeoutState();

    // Check every second for smooth countdown
    const interval = setInterval(checkTimeoutState, 1000);

    return () => clearInterval(interval);
  }, [isAuthenticated, isPinAuthenticated]);

  // Don't render timeout functionality if not authenticated
  if (!isAuthenticated) {
    return <>{children}</>;
  }

  return (
    <div className={className}>
      {children}
      
      <SessionTimeoutModal
        isVisible={showTimeoutModal}
        timeRemaining={timeoutState.timeRemaining}
        isWarning={timeoutState.isWarning}
        isExpired={timeoutState.isExpired}
        onExtendSession={handleExtendSession}
        onLogout={handleLogout}
        onDismiss={() => setShowTimeoutModal(false)}
      />
    </div>
  );
}
