import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { can } from '@/lib/permissions'
import { clientSchema } from '@/server/validators'

export async function GET(req: Request) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const search = searchParams.get('search') || ''
  const status = searchParams.get('status') as any

  const where: any = {}
  if (search) {
    where.OR = [
      { companyName: { contains: search, mode: 'insensitive' } },
      { rut: { contains: search, mode: 'insensitive' } },
      { mainContactName: { contains: search, mode: 'insensitive' } },
    ]
  }
  if (status) where.status = status

  const clients = await prisma.client.findMany({
    where,
    include: {
      owner: { select: { id: true, name: true } },
      tags: { include: { tag: true } },
      _count: { select: { quotes: true, projects: true } },
    },
    orderBy: { updatedAt: 'desc' },
  })

  return NextResponse.json({ clients })
}

export async function POST(req: Request) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
  if (!can(session.role, 'clients:write')) return NextResponse.json({ error: 'Sin permiso' }, { status: 403 })

  try {
    const body = await req.json()
    const data = clientSchema.parse(body)

    const client = await prisma.client.create({
      data: {
        ...data,
        email: data.email || null,
        ownerId: session.userId,
      },
    })

    await prisma.activityLog.create({
      data: { userId: session.userId, action: 'client.create', entityType: 'CLIENT', entityId: client.id },
    })

    return NextResponse.json({ client })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Error' }, { status: 400 })
  }
}
