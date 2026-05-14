import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { can } from '@/lib/permissions'
import { clientSchema } from '@/server/validators'

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

  const client = await prisma.client.findUnique({
    where: { id: params.id },
    include: {
      owner: { select: { id: true, name: true } },
      tags: { include: { tag: true } },
      quotes: {
        orderBy: { createdAt: 'desc' },
        include: { owner: { select: { name: true } } },
      },
      projects: { orderBy: { createdAt: 'desc' } },
    },
  })

  if (!client) return NextResponse.json({ error: 'No encontrado' }, { status: 404 })
  return NextResponse.json({ client })
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
  if (!can(session.role, 'clients:write')) return NextResponse.json({ error: 'Sin permiso' }, { status: 403 })

  try {
    const body = await req.json()
    const data = clientSchema.partial().parse(body)
    const client = await prisma.client.update({
      where: { id: params.id },
      data: { ...data, email: data.email || null },
    })
    return NextResponse.json({ client })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 })
  }
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
  if (!can(session.role, 'clients:delete')) return NextResponse.json({ error: 'Sin permiso' }, { status: 403 })

  await prisma.client.delete({ where: { id: params.id } })
  return NextResponse.json({ ok: true })
}
