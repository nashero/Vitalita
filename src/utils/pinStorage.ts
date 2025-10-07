/**
 * Secure PIN Storage Utilities
 * 
 * This module provides encrypted storage for PIN data with device authentication
 * and secure key management using Web Crypto API.
 */

import { 
  EncryptedData, 
  encryptCredentials, 
  decryptCredentials,
  generateDeviceHash,
  verifyDeviceAuthentication
} from './encryption';
import { generateDeviceFingerprint } from './deviceUtils';
import { hashPin, verifyPin, isPinExpired, PinAttempt, PinLockoutInfo } from './pinUtils';

export interface PinData {
  pinHash: string;
  createdAt: number;
  lastUsedAt: number;
  attempts: PinAttempt[];
  isActive: boolean;
  donorId: string;
}

export interface StoredPinData {
  encryptedData: EncryptedData;
  deviceHash: string;
  storedAt: string;
  expiresAt: string;
  version: string;
}

export interface PinStorageOptions {
  expirationHours?: number;
  secureOnly?: boolean;
  autoExtend?: boolean;
}

const DEFAULT_EXPIRATION_HOURS = 24 * 30; // 30 days
const PIN_STORAGE_KEY = 'vitalita_pin_data';
const PIN_DEVICE_HASH_KEY = 'vitalita_pin_device_hash';
const PIN_VERSION = '1.0';

/**
 * Store PIN data securely with encryption
 */
export async function storePinData(
  pinData: PinData,
  options: PinStorageOptions = {}
): Promise<boolean> {
  try {
    const deviceFingerprint = generateDeviceFingerprint().deviceId;
    const deviceHash = await generateDeviceHash(deviceFingerprint);
    
    // Encrypt the PIN data
    const encryptedData = await encryptCredentials({
      firstName: '', // Not used for PIN storage
      lastName: '', // Not used for PIN storage
      avisCenter: '', // Not used for PIN storage
      donorId: pinData.donorId
    }, deviceFingerprint);
    
    // Create a custom encrypted data structure for PIN
    const pinEncryptedData: EncryptedData = {
      encrypted: await encryptPinData(pinData, deviceFingerprint),
      iv: encryptedData.iv,
      salt: encryptedData.salt,
      version: PIN_VERSION
    };
    
    // Set expiration
    const now = new Date();
    const expiresAt = new Date(now.getTime() + (options.expirationHours || DEFAULT_EXPIRATION_HOURS) * 60 * 60 * 1000);
    
    const storedData: StoredPinData = {
      encryptedData: pinEncryptedData,
      deviceHash,
      storedAt: now.toISOString(),
      expiresAt: expiresAt.toISOString(),
      version: PIN_VERSION
    };
    
    // Store in localStorage
    localStorage.setItem(PIN_STORAGE_KEY, JSON.stringify(storedData));
    localStorage.setItem(PIN_DEVICE_HASH_KEY, deviceHash);
    
    console.log('PIN data stored securely');
    return true;
  } catch (error) {
    console.error('Failed to store PIN data:', error);
    return false;
  }
}

/**
 * Retrieve and decrypt stored PIN data
 */
export async function retrievePinData(): Promise<PinData | null> {
  try {
    // Check if PIN data exists
    const storedDataString = localStorage.getItem(PIN_STORAGE_KEY);
    if (!storedDataString) {
      return null;
    }
    
    const storedData: StoredPinData = JSON.parse(storedDataString);
    
    // Check expiration
    if (new Date(storedData.expiresAt) <= new Date()) {
      console.log('Stored PIN data has expired');
      clearPinData();
      return null;
    }
    
    // Verify device authentication
    const currentDeviceFingerprint = generateDeviceFingerprint().deviceId;
    const isAuthenticated = await verifyDeviceAuthentication(
      storedData.deviceHash,
      currentDeviceFingerprint
    );
    
    if (!isAuthenticated) {
      console.log('Device authentication failed for PIN data');
      clearPinData();
      return null;
    }
    
    // Decrypt PIN data
    const pinData = await decryptPinData(
      storedData.encryptedData,
      currentDeviceFingerprint
    );
    
    // Check if PIN is expired
    if (isPinExpired(pinData.createdAt)) {
      console.log('PIN has expired');
      clearPinData();
      return null;
    }
    
    console.log('PIN data retrieved successfully');
    return pinData;
  } catch (error) {
    console.error('Failed to retrieve PIN data:', error);
    clearPinData();
    return null;
  }
}

