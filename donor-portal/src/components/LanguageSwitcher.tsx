import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Globe, Check, ChevronDown } from 'lucide-react';

const languages = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'it', name: 'Italiano', flag: '🇮🇹' },
];

interface LanguageSwitcherProps {
  className?: string;
  variant?: 'default' | 'compact' | 'minimal';
}

const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({ 
  className = '', 
  variant = 'default' 
}) => {
  const { i18n, t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [dropdownPosition, setDropdownPosition] = useState<'left' | 'right'>('right');

  const currentLanguage = languages.find(lang => lang.code === i18n.language) || languages[0];

  // Close dropdown when clicking outside and calculate position
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const calculatePosition = () => {
      if (dropdownRef.current && isOpen) {
        // Use setTimeout to ensure dropdown is rendered before calculating
        setTimeout(() => {
          if (!dropdownRef.current) return;
          
          const rect = dropdownRef.current.getBoundingClientRect();
          const dropdownWidth = variant === 'default' ? 224 : 192; // w-56 = 14rem = 224px, w-48 = 12rem = 192px
          const spaceOnRight = window.innerWidth - rect.right;
          const spaceOnLeft = rect.left;
          
          // If not enough space on right and more space on left, position left
          if (spaceOnRight < dropdownWidth && spaceOnLeft > spaceOnRight) {
            setDropdownPosition('left');
          } else {
            setDropdownPosition('right');
          }
        }, 0);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      calculatePosition();
      window.addEventListener('resize', calculatePosition);
      // Recalculate on scroll too
      window.addEventListener('scroll', calculatePosition, true);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('resize', calculatePosition);
      window.removeEventListener('scroll', calculatePosition, true);
    };
  }, [isOpen, variant]);

  const handleLanguageChange = (languageCode: string) => {
    i18n.changeLanguage(languageCode);
    setIsOpen(false);
  };

  if (variant === 'minimal') {
    return (
      <div className={`relative ${className}`} ref={dropdownRef}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center space-x-1 text-gray-600 hover:text-red-600 transition-colors focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-opacity-50 rounded-md p-1"
          aria-label={t('language.selectLanguage')}
        >
          <span className="text-lg">{currentLanguage.flag}</span>
          <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>
        
        {isOpen && (
          <div className={`absolute ${dropdownPosition === 'right' ? 'right-0 left-auto' : 'left-0 right-auto'} mt-2 w-48 max-w-[calc(100vw-2rem)] bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-[100]`}>
            {languages.map((language) => (
              <button
                key={language.code}
                onClick={() => handleLanguageChange(language.code)}
                className={`w-full flex items-center justify-between px-4 py-2 text-sm hover:bg-gray-50 transition-colors ${
                  language.code === i18n.language ? 'bg-red-50 text-red-600' : 'text-gray-700'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <span className="text-lg">{language.flag}</span>
                  <span>{language.name}</span>
                </div>
                {language.code === i18n.language && (
                  <Check className="w-4 h-4 text-red-600" />
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <div className={`relative ${className}`} ref={dropdownRef}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-red-300 transition-all focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-opacity-50"
          aria-label={t('language.selectLanguage')}
        >
          <Globe className="w-4 h-4" />
          <span>{currentLanguage.flag}</span>
          <span className="hidden sm:inline">{currentLanguage.name}</span>
          <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>
        
        {isOpen && (
          <div className={`absolute ${dropdownPosition === 'right' ? 'right-0 left-auto' : 'left-0 right-auto'} mt-2 w-48 max-w-[calc(100vw-2rem)] bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-[100]`}>
            {languages.map((language) => (
              <button
                key={language.code}
                onClick={() => handleLanguageChange(language.code)}
                className={`w-full flex items-center justify-between px-4 py-2 text-sm hover:bg-gray-50 transition-colors ${
                  language.code === i18n.language ? 'bg-red-50 text-red-600' : 'text-gray-700'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <span className="text-lg">{language.flag}</span>
                  <span>{language.name}</span>
                </div>
                {language.code === i18n.language && (
                  <Check className="w-4 h-4 text-red-600" />
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Default variant
  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-3 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-red-300 transition-all focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-opacity-50 shadow-sm"
        aria-label={t('language.selectLanguage')}
      >
        <Globe className="w-5 h-5" />
        <div className="flex items-center space-x-2">
          <span className="text-lg">{currentLanguage.flag}</span>
          <span className="font-medium">{currentLanguage.name}</span>
        </div>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      
      {isOpen && (
        <div className={`absolute ${dropdownPosition === 'right' ? 'right-0 left-auto' : 'left-0 right-auto'} mt-2 w-56 max-w-[calc(100vw-2rem)] bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-[100]`}>
          <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">
            {t('language.selectLanguage')}
          </div>
          {languages.map((language) => (
            <button
              key={language.code}
              onClick={() => handleLanguageChange(language.code)}
              className={`w-full flex items-center justify-between px-4 py-3 text-sm hover:bg-gray-50 transition-colors ${
                language.code === i18n.language ? 'bg-red-50 text-red-600' : 'text-gray-700'
              }`}
            >
              <div className="flex items-center space-x-3">
                <span className="text-lg">{language.flag}</span>
                <span className="font-medium">{language.name}</span>
              </div>
              {language.code === i18n.language && (
                <Check className="w-4 h-4 text-red-600" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default LanguageSwitcher;

