import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

export const dynamic = 'force-dynamic'

export default async function SettingsPage() {
  const settings = await prisma.companySettings.findUnique({ where: { id: 'singleton' } })

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-3xl mx-auto">
      <div>
        <div className="text-mono text-[10px] tracking-widest uppercase text-muted-foreground mb-1">Sistema</div>
        <h1 className="text-2xl font-semibold tracking-tight">Configuración</h1>
        <p className="text-sm text-muted-foreground mt-1">Datos generales de la empresa y parámetros del sistema.</p>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-sm">Datos de la empresa</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Label>Razón social</Label>
              <Input defaultValue={settings?.companyName} className="mt-1.5" />
            </div>
            <div>
              <Label>RUT</Label>
              <Input defaultValue={settings?.rut ?? ''} className="mt-1.5 text-mono" />
            </div>
            <div>
              <Label>Teléfono</Label>
              <Input defaultValue={settings?.phone ?? ''} className="mt-1.5 text-mono" />
            </div>
            <div className="col-span-2">
              <Label>Dirección</Label>
              <Input defaultValue={settings?.address ?? ''} className="mt-1.5" />
            </div>
            <div className="col-span-2">
              <Label>Correo de contacto</Label>
              <Input defaultValue={settings?.email ?? ''} className="mt-1.5" />
            </div>
            <div>
              <Label>IVA (%)</Label>
              <Input type="number" defaultValue={settings?.taxRate ?? 19} className="mt-1.5 text-mono" />
            </div>
            <div>
              <Label>Moneda</Label>
              <Input defaultValue={settings?.currency ?? 'CLP'} className="mt-1.5 text-mono" />
            </div>
          </div>
          <div className="flex justify-end pt-4 border-t border-border">
            <Button>Guardar cambios</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-sm">Información del sistema</CardTitle></CardHeader>
        <CardContent className="space-y-2 text-sm">
          <Row label="Versión" value="CRM HVAC v1.0.0" />
          <Row label="Base de datos" value="PostgreSQL" />
          <Row label="Framework" value="Next.js 14" />
          <Row label="Última actualización" value="Mayo 2026" />
        </CardContent>
      </Card>
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between py-1.5 border-b border-border last:border-0">
      <span className="text-muted-foreground text-xs">{label}</span>
      <span className="text-mono text-xs">{value}</span>
    </div>
  )
}
