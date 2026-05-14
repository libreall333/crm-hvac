import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { can } from '@/lib/permissions'
import { quoteSchema } from '@/server/validators'
import { updateQuote, deleteQuote, duplicateQuote } from '@/server/services/quoteService'

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

  const quote = await prisma.quote.findUnique({
    where: { id: params.id },
    include: {
      client: true,
      owner: { select: { id: true, name: true, email: true } },
      items: { orderBy: { order: 'asc' } },
      statusHistory: {
        orderBy: { changedAt: 'desc' },
        include: { user: { select: { name: true } } },
      },
      followUps: {
        orderBy: { scheduledAt: 'desc' },
        include: { user: { select: { name: true } } },
      },
      project: true,
    },
  })

  if (!quote) return NextResponse.json({ error: 'No encontrado' }, { status: 404 })
  return NextResponse.json({ quote })
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
  if (!can(session.role, 'quotes:write')) return NextResponse.json({ error: 'Sin permiso' }, { status: 403 })

  try {
    const body = await req.json()
    const data = quoteSchema.parse(body)
    const quote = await updateQuote(params.id, data, session.userId)
    return NextResponse.json({ quote })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 })
  }
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
  if (!can(session.role, 'quotes:delete')) return NextResponse.json({ error: 'Sin permiso' }, { status: 403 })

  await deleteQuote(params.id, session.userId)
  return NextResponse.json({ ok: true })
}

export async function POST(req: Request, { params }: { params: { id: string } }) {
  // Acción duplicar
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  if (searchParams.get('action') === 'duplicate') {
    const quote = await duplicateQuote(params.id, session.userId)
    return NextResponse.json({ quote })
  }
  return NextResponse.json({ error: 'Acción inválida' }, { status: 400 })
}
