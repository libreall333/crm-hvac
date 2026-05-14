#!/usr/bin/env bash
# Script de setup para deploy en Vercel.
# Sube el proyecto a GitHub y abre Vercel listo para deployar.

set -e

echo "🚀 CRM HVAC — Setup deploy Vercel"
echo ""

# Verificar git
if ! command -v git &> /dev/null; then
  echo "❌ Necesitas instalar Git: https://git-scm.com/downloads"
  exit 1
fi

# Verificar gh CLI
if ! command -v gh &> /dev/null; then
  echo "⚠️  No tienes 'gh' CLI instalado. Te dará instrucciones manuales al final."
  GH_AVAILABLE=false
else
  GH_AVAILABLE=true
fi

# Pedir usuario de GitHub
read -p "Tu usuario de GitHub: " GH_USER
if [ -z "$GH_USER" ]; then
  echo "❌ Usuario requerido"
  exit 1
fi

# Reemplazar en README
echo "📝 Personalizando README con tu usuario..."
if [[ "$OSTYPE" == "darwin"* ]]; then
  sed -i '' "s/TU-USUARIO/$GH_USER/g" README.md
else
  sed -i "s/TU-USUARIO/$GH_USER/g" README.md
fi

# Init git
if [ ! -d .git ]; then
  git init -q
  git branch -M main 2>/dev/null || true
fi

git add .
git commit -m "Initial commit: CRM HVAC MVP" -q || echo "ℹ️  Nada que commitear"

# Subir
if [ "$GH_AVAILABLE" = true ]; then
  echo "📤 Creando repo en GitHub y subiendo..."
  if gh repo view "$GH_USER/crm-hvac" &> /dev/null; then
    echo "ℹ️  Repo ya existe, solo subiendo cambios..."
    git remote add origin "https://github.com/$GH_USER/crm-hvac.git" 2>/dev/null || true
    git push -u origin main
  else
    gh repo create crm-hvac --public --source=. --remote=origin --push
  fi
else
  echo ""
  echo "📋 No tienes 'gh' CLI. Hazlo manual:"
  echo ""
  echo "  1. Ve a: https://github.com/new"
  echo "  2. Crea un repo público llamado: crm-hvac"
  echo "  3. Pega y ejecuta:"
  echo ""
  echo "     git remote add origin https://github.com/$GH_USER/crm-hvac.git"
  echo "     git push -u origin main"
  echo ""
  read -p "Presiona ENTER cuando el repo esté subido a GitHub..."
fi

# Abrir botón de Vercel
VERCEL_URL="https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2F${GH_USER}%2Fcrm-hvac&env=JWT_SECRET&envDescription=Secret%20aleatorio%20para%20firmar%20sesiones&project-name=crm-hvac&repository-name=crm-hvac&stores=%5B%7B%22type%22%3A%22postgres%22%7D%5D"

echo ""
echo "✅ Listo. Abriendo Vercel para deploy..."
echo ""
echo "   $VERCEL_URL"
echo ""

# Abrir en navegador (multi-plataforma)
if command -v open &> /dev/null; then
  open "$VERCEL_URL"
elif command -v xdg-open &> /dev/null; then
  xdg-open "$VERCEL_URL"
elif command -v start &> /dev/null; then
  start "$VERCEL_URL"
else
  echo "Copia la URL y ábrela en tu navegador."
fi

echo ""
echo "📌 En Vercel:"
echo "   1. Conéctalo con GitHub"
echo "   2. Acepta crear Postgres (Neon) — gratis"
echo "   3. JWT_SECRET: cualquier texto random largo"
echo "      Ejemplo: $(openssl rand -base64 32 2>/dev/null || echo "qX8mNvLp2Kd9JfHsR4tW7yZcB6aE1uG5oP3iD0nA")"
echo "   4. Deploy → espera 2-3 min"
echo ""
echo "🔑 Login final: admin@hvac.cl / demo1234"
