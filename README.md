# CRM HVAC — Ductos & Climatización

> CRM completo para empresas de ductería y climatización HVAC. Cotizaciones, pipeline comercial, proyectos y seguimientos.

## 🚀 Deploy de un click (Vercel + Neon)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Flibreall333%2Fcrm-hvac&env=JWT_SECRET&envDescription=Secret%20aleatorio%20para%20firmar%20sesiones&project-name=crm-hvac&repository-name=crm-hvac&stores=%5B%7B%22type%22%3A%22postgres%22%7D%5D)

**El botón hace todo en 2-3 minutos:**

1. Clona el repo en tu GitHub
2. Crea una base de datos Postgres (Neon) en Vercel — gratis
3. Te pide el `JWT_SECRET` (cualquier texto largo random sirve)
4. Despliega, corre las migraciones y siembra datos demo automáticamente
5. Te entrega la URL pública lista para usar

## 📦 Pasos completos (5 min, primera vez)

### 1. Subir el código a GitHub

**Opción A — con `gh` CLI (más rápido):**
```bash
tar xzf crm-hvac.tar.gz
cd crm-hvac
git init && git add . && git commit -m "Initial commit"
gh repo create crm-hvac --public --source=. --remote=origin --push
```

**Opción B — manual:**
1. Ve a [github.com/new](https://github.com/new), crea un repo público llamado `crm-hvac`
2. En tu terminal:
```bash
tar xzf crm-hvac.tar.gz
cd crm-hvac
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/libreall333/crm-hvac.git
git push -u origin main
```

### 2. Editar el botón del README

Abre `README.md` en tu repo y reemplaza las dos apariciones de `libreall333` por tu usuario de GitHub real. Commit y push.

### 3. Click en el botón Deploy

- Iniciar sesión en Vercel (gratis, con GitHub)
- Vercel ve que necesitas Postgres y te ofrece crear uno con Neon — acepta
- Te pide el `JWT_SECRET` — escribe cualquier texto random largo. Ejemplo:
  ```
  qX8mNvLp2Kd9JfHsR4tW7yZcB6aE1uG5oP3iD0nA
  ```
- Click "Deploy" y espera 2-3 min

### 4. Abrir el CRM

Vercel te da una URL como `https://crm-hvac-xxxx.vercel.app`. Abres y entras con:

```
Email:       admin@hvac.cl
Contraseña:  demo1234
```

✅ Listo. Tu CRM está en línea, accesible desde cualquier lugar.

## 🔐 Cuentas de demostración

| Rol | Email | Contraseña |
|---|---|---|
| Administrador | `admin@hvac.cl` | `demo1234` |
| Ventas | `ventas@hvac.cl` | `demo1234` |
| Ventas 2 | `comercial@hvac.cl` | `demo1234` |
| Operaciones | `operaciones@hvac.cl` | `demo1234` |

⚠️ **Cambia la contraseña de admin antes de usar en producción real.**

## ✨ Qué incluye

- **Dashboard** con KPIs en tiempo real, gráficos de pipeline y ventas mensuales
- **Cotizaciones** con desglose técnico, cálculo automático de costos, margen, IVA y total. Historial de estados, duplicación, PDF profesional.
- **Pipeline Kanban** con drag & drop entre 7 etapas
- **Conversión automática** de cotización ganada → proyecto
- **Clientes** con historial completo, tags personalizables
- **Proyectos** con avance, hitos, costos reales vs presupuesto
- **Agenda** con seguimientos, atrasos, recordatorios
- **Búsqueda global** ⌘K (Spotlight)
- **Usuarios y roles** (Admin, Ventas, Operaciones, Gerencia)
- **Auditoría** automática de todos los cambios
- **UI moderna** estilo Linear / Stripe, modo oscuro por defecto

## 🛠️ Stack

Next.js 14 · TypeScript · Tailwind CSS · Prisma · PostgreSQL · JWT · Recharts · dnd-kit

## 💻 Desarrollo local

¿Prefieres correrlo en tu PC? Necesitas Node 18+ y PostgreSQL.

```bash
cp .env.example .env
# edita .env con tu DATABASE_URL y JWT_SECRET

npm install
npm run db:push       # crea tablas
npm run db:seed       # carga datos demo
npm run dev           # abre http://localhost:3000
```

## 🎯 Roles y permisos

| Rol | Cotizaciones | Clientes | Proyectos | Usuarios |
|---|---|---|---|---|
| **Admin** | CRUD + aprobar | CRUD | CRUD | Gestionar |
| **Gerencia** | Crear, editar, aprobar | Crear, editar | Crear, editar | Ver |
| **Ventas** | Crear, editar | Crear, editar | Ver | — |
| **Operaciones** | Ver | Ver | Crear, editar | — |

## 🚧 Roadmap

El MVP es completamente funcional. Para producción real considera agregar:
- Subida de archivos (UploadThing, S3, Vercel Blob)
- Emails automáticos con Resend
- Cron jobs de Vercel para recordatorios
- Exportación Excel con SheetJS
- 2FA

## 📝 Licencia

Privado · Uso interno.
