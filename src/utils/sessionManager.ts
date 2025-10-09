/**
 * Session Manager for PIN-based Authentication
 * 
 * This module provides session management for PIN-based authentication
 * where users only need to enter their PIN once per browser session.
 */

export interface PinSessionData {
  isAuthenticated: boolean;
  donorId: string;
  donorHashId: string;
  timestamp: number;
  sessionId: string;
  expiresAt: number;
}

export interface SessionValidationResult {
  isValid: boolean;
  sessionData: PinSessionData | null;
  error?: string;
}

/**
 * Session duration in milliseconds (24 hours)
 */
const SESSION_DURATION = 24 * 60 * 60 * 1000;

/**
 * Session storage key
 */
const SESSION_KEY = 'vitalita_pin_session';

/**
 * Create a new PIN session
 */
export function createPinSession(donorId: string, donorHashId: string): PinSessionData {
  const now = Date.now();
  const sessionId = generateSessionId();
  
  const sessionData: PinSessionData = {
    isAuthenticated: true,
    donorId,
    donorHashId,
    timestamp: now,
    sessionId,
    expiresAt: now + SESSION_DURATION
  };

  console.log('Creating PIN session:', { 
    donorId, 
    donorHashId: donorHashId.substring(0, 8) + '...', 
    sessionId, 
    expiresAt: new Date(sessionData.expiresAt).toISOString(),
    duration: SESSION_DURATION / (1000 * 60 * 60) + ' hours'
  });

  // Store in sessionStorage (cleared when browser tab closes)
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(sessionData));
  
  // Also store in localStorage for persistence across tabs
  localStorage.setItem(SESSION_KEY, JSON.stringify(sessionData));

  console.log('PIN session stored in both sessionStorage and localStorage');
  
  return sessionData;
}

/**
 * Get current PIN session data
 */
export function getPinSession(): PinSessionData | null {
  try {
    // Try sessionStorage first (current tab session)
    let sessionData = sessionStorage.getItem(SESSION_KEY);
    console.log('getPinSession - sessionStorage:', sessionData ? 'found' : 'not found');
    
    if (!sessionData) {
      // Fall back to localStorage (persistent across tabs)
      sessionData = localStorage.getItem(SESSION_KEY);
      console.log('getPinSession - localStorage:', sessionData ? 'found' : 'not found');
    }

    if (!sessionData) {
      console.log('getPinSession - no session data found');
      return null;
    }

    const parsed: PinSessionData = JSON.parse(sessionData);
    console.log('getPinSession - parsed session:', {
      donorId: parsed.donorId,
      isAuthenticated: parsed.isAuthenticated,
      expiresAt: new Date(parsed.expiresAt).toISOString(),
      now: new Date().toISOString(),
      isExpired: Date.now() > parsed.expiresAt
    });
    
    // Check if session is expired
    if (Date.now() > parsed.expiresAt) {
      console.log('PIN session expired, clearing session data');
      clearPinSession();
      return null;
    }

    return parsed;
  } catch (error) {
    console.error('Error retrieving PIN session:', error);
    clearPinSession();
    return null;
  }
}

/**
 * Validate PIN session
 */
export function validatePinSession(): SessionValidationResult {
  const sessionData = getPinSession();
  
  if (!sessionData) {
    console.log('validatePinSession: No session data found');
    return {
      isValid: false,
      sessionData: null,
      error: 'No active session found'
    };
  }

  // Check if session is expired
  if (Date.now() > sessionData.expiresAt) {
    console.log('validatePinSession: Session expired', {
      now: new Date().toISOString(),
      expiresAt: new Date(sessionData.expiresAt).toISOString()
    });
    clearPinSession();
    return {
      isValid: false,
      sessionData: null,
      error: 'Session has expired'
    };
  }

  // Check if session is properly authenticated
  if (!sessionData.isAuthenticated) {
    console.log('validatePinSession: Session not authenticated');
    return {
      isValid: false,
      sessionData: null,
      error: 'Session is not authenticated'
    };
  }

  console.log('validatePinSession: Session is valid', {
    donorId: sessionData.donorId,
    expiresAt: new Date(sessionData.expiresAt).toISOString()
  });

  return {
    isValid: true,
    sessionData
  };
}