/**
 * Update PIN data
 */
export async function updatePinData(
  updates: Partial<PinData>,
  options: PinStorageOptions = {}
): Promise<boolean> {
  try {
    const existingData = await retrievePinData();
    if (!existingData) {
      return false;
    }
    
    const updatedData: PinData = {
      ...existingData,
      ...updates,
      lastUsedAt: Date.now()
    };
    
    return await storePinData(updatedData, options);
  } catch (error) {
    console.error('Failed to update PIN data:', error);
    return false;
  }
}

/**
 * Clear stored PIN data
 */
export function clearPinData(): void {
  try {
    localStorage.removeItem(PIN_STORAGE_KEY);
    localStorage.removeItem(PIN_DEVICE_HASH_KEY);
    console.log('PIN data cleared from storage');
  } catch (error) {
    console.error('Failed to clear PIN data:', error);
  }
}

/**
 * Check if PIN data exists and is valid
 */
export async function hasValidPinData(): Promise<boolean> {
  try {
    const pinData = await retrievePinData();
    return pinData !== null && pinData.isActive;
  } catch (error) {
    console.error('Error checking PIN data validity:', error);
    return false;
  }
}

/**
 * Get PIN storage information
 */
export function getPinStorageInfo(): {
  hasPinData: boolean;
  storedAt?: string;
  expiresAt?: string;
  isExpired: boolean;
  version?: string;
} {
  try {
    const storedDataString = localStorage.getItem(PIN_STORAGE_KEY);
    if (!storedDataString) {
      return {
        hasPinData: false,
        isExpired: false
      };
    }
    
    const storedData: StoredPinData = JSON.parse(storedDataString);
    const now = new Date();
    const expiresAt = new Date(storedData.expiresAt);
    
    return {
      hasPinData: true,
      storedAt: storedData.storedAt,
      expiresAt: storedData.expiresAt,
      isExpired: expiresAt <= now,
      version: storedData.version
    };
  } catch (error) {
    console.error('Failed to get PIN storage info:', error);
    return {
      hasPinData: false,
      isExpired: false
    };
  }
}

/**
 * Extend PIN data expiration
 */
export async function extendPinDataExpiration(
  additionalHours: number
): Promise<boolean> {
  try {
    const pinData = await retrievePinData();
    if (!pinData) {
      return false;
    }
    
    const options: PinStorageOptions = {
      expirationHours: additionalHours
    };
    
    return await storePinData(pinData, options);
  } catch (error) {
    console.error('Failed to extend PIN data expiration:', error);
    return false;
  }
}

/**
 * Record PIN attempt
 */
export async function recordPinAttempt(
  success: boolean,
  ipAddress?: string,
  userAgent?: string
): Promise<boolean> {
  try {
    const pinData = await retrievePinData();
    if (!pinData) {
      return false;
    }
    
    const attempt: PinAttempt = {
      timestamp: Date.now(),
      success,
      ipAddress,
      userAgent
    };
    
    const updatedAttempts = [...pinData.attempts, attempt];
    
    // Keep only last 10 attempts to prevent storage bloat
    const recentAttempts = updatedAttempts.slice(-10);
    
    return await updatePinData({
      attempts: recentAttempts,
      lastUsedAt: Date.now()
    });
  } catch (error) {
    console.error('Failed to record PIN attempt:', error);
    return false;
  }
}

/**
 * Get PIN lockout information
 */
export async function getPinLockoutInfo(): Promise<PinLockoutInfo> {
  try {
    const pinData = await retrievePinData();
    if (!pinData) {
      return {
        isLocked: false,
        attemptsRemaining: 3
      };
    }
    
    const now = Date.now();
    const recentAttempts = pinData.attempts.filter(
      attempt => now - attempt.timestamp < 15 * 60 * 1000 // Last 15 minutes
    );
    
    const failedAttempts = recentAttempts.filter(attempt => !attempt.success);
    
    if (failedAttempts.length >= 3) {
      const lastAttempt = failedAttempts[failedAttempts.length - 1];
      const lockoutExpiresAt = lastAttempt.timestamp + (15 * 60 * 1000); // 15 minutes lockout
      
      if (now < lockoutExpiresAt) {
        return {
          isLocked: true,
          attemptsRemaining: 0,
          lockoutExpiresAt,
          lastAttemptAt: lastAttempt.timestamp
        };
      }
    }
    
    const attemptsRemaining = Math.max(0, 3 - failedAttempts.length);
    return {
      isLocked: false,
      attemptsRemaining,
      lastAttemptAt: recentAttempts.length > 0 ? recentAttempts[recentAttempts.length - 1].timestamp : undefined
    };
  } catch (error) {
    console.error('Failed to get PIN lockout info:', error);
    return {
      isLocked: false,
      attemptsRemaining: 3
    };
  }
}

