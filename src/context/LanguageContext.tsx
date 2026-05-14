'use client'

import { createContext, useContext, useState, useEffect } from 'react'
import type { Language } from '@/lib/i18n'

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>('es')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    // Get language from localStorage or browser
    const stored = localStorage.getItem('language') as Language | null
    const browserLang = navigator.language.startsWith('es') ? 'es' : 'en'
    setLanguageState(stored || browserLang)
    setMounted(true)
  }, [])

  const setLanguage = (lang: Language) => {
    setLanguageState(lang)
    localStorage.setItem('language', lang)
  }

  if (!mounted) {
    return <>{children}</>
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider')
  }
  return context
}
