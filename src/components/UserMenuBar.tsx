'use client'

import { useUser } from '@clerk/nextjs'
import { useLanguage } from '@/context/LanguageContext'
import { Globe } from 'lucide-react'

export default function UserMenuBar() {
  const { user } = useUser()
  const { language, setLanguage } = useLanguage()

  const displayName = user?.firstName || user?.emailAddresses[0]?.emailAddress || 'User'
  const initials = (user?.firstName || 'U')[0] + (user?.lastName || '')[0]

  return (
    <div className="flex items-center gap-4">
      {/* Language Selector */}
      <div className="flex items-center gap-2 rounded-lg border border-white/[0.08] px-2 py-1">
        <Globe className="h-4 w-4 text-text-muted" />
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value as 'es' | 'en')}
          className="bg-transparent text-xs font-medium text-text-secondary cursor-pointer outline-none"
        >
          <option value="es">Español</option>
          <option value="en">English</option>
        </select>
      </div>

      {/* User Info */}
      <div className="flex items-center gap-3">
        <div className="text-right hidden sm:block">
          <p className="text-xs font-semibold text-text-primary">{displayName}</p>
          <p className="text-xs text-text-muted">{user?.emailAddresses[0]?.emailAddress}</p>
        </div>
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent/20 text-accent font-semibold text-xs">
          {initials}
        </div>
      </div>
    </div>
  )
}
