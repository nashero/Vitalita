/**
 * Authentication utility functions for donor portal
 */

/**
 * Clear all authentication data from sessionStorage
 */
export const clearAuthData = (): void => {
  sessionStorage.removeItem('donor_hash_id');
  sessionStorage.removeItem('donor_id');
  sessionStorage.removeItem('donor_email');
};

/**
 * Check if user is authenticated
 */
export const isAuthenticated = (): boolean => {
  return !!sessionStorage.getItem('donor_hash_id');
};

/**
 * Get donor hash ID from session
 */
export const getDonorHashId = (): string | null => {
  return sessionStorage.getItem('donor_hash_id');
};

/**
 * Get donor ID from session
 */
export const getDonorId = (): string | null => {
  return sessionStorage.getItem('donor_id');
};

/**
 * Get donor email from session
 */
export const getDonorEmail = (): string | null => {
  return sessionStorage.getItem('donor_email');
};

/**
 * Logout user - clears auth data and dispatches event to notify all components
 */
export const logout = (): void => {
  clearAuthData();
  // Dispatch custom event to notify all components of auth state change
  window.dispatchEvent(new Event('auth-change'));
};
