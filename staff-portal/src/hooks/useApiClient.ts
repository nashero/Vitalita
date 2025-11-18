/**
 * Hook for making authenticated API requests
 */

import { useCallback } from 'react';
import apiClient from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

export function useApiClient() {
  const { logout } = useAuth();

  const get = useCallback(
    async <T = any>(url: string, config?: any): Promise<T> => {
      try {
        const response = await apiClient.get(url, config);
        return response.data;
      } catch (error: any) {
        if (error.response?.status === 401) {
          await logout();
        }
        throw error;
      }
    },
    [logout]
  );

  const post = useCallback(
    async <T = any>(url: string, data?: any, config?: any): Promise<T> => {
      try {
        const response = await apiClient.post(url, data, config);
        return response.data;
      } catch (error: any) {
        if (error.response?.status === 401) {
          await logout();
        }
        throw error;
      }
    },
    [logout]
  );

  const put = useCallback(
    async <T = any>(url: string, data?: any, config?: any): Promise<T> => {
      try {
        const response = await apiClient.put(url, data, config);
        return response.data;
      } catch (error: any) {
        if (error.response?.status === 401) {
          await logout();
        }
        throw error;
      }
    },
    [logout]
  );

  const del = useCallback(
    async <T = any>(url: string, config?: any): Promise<T> => {
      try {
        const response = await apiClient.delete(url, config);
        return response.data;
      } catch (error: any) {
        if (error.response?.status === 401) {
          await logout();
        }
        throw error;
      }
    },
    [logout]
  );

  const patch = useCallback(
    async <T = any>(url: string, data?: any, config?: any): Promise<T> => {
      try {
        const response = await apiClient.patch(url, data, config);
        return response.data;
      } catch (error: any) {
        if (error.response?.status === 401) {
          await logout();
        }
        throw error;
      }
    },
    [logout]
  );

  return {
    get,
    post,
    put,
    delete: del,
    patch,
  };
}

