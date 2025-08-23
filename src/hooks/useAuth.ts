import { useState, useEffect, createContext, useContext } from 'react';
import { generateSHA256Hash } from '../utils/crypto';
import { supabase } from '../lib/supabase';
import { 
  storeSessionData, 
  getSessionData, 
  clearSessionData, 
  generateDeviceFingerprint,
  getClientIP,
  isPasswordCached,
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
  last_login_at?: string;
  last_login_device?: string;
  session_token?: string;
  session_expires_at?: string;
}

interface AuthData {
  firstName: string;
  lastName: string;
  donorId: string; // Keep for compatibility but not used
  dateOfBirth: string;
  avisDonorCenter: string;
}

interface PasswordAuthData {
  donorHashId: string;
  password: string;
}

interface AuthContextType {
  donor: Donor | null;
  loading: boolean;
  login: (authData: AuthData) => Promise<{ success: boolean; error?: string }>;
  loginWithPassword: (authData: PasswordAuthData) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  setPassword: (donorHashId: string, password: string) => Promise<{ success: boolean; error?: string }>;
  isPasswordSet: (donorHashId: string) => Promise<boolean>;
  refreshSession: () => Promise<boolean>;
  getSessionInfo: () => { deviceInfo: string; lastLogin: string | null; sessionExpires: string | null };
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
      const { data, error } = await supabase.rpc('validate_donor_session', {
        p_session_token: sessionToken
      });

      if (error || !data || data.length === 0 || !data[0].is_valid) {
        // Session invalid, clear it
        clearSessionData();
        return;
      }

      // Session valid, get donor data
      const { data: donorData, error: donorError } = await supabase
        .from('donors')
        .select('*')
        .eq('donor_hash_id', data[0].donor_hash_id)
        .eq('is_active', true)
        .single();

      if (donorError || !donorData) {
        clearSessionData();
        return;
      }

