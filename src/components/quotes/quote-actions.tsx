'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from '@/components/ui/dropdown-menu'
import { Edit, MoreHorizontal, Copy, Download, Trash2, Loader2 } from 'lucide-react'

export function QuoteActions({ quote }: { quote: { id: string; code: string } }) {
  const router = useRouter()
  const [busy, setBusy] = useState(false)

  async function duplicate() {
    setBusy(true)
    try {
      const res = await fetch(`/api/quotes/${quote.id}?action=duplicate`, { method: 'POST' })
      if (res.ok) {
        const data = await res.json()
        router.push(`/quotes/${data.quote.id}`)
      }
    } finally {
      setBusy(false)
    }
  }

  async function remove() {
    if (!confirm('¿Eliminar esta cotización? Esta acción no se puede deshacer.')) return
    setBusy(true)
    try {
      const res = await fetch(`/api/quotes/${quote.id}`, { method: 'DELETE' })
      if (res.ok) router.push('/quotes')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="flex items-center gap-2">
      <Button variant="outline" size="sm" asChild>
        <a href={`/api/quotes/${quote.id}/pdf`} target="_blank" rel="noopener noreferrer">
          <Download className="h-3.5 w-3.5" />
          PDF
        </a>
      </Button>
      <Button asChild size="sm">
        <Link href={`/quotes/${quote.id}/edit`}>
          <Edit className="h-3.5 w-3.5" />
          Editar
        </Link>
      </Button>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="icon" disabled={busy}>
            {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <MoreHorizontal className="h-3.5 w-3.5" />}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={duplicate}>
            <Copy className="h-3.5 w-3.5" />
            Duplicar
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={remove} className="text-destructive focus:text-destructive">
            <Trash2 className="h-3.5 w-3.5" />
            Eliminar
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
