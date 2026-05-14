import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { getDashboardMetrics } from '@/server/services/dashboardService'

export async function GET() {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

  const data = await getDashboardMetrics()
  return NextResponse.json(data)
}
