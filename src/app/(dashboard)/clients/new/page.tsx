import { ClientForm } from '@/components/clients/client-form'

export default function NewClientPage() {
  return (
    <div className="p-6 lg:p-8 max-w-3xl mx-auto">
      <div className="mb-6">
        <div className="text-mono text-[10px] tracking-widest uppercase text-muted-foreground mb-1">Nuevo cliente</div>
        <h1 className="text-2xl font-semibold tracking-tight">Crear cliente</h1>
      </div>
      <ClientForm />
    </div>
  )
}
