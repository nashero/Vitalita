/**
 * PIN Authentication Utilities
 * 
 * This module provides comprehensive utilities for 5-digit PIN authentication
 * including validation, hashing, security measures, and rate limiting.
 */

import CryptoJS from 'crypto-js';

export interface PinValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export interface PinSecurityConfig {
  maxAttempts: number;
  lockoutDurationMinutes: number;
  pinExpiryDays: number;
  requireSpecialChars: boolean;
  allowSequential: boolean;
  allowRepeated: boolean;
}

export interface PinAttempt {
  timestamp: number;
  success: boolean;
  ipAddress?: string;
  userAgent?: string;
}

export interface PinLockoutInfo {
  isLocked: boolean;
  attemptsRemaining: number;
  lockoutExpiresAt?: number;
  lastAttemptAt?: number;
}

// Default security configuration
export const DEFAULT_PIN_CONFIG: PinSecurityConfig = {
  maxAttempts: 3,
  lockoutDurationMinutes: 15,
  pinExpiryDays: 90,
  requireSpecialChars: false,
  allowSequential: false,
  allowRepeated: false
};

// PIN validation patterns
export const PIN_PATTERNS = {
  // 5 digits only
  DIGITS_ONLY: /^\d{5}$/,
  // Sequential patterns (12345, 54321, etc.)
  SEQUENTIAL: /^(?:01234|12345|23456|34567|45678|56789|98765|87654|76543|65432|54321|43210)$/,
  // Repeated digits (11111, 22222, etc.)
  REPEATED: /^(\d)\1{4}$/,
  // Common patterns to avoid
  COMMON_PATTERNS: /^(?:12345|54321|11111|22222|33333|44444|55555|66666|77777|88888|99999|00000)$/
};

/**
 * Validate PIN format and security requirements
 */
