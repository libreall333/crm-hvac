export interface CostInputs {
  materialsCost: number
  laborCost: number
  transportCost: number
  equipmentCost: number
  indirectCost: number
  marginPercent: number
  taxRate: number
}

export function calculateQuoteTotals(c: CostInputs) {
  const base = c.materialsCost + c.laborCost + c.transportCost + c.equipmentCost + c.indirectCost
  const subtotal = Math.round(base * (1 + c.marginPercent / 100))
  const taxAmount = Math.round(subtotal * (c.taxRate / 100))
  const total = subtotal + taxAmount
  return { subtotal, taxAmount, total }
}
