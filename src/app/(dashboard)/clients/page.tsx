import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Plus, Building2, ChevronRight } from 'lucide-react'
import { CLIENT_STATUS_LABELS, CLIENT_STATUS_VARIANT } from '@/lib/status'
import { ClientsSearch } from '@/components/clients/clients-search'

export const dynamic = 'force-dynamic'

export default async function ClientsPage({ searchParams }: { searchParams: { search?: string } }) {
  const where: any = {}
  if (searchParams.search) {
    where.OR = [
      { companyName: { contains: searchParams.search, mode: 'insensitive' } },
      { rut: { contains: searchParams.search, mode: 'insensitive' } },
      { mainContactName: { contains: searchParams.search, mode: 'insensitive' } },
    ]
  }

  const clients = await prisma.client.findMany({
    where,
    include: {
      tags: { include: { tag: true } },
      _count: { select: { quotes: true, projects: true } },
    },
    orderBy: { updatedAt: 'desc' },
  })

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-[1400px] mx-auto">
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <div className="text-mono text-[10px] tracking-widest uppercase text-muted-foreground mb-1">Cartera</div>
          <h1 className="text-2xl font-semibold tracking-tight">Clientes</h1>
          <p className="text-sm text-muted-foreground mt-1">{clients.length} empresas en la cartera.</p>
        </div>
        <Button asChild>
          <Link href="/clients/new"><Plus className="h-3.5 w-3.5" />Nuevo cliente</Link>
        </Button>
      </div>

      <Card className="overflow-hidden">
        <ClientsSearch />
        {clients.length === 0 ? (
          <div className="p-12 text-center text-sm text-muted-foreground">Sin clientes</div>
        ) : (
          <div className="divide-y divide-border">
            {clients.map((c) => (
              <Link key={c.id} href={`/clients/${c.id}`} className="flex items-center gap-4 p-4 hover:bg-accent/30 transition-colors group">
                <div className="h-10 w-10 rounded-md bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                  <Building2 className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm truncate">{c.companyName}</span>
                    <Badge variant={CLIENT_STATUS_VARIANT[c.status]} className="text-[10px]">
                      {CLIENT_STATUS_LABELS[c.status]}
                    </Badge>
                    {c.tags.map((t) => (
                      <Badge key={t.tagId} variant="outline" className="text-[10px]" style={{ borderColor: t.tag.color + '40', color: t.tag.color }}>
                        {t.tag.name}
                      </Badge>
                    ))}
                  </div>
                  <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                    <span className="text-mono">{c.rut}</span>
                    {c.city && <span>· {c.city}</span>}
                    {c.mainContactName && <span>· {c.mainContactName}</span>}
                  </div>
                </div>
                <div className="hidden md:flex items-center gap-4 text-xs text-muted-foreground shrink-0">
                  <div className="text-center">
                    <div className="text-mono text-sm font-semibold text-foreground">{c._count.quotes}</div>
                    <div className="text-[10px]">cotizaciones</div>
                  </div>
                  <div className="text-center">
                    <div className="text-mono text-sm font-semibold text-foreground">{c._count.projects}</div>
                    <div className="text-[10px]">proyectos</div>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors shrink-0" />
              </Link>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}
