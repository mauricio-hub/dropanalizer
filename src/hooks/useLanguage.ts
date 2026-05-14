'use client'

import { useState, useEffect, useCallback } from 'react'
import type { Language } from '@/lib/i18n'

const LANGUAGE_CHANGE_EVENT = 'PROPLY_LANGUAGE_CHANGE'

export function useLanguage() {
  const [language, setLanguageState] = useState<Language>('es')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    // Initialize language from localStorage or browser
    const stored = localStorage.getItem('language') as Language | null
    const browserLang = navigator.language.startsWith('es') ? 'es' : 'en'
    const initialLang = stored || browserLang
    setLanguageState(initialLang)
    setMounted(true)

    // Listen for language changes from other components
    const handleLanguageChange = (event: Event) => {
      if (event instanceof CustomEvent) {
        setLanguageState(event.detail as Language)
      }
    }

    window.addEventListener(LANGUAGE_CHANGE_EVENT, handleLanguageChange)
    return () => window.removeEventListener(LANGUAGE_CHANGE_EVENT, handleLanguageChange)
  }, [])

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang)
    localStorage.setItem('language', lang)
    // Dispatch event to all listening components
    window.dispatchEvent(new CustomEvent(LANGUAGE_CHANGE_EVENT, { detail: lang }))
  }, [])

  return { language: mounted ? language : 'es', setLanguage, mounted }
}
