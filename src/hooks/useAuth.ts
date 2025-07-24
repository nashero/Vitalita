import { useState, useEffect, createContext, useContext } from 'react';
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
      // This part of the code was removed as per the edit hint.
      // The original code had a Supabase call here, which is now removed.
      // The function will now return an error as there's no Supabase client.

      return { success: false, error: 'Supabase client not available for login.' };
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
      // This part of the code was removed as per the edit hint.
      // The original code had a Supabase call here, which is now removed.
      // The function will now just clear the donor and localStorage.
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