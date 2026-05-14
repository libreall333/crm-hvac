'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Command } from 'cmdk'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { FileText, Users, Briefcase, LayoutDashboard, KanbanSquare, Plus, Calendar } from 'lucide-react'

interface SearchResult {
  type: 'quote' | 'client' | 'project'
  id: string
  title: string
  subtitle?: string
}

export function CommandPalette({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        onOpenChange(!open)
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onOpenChange])

  useEffect(() => {
    if (!query) {
      setResults([])
      return
    }
    const t = setTimeout(async () => {
      const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`)
      if (res.ok) {
        const data = await res.json()
        setResults(data.results || [])
      }
    }, 200)
    return () => clearTimeout(t)
  }, [query])

  function go(href: string) {
    router.push(href)
    onOpenChange(false)
    setQuery('')
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-0 max-w-xl gap-0 overflow-hidden">
        <Command shouldFilter={false} className="bg-card">
          <Command.Input
            value={query}
            onValueChange={setQuery}
            placeholder="Buscar cotizaciones, clientes, proyectos..."
            className="w-full px-4 py-3 bg-transparent border-0 outline-none text-sm placeholder:text-muted-foreground border-b border-border"
          />
          <Command.List className="max-h-[400px] overflow-y-auto p-2">
            <Command.Empty className="py-8 text-center text-sm text-muted-foreground">
              {query ? 'Sin resultados' : 'Escribe para buscar...'}
            </Command.Empty>

            {!query && (
              <Command.Group heading="Acciones rápidas" className="text-[10px] tracking-widest uppercase text-muted-foreground px-2 py-1.5 font-medium">
                <Command.Item onSelect={() => go('/quotes/new')} className="flex items-center gap-2 px-2 py-1.5 rounded text-sm cursor-pointer aria-selected:bg-accent">
                  <Plus className="h-3.5 w-3.5 text-primary" />
                  Nueva cotización
                </Command.Item>
                <Command.Item onSelect={() => go('/clients/new')} className="flex items-center gap-2 px-2 py-1.5 rounded text-sm cursor-pointer aria-selected:bg-accent">
                  <Plus className="h-3.5 w-3.5 text-primary" />
                  Nuevo cliente
                </Command.Item>
                <Command.Item onSelect={() => go('/dashboard')} className="flex items-center gap-2 px-2 py-1.5 rounded text-sm cursor-pointer aria-selected:bg-accent">
                  <LayoutDashboard className="h-3.5 w-3.5" />
                  Ir a Dashboard
                </Command.Item>
                <Command.Item onSelect={() => go('/pipeline')} className="flex items-center gap-2 px-2 py-1.5 rounded text-sm cursor-pointer aria-selected:bg-accent">
                  <KanbanSquare className="h-3.5 w-3.5" />
                  Ir a Pipeline
                </Command.Item>
                <Command.Item onSelect={() => go('/calendar')} className="flex items-center gap-2 px-2 py-1.5 rounded text-sm cursor-pointer aria-selected:bg-accent">
                  <Calendar className="h-3.5 w-3.5" />
                  Ir a Agenda
                </Command.Item>
              </Command.Group>
            )}

            {results.length > 0 && (
              <Command.Group heading="Resultados" className="text-[10px] tracking-widest uppercase text-muted-foreground px-2 py-1.5 font-medium">
                {results.map((r) => {
                  const Icon = r.type === 'quote' ? FileText : r.type === 'client' ? Users : Briefcase
                  const href = r.type === 'quote' ? `/quotes/${r.id}` : r.type === 'client' ? `/clients/${r.id}` : `/projects/${r.id}`
                  return (
                    <Command.Item key={`${r.type}-${r.id}`} onSelect={() => go(href)} className="flex items-center gap-2 px-2 py-2 rounded text-sm cursor-pointer aria-selected:bg-accent">
                      <Icon className="h-3.5 w-3.5 text-muted-foreground" />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate">{r.title}</div>
                        {r.subtitle && <div className="text-xs text-muted-foreground truncate">{r.subtitle}</div>}
                      </div>
                    </Command.Item>
                  )
                })}
              </Command.Group>
            )}
          </Command.List>
        </Command>
      </DialogContent>
    </Dialog>
  )
}
