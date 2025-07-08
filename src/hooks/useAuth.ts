import { useState, useEffect, createContext, useContext } from 'react';
import { supabase } from '../lib/supabase';
import { generateSHA256Hash } from '../utils/crypto';

export interface Donor {
  donor_hash_id: string;
  preferred_language: string;
  preferred_communication_channel: string;
  initial_vetting_status: boolean;
  total_donations_this_year: number;
  last_donation_date: string | null;
  is_active: boolean;
  avis_donor_center: string;
}

interface AuthData {
  firstName: string;
  lastName: string;
  donorId: string; // Keep for compatibility but not used
  dateOfBirth: string;
  avisDonorCenter: string;
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
    // Check if donor is already logged in (from localStorage)
    const savedDonor = localStorage.getItem('donor');
    if (savedDonor) {
      try {
        setDonor(JSON.parse(savedDonor));
      } catch (error) {
        localStorage.removeItem('donor');
      }
    }
    setLoading(false);
  }, []);

  const login = async (authData: AuthData): Promise<{ success: boolean; error?: string }> => {
    try {
      setLoading(true);

      // Create a hash from the provided authentication data (without donorId)
      // This hash should match the donor_hash_id stored in the database
      const authString = `${authData.firstName}${authData.lastName}${authData.dateOfBirth}${authData.avisDonorCenter}`;
      const authHash = await generateSHA256Hash(authString);

      // Try to find a donor with matching hash
      const { data: donorData, error: fetchError } = await supabase
        .from('donors')
        .select('*')
        .eq('donor_hash_id', authHash)
        .single();

      if (fetchError || !donorData) {
        // Create audit log for failed login attempt
        await supabase.from('audit_logs').insert({
          user_id: authHash,
          user_type: 'donor',
          action: 'donor_login_failed',
          details: `Failed login attempt with hash: ${authHash.substring(0, 8)}...`,
          resource_type: 'donor',
          resource_id: authHash,
          status: 'failure'
        });

        return { success: false, error: 'Invalid credentials. Please check your information and try again.' };
      }

      // Check if account is active (verified by AVIS staff)
      if (!donorData.is_active) {
        await supabase.from('audit_logs').insert({
          user_id: donorData.donor_hash_id,
          user_type: 'donor',
          action: 'donor_login_inactive',
          details: `Login attempt on inactive account from ${donorData.avis_donor_center}`,
          resource_type: 'donor',
          resource_id: donorData.donor_hash_id,
          status: 'failure'
        });

        return { 
          success: false, 
          error: 'Your account is pending verification by AVIS staff. Please wait for activation notification or contact your AVIS center.' 
        };
      }

      // Create authenticated donor object (no PII stored)
      const authenticatedDonor: Donor = {
        donor_hash_id: donorData.donor_hash_id,
        preferred_language: donorData.preferred_language,
        preferred_communication_channel: donorData.preferred_communication_channel,
        initial_vetting_status: donorData.initial_vetting_status,
        total_donations_this_year: donorData.total_donations_this_year,
        last_donation_date: donorData.last_donation_date,
        is_active: donorData.is_active,
        avis_donor_center: donorData.avis_donor_center,
      };

      setDonor(authenticatedDonor);
      localStorage.setItem('donor', JSON.stringify(authenticatedDonor));

      // Create audit log for successful login
      await supabase.from('audit_logs').insert({
        user_id: donorData.donor_hash_id,
        user_type: 'donor',
        action: 'donor_login_success',
        details: `Successful login via hash authentication from ${donorData.avis_donor_center}`,
        resource_type: 'donor',
        resource_id: donorData.donor_hash_id,
        status: 'success'
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
    if (donor) {
      // Create audit log for logout
      supabase.from('audit_logs').insert({
        user_id: donor.donor_hash_id,
        user_type: 'donor',
        action: 'donor_logout',
        details: 'Donor logged out successfully',
        resource_type: 'donor',
        resource_id: donor.donor_hash_id,
        status: 'success'
      });
    }

    setDonor(null);
    localStorage.removeItem('donor');
  };

  return {
    donor,
    loading,
    login,
    logout,
  };
}