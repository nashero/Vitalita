import { useState, useEffect, createContext, useContext } from 'react';
import { supabase } from '../lib/supabase';
import { generateSHA256Hash } from '../utils/crypto';

export interface StaffRole {
  role_id: string;
  role_name: string;
  description: string | null;
}

export interface Staff {
  staff_id: string;
  username: string;
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string | null;
  last_login_timestamp: string | null;
  is_active: boolean;
  mfa_enabled: boolean;
  created_at: string;
  updated_at: string;
  role?: StaffRole;
}

interface StaffAuthContextType {
  staff: Staff | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<{ success: boolean; error?: string }>;
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

  const login = async (username: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      setLoading(true);

      // First, get the staff member by username
      const { data: staffData, error: fetchError } = await supabase
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

      if (fetchError || !staffData) {
        return { success: false, error: 'Invalid username or password' };
      }

      // Hash the provided password with the stored salt
      const hashedPassword = await generateSHA256Hash(password + staffData.salt);

      // Compare with stored password hash
      if (hashedPassword !== staffData.password_hash) {
        return { success: false, error: 'Invalid username or password' };
      }

      // Update last login timestamp
      const { error: updateError } = await supabase
        .from('staff')
        .update({ last_login_timestamp: new Date().toISOString() })
        .eq('staff_id', staffData.staff_id);

      if (updateError) {
        console.warn('Failed to update last login timestamp:', updateError);
      }

      // Create staff object with role information
      const authenticatedStaff: Staff = {
        staff_id: staffData.staff_id,
        username: staffData.username,
        first_name: staffData.first_name,
        last_name: staffData.last_name,
        email: staffData.email,
        phone_number: staffData.phone_number,
        last_login_timestamp: new Date().toISOString(),
        is_active: staffData.is_active,
        mfa_enabled: staffData.mfa_enabled,
        created_at: staffData.created_at,
        updated_at: staffData.updated_at,
        role: staffData.roles ? {
          role_id: staffData.roles.role_id,
          role_name: staffData.roles.role_name,
          description: staffData.roles.description,
        } : undefined,
      };

      setStaff(authenticatedStaff);
      localStorage.setItem('staff', JSON.stringify(authenticatedStaff));

      return { success: true };
    } catch (error) {
      console.error('Staff login error:', error);
      return { success: false, error: 'An error occurred during login' };
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
    logout,
  };
}