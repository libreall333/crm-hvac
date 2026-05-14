import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { followUpSchema } from '@/server/validators'

export async function GET(req: Request) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const where: any = {}
  if (searchParams.get('mine') === 'true') where.userId = session.userId
  if (searchParams.get('pending') === 'true') where.outcome = 'PENDING'

  const followUps = await prisma.followUp.findMany({
    where,
    include: {
      quote: { include: { client: { select: { companyName: true } } } },
      user: { select: { name: true } },
    },
    orderBy: { scheduledAt: 'asc' },
  })
  return NextResponse.json({ followUps })
}

export async function POST(req: Request) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

  try {
    const body = await req.json()
    const data = followUpSchema.parse(body)
    const followUp = await prisma.followUp.create({
      data: {
        quoteId: data.quoteId || null,
        type: data.type,
        scheduledAt: new Date(data.scheduledAt),
        notes: data.notes,
        userId: session.userId,
      },
    })
    return NextResponse.json({ followUp })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 })
  }
}
