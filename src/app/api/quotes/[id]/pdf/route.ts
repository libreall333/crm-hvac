import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const session = await getSession()
  if (!session) return new Response('No autenticado', { status: 401 })

  const [quote, settings] = await Promise.all([
    prisma.quote.findUnique({
      where: { id: params.id },
      include: {
        client: true,
        owner: { select: { name: true, email: true } },
        items: { orderBy: { order: 'asc' } },
      },
    }),
    prisma.companySettings.findUnique({ where: { id: 'singleton' } }),
  ])

  if (!quote) return new Response('No encontrado', { status: 404 })

  const fmt = (n: any) => new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(Number(n))
  const date = (d: Date | null | undefined) => d ? new Intl.DateTimeFormat('es-CL', { day: '2-digit', month: 'long', year: 'numeric' }).format(new Date(d)) : '—'

  const html = `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8" />
<title>Cotización ${quote.code}</title>
<style>
  @page { size: A4; margin: 18mm 16mm; }
  * { box-sizing: border-box; }
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #0a0a0b; font-size: 11px; line-height: 1.5; margin: 0; padding: 24px; max-width: 800px; margin: 0 auto; background: white; }
  .mono { font-family: 'SFMono-Regular', 'JetBrains Mono', Menlo, Consolas, monospace; }
  .header { display: flex; justify-content: space-between; align-items: flex-start; padding-bottom: 24px; border-bottom: 2px solid #0a0a0b; }
  .brand { font-size: 18px; font-weight: 700; letter-spacing: -0.02em; }
  .brand-sub { font-size: 9px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.15em; margin-top: 4px; }
  .meta { text-align: right; font-size: 10px; color: #4b5563; }
  .meta strong { color: #0a0a0b; }
  .doc-title { font-size: 28px; font-weight: 600; letter-spacing: -0.02em; margin: 24px 0 4px; }
  .doc-code { font-size: 13px; color: #6b7280; }
  .section { margin-top: 28px; }
  .section-title { font-size: 9px; text-transform: uppercase; letter-spacing: 0.2em; color: #6b7280; font-weight: 600; margin-bottom: 12px; padding-bottom: 6px; border-bottom: 1px solid #e5e7eb; }
  .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 12px 32px; }
  .field { }
  .field-label { font-size: 9px; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 2px; }
  .field-value { font-size: 12px; font-weight: 500; }
  table { width: 100%; border-collapse: collapse; margin-top: 8px; }
  thead th { text-align: left; font-size: 9px; text-transform: uppercase; letter-spacing: 0.15em; color: #6b7280; padding: 8px 6px; border-bottom: 1.5px solid #0a0a0b; font-weight: 600; }
  thead th.right { text-align: right; }
  tbody td { padding: 10px 6px; border-bottom: 1px solid #e5e7eb; font-size: 11px; }
  tbody td.right { text-align: right; }
  .totals { margin-top: 16px; margin-left: auto; width: 300px; }
  .totals .row { display: flex; justify-content: space-between; padding: 4px 0; font-size: 11px; }
  .totals .row.subtotal { padding-top: 10px; border-top: 1px solid #e5e7eb; }
  .totals .row.total { padding: 12px 0 6px; border-top: 2px solid #0a0a0b; font-size: 16px; font-weight: 700; margin-top: 6px; }
  .totals .row .label { color: #6b7280; }
  .totals .row.total .label { color: #0a0a0b; text-transform: uppercase; letter-spacing: 0.08em; font-size: 10px; }
  .notes { background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 6px; padding: 14px; font-size: 11px; white-space: pre-wrap; margin-top: 8px; }
  .footer { margin-top: 48px; padding-top: 24px; border-top: 1px solid #e5e7eb; font-size: 9px; color: #9ca3af; text-align: center; line-height: 1.6; }
  .footer strong { color: #4b5563; }
  .print-btn { position: fixed; top: 20px; right: 20px; padding: 10px 16px; background: #0a0a0b; color: white; border: 0; border-radius: 6px; font-size: 12px; cursor: pointer; font-weight: 500; }
  @media print { .print-btn { display: none; } body { padding: 0; } }
</style>
</head>
<body>
  <button class="print-btn" onclick="window.print()">📄 Imprimir / Guardar PDF</button>

  <div class="header">
    <div>
      <div class="brand">${settings?.companyName ?? 'Ductos & Climatización SpA'}</div>
      <div class="brand-sub">Ductería · Climatización · HVAC</div>
    </div>
    <div class="meta">
      ${settings?.rut ? `<div><strong>RUT:</strong> <span class="mono">${settings.rut}</span></div>` : ''}
      ${settings?.address ? `<div>${settings.address}</div>` : ''}
      ${settings?.phone ? `<div class="mono">${settings.phone}</div>` : ''}
      ${settings?.email ? `<div>${settings.email}</div>` : ''}
    </div>
  </div>

  <div class="doc-title">Cotización</div>
  <div class="doc-code mono">${quote.code}</div>

  <div class="section">
    <div class="section-title">Cliente</div>
    <div class="grid-2">
      <div class="field">
        <div class="field-label">Razón social</div>
        <div class="field-value">${quote.client.companyName}</div>
      </div>
      <div class="field">
        <div class="field-label">RUT</div>
        <div class="field-value mono">${quote.client.rut}</div>
      </div>
      ${quote.client.mainContactName ? `<div class="field"><div class="field-label">Contacto</div><div class="field-value">${quote.client.mainContactName}</div></div>` : ''}
      ${quote.client.phone ? `<div class="field"><div class="field-label">Teléfono</div><div class="field-value mono">${quote.client.phone}</div></div>` : ''}
      ${quote.client.address ? `<div class="field"><div class="field-label">Dirección</div><div class="field-value">${quote.client.address}${quote.client.city ? ', ' + quote.client.city : ''}</div></div>` : ''}
      ${quote.client.email ? `<div class="field"><div class="field-label">Correo</div><div class="field-value">${quote.client.email}</div></div>` : ''}
    </div>
  </div>

  <div class="section">
    <div class="section-title">Información comercial</div>
    <div class="grid-2">
      <div class="field"><div class="field-label">Fecha emisión</div><div class="field-value mono">${date(quote.issueDate)}</div></div>
      <div class="field"><div class="field-label">Válida hasta</div><div class="field-value mono">${date(quote.expirationDate)}</div></div>
      <div class="field"><div class="field-label">Responsable</div><div class="field-value">${quote.owner.name}</div></div>
      <div class="field"><div class="field-label">Correo</div><div class="field-value">${quote.owner.email}</div></div>
    </div>
  </div>

  <div class="section">
    <div class="section-title">Especificaciones técnicas</div>
    <div class="grid-2">
      ${quote.workType ? `<div class="field"><div class="field-label">Tipo de trabajo</div><div class="field-value">${quote.workType}</div></div>` : ''}
      ${quote.ductType ? `<div class="field"><div class="field-label">Tipo de ductería</div><div class="field-value">${quote.ductType}</div></div>` : ''}
      ${quote.linearMeters ? `<div class="field"><div class="field-label">Metros lineales</div><div class="field-value mono">${quote.linearMeters} m</div></div>` : ''}
      ${quote.thickness ? `<div class="field"><div class="field-label">Espesor</div><div class="field-value mono">${quote.thickness}</div></div>` : ''}
      ${quote.installationType ? `<div class="field"><div class="field-label">Instalación</div><div class="field-value">${quote.installationType}</div></div>` : ''}
      <div class="field"><div class="field-label">Mano de obra</div><div class="field-value">${quote.requiresLabor ? 'Incluida' : 'No incluida'}</div></div>
    </div>
    ${quote.technicalNotes ? `<div class="notes">${quote.technicalNotes}</div>` : ''}
  </div>

  <div class="section">
    <div class="section-title">Detalle de partidas</div>
    <table>
      <thead>
        <tr>
          <th>Descripción</th>
          <th class="right">Cantidad</th>
          <th>Unidad</th>
          <th class="right">Precio unitario</th>
          <th class="right">Total</th>
        </tr>
      </thead>
      <tbody>
        ${quote.items.map(it => `
          <tr>
            <td>${it.description}</td>
            <td class="right mono">${it.quantity}</td>
            <td class="mono">${it.unit}</td>
            <td class="right mono">${fmt(it.unitPrice)}</td>
            <td class="right mono"><strong>${fmt(it.total)}</strong></td>
          </tr>
        `).join('')}
      </tbody>
    </table>

    <div class="totals">
      <div class="row subtotal"><span class="label">Subtotal</span><span class="mono">${fmt(quote.subtotal)}</span></div>
      <div class="row"><span class="label">IVA ${Number(quote.taxRate)}%</span><span class="mono">${fmt(quote.taxAmount)}</span></div>
      <div class="row total"><span class="label">Total</span><span class="mono">${fmt(quote.total)}</span></div>
    </div>
  </div>

  ${quote.commercialNotes ? `
    <div class="section">
      <div class="section-title">Observaciones</div>
      <div class="notes">${quote.commercialNotes}</div>
    </div>
  ` : ''}

  <div class="footer">
    <strong>Esta cotización es válida hasta ${date(quote.expirationDate)}.</strong><br>
    Los precios incluyen IVA. Forma de pago y condiciones a convenir.<br>
    Cualquier consulta dirigirla a ${quote.owner.email}.
  </div>
</body>
</html>`

  return new Response(html, {
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  })
}
