'use client'

import { useLanguage } from '@/hooks/useLanguage'
import { getTranslation } from '@/lib/i18n'
import { FileText, BarChart3, Settings, LogOut, Home, Globe } from 'lucide-react'
import { SignOutButton, useUser } from '@clerk/nextjs'
import Sidebar from '@/components/ui/Sidebar'
import Topbar from '@/components/ui/Topbar'

interface NavItem {
  label: string
  href: string
  icon: React.ReactNode
}

function UserMenuBarContent() {
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

export default function LanguageAndNavigation({
  children,
}: {
  children: React.ReactNode
}) {
  const { language, mounted } = useLanguage()
  const t = getTranslation(language)

  if (!mounted) return <>{children}</>

  const navItems: NavItem[] = [
    {
      label: t.nav.dashboard,
      href: '/dashboard',
      icon: <Home className="h-4 w-4" />,
    },
    {
      label: t.nav.proposals,
      href: '/proposals',
      icon: <FileText className="h-4 w-4" />,
    },
    {
      label: t.nav.analytics,
      href: '/analytics',
      icon: <BarChart3 className="h-4 w-4" />,
    },
    {
      label: t.nav.settings,
      href: '/settings',
      icon: <Settings className="h-4 w-4" />,
    },
  ]

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <Sidebar
        items={navItems}
        footer={
          <SignOutButton>
            <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-text-secondary hover:bg-white/5 hover:text-text-primary transition-colors">
              <LogOut className="h-4 w-4" />
              {t.nav.signOut}
            </button>
          </SignOutButton>
        }
      />

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Topbar */}
        <Topbar
          left={
            <div className="text-sm font-medium text-text-primary">Pro<span className="text-accent">ply</span></div>
          }
          right={<UserMenuBarContent />}
        />

        {/* Page Content */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
