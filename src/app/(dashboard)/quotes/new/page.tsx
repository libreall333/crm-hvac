import { prisma } from '@/lib/prisma'
import { QuoteForm } from '@/components/quotes/quote-form'

export default async function NewQuotePage() {
  const clients = await prisma.client.findMany({
    select: { id: true, companyName: true },
    orderBy: { companyName: 'asc' },
  })

  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto">
      <div className="mb-6">
        <div className="text-mono text-[10px] tracking-widest uppercase text-muted-foreground mb-1">Nueva cotización</div>
        <h1 className="text-2xl font-semibold tracking-tight">Crear cotización</h1>
        <p className="text-sm text-muted-foreground mt-1">Completa los datos comerciales y técnicos.</p>
      </div>
      <QuoteForm clients={clients} />
    </div>
  )
}