      setDonor(donorData);
    } catch (error) {
      console.error('Session validation error:', error);
      clearSessionData();
    }
  };

  const login = async (authData: AuthData): Promise<{ success: boolean; error?: string }> => {
    try {
      setLoading(true);

      // Create a hash from the provided authentication data
      const authString = `${authData.firstName}${authData.lastName}${authData.dateOfBirth}${authData.avisDonorCenter}`;
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
        avis_donor_center: donorData.avis_donor_center || authData.avisDonorCenter,
        email: donorData.email,
        email_verified: donorData.email_verified,
        account_activated: donorData.account_activated,
        last_login_at: donorData.last_login_at,
        last_login_device: donorData.last_login_device,
        session_token: donorData.session_token,
        session_expires_at: donorData.session_expires_at,
      };

      setDonor(authenticatedDonor);
      
      // Store in localStorage for backward compatibility
      localStorage.setItem('donor', JSON.stringify(authenticatedDonor));

      // Create audit log for successful login
      await supabase.rpc('create_audit_log', {
        p_user_id: authenticatedDonor.donor_hash_id,
        p_user_type: 'donor',
        p_action: 'login',
        p_details: 'Donor successfully logged in with hash-based authentication',
        p_status: 'success'
      });

      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'An error occurred during authentication' };
    } finally {
      setLoading(false);
    }
  };

  const loginWithPassword = async (authData: PasswordAuthData): Promise<{ success: boolean; error?: string }> => {
    try {
      setLoading(true);

      // Verify password using backend function
      const { data: passwordValid, error: passwordError } = await supabase.rpc('verify_donor_password', {
        p_donor_hash_id: authData.donorHashId,
        p_password: authData.password
      });

      if (passwordError || !passwordValid) {
        return { success: false, error: 'Invalid password. Please try again.' };
      }

      // Get donor data
      const { data: donorData, error: donorError } = await supabase
        .from('donors')
        .select('*')
        .eq('donor_hash_id', authData.donorHashId)
        .eq('is_active', true)
        .single();

      if (donorError || !donorData) {
        return { success: false, error: 'Donor account not found or inactive.' };
      }

      // Check if account is activated
      if (!donorData.account_activated) {
        return { success: false, error: 'Your account is not yet activated. Please wait for AVIS staff approval.' };
      }

      // Check if email is verified
      if (!donorData.email_verified) {
        return { success: false, error: 'Please verify your email address before logging in.' };
      }

      // Get device information and client IP
      const deviceInfo = generateDeviceFingerprint();
      const clientIP = await getClientIP();

      // Create session using backend function
      const { data: sessionToken, error: sessionError } = await supabase.rpc('create_donor_session', {
        p_donor_hash_id: authData.donorHashId,
        p_ip_address: clientIP,
        p_device_info: getDeviceDisplayInfo()
      });

      if (sessionError || !sessionToken) {
        return { success: false, error: 'Failed to create session. Please try again.' };
      }

      // Get updated donor data with session info
      const { data: updatedDonorData, error: updateError } = await supabase
        .from('donors')
        .select('*')
        .eq('donor_hash_id', authData.donorHashId)
        .single();

      if (updateError || !updatedDonorData) {
        return { success: false, error: 'Failed to retrieve updated donor data.' };
      }

      // Create donor object
      const authenticatedDonor: Donor = {
        donor_hash_id: updatedDonorData.donor_hash_id,
        donor_id: updatedDonorData.donor_id,
        preferred_language: updatedDonorData.preferred_language || 'en',
        preferred_communication_channel: updatedDonorData.preferred_communication_channel || 'email',
        initial_vetting_status: updatedDonorData.initial_vetting_status || false,
        total_donations_this_year: updatedDonorData.total_donations_this_year || 0,
        last_donation_date: updatedDonorData.last_donation_date,
        is_active: updatedDonorData.is_active,
        avis_donor_center: updatedDonorData.avis_donor_center,
        email: updatedDonorData.email,
        email_verified: updatedDonorData.email_verified,
        account_activated: updatedDonorData.account_activated,
        last_login_at: updatedDonorData.last_login_at,
        last_login_device: updatedDonorData.last_login_device,
        session_token: updatedDonorData.session_token,
        session_expires_at: updatedDonorData.session_expires_at,
      };

      setDonor(authenticatedDonor);

      // Store session data in device cache
      const sessionData = {
        donorHashId: authenticatedDonor.donor_hash_id,
        sessionToken: sessionToken,
        expiresAt: updatedDonorData.session_expires_at,
        deviceId: deviceInfo.deviceId,
        lastLoginAt: updatedDonorData.last_login_at || new Date().toISOString(),
        lastLoginIp: clientIP || undefined
      };
      
      storeSessionData(sessionData);

      // Store in localStorage for backward compatibility
      localStorage.setItem('donor', JSON.stringify(authenticatedDonor));

      // Create audit log for successful password login
      await supabase.rpc('create_audit_log', {
        p_user_id: authenticatedDonor.donor_hash_id,
        p_user_type: 'donor',
        p_action: 'login_with_password',
        p_details: `Donor successfully logged in with password from device: ${getDeviceDisplayInfo()}`,
        p_status: 'success'
      });

      return { success: true };
    } catch (error) {
      console.error('Password login error:', error);
      return { success: false, error: 'An error occurred during password authentication' };
    } finally {
      setLoading(false);
    }
  };

  const setPassword = async (donorHashId: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      // Validate password complexity
      if (password.length < 8) {
        return { success: false, error: 'Password must be at least 8 characters long.' };
      }

      if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
        return { success: false, error: 'Password must contain at least one lowercase letter, one uppercase letter, and one number.' };
      }

      // Set password using backend function
      const { data: success, error } = await supabase.rpc('set_donor_password', {
        p_donor_hash_id: donorHashId,
        p_password: password
      });

      if (error || !success) {
        return { success: false, error: 'Failed to set password. Please try again.' };
      }

      // Log password set event
      await supabase.rpc('log_password_event', {
        p_donor_hash_id: donorHashId,
        p_action: 'password_set',
        p_details: 'Donor password set successfully'
      });

      return { success: true };
    } catch (error) {
      console.error('Set password error:', error);
      return { success: false, error: 'An error occurred while setting password' };
    }
  };

  const isPasswordSet = async (donorHashId: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase
        .from('donors')
        .select('password_hash')
        .eq('donor_hash_id', donorHashId)
        .single();

      if (error || !data) {
        return false;
      }

      return !!data.password_hash;
    } catch (error) {
      console.error('Check password set error:', error);
      return false;
    }
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

      // Validate session with backend
      const { data, error } = await supabase.rpc('validate_donor_session', {
        p_session_token: sessionData.sessionToken
      });

      if (error || !data || data.length === 0 || !data[0].is_valid) {
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

  const logout = () => {
    if (donor) {
      // Clear session on backend
      (async () => {
        try {
          await supabase.rpc('clear_donor_session', {
            p_donor_hash_id: donor.donor_hash_id
          });

          // Create audit log for logout
          await supabase.rpc('create_audit_log', {
            p_user_id: donor.donor_hash_id,
            p_user_type: 'donor',
            p_action: 'logout',
            p_details: 'Donor logged out',
            p_status: 'success'
          });
        } catch (error) {
          console.error('Failed to create audit log or clear session:', error);
        }
      })();
    }

    setDonor(null);
    localStorage.removeItem('donor');
    clearSessionData();
  };

  return {
    donor,
    loading,
    login,
    loginWithPassword,
    logout,
    setPassword,
    isPasswordSet,
    refreshSession,
    getSessionInfo,
  };
}