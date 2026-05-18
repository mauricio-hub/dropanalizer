'use client'

import { useLanguage } from '@/hooks/useLanguage'
import { getTranslation } from '@/lib/i18n'
import { BarChart3, Settings, LogOut, Home, Globe, Package, Menu, X } from 'lucide-react'
import { useUser, useClerk } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
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
    <div className="flex items-center gap-6">
      <div className="relative group">
        <button className="flex items-center gap-2 text-xs font-medium text-text-secondary hover:text-text-primary transition-colors">
          <Globe className="h-4 w-4" />
          <span className="hidden sm:inline">{language === 'es' ? 'Español' : 'English'}</span>
        </button>
        <div className="absolute right-0 mt-2 w-32 bg-surface border border-white/[0.08] rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
          <button
            onClick={() => setLanguage('es')}
            className={`w-full text-left px-4 py-2 text-xs font-medium rounded-t-lg transition-colors ${
              language === 'es' ? 'bg-accent/20 text-accent' : 'text-text-secondary hover:text-text-primary hover:bg-white/5'
            }`}
          >
            Español
          </button>
          <button
            onClick={() => setLanguage('en')}
            className={`w-full text-left px-4 py-2 text-xs font-medium rounded-b-lg transition-colors ${
              language === 'en' ? 'bg-accent/20 text-accent' : 'text-text-secondary hover:text-text-primary hover:bg-white/5'
            }`}
          >
            English
          </button>
        </div>
      </div>

      <div className="flex items-center gap-3 pl-6 border-l border-white/[0.08]">
        <div className="text-right hidden sm:block">
          <p className="text-xs font-semibold text-text-primary">{displayName}</p>
          <p className="text-xs text-text-muted">{user?.emailAddresses[0]?.emailAddress}</p>
        </div>
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent/20 text-accent font-semibold text-xs flex-shrink-0">
          {initials}
        </div>
      </div>
    </div>
  )
}

export default function LanguageAndNavigation({ children }: { children: React.ReactNode }) {
  const { language, mounted } = useLanguage()
  const t = getTranslation(language)
  const { signOut } = useClerk()
  const router = useRouter()
  const [collapsed, setCollapsed] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem('sidebar-collapsed')
    if (saved !== null) setCollapsed(saved === 'true')
  }, [])

  function toggleSidebar() {
    setCollapsed(prev => {
      const next = !prev
      localStorage.setItem('sidebar-collapsed', String(next))
      return next
    })
  }

  const handleSignOut = async () => {
    await signOut()
    router.push('/')
  }

  if (!mounted) return <>{children}</>

  const navItems: NavItem[] = [
    { label: t.nav.dashboard, href: '/dashboard', icon: <Home className="h-4 w-4" /> },
    { label: t.nav.catalog, href: '/catalog', icon: <Package className="h-4 w-4" /> },
    { label: t.nav.analytics, href: '/analytics', icon: <BarChart3 className="h-4 w-4" /> },
    { label: t.nav.settings, href: '/settings', icon: <Settings className="h-4 w-4" /> },
  ]

  const hamburger = (
    <button
      onClick={toggleSidebar}
      className="flex items-center justify-center h-8 w-8 rounded-lg text-text-muted hover:text-text-primary hover:bg-white/5 transition-colors"
      title={collapsed ? 'Expandir menú' : 'Colapsar menú'}
    >
      {collapsed ? <Menu className="h-4 w-4" /> : <X className="h-4 w-4" />}
    </button>
  )

  return (
    <div className="flex h-screen bg-background">
      <Sidebar
        items={navItems}
        collapsed={collapsed}
        footer={
          <button
            onClick={handleSignOut}
            title={collapsed ? t.nav.signOut : undefined}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-text-secondary hover:bg-white/5 hover:text-text-primary transition-colors"
          >
            <LogOut className="h-4 w-4 flex-shrink-0" />
            {!collapsed && t.nav.signOut}
          </button>
        }
      />

      <div className="flex flex-1 flex-col overflow-hidden min-w-0">
        <Topbar left={hamburger} right={<UserMenuBarContent />} />
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
