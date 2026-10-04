# ConexIA+ — Módulo Psicológico listo para servidor

## Estructura

- `public/index.html` — aplicación web del módulo psicológico.
- `public/conexia-ai-config.js` — adaptador del navegador hacia el backend.
- `server.mjs` — servidor Node/Express y conexión segura con OpenAI.
- `.env.example` — variables de entorno de ejemplo.
- `package.json` — dependencias y comandos.
- `Dockerfile` — despliegue mediante Docker.
- `docker-compose.yml` — ejecución con Docker Compose.
- `ecosystem.config.cjs` — ejecución con PM2.
- `nginx.conf.example` — ejemplo de proxy inverso Nginx.
- `.gitignore` — evita subir secretos y dependencias.

## Instalación directa en un VPS

Requiere Node.js 20 o superior.

```bash
npm install
cp .env.example .env
nano .env
npm start
```

En `.env` debes colocar:

```env
OPENAI_API_KEY=sk-xxxxxxxxxxxxxxxx
CONEXIA_AI_MODEL=gpt-6-luna
PORT=8787
NODE_ENV=production
```

La clave debe existir únicamente en el servidor. Nunca debe copiarse al HTML, JavaScript público, GitHub, GitLab ni al navegador.

## Prueba

```bash
curl http://127.0.0.1:8787/api/health
```

Debe responder algo similar a:

```json
{"ok":true,"aiConfigured":true,"model":"gpt-6-luna"}
```

Luego abrir:

`http://IP-DEL-SERVIDOR:8787/`

## PM2

```bash
npm install
npm install -g pm2
cp .env.example .env
nano .env
pm2 start ecosystem.config.cjs
pm2 save
pm2 startup
```

## Docker

```bash
cp .env.example .env
nano .env
docker compose up -d --build
```

## Nginx + HTTPS

Usar `nginx.conf.example` como base, cambiar `server_name` por el dominio real y configurar HTTPS con Certbot.

## Arquitectura de IA

El navegador nunca llama directamente a OpenAI. El flujo es:

`Módulo psicológico → /api/ai/generate → servidor ConexIA+ → OpenAI Responses API → servidor → navegador`

Esto permite cambiar de proveedor/modelo sin exponer la clave en el frontend.

## Protección de datos

Este módulo trabaja potencialmente con datos personales y antecedentes psicológicos de estudiantes. Antes de ponerlo en producción se debe agregar autenticación de usuarios, autorización por establecimiento/rol, auditoría, cifrado y una política de retención/eliminación de datos acorde al tratamiento de información personal y educativa.

El servidor no registra deliberadamente el contenido del prompt ni la respuesta de la IA en archivos de log.
