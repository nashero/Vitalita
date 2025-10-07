import { useState, useEffect, createContext, useContext } from 'react';
import { generateSHA256Hash } from '../utils/crypto';
import { supabase } from '../lib/supabase';

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

type LoginResult = { success: boolean; error?: string };

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

      // First, get the staff member by username
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

      console.log('Staff member found:', {
        username: staffData.username,
        is_active: staffData.is_active,
        has_salt: !!staffData.salt,
        has_password_hash: !!staffData.password_hash
      });

      // Hash the provided password with the stored salt
      const hashedPassword = await generateSHA256Hash(password + staffData.salt);
      
      console.log('Password verification:', {
        provided_password_length: password.length,
        salt: staffData.salt,
        hashed_password: hashedPassword.substring(0, 20) + '...',
        stored_hash: staffData.password_hash.substring(0, 20) + '...',
        hash_match: hashedPassword === staffData.password_hash
      });

      // Compare with stored password hash
      if (hashedPassword !== staffData.password_hash) {
        console.log('Password hash mismatch - login failed');
        return { success: false, error: 'Invalid username or password' };
      }

      console.log('Password verification successful');

      // Update last login timestamp
      const { error: updateError } = await supabase
        .from('staff')
        .update({ last_login_timestamp: new Date().toISOString() })
        .eq('staff_id', staffData.staff_id);

      if (updateError) {
        console.error('Failed to update last login timestamp:', updateError);
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

      // Create audit log for successful login
      try {
        await supabase.rpc('create_audit_log', {
          p_user_id: authenticatedStaff.staff_id,
          p_user_type: 'staff',
          p_action: 'login',
          p_details: 'Staff member successfully logged in',
          p_status: 'success'
        });
        console.log('Audit log created successfully');
      } catch (auditError) {
        console.warn('Failed to create audit log:', auditError);
        // Don't fail the login if audit log creation fails
      }

      return { success: true };
    } catch (error) {
      console.error('Staff login error:', error);
      return { success: false, error: 'An error occurred during login' };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    if (staff) {
      // Create audit log for logout
      (async () => {
        try {
          await supabase.rpc('create_audit_log', {
            p_user_id: staff.staff_id,
            p_user_type: 'staff',
            p_action: 'logout',
            p_details: 'Staff member logged out',
            p_status: 'success'
          });
        } catch (error) {
          console.error('Failed to create audit log:', error);
        }
      })();
    }

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