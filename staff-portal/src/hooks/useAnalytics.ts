/**
 * React Query hooks for analytics
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../lib/api';
import toast from 'react-hot-toast';

// Types
export interface DashboardMetrics {
  metrics: {
    total_donations: number;
    whole_blood_donations: number;
    plasma_donations: number;
    unique_donors: number;
    avg_donation_volume: number;
    completed_appointments: number;
    cancelled_appointments: number;
    no_show_appointments: number;
    total_appointments: number;
    active_donors: number;
    new_donors: number;
    success_rate: number;
    trends: {
      total_donations: number;
      unique_donors: number;
      success_rate: number;
      active_donors: number;
    };
  };
  period: {
    start: string;
    end: string;
    previous_start: string;
    previous_end: string;
  };
}

export interface DonationTrend {
  period: string;
  donation_count: number;
  whole_blood_count: number;
  plasma_count: number;
  avg_volume: number;
  unique_donors: number;
}

export interface AnalyticsFilters {
  start_date?: string;
  end_date?: string;
  center_id?: string;
  group_by?: 'day' | 'week' | 'month';
}

/**
 * Get dashboard metrics
 */
export function useDashboardMetrics(filters: AnalyticsFilters = {}) {
  return useQuery({
    queryKey: ['analytics-dashboard', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });

      const response = await apiClient.get(`/api/staff/analytics/dashboard?${params.toString()}`);
      return response.data;
    },
    refetchInterval: 300000, // Refetch every 5 minutes
  });
}

/**
 * Get donation trends
 */
export function useDonationTrends(filters: AnalyticsFilters = {}) {
  return useQuery({
    queryKey: ['analytics-donations', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });

      const response = await apiClient.get(`/api/staff/analytics/donations?${params.toString()}`);
      return response.data;
    },
  });
}

/**
 * Get donor statistics
 */
export function useDonorStatistics(filters: AnalyticsFilters = {}) {
  return useQuery({
    queryKey: ['analytics-donors', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });

      const response = await apiClient.get(`/api/staff/analytics/donors?${params.toString()}`);
      return response.data;
    },
  });
}

/**
 * Get center performance
 */
export function useCenterPerformance(filters: AnalyticsFilters = {}) {
  return useQuery({
    queryKey: ['analytics-centers', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });

      const response = await apiClient.get(`/api/staff/analytics/centers?${params.toString()}`);
      return response.data;
    },
  });
}

/**
 * Get staff productivity
 */
export function useStaffProductivity(filters: AnalyticsFilters = {}) {
  return useQuery({
    queryKey: ['analytics-staff', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });

      const response = await apiClient.get(`/api/staff/analytics/staff?${params.toString()}`);
      return response.data;
    },
  });
}

/**
 * Generate report
 */
export function useGenerateReport() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      report_type: 'donations' | 'donors' | 'operational' | 'financial';
      start_date: string;
      end_date: string;
      center_id?: string;
      format: 'csv' | 'excel' | 'pdf';
      include_charts?: boolean;
    }) => {
      const response = await apiClient.post('/api/staff/reports/generate', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reports'] });
      toast.success('Report generated successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error?.message || 'Failed to generate report');
    },
  });
}

/**
 * Download report
 */
export function useDownloadReport() {
  return useMutation({
    mutationFn: async ({ reportId, format }: { reportId: string; format?: string }) => {
      const params = format ? `?format=${format}` : '';
      const response = await apiClient.get(`/api/staff/reports/${reportId}/download${params}`, {
        responseType: 'blob',
      });

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `report-${reportId.substring(0, 8)}.${format || 'csv'}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    },
    onSuccess: () => {
      toast.success('Report downloaded successfully');
    },
    onError: () => {
      toast.error('Failed to download report');
    },
  });
}

