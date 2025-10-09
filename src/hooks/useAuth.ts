import { useState, useEffect, createContext, useContext } from 'react';
import { generateSHA256Hash } from '../utils/crypto';
import { supabase } from '../lib/supabase';
import { 
  storeSessionData, 
  getSessionData, 
  clearSessionData, 
  generateDeviceFingerprint,
  getDeviceDisplayInfo
} from '../utils/deviceUtils';
import { 
  createPinSession, 
  getPinSession, 
  validatePinSession, 
  hasActivePinSession, 
  clearPinSession,
  extendPinSession,
  getSessionInfo as getPinSessionInfo
} from '../utils/sessionManager';
import { useSessionTimeout } from './useSessionTimeout';

export interface Donor {
  donor_hash_id: string;
  donor_id: string;
  preferred_language: string;
  preferred_communication_channel: string;
  initial_vetting_status: boolean;
  total_donations_this_year: number;
  last_donation_date: string | null;
  is_active: boolean;
  avis_donor_center: string;
  email?: string;
  email_verified?: boolean;
  account_activated?: boolean;
}

interface AuthData {
  firstName: string;
  lastName: string;
  donorId: string;
  dateOfBirth: string;
}

interface AuthContextType {
  donor: Donor | null;
  loading: boolean;
  login: (authData: AuthData) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  getSessionInfo: () => { deviceInfo: string; lastLogin: string | null; sessionExpires: string | null };
  refreshSession: () => Promise<boolean>;
  isPasswordSet: (donorHashId: string) => Promise<boolean>;
  // PIN Session methods
  hasActivePinSession: () => boolean;
  createPinSession: (donorId: string, donorHashId: string) => void;
  clearPinSession: () => void;
  extendPinSession: () => boolean;
  getPinSessionInfo: () => {
    isActive: boolean;
    donorId: string | null;
    sessionId: string | null;
    expiresAt: Date | null;
    timeRemaining: number;
  };
  // Session timeout methods
  resetSessionTimeout: () => void;
  extendSession: () => void;
  pauseSessionTimeout: () => void;
  resumeSessionTimeout: () => void;
  getSessionTimeoutState: () => {
    isActive: boolean;
    timeRemaining: number;
    isWarning: boolean;
    isExpired: boolean;
  };
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function useAuthProvider() {
  const [donor, setDonor] = useState<Donor | null>(null);
  const [loading, setLoading] = useState(true);
  const [showTimeoutWarning, setShowTimeoutWarning] = useState(false);

  // Session timeout handlers
  const handleSessionTimeout = () => {
    console.log('Session timeout - logging out user');
    logout();
  };

  const handleSessionWarning = () => {
    console.log('Session warning - showing timeout warning');
    setShowTimeoutWarning(true);
  };

  // Initialize session timeout
  const sessionTimeout = useSessionTimeout(
    handleSessionTimeout,
    handleSessionWarning,
    {
      timeoutMinutes: 15,
      warningMinutes: 2,
      checkIntervalMs: 1000,
    }
  );

  // Start session timeout when user is authenticated
  useEffect(() => {
    if (donor) {
      sessionTimeout.actions.resetTimeout();
      setShowTimeoutWarning(false);
    } else {
      // Reset timeout state when user logs out
      setShowTimeoutWarning(false);
    }
  }, [donor]);

  useEffect(() => {
    // Check for active PIN session first
    const pinSessionValidation = validatePinSession();
    if (pinSessionValidation.isValid && pinSessionValidation.sessionData) {
      // User has an active PIN session, authenticate them automatically
      console.log('Active PIN session found, authenticating user automatically');
      authenticateFromPinSession(pinSessionValidation.sessionData);
    } else {
      // Check if donor is already logged in (from session storage)
      const sessionData = getSessionData();
      if (sessionData) {
        // Validate session with backend
        validateSession(sessionData.sessionToken);
      } else {
        // Fall back to old localStorage method for backward compatibility
        const savedDonor = localStorage.getItem('donor');
        if (savedDonor) {
          try {
            setDonor(JSON.parse(savedDonor));
          } catch (error) {
            localStorage.removeItem('donor');
          }
        }
      }
    }
    setLoading(false);
  }, []);

  const authenticateFromPinSession = async (sessionData: any) => {
    try {
      // Get donor data from database using the donor hash ID from session
      const { data: donorData, error } = await supabase
        .from('donors')
        .select('*')
        .eq('donor_hash_id', sessionData.donorHashId)
        .eq('is_active', true)
        .single();

      if (error || !donorData) {
        console.error('Failed to authenticate from PIN session:', error);
        clearPinSession();
        return;
      }

      // Check if account is activated
      if (!donorData.account_activated) {
        console.error('Account not activated');
        clearPinSession();
        return;
      }

      // Check if email is verified
      if (!donorData.email_verified) {
        console.error('Email not verified');
        clearPinSession();
        return;
      }

      // Create donor object with all required fields
      const authenticatedDonor: Donor = {
        donor_hash_id: donorData.donor_hash_id,
        donor_id: donorData.donor_id,
        preferred_language: donorData.preferred_language || 'en',
        preferred_communication_channel: donorData.preferred_communication_channel || 'email',
        initial_vetting_status: donorData.initial_vetting_status || false,
        total_donations_this_year: donorData.total_donations_this_year || 0,
        last_donation_date: donorData.last_donation_date,
        is_active: donorData.is_active,
        avis_donor_center: donorData.avis_donor_center,
        email: donorData.email,
        email_verified: donorData.email_verified,
        account_activated: donorData.account_activated,
      };

      setDonor(authenticatedDonor);
      
      // Store in localStorage for backward compatibility
      localStorage.setItem('donor', JSON.stringify(authenticatedDonor));

      console.log('Successfully authenticated from PIN session');
    } catch (error) {
      console.error('Error authenticating from PIN session:', error);
      clearPinSession();
    }
  };

  const validateSession = async (sessionToken: string) => {
    try {
      // For hash-based authentication, just check if we have a valid donor in localStorage
      // In a full implementation, you would validate the session token with the backend
      const savedDonor = localStorage.getItem('donor');
      if (savedDonor) {
        try {
          setDonor(JSON.parse(savedDonor));
        } catch (error) {
          localStorage.removeItem('donor');
          clearSessionData();
        }
      } else {
        clearSessionData();
      }
    } catch (error) {
      console.error('Session validation error:', error);
      clearSessionData();
    }
  };

  const login = async (authData: AuthData): Promise<{ success: boolean; error?: string }> => {
    try {
      setLoading(true);

      // Create a hash from the provided authentication data
      const authString = `${authData.firstName}${authData.lastName}${authData.dateOfBirth}${authData.donorId}`;
      const authHash = await generateSHA256Hash(authString);

      // Try to find a donor with matching hash
      const { data: donorData, error } = await supabase
        .from('donors')
        .select('*')
        .eq('donor_hash_id', authHash)
        .eq('is_active', true)
        .single();

      if (error) {
        console.error('Database error:', error);
        return { success: false, error: 'Authentication failed. Please check your information.' };
      }

      if (!donorData) {
        return { success: false, error: 'No active donor account found with these details.' };
      }

      // Check if account is activated
      if (!donorData.account_activated) {
        return { success: false, error: 'Your account is not yet activated. Please wait for AVIS staff approval.' };
      }

      // Check if email is verified
      if (!donorData.email_verified) {
        return { success: false, error: 'Please verify your email address before logging in.' };
      }

      // Create donor object with all required fields
      const authenticatedDonor: Donor = {
        donor_hash_id: donorData.donor_hash_id,
        donor_id: donorData.donor_id,
        preferred_language: donorData.preferred_language || 'en',
        preferred_communication_channel: donorData.preferred_communication_channel || 'email',
        initial_vetting_status: donorData.initial_vetting_status || false,
        total_donations_this_year: donorData.total_donations_this_year || 0,
        last_donation_date: donorData.last_donation_date,
        is_active: donorData.is_active,
        avis_donor_center: donorData.avis_donor_center,
        email: donorData.email,
        email_verified: donorData.email_verified,
        account_activated: donorData.account_activated,
      };

      setDonor(authenticatedDonor);
      
      // Store in localStorage for backward compatibility
      localStorage.setItem('donor', JSON.stringify(authenticatedDonor));

      // Create a simple session for backward compatibility
      const deviceInfo = generateDeviceFingerprint();
      storeSessionData({
        sessionToken: authHash, // Use hash as session token for simplicity
        donorHashId: authHash,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
        lastLoginAt: new Date().toISOString(),
        deviceInfo
      });

      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'An error occurred during authentication' };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setDonor(null);
    localStorage.removeItem('donor');
    clearSessionData();
    clearPinSession(); // Clear PIN session as well
    setShowTimeoutWarning(false);
  };

  const refreshSession = async (): Promise<boolean> => {
    try {
      const sessionData = getSessionData();
      if (!sessionData) {
        return false;
      }

      // Check if session is expired
      if (new Date(sessionData.expiresAt) <= new Date()) {
        clearSessionData();
        setDonor(null);
        return false;
      }

      // For hash-based authentication, just validate that we still have the donor in localStorage
      const savedDonor = localStorage.getItem('donor');
      if (!savedDonor) {
        clearSessionData();
        setDonor(null);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Refresh session error:', error);
      return false;
    }
  };

  const getSessionInfo = () => {
    const sessionData = getSessionData();
    return {
      deviceInfo: sessionData ? getDeviceDisplayInfo() : 'Not logged in',
      lastLogin: sessionData?.lastLoginAt || null,
      sessionExpires: sessionData?.expiresAt || null
    };
  };

  const isPasswordSet = async (donorHashId: string): Promise<boolean> => {
    try {
      // Since password system was removed, always return false
      // This function is kept for compatibility with SessionManager
      return false;
    } catch (error) {
      console.error('Check password set error:', error);
      return false;
    }
  };

  // Session timeout methods
  const resetSessionTimeout = () => {
    sessionTimeout.actions.resetTimeout();
    setShowTimeoutWarning(false);
  };

  const extendSession = () => {
    sessionTimeout.actions.extendSession();
    setShowTimeoutWarning(false);
  };

  const pauseSessionTimeout = () => {
    sessionTimeout.actions.pauseTimeout();
  };

  const resumeSessionTimeout = () => {
    sessionTimeout.actions.resumeTimeout();
  };

  const getSessionTimeoutState = () => {
    return {
      isActive: sessionTimeout.state.isActive,
      timeRemaining: sessionTimeout.state.timeRemaining,
      isWarning: sessionTimeout.state.isWarning,
      isExpired: sessionTimeout.state.isExpired,
    };
  };

  return {
    donor,
    loading,
    login,
    logout,
    getSessionInfo,
    refreshSession,
    isPasswordSet,
    // PIN Session methods
    hasActivePinSession,
    createPinSession: (donorId: string, donorHashId: string) => {
      createPinSession(donorId, donorHashId);
    },
    clearPinSession,
    extendPinSession,
    getPinSessionInfo,
    // Session timeout methods
    resetSessionTimeout,
    extendSession,
    pauseSessionTimeout,
    resumeSessionTimeout,
    getSessionTimeoutState,
  };
}
