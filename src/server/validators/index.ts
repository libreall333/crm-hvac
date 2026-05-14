import { z } from 'zod'
import { QuoteStatus, PipelineStage, ClientStatus, FollowUpType, ProjectStatus, Role } from '@prisma/client'

export const clientSchema = z.object({
  companyName: z.string().min(2),
  rut: z.string().min(3),
  businessActivity: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  city: z.string().optional().nullable(),
  region: z.string().optional().nullable(),
  mainContactName: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  email: z.string().email().optional().nullable().or(z.literal('')),
  notes: z.string().optional().nullable(),
  status: z.nativeEnum(ClientStatus).default(ClientStatus.PROSPECT),
})

export const quoteSchema = z.object({
  clientId: z.string(),
  status: z.nativeEnum(QuoteStatus).default(QuoteStatus.DRAFT),
  pipelineStage: z.nativeEnum(PipelineStage).default(PipelineStage.NEW_LEAD),
  expirationDate: z.string().optional().nullable(),
  workType: z.string().optional().nullable(),
  ductType: z.string().optional().nullable(),
  linearMeters: z.coerce.number().optional().nullable(),
  material: z.string().optional().nullable(),
  thickness: z.string().optional().nullable(),
  installationType: z.string().optional().nullable(),
  requiresLabor: z.boolean().default(true),
  equipmentNeeded: z.string().optional().nullable(),
  technicalNotes: z.string().optional().nullable(),
  materialsCost: z.coerce.number().default(0),
  laborCost: z.coerce.number().default(0),
  transportCost: z.coerce.number().default(0),
  equipmentCost: z.coerce.number().default(0),
  indirectCost: z.coerce.number().default(0),
  marginPercent: z.coerce.number().default(20),
  taxRate: z.coerce.number().default(19),
  closingProbability: z.coerce.number().int().min(0).max(100).default(50),
  competitorInfo: z.string().optional().nullable(),
  nextFollowUpDate: z.string().optional().nullable(),
  commercialNotes: z.string().optional().nullable(),
})

export const followUpSchema = z.object({
  quoteId: z.string().optional().nullable(),
  type: z.nativeEnum(FollowUpType),
  scheduledAt: z.string(),
  notes: z.string().optional().nullable(),
})

export const projectSchema = z.object({
  name: z.string().min(2),
  clientId: z.string(),
  managerId: z.string(),
  quoteId: z.string().optional().nullable(),
  status: z.nativeEnum(ProjectStatus).default(ProjectStatus.PLANNING),
  startDate: z.string().optional().nullable(),
  endDate: z.string().optional().nullable(),
  progressPercent: z.coerce.number().int().min(0).max(100).default(0),
  budgetTotal: z.coerce.number().default(0),
  notes: z.string().optional().nullable(),
})

export const userSchema = z.object({
  email: z.string().email(),
  name: z.string().min(2),
  password: z.string().min(6).optional(),
  role: z.nativeEnum(Role).default(Role.SALES),
  isActive: z.boolean().default(true),
})
