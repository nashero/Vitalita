# Internationalization (i18n) Implementation

This document describes the internationalization implementation for the Vitalita blood donation application.

## Supported Languages

- **English** (en) - Default language
- **Italian** (it) - Italiano
- **Hindi** (hi) - हिन्दी
- **Spanish** (es) - Español

## Implementation Details

### 1. i18next Configuration

The internationalization is powered by `i18next` and `react-i18next` libraries. The configuration is located in `src/i18n/index.ts`.

**Key Features:**
- Automatic language detection from browser settings
- Language preference persistence in localStorage
- Fallback to English if translation is missing
- Namespace-based translation organization

### 2. Translation Files

Translation files are located in `src/i18n/locales/`:
- `en.json` - English translations
- `it.json` - Italian translations
- `hi.json` - Hindi translations
- `es.json` - Spanish translations

### 3. Language Switcher Component

The `LanguageSwitcher` component (`src/components/LanguageSwitcher.tsx`) provides three variants:

- **Default**: Full language selector with flags and names
- **Compact**: Smaller version for forms and toolbars
- **Minimal**: Icon-only version for headers

**Features:**
- Flag icons for visual language identification
- Dropdown with all available languages
- Current language highlighting
- Click-outside-to-close functionality
- Responsive design

### 4. Integration Points

**Main App (`src/App.tsx`):**
- i18n initialization
- Login mode selector translations
- Error boundary translations

**Landing Page (`src/components/LandingPage.tsx`):**
- Header navigation translations
- Hero section content
- Feature highlights
- Process steps
- Statistics and analytics
- Footer content
- Language switcher integration

### 5. Translation Keys Structure

```json
{
  "common": {
    "loading": "Loading...",
    "error": "Error",
    // ... common UI elements
  },
  "navigation": {
    "home": "Home",
    "donorPortal": "Donor Portal",
    // ... navigation items
  },
  "landing": {
    "title": "Schedule Your Donation, Save Lives",
    "subtitle": "Book your blood or plasma donation...",
    // ... landing page content
  },
  "stats": {
    "donations": "Donations",
    "centers": "Centers",
    // ... statistics labels
  },
  "features": {
    "easyBooking": {
      "title": "Easy Booking",
      "desc": "Book your donation in just a few clicks..."
    },
    // ... feature descriptions
  },
  "language": {
    "selectLanguage": "Select Language",
    "english": "English",
    "italian": "Italiano",
    "hindi": "हिन्दी",
    "spanish": "Español"
  }
}
```

## Usage

### Adding New Translations

1. Add the translation key to all language files in `src/i18n/locales/`
2. Use the key in your component with `t('key.path')`
3. The translation will automatically update when language changes

### Adding New Languages

1. Create a new JSON file in `src/i18n/locales/` (e.g., `fr.json` for French)
2. Add the language to the `resources` object in `src/i18n/index.ts`
3. Add the language option to the `languages` array in `LanguageSwitcher.tsx`
4. Include the appropriate flag emoji

### Using the Language Switcher

```tsx
import LanguageSwitcher from './components/LanguageSwitcher';

// Default variant
<LanguageSwitcher />

// Compact variant
<LanguageSwitcher variant="compact" />

// Minimal variant
<LanguageSwitcher variant="minimal" />
```

## Browser Support

- Language detection works in all modern browsers
- localStorage is used for language preference persistence
- Graceful fallback to English if localStorage is unavailable

## Performance Considerations

- Translation files are loaded on demand
- Language switching is instant (no page reload required)
- Translations are cached in memory after first load
- Minimal bundle size impact due to tree-shaking

## Future Enhancements

- RTL (Right-to-Left) language support
- Pluralization rules for complex languages
- Date and number formatting per locale
- Dynamic translation loading from API
- Translation management dashboard
