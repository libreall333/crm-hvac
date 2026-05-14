import type { QuoteStatus, PipelineStage, ProjectStatus, ClientStatus, FollowUpType } from '@prisma/client'

export const QUOTE_STATUS_LABELS: Record<QuoteStatus, string> = {
  DRAFT: 'Borrador',
  SENT: 'Enviada',
  IN_REVIEW: 'En revisión',
  APPROVED: 'Aprobada',
  REJECTED: 'Rechazada',
  PENDING: 'Pendiente',
  FOLLOW_UP: 'Seguimiento',
  WON: 'Ganada',
  LOST: 'Perdida',
}

export const QUOTE_STATUS_VARIANT: Record<QuoteStatus, 'default' | 'primary' | 'success' | 'warning' | 'destructive' | 'muted' | 'outline'> = {
  DRAFT: 'muted',
  SENT: 'primary',
  IN_REVIEW: 'primary',
  APPROVED: 'success',
  REJECTED: 'destructive',
  PENDING: 'warning',
  FOLLOW_UP: 'warning',
  WON: 'success',
  LOST: 'destructive',
}

export const PIPELINE_STAGES: { id: PipelineStage; label: string; color: string }[] = [
  { id: 'NEW_LEAD', label: 'Nuevo Lead', color: '#64748B' },
  { id: 'CONTACTED', label: 'Contactado', color: '#3B82F6' },
  { id: 'QUOTE_SENT', label: 'Cotización Enviada', color: '#8B5CF6' },
  { id: 'FOLLOW_UP', label: 'Seguimiento', color: '#F59E0B' },
  { id: 'NEGOTIATION', label: 'Negociación', color: '#EC4899' },
  { id: 'WON', label: 'Ganada', color: '#10B981' },
  { id: 'LOST', label: 'Perdida', color: '#EF4444' },
]

export const PROJECT_STATUS_LABELS: Record<ProjectStatus, string> = {
  PLANNING: 'Planificación',
  IN_PROGRESS: 'En ejecución',
  PAUSED: 'Pausado',
  COMPLETED: 'Finalizado',
  INVOICED: 'Facturado',
}

export const PROJECT_STATUS_VARIANT: Record<ProjectStatus, 'default' | 'primary' | 'success' | 'warning' | 'destructive' | 'muted' | 'outline'> = {
  PLANNING: 'muted',
  IN_PROGRESS: 'primary',
  PAUSED: 'warning',
  COMPLETED: 'success',
  INVOICED: 'success',
}

export const CLIENT_STATUS_LABELS: Record<ClientStatus, string> = {
  PROSPECT: 'Prospecto',
  ACTIVE: 'Activo',
  INACTIVE: 'Inactivo',
}

export const CLIENT_STATUS_VARIANT: Record<ClientStatus, 'default' | 'primary' | 'success' | 'warning' | 'destructive' | 'muted' | 'outline'> = {
  PROSPECT: 'warning',
  ACTIVE: 'success',
  INACTIVE: 'muted',
}

export const FOLLOWUP_TYPE_LABELS: Record<FollowUpType, string> = {
  CALL: 'Llamada',
  EMAIL: 'Email',
  MEETING: 'Reunión',
  WHATSAPP: 'WhatsApp',
  OTHER: 'Otro',
}

export const ROLE_LABELS = {
  ADMIN: 'Administrador',
  SALES: 'Ventas',
  OPERATIONS: 'Operaciones',
  MANAGEMENT: 'Gerencia',
} as const
