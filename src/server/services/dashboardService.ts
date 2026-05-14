import { prisma } from '@/lib/prisma'
import { QuoteStatus, ProjectStatus } from '@prisma/client'

export async function getDashboardMetrics() {
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const startOfYear = new Date(now.getFullYear(), 0, 1)
  const last6Months = new Date(now.getFullYear(), now.getMonth() - 5, 1)

  const [
    activeCount,
    approvedCount,
    rejectedCount,
    pendingCount,
    totalQuotedAgg,
    wonAgg,
    projectsInProgress,
    projectsCompleted,
    expiringQuotes,
    monthlyWon,
    pipelineCount,
    recentActivity,
    upcomingFollowUps,
  ] = await Promise.all([
    prisma.quote.count({ where: { status: { in: [QuoteStatus.SENT, QuoteStatus.IN_REVIEW, QuoteStatus.PENDING, QuoteStatus.FOLLOW_UP] } } }),
    prisma.quote.count({ where: { status: { in: [QuoteStatus.APPROVED, QuoteStatus.WON] } } }),
    prisma.quote.count({ where: { status: { in: [QuoteStatus.REJECTED, QuoteStatus.LOST] } } }),
    prisma.quote.count({ where: { status: QuoteStatus.PENDING } }),
    prisma.quote.aggregate({ _sum: { total: true }, where: { status: { notIn: [QuoteStatus.DRAFT, QuoteStatus.LOST, QuoteStatus.REJECTED] } } }),
    prisma.quote.aggregate({ _sum: { total: true }, where: { status: { in: [QuoteStatus.WON, QuoteStatus.APPROVED] } } }),
    prisma.project.count({ where: { status: ProjectStatus.IN_PROGRESS } }),
    prisma.project.count({ where: { status: { in: [ProjectStatus.COMPLETED, ProjectStatus.INVOICED] } } }),
    prisma.quote.findMany({
      where: { expirationDate: { lte: new Date(now.getTime() + 7 * 86400000), gte: now }, status: { in: [QuoteStatus.SENT, QuoteStatus.IN_REVIEW, QuoteStatus.PENDING] } },
      include: { client: { select: { companyName: true } } },
      orderBy: { expirationDate: 'asc' },
      take: 5,
    }),
    // Ventas mensuales (últimos 6 meses)
    prisma.$queryRaw<Array<{ month: Date; total: bigint }>>`
      SELECT date_trunc('month', "issueDate") as month, COALESCE(SUM("total"), 0)::bigint as total
      FROM "Quote"
      WHERE status IN ('WON', 'APPROVED') AND "issueDate" >= ${last6Months}
      GROUP BY 1 ORDER BY 1
    `,
    // Pipeline conteo por etapa
    prisma.quote.groupBy({
      by: ['pipelineStage'],
      _count: { _all: true },
      _sum: { total: true },
      where: { status: { notIn: [QuoteStatus.DRAFT] } },
    }),
    prisma.activityLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 8,
      include: { user: { select: { name: true } } },
    }),
    prisma.followUp.findMany({
      where: { outcome: 'PENDING', scheduledAt: { gte: new Date(now.getTime() - 86400000) } },
      include: {
        quote: { include: { client: { select: { companyName: true } } } },
        user: { select: { name: true } },
      },
      orderBy: { scheduledAt: 'asc' },
      take: 6,
    }),
  ])

  // Conversión
  const totalQuotes = await prisma.quote.count({ where: { status: { not: QuoteStatus.DRAFT } } })
  const wonQuotes = await prisma.quote.count({ where: { status: { in: [QuoteStatus.WON, QuoteStatus.APPROVED] } } })
  const conversionRate = totalQuotes > 0 ? Math.round((wonQuotes / totalQuotes) * 100) : 0

  return {
    kpis: {
      activeCount,
      approvedCount,
      rejectedCount,
      pendingCount,
      totalQuoted: Number(totalQuotedAgg._sum.total ?? 0),
      totalWon: Number(wonAgg._sum.total ?? 0),
      projectsInProgress,
      projectsCompleted,
      conversionRate,
    },
    expiringQuotes,
    monthlyWon: monthlyWon.map((m) => ({ month: m.month, total: Number(m.total) })),
    pipeline: pipelineCount.map((p) => ({ stage: p.pipelineStage, count: p._count._all, total: Number(p._sum.total ?? 0) })),
    recentActivity,
    upcomingFollowUps,
  }
}
