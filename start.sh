#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
[ -f .env ] || { echo "Falta .env. Ejecuta ./install.sh primero."; exit 1; }
npm start
