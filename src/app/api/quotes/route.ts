import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { can } from '@/lib/permissions'
import { quoteSchema } from '@/server/validators'
import { createQuote, listQuotes } from '@/server/services/quoteService'

export async function GET(req: Request) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const result = await listQuotes({
    status: (searchParams.get('status') as any) || undefined,
    ownerId: searchParams.get('ownerId') || undefined,
    clientId: searchParams.get('clientId') || undefined,
    search: searchParams.get('search') || undefined,
    take: parseInt(searchParams.get('take') || '50', 10),
    skip: parseInt(searchParams.get('skip') || '0', 10),
  })

  return NextResponse.json(result)
}

export async function POST(req: Request) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
  if (!can(session.role, 'quotes:write')) return NextResponse.json({ error: 'Sin permiso' }, { status: 403 })

  try {
    const body = await req.json()
    const data = quoteSchema.parse(body)
    const quote = await createQuote(data, session.userId)
    return NextResponse.json({ quote })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Error' }, { status: 400 })
  }
}
