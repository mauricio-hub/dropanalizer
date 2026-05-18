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
  collapsed?: boolean
}

export default function Sidebar({ items, footer, collapsed = false }: SidebarProps) {
  const pathname = usePathname()

  return (
    <aside className={`flex h-full flex-col bg-surface border-r border-white/[0.08] transition-all duration-200 flex-shrink-0 ${
      collapsed ? 'w-[60px]' : 'w-60'
    }`}>
      <div className="flex h-14 items-center px-4 border-b border-white/[0.08] overflow-hidden">
        {!collapsed && (
          <span className="text-lg font-semibold text-text-primary tracking-tight whitespace-nowrap">
            Pro<span className="text-accent">ply</span>
          </span>
        )}
        {collapsed && (
          <span className="text-lg font-semibold text-accent mx-auto">P</span>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto px-2 py-4 space-y-0.5">
        {items.map((item) => {
          let active = false
          if (item.href === '/analytics') {
            active = pathname.includes('/analytics')
          } else {
            active = (pathname === item.href || pathname.startsWith(item.href + '/')) && !pathname.includes('/analytics')
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              title={collapsed ? item.label : undefined}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                collapsed ? 'justify-center' : ''
              } ${
                active
                  ? 'bg-accent/10 text-accent'
                  : 'text-text-secondary hover:bg-white/5 hover:text-text-primary'
              }`}
            >
              {item.icon && (
                <span className={`h-4 w-4 flex-shrink-0 ${active ? 'text-accent' : 'text-text-muted'}`}>
                  {item.icon}
                </span>
              )}
              {!collapsed && item.label}
            </Link>
          )
        })}
      </nav>

      {footer && !collapsed && (
        <div className="border-t border-white/[0.08] p-4">
          {footer}
        </div>
      )}
      {footer && collapsed && (
        <div className="border-t border-white/[0.08] p-2 flex justify-center">
          {footer}
        </div>
      )}
    </aside>
  )
}
