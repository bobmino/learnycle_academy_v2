import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import frTranslation from './fr/translation.json';
import enTranslation from './en/translation.json';
import arTranslation from './ar/translation.json';

const resources = {
  fr: frTranslation,
  en: enTranslation,
  ar: arTranslation
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'fr', // Default language
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
