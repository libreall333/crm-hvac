import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { ClientForm } from '@/components/clients/client-form'

export default async function EditClientPage({ params }: { params: { id: string } }) {
  const client = await prisma.client.findUnique({ where: { id: params.id } })
  if (!client) return notFound()

  return (
    <div className="p-6 lg:p-8 max-w-3xl mx-auto">
      <div className="mb-6">
        <div className="text-mono text-[10px] tracking-widest uppercase text-muted-foreground mb-1">Editar cliente</div>
        <h1 className="text-2xl font-semibold tracking-tight">{client.companyName}</h1>
      </div>
      <ClientForm initial={client} />
    </div>
  )
}
