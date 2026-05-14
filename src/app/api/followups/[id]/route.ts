import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

  const body = await req.json()
  const followUp = await prisma.followUp.update({
    where: { id: params.id },
    data: {
      outcome: body.outcome,
      completedAt: body.outcome === 'COMPLETED' ? new Date() : null,
      notes: body.notes,
    },
  })
  return NextResponse.json({ followUp })
}
