#!/usr/bin/env bash
# Script de un solo uso para subir CRM HVAC a GitHub
set -e
cd "$(dirname "$0")"
echo "🧹 Limpiando .git anterior (si existe)..."
rm -rf .git
echo "📦 Re-inicializando git..."
git init -b main -q
git config user.email "${GIT_USER_EMAIL:-martin@local}"
git config user.name "${GIT_USER_NAME:-Martin Ortega}"
git add -A
git commit -m "CRM HVAC inicial - listo para deploy" -q
echo "🔗 Conectando con GitHub..."
git remote add origin https://github.com/libreall333/crm-hvac.git
echo "🚀 Empujando código a GitHub (puede pedirte autenticación)..."
git push -u origin main
echo ""
echo "✅ ¡Listo! Código subido a https://github.com/libreall333/crm-hvac"
echo ""
echo "Ahora abre el botón de Vercel: https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Flibreall333%2Fcrm-hvac&env=JWT_SECRET&envDescription=Secreto%20aleatorio%20para%20firmar%20sesiones&project-name=crm-hvac&repository-name=crm-hvac&stores=%5B%7B%22type%22%3A%22postgres%22%7D%5D"