/**
 * Reset PIN attempts (after successful login)
 */
export async function resetPinAttempts(): Promise<boolean> {
  try {
    return await updatePinData({
      attempts: [],
      lastUsedAt: Date.now()
    });
  } catch (error) {
    console.error('Failed to reset PIN attempts:', error);
    return false;
  }
}

/**
 * Encrypt PIN data using device fingerprint
 */
async function encryptPinData(pinData: PinData, deviceFingerprint: string): Promise<string> {
  try {
    const encoder = new TextEncoder();
    const data = encoder.encode(JSON.stringify(pinData));
    
    // Generate a key from device fingerprint
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      encoder.encode(deviceFingerprint),
      'PBKDF2',
      false,
      ['deriveBits', 'deriveKey']
    );
    
    const salt = crypto.getRandomValues(new Uint8Array(32));
    const key = await crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: salt,
        iterations: 100000,
        hash: 'SHA-256'
      },
      keyMaterial,
      { name: 'AES-GCM', length: 256 },
      true,
      ['encrypt', 'decrypt']
    );
    
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const encryptedBuffer = await crypto.subtle.encrypt(
      {
        name: 'AES-GCM',
        iv: iv
      },
      key,
      data
    );
    
    // Combine salt, iv, and encrypted data
    const combined = new Uint8Array(salt.length + iv.length + encryptedBuffer.byteLength);
    combined.set(salt, 0);
    combined.set(iv, salt.length);
    combined.set(new Uint8Array(encryptedBuffer), salt.length + iv.length);
    
    return Array.from(combined, byte => byte.toString(16).padStart(2, '0')).join('');
  } catch (error) {
    console.error('PIN data encryption failed:', error);
    throw new Error('Failed to encrypt PIN data');
  }
}

/**
 * Decrypt PIN data using device fingerprint
 */
async function decryptPinData(encryptedData: EncryptedData, deviceFingerprint: string): Promise<PinData> {
  try {
    const encoder = new TextEncoder();
    
    // Parse the combined data
    const combined = new Uint8Array(
      encryptedData.encrypted.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16))
    );
    
    const salt = combined.slice(0, 32);
    const iv = combined.slice(32, 44);
    const encrypted = combined.slice(44);
    
    // Generate the same key
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      encoder.encode(deviceFingerprint),
      'PBKDF2',
      false,
      ['deriveBits', 'deriveKey']
    );
    
    const key = await crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: salt,
        iterations: 100000,
        hash: 'SHA-256'
      },
      keyMaterial,
      { name: 'AES-GCM', length: 256 },
      true,
      ['encrypt', 'decrypt']
    );
    
    const decryptedBuffer = await crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv: iv
      },
      key,
      encrypted
    );
    
    const decoder = new TextDecoder();
    const decryptedString = decoder.decode(decryptedBuffer);
    
    return JSON.parse(decryptedString) as PinData;
  } catch (error) {
    console.error('PIN data decryption failed:', error);
    throw new Error('Failed to decrypt PIN data');
  }
}

/**
 * Validate PIN data format
 */
export function validatePinData(pinData: PinData): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  
  if (!pinData.pinHash || pinData.pinHash.length === 0) {
    errors.push('PIN hash is required');
  }
  
  if (!pinData.donorId || pinData.donorId.length === 0) {
    errors.push('Donor ID is required');
  }
  
  if (pinData.createdAt <= 0) {
    errors.push('Invalid creation timestamp');
  }
  
  if (pinData.lastUsedAt <= 0) {
    errors.push('Invalid last used timestamp');
  }
  
  if (!Array.isArray(pinData.attempts)) {
    errors.push('Attempts must be an array');
  }
  
  if (typeof pinData.isActive !== 'boolean') {
    errors.push('isActive must be a boolean');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}
