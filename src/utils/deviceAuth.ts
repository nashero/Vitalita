/**
 * Device Authentication Service
 * 
 * This module provides device fingerprinting and authentication
 * to ensure credentials can only be accessed from the same device.
 */

import { generateDeviceFingerprint, DeviceInfo } from './deviceUtils';
import { generateDeviceHash, verifyDeviceAuthentication } from './encryption';

export interface DeviceAuthResult {
  isAuthenticated: boolean;
  deviceInfo: DeviceInfo;
  deviceHash: string;
  lastAuthenticated: string;
  authenticationCount: number;
}

export interface DeviceAuthConfig {
  maxAuthenticationAttempts?: number;
  lockoutDurationMinutes?: number;
  requireReauthenticationAfterHours?: number;
}

const DEFAULT_CONFIG: Required<DeviceAuthConfig> = {
  maxAuthenticationAttempts: 5,
  lockoutDurationMinutes: 30,
  requireReauthenticationAfterHours: 24
};

const DEVICE_AUTH_KEY = 'vitalita_device_auth';
const AUTH_ATTEMPTS_KEY = 'vitalita_auth_attempts';
const LOCKOUT_KEY = 'vitalita_device_lockout';

/**
 * Initialize device authentication
 */
export async function initializeDeviceAuth(): Promise<DeviceInfo> {
  try {
    const deviceInfo = generateDeviceFingerprint();
    const deviceHash = await generateDeviceHash(deviceInfo.deviceId);
    
    // Store device info and hash
    const authData: DeviceAuthResult = {
      isAuthenticated: true,
      deviceInfo,
      deviceHash,
      lastAuthenticated: new Date().toISOString(),
      authenticationCount: 1
    };
    
    localStorage.setItem(DEVICE_AUTH_KEY, JSON.stringify(authData));
    
    console.log('Device authentication initialized');
    return deviceInfo;
  } catch (error) {
    console.error('Failed to initialize device authentication:', error);
    throw new Error('Device authentication initialization failed');
  }
}

/**
 * Authenticate current device
 */
export async function authenticateDevice(
  config: DeviceAuthConfig = {}
): Promise<DeviceAuthResult> {
  try {
    const finalConfig = { ...DEFAULT_CONFIG, ...config };
    
    // Check for lockout
    if (isDeviceLocked()) {
      throw new Error('Device is temporarily locked due to too many failed attempts');
    }
    
    // Get current device info
    const currentDeviceInfo = generateDeviceFingerprint();
    const currentDeviceHash = await generateDeviceHash(currentDeviceInfo.deviceId);
    
    // Check if we have stored authentication data
    const storedAuthData = localStorage.getItem(DEVICE_AUTH_KEY);
    
    if (!storedAuthData) {
      // First time authentication
      return await initializeDeviceAuth();
    }
    
    const authData: DeviceAuthResult = JSON.parse(storedAuthData);
    
    // Verify device identity
    const isSameDevice = await verifyDeviceAuthentication(
      authData.deviceHash,
      currentDeviceInfo.deviceId
    );
    
    if (!isSameDevice) {
      // Different device detected
      recordFailedAuthenticationAttempt();
      throw new Error('Device authentication failed - different device detected');
    }
    
    // Check if reauthentication is required
    const lastAuth = new Date(authData.lastAuthenticated);
    const hoursSinceLastAuth = (Date.now() - lastAuth.getTime()) / (1000 * 60 * 60);
    
    if (hoursSinceLastAuth >= finalConfig.requireReauthenticationAfterHours) {
      console.log('Reauthentication required due to time elapsed');
      // Force reauthentication by clearing stored data
      localStorage.removeItem(DEVICE_AUTH_KEY);
      return await initializeDeviceAuth();
    }
    
    // Update authentication data
    const updatedAuthData: DeviceAuthResult = {
      ...authData,
      lastAuthenticated: new Date().toISOString(),
      authenticationCount: authData.authenticationCount + 1
    };
    
    localStorage.setItem(DEVICE_AUTH_KEY, JSON.stringify(updatedAuthData));
    
    // Reset failed attempts on successful authentication
    resetFailedAuthenticationAttempts();
    
    console.log('Device authentication successful');
    return updatedAuthData;
  } catch (error) {
    console.error('Device authentication failed:', error);
    throw error;
  }
}

/**
 * Check if device is currently authenticated
 */
export async function isDeviceAuthenticated(): Promise<boolean> {
  try {
    const storedAuthData = localStorage.getItem(DEVICE_AUTH_KEY);
    if (!storedAuthData) {
      return false;
    }
    
    const authData: DeviceAuthResult = JSON.parse(storedAuthData);
    
    // Check if authentication is still valid
    const lastAuth = new Date(authData.lastAuthenticated);
    const hoursSinceLastAuth = (Date.now() - lastAuth.getTime()) / (1000 * 60 * 60);
    
    if (hoursSinceLastAuth >= 24) {
      // Authentication expired
      localStorage.removeItem(DEVICE_AUTH_KEY);
      return false;
    }
    
    // Verify device identity
    const currentDeviceInfo = generateDeviceFingerprint();
    return await verifyDeviceAuthentication(
      authData.deviceHash,
      currentDeviceInfo.deviceId
    );
  } catch (error) {
    console.error('Error checking device authentication:', error);
    return false;
  }
}

