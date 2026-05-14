'use client'

import { useRouter } from 'next/navigation'
import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Loader2, Save } from 'lucide-react'
import { formatCLP } from '@/lib/utils'
import { QUOTE_STATUS_LABELS, PIPELINE_STAGES } from '@/lib/status'
import { calculateQuoteTotals } from '@/lib/quote-calc'

interface Props {
  clients: { id: string; companyName: string }[]
  initial?: any
}

const DUCT_TYPES = ['Galvanizado', 'Acero inoxidable', 'Flexible', 'Fibra mineral', 'PVC']
const WORK_TYPES = ['Instalación nueva', 'Mantención', 'Reparación', 'Ampliación', 'Climatización integral']
const THICKNESS = ['0.5 mm', '0.6 mm', '0.8 mm', '1.0 mm', '1.2 mm']
const INSTALLATION_TYPES = ['Aérea con soportería', 'Empotrada', 'Vista', 'Subterránea']

export function QuoteForm({ clients, initial }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [tab, setTab] = useState('general')

  const [form, setForm] = useState({
    clientId: initial?.clientId || clients[0]?.id || '',
    status: initial?.status || 'DRAFT',
    pipelineStage: initial?.pipelineStage || 'NEW_LEAD',
    expirationDate: initial?.expirationDate ? new Date(initial.expirationDate).toISOString().split('T')[0] : '',
    workType: initial?.workType || 'Instalación nueva',
    ductType: initial?.ductType || 'Galvanizado',
    linearMeters: initial?.linearMeters || 0,
    material: initial?.material || 'Galvanizado',
    thickness: initial?.thickness || '0.6 mm',
    installationType: initial?.installationType || 'Aérea con soportería',
    requiresLabor: initial?.requiresLabor ?? true,
    equipmentNeeded: initial?.equipmentNeeded || '',
    technicalNotes: initial?.technicalNotes || '',
    materialsCost: initial ? Number(initial.materialsCost) : 0,
    laborCost: initial ? Number(initial.laborCost) : 0,
    transportCost: initial ? Number(initial.transportCost) : 0,
    equipmentCost: initial ? Number(initial.equipmentCost) : 0,
    indirectCost: initial ? Number(initial.indirectCost) : 0,
    marginPercent: initial ? Number(initial.marginPercent) : 20,
    taxRate: initial ? Number(initial.taxRate) : 19,
    closingProbability: initial ? Number(initial.closingProbability) : 50,
    competitorInfo: initial?.competitorInfo || '',
    nextFollowUpDate: initial?.nextFollowUpDate ? new Date(initial.nextFollowUpDate).toISOString().split('T')[0] : '',
    commercialNotes: initial?.commercialNotes || '',
  })

  const totals = useMemo(() => calculateQuoteTotals(form), [form])

  function update<K extends keyof typeof form>(key: K, value: any) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const url = initial ? `/api/quotes/${initial.id}` : '/api/quotes'
      const method = initial ? 'PATCH' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Error al guardar')
      }
      const data = await res.json()
      router.push(`/quotes/${data.quote.id}`)
      router.refresh()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={onSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {/* Main */}
      <div className="lg:col-span-2 space-y-4">
        <Card>
          <Tabs value={tab} onValueChange={setTab}>
            <div className="px-6 pt-6">
              <TabsList>
                <TabsTrigger value="general">General</TabsTrigger>
                <TabsTrigger value="technical">Técnica</TabsTrigger>
                <TabsTrigger value="costs">Costos</TabsTrigger>
                <TabsTrigger value="commercial">Seguimiento</TabsTrigger>
              </TabsList>
            </div>

            <CardContent className="pt-4">
              <TabsContent value="general" className="space-y-4 mt-0">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <Label>Cliente</Label>
                    <Select value={form.clientId} onValueChange={(v) => update('clientId', v)}>
                      <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {clients.map((c) => <SelectItem key={c.id} value={c.id}>{c.companyName}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Estado</Label>
                    <Select value={form.status} onValueChange={(v) => update('status', v)}>
                      <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {Object.entries(QUOTE_STATUS_LABELS).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Etapa pipeline</Label>
                    <Select value={form.pipelineStage} onValueChange={(v) => update('pipelineStage', v)}>
                      <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {PIPELINE_STAGES.map((s) => <SelectItem key={s.id} value={s.id}>{s.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="col-span-2">
                    <Label>Fecha de vencimiento</Label>
                    <Input type="date" value={form.expirationDate} onChange={(e) => update('expirationDate', e.target.value)} className="mt-1.5" />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="technical" className="space-y-4 mt-0">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Tipo de trabajo</Label>
                    <Select value={form.workType} onValueChange={(v) => update('workType', v)}>
                      <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                      <SelectContent>{WORK_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Tipo de ductería</Label>
                    <Select value={form.ductType} onValueChange={(v) => update('ductType', v)}>
                      <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                      <SelectContent>{DUCT_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Metros lineales</Label>
                    <Input type="number" value={form.linearMeters} onChange={(e) => update('linearMeters', Number(e.target.value))} className="mt-1.5 text-mono" />
                  </div>
                  <div>
                    <Label>Espesor</Label>
                    <Select value={form.thickness} onValueChange={(v) => update('thickness', v)}>
                      <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                      <SelectContent>{THICKNESS.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div className="col-span-2">
                    <Label>Tipo de instalación</Label>
                    <Select value={form.installationType} onValueChange={(v) => update('installationType', v)}>
                      <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                      <SelectContent>{INSTALLATION_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div className="col-span-2">
                    <Label>Equipos requeridos</Label>
                    <Input value={form.equipmentNeeded} onChange={(e) => update('equipmentNeeded', e.target.value)} className="mt-1.5" placeholder="Andamios, herramientas..." />
                  </div>
                  <div className="col-span-2">
                    <Label>Observaciones técnicas</Label>
                    <Textarea value={form.technicalNotes} onChange={(e) => update('technicalNotes', e.target.value)} className="mt-1.5" rows={3} />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="costs" className="space-y-4 mt-0">
                <div className="grid grid-cols-2 gap-4">
                  {[
                    ['materialsCost', 'Materiales'],
                    ['laborCost', 'Mano de obra'],
                    ['transportCost', 'Transporte'],
                    ['equipmentCost', 'Equipos'],
                    ['indirectCost', 'Costos indirectos'],
                  ].map(([key, label]) => (
                    <div key={key}>
                      <Label>{label}</Label>
                      <Input
                        type="number"
                        value={(form as any)[key]}
                        onChange={(e) => update(key as any, Number(e.target.value))}
                        className="mt-1.5 text-mono"
                      />
                    </div>
                  ))}
                  <div>
                    <Label>Margen (%)</Label>
                    <Input type="number" value={form.marginPercent} onChange={(e) => update('marginPercent', Number(e.target.value))} className="mt-1.5 text-mono" />
                  </div>
                  <div>
                    <Label>IVA (%)</Label>
                    <Input type="number" value={form.taxRate} onChange={(e) => update('taxRate', Number(e.target.value))} className="mt-1.5 text-mono" />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="commercial" className="space-y-4 mt-0">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Probabilidad cierre (%)</Label>
                    <Input type="number" min={0} max={100} value={form.closingProbability} onChange={(e) => update('closingProbability', Number(e.target.value))} className="mt-1.5 text-mono" />
                  </div>
                  <div>
                    <Label>Próximo seguimiento</Label>
                    <Input type="date" value={form.nextFollowUpDate} onChange={(e) => update('nextFollowUpDate', e.target.value)} className="mt-1.5" />
                  </div>
                  <div className="col-span-2">
                    <Label>Competencia detectada</Label>
                    <Input value={form.competitorInfo} onChange={(e) => update('competitorInfo', e.target.value)} className="mt-1.5" placeholder="Otras empresas en proceso" />
                  </div>
                  <div className="col-span-2">
                    <Label>Notas comerciales</Label>
                    <Textarea value={form.commercialNotes} onChange={(e) => update('commercialNotes', e.target.value)} className="mt-1.5" rows={3} />
                  </div>
                </div>
              </TabsContent>
            </CardContent>
          </Tabs>
        </Card>
      </div>

      {/* Sidebar - resumen costos */}
      <div className="space-y-4">
        <Card className="sticky top-4">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Resumen de costos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="space-y-1.5 text-xs">
              <Row label="Materiales" value={form.materialsCost} />
              <Row label="Mano de obra" value={form.laborCost} />
              <Row label="Transporte" value={form.transportCost} />
              <Row label="Equipos" value={form.equipmentCost} />
              <Row label="Indirectos" value={form.indirectCost} />
            </div>
            <div className="border-t border-border pt-2">
              <Row label={`Margen ${form.marginPercent}%`} value={totals.subtotal - (form.materialsCost + form.laborCost + form.transportCost + form.equipmentCost + form.indirectCost)} muted />
            </div>
            <div className="border-t border-border pt-2 space-y-1.5">
              <Row label="Subtotal" value={totals.subtotal} bold />
              <Row label={`IVA ${form.taxRate}%`} value={totals.taxAmount} muted />
            </div>
            <div className="border-t border-border pt-3">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase tracking-wider text-muted-foreground font-medium">Total</span>
                <span className="text-mono text-2xl font-semibold tracking-tight text-primary">{formatCLP(totals.total)}</span>
              </div>
            </div>

            {error && <div className="text-xs text-destructive bg-destructive/10 rounded p-2">{error}</div>}

            <Button type="submit" className="w-full mt-3" disabled={loading}>
              {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
              {initial ? 'Guardar cambios' : 'Crear cotización'}
            </Button>
          </CardContent>
        </Card>
      </div>
    </form>
  )
}

function Row({ label, value, bold, muted }: { label: string; value: number; bold?: boolean; muted?: boolean }) {
  return (
    <div className="flex justify-between items-center">
      <span className={muted ? 'text-muted-foreground' : ''}>{label}</span>
      <span className={`text-mono ${bold ? 'font-semibold' : ''} ${muted ? 'text-muted-foreground' : ''}`}>{formatCLP(value)}</span>
    </div>
  )
}
