import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCLP(value: number | string | bigint | { toString(): string }): string {
  const n = typeof value === 'number' ? value : Number(value?.toString() ?? 0)
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    maximumFractionDigits: 0,
  }).format(n)
}

export function formatNumber(value: number | string | bigint | { toString(): string }): string {
  const n = typeof value === 'number' ? value : Number(value?.toString() ?? 0)
  return new Intl.NumberFormat('es-CL').format(n)
}

export function formatDate(date: Date | string | null | undefined, withTime = false): string {
  if (!date) return '—'
  const d = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat('es-CL', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    ...(withTime && { hour: '2-digit', minute: '2-digit' }),
  }).format(d)
}

export function relativeTime(date: Date | string | null | undefined): string {
  if (!date) return '—'
  const d = typeof date === 'string' ? new Date(date) : date
  const diff = d.getTime() - Date.now()
  const days = Math.round(diff / (1000 * 60 * 60 * 24))
  const rtf = new Intl.RelativeTimeFormat('es-CL', { numeric: 'auto' })
  if (Math.abs(days) < 1) {
    const hours = Math.round(diff / (1000 * 60 * 60))
    return rtf.format(hours, 'hour')
  }
  return rtf.format(days, 'day')
}

export function initials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0])
    .join('')
    .toUpperCase()
}

export function getInitialsColor(seed: string): string {
  const colors = ['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#14B8A6', '#F97316']
  let hash = 0
  for (let i = 0; i < seed.length; i++) hash = seed.charCodeAt(i) + ((hash << 5) - hash)
  return colors[Math.abs(hash) % colors.length]
}
