import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'CRM HVAC — Gestión Comercial',
  description: 'Sistema de gestión de cotizaciones y proyectos para empresas de ductería y climatización',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className="dark" suppressHydrationWarning>
      <body className="min-h-screen bg-background font-sans">{children}</body>
    </html>
  )
}
