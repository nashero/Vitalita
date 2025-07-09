import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Database = {
  public: {
    Tables: {
      donors: {
        Row: {
          donor_hash_id: string;
          salt: string;
          preferred_language: string;
          preferred_communication_channel: string;
          initial_vetting_status: boolean;
          total_donations_this_year: number;
          last_donation_date: string | null;
          is_active: boolean;
        };
        Insert: {
          donor_hash_id: string;
          salt: string;
          preferred_language?: string;
          preferred_communication_channel?: string;
          initial_vetting_status?: boolean;
          total_donations_this_year?: number;
          last_donation_date?: string | null;
          is_active?: boolean;
        };
        Update: {
          donor_hash_id?: string;
          salt?: string;
          preferred_language?: string;
          preferred_communication_channel?: string;
          initial_vetting_status?: boolean;
          total_donations_this_year?: number;
          last_donation_date?: string | null;
          is_active?: boolean;
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
    };
  };
};