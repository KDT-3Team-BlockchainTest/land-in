import { useCallback, useEffect, useMemo, useState } from "react";
import { LanguageContext } from "./language-context";
import { DEFAULT_LANGUAGE, SUPPORTED_LANGUAGES, dictionary } from "../i18n/dictionary";

const STORAGE_KEY = "land-in-language";

function readStoredLanguage() {
  if (typeof window === "undefined") {
    return DEFAULT_LANGUAGE;
  }

  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (SUPPORTED_LANGUAGES.includes(stored)) {
      return stored;
    }
  } catch {
    // ignore
  }

  return DEFAULT_LANGUAGE;
}

function resolveByPath(language, key) {
  const segments = key.split(".");
  let node = dictionary[language];
  for (const segment of segments) {
    if (node == null || typeof node !== "object") {
      return undefined;
    }
    node = node[segment];
  }
  return typeof node === "string" ? node : undefined;
}

function interpolate(template, variables) {
  if (!variables) {
    return template;
  }
  return template.replace(/\{(\w+)\}/g, (_, name) =>
    Object.prototype.hasOwnProperty.call(variables, name) ? String(variables[name]) : `{${name}}`,
  );
}

export function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState(readStoredLanguage);

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        window.localStorage.setItem(STORAGE_KEY, language);
      } catch {
        // ignore
      }
      if (typeof document !== "undefined" && document.documentElement) {
        document.documentElement.lang = language;
      }
    }
  }, [language]);

  const setLanguage = useCallback((nextLanguage) => {
    if (SUPPORTED_LANGUAGES.includes(nextLanguage)) {
      setLanguageState(nextLanguage);
    }
  }, []);

  const toggleLanguage = useCallback(() => {
    setLanguageState((previous) => (previous === "ko" ? "en" : "ko"));
  }, []);

  const value = useMemo(() => {
    const t = (key, variables) => {
      const resolved =
        resolveByPath(language, key) ??
        resolveByPath(DEFAULT_LANGUAGE, key) ??
        key;
      return interpolate(resolved, variables);
    };

    return { language, setLanguage, toggleLanguage, t };
  }, [language, setLanguage, toggleLanguage]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}
