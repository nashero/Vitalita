/**
 * Secure Storage Wrapper for Donor Credentials
 * 
 * This module provides a secure interface for storing and retrieving
 * encrypted donor credentials with device authentication.
 */

import { 
  DonorCredentials, 
  EncryptedData, 
  encryptCredentials, 
  decryptCredentials,
  generateDeviceHash,
  verifyDeviceAuthentication
} from './encryption';
import { generateDeviceFingerprint } from './deviceUtils';

export interface StoredCredentials {
  encryptedData: EncryptedData;
  deviceHash: string;
  storedAt: string;
  expiresAt: string;
}

export interface StorageOptions {
  expirationHours?: number;
  secureOnly?: boolean;
}

const DEFAULT_EXPIRATION_HOURS = 24 * 7; // 7 days
const STORAGE_KEY = 'vitalita_donor_credentials';
const DEVICE_HASH_KEY = 'vitalita_device_hash';

/**
 * Store donor credentials securely with encryption
 */
export async function storeCredentials(
  credentials: DonorCredentials,
  options: StorageOptions = {}
): Promise<boolean> {
  try {
    const deviceFingerprint = generateDeviceFingerprint().deviceId;
    const deviceHash = await generateDeviceHash(deviceFingerprint);
    
    // Encrypt the credentials
    const encryptedData = await encryptCredentials(credentials, deviceFingerprint);
    
    // Set expiration
    const now = new Date();
    const expiresAt = new Date(now.getTime() + (options.expirationHours || DEFAULT_EXPIRATION_HOURS) * 60 * 60 * 1000);
    
    const storedData: StoredCredentials = {
      encryptedData,
      deviceHash,
      storedAt: now.toISOString(),
      expiresAt: expiresAt.toISOString()
    };
    
    // Store in localStorage
    localStorage.setItem(STORAGE_KEY, JSON.stringify(storedData));
    
    // Store device hash separately for authentication
    localStorage.setItem(DEVICE_HASH_KEY, deviceHash);
    
    console.log('Credentials stored securely');
    return true;
  } catch (error) {
    console.error('Failed to store credentials:', error);
    return false;
  }
}

/**
 * Retrieve and decrypt stored credentials
 */
export async function retrieveCredentials(): Promise<DonorCredentials | null> {
  try {
    // Check if credentials exist
    const storedDataString = localStorage.getItem(STORAGE_KEY);
    if (!storedDataString) {
      return null;
    }
    
    const storedData: StoredCredentials = JSON.parse(storedDataString);
    
    // Check expiration
    if (new Date(storedData.expiresAt) <= new Date()) {
      console.log('Stored credentials have expired');
      clearCredentials();
      return null;
    }
    
    // Verify device authentication
    const currentDeviceFingerprint = generateDeviceFingerprint().deviceId;
    const isAuthenticated = await verifyDeviceAuthentication(
      storedData.deviceHash,
      currentDeviceFingerprint
    );
    
    if (!isAuthenticated) {
      console.log('Device authentication failed');
      clearCredentials();
      return null;
    }
    
    // Decrypt credentials
    const credentials = await decryptCredentials(
      storedData.encryptedData,
      currentDeviceFingerprint
    );
    
    console.log('Credentials retrieved successfully');
    return credentials;
  } catch (error) {
    console.error('Failed to retrieve credentials:', error);
    clearCredentials();
    return null;
  }
}

/**
 * Check if credentials are stored and valid
 */
export async function hasValidCredentials(): Promise<boolean> {
  try {
    const credentials = await retrieveCredentials();
    return credentials !== null;
  } catch (error) {
    console.error('Error checking credentials validity:', error);
    return false;
  }
}

/**
 * Clear stored credentials
 */
export function clearCredentials(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(DEVICE_HASH_KEY);
    console.log('Credentials cleared from storage');
  } catch (error) {
    console.error('Failed to clear credentials:', error);
  }
}

/**
 * Get storage information
 */
export function getStorageInfo(): {
  hasCredentials: boolean;
  storedAt?: string;
  expiresAt?: string;
  isExpired: boolean;
} {
  try {
    const storedDataString = localStorage.getItem(STORAGE_KEY);
    if (!storedDataString) {
      return {
        hasCredentials: false,
        isExpired: false
      };
    }
    
    const storedData: StoredCredentials = JSON.parse(storedDataString);
    const now = new Date();
    const expiresAt = new Date(storedData.expiresAt);
    
    return {
      hasCredentials: true,
      storedAt: storedData.storedAt,
      expiresAt: storedData.expiresAt,
      isExpired: expiresAt <= now
    };
  } catch (error) {
    console.error('Failed to get storage info:', error);
    return {
      hasCredentials: false,
      isExpired: false
    };
  }
}

/**
 * Update stored credentials
 */
export async function updateCredentials(
  credentials: DonorCredentials,
  options: StorageOptions = {}
): Promise<boolean> {
  try {
    // Clear existing credentials first
    clearCredentials();
    
    // Store new credentials
    return await storeCredentials(credentials, options);
  } catch (error) {
    console.error('Failed to update credentials:', error);
    return false;
  }
}

/**
 * Extend credentials expiration
 */
export async function extendCredentialsExpiration(
  additionalHours: number
): Promise<boolean> {
  try {
    const credentials = await retrieveCredentials();
    if (!credentials) {
      return false;
    }
    
    // Store with extended expiration
    const options: StorageOptions = {
      expirationHours: additionalHours
    };
    
    return await updateCredentials(credentials, options);
  } catch (error) {
    console.error('Failed to extend credentials expiration:', error);
    return false;
  }
}

/**
 * Validate credentials format
 */
export function validateCredentials(credentials: DonorCredentials): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  
  // Validate first name
  if (!credentials.firstName || credentials.firstName.trim().length < 2) {
    errors.push('First name must be at least 2 characters long');
  }
  
  if (credentials.firstName && credentials.firstName.length > 50) {
    errors.push('First name must be 50 characters or less');
  }
  
  // Validate last name
  if (!credentials.lastName || credentials.lastName.trim().length < 2) {
    errors.push('Last name must be at least 2 characters long');
  }
  
  if (credentials.lastName && credentials.lastName.length > 50) {
    errors.push('Last name must be 50 characters or less');
  }
  
  // Validate AVIS center
  if (!credentials.avisCenter || credentials.avisCenter.trim().length === 0) {
    errors.push('AVIS center is required');
  }
  
  // Validate donor ID
  if (!credentials.donorId || credentials.donorId.trim().length === 0) {
    errors.push('Donor ID is required');
  }
  
  // Check for valid characters (letters, numbers, spaces, hyphens)
  const nameRegex = /^[a-zA-Z\s\-']+$/;
  if (credentials.firstName && !nameRegex.test(credentials.firstName.trim())) {
    errors.push('First name contains invalid characters');
  }
  
  if (credentials.lastName && !nameRegex.test(credentials.lastName.trim())) {
    errors.push('Last name contains invalid characters');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}
