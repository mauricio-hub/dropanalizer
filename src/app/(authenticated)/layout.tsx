'use client'

import { auth } from '@clerk/nextjs'
import { redirect } from 'next/navigation'
import Sidebar from '@/components/ui/Sidebar'
import Topbar from '@/components/ui/Topbar'
import UserMenuBar from '@/components/UserMenuBar'
import { FileText, BarChart3, Settings, LogOut, Home } from 'lucide-react'
import { SignOutButton } from '@clerk/nextjs'
import { useLanguage } from '@/context/LanguageContext'
import { getTranslation } from '@/lib/i18n'

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { userId } = auth()
  if (!userId) redirect('/sign-in')

  const { language } = useLanguage()
  const t = getTranslation(language)

  const navItems = [
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
          right={<UserMenuBar />}
        />

        {/* Page Content */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
