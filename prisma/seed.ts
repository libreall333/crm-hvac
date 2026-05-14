import { PrismaClient, Role, ClientStatus, QuoteStatus, PipelineStage, FollowUpType, ProjectStatus } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Limpiar
  await prisma.activityLog.deleteMany()
  await prisma.notification.deleteMany()
  await prisma.comment.deleteMany()
  await prisma.attachment.deleteMany()
  await prisma.projectMilestone.deleteMany()
  await prisma.projectCost.deleteMany()
  await prisma.project.deleteMany()
  await prisma.followUp.deleteMany()
  await prisma.quoteStatusHistory.deleteMany()
  await prisma.quoteItem.deleteMany()
  await prisma.quote.deleteMany()
  await prisma.clientTag.deleteMany()
  await prisma.tag.deleteMany()
  await prisma.client.deleteMany()
  await prisma.user.deleteMany()
  await prisma.companySettings.deleteMany()

  // Empresa
  await prisma.companySettings.create({
    data: {
      id: 'singleton',
      companyName: 'Ductos & Climatización SpA',
      rut: '76.123.456-7',
      address: 'Av. Industrial 4521, Quilicura',
      phone: '+56 2 2345 6789',
      email: 'contacto@ductos-cl.cl',
      taxRate: 19,
      currency: 'CLP',
    },
  })

  // Usuarios
  const passwordHash = await bcrypt.hash('demo1234', 10)

  const admin = await prisma.user.create({
    data: {
      email: 'admin@hvac.cl',
      passwordHash,
      name: 'Carolina Rojas',
      role: Role.ADMIN,
    },
  })

  const sales1 = await prisma.user.create({
    data: {
      email: 'ventas@hvac.cl',
      passwordHash,
      name: 'Felipe Soto',
      role: Role.SALES,
    },
  })

  const sales2 = await prisma.user.create({
    data: {
      email: 'comercial@hvac.cl',
      passwordHash,
      name: 'Daniela Pérez',
      role: Role.SALES,
    },
  })

  const ops = await prisma.user.create({
    data: {
      email: 'operaciones@hvac.cl',
      passwordHash,
      name: 'Mauricio Vega',
      role: Role.OPERATIONS,
    },
  })

  // Tags
  const tagVip = await prisma.tag.create({ data: { name: 'VIP', color: '#F59E0B' } })
  const tagIndustrial = await prisma.tag.create({ data: { name: 'Industrial', color: '#3B82F6' } })
  const tagRetail = await prisma.tag.create({ data: { name: 'Retail', color: '#10B981' } })
  const tagRecurrente = await prisma.tag.create({ data: { name: 'Recurrente', color: '#8B5CF6' } })

  // Clientes
  const clients = await Promise.all([
    prisma.client.create({
      data: {
        companyName: 'Constructora Andes Ltda.',
        rut: '76.543.210-K',
        businessActivity: 'Construcción industrial',
        address: 'Av. Las Condes 12300',
        city: 'Santiago',
        region: 'Metropolitana',
        mainContactName: 'Ricardo Fuentes',
        phone: '+56 9 8765 4321',
        email: 'rfuentes@andes.cl',
        status: ClientStatus.ACTIVE,
        ownerId: sales1.id,
        tags: { create: [{ tagId: tagVip.id }, { tagId: tagIndustrial.id }] },
      },
    }),
    prisma.client.create({
      data: {
        companyName: 'Supermercados Líder Sur',
        rut: '96.500.220-1',
        businessActivity: 'Retail alimentos',
        address: 'Camino Internacional 850',
        city: 'Rancagua',
        region: 'O\'Higgins',
        mainContactName: 'Patricia Morales',
        phone: '+56 9 5432 1098',
        email: 'pmorales@lidersur.cl',
        status: ClientStatus.ACTIVE,
        ownerId: sales2.id,
        tags: { create: [{ tagId: tagRetail.id }, { tagId: tagRecurrente.id }] },
      },
    }),
    prisma.client.create({
      data: {
        companyName: 'Minera Cerro Verde',
        rut: '77.890.123-4',
        businessActivity: 'Minería del cobre',
        address: 'Ruta 5 Norte Km 1490',
        city: 'Antofagasta',
        region: 'Antofagasta',
        mainContactName: 'Jorge Ramírez',
        phone: '+56 9 7654 3210',
        email: 'jramirez@cerroverde.cl',
        status: ClientStatus.ACTIVE,
        ownerId: sales1.id,
        tags: { create: [{ tagId: tagVip.id }, { tagId: tagIndustrial.id }] },
      },
    }),
    prisma.client.create({
      data: {
        companyName: 'Clínica Vida Plena',
        rut: '78.234.567-8',
        businessActivity: 'Salud privada',
        address: 'Av. Providencia 2330',
        city: 'Santiago',
        region: 'Metropolitana',
        mainContactName: 'Andrea Cortés',
        phone: '+56 2 2987 6543',
        email: 'acortes@vidaplena.cl',
        status: ClientStatus.PROSPECT,
        ownerId: sales2.id,
        tags: { create: [{ tagId: tagIndustrial.id }] },
      },
    }),
    prisma.client.create({
      data: {
        companyName: 'Bodegas del Pacífico',
        rut: '79.345.678-9',
        businessActivity: 'Logística',
        address: 'Camino a Valparaíso 4500',
        city: 'Valparaíso',
        region: 'Valparaíso',
        mainContactName: 'Sebastián Vidal',
        phone: '+56 9 3210 9876',
        email: 'svidal@bodegaspacifico.cl',
        status: ClientStatus.ACTIVE,
        ownerId: sales1.id,
        tags: { create: [{ tagId: tagRetail.id }] },
      },
    }),
    prisma.client.create({
      data: {
        companyName: 'Hotel Cordillera',
        rut: '76.987.654-3',
        businessActivity: 'Hotelería',
        address: 'Av. Apoquindo 5600',
        city: 'Santiago',
        region: 'Metropolitana',
        mainContactName: 'Camila Tapia',
        phone: '+56 9 1234 5678',
        email: 'ctapia@hotelcordillera.cl',
        status: ClientStatus.PROSPECT,
        ownerId: sales2.id,
      },
    }),
  ])

  // Cotizaciones con diversidad de estados
  const quoteData = [
    {
      client: clients[0],
      stage: PipelineStage.WON,
      status: QuoteStatus.WON,
      workType: 'Instalación nueva',
      ductType: 'Galvanizado',
      meters: 850,
      materials: 8500000,
      labor: 4200000,
      margin: 22,
      probability: 100,
    },
    {
      client: clients[1],
      stage: PipelineStage.NEGOTIATION,
      status: QuoteStatus.IN_REVIEW,
      workType: 'Mantención',
      ductType: 'Flexible',
      meters: 420,
      materials: 2800000,
      labor: 1900000,
      margin: 25,
      probability: 70,
    },
    {
      client: clients[2],
      stage: PipelineStage.QUOTE_SENT,
      status: QuoteStatus.SENT,
      workType: 'Instalación nueva',
      ductType: 'Acero inoxidable',
      meters: 1200,
      materials: 18500000,
      labor: 7200000,
      margin: 28,
      probability: 60,
    },
    {
      client: clients[3],
      stage: PipelineStage.CONTACTED,
      status: QuoteStatus.DRAFT,
      workType: 'Climatización integral',
      ductType: 'Galvanizado',
      meters: 600,
      materials: 6200000,
      labor: 3100000,
      margin: 20,
      probability: 40,
    },
    {
      client: clients[4],
      stage: PipelineStage.FOLLOW_UP,
      status: QuoteStatus.FOLLOW_UP,
      workType: 'Reparación',
      ductType: 'Fibra mineral',
      meters: 180,
      materials: 950000,
      labor: 720000,
      margin: 30,
      probability: 55,
    },
    {
      client: clients[0],
      stage: PipelineStage.WON,
      status: QuoteStatus.APPROVED,
      workType: 'Ampliación',
      ductType: 'Galvanizado',
      meters: 320,
      materials: 3400000,
      labor: 1800000,
      margin: 23,
      probability: 100,
    },
    {
      client: clients[5],
      stage: PipelineStage.NEW_LEAD,
      status: QuoteStatus.DRAFT,
      workType: 'Instalación nueva',
      ductType: 'Acero inoxidable',
      meters: 540,
      materials: 7100000,
      labor: 3600000,
      margin: 25,
      probability: 30,
    },
    {
      client: clients[2],
      stage: PipelineStage.LOST,
      status: QuoteStatus.LOST,
      workType: 'Mantención',
      ductType: 'Galvanizado',
      meters: 280,
      materials: 1800000,
      labor: 1200000,
      margin: 18,
      probability: 0,
    },
  ]

  const owners = [sales1, sales2]
  const year = new Date().getFullYear()
  const quotes = []

  for (let i = 0; i < quoteData.length; i++) {
    const d = quoteData[i]
    const transport = Math.round(d.materials * 0.04)
    const equipment = Math.round(d.materials * 0.08)
    const indirect = Math.round((d.materials + d.labor) * 0.05)
    const baseTotal = d.materials + d.labor + transport + equipment + indirect
    const subtotal = Math.round(baseTotal * (1 + d.margin / 100))
    const tax = Math.round(subtotal * 0.19)
    const total = subtotal + tax

    const issueDate = new Date()
    issueDate.setDate(issueDate.getDate() - Math.floor(Math.random() * 60))

    const expirationDate = new Date(issueDate)
    expirationDate.setDate(expirationDate.getDate() + 30)

    const owner = owners[i % owners.length]
    const code = `COT-${year}-${String(i + 1).padStart(4, '0')}`

    const quote = await prisma.quote.create({
      data: {
        code,
        clientId: d.client.id,
        ownerId: owner.id,
        status: d.status,
        pipelineStage: d.stage,
        issueDate,
        expirationDate,
        workType: d.workType,
        ductType: d.ductType,
        linearMeters: d.meters,
        material: d.ductType,
        thickness: '0.6 mm',
        installationType: 'Aérea con soportería',
        requiresLabor: true,
        equipmentNeeded: 'Andamios, herramientas eléctricas',
        technicalNotes: `Instalación en altura. Coordinar acceso con cliente.`,
        materialsCost: d.materials,
        laborCost: d.labor,
        transportCost: transport,
        equipmentCost: equipment,
        indirectCost: indirect,
        marginPercent: d.margin,
        subtotal,
        taxRate: 19,
        taxAmount: tax,
        total,
        closingProbability: d.probability,
        lastContactDate: new Date(issueDate.getTime() + 1000 * 60 * 60 * 24 * 3),
        nextFollowUpDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * (Math.random() * 14 - 2)),
        commercialNotes: 'Cliente solicita propuesta detallada con cronograma.',
        items: {
          create: [
            { description: `Ductería ${d.ductType} ${d.meters}m`, quantity: d.meters, unit: 'm', unitPrice: Math.round(d.materials / d.meters), total: d.materials, order: 0 },
            { description: 'Mano de obra especializada', quantity: 1, unit: 'GL', unitPrice: d.labor, total: d.labor, order: 1 },
            { description: 'Transporte y logística', quantity: 1, unit: 'GL', unitPrice: transport, total: transport, order: 2 },
          ],
        },
        statusHistory: {
          create: { toStatus: d.status, userId: owner.id, comment: 'Cotización creada' },
        },
      },
    })
    quotes.push(quote)
  }

  // Seguimientos
  await prisma.followUp.createMany({
    data: [
      {
        quoteId: quotes[1].id,
        type: FollowUpType.CALL,
        scheduledAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 2),
        notes: 'Llamar para confirmar visita técnica',
        userId: sales2.id,
      },
      {
        quoteId: quotes[2].id,
        type: FollowUpType.MEETING,
        scheduledAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 5),
        notes: 'Reunión presencial con gerencia minera',
        userId: sales1.id,
      },
      {
        quoteId: quotes[4].id,
        type: FollowUpType.EMAIL,
        scheduledAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 1),
        notes: 'Enviar propuesta revisada',
        userId: sales1.id,
      },
      {
        quoteId: quotes[3].id,
        type: FollowUpType.WHATSAPP,
        scheduledAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1),
        notes: 'Confirmar recepción de cotización',
        userId: sales2.id,
      },
    ],
  })

  // Proyectos (de cotizaciones ganadas)
  await prisma.project.create({
    data: {
      code: 'PROJ-2026-0001',
      name: `Ductería Constructora Andes — Edificio Las Condes`,
      quoteId: quotes[0].id,
      clientId: quotes[0].clientId,
      managerId: ops.id,
      status: ProjectStatus.IN_PROGRESS,
      startDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 15),
      endDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 45),
      progressPercent: 35,
      budgetTotal: quotes[0].total,
      realCostTotal: Number(quotes[0].total) * 0.32,
      notes: 'Avanzando según cronograma. Próximo hito: instalación piso 5.',
      milestones: {
        create: [
          { title: 'Levantamiento técnico', description: 'Mediciones en sitio', completedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 14), order: 0 },
          { title: 'Fabricación ductería', completedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7), order: 1 },
          { title: 'Instalación piso 1-4', dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 10), order: 2 },
          { title: 'Instalación piso 5-8', dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 25), order: 3 },
          { title: 'Pruebas y entrega', dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 45), order: 4 },
        ],
      },
      costs: {
        create: [
          { category: 'Materiales', description: 'Plancha galvanizada lote 1', amount: 3200000, date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 12) },
          { category: 'Mano de obra', description: 'Semanas 1-2', amount: 1800000, date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7) },
          { category: 'Transporte', description: 'Flete materiales', amount: 280000, date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10) },
        ],
      },
    },
  })

  await prisma.project.create({
    data: {
      code: 'PROJ-2026-0002',
      name: 'Ampliación Constructora Andes — Torre B',
      quoteId: quotes[5].id,
      clientId: quotes[5].clientId,
      managerId: ops.id,
      status: ProjectStatus.PLANNING,
      startDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 10),
      endDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 60),
      progressPercent: 5,
      budgetTotal: quotes[5].total,
      realCostTotal: 0,
      notes: 'Planificación inicial. Pendiente confirmar fecha de inicio.',
    },
  })

  // Notificaciones
  await prisma.notification.createMany({
    data: [
      { userId: sales1.id, type: 'follow_up', title: 'Seguimiento pendiente', body: 'Cotización COT-2026-0003 requiere contacto hoy', link: `/quotes/${quotes[2].id}` },
      { userId: sales2.id, type: 'expiring', title: 'Cotización por vencer', body: 'COT-2026-0002 vence en 3 días', link: `/quotes/${quotes[1].id}` },
      { userId: admin.id, type: 'won', title: '¡Cotización ganada!', body: 'Constructora Andes aprobó COT-2026-0001', link: `/quotes/${quotes[0].id}` },
    ],
  })

  console.log('✅ Seed completado')
  console.log('\n📧 Credenciales de prueba:')
  console.log('   admin@hvac.cl       / demo1234  (Administrador)')
  console.log('   ventas@hvac.cl      / demo1234  (Ventas)')
  console.log('   comercial@hvac.cl   / demo1234  (Ventas)')
  console.log('   operaciones@hvac.cl / demo1234  (Operaciones)\n')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
