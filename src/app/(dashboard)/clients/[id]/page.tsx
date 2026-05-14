import Link from 'next/link'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { ChevronLeft, Edit, Building2, Phone, Mail, MapPin, FileText, Briefcase } from 'lucide-react'
import { formatCLP, formatDate } from '@/lib/utils'
import { CLIENT_STATUS_LABELS, CLIENT_STATUS_VARIANT, QUOTE_STATUS_LABELS, QUOTE_STATUS_VARIANT, PROJECT_STATUS_LABELS, PROJECT_STATUS_VARIANT } from '@/lib/status'
import type { QuoteStatus, ProjectStatus } from '@prisma/client'

export const dynamic = 'force-dynamic'

export default async function ClientDetailPage({ params }: { params: { id: string } }) {
  const client = await prisma.client.findUnique({
    where: { id: params.id },
    include: {
      tags: { include: { tag: true } },
      quotes: { orderBy: { createdAt: 'desc' }, include: { owner: { select: { name: true } } } },
      projects: { orderBy: { createdAt: 'desc' } },
    },
  })
  if (!client) return notFound()

  const totalQuoted = client.quotes.reduce((acc, q) => acc + Number(q.total), 0)
  const totalWon = client.quotes.filter((q) => ['WON', 'APPROVED'].includes(q.status)).reduce((acc, q) => acc + Number(q.total), 0)

  return (
    <div className="p-6 lg:p-8 max-w-[1400px] mx-auto space-y-6">
      <Link href="/clients" className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 w-fit">
        <ChevronLeft className="h-3 w-3" />
        Clientes
      </Link>

      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-start gap-4">
          <div className="h-12 w-12 rounded-lg bg-primary/10 border border-primary/30 flex items-center justify-center shrink-0">
            <Building2 className="h-5 w-5 text-primary" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-semibold tracking-tight">{client.companyName}</h1>
              <Badge variant={CLIENT_STATUS_VARIANT[client.status]}>{CLIENT_STATUS_LABELS[client.status]}</Badge>
              {client.tags.map((t) => (
                <Badge key={t.tagId} variant="outline" style={{ borderColor: t.tag.color + '40', color: t.tag.color }}>{t.tag.name}</Badge>
              ))}
            </div>
            <div className="text-mono text-xs text-muted-foreground mt-1">{client.rut}</div>
            {client.businessActivity && <div className="text-sm text-muted-foreground mt-1">{client.businessActivity}</div>}
          </div>
        </div>
        <Button asChild>
          <Link href={`/clients/${client.id}/edit`}><Edit className="h-3.5 w-3.5" />Editar</Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <Tabs defaultValue="quotes">
              <div className="px-6 pt-6">
                <TabsList>
                  <TabsTrigger value="quotes">Cotizaciones ({client.quotes.length})</TabsTrigger>
                  <TabsTrigger value="projects">Proyectos ({client.projects.length})</TabsTrigger>
                  {client.notes && <TabsTrigger value="notes">Notas</TabsTrigger>}
                </TabsList>
              </div>
              <CardContent className="pt-4">
                <TabsContent value="quotes" className="mt-0">
                  {client.quotes.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-8">Sin cotizaciones</p>
                  ) : (
                    <div className="space-y-2">
                      {client.quotes.map((q) => (
                        <Link key={q.id} href={`/quotes/${q.id}`} className="flex items-center justify-between p-3 rounded-md border border-border hover:border-ring hover:bg-accent/30 transition-colors">
                          <div className="flex items-center gap-3 min-w-0">
                            <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                            <div className="min-w-0">
                              <div className="text-mono text-xs font-medium">{q.code}</div>
                              <div className="text-xs text-muted-foreground truncate">{q.workType || 'Cotización'} · {formatDate(q.createdAt)}</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 shrink-0">
                            <span className="text-mono text-sm font-medium">{formatCLP(q.total)}</span>
                            <Badge variant={QUOTE_STATUS_VARIANT[q.status as QuoteStatus]}>{QUOTE_STATUS_LABELS[q.status as QuoteStatus]}</Badge>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="projects" className="mt-0">
                  {client.projects.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-8">Sin proyectos</p>
                  ) : (
                    <div className="space-y-2">
                      {client.projects.map((p) => (
                        <Link key={p.id} href={`/projects/${p.id}`} className="flex items-center justify-between p-3 rounded-md border border-border hover:border-ring transition-colors">
                          <div className="flex items-center gap-3 min-w-0">
                            <Briefcase className="h-4 w-4 text-muted-foreground shrink-0" />
                            <div className="min-w-0">
                              <div className="text-mono text-xs font-medium">{p.code}</div>
                              <div className="text-sm truncate">{p.name}</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 shrink-0">
                            <span className="text-mono text-xs text-muted-foreground">{p.progressPercent}%</span>
                            <Badge variant={PROJECT_STATUS_VARIANT[p.status as ProjectStatus]}>{PROJECT_STATUS_LABELS[p.status as ProjectStatus]}</Badge>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                </TabsContent>

                {client.notes && (
                  <TabsContent value="notes" className="mt-0">
                    <p className="text-sm whitespace-pre-wrap">{client.notes}</p>
                  </TabsContent>
                )}
              </CardContent>
            </Tabs>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Contacto</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2.5 text-sm">
              {client.mainContactName && <div><div className="text-xs text-muted-foreground">Contacto principal</div><div>{client.mainContactName}</div></div>}
              {client.phone && <div className="flex items-center gap-2"><Phone className="h-3.5 w-3.5 text-muted-foreground" />{client.phone}</div>}
              {client.email && <div className="flex items-center gap-2"><Mail className="h-3.5 w-3.5 text-muted-foreground" />{client.email}</div>}
              {client.address && (
                <div className="flex items-start gap-2">
                  <MapPin className="h-3.5 w-3.5 text-muted-foreground mt-0.5" />
                  <div className="text-xs">
                    {client.address}<br />
                    {client.city}, {client.region}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-sm">Resumen comercial</CardTitle></CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground text-xs">Cotizaciones</span><span className="text-mono font-medium">{client.quotes.length}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground text-xs">Total cotizado</span><span className="text-mono font-medium">{formatCLP(totalQuoted)}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground text-xs">Total ganado</span><span className="text-mono font-medium text-success">{formatCLP(totalWon)}</span></div>
              <div className="flex justify-between pt-2 border-t border-border"><span className="text-muted-foreground text-xs">Proyectos</span><span className="text-mono font-medium">{client.projects.length}</span></div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
