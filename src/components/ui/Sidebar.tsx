'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface NavItem {
  label: string
  href: string
  icon?: React.ReactNode
}

interface SidebarProps {
  items: NavItem[]
  footer?: React.ReactNode
}

export default function Sidebar({ items, footer }: SidebarProps) {
  const pathname = usePathname()

  return (
    <aside className="flex h-full w-60 flex-col bg-surface border-r border-white/[0.08]">
      <div className="flex h-14 items-center px-5 border-b border-white/[0.08]">
        <span className="text-lg font-semibold text-text-primary tracking-tight">
          Pro<span className="text-accent">ply</span>
        </span>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
        {items.map((item) => {
          let active = false

          if (item.href === '/analytics') {
            // Analytics highlights for any route with /analytics
            active = pathname.includes('/analytics')
          } else {
            // Other items: exact match or startsWith, but not if analytics route
            active = (pathname === item.href || pathname.startsWith(item.href + '/')) && !pathname.includes('/analytics')
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`
                flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors
                ${active
                  ? 'bg-accent/10 text-accent'
                  : 'text-text-secondary hover:bg-white/5 hover:text-text-primary'
                }
              `}
            >
              {item.icon && (
                <span className={`h-4 w-4 flex-shrink-0 ${active ? 'text-accent' : 'text-text-muted'}`}>
                  {item.icon}
                </span>
              )}
              {item.label}
            </Link>
          )
        })}
      </nav>

      {footer && (
        <div className="border-t border-white/[0.08] p-4">
          {footer}
        </div>
      )}
    </aside>
  )
}
