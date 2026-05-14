'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { DndContext, DragOverlay, PointerSensor, useSensor, useSensors, closestCorners, type DragEndEvent, type DragStartEvent } from '@dnd-kit/core'
import { useDroppable, useDraggable } from '@dnd-kit/core'
import { PIPELINE_STAGES } from '@/lib/status'
import { formatCLP, initials } from '@/lib/utils'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import type { PipelineStage } from '@prisma/client'

interface QuoteCard {
  id: string
  code: string
  total: any
  pipelineStage: PipelineStage
  closingProbability: number
  client: { id: string; companyName: string }
  owner: { id: string; name: string }
}

export function KanbanBoard({ quotes: initialQuotes }: { quotes: QuoteCard[] }) {
  const router = useRouter()
  const [quotes, setQuotes] = useState(initialQuotes)
  const [activeId, setActiveId] = useState<string | null>(null)

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }))

  function onDragStart(e: DragStartEvent) {
    setActiveId(String(e.active.id))
  }

  async function onDragEnd(e: DragEndEvent) {
    setActiveId(null)
    const { active, over } = e
    if (!over) return
    const newStage = String(over.id) as PipelineStage
    const quote = quotes.find((q) => q.id === active.id)
    if (!quote || quote.pipelineStage === newStage) return

    // Optimistic update
    setQuotes((qs) => qs.map((q) => (q.id === quote.id ? { ...q, pipelineStage: newStage } : q)))

    const res = await fetch(`/api/quotes/${quote.id}/pipeline`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ stage: newStage }),
    })
    if (!res.ok) {
      // rollback
      setQuotes((qs) => qs.map((q) => (q.id === quote.id ? { ...q, pipelineStage: quote.pipelineStage } : q)))
    } else {
      router.refresh()
    }
  }

  const activeQuote = activeId ? quotes.find((q) => q.id === activeId) : null

  return (
    <DndContext sensors={sensors} collisionDetection={closestCorners} onDragStart={onDragStart} onDragEnd={onDragEnd}>
      <div className="flex gap-3 h-full overflow-x-auto pb-2">
        {PIPELINE_STAGES.map((stage) => {
          const stageQuotes = quotes.filter((q) => q.pipelineStage === stage.id)
          const stageTotal = stageQuotes.reduce((acc, q) => acc + Number(q.total), 0)
          return (
            <Column key={stage.id} stage={stage} quotes={stageQuotes} total={stageTotal} />
          )
        })}
      </div>

      <DragOverlay>
        {activeQuote ? <Card quote={activeQuote} dragging /> : null}
      </DragOverlay>
    </DndContext>
  )
}

function Column({ stage, quotes, total }: { stage: typeof PIPELINE_STAGES[number]; quotes: QuoteCard[]; total: number }) {
  const { setNodeRef, isOver } = useDroppable({ id: stage.id })

  return (
    <div className="flex flex-col w-72 shrink-0">
      <div className="flex items-center justify-between mb-2 px-1">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full" style={{ background: stage.color }} />
          <span className="text-xs font-medium">{stage.label}</span>
          <Badge variant="muted" className="text-[10px] px-1.5 py-0">{quotes.length}</Badge>
        </div>
        <span className="text-[10px] text-mono text-muted-foreground">{formatCLP(total)}</span>
      </div>

      <div
        ref={setNodeRef}
        className={`flex-1 rounded-lg border border-border bg-card/30 p-2 space-y-2 overflow-y-auto transition-colors ${isOver ? 'border-ring bg-accent/30' : ''}`}
        style={{ borderTopColor: stage.color, borderTopWidth: 2 }}
      >
        {quotes.map((q) => <DraggableCard key={q.id} quote={q} />)}
        {quotes.length === 0 && (
          <div className="text-[10px] text-muted-foreground text-center py-8">Sin cotizaciones</div>
        )}
      </div>
    </div>
  )
}

function DraggableCard({ quote }: { quote: QuoteCard }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: quote.id })
  const style = transform ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` } : undefined
  return (
    <div ref={setNodeRef} style={style} {...listeners} {...attributes} className={isDragging ? 'opacity-30' : ''}>
      <Card quote={quote} />
    </div>
  )
}

function Card({ quote, dragging }: { quote: QuoteCard; dragging?: boolean }) {
  return (
    <Link
      href={`/quotes/${quote.id}`}
      onClick={(e) => { if (dragging) e.preventDefault() }}
      className={`block p-3 rounded-md border bg-card hover:border-ring transition-colors ${dragging ? 'shadow-2xl border-primary cursor-grabbing' : 'border-border cursor-grab'}`}
    >
      <div className="flex items-center justify-between gap-2 mb-2">
        <span className="text-mono text-[10px] text-muted-foreground">{quote.code}</span>
        <span className="text-[10px] text-mono text-muted-foreground">{quote.closingProbability}%</span>
      </div>
      <div className="text-sm font-medium truncate mb-2">{quote.client.companyName}</div>
      <div className="flex items-center justify-between">
        <span className="text-mono text-sm font-semibold">{formatCLP(quote.total)}</span>
        <Avatar className="h-5 w-5">
          <AvatarFallback className="text-[9px] bg-primary/10 text-primary">{initials(quote.owner.name)}</AvatarFallback>
        </Avatar>
      </div>
    </Link>
  )
}
