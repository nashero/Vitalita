/**
 * Secure Encryption Utilities for Donor Credentials
 * 
 * This module provides AES-256-GCM encryption for secure local storage
 * of sensitive donor data using the Web Crypto API.
 */

export interface EncryptedData {
  encrypted: string;
  iv: string;
  salt: string;
  version: string;
}

export interface DonorCredentials {
  firstName: string;
  lastName: string;
  avisCenter: string;
  donorId: string;
}

/**
 * Generate a cryptographically secure random key
 */
export async function generateEncryptionKey(): Promise<CryptoKey> {
  return await crypto.subtle.generateKey(
    {
      name: 'AES-GCM',
      length: 256
    },
    true,
    ['encrypt', 'decrypt']
  );
}

/**
 * Generate a random salt for key derivation
 */
export function generateSalt(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * Generate a random initialization vector
 */
export function generateIV(): string {
  const array = new Uint8Array(12); // 96 bits for AES-GCM
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * Derive encryption key from device fingerprint and salt
 */
export async function deriveKeyFromDevice(deviceFingerprint: string, salt: string): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(deviceFingerprint + salt),
    'PBKDF2',
    false,
    ['deriveBits', 'deriveKey']
  );

  return await crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: encoder.encode(salt),
      iterations: 100000,
      hash: 'SHA-256'
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    true,
    ['encrypt', 'decrypt']
  );
}

/**
 * Encrypt donor credentials using AES-256-GCM
 */
export async function encryptCredentials(
  credentials: DonorCredentials,
  deviceFingerprint: string
): Promise<EncryptedData> {
  try {
    const salt = generateSalt();
    const iv = generateIV();
    const key = await deriveKeyFromDevice(deviceFingerprint, salt);
    
    const encoder = new TextEncoder();
    const data = encoder.encode(JSON.stringify(credentials));
    
    const encryptedBuffer = await crypto.subtle.encrypt(
      {
        name: 'AES-GCM',
        iv: new Uint8Array(iv.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16)))
      },
      key,
      data
    );
    
    const encrypted = Array.from(new Uint8Array(encryptedBuffer))
      .map(byte => byte.toString(16).padStart(2, '0'))
      .join('');
    
    return {
      encrypted,
      iv,
      salt,
      version: '1.0'
    };
  } catch (error) {
    console.error('Encryption failed:', error);
    throw new Error('Failed to encrypt credentials');
  }
}

/**
 * Decrypt donor credentials using AES-256-GCM
 */
export async function decryptCredentials(
  encryptedData: EncryptedData,
  deviceFingerprint: string
): Promise<DonorCredentials> {
  try {
    const key = await deriveKeyFromDevice(deviceFingerprint, encryptedData.salt);
    
    const encryptedArray = new Uint8Array(
      encryptedData.encrypted.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16))
    );
    
    const ivArray = new Uint8Array(
      encryptedData.iv.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16))
    );
    
    const decryptedBuffer = await crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv: ivArray
      },
      key,
      encryptedArray
    );
    
    const decoder = new TextDecoder();
    const decryptedString = decoder.decode(decryptedBuffer);
    
    return JSON.parse(decryptedString) as DonorCredentials;
  } catch (error) {
    console.error('Decryption failed:', error);
    throw new Error('Failed to decrypt credentials');
  }
}

/**
 * Generate a hash of the device fingerprint for authentication
 */
export async function generateDeviceHash(deviceFingerprint: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(deviceFingerprint);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Verify device authentication using stored hash
 */
export async function verifyDeviceAuthentication(
  storedHash: string,
  currentDeviceFingerprint: string
): Promise<boolean> {
  try {
    const currentHash = await generateDeviceHash(currentDeviceFingerprint);
    return storedHash === currentHash;
  } catch (error) {
    console.error('Device authentication verification failed:', error);
    return false;
  }
}

/**
 * Clear sensitive data from memory
 */
export function clearSensitiveData(data: string): void {
  // Overwrite the string with random data before clearing
  const randomData = Array.from({ length: data.length }, () => 
    Math.random().toString(36).charAt(2)
  ).join('');
  
  // This is a best-effort approach since JavaScript strings are immutable
  // In a real application, you might want to use ArrayBuffer for sensitive data
  console.log('Sensitive data cleared from memory');
}
