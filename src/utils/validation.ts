/**
 * Validation Utilities for Donor Credentials
 * 
 * This module provides comprehensive validation for donor credential fields
 * including format validation, sanitization, and error handling.
 */

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export interface FieldValidation {
  value: string;
  fieldName: string;
  isRequired: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  customValidator?: (value: string) => string | null;
}

// AVIS Center validation
export const AVIS_CENTERS = [
  'AVIS Casalmaggiore',
  'AVIS Gussola',
  'AVIS Viadana',
  'AVIS Piadena',
  'AVIS Rivarolo del Re',
  'AVIS Scandolara-Ravara',
  'AVIS Calvatone'
] as const;

export type AvisCenter = typeof AVIS_CENTERS[number];

// Validation patterns
export const VALIDATION_PATTERNS = {
  // Names: letters, spaces, hyphens, apostrophes
  NAME: /^[a-zA-ZÀ-ÿ\s\-']+$/,
  
  // Donor ID: alphanumeric with optional hyphens/underscores
  DONOR_ID: /^[a-zA-Z0-9\-_]+$/,
  
  // General text: letters, numbers, spaces, common punctuation
  GENERAL_TEXT: /^[a-zA-Z0-9À-ÿ\s\-_.,!?()]+$/
};

// Validation rules
export const VALIDATION_RULES = {
  FIRST_NAME: {
    minLength: 2,
    maxLength: 50,
    pattern: VALIDATION_PATTERNS.NAME,
    required: true
  },
  LAST_NAME: {
    minLength: 2,
    maxLength: 50,
    pattern: VALIDATION_PATTERNS.NAME,
    required: true
  },
  AVIS_CENTER: {
    required: true,
    customValidator: (value: string) => {
      if (!AVIS_CENTERS.includes(value as AvisCenter)) {
        return `Invalid AVIS center. Must be one of: ${AVIS_CENTERS.join(', ')}`;
      }
      return null;
    }
  },
  DONOR_ID: {
    minLength: 3,
    maxLength: 20,
    pattern: VALIDATION_PATTERNS.DONOR_ID,
    required: true
  }
};

/**
 * Validate a single field
 */
export function validateField(field: FieldValidation): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  const { value, fieldName, isRequired, minLength, maxLength, pattern, customValidator } = field;
  
  // Check if required
  if (isRequired && (!value || value.trim().length === 0)) {
    errors.push(`${fieldName} is required`);
    return { isValid: false, errors, warnings };
  }
  
  // Skip further validation if empty and not required
  if (!value || value.trim().length === 0) {
    return { isValid: true, errors, warnings };
  }
  
  const trimmedValue = value.trim();
  
  // Check minimum length
  if (minLength && trimmedValue.length < minLength) {
    errors.push(`${fieldName} must be at least ${minLength} characters long`);
  }
  
  // Check maximum length
  if (maxLength && trimmedValue.length > maxLength) {
    errors.push(`${fieldName} must be ${maxLength} characters or less`);
  }
  
  // Check pattern
  if (pattern && !pattern.test(trimmedValue)) {
    errors.push(`${fieldName} contains invalid characters`);
  }
  
  // Custom validation
  if (customValidator) {
    const customError = customValidator(trimmedValue);
    if (customError) {
      errors.push(customError);
    }
  }
  
  // Warnings for potential issues
  if (trimmedValue.length > 0 && trimmedValue.length < 3) {
    warnings.push(`${fieldName} is very short - please verify it's correct`);
  }
  
  if (trimmedValue.includes('  ')) {
    warnings.push(`${fieldName} contains multiple consecutive spaces`);
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Validate donor credentials
 */
export function validateDonorCredentials(credentials: {
  firstName: string;
  lastName: string;
  avisCenter: string;
  donorId: string;
}): ValidationResult {
  const allErrors: string[] = [];
  const allWarnings: string[] = [];
  
  // Validate first name
  const firstNameValidation = validateField({
    value: credentials.firstName,
    fieldName: 'First Name',
    ...VALIDATION_RULES.FIRST_NAME
  });
  
  // Validate last name
  const lastNameValidation = validateField({
    value: credentials.lastName,
    fieldName: 'Last Name',
    ...VALIDATION_RULES.LAST_NAME
  });
  
  // Validate AVIS center
  const avisCenterValidation = validateField({
    value: credentials.avisCenter,
    fieldName: 'AVIS Center',
    ...VALIDATION_RULES.AVIS_CENTER
  });
  
  // Validate donor ID
  const donorIdValidation = validateField({
    value: credentials.donorId,
    fieldName: 'Donor ID',
    ...VALIDATION_RULES.DONOR_ID
  });
  
  // Collect all errors and warnings
  allErrors.push(...firstNameValidation.errors);
  allErrors.push(...lastNameValidation.errors);
  allErrors.push(...avisCenterValidation.errors);
  allErrors.push(...donorIdValidation.errors);
  
  allWarnings.push(...firstNameValidation.warnings);
  allWarnings.push(...lastNameValidation.warnings);
  allWarnings.push(...avisCenterValidation.warnings);
  allWarnings.push(...donorIdValidation.warnings);
  
  return {
    isValid: allErrors.length === 0,
    errors: allErrors,
    warnings: allWarnings
  };
}

/**
 * Sanitize input value
 */
export function sanitizeInput(value: string, fieldType: 'name' | 'donorId' | 'general'): string {
  if (!value) return '';
  
  let sanitized = value.trim();
  
  switch (fieldType) {
    case 'name':
      // Remove multiple spaces, normalize apostrophes and hyphens
      sanitized = sanitized
        .replace(/\s+/g, ' ')
        .replace(/[''`]/g, "'")
        .replace(/[-–—]/g, '-');
      break;
      
    case 'donorId':
      // Remove spaces and normalize hyphens/underscores
      sanitized = sanitized
        .replace(/\s+/g, '')
        .replace(/[-–—]/g, '-')
        .replace(/[_＿]/g, '_');
      break;
      
    case 'general':
      // Basic sanitization
      sanitized = sanitized.replace(/\s+/g, ' ');
      break;
  }
  
  return sanitized;
}

/**
 * Format validation error messages for display
 */
export function formatValidationErrors(errors: string[]): string {
  if (errors.length === 0) return '';
  
  if (errors.length === 1) {
    return errors[0];
  }
  
  return errors.map((error, index) => `${index + 1}. ${error}`).join('\n');
}

/**
 * Check if Web Crypto API is supported
 */
export function isWebCryptoSupported(): boolean {
  return typeof crypto !== 'undefined' && 
         typeof crypto.subtle !== 'undefined' && 
         typeof crypto.getRandomValues !== 'undefined';
}

/**
 * Check if localStorage is available
 */
export function isLocalStorageSupported(): boolean {
  try {
    const test = '__localStorage_test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch {
    return false;
  }
}

/**
 * Validate browser compatibility
 */
export function validateBrowserCompatibility(): {
  isCompatible: boolean;
  issues: string[];
} {
  const issues: string[] = [];
  
  if (!isWebCryptoSupported()) {
    issues.push('Web Crypto API is not supported in this browser');
  }
  
  if (!isLocalStorageSupported()) {
    issues.push('Local storage is not available in this browser');
  }
  
  // Check for HTTPS in production
  if (typeof window !== 'undefined' && 
      window.location.protocol !== 'https:' && 
      window.location.hostname !== 'localhost') {
    issues.push('HTTPS is required for secure credential storage');
  }
  
  return {
    isCompatible: issues.length === 0,
    issues
  };
}
