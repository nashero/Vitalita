/**
 * React Query hooks for appointments
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../lib/api';
import toast from 'react-hot-toast';

// Types
export interface Appointment {
  appointment_id: string;
  donor_hash_id: string;
  staff_id: string | null;
  donation_center_id: string;
  appointment_datetime: string;
  donation_type: 'whole_blood' | 'plasma';
  status: 'scheduled' | 'confirmed' | 'arrived' | 'in-progress' | 'completed' | 'cancelled' | 'no-show';
  booking_channel: string;
  confirmation_sent: boolean;
  reminder_sent: boolean;
  creation_timestamp: string;
  last_updated_timestamp: string;
  center_name?: string;
  center_address?: string;
  center_city?: string;
  staff_first_name?: string;
  staff_last_name?: string;
  donor_active?: boolean;
}

export interface AppointmentFilters {
  page?: number;
  limit?: number;
  status?: string;
  donation_type?: string;
  center_id?: string;
  start_date?: string;
  end_date?: string;
  search?: string;
  sort?: string;
  order?: 'asc' | 'desc';
}

/**
 * List appointments with filters
 */
export function useAppointments(filters: AppointmentFilters = {}) {
  return useQuery({
    queryKey: ['appointments', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, String(value));
        }
      });

      const response = await apiClient.get(`/api/staff/appointments?${params.toString()}`);
      return response.data;
    },
    refetchInterval: 30000, // Refetch every 30 seconds
  });
}

/**
 * Get single appointment
 */
export function useAppointment(id: string) {
  return useQuery({
    queryKey: ['appointment', id],
    queryFn: async () => {
      const response = await apiClient.get(`/api/staff/appointments/${id}`);
      return response.data;
    },
    enabled: !!id,
  });
}

/**
 * Get calendar data
 */
export function useAppointmentsCalendar(start: string, end: string, centerId?: string) {
  return useQuery({
    queryKey: ['appointments-calendar', start, end, centerId],
    queryFn: async () => {
      const params = new URLSearchParams({ start, end });
      if (centerId) params.append('center_id', centerId);

      const response = await apiClient.get(`/api/staff/appointments/calendar?${params.toString()}`);
      return response.data;
    },
    refetchInterval: 30000,
  });
}

/**
 * Get appointment statistics
 */
export function useAppointmentStats(filters: { start_date?: string; end_date?: string; center_id?: string } = {}) {
  return useQuery({
    queryKey: ['appointments-stats', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });

      const response = await apiClient.get(`/api/staff/appointments/stats?${params.toString()}`);
      return response.data;
    },
    refetchInterval: 60000, // Refetch every minute
  });
}

/**
 * Create appointment mutation
 */
export function useCreateAppointment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      donor_hash_id: string;
      donation_center_id: string;
      appointment_datetime: string;
      donation_type: 'whole_blood' | 'plasma';
      notes?: string;
    }) => {
      const response = await apiClient.post('/api/staff/appointments', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      queryClient.invalidateQueries({ queryKey: ['appointments-calendar'] });
      toast.success('Appointment created successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error?.message || 'Failed to create appointment');
    },
  });
}

/**
 * Update appointment mutation
 */
export function useUpdateAppointment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Appointment> }) => {
      const response = await apiClient.put(`/api/staff/appointments/${id}`, data);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      queryClient.invalidateQueries({ queryKey: ['appointment', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['appointments-calendar'] });
      toast.success('Appointment updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error?.message || 'Failed to update appointment');
    },
  });
}

/**
 * Update appointment status mutation
 */
export function useUpdateAppointmentStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status, notes }: { id: string; status: Appointment['status']; notes?: string }) => {
      const response = await apiClient.patch(`/api/staff/appointments/${id}/status`, { status, notes });
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      queryClient.invalidateQueries({ queryKey: ['appointment', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['appointments-calendar'] });
      queryClient.invalidateQueries({ queryKey: ['appointments-stats'] });
      toast.success(`Appointment ${variables.status} successfully`);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error?.message || 'Failed to update appointment status');
    },
  });
}

/**
 * Export appointments mutation
 */
export function useExportAppointments() {
  return useMutation({
    mutationFn: async (filters: { start_date?: string; end_date?: string; status?: string; center_id?: string }) => {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });

      const response = await apiClient.get(`/api/staff/appointments/export?${params.toString()}`, {
        responseType: 'blob',
      });

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `appointments-${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    },
    onSuccess: () => {
      toast.success('Appointments exported successfully');
    },
    onError: () => {
      toast.error('Failed to export appointments');
    },
  });
}

