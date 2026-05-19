import { createContext, useCallback, useContext, useState } from "react";
import translations from "./translations";

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(() => localStorage.getItem("land-in-lang") || "ko");

  const changeLanguage = useCallback((newLang) => {
    setLang(newLang);
    localStorage.setItem("land-in-lang", newLang);
  }, []);

  const t = useCallback(
    (key, vars) => {
      const str = translations[lang]?.[key] ?? translations.ko[key] ?? key;
      if (!vars) return str;
      return str.replace(/\{(\w+)\}/g, (_, k) => vars[k] ?? `{${k}}`);
    },
    [lang],
  );

  return (
    <LanguageContext.Provider value={{ lang, changeLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider");
  return ctx;
}