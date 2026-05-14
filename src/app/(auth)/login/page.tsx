'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Wind, Loader2 } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('admin@hvac.cl')
  const [password, setPassword] = useState('demo1234')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || 'Credenciales inválidas')
      }
      router.push('/')
      router.refresh()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Panel izquierdo — branding */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden border-r border-border">
        <div className="absolute inset-0 grid-bg opacity-30" />
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent" />
        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-md bg-primary/10 border border-primary/30 flex items-center justify-center">
              <Wind className="h-4 w-4 text-primary" />
            </div>
            <span className="font-semibold tracking-tight">Ductos &amp; Climatización</span>
          </div>

          <div className="space-y-6">
            <div className="text-mono text-xs text-muted-foreground tracking-widest uppercase">
              CRM · v1.0
            </div>
            <h1 className="text-4xl font-semibold tracking-tight leading-tight max-w-md">
              Gestión comercial para empresas de ductería y climatización.
            </h1>
            <p className="text-muted-foreground max-w-md leading-relaxed">
              Cotizaciones, seguimientos, pipeline y proyectos. Todo en un sistema diseñado para equipos técnicos.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-4 text-xs">
            <div className="border border-border rounded-md p-3 bg-card/50 backdrop-blur">
              <div className="text-mono text-2xl font-semibold text-primary">9</div>
              <div className="text-muted-foreground mt-1">Estados de cotización</div>
            </div>
            <div className="border border-border rounded-md p-3 bg-card/50 backdrop-blur">
              <div className="text-mono text-2xl font-semibold text-primary">7</div>
              <div className="text-muted-foreground mt-1">Etapas de pipeline</div>
            </div>
            <div className="border border-border rounded-md p-3 bg-card/50 backdrop-blur">
              <div className="text-mono text-2xl font-semibold text-primary">∞</div>
              <div className="text-muted-foreground mt-1">Proyectos</div>
            </div>
          </div>
        </div>
      </div>

      {/* Panel derecho — formulario */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-sm space-y-8">
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="h-9 w-9 rounded-md bg-primary/10 border border-primary/30 flex items-center justify-center">
              <Wind className="h-4 w-4 text-primary" />
            </div>
            <span className="font-semibold tracking-tight">Ductos &amp; Climatización</span>
          </div>

          <div className="space-y-1">
            <h2 className="text-2xl font-semibold tracking-tight">Iniciar sesión</h2>
            <p className="text-sm text-muted-foreground">Ingresa tus credenciales para acceder al CRM.</p>
          </div>

          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Correo</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="tu@empresa.cl" required autoComplete="email" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="current-password" />
            </div>

            {error && (
              <div className="text-sm text-destructive bg-destructive/10 border border-destructive/30 rounded-md px-3 py-2">{error}</div>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              {loading ? 'Ingresando...' : 'Ingresar'}
            </Button>
          </form>

          <div className="border-t border-border pt-6 space-y-3">
            <div className="text-xs text-muted-foreground font-medium">Cuentas de demostración</div>
            <div className="space-y-1.5 text-xs text-mono">
              <div className="flex justify-between"><span className="text-muted-foreground">Admin</span><span>admin@hvac.cl</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Ventas</span><span>ventas@hvac.cl</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Operaciones</span><span>operaciones@hvac.cl</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Contraseña</span><span>demo1234</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
