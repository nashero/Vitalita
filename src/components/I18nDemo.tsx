import React from 'react';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from './LanguageSwitcher';
import { formatDate, formatNumber, formatCurrency } from '../utils/languageUtils';

/**
 * I18nDemo Component
 * 
 * A comprehensive demonstration of internationalization features:
 * - Language switching between English and Italian
 * - Localized date formatting
 * - Localized number formatting
 * - Mobile-responsive design
 */
const I18nDemo: React.FC = () => {
  const { t, i18n } = useTranslation();

  // Sample date for demonstration
  const sampleDate = new Date(2025, 11, 31); // December 31, 2025

  // Format date according to locale
  const formattedDate = formatDate(sampleDate, i18n.language, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });

  // Format number according to locale
  const sampleNumber = 123456.78;
  const formattedNumber = formatNumber(sampleNumber, i18n.language, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });

  // Format currency according to locale
  const sampleCurrency = 1234.56;
  const currencyCode = i18n.language === 'it' ? 'EUR' : 'USD';
  const formattedCurrency = formatCurrency(sampleCurrency, i18n.language, currencyCode);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header with Language Switcher */}
      <header className="bg-white shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-20">
            <div className="flex items-center">
              <h1 className="text-xl md:text-2xl font-bold text-red-600">
                {t('demo.title')}
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <LanguageSwitcher variant="compact" />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        {/* Welcome Section */}
        <section className="bg-white rounded-lg shadow-lg p-6 md:p-8 mb-6 md:mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4">
            {t('demo.welcome.title')}
          </h2>
          <p className="text-gray-600 text-base md:text-lg leading-relaxed">
            {t('demo.welcome.description')}
          </p>
        </section>

        {/* Localization Examples */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 mb-6 md:mb-8">
          {/* Date Formatting Example */}
          <section className="bg-white rounded-lg shadow-lg p-6 md:p-8">
            <h3 className="text-xl md:text-2xl font-semibold text-gray-800 mb-4 flex items-center">
              <span className="mr-2">📅</span>
              {t('demo.localization.date.title')}
            </h3>
            <div className="space-y-3">
              <div className="bg-gray-50 rounded-md p-4">
                <p className="text-sm text-gray-600 mb-2">
                  {t('demo.localization.date.sample')}
                </p>
                <p className="text-2xl md:text-3xl font-bold text-red-600">
                  {formattedDate}
                </p>
              </div>
              <p className="text-sm text-gray-500 italic">
                {i18n.language === 'en' 
                  ? 'Format: MM/DD/YYYY (US format)'
                  : 'Formato: DD/MM/YYYY (formato italiano)'}
              </p>
            </div>
          </section>

          {/* Number Formatting Example */}
          <section className="bg-white rounded-lg shadow-lg p-6 md:p-8">
            <h3 className="text-xl md:text-2xl font-semibold text-gray-800 mb-4 flex items-center">
              <span className="mr-2">🔢</span>
              {t('demo.localization.number.title')}
            </h3>
            <div className="space-y-3">
              <div className="bg-gray-50 rounded-md p-4">
                <p className="text-sm text-gray-600 mb-2">
                  {t('demo.localization.number.sample')}
                </p>
                <p className="text-2xl md:text-3xl font-bold text-red-600">
                  {formattedNumber}
                </p>
              </div>
              <p className="text-sm text-gray-500 italic">
                {i18n.language === 'en' 
                  ? 'Format: 123,456.78 (US format)'
                  : 'Formato: 123.456,78 (formato italiano)'}
              </p>
            </div>
          </section>
        </div>

        {/* Currency Formatting Example */}
        <section className="bg-white rounded-lg shadow-lg p-6 md:p-8 mb-6 md:mb-8">
          <h3 className="text-xl md:text-2xl font-semibold text-gray-800 mb-4 flex items-center">
            <span className="mr-2">💰</span>
            {t('demo.localization.currency.title')}
          </h3>
          <div className="space-y-3">
            <div className="bg-gray-50 rounded-md p-4">
              <p className="text-sm text-gray-600 mb-2">
                {t('demo.localization.currency.sample')}
              </p>
              <p className="text-2xl md:text-3xl font-bold text-red-600">
                {formattedCurrency}
              </p>
            </div>
            <p className="text-sm text-gray-500 italic">
              {i18n.language === 'en' 
                ? 'Format: $1,234.56 (USD)'
                : 'Formato: 1.234,56 € (EUR)'}
            </p>
          </div>
        </section>

        {/* Features Section */}
        <section className="bg-white rounded-lg shadow-lg p-6 md:p-8 mb-6 md:mb-8">
          <h3 className="text-xl md:text-2xl font-semibold text-gray-800 mb-6">
            {t('demo.features.title')}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
            <div className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg">
              <span className="text-2xl">🌐</span>
              <div>
                <h4 className="font-semibold text-gray-800 mb-1">
                  {t('demo.features.i18n.title')}
                </h4>
                <p className="text-sm text-gray-600">
                  {t('demo.features.i18n.description')}
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg">
              <span className="text-2xl">📱</span>
              <div>
                <h4 className="font-semibold text-gray-800 mb-1">
                  {t('demo.features.responsive.title')}
                </h4>
                <p className="text-sm text-gray-600">
                  {t('demo.features.responsive.description')}
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg">
              <span className="text-2xl">🗓️</span>
              <div>
                <h4 className="font-semibold text-gray-800 mb-1">
                  {t('demo.features.localization.title')}
                </h4>
                <p className="text-sm text-gray-600">
                  {t('demo.features.localization.description')}
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg">
              <span className="text-2xl">⚡</span>
              <div>
                <h4 className="font-semibold text-gray-800 mb-1">
                  {t('demo.features.performance.title')}
                </h4>
                <p className="text-sm text-gray-600">
                  {t('demo.features.performance.description')}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Instructions Section */}
        <section className="bg-blue-50 border border-blue-200 rounded-lg p-6 md:p-8">
          <h3 className="text-xl md:text-2xl font-semibold text-blue-900 mb-4">
            {t('demo.instructions.title')}
          </h3>
          <ul className="space-y-2 text-blue-800">
            <li className="flex items-start">
              <span className="mr-2">1.</span>
              <span>{t('demo.instructions.step1')}</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">2.</span>
              <span>{t('demo.instructions.step2')}</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">3.</span>
              <span>{t('demo.instructions.step3')}</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">4.</span>
              <span>{t('demo.instructions.step4')}</span>
            </li>
          </ul>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-6 md:py-8 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-sm md:text-base">
            {t('demo.footer.text')}
          </p>
        </div>
      </footer>
    </div>
  );
};

export default I18nDemo;

