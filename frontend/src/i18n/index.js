/**
 * i18n configuration — site-wide translation
 *
 * Supports 5 languages: RO (default), EN, FR, DE, ES
 * Replaces the Google Translate widget with real, SEO-friendly translations.
 */
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import ro from './locales/ro.json';
import en from './locales/en.json';
import fr from './locales/fr.json';
import de from './locales/de.json';
import es from './locales/es.json';

export const SUPPORTED_LANGUAGES = [
  { code: 'ro', label: 'Română', flag: '🇷🇴', native: 'Română' },
  { code: 'en', label: 'English', flag: '🇬🇧', native: 'English' },
  { code: 'fr', label: 'Français', flag: '🇫🇷', native: 'Français' },
  { code: 'de', label: 'Deutsch', flag: '🇩🇪', native: 'Deutsch' },
  { code: 'es', label: 'Español', flag: '🇪🇸', native: 'Español' },
];

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      ro: { translation: ro },
      en: { translation: en },
      fr: { translation: fr },
      de: { translation: de },
      es: { translation: es },
    },
    fallbackLng: 'ro',
    supportedLngs: ['ro', 'en', 'fr', 'de', 'es'],
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      lookupLocalStorage: 'epd_language',
      caches: ['localStorage'],
    },
    interpolation: { escapeValue: false },
    react: { useSuspense: false },
  });

// Update <html lang="…"> whenever the language changes
i18n.on('languageChanged', (lng) => {
  if (typeof document !== 'undefined') {
    document.documentElement.lang = lng;
  }
});

export default i18n;
