// Appointment Error Handling Utility
// Provides specific, helpful error messages for different failure scenarios

export interface AppointmentError {
  code: string;
  message: string;
  userMessage: string;
  suggestion: string;
  severity: 'warning' | 'error' | 'critical';
}

export const APPOINTMENT_ERRORS = {
  // Database connection errors
  CONNECTION_FAILED: {
    code: 'CONNECTION_FAILED',
    message: 'Failed to connect to the database',
    userMessage: 'We\'re having trouble connecting to our servers right now.',
    suggestion: 'Please check your internet connection and try again in a few minutes.',
    severity: 'error' as const
  },

  // Authentication errors
  UNAUTHORIZED: {
    code: 'UNAUTHORIZED',
    message: 'User is not authenticated',
    userMessage: 'Your session has expired. Please log in again.',
    suggestion: 'Click "Back to Dashboard" and sign in again.',
    severity: 'warning' as const
  },

  // Validation errors
  INVALID_DONOR: {
    code: 'INVALID_DONOR',
    message: 'Invalid donor information',
    userMessage: 'We couldn\'t verify your donor account.',
    suggestion: 'Please contact support or try logging in again.',
    severity: 'error' as const
  },

  INVALID_SLOT: {
    code: 'INVALID_SLOT',
    message: 'Selected time slot is no longer available',
    userMessage: 'The time slot you selected is no longer available.',
    suggestion: 'Please choose a different time or date.',
    severity: 'warning' as const
  },

  SLOT_FULL: {
    code: 'SLOT_FULL',
    message: 'Selected time slot is at full capacity',
    userMessage: 'This time slot has reached its maximum capacity.',
    suggestion: 'Please select a different time or check back later for cancellations.',
    severity: 'warning' as const
  },

  // Database constraint errors
  DUPLICATE_APPOINTMENT: {
    code: 'DUPLICATE_APPOINTMENT',
    message: 'Duplicate appointment detected',
    userMessage: 'You already have an appointment scheduled for this time.',
    suggestion: 'Please check your existing appointments or choose a different time.',
    severity: 'warning' as const
  },

  FOREIGN_KEY_VIOLATION: {
    code: 'FOREIGN_KEY_VIOLATION',
    message: 'Referenced donation center or donor does not exist',
    userMessage: 'There was an issue with the donation center information.',
    suggestion: 'Please try again or contact support if the problem persists.',
    severity: 'error' as const
  },

  // Availability errors
  SLOT_UNAVAILABLE: {
    code: 'SLOT_UNAVAILABLE',
    message: 'Time slot is not available',
    userMessage: 'This time slot is no longer available for booking.',
    suggestion: 'Please refresh the page and select from the updated available times.',
    severity: 'warning' as const
  },

  SLOT_FETCH_ERROR: {
    code: 'SLOT_FETCH_ERROR',
    message: 'Failed to fetch current slot information',
    userMessage: 'Unable to verify slot availability.',
    suggestion: 'Please try again or select a different time slot.',
    severity: 'error' as const
  },

  SLOT_NOT_FOUND: {
    code: 'SLOT_NOT_FOUND',
    message: 'Slot no longer exists',
    userMessage: 'The selected time slot no longer exists.',
    suggestion: 'Please refresh and select from available time slots.',
    severity: 'warning' as const
  },

  SLOT_CHANGED: {
    code: 'SLOT_CHANGED',
    message: 'Slot availability has changed since selection',
    userMessage: 'This time slot\'s availability has changed since you selected it.',
    suggestion: 'Please refresh and select from the updated available times.',
    severity: 'warning' as const
  },

  SLOT_TOO_SOON: {
    code: 'SLOT_TOO_SOON',
    message: 'Slot is too close to book',
    userMessage: 'This time slot is too close to book now.',
    suggestion: 'Please select a time slot at least 1 hour in the future.',
    severity: 'warning' as const
  },

  VALIDATION_ERROR: {
    code: 'VALIDATION_ERROR',
    message: 'Error during slot validation',
    userMessage: 'Unable to verify slot availability.',
    suggestion: 'Please try again or contact support if the problem persists.',
    severity: 'error' as const
  },

  PAST_DATE: {
    code: 'PAST_DATE',
    message: 'Attempted to book appointment in the past',
    userMessage: 'You cannot book appointments for past dates.',
    suggestion: 'Please select a current or future date.',
    severity: 'warning' as const
  },

  // System errors
  SLOT_UPDATE_FAILED: {
    code: 'SLOT_UPDATE_FAILED',
    message: 'Failed to update slot availability',
    userMessage: 'Unable to secure your time slot.',
    suggestion: 'Please try again or select a different time slot.',
    severity: 'error' as const
  },

  AUDIT_LOG_FAILED: {
    code: 'AUDIT_LOG_FAILED',
    message: 'Failed to create audit log entry',
    userMessage: 'Your appointment was booked, but we couldn\'t log the activity.',
    suggestion: 'Your appointment is confirmed. Please check your dashboard.',
    severity: 'warning' as const
  },

  // Generic errors
  UNKNOWN_ERROR: {
    code: 'UNKNOWN_ERROR',
    message: 'Unknown error occurred',
    userMessage: 'Something unexpected happened while booking your appointment.',
    suggestion: 'Please try again. If the problem continues, contact our support team.',
    severity: 'error' as const
  },

  // Network errors
  NETWORK_ERROR: {
    code: 'NETWORK_ERROR',
    message: 'Network request failed',
    userMessage: 'We\'re experiencing network issues right now.',
    suggestion: 'Please check your internet connection and try again.',
    severity: 'error' as const
  },

  TIMEOUT_ERROR: {
    code: 'TIMEOUT_ERROR',
    message: 'Request timed out',
    userMessage: 'The request took too long to complete.',
    suggestion: 'Please try again. If the problem persists, try again later.',
    severity: 'error' as const
  },

  // Vitalita-specific errors
  DONOR_ELIGIBILITY: {
    code: 'DONOR_ELIGIBILITY',
    message: 'Donor eligibility check failed',
    userMessage: 'We couldn\'t verify your eligibility to donate at this time.',
    suggestion: 'Please contact our medical team to review your eligibility status.',
    severity: 'warning' as const
  },

  CENTER_MAINTENANCE: {
    code: 'CENTER_MAINTENANCE',
    message: 'Donation center is under maintenance',
    userMessage: 'This donation center is temporarily unavailable for bookings.',
    suggestion: 'Please select a different center or try again later.',
    severity: 'warning' as const
  },

  APPOINTMENT_LIMIT: {
    code: 'APPOINTMENT_LIMIT',
    message: 'Donor has reached appointment limit',
    userMessage: 'You have reached the maximum number of appointments allowed.',
    suggestion: 'Please complete your existing appointment before booking a new one.',
    severity: 'warning' as const
  },

  TIME_RESTRICTION: {
    code: 'TIME_RESTRICTION',
    message: 'Appointment time restriction violated',
    userMessage: 'This time slot is not available for your donation type.',
    suggestion: 'Please select a different time or contact us for scheduling assistance.',
    severity: 'warning' as const
  },

  DONATION_FREQUENCY: {
    code: 'DONATION_FREQUENCY',
    message: 'Donation frequency restriction violated',
    userMessage: 'You need to wait before booking your next donation.',
    suggestion: 'Please check your last donation date and try again later.',
    severity: 'warning' as const
  }
};

