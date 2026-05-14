import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { can } from '@/lib/permissions'
import { projectSchema } from '@/server/validators'

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

  const project = await prisma.project.findUnique({
    where: { id: params.id },
    include: {
      client: true,
      manager: { select: { id: true, name: true } },
      quote: true,
      costs: { orderBy: { date: 'desc' } },
      milestones: { orderBy: { order: 'asc' } },
    },
  })
  if (!project) return NextResponse.json({ error: 'No encontrado' }, { status: 404 })
  return NextResponse.json({ project })
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
  if (!can(session.role, 'projects:write')) return NextResponse.json({ error: 'Sin permiso' }, { status: 403 })

  try {
    const body = await req.json()
    const data = projectSchema.partial().parse(body)
    const project = await prisma.project.update({
      where: { id: params.id },
      data: {
        ...data,
        startDate: data.startDate ? new Date(data.startDate) : undefined,
        endDate: data.endDate ? new Date(data.endDate) : undefined,
      },
    })
    return NextResponse.json({ project })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 })
  }
}
