import { prisma } from '@/lib/prisma'
import type { Prisma, QuoteStatus, PipelineStage } from '@prisma/client'
import { calculateQuoteTotals, type CostInputs } from '@/lib/quote-calc'

export { calculateQuoteTotals }
export type { CostInputs }

export async function generateQuoteCode(): Promise<string> {
  const year = new Date().getFullYear()
  const prefix = `COT-${year}-`
  const last = await prisma.quote.findFirst({
    where: { code: { startsWith: prefix } },
    orderBy: { code: 'desc' },
    select: { code: true },
  })
  const lastNum = last ? parseInt(last.code.split('-')[2], 10) : 0
  return `${prefix}${String(lastNum + 1).padStart(4, '0')}`
}

export async function createQuote(input: any, userId: string) {
  const totals = calculateQuoteTotals(input)
  const code = await generateQuoteCode()

  return prisma.$transaction(async (tx) => {
    const quote = await tx.quote.create({
      data: {
        code,
        clientId: input.clientId,
        ownerId: userId,
        status: input.status,
        pipelineStage: input.pipelineStage,
        expirationDate: input.expirationDate ? new Date(input.expirationDate) : null,
        workType: input.workType,
        ductType: input.ductType,
        linearMeters: input.linearMeters,
        material: input.material,
        thickness: input.thickness,
        installationType: input.installationType,
        requiresLabor: input.requiresLabor,
        equipmentNeeded: input.equipmentNeeded,
        technicalNotes: input.technicalNotes,
        materialsCost: input.materialsCost,
        laborCost: input.laborCost,
        transportCost: input.transportCost,
        equipmentCost: input.equipmentCost,
        indirectCost: input.indirectCost,
        marginPercent: input.marginPercent,
        taxRate: input.taxRate,
        subtotal: totals.subtotal,
        taxAmount: totals.taxAmount,
        total: totals.total,
        closingProbability: input.closingProbability,
        competitorInfo: input.competitorInfo,
        nextFollowUpDate: input.nextFollowUpDate ? new Date(input.nextFollowUpDate) : null,
        commercialNotes: input.commercialNotes,
      },
    })

    await tx.quoteStatusHistory.create({
      data: { quoteId: quote.id, toStatus: input.status, userId, comment: 'Cotización creada' },
    })

    await tx.activityLog.create({
      data: { userId, action: 'quote.create', entityType: 'QUOTE', entityId: quote.id, metadata: { code: quote.code } },
    })

    return quote
  })
}

export async function updateQuote(id: string, input: any, userId: string) {
  const current = await prisma.quote.findUnique({ where: { id } })
  if (!current) throw new Error('Cotización no encontrada')

  const totals = calculateQuoteTotals(input)
  const statusChanged = current.status !== input.status

  return prisma.$transaction(async (tx) => {
    const quote = await tx.quote.update({
      where: { id },
      data: {
        clientId: input.clientId,
        status: input.status,
        pipelineStage: input.pipelineStage,
        expirationDate: input.expirationDate ? new Date(input.expirationDate) : null,
        workType: input.workType,
        ductType: input.ductType,
        linearMeters: input.linearMeters,
        material: input.material,
        thickness: input.thickness,
        installationType: input.installationType,
        requiresLabor: input.requiresLabor,
        equipmentNeeded: input.equipmentNeeded,
        technicalNotes: input.technicalNotes,
        materialsCost: input.materialsCost,
        laborCost: input.laborCost,
        transportCost: input.transportCost,
        equipmentCost: input.equipmentCost,
        indirectCost: input.indirectCost,
        marginPercent: input.marginPercent,
        taxRate: input.taxRate,
        subtotal: totals.subtotal,
        taxAmount: totals.taxAmount,
        total: totals.total,
        closingProbability: input.closingProbability,
        competitorInfo: input.competitorInfo,
        nextFollowUpDate: input.nextFollowUpDate ? new Date(input.nextFollowUpDate) : null,
        commercialNotes: input.commercialNotes,
      },
    })

    if (statusChanged) {
      await tx.quoteStatusHistory.create({
        data: { quoteId: id, fromStatus: current.status, toStatus: input.status, userId },
      })
    }

    await tx.activityLog.create({
      data: { userId, action: 'quote.update', entityType: 'QUOTE', entityId: id },
    })

    return quote
  })
}