/**
 * Get current device information
 */
export function getCurrentDeviceInfo(): DeviceInfo {
  return generateDeviceFingerprint();
}

/**
 * Get device authentication status
 */
export function getDeviceAuthStatus(): DeviceAuthResult | null {
  try {
    const storedAuthData = localStorage.getItem(DEVICE_AUTH_KEY);
    if (!storedAuthData) {
      return null;
    }
    
    return JSON.parse(storedAuthData);
  } catch (error) {
    console.error('Error getting device auth status:', error);
    return null;
  }
}

/**
 * Record a failed authentication attempt
 */
function recordFailedAuthenticationAttempt(): void {
  try {
    const attempts = getFailedAuthenticationAttempts();
    attempts.push(Date.now());
    
    // Keep only recent attempts within lockout window
    const lockoutWindow = 30 * 60 * 1000; // 30 minutes
    const recentAttempts = attempts.filter(
      timestamp => Date.now() - timestamp < lockoutWindow
    );
    
    localStorage.setItem(AUTH_ATTEMPTS_KEY, JSON.stringify(recentAttempts));
    
    // Check if device should be locked
    if (recentAttempts.length >= 5) {
      const lockoutData = {
        lockedAt: Date.now(),
        expiresAt: Date.now() + (30 * 60 * 1000) // 30 minutes
      };
      localStorage.setItem(LOCKOUT_KEY, JSON.stringify(lockoutData));
    }
  } catch (error) {
    console.error('Error recording failed authentication attempt:', error);
  }
}

/**
 * Get failed authentication attempts
 */
function getFailedAuthenticationAttempts(): number[] {
  try {
    const attempts = localStorage.getItem(AUTH_ATTEMPTS_KEY);
    return attempts ? JSON.parse(attempts) : [];
  } catch (error) {
    console.error('Error getting failed authentication attempts:', error);
    return [];
  }
}

/**
 * Reset failed authentication attempts
 */
function resetFailedAuthenticationAttempts(): void {
  try {
    localStorage.removeItem(AUTH_ATTEMPTS_KEY);
    localStorage.removeItem(LOCKOUT_KEY);
  } catch (error) {
    console.error('Error resetting failed authentication attempts:', error);
  }
}

/**
 * Check if device is locked
 */
function isDeviceLocked(): boolean {
  try {
    const lockoutData = localStorage.getItem(LOCKOUT_KEY);
    if (!lockoutData) {
      return false;
    }
    
    const lockout = JSON.parse(lockoutData);
    const now = Date.now();
    
    if (now >= lockout.expiresAt) {
      // Lockout expired
      localStorage.removeItem(LOCKOUT_KEY);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error checking device lockout status:', error);
    return false;
  }
}

/**
 * Get remaining lockout time in minutes
 */
export function getRemainingLockoutTime(): number {
  try {
    const lockoutData = localStorage.getItem(LOCKOUT_KEY);
    if (!lockoutData) {
      return 0;
    }
    
    const lockout = JSON.parse(lockoutData);
    const now = Date.now();
    const remainingMs = Math.max(0, lockout.expiresAt - now);
    
    return Math.ceil(remainingMs / (1000 * 60));
  } catch (error) {
    console.error('Error getting remaining lockout time:', error);
    return 0;
  }
}

/**
 * Force device reauthentication
 */
export function forceDeviceReauthentication(): void {
  try {
    localStorage.removeItem(DEVICE_AUTH_KEY);
    localStorage.removeItem(AUTH_ATTEMPTS_KEY);
    localStorage.removeItem(LOCKOUT_KEY);
    console.log('Device reauthentication forced');
  } catch (error) {
    console.error('Error forcing device reauthentication:', error);
  }
}

/**
 * Get device authentication statistics
 */
export function getDeviceAuthStats(): {
  totalAuthentications: number;
  failedAttempts: number;
  lastSuccessfulAuth: string | null;
  deviceInfo: DeviceInfo | null;
} {
  try {
    const authData = getDeviceAuthStatus();
    const failedAttempts = getFailedAuthenticationAttempts().length;
    
    return {
      totalAuthentications: authData?.authenticationCount || 0,
      failedAttempts,
      lastSuccessfulAuth: authData?.lastAuthenticated || null,
      deviceInfo: authData?.deviceInfo || null
    };
  } catch (error) {
    console.error('Error getting device auth stats:', error);
    return {
      totalAuthentications: 0,
      failedAttempts: 0,
      lastSuccessfulAuth: null,
      deviceInfo: null
    };
  }
}
