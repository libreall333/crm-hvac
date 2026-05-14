import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { can } from '@/lib/permissions'
import { projectSchema } from '@/server/validators'

export async function GET(req: Request) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const status = searchParams.get('status') as any
  const where: any = {}
  if (status) where.status = status

  const projects = await prisma.project.findMany({
    where,
    include: {
      client: { select: { companyName: true } },
      manager: { select: { name: true } },
      quote: { select: { code: true } },
    },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json({ projects })
}

export async function POST(req: Request) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
  if (!can(session.role, 'projects:write')) return NextResponse.json({ error: 'Sin permiso' }, { status: 403 })

  try {
    const body = await req.json()
    const data = projectSchema.parse(body)

    const year = new Date().getFullYear()
    const lastProj = await prisma.project.findFirst({
      where: { code: { startsWith: `PROJ-${year}-` } },
      orderBy: { code: 'desc' },
    })
    const num = lastProj ? parseInt(lastProj.code.split('-')[2], 10) : 0

    const project = await prisma.project.create({
      data: {
        code: `PROJ-${year}-${String(num + 1).padStart(4, '0')}`,
        name: data.name,
        clientId: data.clientId,
        managerId: data.managerId,
        quoteId: data.quoteId,
        status: data.status,
        startDate: data.startDate ? new Date(data.startDate) : null,
        endDate: data.endDate ? new Date(data.endDate) : null,
        progressPercent: data.progressPercent,
        budgetTotal: data.budgetTotal,
        notes: data.notes,
      },
    })
    return NextResponse.json({ project })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 })
  }
}
