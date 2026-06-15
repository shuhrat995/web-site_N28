import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { uzb } from './uzb';
import { rus } from './rus';
import { eng } from './eng';

export type Language = 'uzb' | 'rus' | 'eng';

const translations = {
  uzb,
  rus,
  eng,
};

interface TranslationContextType {
  t: typeof uzb;
  language: Language;
  setLanguage: (lang: Language) => void;
}

const TranslationContext = createContext<TranslationContextType>({
  t: uzb,
  language: 'uzb',
  setLanguage: () => {},
});

export function TranslationProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem('language');
    return (saved as Language) || 'uzb';
  });

  useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);

  return (
    <TranslationContext.Provider value={{ t: translations[language], language, setLanguage }}>
      {children}
    </TranslationContext.Provider>
  );
}

export function useTranslation() {
  return useContext(TranslationContext);
}
