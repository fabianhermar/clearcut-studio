import 'server-only';

const dictionaries = {
  en: () => import('@/dictionaries/en.json').then((module) => module.default),
  es: () => import('@/dictionaries/es.json').then((module) => module.default),
};

export type Locale = keyof typeof dictionaries;
export const defaultLocale: Locale = 'en';
export const locales: Locale[] = ['en', 'es'];

export const getDictionary = async (locale: Locale) => {
  if (!dictionaries[locale]) {
    return dictionaries[defaultLocale]();
  }
  return dictionaries[locale]();
};
