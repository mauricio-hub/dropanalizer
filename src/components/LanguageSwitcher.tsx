'use client'

import { Globe } from 'lucide-react'
import { useLanguage } from './LanguageContext'

export function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage()

  return (
    <button
      onClick={() => setLanguage(language === 'es' ? 'en' : 'es')}
      className="flex items-center gap-1 text-sm text-text-secondary hover:text-text-primary transition-colors"
    >
      <Globe className="h-4 w-4" />
      {language === 'es' ? 'EN' : 'ES'}
    </button>
  )
}
