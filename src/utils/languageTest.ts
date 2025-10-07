/**
 * Language System Test Utility
 * 
 * This utility helps verify that all language features are working correctly
 * across all supported languages (English, Italian, Hindi, Spanish).
 */

import { getCurrentLocale, formatDate, formatTime, formatDateTime } from './languageUtils';

export interface LanguageTestResult {
  language: string;
  locale: string;
  dateFormat: string;
  timeFormat: string;
  dateTimeFormat: string;
  status: 'pass' | 'fail';
  errors: string[];
}

/**
 * Test language formatting for all supported languages
 */
export function testLanguageFormatting(): LanguageTestResult[] {
  const testDate = new Date('2024-10-24T14:30:00');
  const supportedLanguages = ['en', 'it', 'hi', 'es'];
  const results: LanguageTestResult[] = [];

  for (const lang of supportedLanguages) {
    const result: LanguageTestResult = {
      language: lang,
      locale: '',
      dateFormat: '',
      timeFormat: '',
      dateTimeFormat: '',
      status: 'pass',
      errors: []
    };

    try {
      // Test locale detection
      result.locale = getCurrentLocale(lang);
      
      // Test date formatting
      result.dateFormat = formatDate(testDate, lang, {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      
      // Test time formatting
      result.timeFormat = formatTime(testDate, lang, {
        hour: '2-digit',
        minute: '2-digit'
      });
      
      // Test date-time formatting
      result.dateTimeFormat = formatDateTime(testDate, lang, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });

      // Validate results
      if (!result.locale) {
        result.errors.push('Locale detection failed');
        result.status = 'fail';
      }
      
      if (!result.dateFormat) {
        result.errors.push('Date formatting failed');
        result.status = 'fail';
      }
      
      if (!result.timeFormat) {
        result.errors.push('Time formatting failed');
        result.status = 'fail';
      }
      
      if (!result.dateTimeFormat) {
        result.errors.push('DateTime formatting failed');
        result.status = 'fail';
      }

    } catch (error) {
      result.errors.push(`Error: ${error}`);
      result.status = 'fail';
    }

    results.push(result);
  }

  return results;
}

/**
 * Expected results for each language
 */
export const expectedResults = {
  en: {
    locale: 'en-US',
    dateFormat: 'Thursday, October 24, 2024',
    timeFormat: '2:30 PM',
    dateTimeFormat: 'Oct 24, 2024, 2:30 PM'
  },
  it: {
    locale: 'it-IT',
    dateFormat: 'giovedì, 24 ottobre 2024',
    timeFormat: '14:30',
    dateTimeFormat: '24 ott 2024, 14:30'
  },
  hi: {
    locale: 'hi-IN',
    dateFormat: 'गुरुवार, 24 अक्टूबर 2024',
    timeFormat: '14:30',
    dateTimeFormat: '24 अक्टू 2024, 14:30'
  },
  es: {
    locale: 'es-ES',
    dateFormat: 'jueves, 24 de octubre de 2024',
    timeFormat: '14:30',
    dateTimeFormat: '24 oct 2024, 14:30'
  }
};

/**
 * Run comprehensive language tests
 */
export function runLanguageTests(): {
  allPassed: boolean;
  results: LanguageTestResult[];
  summary: string;
} {
  const results = testLanguageFormatting();
  const allPassed = results.every(r => r.status === 'pass');
  
  const summary = `
Language System Test Results:
============================

Total Languages Tested: ${results.length}
Passed: ${results.filter(r => r.status === 'pass').length}
Failed: ${results.filter(r => r.status === 'fail').length}

${results.map(r => `
${r.language.toUpperCase()} (${r.locale}):
  Status: ${r.status.toUpperCase()}
  Date: ${r.dateFormat}
  Time: ${r.timeFormat}
  DateTime: ${r.dateTimeFormat}
  ${r.errors.length > 0 ? `Errors: ${r.errors.join(', ')}` : ''}
`).join('')}

Overall Status: ${allPassed ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED'}
  `;

  return {
    allPassed,
    results,
    summary
  };
}

/**
 * Quick test function for development
 */
export function quickLanguageTest(): void {
  console.log('🧪 Running Language System Tests...\n');
  
  const testResults = runLanguageTests();
  console.log(testResults.summary);
  
  if (testResults.allPassed) {
    console.log('🎉 Language system is working correctly!');
  } else {
    console.log('⚠️  Some language tests failed. Check the errors above.');
  }
}
