import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { languageSchema, signLanguages } from '@/lib/sign-language';

const LanguageContext = createContext({ language: String(signLanguages[0]), setLanguage: (_value: string) => {} });
export function SignLanguageProvider({ children }: { children: ReactNode }) {
  const [language, updateLanguage] = useState<string>(signLanguages[0]);
  useEffect(() => {
    const saved = languageSchema.safeParse(localStorage.getItem('signa-language'));
    if (saved.success) updateLanguage(saved.data);
  }, []);
  const setLanguage = (value: string) => {
    const result = languageSchema.safeParse(value);
    if (!result.success) return;
    updateLanguage(result.data);
    localStorage.setItem('signa-language', result.data);
  };
  return <LanguageContext.Provider value={{ language, setLanguage }}>{children}</LanguageContext.Provider>;
}
export const useSignLanguage = () => useContext(LanguageContext);