export async function updatePipelineStage(id: string, stage: PipelineStage, userId: string) {
  // Auto sincronizar status según stage
  const statusMap: Partial<Record<PipelineStage, QuoteStatus>> = {
    WON: 'WON',
    LOST: 'LOST',
    QUOTE_SENT: 'SENT',
    NEGOTIATION: 'IN_REVIEW',
    FOLLOW_UP: 'FOLLOW_UP',
  }
  const current = await prisma.quote.findUnique({ where: { id } })
  if (!current) throw new Error('Cotización no encontrada')

  const newStatus = statusMap[stage] ?? current.status

  return prisma.$transaction(async (tx) => {
    const quote = await tx.quote.update({
      where: { id },
      data: { pipelineStage: stage, status: newStatus },
    })

    if (current.status !== newStatus) {
      await tx.quoteStatusHistory.create({
        data: { quoteId: id, fromStatus: current.status, toStatus: newStatus, userId, comment: `Movido a ${stage}` },
      })
    }

    // Si pasa a WON, crear proyecto automáticamente si no existe
    if (stage === 'WON' && current.pipelineStage !== 'WON') {
      const existing = await tx.project.findUnique({ where: { quoteId: id } })
      if (!existing) {
        const year = new Date().getFullYear()
        const lastProj = await tx.project.findFirst({
          where: { code: { startsWith: `PROJ-${year}-` } },
          orderBy: { code: 'desc' },
        })
        const num = lastProj ? parseInt(lastProj.code.split('-')[2], 10) : 0
        const client = await tx.client.findUnique({ where: { id: current.clientId } })
        await tx.project.create({
          data: {
            code: `PROJ-${year}-${String(num + 1).padStart(4, '0')}`,
            name: `Proyecto ${client?.companyName ?? ''} — ${current.code}`,
            quoteId: id,
            clientId: current.clientId,
            managerId: userId,
            budgetTotal: current.total,
          },
        })
        await tx.notification.create({
          data: {
            userId,
            type: 'project_created',
            title: 'Proyecto creado automáticamente',
            body: `La cotización ${current.code} fue convertida en proyecto`,
          },
        })
      }
    }

    return quote
  })
}

export async function deleteQuote(id: string, userId: string) {
  await prisma.$transaction(async (tx) => {
    await tx.quote.delete({ where: { id } })
    await tx.activityLog.create({
      data: { userId, action: 'quote.delete', entityType: 'QUOTE', entityId: id },
    })
  })
}

export async function duplicateQuote(id: string, userId: string) {
  const orig = await prisma.quote.findUnique({ where: { id }, include: { items: true } })
  if (!orig) throw new Error('Cotización no encontrada')

  const code = await generateQuoteCode()
  return prisma.quote.create({
    data: {
      code,
      clientId: orig.clientId,
      ownerId: userId,
      status: 'DRAFT',
      pipelineStage: 'NEW_LEAD',
      workType: orig.workType,
      ductType: orig.ductType,
      linearMeters: orig.linearMeters,
      material: orig.material,
      thickness: orig.thickness,
      installationType: orig.installationType,
      requiresLabor: orig.requiresLabor,
      equipmentNeeded: orig.equipmentNeeded,
      technicalNotes: orig.technicalNotes,
      materialsCost: orig.materialsCost,
      laborCost: orig.laborCost,
      transportCost: orig.transportCost,
      equipmentCost: orig.equipmentCost,
      indirectCost: orig.indirectCost,
      marginPercent: orig.marginPercent,
      taxRate: orig.taxRate,
      subtotal: orig.subtotal,
      taxAmount: orig.taxAmount,
      total: orig.total,
      items: {
        create: orig.items.map((it) => ({
          description: it.description,
          quantity: it.quantity,
          unit: it.unit,
          unitPrice: it.unitPrice,
          total: it.total,
          order: it.order,
        })),
      },
    },
  })
}

export async function listQuotes(filters: {
  status?: QuoteStatus
  ownerId?: string
  clientId?: string
  search?: string
  take?: number
  skip?: number
}) {
  const where: Prisma.QuoteWhereInput = {}
  if (filters.status) where.status = filters.status
  if (filters.ownerId) where.ownerId = filters.ownerId
  if (filters.clientId) where.clientId = filters.clientId
  if (filters.search) {
    where.OR = [
      { code: { contains: filters.search, mode: 'insensitive' } },
      { client: { companyName: { contains: filters.search, mode: 'insensitive' } } },
    ]
  }

  const [items, total] = await Promise.all([
    prisma.quote.findMany({
      where,
      include: {
        client: { select: { id: true, companyName: true } },
        owner: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: filters.take ?? 50,
      skip: filters.skip ?? 0,
    }),
    prisma.quote.count({ where }),
  ])
  return { items, total }
}
