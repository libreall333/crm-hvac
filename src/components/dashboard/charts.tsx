'use client'

import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, AreaChart, Area, CartesianGrid } from 'recharts'
import { PIPELINE_STAGES } from '@/lib/status'
import { formatCLP } from '@/lib/utils'

export function PipelineChart({ data }: { data: { stage: string; count: number; total: number }[] }) {
  const chartData = PIPELINE_STAGES.map((s) => {
    const found = data.find((d) => d.stage === s.id)
    return { name: s.label.split(' ')[0], count: found?.count ?? 0, total: found?.total ?? 0, fill: s.color }
  })

  return (
    <div className="h-[220px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 10, right: 8, bottom: 0, left: -20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
          <XAxis dataKey="name" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
          <Tooltip
            cursor={{ fill: 'hsl(var(--accent))', opacity: 0.5 }}
            contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 6, fontSize: 11 }}
            formatter={(value: any, name: string, props: any) => [
              name === 'count' ? `${value} cotizaciones` : formatCLP(value),
              name === 'count' ? 'Cantidad' : 'Monto',
            ]}
          />
          <Bar dataKey="count" radius={[4, 4, 0, 0]} fill="hsl(var(--primary))" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

export function MonthlySalesChart({ data }: { data: { month: Date | string; total: number }[] }) {
  const chartData = data.map((d) => ({
    month: new Date(d.month).toLocaleDateString('es-CL', { month: 'short' }),
    total: d.total,
  }))

  return (
    <div className="h-[220px]">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 10, right: 8, bottom: 0, left: -10 }}>
          <defs>
            <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.4} />
              <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
          <XAxis dataKey="month" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
          <YAxis
            tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => `$${(v / 1000000).toFixed(0)}M`}
          />
          <Tooltip
            contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 6, fontSize: 11 }}
            formatter={(v: any) => formatCLP(v)}
          />
          <Area type="monotone" dataKey="total" stroke="hsl(var(--primary))" strokeWidth={2} fill="url(#colorTotal)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
