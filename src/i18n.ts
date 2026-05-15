import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import enCommon from './locales/en/common.json';
import esCommon from './locales/es/common.json';
import caCommon from './locales/ca/common.json';

const resources = {
  en: { common: enCommon },
  es: { common: esCommon },
  ca: { common: caCommon },
};

i18n
  // Detecta l'idioma de l'usuari (del navegador o del localStorage)
  .use(LanguageDetector)
  // Passa la instància d'i18n a react-i18next
  .use(initReactI18next)
  .init({
    resources,
    defaultNS: 'common',
    fallbackLng: 'en', // Idioma per defecte si el detector falla o no tenim l'idioma
    supportedLngs: ['en', 'es', 'ca'],
    interpolation: {
      escapeValue: false, // React ja s'encarrega d'escapar el codi per evitar injeccions
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'], // Desa l'idioma al localStorage perquè es mantingui
    }
  });

export default i18n;
