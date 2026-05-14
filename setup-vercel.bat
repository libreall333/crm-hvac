@echo off
chcp 65001 >nul
echo.
echo 🚀 CRM HVAC — Setup deploy Vercel
echo.

where git >nul 2>&1
if errorlevel 1 (
  echo ❌ Necesitas instalar Git: https://git-scm.com/downloads
  pause
  exit /b 1
)

set /p GH_USER="Tu usuario de GitHub: "
if "%GH_USER%"=="" (
  echo ❌ Usuario requerido
  pause
  exit /b 1
)

echo 📝 Personalizando README con tu usuario...
powershell -Command "(Get-Content README.md) -replace 'TU-USUARIO', '%GH_USER%' | Set-Content README.md"

if not exist .git (
  git init -q
  git branch -M main
)

git add .
git commit -m "Initial commit: CRM HVAC MVP" -q 2>nul

where gh >nul 2>&1
if not errorlevel 1 (
  echo 📤 Creando repo en GitHub y subiendo...
  gh repo create crm-hvac --public --source=. --remote=origin --push 2>nul
  if errorlevel 1 (
    git remote add origin https://github.com/%GH_USER%/crm-hvac.git 2>nul
    git push -u origin main
  )
) else (
  echo.
  echo 📋 No tienes 'gh' CLI. Hazlo manual:
  echo.
  echo   1. Ve a: https://github.com/new
  echo   2. Crea un repo PÚBLICO llamado: crm-hvac
  echo   3. Pega y ejecuta:
  echo.
  echo      git remote add origin https://github.com/%GH_USER%/crm-hvac.git
  echo      git push -u origin main
  echo.
  pause
)

set VERCEL_URL=https://vercel.com/new/clone?repository-url=https%%3A%%2F%%2Fgithub.com%%2F%GH_USER%%%2Fcrm-hvac^&env=JWT_SECRET^&envDescription=Secret%%20aleatorio^&project-name=crm-hvac^&repository-name=crm-hvac^&stores=%%5B%%7B%%22type%%22%%3A%%22postgres%%22%%7D%%5D

echo.
echo ✅ Listo. Abriendo Vercel para deploy...
echo.
start "" "%VERCEL_URL%"

echo 📌 En Vercel:
echo    1. Conéctalo con GitHub
echo    2. Acepta crear Postgres (Neon) — gratis
echo    3. JWT_SECRET: cualquier texto random largo
echo    4. Deploy → espera 2-3 min
echo.
echo 🔑 Login final: admin@hvac.cl / demo1234
echo.
pause
