'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Plus, CheckCircle2, Phone, Mail, Users as MeetingIcon, MessageCircle } from 'lucide-react'
import { FOLLOWUP_TYPE_LABELS } from '@/lib/status'
import { formatDate } from '@/lib/utils'
import type { FollowUp, FollowUpType } from '@prisma/client'

type Row = FollowUp & { user: { name: string } }

const ICONS: Record<FollowUpType, any> = {
  CALL: Phone,
  EMAIL: Mail,
  MEETING: MeetingIcon,
  WHATSAPP: MessageCircle,
  OTHER: MessageCircle,
}

export function FollowUpsList({ quoteId, followUps }: { quoteId: string; followUps: Row[] }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({ type: 'CALL' as FollowUpType, scheduledAt: '', notes: '' })

  async function create() {
    if (!form.scheduledAt) return
    const res = await fetch('/api/followups', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, quoteId, scheduledAt: new Date(form.scheduledAt).toISOString() }),
    })
    if (res.ok) {
      setForm({ type: 'CALL', scheduledAt: '', notes: '' })
      setOpen(false)
      router.refresh()
    }
  }

  async function complete(id: string) {
    await fetch(`/api/followups/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ outcome: 'COMPLETED' }),
    })
    router.refresh()
  }

  return (
    <div className="space-y-3">
      {!open && (
        <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
          <Plus className="h-3.5 w-3.5" />
          Agregar seguimiento
        </Button>
      )}

      {open && (
        <div className="border border-border rounded-md p-4 space-y-3 bg-accent/20">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Tipo</Label>
              <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v as FollowUpType })}>
                <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(FOLLOWUP_TYPE_LABELS).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Fecha y hora</Label>
              <Input type="datetime-local" value={form.scheduledAt} onChange={(e) => setForm({ ...form, scheduledAt: e.target.value })} className="mt-1.5" />
            </div>
          </div>
          <div>
            <Label>Notas</Label>
            <Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={2} className="mt-1.5" />
          </div>
          <div className="flex gap-2">
            <Button size="sm" onClick={create}>Agregar</Button>
            <Button size="sm" variant="ghost" onClick={() => setOpen(false)}>Cancelar</Button>
          </div>
        </div>
      )}

      <div className="space-y-2">
        {followUps.length === 0 ? (
          <p className="text-xs text-muted-foreground text-center py-6">Sin seguimientos registrados</p>
        ) : (
          followUps.map((f) => {
            const Icon = ICONS[f.type]
            const isPending = f.outcome === 'PENDING'
            return (
              <div key={f.id} className="flex items-start gap-3 p-3 border border-border rounded-md">
                <div className={`h-8 w-8 rounded-md flex items-center justify-center shrink-0 ${isPending ? 'bg-primary/10 text-primary' : 'bg-success/10 text-success'}`}>
                  <Icon className="h-3.5 w-3.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <div className="text-sm font-medium">{FOLLOWUP_TYPE_LABELS[f.type]}</div>
                    <Badge variant={isPending ? 'warning' : 'success'} className="text-[10px]">
                      {isPending ? 'Pendiente' : 'Completado'}
                    </Badge>
                  </div>
                  <div className="text-xs text-muted-foreground text-mono mt-0.5">{formatDate(f.scheduledAt, true)}</div>
                  {f.notes && <div className="text-xs mt-1.5">{f.notes}</div>}
                  <div className="text-[10px] text-muted-foreground mt-1.5">por {f.user.name}</div>
                </div>
                {isPending && (
                  <Button size="sm" variant="ghost" onClick={() => complete(f.id)}>
                    <CheckCircle2 className="h-3.5 w-3.5" />
                  </Button>
                )}
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
