/**
 * Custom hooks for dashboard data fetching
 */

import { useQuery } from '@tanstack/react-query';
import { useApiClient } from './useApiClient';

// KPI Data
export function useKPIData(dateRange?: { start: string; end: string }) {
  const api = useApiClient();

  return useQuery({
    queryKey: ['kpi', dateRange],
    queryFn: async () => {
      const params = dateRange ? { start: dateRange.start, end: dateRange.end } : {};
      return api.get('/api/staff/dashboard/kpi', { params });
    },
    refetchInterval: 60000, // Refetch every minute
  });
}

// Appointments
export function useAppointments(date?: string) {
  const api = useApiClient();

  return useQuery({
    queryKey: ['appointments', date],
    queryFn: async () => {
      const params = date ? { date } : {};
      return api.get('/api/staff/appointments', { params });
    },
    refetchInterval: 30000, // Refetch every 30 seconds
  });
}

// Financial Data
export function useFinancialData(dateRange?: { start: string; end: string }) {
  const api = useApiClient();

  return useQuery({
    queryKey: ['financial', dateRange],
    queryFn: async () => {
      const params = dateRange ? { start: dateRange.start, end: dateRange.end } : {};
      return api.get('/api/staff/dashboard/financial', { params });
    },
    enabled: false, // Only fetch when explicitly needed (permission check)
  });
}

// Alerts
export function useAlerts() {
  const api = useApiClient();

  return useQuery({
    queryKey: ['alerts'],
    queryFn: async () => api.get('/api/staff/dashboard/alerts'),
    refetchInterval: 30000,
  });
}

// Donor Queue
export function useDonorQueue() {
  const api = useApiClient();

  return useQuery({
    queryKey: ['donor-queue'],
    queryFn: async () => api.get('/api/staff/dashboard/donor-queue'),
    refetchInterval: 10000, // Refetch every 10 seconds for real-time updates
  });
}

// Performance Metrics
export function usePerformanceMetrics(centerId?: string) {
  const api = useApiClient();

  return useQuery({
    queryKey: ['performance', centerId],
    queryFn: async () => {
      const params = centerId ? { center_id: centerId } : {};
      return api.get('/api/staff/dashboard/performance', { params });
    },
  });
}

// Volunteer Schedule
export function useVolunteerSchedule(date?: string) {
  const api = useApiClient();

  return useQuery({
    queryKey: ['volunteer-schedule', date],
    queryFn: async () => {
      const params = date ? { date } : {};
      return api.get('/api/staff/dashboard/volunteer-schedule', { params });
    },
  });
}

// Training Completion
export function useTrainingCompletion() {
  const api = useApiClient();

  return useQuery({
    queryKey: ['training-completion'],
    queryFn: async () => api.get('/api/staff/dashboard/training-completion'),
  });
}

// Quality Metrics
export function useQualityMetrics() {
  const api = useApiClient();

  return useQuery({
    queryKey: ['quality-metrics'],
    queryFn: async () => api.get('/api/staff/dashboard/quality-metrics'),
  });
}

