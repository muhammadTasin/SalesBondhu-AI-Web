import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';

export type Lang = 'bn' | 'en';

interface LangValue {
  lang: Lang;
  setLang: (l: Lang) => void;
  /** Pick the string for the current language: t('Overview', 'সারসংক্ষেপ'). */
  t: (en: string, bn: string) => string;
}

const KEY = 'sbw.lang';
const LangContext = createContext<LangValue | null>(null);

function initialLang(): Lang {
  try {
    const saved = localStorage.getItem(KEY);
    if (saved === 'bn' || saved === 'en') return saved;
  } catch {
    /* storage can be unavailable (private mode); fall back to Bangla */
  }
  return 'bn';
}

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(initialLang);
  const value = useMemo<LangValue>(
    () => ({
      lang,
      setLang: (l) => {
        setLangState(l);
        try {
          localStorage.setItem(KEY, l);
        } catch {
          /* ignore */
        }
      },
      t: (en, bn) => (lang === 'bn' ? bn : en),
    }),
    [lang],
  );
  return <LangContext.Provider value={value}>{children}</LangContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useLang(): LangValue {
  const v = useContext(LangContext);
  if (!v) throw new Error('useLang must be used inside <LangProvider>');
  return v;
}
