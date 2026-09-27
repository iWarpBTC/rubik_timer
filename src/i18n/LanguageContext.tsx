import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { loadLang, saveLang } from '../lib/storage';
import { detectLang, type Lang, type Localized } from './lang';
import { MESSAGES, type Messages } from './messages';

interface LanguageState {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: Messages;
  /** Picks the current language from localized data. */
  l: (text: Localized) => string;
}

const LanguageContext = createContext<LanguageState | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>(() => loadLang() ?? detectLang(navigator.languages ?? [navigator.language]));

  useEffect(() => {
    saveLang(lang);
    document.documentElement.lang = lang;
  }, [lang]);

  const value = useMemo<LanguageState>(
    () => ({ lang, setLang, t: MESSAGES[lang], l: (text) => text[lang] }),
    [lang],
  );
  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage(): LanguageState {
  const state = useContext(LanguageContext);
  if (state === null) throw new Error('useLanguage must be used inside LanguageProvider');
  return state;
}
