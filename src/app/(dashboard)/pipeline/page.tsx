import { prisma } from '@/lib/prisma'
import { KanbanBoard } from '@/components/quotes/kanban-board'
import { QuoteStatus } from '@prisma/client'

export const dynamic = 'force-dynamic'

export default async function PipelinePage() {
  const quotes = await prisma.quote.findMany({
    where: { status: { not: QuoteStatus.DRAFT } },
    include: {
      client: { select: { id: true, companyName: true } },
      owner: { select: { id: true, name: true } },
    },
    orderBy: { updatedAt: 'desc' },
  })

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-[1800px] mx-auto h-full flex flex-col">
      <div className="flex items-end justify-between gap-4 flex-wrap shrink-0">
        <div>
          <div className="text-mono text-[10px] tracking-widest uppercase text-muted-foreground mb-1">Pipeline</div>
          <h1 className="text-2xl font-semibold tracking-tight">Pipeline comercial</h1>
          <p className="text-sm text-muted-foreground mt-1">Arrastra las tarjetas para cambiar la etapa.</p>
        </div>
      </div>

      <div className="flex-1 min-h-0">
        <KanbanBoard quotes={quotes as any} />
      </div>
    </div>
  )
}
