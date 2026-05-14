import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { formatCLP, formatDate, initials } from '@/lib/utils'
import { QUOTE_STATUS_LABELS, QUOTE_STATUS_VARIANT } from '@/lib/status'
import { ChevronRight } from 'lucide-react'
import type { Quote, Client, User, QuoteStatus } from '@prisma/client'

type Row = Quote & {
  client: Pick<Client, 'id' | 'companyName'>
  owner: Pick<User, 'id' | 'name'>
}

export function QuotesTable({ quotes }: { quotes: Row[] }) {
  if (quotes.length === 0) {
    return (
      <div className="p-12 text-center">
        <div className="text-sm font-medium">Sin cotizaciones</div>
        <div className="text-xs text-muted-foreground mt-1">Crea una nueva cotización para empezar.</div>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border text-[10px] uppercase tracking-widest text-muted-foreground">
            <th className="text-left font-medium px-4 py-2.5">Código</th>
            <th className="text-left font-medium px-4 py-2.5">Cliente</th>
            <th className="text-left font-medium px-4 py-2.5">Tipo</th>
            <th className="text-left font-medium px-4 py-2.5">Estado</th>
            <th className="text-right font-medium px-4 py-2.5">Total</th>
            <th className="text-left font-medium px-4 py-2.5">Responsable</th>
            <th className="text-left font-medium px-4 py-2.5">Vence</th>
            <th className="w-8"></th>
          </tr>
        </thead>
        <tbody>
          {quotes.map((q) => (
            <tr key={q.id} className="border-b border-border/50 hover:bg-accent/30 transition-colors group">
              <td className="px-4 py-3">
                <Link href={`/quotes/${q.id}`} className="text-mono text-xs font-medium hover:text-primary">
                  {q.code}
                </Link>
              </td>
              <td className="px-4 py-3">
                <Link href={`/quotes/${q.id}`} className="hover:text-primary">
                  <div className="font-medium text-sm">{q.client.companyName}</div>
                </Link>
              </td>
              <td className="px-4 py-3 text-xs text-muted-foreground">{q.workType || '—'}</td>
              <td className="px-4 py-3">
                <Badge variant={QUOTE_STATUS_VARIANT[q.status as QuoteStatus]}>
                  {QUOTE_STATUS_LABELS[q.status as QuoteStatus]}
                </Badge>
              </td>
              <td className="px-4 py-3 text-right text-mono text-sm font-medium">{formatCLP(q.total)}</td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                  <Avatar className="h-5 w-5">
                    <AvatarFallback className="text-[9px] bg-primary/10 text-primary">{initials(q.owner.name)}</AvatarFallback>
                  </Avatar>
                  <span className="text-xs">{q.owner.name}</span>
                </div>
              </td>
              <td className="px-4 py-3 text-xs text-muted-foreground text-mono">{formatDate(q.expirationDate)}</td>
              <td className="px-2">
                <Link href={`/quotes/${q.id}`} className="text-muted-foreground group-hover:text-foreground transition-colors">
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
