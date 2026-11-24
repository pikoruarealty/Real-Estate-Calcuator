'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { MESSAGES, type Lang, type MessageKey } from '@/content/i18n';

const STORAGE_KEY = 'pikorua.lang';

interface LangCtx {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: MessageKey, vars?: Record<string, string | number>) => string;
}

const C = createContext<LangCtx | null>(null);

/** Language lives above the calculator state, so switching it never touches the user's inputs. */
export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>('en');

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved === 'en' || saved === 'gu') setLangState(saved);
    } catch {}
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang === 'gu' ? 'gu-IN' : 'en-IN';
  }, [lang]);

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    try { localStorage.setItem(STORAGE_KEY, l); } catch {}
  }, []);

  const value = useMemo<LangCtx>(() => ({
    lang,
    setLang,
    t: (key, vars) => {
      let s = MESSAGES[lang][key] ?? MESSAGES.en[key];
      if (vars) for (const [k, v] of Object.entries(vars)) s = s.replace(`{${k}}`, String(v));
      return s;
    },
  }), [lang, setLang]);

  return <C.Provider value={value}>{children}</C.Provider>;
}

export function useT(): LangCtx {
  const v = useContext(C);
  if (!v) throw new Error('useT must be used inside LanguageProvider');
  return v;
}
