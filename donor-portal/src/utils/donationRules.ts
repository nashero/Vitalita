/**
 * Italian Blood Donation Rules Validation
 * 
 * According to Italian law:
 * 1. There must be a 90-day interval between blood donations
 * 2. Each donor can donate up to 4 donations per year
 */

import { differenceInDays, parseISO, startOfYear } from 'date-fns';

export interface DonationValidationResult {
  isValid: boolean;
  error?: string;
  errorCode?: string;
}

/**
 * Validates if a donor can book an appointment based on Italian donation rules
 * 
 * @param lastDonationDate - The date of the last donation (ISO string or null)
 * @param totalDonationsThisYear - Total number of donations in the current year
 * @param appointmentDate - The date of the appointment being booked
 * @param donationType - Type of donation ('Blood' or 'Plasma')
 * @returns Validation result with error message if validation fails
 */
export function validateDonationRules(
  lastDonationDate: string | null,
  totalDonationsThisYear: number,
  appointmentDate: Date,
  donationType: 'Blood' | 'Plasma' | 'whole_blood' | 'plasma'
): DonationValidationResult {
  // Normalize donation type
  const normalizedType = donationType === 'Blood' || donationType === 'whole_blood' ? 'whole_blood' : 'plasma';

  // For whole blood donations, apply Italian rules
  if (normalizedType === 'whole_blood' || normalizedType === 'Blood') {
    // Rule 1: Check 90-day interval
    if (lastDonationDate) {
      const lastDonation = parseISO(lastDonationDate);
      const daysSinceLastDonation = differenceInDays(appointmentDate, lastDonation);

      if (daysSinceLastDonation < 90) {
        const daysRemaining = 90 - daysSinceLastDonation;
        return {
          isValid: false,
          error: `You must wait 90 days between blood donations. Your last donation was ${daysSinceLastDonation} days ago. Please wait ${daysRemaining} more days before booking.`,
          errorCode: 'INSUFFICIENT_INTERVAL'
        };
      }
    }

    // Rule 2: Check maximum 4 donations per year
    if (totalDonationsThisYear >= 4) {
      const currentYear = new Date().getFullYear();
      const nextYear = new Date(currentYear + 1, 0, 1);
      return {
        isValid: false,
        error: `You have reached the maximum of 4 blood donations per year (${currentYear}). You can book again starting from ${nextYear.getFullYear()}.`,
        errorCode: 'MAX_DONATIONS_REACHED'
      };
    }
  }

  // For plasma donations, apply different rules (14 days interval, max 12 liters/year)
  if (normalizedType === 'plasma' || normalizedType === 'Plasma') {
    if (lastDonationDate) {
      const lastDonation = parseISO(lastDonationDate);
      const daysSinceLastDonation = differenceInDays(appointmentDate, lastDonation);

      if (daysSinceLastDonation < 14) {
        const daysRemaining = 14 - daysSinceLastDonation;
        return {
          isValid: false,
          error: `You must wait 14 days between plasma donations. Your last donation was ${daysSinceLastDonation} days ago. Please wait ${daysRemaining} more days before booking.`,
          errorCode: 'INSUFFICIENT_INTERVAL_PLASMA'
        };
      }
    }
  }

  return { isValid: true };
}

/**
 * Calculates the earliest date a donor can book their next appointment
 * 
 * @param lastDonationDate - The date of the last donation (ISO string or null)
 * @param donationType - Type of donation ('Blood' or 'Plasma')
 * @returns The earliest date the donor can book, or null if no previous donation
 */
export function getEarliestBookingDate(
  lastDonationDate: string | null,
  donationType: 'Blood' | 'Plasma' | 'whole_blood' | 'plasma'
): Date | null {
  if (!lastDonationDate) {
    return null; // First donation, no restrictions
  }

  const normalizedType = donationType === 'Blood' || donationType === 'whole_blood' ? 'whole_blood' : 'plasma';
  const lastDonation = parseISO(lastDonationDate);
  const daysRequired = normalizedType === 'whole_blood' ? 90 : 14;
  
  const earliestDate = new Date(lastDonation);
  earliestDate.setDate(earliestDate.getDate() + daysRequired);
  
  return earliestDate;
}

