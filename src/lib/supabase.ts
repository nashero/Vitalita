import { createClient } from '@supabase/supabase-js';

// Try to get from environment variables, fallback to hardcoded for testing
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://pxvimagfvontwxygmtgpi.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB4dmltYWdmdm9ud3h5Z210Z3BpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEyODg4NjcsImV4cCI6MjA2Njg2NDg2N30.U0ZAojLgRS680JpP2HXZhm1Q_vce6i8o9k5zZ3Jx6LA';

// Debug logging to help identify environment variable issues
console.log('Environment check:', {
  envUrl: import.meta.env.VITE_SUPABASE_URL ? 'Set' : 'Missing',
  envKey: 'Set (hardcoded anon key)',
  finalUrl: supabaseUrl ? 'Set' : 'Missing',
  finalKey: 'Set (hardcoded anon key)',
});

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase credentials:', {
    url: supabaseUrl,
    key: supabaseAnonKey ? 'Present' : 'Missing',
  });
  throw new Error('Missing Supabase credentials. Please check your .env file.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Test connection function
export async function testSupabaseConnection() {
  try {
    console.log('Testing Supabase connection...');
    console.log('Using URL:', supabaseUrl);
    console.log('Using Key:', supabaseAnonKey ? 'Present' : 'Missing');
    
    // Test a simple query
    const { data, error } = await supabase.from('donation_centers').select('count').limit(1);
    
    if (error) {
      console.error('Supabase connection failed:', error);
      return { success: false, error: error.message };
    } else {
      console.log('Supabase connection successful!');
      return { success: true, data };
    }
  } catch (err) {
    console.error('Supabase connection test failed:', err);
    return { success: false, error: err };
  }
}

export type Database = {
  public: {
    Tables: {
      donors: {
        Row: {
          donor_hash_id: string;
          salt: string;
          email: string | null;
          email_verified: boolean;
          verification_token: string | null;
          verification_token_expires: string | null;
          account_activated: boolean;
          activation_date: string | null;
          preferred_language: string;
          preferred_communication_channel: string;
          initial_vetting_status: boolean;
          total_donations_this_year: number;
          last_donation_date: string | null;
          is_active: boolean;
          avis_donor_center: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          donor_hash_id: string;
          salt: string;
          email?: string | null;
          email_verified?: boolean;
          verification_token?: string | null;
          verification_token_expires?: string | null;
          account_activated?: boolean;
          activation_date?: string | null;
          preferred_language?: string;
          preferred_communication_channel?: string;
          initial_vetting_status?: boolean;
          total_donations_this_year?: number;
          last_donation_date?: string | null;
          is_active?: boolean;
          avis_donor_center: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          donor_hash_id?: string;
          salt?: string;
          email?: string | null;
          email_verified?: boolean;
          verification_token?: string | null;
          verification_token_expires?: string | null;
          account_activated?: boolean;
          activation_date?: string | null;
          preferred_language?: string;
          preferred_communication_channel?: string;
          initial_vetting_status?: boolean;
          total_donations_this_year?: number;
          last_donation_date?: string | null;
          is_active?: boolean;
          avis_donor_center?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      appointments: {
        Row: {
          appointment_id: string;
          donor_hash_id: string;
          staff_id: string | null;
          donation_center_id: string;
          appointment_datetime: string;
          donation_type: string;
          status: string;
          booking_channel: string;
          confirmation_sent: boolean;
          reminder_sent: boolean;
          creation_timestamp: string;
          last_updated_timestamp: string;
        };
        Insert: {
          appointment_id?: string;
          donor_hash_id: string;
          staff_id?: string | null;
          donation_center_id: string;
          appointment_datetime: string;
          donation_type: string;
          status?: string;
          booking_channel?: string;
          confirmation_sent?: boolean;
          reminder_sent?: boolean;
          creation_timestamp?: string;
          last_updated_timestamp?: string;
        };
        Update: {
          appointment_id?: string;
          donor_hash_id?: string;
          staff_id?: string | null;
          donation_center_id?: string;
          appointment_datetime?: string;
          donation_type?: string;
          status?: string;
          booking_channel?: string;
          confirmation_sent?: boolean;
          reminder_sent?: boolean;
          creation_timestamp?: string;
          last_updated_timestamp?: string;
        };
      };
      staff: {
        Row: {
          staff_id: string;
          username: string;
          password_hash: string;
          salt: string;
          role_id: string;
          first_name: string;
          last_name: string;
          email: string;
          phone_number: string | null;
          last_login_timestamp: string | null;
          is_active: boolean;
          mfa_enabled: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          staff_id?: string;
          username: string;
          password_hash: string;
          salt: string;
          role_id: string;
          first_name: string;
          last_name: string;
          email: string;
          phone_number?: string | null;
          last_login_timestamp?: string | null;
          is_active?: boolean;
          mfa_enabled?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          staff_id?: string;
          username?: string;
          password_hash?: string;
          salt?: string;
          role_id?: string;
          first_name?: string;
          last_name?: string;
          email?: string;
          phone_number?: string | null;
          last_login_timestamp?: string | null;
          is_active?: boolean;
          mfa_enabled?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      donation_centers: {
        Row: {
          center_id: string;
          name: string;
          address: string;
          city: string;
          country: string;
          contact_phone: string | null;
          email: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          center_id?: string;
          name: string;
          address: string;
          city: string;
          country: string;
          contact_phone?: string | null;
          email?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          center_id?: string;
          name?: string;
          address?: string;
          city?: string;
          country?: string;
          contact_phone?: string | null;
          email?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      availability_slots: {
        Row: {
          slot_id: string;
          center_id: string;
          slot_datetime: string;
          donation_type: string;
          capacity: number;
          current_bookings: number;
          is_available: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          slot_id?: string;
          center_id: string;
          slot_datetime: string;
          donation_type: string;
          capacity: number;
          current_bookings?: number;
          is_available?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          slot_id?: string;
          center_id?: string;
          slot_datetime?: string;
          donation_type?: string;
          capacity?: number;
          current_bookings?: number;
          is_available?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      roles: {
        Row: {
          role_id: string;
          role_name: string;
          description: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          role_id?: string;
          role_name: string;
          description?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          role_id?: string;
          role_name?: string;
          description?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      permissions: {
        Row: {
          permission_id: string;
          permission_name: string;
          description: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          permission_id?: string;
          permission_name: string;
          description?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          permission_id?: string;
          permission_name?: string;
          description?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      role_permissions: {
        Row: {
          role_id: string;
          permission_id: string;
          created_at: string;
        };
        Insert: {
          role_id: string;
          permission_id: string;
          created_at?: string;
        };
        Update: {
          role_id?: string;
          permission_id?: string;
          created_at?: string;
        };
      };
      audit_logs: {
        Row: {
          log_id: string;
          timestamp: string;
          user_id: string | null;
          user_type: string;
          action: string;
          details: string | null;
          ip_address: string | null;
          user_agent: string | null;
          resource_type: string | null;
          resource_id: string | null;
          status: string;
        };
        Insert: {
          log_id?: string;
          timestamp?: string;
          user_id?: string | null;
          user_type: string;
          action: string;
          details?: string | null;
          ip_address?: string | null;
          user_agent?: string | null;
          resource_type?: string | null;
          resource_id?: string | null;
          status?: string;
        };
        Update: {
          log_id?: string;
          timestamp?: string;
          user_id?: string | null;
          user_type?: string;
          action?: string;
          details?: string | null;
          ip_address?: string | null;
          user_agent?: string | null;
          resource_type?: string | null;
          resource_id?: string | null;
          status?: string;
        };
      };
    };
    Functions: {
      create_audit_log: {
        Args: {
          p_user_id?: string;
          p_user_type?: string;
          p_action?: string;
          p_details?: string;
          p_ip_address?: string;
          p_user_agent?: string;
          p_resource_type?: string;
          p_resource_id?: string;
          p_status?: string;
        };
        Returns: string;
      };
      register_donor_with_email: {
        Args: {
          p_donor_hash_id: string;
          p_salt: string;
          p_email: string;
          p_avis_donor_center: string;
        };
        Returns: boolean;
      };
      verify_donor_email: {
        Args: {
          p_verification_token: string;
        };
        Returns: boolean;
      };
      activate_donor_account: {
        Args: {
          p_donor_hash_id: string;
          p_staff_user_id: string;
        };
        Returns: boolean;
      };
      generate_verification_token: {
        Args: {};
        Returns: string;
      };
      send_verification_email: {
        Args: {
          p_email: string;
          p_verification_token: string;
          p_donor_hash_id: string;
        };
        Returns: boolean;
      };
      cleanup_expired_tokens: {
        Args: {};
        Returns: number;
      };
    };
  };
};