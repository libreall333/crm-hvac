import Link from 'next/link'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { ChevronLeft, Edit, Building2, FileText, CheckCircle2, Circle, Clock } from 'lucide-react'
import { formatCLP, formatDate } from '@/lib/utils'
import { PROJECT_STATUS_LABELS, PROJECT_STATUS_VARIANT } from '@/lib/status'
import type { ProjectStatus } from '@prisma/client'

export const dynamic = 'force-dynamic'

export default async function ProjectDetailPage({ params }: { params: { id: string } }) {
  const project = await prisma.project.findUnique({
    where: { id: params.id },
    include: {
      client: true,
      manager: { select: { id: true, name: true, email: true } },
      quote: { select: { id: true, code: true, total: true } },
      costs: { orderBy: { date: 'desc' } },
      milestones: { orderBy: { order: 'asc' } },
    },
  })
  if (!project) return notFound()

  const realCost = project.costs.reduce((acc, c) => acc + Number(c.amount), 0)
  const budgetUsage = Number(project.budgetTotal) > 0 ? (realCost / Number(project.budgetTotal)) * 100 : 0
  const profitMargin = Number(project.budgetTotal) - realCost
  const completedMilestones = project.milestones.filter((m) => m.completedAt).length

  return (
    <div className="p-6 lg:p-8 max-w-[1400px] mx-auto space-y-6">
      <Link href="/projects" className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 w-fit">
        <ChevronLeft className="h-3 w-3" />
        Proyectos
      </Link>

      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-mono text-2xl font-semibold tracking-tight">{project.code}</h1>
            <Badge variant={PROJECT_STATUS_VARIANT[project.status as ProjectStatus]}>
              {PROJECT_STATUS_LABELS[project.status as ProjectStatus]}
            </Badge>
          </div>
          <div className="text-lg mt-1">{project.name}</div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
            <Building2 className="h-3.5 w-3.5" />
            <Link href={`/clients/${project.client.id}`} className="hover:text-foreground">{project.client.companyName}</Link>
          </div>
        </div>
      </div>

      {/* Progress */}
      <Card>
        <CardContent className="p-5">
          <div className="flex items-center justify-between mb-2">
            <div className="text-xs uppercase tracking-wider text-muted-foreground font-medium">Avance del proyecto</div>
            <span className="text-mono text-lg font-semibold">{project.progressPercent}%</span>
          </div>
          <div className="h-2 rounded-full bg-secondary overflow-hidden">
            <div className="h-full bg-primary transition-all" style={{ width: `${project.progressPercent}%` }} />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 pt-4 border-t border-border">
            <div>
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Inicio</div>
              <div className="text-mono text-sm font-medium mt-1">{formatDate(project.startDate)}</div>
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Término</div>
              <div className="text-mono text-sm font-medium mt-1">{formatDate(project.endDate)}</div>
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Hitos completados</div>
              <div className="text-mono text-sm font-medium mt-1">{completedMilestones} / {project.milestones.length}</div>
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Responsable</div>
              <div className="text-sm font-medium mt-1">{project.manager.name}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Comparativa Presupuesto vs Real */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <Card><CardContent className="p-4">
          <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Presupuesto</div>
          <div className="text-mono text-xl font-semibold mt-1">{formatCLP(project.budgetTotal)}</div>
        </CardContent></Card>
        <Card><CardContent className="p-4">
          <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Costo real</div>
          <div className="text-mono text-xl font-semibold mt-1">{formatCLP(realCost)}</div>
          <div className="text-[10px] text-muted-foreground mt-1">{Math.round(budgetUsage)}% del presupuesto</div>
        </CardContent></Card>
        <Card><CardContent className="p-4">
          <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Margen</div>
          <div className={`text-mono text-xl font-semibold mt-1 ${profitMargin >= 0 ? 'text-success' : 'text-destructive'}`}>
            {formatCLP(profitMargin)}
          </div>
        </CardContent></Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <Card>
            <Tabs defaultValue="milestones">
              <div className="px-6 pt-6">
                <TabsList>
                  <TabsTrigger value="milestones">Hitos</TabsTrigger>
                  <TabsTrigger value="costs">Costos reales</TabsTrigger>
                  {project.notes && <TabsTrigger value="notes">Notas</TabsTrigger>}
                </TabsList>
              </div>
              <CardContent className="pt-4">
                <TabsContent value="milestones" className="mt-0">
                  {project.milestones.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-8">Sin hitos definidos</p>
                  ) : (
                    <div className="space-y-2">
                      {project.milestones.map((m, idx) => {
                        const done = !!m.completedAt
                        const isOverdue = !done && m.dueDate && new Date(m.dueDate) < new Date()
                        return (
                          <div key={m.id} className="flex items-start gap-3 p-3 rounded-md border border-border">
                            {done ? (
                              <CheckCircle2 className="h-4 w-4 text-success shrink-0 mt-0.5" />
                            ) : isOverdue ? (
                              <Clock className="h-4 w-4 text-warning shrink-0 mt-0.5" />
                            ) : (
                              <Circle className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                            )}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-sm font-medium">{m.title}</span>
                                {done && <Badge variant="success" className="text-[10px]">Completado</Badge>}
                                {isOverdue && <Badge variant="warning" className="text-[10px]">Atrasado</Badge>}
                              </div>
                              {m.description && <div className="text-xs text-muted-foreground mt-0.5">{m.description}</div>}
                              <div className="text-[10px] text-mono text-muted-foreground mt-1">
                                {done ? `Completado ${formatDate(m.completedAt)}` : m.dueDate ? `Vence ${formatDate(m.dueDate)}` : ''}
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="costs" className="mt-0">
                  {project.costs.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-8">Sin costos registrados</p>
                  ) : (
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border text-[10px] uppercase tracking-widest text-muted-foreground">
                          <th className="text-left font-medium py-2">Fecha</th>
                          <th className="text-left font-medium py-2">Categoría</th>
                          <th className="text-left font-medium py-2">Descripción</th>
                          <th className="text-right font-medium py-2">Monto</th>
                        </tr>
                      </thead>
                      <tbody>
                        {project.costs.map((c) => (
                          <tr key={c.id} className="border-b border-border/50">
                            <td className="py-2.5 text-mono text-xs text-muted-foreground">{formatDate(c.date)}</td>
                            <td className="py-2.5"><Badge variant="outline" className="text-[10px]">{c.category}</Badge></td>
                            <td className="py-2.5 text-xs">{c.description || '—'}</td>
                            <td className="py-2.5 text-right text-mono">{formatCLP(c.amount)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </TabsContent>

                {project.notes && (
                  <TabsContent value="notes" className="mt-0">
                    <p className="text-sm whitespace-pre-wrap">{project.notes}</p>
                  </TabsContent>
                )}
              </CardContent>
            </Tabs>
          </Card>
        </div>

        <div className="space-y-4">
          {project.quote && (
            <Card>
              <CardHeader className="pb-3"><CardTitle className="text-sm">Cotización origen</CardTitle></CardHeader>
              <CardContent>
                <Link href={`/quotes/${project.quote.id}`} className="block p-3 border border-border rounded-md hover:border-ring transition-colors">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-primary" />
                    <span className="text-mono text-sm font-medium">{project.quote.code}</span>
                  </div>
                  <div className="text-mono text-sm mt-1.5">{formatCLP(project.quote.total)}</div>
                </Link>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
