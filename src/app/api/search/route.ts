import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

export async function GET(req: Request) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const q = searchParams.get('q') || ''
  if (!q || q.length < 2) return NextResponse.json({ results: [] })

  const [quotes, clients, projects] = await Promise.all([
    prisma.quote.findMany({
      where: { OR: [{ code: { contains: q, mode: 'insensitive' } }, { client: { companyName: { contains: q, mode: 'insensitive' } } }] },
      include: { client: { select: { companyName: true } } },
      take: 5,
    }),
    prisma.client.findMany({
      where: { OR: [{ companyName: { contains: q, mode: 'insensitive' } }, { rut: { contains: q, mode: 'insensitive' } }] },
      take: 5,
    }),
    prisma.project.findMany({
      where: { OR: [{ name: { contains: q, mode: 'insensitive' } }, { code: { contains: q, mode: 'insensitive' } }] },
      include: { client: { select: { companyName: true } } },
      take: 5,
    }),
  ])

  const results = [
    ...quotes.map((q) => ({ type: 'quote', id: q.id, title: `${q.code} — ${q.client.companyName}`, subtitle: q.status })),
    ...clients.map((c) => ({ type: 'client', id: c.id, title: c.companyName, subtitle: c.rut })),
    ...projects.map((p) => ({ type: 'project', id: p.id, title: `${p.code} — ${p.name}`, subtitle: p.client.companyName })),
  ]
  return NextResponse.json({ results })
}
