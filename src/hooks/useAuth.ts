import { useState, useEffect, createContext, useContext } from 'react';
import { generateSHA256Hash } from '../utils/crypto';
import { supabase } from '../lib/supabase';

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

      // Create a hash from the provided authentication data
      const authString = `${authData.firstName}${authData.lastName}${authData.dateOfBirth}${authData.avisDonorCenter}`;
      const authHash = await generateSHA256Hash(authString);

      // Try to find a donor with matching hash
      const { data: donorData, error } = await supabase
        .from('donors')
        .select('donor_hash_id, donor_id, preferred_language, preferred_communication_channel, initial_vetting_status, total_donations_this_year, last_donation_date, is_active, avis_donor_center')
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
      };

      setDonor(authenticatedDonor);
      localStorage.setItem('donor', JSON.stringify(authenticatedDonor));

      // Create audit log for successful login
      await supabase.rpc('create_audit_log', {
        p_user_id: authenticatedDonor.donor_hash_id,
        p_user_type: 'donor',
        p_action: 'login',
        p_details: 'Donor successfully logged in',
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

  const logout = () => {
    if (donor) {
      // Create audit log for logout
      (async () => {
        try {
          await supabase.rpc('create_audit_log', {
            p_user_id: donor.donor_hash_id,
            p_user_type: 'donor',
            p_action: 'logout',
            p_details: 'Donor logged out',
            p_status: 'success'
          });
        } catch (error) {
          console.error('Failed to create audit log:', error);
        }
      })();
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