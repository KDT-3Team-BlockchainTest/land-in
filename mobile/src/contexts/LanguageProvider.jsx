import React, { useCallback, useMemo, useState } from 'react';
import { DEFAULT_LANGUAGE, dictionary } from '../i18n/dictionary';
import { LanguageContext } from './LanguageContext';

function resolveByPath(language, key) {
  const segments = key.split('.');
  let node = dictionary[language];
  for (const segment of segments) {
    if (node == null || typeof node !== 'object') return undefined;
    node = node[segment];
  }
  return typeof node === 'string' ? node : undefined;
}

function interpolate(template, variables) {
  if (!variables) return template;
  return template.replace(/\{(\w+)\}/g, (_, name) =>
    Object.prototype.hasOwnProperty.call(variables, name) ? String(variables[name]) : `{${name}}`
  );
}

export function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState(DEFAULT_LANGUAGE);

  const toggleLanguage = useCallback(() => {
    setLanguageState((prev) => (prev === 'ko' ? 'en' : 'ko'));
  }, []);

  const value = useMemo(() => {
    const t = (key, variables) => {
      const resolved =
        resolveByPath(language, key) ??
        resolveByPath(DEFAULT_LANGUAGE, key) ??
        key;
      return interpolate(resolved, variables);
    };
    return { language, toggleLanguage, t };
  }, [language, toggleLanguage]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}
