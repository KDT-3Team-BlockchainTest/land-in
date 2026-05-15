import { createContext } from "react";

export const LanguageContext = createContext({
  language: "ko",
  setLanguage: () => {},
  toggleLanguage: () => {},
  t: (key) => key,
});
