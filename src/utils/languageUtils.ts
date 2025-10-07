/**
 * Language utility functions for proper locale detection and formatting
 */

export type SupportedLanguage = 'en' | 'it' | 'hi' | 'es';

export const LANGUAGE_LOCALES: Record<SupportedLanguage, string> = {
  en: 'en-US',
  it: 'it-IT', 
  hi: 'hi-IN',
  es: 'es-ES'
};

export const LANGUAGE_NAMES: Record<SupportedLanguage, string> = {
  en: 'English',
  it: 'Italiano',
  hi: 'हिन्दी',
  es: 'Español'
};

/**
 * Get the current language from i18n and return the appropriate locale
 */
export function getCurrentLocale(currentLanguage: string): string {
  // Map i18n language codes to locale strings
  const languageMap: Record<string, string> = {
    'en': 'en-US',
    'it': 'it-IT',
    'hi': 'hi-IN', 
    'es': 'es-ES'
  };
  
  return languageMap[currentLanguage] || 'en-US';
}

/**
 * Get locale for date/time formatting based on current language
 */
export function getDateLocale(currentLanguage: string): string {
  return getCurrentLocale(currentLanguage);
}

/**
 * Format date with proper locale
 */
export function formatDate(date: Date, currentLanguage: string, options?: Intl.DateTimeFormatOptions): string {
  const locale = getDateLocale(currentLanguage);
  return date.toLocaleDateString(locale, options);
}

/**
 * Format time with proper locale
 */
export function formatTime(date: Date, currentLanguage: string, options?: Intl.DateTimeFormatOptions): string {
  const locale = getDateLocale(currentLanguage);
  return date.toLocaleTimeString(locale, options);
}

/**
 * Format date and time with proper locale
 */
export function formatDateTime(date: Date, currentLanguage: string, options?: Intl.DateTimeFormatOptions): string {
  const locale = getDateLocale(currentLanguage);
  return date.toLocaleString(locale, options);
}

/**
 * Get month names in the current language
 */
export function getMonthNames(currentLanguage: string): string[] {
  const locale = getDateLocale(currentLanguage);
  const date = new Date(2024, 0, 1); // January 1, 2024
  const months: string[] = [];
  
  for (let i = 0; i < 12; i++) {
    date.setMonth(i);
    months.push(date.toLocaleDateString(locale, { month: 'long' }));
  }
  
  return months;
}

/**
 * Get day names in the current language
 */
export function getDayNames(currentLanguage: string): string[] {
  const locale = getDateLocale(currentLanguage);
  const date = new Date(2024, 0, 7); // January 7, 2024 (Sunday)
  const days: string[] = [];
  
  for (let i = 0; i < 7; i++) {
    date.setDate(7 + i);
    days.push(date.toLocaleDateString(locale, { weekday: 'short' }));
  }
  
  return days;
}
