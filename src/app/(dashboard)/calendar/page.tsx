import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Phone, Mail, Users, MessageCircle, MoreHorizontal, AlertTriangle } from 'lucide-react'
import { formatDate, initials, relativeTime } from '@/lib/utils'
import { FOLLOWUP_TYPE_LABELS } from '@/lib/status'
import Link from 'next/link'
import type { FollowUpType } from '@prisma/client'

export const dynamic = 'force-dynamic'

const ICONS: Record<FollowUpType, any> = {
  CALL: Phone,
  EMAIL: Mail,
  MEETING: Users,
  WHATSAPP: MessageCircle,
  OTHER: MoreHorizontal,
}

export default async function CalendarPage() {
  const now = new Date()
  const followUps = await prisma.followUp.findMany({
    where: { outcome: 'PENDING' },
    include: {
      quote: { include: { client: { select: { id: true, companyName: true } } } },
      user: { select: { name: true } },
    },
    orderBy: { scheduledAt: 'asc' },
  })

  const overdue = followUps.filter((f) => new Date(f.scheduledAt) < new Date(now.getTime() - 86400000))
  const today = followUps.filter((f) => isSameDay(new Date(f.scheduledAt), now))
  const upcoming = followUps.filter((f) => new Date(f.scheduledAt) > new Date(now.getTime() + 86400000))

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-[1200px] mx-auto">
      <div>
        <div className="text-mono text-[10px] tracking-widest uppercase text-muted-foreground mb-1">Agenda</div>
        <h1 className="text-2xl font-semibold tracking-tight">Seguimientos</h1>
        <p className="text-sm text-muted-foreground mt-1">{followUps.length} seguimientos pendientes.</p>
      </div>

      {overdue.length > 0 && (
        <Section title="Atrasados" count={overdue.length} icon={AlertTriangle} accent="text-destructive">
          {overdue.map((f) => <Item key={f.id} f={f} accent="destructive" />)}
        </Section>
      )}

      <Section title="Hoy" count={today.length}>
        {today.length === 0 ? <Empty /> : today.map((f) => <Item key={f.id} f={f} />)}
      </Section>

      <Section title="Próximos" count={upcoming.length}>
        {upcoming.length === 0 ? <Empty /> : upcoming.map((f) => <Item key={f.id} f={f} />)}
      </Section>
    </div>
  )
}

function Section({ title, count, icon: Icon, accent, children }: any) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          {Icon && <Icon className={`h-3.5 w-3.5 ${accent}`} />}
          {title}
          <Badge variant="muted">{count}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">{children}</CardContent>
    </Card>
  )
}

function Empty() {
  return <p className="text-xs text-muted-foreground text-center py-4">Sin pendientes</p>
}

function Item({ f, accent }: { f: any; accent?: string }) {
  const Icon = ICONS[f.type as FollowUpType]
  return (
    <div className="flex items-start gap-3 p-3 rounded-md border border-border">
      <div className={`h-8 w-8 rounded-md flex items-center justify-center shrink-0 ${accent === 'destructive' ? 'bg-destructive/10 text-destructive' : 'bg-primary/10 text-primary'}`}>
        <Icon className="h-3.5 w-3.5" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <div className="text-sm font-medium">{FOLLOWUP_TYPE_LABELS[f.type as FollowUpType]}</div>
          <span className="text-[10px] text-mono text-muted-foreground">{relativeTime(f.scheduledAt)}</span>
        </div>
        {f.quote && (
          <Link href={`/quotes/${f.quote.id}`} className="text-xs text-muted-foreground hover:text-foreground">
            {f.quote.client.companyName} · {f.quote.code}
          </Link>
        )}
        {f.notes && <div className="text-xs mt-1.5">{f.notes}</div>}
        <div className="flex items-center gap-2 mt-2">
          <Avatar className="h-4 w-4"><AvatarFallback className="text-[8px] bg-primary/10 text-primary">{initials(f.user.name)}</AvatarFallback></Avatar>
          <span className="text-[10px] text-muted-foreground">{f.user.name}</span>
          <span className="text-[10px] text-mono text-muted-foreground">· {formatDate(f.scheduledAt, true)}</span>
        </div>
      </div>
    </div>
  )
}

function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
}
