import Link from 'next/link'
import { getDashboardMetrics } from '@/server/services/dashboardService'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { ArrowUpRight, TrendingUp, TrendingDown, FileText, Briefcase, AlertTriangle, Clock, CheckCircle2, XCircle } from 'lucide-react'
import { PipelineChart, MonthlySalesChart } from '@/components/dashboard/charts'
import { formatCLP, formatDate, relativeTime, initials } from '@/lib/utils'
import { QUOTE_STATUS_LABELS, QUOTE_STATUS_VARIANT, FOLLOWUP_TYPE_LABELS } from '@/lib/status'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const data = await getDashboardMetrics()
  const { kpis } = data

  const kpiCards = [
    { label: 'Cotizaciones activas', value: kpis.activeCount, icon: FileText, accent: 'text-primary', sub: `${kpis.pendingCount} pendientes` },
    { label: 'Aprobadas / Ganadas', value: kpis.approvedCount, icon: CheckCircle2, accent: 'text-success', sub: `${kpis.conversionRate}% conversión` },
    { label: 'Rechazadas / Perdidas', value: kpis.rejectedCount, icon: XCircle, accent: 'text-destructive' },
    { label: 'Proyectos en ejecución', value: kpis.projectsInProgress, icon: Briefcase, accent: 'text-warning', sub: `${kpis.projectsCompleted} finalizados` },
  ]

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <div className="text-mono text-[10px] tracking-widest uppercase text-muted-foreground mb-1">Panel general</div>
          <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">Vista consolidada de la operación comercial.</p>
        </div>
        <Button asChild size="sm" variant="outline">
          <Link href="/pipeline">
            Ver pipeline
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {kpiCards.map((k) => {
          const Icon = k.icon
          return (
            <Card key={k.label} className="overflow-hidden relative group hover:border-ring transition-colors">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className={`h-8 w-8 rounded-md bg-card border border-border flex items-center justify-center ${k.accent}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                </div>
                <div className="text-mono text-3xl font-semibold tracking-tight">{k.value}</div>
                <div className="text-xs text-muted-foreground mt-1">{k.label}</div>
                {k.sub && <div className="text-[10px] text-mono text-muted-foreground/70 mt-2">{k.sub}</div>}
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Métricas financieras */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs text-muted-foreground tracking-wide uppercase font-medium">Monto total cotizado</div>
                <div className="text-mono text-3xl font-semibold tracking-tight mt-2">{formatCLP(kpis.totalQuoted)}</div>
                <div className="flex items-center gap-1.5 mt-2 text-xs">
                  <TrendingUp className="h-3 w-3 text-success" />
                  <span className="text-success font-medium text-mono">Pipeline activo</span>
                </div>
              </div>
              <div className="h-14 w-14 rounded-lg bg-primary/5 border border-primary/20 flex items-center justify-center">
                <FileText className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs text-muted-foreground tracking-wide uppercase font-medium">Monto total ganado</div>
                <div className="text-mono text-3xl font-semibold tracking-tight mt-2 text-success">{formatCLP(kpis.totalWon)}</div>
                <div className="flex items-center gap-1.5 mt-2 text-xs">
                  <CheckCircle2 className="h-3 w-3 text-success" />
                  <span className="text-mono text-muted-foreground">{kpis.conversionRate}% tasa de conversión</span>
                </div>
              </div>
              <div className="h-14 w-14 rounded-lg bg-success/5 border border-success/20 flex items-center justify-center">
                <CheckCircle2 className="h-6 w-6 text-success" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Pipeline comercial</CardTitle>
            <p className="text-xs text-muted-foreground">Distribución por etapa</p>
          </CardHeader>
          <CardContent>
            <PipelineChart data={data.pipeline} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Ventas mensuales</CardTitle>
            <p className="text-xs text-muted-foreground">Cotizaciones ganadas — últimos 6 meses</p>
          </CardHeader>
          <CardContent>
            <MonthlySalesChart data={data.monthlyWon} />
          </CardContent>
        </Card>
      </div>

      {/* Alertas + Actividad + Seguimientos */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        {/* Cotizaciones por vencer */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm flex items-center gap-2">
                <AlertTriangle className="h-3.5 w-3.5 text-warning" />
                Por vencer
              </CardTitle>
              <Badge variant="warning">{data.expiringQuotes.length}</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {data.expiringQuotes.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-6">Sin cotizaciones por vencer</p>
            ) : (
              data.expiringQuotes.map((q) => (
                <Link key={q.id} href={`/quotes/${q.id}`} className="block p-2 rounded-md border border-border hover:border-ring hover:bg-accent/30 transition-colors">
                  <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <div className="text-xs font-medium truncate">{q.client.companyName}</div>
                      <div className="text-mono text-[10px] text-muted-foreground">{q.code}</div>
                    </div>
                    <Badge variant={QUOTE_STATUS_VARIANT[q.status]} className="shrink-0">
                      {QUOTE_STATUS_LABELS[q.status]}
                    </Badge>
                  </div>
                  <div className="text-[10px] text-warning mt-1.5 text-mono">
                    Vence {relativeTime(q.expirationDate)}
                  </div>
                </Link>
              ))
            )}
          </CardContent>
        </Card>

        {/* Próximos seguimientos */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm flex items-center gap-2">
                <Clock className="h-3.5 w-3.5 text-primary" />
                Próximos seguimientos
              </CardTitle>
              <Badge variant="primary">{data.upcomingFollowUps.length}</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {data.upcomingFollowUps.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-6">Sin seguimientos pendientes</p>
            ) : (
              data.upcomingFollowUps.map((f) => (
                <div key={f.id} className="p-2 rounded-md border border-border">
                  <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-medium truncate">{f.quote?.client.companyName ?? 'Sin cliente'}</div>
                      <div className="text-[10px] text-muted-foreground truncate">{f.notes || FOLLOWUP_TYPE_LABELS[f.type]}</div>
                    </div>
                    <Badge variant="outline" className="shrink-0 text-[10px]">{FOLLOWUP_TYPE_LABELS[f.type]}</Badge>
                  </div>
                  <div className="text-[10px] text-mono text-muted-foreground mt-1.5">{formatDate(f.scheduledAt, true)}</div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Actividad reciente */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Actividad reciente</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.recentActivity.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-6">Sin actividad</p>
            ) : (
              data.recentActivity.map((a) => (
                <div key={a.id} className="flex items-start gap-2.5">
                  <Avatar className="h-6 w-6">
                    <AvatarFallback className="text-[10px] bg-primary/10 text-primary font-semibold">
                      {initials(a.user?.name || 'Sistema')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0 text-xs">
                    <div>
                      <span className="font-medium">{a.user?.name || 'Sistema'}</span>{' '}
                      <span className="text-muted-foreground">{actionLabel(a.action)}</span>
                    </div>
                    <div className="text-[10px] text-mono text-muted-foreground mt-0.5">{relativeTime(a.createdAt)}</div>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function actionLabel(action: string) {
  const map: Record<string, string> = {
    'quote.create': 'creó una cotización',
    'quote.update': 'actualizó una cotización',
    'quote.delete': 'eliminó una cotización',
    'client.create': 'agregó un cliente',
  }
  return map[action] || action
}
