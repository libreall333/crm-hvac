'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, FileText, Users, Briefcase, KanbanSquare, Calendar, Settings, Wind, UserCog } from 'lucide-react'
import { cn } from '@/lib/utils'

const NAV_GROUPS: { label: string; items: { href: string; label: string; icon: any }[] }[] = [
  {
    label: 'Operación',
    items: [
      { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { href: '/quotes', label: 'Cotizaciones', icon: FileText },
      { href: '/pipeline', label: 'Pipeline', icon: KanbanSquare },
      { href: '/clients', label: 'Clientes', icon: Users },
      { href: '/projects', label: 'Proyectos', icon: Briefcase },
    ],
  },
  {
    label: 'Productividad',
    items: [
      { href: '/calendar', label: 'Agenda', icon: Calendar },
    ],
  },
  {
    label: 'Sistema',
    items: [
      { href: '/users', label: 'Usuarios', icon: UserCog },
      { href: '/settings', label: 'Configuración', icon: Settings },
    ],
  },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-60 shrink-0 border-r border-border flex flex-col bg-card/30">
      {/* Logo */}
      <div className="h-14 px-4 flex items-center gap-2.5 border-b border-border">
        <div className="h-8 w-8 rounded-md bg-primary/10 border border-primary/30 flex items-center justify-center">
          <Wind className="h-4 w-4 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-semibold tracking-tight truncate">Ductos &amp; Clima</div>
          <div className="text-[10px] text-muted-foreground tracking-widest uppercase text-mono">CRM v1.0</div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-6">
        {NAV_GROUPS.map((group) => (
          <div key={group.label}>
            <div className="px-3 mb-2 text-[10px] tracking-widest uppercase text-muted-foreground font-medium">
              {group.label}
            </div>
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const active = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))
                const Icon = item.icon
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'flex items-center gap-2.5 px-3 py-1.5 rounded-md text-sm transition-colors',
                      active
                        ? 'bg-accent text-foreground font-medium'
                        : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
                    )}
                  >
                    <Icon className={cn('h-4 w-4', active && 'text-primary')} />
                    {item.label}
                  </Link>
                )
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-border">
        <div className="text-[10px] text-muted-foreground text-mono">
          <div className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" />
            Conectado
          </div>
        </div>
      </div>
    </aside>
  )
}
