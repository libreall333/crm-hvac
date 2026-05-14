import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { QuoteForm } from '@/components/quotes/quote-form'

export default async function EditQuotePage({ params }: { params: { id: string } }) {
  const [quote, clients] = await Promise.all([
    prisma.quote.findUnique({ where: { id: params.id } }),
    prisma.client.findMany({ select: { id: true, companyName: true }, orderBy: { companyName: 'asc' } }),
  ])
  if (!quote) return notFound()

  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto">
      <div className="mb-6">
        <div className="text-mono text-[10px] tracking-widest uppercase text-muted-foreground mb-1">Editar cotización</div>
        <h1 className="text-2xl font-semibold tracking-tight">Editar {quote.code}</h1>
      </div>
      <QuoteForm clients={clients} initial={{ ...quote, id: quote.id }} />
    </div>
  )
}