/**
 * Check if user has an active PIN session
 */
export function hasActivePinSession(): boolean {
  const validation = validatePinSession();
  console.log('hasActivePinSession check:', { 
    isValid: validation.isValid, 
    error: validation.error,
    sessionData: validation.sessionData ? {
      donorId: validation.sessionData.donorId,
      isAuthenticated: validation.sessionData.isAuthenticated,
      expiresAt: new Date(validation.sessionData.expiresAt).toISOString()
    } : null
  });
  return validation.isValid;
}

/**
 * Check if user has any active session (PIN or traditional)
 */
export function hasAnyActiveSession(): boolean {
  // Check PIN session first
  const pinSession = hasActivePinSession();
  if (pinSession) {
    console.log('hasAnyActiveSession: PIN session found');
    return true;
  }

  // Check traditional session (localStorage donor)
  const savedDonor = localStorage.getItem('donor');
  if (savedDonor) {
    try {
      const donor = JSON.parse(savedDonor);
      console.log('hasAnyActiveSession: Traditional session found', { donorId: donor.donor_id });
      return true;
    } catch (error) {
      console.log('hasAnyActiveSession: Invalid traditional session data');
      localStorage.removeItem('donor');
    }
  }

  console.log('hasAnyActiveSession: No active session found');
  return false;
}

/**
 * Clear PIN session data
 */
export function clearPinSession(): void {
  try {
    sessionStorage.removeItem(SESSION_KEY);
    localStorage.removeItem(SESSION_KEY);
    console.log('PIN session cleared');
  } catch (error) {
    console.error('Error clearing PIN session:', error);
  }
}

/**
 * Extend PIN session (refresh expiration time)
 */
export function extendPinSession(): boolean {
  const sessionData = getPinSession();
  
  if (!sessionData) {
    return false;
  }

  // Extend session by another 24 hours
  const extendedSession: PinSessionData = {
    ...sessionData,
    expiresAt: Date.now() + SESSION_DURATION
  };

  // Update both storage locations
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(extendedSession));
  localStorage.setItem(SESSION_KEY, JSON.stringify(extendedSession));

  console.log('PIN session extended until:', new Date(extendedSession.expiresAt));
  
  return true;
}

/**
 * Get session information for display
 */
export function getSessionInfo(): {
  isActive: boolean;
  donorId: string | null;
  sessionId: string | null;
  expiresAt: Date | null;
  timeRemaining: number;
} {
  const sessionData = getPinSession();
  
  if (!sessionData) {
    return {
      isActive: false,
      donorId: null,
      sessionId: null,
      expiresAt: null,
      timeRemaining: 0
    };
  }

  const timeRemaining = Math.max(0, sessionData.expiresAt - Date.now());
  
  return {
    isActive: true,
    donorId: sessionData.donorId,
    sessionId: sessionData.sessionId,
    expiresAt: new Date(sessionData.expiresAt),
    timeRemaining
  };
}

/**
 * Generate a unique session ID
 */
function generateSessionId(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2);
  return `pin_${timestamp}_${random}`;
}

/**
 * Check if session is about to expire (within 5 minutes)
 */
export function isSessionExpiringSoon(): boolean {
  const sessionData = getPinSession();
  
  if (!sessionData) {
    return false;
  }

  const fiveMinutes = 5 * 60 * 1000;
  return (sessionData.expiresAt - Date.now()) <= fiveMinutes;
}

/**
 * Get time remaining in session in minutes
 */
export function getSessionTimeRemaining(): number {
  const sessionData = getPinSession();
  
  if (!sessionData) {
    return 0;
  }

  const timeRemaining = sessionData.expiresAt - Date.now();
  return Math.max(0, Math.ceil(timeRemaining / (1000 * 60)));
}
