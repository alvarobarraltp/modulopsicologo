#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
command -v node >/dev/null 2>&1 || { echo "Node.js no está instalado."; exit 1; }
node -e "const [maj]=process.versions.node.split('.').map(Number); if(maj<20) process.exit(1)" || { echo "Se requiere Node.js 20 o superior."; exit 1; }
[ -f .env ] || cp .env.example .env
echo "Instalando dependencias..."
npm install --omit=dev
echo
echo "Instalación terminada. Revisa .env y configura OPENAI_API_KEY."
echo "Para iniciar: npm start"
