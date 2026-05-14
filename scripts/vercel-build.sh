#!/usr/bin/env bash
# Build script de Vercel — funciona con Neon (Vercel Postgres) y con DATABASE_URL manual.
set -e

echo "🔧 Build CRM HVAC"

# Si Vercel inyectó las vars de Postgres (Neon/Vercel Postgres), úsalas.
# Si no (deploy con DATABASE_URL manual), usa la existente.
if [ -n "$POSTGRES_URL_NON_POOLING" ]; then
  export DATABASE_URL="$POSTGRES_URL_NON_POOLING"
  echo "✓ Usando POSTGRES_URL_NON_POOLING para migraciones"
fi

if [ -z "$DATABASE_URL" ]; then
  echo "❌ DATABASE_URL no está definida"
  exit 1
fi

echo "📦 Generando cliente Prisma..."
npx prisma generate

echo "🚀 Aplicando migraciones..."
npx prisma migrate deploy

echo "🌱 Sembrando datos demo (idempotente)..."
npx tsx prisma/seed-prod.ts || echo "⚠️ Seed falló pero seguimos"

# Para runtime, usar la URL pooled si está disponible (mejor performance en serverless)
if [ -n "$POSTGRES_PRISMA_URL" ]; then
  export DATABASE_URL="$POSTGRES_PRISMA_URL"
fi

echo "🏗️ Build Next.js..."
npx next build

echo "✅ Build completo"
