import { useState, useEffect, createContext, useContext } from 'react';
import { supabase } from '../lib/supabase';

export interface Staff {
  staff_id: string;
  username: string;
  role_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone_number?: string;
  last_login_timestamp?: string;
  is_active: boolean;
  mfa_enabled: boolean;
  created_at: string;
  updated_at: string;
  roles?: {
    role_id: string;
    role_name: string;
    description?: string;
  };
}

interface LoginResult {
  success: boolean;
  error?: string;
}

interface StaffAuthContextType {
  staff: Staff | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<LoginResult>;
  logout: () => void;
}

export const StaffAuthContext = createContext<StaffAuthContextType | undefined>(undefined);

export function useStaffAuth() {
  const context = useContext(StaffAuthContext);
  if (context === undefined) {
    throw new Error('useStaffAuth must be used within a StaffAuthProvider');
  }
  return context;
}

export function useStaffAuthProvider() {
  const [staff, setStaff] = useState<Staff | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if staff is already logged in (from localStorage)
    const savedStaff = localStorage.getItem('staff');
    if (savedStaff) {
      try {
        setStaff(JSON.parse(savedStaff));
      } catch (error) {
        localStorage.removeItem('staff');
      }
    }
    setLoading(false);
  }, []);

  const login = async (username: string, password: string): Promise<LoginResult> => {
    try {
      setLoading(true);

      console.log('Attempting staff login for username:', username);

      // Get the staff member by username
      const { data: staffData, error: staffError } = await supabase
        .from('staff')
        .select(`
          *,
          roles:role_id (
            role_id,
            role_name,
            description
          )
        `)
        .eq('username', username)
        .eq('is_active', true)
        .single();

      if (staffError) {
        console.error('Staff lookup error:', staffError);
        if (staffError.code === 'PGRST116') {
          return { success: false, error: 'Invalid username or password' };
        }
        return { success: false, error: `Database error: ${staffError.message}` };
      }

      if (!staffData) {
        console.log('No staff member found with username:', username);
        return { success: false, error: 'Invalid username or password' };
      }

      // Verify password
      const { generateSHA256Hash } = await import('../utils/crypto');
      const hashedPassword = await generateSHA256Hash(password + staffData.salt);
      
      if (hashedPassword !== staffData.password_hash) {
        return { success: false, error: 'Invalid username or password' };
      }

      console.log('Staff member found:', {
        username: staffData.username,
        is_active: staffData.is_active,
        role: staffData.roles?.role_name
      });

      // Store staff data in localStorage
      localStorage.setItem('staff', JSON.stringify(staffData));

      // Update last login timestamp
      await supabase
        .from('staff')
        .update({ last_login_timestamp: new Date().toISOString() })
        .eq('staff_id', staffData.staff_id);

      setStaff(staffData);
      return { success: true };
    } catch (error) {
      console.error('Staff login error:', error);
      return { success: false, error: 'An unexpected error occurred during login.' };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setStaff(null);
    localStorage.removeItem('staff');
  };

  return {
    staff,
    loading,
    login,
    logout
  };
}