export const getAppointmentError = (error: any): AppointmentError => {
  // If it's already a formatted error, return it
  if (error && typeof error === 'object' && error.code && APPOINTMENT_ERRORS[error.code as keyof typeof APPOINTMENT_ERRORS]) {
    return error as AppointmentError;
  }

  // Handle Supabase errors
  if (error && error.code) {
    switch (error.code) {
      case 'PGRST116': // No rows returned
        return APPOINTMENT_ERRORS.INVALID_SLOT;
      
      case '23505': // Unique violation
        return APPOINTMENT_ERRORS.DUPLICATE_APPOINTMENT;
      
      case '23503': // Foreign key violation
        return APPOINTMENT_ERRORS.FOREIGN_KEY_VIOLATION;
      
      case '23514': // Check violation
        return APPOINTMENT_ERRORS.INVALID_SLOT;
      
      case '42P01': // Undefined table
        return APPOINTMENT_ERRORS.UNKNOWN_ERROR;
      
      case '42501': // Insufficient privilege
        return APPOINTMENT_ERRORS.UNAUTHORIZED;
      
      default:
        break;
    }
  }

  // Handle HTTP status codes
  if (error && error.status) {
    switch (error.status) {
      case 401:
        return APPOINTMENT_ERRORS.UNAUTHORIZED;
      case 403:
        return APPOINTMENT_ERRORS.UNAUTHORIZED;
      case 404:
        return APPOINTMENT_ERRORS.INVALID_SLOT;
      case 409:
        return APPOINTMENT_ERRORS.DUPLICATE_APPOINTMENT;
      case 422:
        return APPOINTMENT_ERRORS.INVALID_SLOT;
      case 500:
        return APPOINTMENT_ERRORS.UNKNOWN_ERROR;
      case 502:
      case 503:
      case 504:
        return APPOINTMENT_ERRORS.CONNECTION_FAILED;
      default:
        break;
    }
  }

  // Handle network errors
  if (error && error.message) {
    const message = error.message.toLowerCase();
    
    if (message.includes('network') || message.includes('fetch')) {
      return APPOINTMENT_ERRORS.NETWORK_ERROR;
    }
    
    if (message.includes('timeout')) {
      return APPOINTMENT_ERRORS.TIMEOUT_ERROR;
    }
    
    if (message.includes('unauthorized') || message.includes('auth')) {
      return APPOINTMENT_ERRORS.UNAUTHORIZED;
    }
    
    if (message.includes('duplicate') || message.includes('already exists')) {
      return APPOINTMENT_ERRORS.DUPLICATE_APPOINTMENT;
    }
    
    if (message.includes('foreign key') || message.includes('constraint')) {
      return APPOINTMENT_ERRORS.FOREIGN_KEY_VIOLATION;
    }
    
    if (message.includes('slot') && (message.includes('full') || message.includes('capacity'))) {
      return APPOINTMENT_ERRORS.SLOT_FULL;
    }
    
    if (message.includes('slot') && message.includes('unavailable')) {
      return APPOINTMENT_ERRORS.SLOT_UNAVAILABLE;
    }
    
    if (message.includes('past') || message.includes('invalid date')) {
      return APPOINTMENT_ERRORS.PAST_DATE;
    }

    // Vitalita-specific error patterns
    if (message.includes('eligibility') || message.includes('eligible')) {
      return APPOINTMENT_ERRORS.DONOR_ELIGIBILITY;
    }

    if (message.includes('maintenance') || message.includes('unavailable')) {
      return APPOINTMENT_ERRORS.CENTER_MAINTENANCE;
    }

    if (message.includes('limit') || message.includes('maximum')) {
      return APPOINTMENT_ERRORS.APPOINTMENT_LIMIT;
    }

    if (message.includes('frequency') || message.includes('wait')) {
      return APPOINTMENT_ERRORS.DONATION_FREQUENCY;
    }

    if (message.includes('restriction') || message.includes('not allowed')) {
      return APPOINTMENT_ERRORS.TIME_RESTRICTION;
    }
  }

  // Default to unknown error
  return APPOINTMENT_ERRORS.UNKNOWN_ERROR;
};

export const formatErrorMessage = (error: AppointmentError): string => {
  return `${error.userMessage} ${error.suggestion}`;
};

export const getErrorIcon = (severity: AppointmentError['severity']) => {
  switch (severity) {
    case 'warning':
      return '⚠️';
    case 'error':
      return '❌';
    case 'critical':
      return '🚨';
    default:
      return '❌';
  }
};

export const getErrorColor = (severity: AppointmentError['severity']) => {
  switch (severity) {
    case 'warning':
      return 'bg-yellow-50 border-yellow-200 text-yellow-800';
    case 'error':
      return 'bg-red-50 border-red-200 text-red-800';
    case 'critical':
      return 'bg-red-100 border-red-300 text-red-900';
    default:
      return 'bg-red-50 border-red-200 text-red-800';
  }
};
