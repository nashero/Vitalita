/**
 * React Query hooks for donor management
 * Privacy-first: Only uses hash-based identification
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../lib/api';
import toast from 'react-hot-toast';

// Types
export interface Donor {
  donor_hash_id: string;
  hash_display: string;
  is_active: boolean;
  last_donation_date: string | null;
  total_donations: number;
  total_donations_this_year: number;
  center_name: string;
  eligibility_status: string;
  next_eligible_date: string | null;
  days_until_eligible: number | null;
}

export interface DonorProfile extends Donor {
  preferred_language: string;
  preferred_communication_channel: string;
  initial_vetting_status: boolean;
  center_address?: string;
  center_city?: string;
  staff_notes?: StaffNote[];
}

export interface StaffNote {
  note_id: string;
  note_text: string;
  note_type: string;
  created_by: string;
  created_at: string;
}

export interface DonationHistoryItem {
  donation_id: string;
  donation_date: string;
  donation_type: string;
  donation_volume: number;
  status: string;
  notes: string | null;
  center_name: string;
  staff_first_name?: string;
  staff_last_name?: string;
}

export interface Eligibility {
  status: string;
  eligible: boolean;
  next_eligible_date: string | null;
  days_until_eligible: number | null;
  reasons: string[];
  rules: {
    minDays: number;
    maxPerYear: number;
    daysSinceLast: number | null;
    donationsThisYear: number;
  };
}

export interface DonorFilters {
  page?: number;
  limit?: number;
  center_id?: string;
  eligibility_status?: string;
  donation_type?: string;
  start_date?: string;
  end_date?: string;
  search?: string;
  sort?: string;
  order?: 'asc' | 'desc';
}

/**
 * List donors with filters
 */
export function useDonors(filters: DonorFilters = {}) {
  return useQuery({
    queryKey: ['donors', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, String(value));
        }
      });

      const response = await apiClient.get(`/api/staff/donors?${params.toString()}`);
      return response.data;
    },
    refetchInterval: 60000, // Refetch every minute
  });
}

/**
 * Get donor by hash
 */
export function useDonor(hash: string) {
  return useQuery({
    queryKey: ['donor', hash],
    queryFn: async () => {
      const response = await apiClient.get(`/api/staff/donors/${hash}`);
      return response.data;
    },
    enabled: !!hash && hash.length > 0,
  });
}

/**
 * Get donor history
 */
export function useDonorHistory(hash: string) {
  return useQuery({
    queryKey: ['donor-history', hash],
    queryFn: async () => {
      const response = await apiClient.get(`/api/staff/donors/${hash}/history`);
      return response.data;
    },
    enabled: !!hash && hash.length > 0,
  });
}

/**
 * Get donor eligibility
 */
export function useDonorEligibility(hash: string, donationType: string = 'whole_blood') {
  return useQuery({
    queryKey: ['donor-eligibility', hash, donationType],
    queryFn: async () => {
      const response = await apiClient.get(
        `/api/staff/donors/${hash}/eligibility?donation_type=${donationType}`
      );
      return response.data;
    },
    enabled: !!hash && hash.length > 0,
    refetchInterval: 60000, // Refetch every minute for countdown
  });
}

/**
 * Get donor statistics
 */
export function useDonorStats(filters: { center_id?: string; start_date?: string; end_date?: string } = {}) {
  return useQuery({
    queryKey: ['donor-stats', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });

      const response = await apiClient.get(`/api/staff/donors/stats?${params.toString()}`);
      return response.data;
    },
    refetchInterval: 300000, // Refetch every 5 minutes
  });
}

/**
 * Search donors
 */
export function useSearchDonors() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (criteria: {
      hash_prefix?: string;
      center_id?: string;
      last_donation_after?: string;
      last_donation_before?: string;
    }) => {
      const response = await apiClient.post('/api/staff/donors/search', criteria);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['donors'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error?.message || 'Search failed');
    },
  });
}

/**
 * Add donor note
 */
export function useAddDonorNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ hash, note_text, note_type }: { hash: string; note_text: string; note_type?: string }) => {
      const response = await apiClient.put(`/api/staff/donors/${hash}/notes`, {
        note_text,
        note_type: note_type || 'general',
      });
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['donor', variables.hash] });
      toast.success('Note added successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error?.message || 'Failed to add note');
    },
  });
}

