import { createContext } from 'react';

export const LanguageContext = createContext({
  language: 'ko',
  toggleLanguage: () => {},
  t: (key) => key,
});
