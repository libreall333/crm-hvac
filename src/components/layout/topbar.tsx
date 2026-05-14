'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Search, LogOut, Plus, Bell } from 'lucide-react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator } from '@/components/ui/dropdown-menu'
import { CommandPalette } from '@/components/layout/command-palette'
import { ROLE_LABELS } from '@/lib/status'
import { initials } from '@/lib/utils'
import type { SessionPayload } from '@/lib/auth'
import { useState } from 'react'

export function Topbar({ session }: { session: SessionPayload }) {
  const router = useRouter()
  const [paletteOpen, setPaletteOpen] = useState(false)

  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
    router.refresh()
  }

  return (
    <header className="h-14 border-b border-border flex items-center gap-3 px-6 bg-card/20 backdrop-blur-sm">
      {/* Búsqueda global */}
      <button
        onClick={() => setPaletteOpen(true)}
        className="flex items-center gap-2 px-3 h-8 rounded-md border border-border bg-background/50 text-sm text-muted-foreground hover:text-foreground hover:border-ring transition-colors min-w-[280px]"
      >
        <Search className="h-3.5 w-3.5" />
        <span>Buscar cotizaciones, clientes...</span>
        <kbd className="ml-auto text-mono text-[10px] bg-muted px-1.5 py-0.5 rounded border border-border">⌘K</kbd>
      </button>

      <div className="flex-1" />

      {/* Acciones rápidas */}
      <Button asChild size="sm" className="hidden md:flex">
        <Link href="/quotes/new">
          <Plus className="h-3.5 w-3.5" />
          Nueva cotización
        </Link>
      </Button>

      <Button variant="ghost" size="icon" className="relative">
        <Bell className="h-4 w-4" />
        <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-primary" />
      </Button>

      {/* Menú de usuario */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="flex items-center gap-2 hover:bg-accent rounded-md px-2 py-1 transition-colors">
            <Avatar className="h-7 w-7">
              <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                {initials(session.name)}
              </AvatarFallback>
            </Avatar>
            <div className="text-left hidden md:block">
              <div className="text-xs font-medium leading-tight">{session.name}</div>
              <div className="text-[10px] text-muted-foreground leading-tight">{ROLE_LABELS[session.role]}</div>
            </div>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>
            <div className="font-medium text-foreground">{session.name}</div>
            <div className="text-xs text-muted-foreground font-normal">{session.email}</div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link href="/settings">Configuración</Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={logout} className="text-destructive focus:text-destructive">
            <LogOut className="h-3.5 w-3.5" />
            Cerrar sesión
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <CommandPalette open={paletteOpen} onOpenChange={setPaletteOpen} />
    </header>
  )
}