export function validatePin(pin: string, config: PinSecurityConfig = DEFAULT_PIN_CONFIG): PinValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check if PIN is provided
  if (!pin || pin.trim().length === 0) {
    errors.push('PIN is required');
    return { isValid: false, errors, warnings };
  }

  const trimmedPin = pin.trim();

  // Check length
  if (trimmedPin.length !== 5) {
    errors.push('PIN must be exactly 5 digits');
    return { isValid: false, errors, warnings };
  }

  // Check if all digits
  if (!PIN_PATTERNS.DIGITS_ONLY.test(trimmedPin)) {
    errors.push('PIN must contain only numbers');
    return { isValid: false, errors, warnings };
  }

  // Check for sequential patterns
  if (!config.allowSequential && PIN_PATTERNS.SEQUENTIAL.test(trimmedPin)) {
    errors.push('PIN cannot be sequential (e.g., 12345, 54321)');
  }

  // Check for repeated digits
  if (!config.allowRepeated && PIN_PATTERNS.REPEATED.test(trimmedPin)) {
    errors.push('PIN cannot have repeated digits (e.g., 11111, 22222)');
  }

  // Check for common patterns
  if (PIN_PATTERNS.COMMON_PATTERNS.test(trimmedPin)) {
    warnings.push('This PIN is commonly used and may be less secure');
  }

  // Additional security checks
  if (isWeakPin(trimmedPin)) {
    warnings.push('Consider using a more complex PIN for better security');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Check if PIN is weak based on common patterns
 */
function isWeakPin(pin: string): boolean {
  // Check for simple patterns
  const patterns = [
    /^(\d)\1{2,}$/, // 3+ repeated digits
    /^(\d)(\d)\1\2\1$/, // Alternating pattern
    /^(\d)(\d)\2\1\2$/, // Another alternating pattern
  ];

  return patterns.some(pattern => pattern.test(pin));
}

/**
 * Hash PIN using PBKDF2 with crypto-js
 */
export async function hashPin(pin: string): Promise<string> {
  try {
    // Generate a random salt
    const salt = CryptoJS.lib.WordArray.random(128/8);
    
    // Hash the PIN using PBKDF2 with 10000 iterations
    const hash = CryptoJS.PBKDF2(pin, salt, {
      keySize: 256/32,
      iterations: 10000
    });
    
    // Combine salt and hash
    const combined = salt.concat(hash);
    
    // Return as base64 string
    return combined.toString(CryptoJS.enc.Base64);
  } catch (error) {
    console.error('PIN hashing failed:', error);
    throw new Error('Failed to hash PIN');
  }
}

/**
 * Verify PIN against hash
 */
export async function verifyPin(pin: string, hash: string): Promise<boolean> {
  try {
    // Decode the base64 hash
    const combined = CryptoJS.enc.Base64.parse(hash);
    
    // Extract salt (first 128 bits = 16 bytes)
    const salt = CryptoJS.lib.WordArray.create(combined.words.slice(0, 4));
    
    // Extract the stored hash (remaining bits)
    const storedHash = CryptoJS.lib.WordArray.create(combined.words.slice(4));
    
    // Hash the provided PIN with the same salt
    const computedHash = CryptoJS.PBKDF2(pin, salt, {
      keySize: 256/32,
      iterations: 10000
    });
    
    // Compare the hashes
    return computedHash.toString() === storedHash.toString();
  } catch (error) {
    console.error('PIN verification failed:', error);
    return false;
  }
}

/**
 * Generate a random 5-digit PIN (for testing purposes)
 */
export function generateRandomPin(): string {
  const min = 10000;
  const max = 99999;
  return Math.floor(Math.random() * (max - min + 1)) + min + '';
}

/**
 * Check if PIN is expired
 */
export function isPinExpired(createdAt: number, expiryDays: number = DEFAULT_PIN_CONFIG.pinExpiryDays): boolean {
  const now = Date.now();
  const expiryTime = createdAt + (expiryDays * 24 * 60 * 60 * 1000);
  return now > expiryTime;
}

/**
 * Calculate PIN strength score (0-100)
 */
export function calculatePinStrength(pin: string): number {
  let score = 0;

  // Base score for valid 5-digit PIN
  if (PIN_PATTERNS.DIGITS_ONLY.test(pin)) {
    score = 20;
  }

  // Bonus for non-sequential
  if (!PIN_PATTERNS.SEQUENTIAL.test(pin)) {
    score += 20;
  }

  // Bonus for non-repeated
  if (!PIN_PATTERNS.REPEATED.test(pin)) {
    score += 20;
  }

  // Bonus for not using common patterns
  if (!PIN_PATTERNS.COMMON_PATTERNS.test(pin)) {
    score += 20;
  }

  // Bonus for digit variety
  const uniqueDigits = new Set(pin).size;
  score += uniqueDigits * 5;

  // Bonus for no obvious patterns
  if (!isWeakPin(pin)) {
    score += 20;
  }

  return Math.min(score, 100);
}

/**
 * Get PIN strength description
 */
export function getPinStrengthDescription(score: number): string {
  if (score >= 80) return 'Very Strong';
  if (score >= 60) return 'Strong';
  if (score >= 40) return 'Medium';
  if (score >= 20) return 'Weak';
  return 'Very Weak';
}

/**
 * Rate limiting for PIN attempts
 */
export class PinRateLimiter {
  private attempts: PinAttempt[] = [];
  private config: PinSecurityConfig;

  constructor(config: PinSecurityConfig = DEFAULT_PIN_CONFIG) {
    this.config = config;
  }

  /**
   * Record a PIN attempt
   */
  recordAttempt(success: boolean, ipAddress?: string, userAgent?: string): void {
    const attempt: PinAttempt = {
      timestamp: Date.now(),
      success,
      ipAddress,
      userAgent
    };

    this.attempts.push(attempt);
    this.cleanupOldAttempts();
  }

  /**
   * Check if user is currently locked out
   */
  getLockoutInfo(): PinLockoutInfo {
    const now = Date.now();
    const recentAttempts = this.getRecentAttempts();
    const failedAttempts = recentAttempts.filter(attempt => !attempt.success);

    if (failedAttempts.length >= this.config.maxAttempts) {
      const lastAttempt = failedAttempts[failedAttempts.length - 1];
      const lockoutExpiresAt = lastAttempt.timestamp + (this.config.lockoutDurationMinutes * 60 * 1000);

      if (now < lockoutExpiresAt) {
        return {
          isLocked: true,
          attemptsRemaining: 0,
          lockoutExpiresAt,
          lastAttemptAt: lastAttempt.timestamp
        };
      }
    }

    const attemptsRemaining = Math.max(0, this.config.maxAttempts - failedAttempts.length);
    return {
      isLocked: false,
      attemptsRemaining,
      lastAttemptAt: recentAttempts.length > 0 ? recentAttempts[recentAttempts.length - 1].timestamp : undefined
    };
  }

  /**
   * Reset attempts (after successful login)
   */
  resetAttempts(): void {
    this.attempts = [];
  }

  /**
   * Get recent attempts within lockout window
   */
  private getRecentAttempts(): PinAttempt[] {
    const now = Date.now();
    const windowStart = now - (this.config.lockoutDurationMinutes * 60 * 1000);
    
    return this.attempts.filter(attempt => attempt.timestamp >= windowStart);
  }

  /**
   * Clean up old attempts to prevent memory leaks
   */
  private cleanupOldAttempts(): void {
    const now = Date.now();
    const cutoff = now - (this.config.lockoutDurationMinutes * 2 * 60 * 1000); // Keep 2x lockout duration
    
    this.attempts = this.attempts.filter(attempt => attempt.timestamp >= cutoff);
  }
}

/**
 * Format PIN for display (masked)
 */
export function maskPin(pin: string, visibleChars: number = 1): string {
  if (!pin || pin.length === 0) return '';
  
  const visible = pin.slice(0, visibleChars);
  const masked = '•'.repeat(pin.length - visibleChars);
  
  return visible + masked;
}

/**
 * Check if two PINs match
 */
export function pinsMatch(pin1: string, pin2: string): boolean {
  return pin1 === pin2;
}

/**
 * Sanitize PIN input
 */
export function sanitizePinInput(input: string): string {
  // Remove all non-digit characters
  return input.replace(/\D/g, '');
}

/**
 * Format PIN input as user types
 */
export function formatPinInput(input: string): string {
  const sanitized = sanitizePinInput(input);
  return sanitized.slice(0, 5); // Limit to 5 digits
}

/**
 * Generate PIN hint (for password reset verification)
 */
export function generatePinHint(pin: string): string {
  if (!pin || pin.length !== 5) return '';
  
  // Show first and last digit
  return `${pin[0]}***${pin[4]}`;
}

/**
 * Validate PIN hint format
 */
export function isValidPinHint(hint: string): boolean {
  return /^\d\*\*\*\d$/.test(hint);
}

/**
 * Check if browser supports required APIs
 */
export function checkPinSystemCompatibility(): {
  isCompatible: boolean;
  issues: string[];
} {
  const issues: string[] = [];

  // Check for required APIs
  if (typeof crypto === 'undefined' || !crypto.getRandomValues) {
    issues.push('Web Crypto API is not supported');
  }

  if (typeof localStorage === 'undefined') {
    issues.push('Local Storage is not available');
  }

  if (typeof sessionStorage === 'undefined') {
    issues.push('Session Storage is not available');
  }

  // Check for HTTPS in production
  if (typeof window !== 'undefined' && 
      window.location.protocol !== 'https:' && 
      window.location.hostname !== 'localhost' &&
      window.location.hostname !== '127.0.0.1') {
    issues.push('HTTPS is required for secure PIN storage');
  }

  return {
    isCompatible: issues.length === 0,
    issues
  };
}
