import { useState, useEffect, createContext, useContext } from 'react';
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
      const staffData = { // Mock data for demonstration
        staff_id: 'mock_staff_id',
        username: 'testuser',
        first_name: 'Test',
        last_name: 'User',
        email: 'test@example.com',
        phone_number: null,
        last_login_timestamp: null,
        is_active: true,
        mfa_enabled: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        salt: 'mock_salt', // Mock salt for demonstration
        password_hash: await generateSHA256Hash('password' + 'mock_salt'), // Mock password hash for demonstration
        roles: { // Mock role for demonstration
          role_id: 'mock_role_id',
          role_name: 'Mock Role',
          description: 'This is a mock role.',
        },
      };

      // Hash the provided password with the stored salt
      const hashedPassword = await generateSHA256Hash(password + staffData.salt);

      // Compare with stored password hash
      if (hashedPassword !== staffData.password_hash) {
        return { success: false, error: 'Invalid username or password' };
      }

      // Update last login timestamp
      // Mock update for demonstration
      const updatedStaffData = { ...staffData, last_login_timestamp: new Date().toISOString() };
      setStaff(updatedStaffData);
      localStorage.setItem('staff', JSON.stringify(updatedStaffData));

      // Create staff object with role information
      const authenticatedStaff: Staff = {
        staff_id: updatedStaffData.staff_id,
        username: updatedStaffData.username,
        first_name: updatedStaffData.first_name,
        last_name: updatedStaffData.last_name,
        email: updatedStaffData.email,
        phone_number: updatedStaffData.phone_number,
        last_login_timestamp: updatedStaffData.last_login_timestamp,
        is_active: updatedStaffData.is_active,
        mfa_enabled: updatedStaffData.mfa_enabled,
        created_at: updatedStaffData.created_at,
        updated_at: updatedStaffData.updated_at,
        role: updatedStaffData.roles ? {
          role_id: updatedStaffData.roles.role_id,
          role_name: updatedStaffData.roles.role_name,
          description: updatedStaffData.roles.description,
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