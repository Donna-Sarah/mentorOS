'use client'

import {
  createContext,
  createElement,
  useContext,
  useState,
  type ReactNode,
} from 'react'
import { vi } from './vi'
import { en } from './en'
import type { Translations } from './vi'

type Lang = 'vi' | 'en'

interface LanguageContextValue {
  lang: Lang
  setLang: (lang: Lang) => void
  t: Translations
}

const LanguageContext = createContext<LanguageContextValue | null>(null)

interface LanguageProviderProps {
  children: ReactNode
  defaultLang?: Lang
}

export function LanguageProvider({
  children,
  defaultLang = 'vi',
}: LanguageProviderProps) {
  const [lang, setLang] = useState<Lang>(defaultLang)
  const t = lang === 'vi' ? vi : en

  // No JSX here so this file can remain `.ts` (not `.tsx`).
  return createElement(
    LanguageContext.Provider,
    { value: { lang, setLang, t } },
    children,
  )
}

export function useLanguage(): LanguageContextValue {
  const ctx = useContext(LanguageContext)
  if (!ctx) throw new Error('useLanguage must be used inside LanguageProvider')
  return ctx
}
