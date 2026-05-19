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

  const changeLanguage = useCallback((newLang) => {
    setLanguageState(newLang);
  }, []);

  // 하위 호환: 기존 toggleLanguage 유지
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
    // lang은 프론트엔드와 동일한 인터페이스 (language의 alias)
    return { language, lang: language, changeLanguage, toggleLanguage, t };
  }, [language, changeLanguage, toggleLanguage]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}
