import Link from 'next/link'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Copy, Download, Edit, FileText, ChevronLeft, History, Phone, Mail, MapPin, Building2 } from 'lucide-react'
import { formatCLP, formatDate, initials, relativeTime } from '@/lib/utils'
import { QUOTE_STATUS_LABELS, QUOTE_STATUS_VARIANT, PIPELINE_STAGES, FOLLOWUP_TYPE_LABELS } from '@/lib/status'
import { QuoteActions } from '@/components/quotes/quote-actions'
import { FollowUpsList } from '@/components/quotes/followups-list'
import type { QuoteStatus } from '@prisma/client'

export const dynamic = 'force-dynamic'

export default async function QuoteDetailPage({ params }: { params: { id: string } }) {
  const quote = await prisma.quote.findUnique({
    where: { id: params.id },
    include: {
      client: true,
      owner: { select: { id: true, name: true, email: true } },
      items: { orderBy: { order: 'asc' } },
      statusHistory: { orderBy: { changedAt: 'desc' }, include: { user: { select: { name: true } } } },
      followUps: { orderBy: { scheduledAt: 'desc' }, include: { user: { select: { name: true } } } },
      project: true,
    },
  })

  if (!quote) return notFound()
  const stage = PIPELINE_STAGES.find((s) => s.id === quote.pipelineStage)

  return (
    <div className="p-6 lg:p-8 max-w-[1400px] mx-auto space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Link href="/quotes" className="hover:text-foreground flex items-center gap-1">
          <ChevronLeft className="h-3 w-3" />
          Cotizaciones
        </Link>
      </div>

      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <h1 className="text-mono text-2xl font-semibold tracking-tight">{quote.code}</h1>
            <Badge variant={QUOTE_STATUS_VARIANT[quote.status as QuoteStatus]}>
              {QUOTE_STATUS_LABELS[quote.status as QuoteStatus]}
            </Badge>
            {stage && (
              <Badge variant="outline" style={{ borderColor: stage.color + '40', color: stage.color }}>
                {stage.label}
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
            <Link href={`/clients/${quote.client.id}`} className="font-medium hover:text-primary">{quote.client.companyName}</Link>
            <span className="text-muted-foreground">·</span>
            <span className="text-muted-foreground">RUT {quote.client.rut}</span>
          </div>
        </div>

        <QuoteActions quote={quote as any} />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card><CardContent className="p-4">
          <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Total</div>
          <div className="text-mono text-xl font-semibold mt-1 text-primary">{formatCLP(quote.total)}</div>
        </CardContent></Card>
        <Card><CardContent className="p-4">
          <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Probabilidad</div>
          <div className="text-mono text-xl font-semibold mt-1">{quote.closingProbability}%</div>
        </CardContent></Card>
        <Card><CardContent className="p-4">
          <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Emisión</div>
          <div className="text-sm font-medium mt-1">{formatDate(quote.issueDate)}</div>
        </CardContent></Card>
        <Card><CardContent className="p-4">
          <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Vencimiento</div>
          <div className="text-sm font-medium mt-1">{formatDate(quote.expirationDate)}</div>
        </CardContent></Card>
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <Tabs defaultValue="info">
              <div className="px-6 pt-6">
                <TabsList>
                  <TabsTrigger value="info">Información</TabsTrigger>
                  <TabsTrigger value="items">Detalle</TabsTrigger>
                  <TabsTrigger value="followups">Seguimientos</TabsTrigger>
                  <TabsTrigger value="history">Historial</TabsTrigger>
                </TabsList>
              </div>

              <CardContent className="pt-4">
                <TabsContent value="info" className="mt-0 space-y-6">
                  <Section title="Información técnica">
                    <Field label="Tipo de trabajo" value={quote.workType} />
                    <Field label="Tipo de ductería" value={quote.ductType} />
                    <Field label="Metros lineales" value={quote.linearMeters ? `${quote.linearMeters} m` : null} mono />
                    <Field label="Espesor" value={quote.thickness} mono />
                    <Field label="Instalación" value={quote.installationType} />
                    <Field label="Mano de obra" value={quote.requiresLabor ? 'Incluida' : 'No incluida'} />
                  </Section>
                  {quote.equipmentNeeded && (
                    <div>
                      <div className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium mb-1">Equipos requeridos</div>
                      <div className="text-sm">{quote.equipmentNeeded}</div>
                    </div>
                  )}
                  {quote.technicalNotes && (
                    <div>
                      <div className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium mb-1">Observaciones técnicas</div>
                      <div className="text-sm whitespace-pre-wrap">{quote.technicalNotes}</div>
                    </div>
                  )}
                  <Separator />
                  <Section title="Seguimiento comercial">
                    <Field label="Próximo contacto" value={formatDate(quote.nextFollowUpDate)} mono />
                    <Field label="Último contacto" value={formatDate(quote.lastContactDate)} mono />
                    <Field label="Competencia" value={quote.competitorInfo} />
                  </Section>
                  {quote.commercialNotes && (
                    <div>
                      <div className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium mb-1">Notas comerciales</div>
                      <div className="text-sm whitespace-pre-wrap">{quote.commercialNotes}</div>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="items" className="mt-0">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border text-[10px] uppercase tracking-widest text-muted-foreground">
                          <th className="text-left font-medium py-2">Descripción</th>
                          <th className="text-right font-medium py-2">Cant.</th>
                          <th className="text-left font-medium py-2 pl-2">Unidad</th>
                          <th className="text-right font-medium py-2">Precio unit.</th>
                          <th className="text-right font-medium py-2">Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {quote.items.map((it) => (
                          <tr key={it.id} className="border-b border-border/50">
                            <td className="py-2.5">{it.description}</td>
                            <td className="py-2.5 text-right text-mono">{it.quantity}</td>
                            <td className="py-2.5 pl-2 text-mono text-xs text-muted-foreground">{it.unit}</td>
                            <td className="py-2.5 text-right text-mono">{formatCLP(it.unitPrice)}</td>
                            <td className="py-2.5 text-right text-mono font-medium">{formatCLP(it.total)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="mt-4 ml-auto max-w-xs space-y-1.5 text-sm">
                    <div className="flex justify-between text-muted-foreground"><span>Subtotal</span><span className="text-mono">{formatCLP(quote.subtotal)}</span></div>
                    <div className="flex justify-between text-muted-foreground"><span>IVA {Number(quote.taxRate)}%</span><span className="text-mono">{formatCLP(quote.taxAmount)}</span></div>
                    <div className="flex justify-between font-semibold pt-2 border-t border-border"><span>Total</span><span className="text-mono text-primary">{formatCLP(quote.total)}</span></div>
                  </div>
                </TabsContent>

                <TabsContent value="followups" className="mt-0">
                  <FollowUpsList quoteId={quote.id} followUps={quote.followUps as any} />
                </TabsContent>

                <TabsContent value="history" className="mt-0">
                  <div className="space-y-3">
                    {quote.statusHistory.map((h, idx) => (
                      <div key={h.id} className="flex gap-3 relative">
                        <div className="flex flex-col items-center">
                          <div className="h-7 w-7 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center shrink-0">
                            <History className="h-3 w-3 text-primary" />
                          </div>
                          {idx < quote.statusHistory.length - 1 && <div className="w-px flex-1 bg-border my-1" />}
                        </div>
                        <div className="flex-1 pb-3">
                          <div className="text-sm">
                            <span className="font-medium">{h.user.name}</span>
                            {' · '}
                            {h.fromStatus ? (
                              <>
                                <Badge variant={QUOTE_STATUS_VARIANT[h.fromStatus as QuoteStatus]} className="text-[10px]">{QUOTE_STATUS_LABELS[h.fromStatus as QuoteStatus]}</Badge>
                                <span className="text-muted-foreground"> → </span>
                              </>
                            ) : null}
                            <Badge variant={QUOTE_STATUS_VARIANT[h.toStatus as QuoteStatus]} className="text-[10px]">{QUOTE_STATUS_LABELS[h.toStatus as QuoteStatus]}</Badge>
                          </div>
                          {h.comment && <div className="text-xs text-muted-foreground mt-1">{h.comment}</div>}
                          <div className="text-[10px] text-mono text-muted-foreground mt-0.5">{formatDate(h.changedAt, true)}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </TabsContent>
              </CardContent>
            </Tabs>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Cliente */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Cliente</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <Link href={`/clients/${quote.client.id}`} className="block group">
                <div className="font-medium group-hover:text-primary">{quote.client.companyName}</div>
                <div className="text-mono text-xs text-muted-foreground">{quote.client.rut}</div>
              </Link>
              {quote.client.mainContactName && (
                <div className="text-xs text-muted-foreground">{quote.client.mainContactName}</div>
              )}
              {quote.client.phone && (
                <div className="flex items-center gap-1.5 text-xs"><Phone className="h-3 w-3 text-muted-foreground" />{quote.client.phone}</div>
              )}
              {quote.client.email && (
                <div className="flex items-center gap-1.5 text-xs"><Mail className="h-3 w-3 text-muted-foreground" />{quote.client.email}</div>
              )}
              {quote.client.city && (
                <div className="flex items-center gap-1.5 text-xs"><MapPin className="h-3 w-3 text-muted-foreground" />{quote.client.city}, {quote.client.region}</div>
              )}
            </CardContent>
          </Card>

          {/* Responsable */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Responsable</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2.5">
                <Avatar className="h-9 w-9">
                  <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">{initials(quote.owner.name)}</AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <div className="text-sm font-medium truncate">{quote.owner.name}</div>
                  <div className="text-xs text-muted-foreground truncate">{quote.owner.email}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Costos */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Desglose de costos</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1.5 text-xs">
              <div className="flex justify-between"><span className="text-muted-foreground">Materiales</span><span className="text-mono">{formatCLP(quote.materialsCost)}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Mano de obra</span><span className="text-mono">{formatCLP(quote.laborCost)}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Transporte</span><span className="text-mono">{formatCLP(quote.transportCost)}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Equipos</span><span className="text-mono">{formatCLP(quote.equipmentCost)}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Indirectos</span><span className="text-mono">{formatCLP(quote.indirectCost)}</span></div>
              <Separator className="my-2" />
              <div className="flex justify-between"><span>Margen</span><span className="text-mono">{Number(quote.marginPercent)}%</span></div>
              <div className="flex justify-between"><span>Subtotal</span><span className="text-mono font-medium">{formatCLP(quote.subtotal)}</span></div>
              <div className="flex justify-between text-muted-foreground"><span>IVA</span><span className="text-mono">{formatCLP(quote.taxAmount)}</span></div>
              <Separator className="my-2" />
              <div className="flex justify-between items-center">
                <span className="text-xs uppercase tracking-wider">Total</span>
                <span className="text-mono text-lg font-semibold text-primary">{formatCLP(quote.total)}</span>
              </div>
            </CardContent>
          </Card>

          {/* Proyecto vinculado */}
          {quote.project && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Proyecto vinculado</CardTitle>
              </CardHeader>
              <CardContent>
                <Link href={`/projects/${quote.project.id}`} className="block p-3 border border-border rounded-md hover:border-ring transition-colors">
                  <div className="text-mono text-xs text-muted-foreground">{quote.project.code}</div>
                  <div className="text-sm font-medium mt-1">{quote.project.name}</div>
                </Link>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium mb-3">{title}</div>
      <div className="grid grid-cols-2 gap-x-6 gap-y-3">{children}</div>
    </div>
  )
}

function Field({ label, value, mono }: { label: string; value: any; mono?: boolean }) {
  return (
    <div>
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className={`text-sm font-medium ${mono ? 'text-mono' : ''}`}>{value || '—'}</div>
    </div>
  )
}
