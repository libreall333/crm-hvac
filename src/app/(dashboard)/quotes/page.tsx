import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Plus } from 'lucide-react'
import { QuotesTable } from '@/components/quotes/quotes-table'
import { QuotesFilterBar } from '@/components/quotes/quotes-filter-bar'

export const dynamic = 'force-dynamic'

export default async function QuotesPage({ searchParams }: { searchParams: { status?: string; search?: string } }) {
  const where: any = {}
  if (searchParams.status) where.status = searchParams.status
  if (searchParams.search) {
    where.OR = [
      { code: { contains: searchParams.search, mode: 'insensitive' } },
      { client: { companyName: { contains: searchParams.search, mode: 'insensitive' } } },
    ]
  }

  const quotes = await prisma.quote.findMany({
    where,
    include: {
      client: { select: { id: true, companyName: true } },
      owner: { select: { id: true, name: true } },
    },
    orderBy: { createdAt: 'desc' },
    take: 100,
  })

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-[1600px] mx-auto">
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <div className="text-mono text-[10px] tracking-widest uppercase text-muted-foreground mb-1">Módulo comercial</div>
          <h1 className="text-2xl font-semibold tracking-tight">Cotizaciones</h1>
          <p className="text-sm text-muted-foreground mt-1">{quotes.length} cotizaciones en total.</p>
        </div>
        <Button asChild>
          <Link href="/quotes/new">
            <Plus className="h-3.5 w-3.5" />
            Nueva cotización
          </Link>
        </Button>
      </div>

      <Card className="overflow-hidden">
        <QuotesFilterBar />
        <QuotesTable quotes={quotes as any} />
      </Card>
    </div>
  )
}
