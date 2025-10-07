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

  useEffect(() => {
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
    setLoading(false);
  }, []);

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
  };

  return {
    donor,
    loading,
    login,
    logout
  };
}
