'use client'

import { useState, useEffect } from 'react'
import type { Language } from '@/lib/i18n'

export function useLanguage() {
  const [language, setLanguageState] = useState<Language>('es')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem('language') as Language | null
    const browserLang = navigator.language.startsWith('es') ? 'es' : 'en'
    setLanguageState(stored || browserLang)
    setMounted(true)
  }, [])

  const setLanguage = (lang: Language) => {
    setLanguageState(lang)
    localStorage.setItem('language', lang)
    // Force re-render of all components
    window.dispatchEvent(new CustomEvent('languageChange', { detail: lang }))
  }

  return { language: mounted ? language : 'es', setLanguage, mounted }
}
