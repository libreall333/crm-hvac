import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { updatePipelineStage } from '@/server/services/quoteService'
import type { PipelineStage } from '@prisma/client'

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

  try {
    const { stage } = await req.json()
    const quote = await updatePipelineStage(params.id, stage as PipelineStage, session.userId)
    return NextResponse.json({ quote })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 })
  }
}
