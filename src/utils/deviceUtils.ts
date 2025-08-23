/**
 * Device Utilities for Session Management
 * 
 * This module provides functions for:
 * - Device fingerprinting
 * - Session storage management
 * - Device-specific password caching
 */

export interface DeviceInfo {
  userAgent: string;
  screenResolution: string;
  timezone: string;
  language: string;
  platform: string;
  deviceId: string;
}

export interface SessionData {
  donorHashId: string;
  sessionToken: string;
  expiresAt: string;
  deviceId: string;
  lastLoginAt: string;
  lastLoginIp?: string;
}

/**
 * Generate a unique device fingerprint
 */
export function generateDeviceFingerprint(): DeviceInfo {
  const userAgent = navigator.userAgent;
  const screenResolution = `${screen.width}x${screen.height}`;
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const language = navigator.language;
  const platform = navigator.platform;
  
  // Create a unique device ID based on available information
  const deviceId = generateDeviceId(userAgent, screenResolution, timezone, language, platform);
  
  return {
    userAgent,
    screenResolution,
    timezone,
    language,
    platform,
    deviceId
  };
}

/**
 * Generate a unique device ID
 */
function generateDeviceId(...components: string[]): string {
  const combined = components.join('|');
  let hash = 0;
  
  for (let i = 0; i < combined.length; i++) {
    const char = combined.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  
  return Math.abs(hash).toString(36);
}

/**
 * Store session data in device cache
 */
export function storeSessionData(sessionData: SessionData): void {
  try {
    // Store in localStorage for persistence
    localStorage.setItem('vitalita_session', JSON.stringify(sessionData));
    
    // Also store in sessionStorage for current session
    sessionStorage.setItem('vitalita_session', JSON.stringify(sessionData));
    
    // Store device-specific password cache
    const passwordCache = {
      donorHashId: sessionData.donorHashId,
      deviceId: sessionData.deviceId,
      cachedAt: new Date().toISOString(),
      expiresAt: sessionData.expiresAt
    };
    
    localStorage.setItem(`vitalita_password_cache_${sessionData.deviceId}`, JSON.stringify(passwordCache));
  } catch (error) {
    console.error('Failed to store session data:', error);
  }
}

/**
 * Retrieve session data from device cache
 */
export function getSessionData(): SessionData | null {
  try {
    // Try sessionStorage first (current session)
    const sessionData = sessionStorage.getItem('vitalita_session');
    if (sessionData) {
      return JSON.parse(sessionData);
    }
    
    // Fall back to localStorage
    const persistentData = localStorage.getItem('vitalita_session');
    if (persistentData) {
      const parsed = JSON.parse(persistentData);
      
      // Check if session is still valid
      if (new Date(parsed.expiresAt) > new Date()) {
        return parsed;
      } else {
        // Session expired, clean up
        clearSessionData();
        return null;
      }
    }
    
    return null;
  } catch (error) {
    console.error('Failed to retrieve session data:', error);
    return null;
  }
}

/**
 * Check if password is cached for current device
 */
export function isPasswordCached(donorHashId: string): boolean {
  try {
    const deviceInfo = generateDeviceFingerprint();
    const cacheKey = `vitalita_password_cache_${deviceInfo.deviceId}`;
    const cached = localStorage.getItem(cacheKey);
    
    if (cached) {
      const passwordCache = JSON.parse(cached);
      
      // Check if cache is for the same donor and still valid
      if (passwordCache.donorHashId === donorHashId && 
          new Date(passwordCache.expiresAt) > new Date()) {
        return true;
      } else {
        // Cache expired or for different donor, clean up
        localStorage.removeItem(cacheKey);
        return false;
      }
    }
    
    return false;
  } catch (error) {
    console.error('Failed to check password cache:', error);
    return false;
  }
}

/**
 * Clear session data from device cache
 */
export function clearSessionData(): void {
  try {
    // Clear session storage
    sessionStorage.removeItem('vitalita_session');
    
    // Clear localStorage
    localStorage.removeItem('vitalita_session');
    
    // Clear device-specific password cache
    const deviceInfo = generateDeviceFingerprint();
    const cacheKey = `vitalita_password_cache_${deviceInfo.deviceId}`;
    localStorage.removeItem(cacheKey);
  } catch (error) {
    console.error('Failed to clear session data:', error);
  }
}

/**
 * Get client IP address (if available)
 */
export async function getClientIP(): Promise<string | null> {
  try {
    // Try to get IP from a public service
    const response = await fetch('https://api.ipify.org?format=json');
    const data = await response.json();
    return data.ip;
  } catch (error) {
    console.warn('Could not determine client IP:', error);
    return null;
  }
}

/**
 * Validate session expiration
 */
export function isSessionExpired(sessionData: SessionData): boolean {
  return new Date(sessionData.expiresAt) <= new Date();
}

/**
 * Get remaining session time in minutes
 */
export function getRemainingSessionTime(sessionData: SessionData): number {
  const now = new Date();
  const expiresAt = new Date(sessionData.expiresAt);
  const diffMs = expiresAt.getTime() - now.getTime();
  return Math.max(0, Math.ceil(diffMs / (1000 * 60)));
}

/**
 * Refresh session data
 */
export function refreshSessionData(sessionData: SessionData, newExpiresAt: string): void {
  const updatedSessionData: SessionData = {
    ...sessionData,
    expiresAt: newExpiresAt
  };
  
  storeSessionData(updatedSessionData);
}

/**
 * Get device information for display
 */
export function getDeviceDisplayInfo(): string {
  const deviceInfo = generateDeviceFingerprint();
  const platform = deviceInfo.platform || 'Unknown';
  const browser = getBrowserInfo(deviceInfo.userAgent);
  
  return `${browser} on ${platform}`;
}

/**
 * Extract browser information from user agent
 */
function getBrowserInfo(userAgent: string): string {
  if (userAgent.includes('Chrome')) return 'Chrome';
  if (userAgent.includes('Firefox')) return 'Firefox';
  if (userAgent.includes('Safari')) return 'Safari';
  if (userAgent.includes('Edge')) return 'Edge';
  if (userAgent.includes('Opera')) return 'Opera';
  return 'Unknown Browser';
}
