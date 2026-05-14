import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Briefcase, ChevronRight } from 'lucide-react'
import { formatCLP, formatDate, initials } from '@/lib/utils'
import { PROJECT_STATUS_LABELS, PROJECT_STATUS_VARIANT } from '@/lib/status'
import type { ProjectStatus } from '@prisma/client'

export const dynamic = 'force-dynamic'

export default async function ProjectsPage() {
  const projects = await prisma.project.findMany({
    include: {
      client: { select: { id: true, companyName: true } },
      manager: { select: { name: true } },
      quote: { select: { code: true } },
    },
    orderBy: { createdAt: 'desc' },
  })

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-[1400px] mx-auto">
      <div>
        <div className="text-mono text-[10px] tracking-widest uppercase text-muted-foreground mb-1">Operaciones</div>
        <h1 className="text-2xl font-semibold tracking-tight">Proyectos</h1>
        <p className="text-sm text-muted-foreground mt-1">{projects.length} proyectos en gestión.</p>
      </div>

      {projects.length === 0 ? (
        <Card><CardContent className="p-12 text-center">
          <Briefcase className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
          <p className="text-sm font-medium">Sin proyectos</p>
          <p className="text-xs text-muted-foreground mt-1">Los proyectos se crean automáticamente al ganar una cotización.</p>
        </CardContent></Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {projects.map((p) => {
            const budgetUsage = Number(p.budgetTotal) > 0 ? (Number(p.realCostTotal) / Number(p.budgetTotal)) * 100 : 0
            return (
              <Link key={p.id} href={`/projects/${p.id}`}>
                <Card className="h-full hover:border-ring transition-colors group">
                  <CardContent className="p-5 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="text-mono text-[10px] text-muted-foreground">{p.code}</div>
                        <div className="font-semibold text-sm mt-0.5 truncate group-hover:text-primary">{p.name}</div>
                      </div>
                      <Badge variant={PROJECT_STATUS_VARIANT[p.status as ProjectStatus]} className="shrink-0">
                        {PROJECT_STATUS_LABELS[p.status as ProjectStatus]}
                      </Badge>
                    </div>

                    <div className="text-xs text-muted-foreground truncate">{p.client.companyName}</div>

                    {/* Progress bar */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="text-muted-foreground tracking-wider uppercase">Avance</span>
                        <span className="text-mono font-medium">{p.progressPercent}%</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
                        <div className="h-full bg-primary transition-all" style={{ width: `${p.progressPercent}%` }} />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border">
                      <div>
                        <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Presupuesto</div>
                        <div className="text-mono text-xs font-medium mt-0.5">{formatCLP(p.budgetTotal)}</div>
                      </div>
                      <div>
                        <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Real / {Math.round(budgetUsage)}%</div>
                        <div className="text-mono text-xs font-medium mt-0.5">{formatCLP(p.realCostTotal)}</div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-border">
                      <div className="flex items-center gap-1.5">
                        <Avatar className="h-5 w-5">
                          <AvatarFallback className="text-[9px] bg-primary/10 text-primary">{initials(p.manager.name)}</AvatarFallback>
                        </Avatar>
                        <span className="text-[10px] text-muted-foreground">{p.manager.name}</span>
                      </div>
                      <span className="text-[10px] text-mono text-muted-foreground">{formatDate(p.endDate)}</span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
