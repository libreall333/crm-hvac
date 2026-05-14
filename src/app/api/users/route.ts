import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { can } from '@/lib/permissions'
import { hashPassword } from '@/lib/auth'
import { userSchema } from '@/server/validators'

export async function GET() {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

  const users = await prisma.user.findMany({
    select: { id: true, email: true, name: true, role: true, isActive: true, createdAt: true },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json({ users })
}

export async function POST(req: Request) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
  if (!can(session.role, 'users:manage')) return NextResponse.json({ error: 'Sin permiso' }, { status: 403 })

  try {
    const body = await req.json()
    const data = userSchema.parse(body)
    if (!data.password) return NextResponse.json({ error: 'Contraseña requerida' }, { status: 400 })

    const user = await prisma.user.create({
      data: {
        email: data.email.toLowerCase(),
        name: data.name,
        role: data.role,
        isActive: data.isActive,
        passwordHash: await hashPassword(data.password),
      },
      select: { id: true, email: true, name: true, role: true, isActive: true },
    })
    return NextResponse.json({ user })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 })
  }
}
