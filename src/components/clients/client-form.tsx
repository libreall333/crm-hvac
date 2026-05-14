'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Loader2, Save } from 'lucide-react'
import { CLIENT_STATUS_LABELS } from '@/lib/status'

export function ClientForm({ initial }: { initial?: any }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState({
    companyName: initial?.companyName || '',
    rut: initial?.rut || '',
    businessActivity: initial?.businessActivity || '',
    address: initial?.address || '',
    city: initial?.city || '',
    region: initial?.region || '',
    mainContactName: initial?.mainContactName || '',
    phone: initial?.phone || '',
    email: initial?.email || '',
    status: initial?.status || 'PROSPECT',
    notes: initial?.notes || '',
  })

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const url = initial ? `/api/clients/${initial.id}` : '/api/clients'
      const method = initial ? 'PATCH' : 'POST'
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
      if (!res.ok) throw new Error((await res.json()).error || 'Error')
      const data = await res.json()
      router.push(`/clients/${data.client.id}`)
      router.refresh()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={onSubmit}>
      <Card>
        <CardContent className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Label>Razón social</Label>
              <Input value={form.companyName} onChange={(e) => setForm({ ...form, companyName: e.target.value })} required className="mt-1.5" />
            </div>
            <div>
              <Label>RUT</Label>
              <Input value={form.rut} onChange={(e) => setForm({ ...form, rut: e.target.value })} required placeholder="76.123.456-7" className="mt-1.5 text-mono" />
            </div>
            <div>
              <Label>Estado</Label>
              <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v as any })}>
                <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(CLIENT_STATUS_LABELS).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="col-span-2">
              <Label>Giro</Label>
              <Input value={form.businessActivity} onChange={(e) => setForm({ ...form, businessActivity: e.target.value })} className="mt-1.5" />
            </div>
            <div className="col-span-2">
              <Label>Dirección</Label>
              <Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className="mt-1.5" />
            </div>
            <div>
              <Label>Ciudad</Label>
              <Input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} className="mt-1.5" />
            </div>
            <div>
              <Label>Región</Label>
              <Input value={form.region} onChange={(e) => setForm({ ...form, region: e.target.value })} className="mt-1.5" />
            </div>
            <div className="col-span-2 pt-2 border-t border-border">
              <Label>Contacto principal</Label>
              <Input value={form.mainContactName} onChange={(e) => setForm({ ...form, mainContactName: e.target.value })} className="mt-1.5" />
            </div>
            <div>
              <Label>Teléfono</Label>
              <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="mt-1.5 text-mono" />
            </div>
            <div>
              <Label>Correo</Label>
              <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="mt-1.5" />
            </div>
            <div className="col-span-2">
              <Label>Observaciones</Label>
              <Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={3} className="mt-1.5" />
            </div>
          </div>

          {error && <div className="text-xs text-destructive bg-destructive/10 rounded p-2">{error}</div>}

          <div className="flex justify-end gap-2 pt-4 border-t border-border">
            <Button type="button" variant="outline" onClick={() => router.back()}>Cancelar</Button>
            <Button type="submit" disabled={loading}>
              {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
              {initial ? 'Guardar cambios' : 'Crear cliente'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  )
}
