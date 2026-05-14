# 🚀 INICIO RÁPIDO — Deploy en Vercel

## Camino 1: Automatizado (recomendado)

**Mac/Linux:**
```bash
tar xzf crm-hvac.tar.gz
cd crm-hvac
./setup-vercel.sh
```

**Windows:**
```
1. Descomprime crm-hvac.tar.gz
2. Doble click en setup-vercel.bat
```

El script te pregunta tu usuario de GitHub, sube el código, y abre Vercel listo para deployar. Solo necesitas darle click a "Deploy".

---

## Camino 2: Manual (si prefieres ver cada paso)

### 1. Subir a GitHub

```bash
tar xzf crm-hvac.tar.gz
cd crm-hvac
git init && git add . && git commit -m "Initial commit"
```

Ve a https://github.com/new → crea repo público `crm-hvac` → sigue las instrucciones para subir.

### 2. Editar README

Reemplaza `TU-USUARIO` en el botón del README por tu usuario de GitHub real. Commit + push.

### 3. Click en el botón "Deploy with Vercel" del README

En Vercel:
- ✅ Conecta con GitHub
- ✅ Acepta crear Postgres (Neon) — gratis
- ✅ JWT_SECRET: cualquier texto largo, ej. `qX8mNvLp2Kd9JfHsR4tW7yZcB6aE1uG5oP3iD0nA`
- ✅ Deploy

Espera 2-3 minutos. Vercel te entrega la URL pública.

### 4. Abrir y entrar

```
Usuario:    admin@hvac.cl
Contraseña: demo1234
```

¡Listo! 🎉

---

## ⚠️ Si algo falla en el build

**"Migrations not found":** El proyecto incluye migraciones generadas (`prisma/migrations/`). Si Vercel se queja, verifica que esa carpeta esté subida a GitHub.

**"Cannot find module 'tsx'":** Es una dev dependency. Vercel debería instalarla automáticamente. Si no, en Vercel Project Settings → Build & Development → cambia install command a `npm install --include=dev`.

**"Permission denied JWT_SECRET":** Pusiste un secret muy corto. Mínimo 32 caracteres.

**Cualquier otra cosa:** revisa los logs en Vercel Dashboard → tu proyecto → Deployments → click en el deploy fallido → ver logs.

---

## 💰 ¿Cuánto cuesta?

**Gratis** para uso personal/pequeña empresa con Vercel Free + Neon Free tier:
- Vercel: 100 GB de transferencia/mes
- Neon: 0.5 GB de Postgres
- Más que suficiente para una empresa con hasta cientos de cotizaciones al mes
