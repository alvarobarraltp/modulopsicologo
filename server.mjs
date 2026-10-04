import 'dotenv/config';
import express from 'express';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import OpenAI from 'openai';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.join(__dirname, 'public');
const app = express();

const port = Number(process.env.PORT || 8787);
const model = process.env.CONEXIA_AI_MODEL || 'gpt-6-luna';
const bodyLimit = `${Math.max(1, Number(process.env.BODY_LIMIT_MB || 2))}mb`;
const hasApiKey = Boolean(process.env.OPENAI_API_KEY);
const client = hasApiKey ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) : null;

if (process.env.TRUST_PROXY) {
  app.set('trust proxy', Number(process.env.TRUST_PROXY) || 1);
}

app.disable('x-powered-by');
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false
}));
app.use(express.json({ limit: bodyLimit, strict: true }));

const aiLimiter = rateLimit({
  windowMs: Number(process.env.AI_RATE_LIMIT_WINDOW_MS || 60000),
  limit: Number(process.env.AI_RATE_LIMIT_MAX || 20),
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { error: 'AI_RATE_LIMITED' }
});

app.get('/api/health', (_req, res) => {
  res.json({
    ok: true,
    service: 'conexiaplus-psicologico',
    aiConfigured: hasApiKey,
    model,
    environment: process.env.NODE_ENV || 'development'
  });
});

app.get('/api/ready', (_req, res) => {
  if (!hasApiKey) return res.status(503).json({ ok: false, error: 'AI_NOT_CONFIGURED' });
  res.json({ ok: true });
});

app.post('/api/ai/generate', aiLimiter, async (req, res) => {
  if (!client) return res.status(503).json({ error: 'AI_NOT_CONFIGURED' });

  const prompt = typeof req.body?.prompt === 'string' ? req.body.prompt.trim() : '';
  if (!prompt) return res.status(400).json({ error: 'PROMPT_REQUIRED' });
  if (prompt.length > 120000) return res.status(413).json({ error: 'PROMPT_TOO_LARGE' });

  try {
    const response = await client.responses.create({
      model,
      input: [
        {
          role: 'user',
          content: [{ type: 'input_text', text: prompt }]
        }
      ],
      text: { format: { type: 'json_object' } },
      store: false
    });

    const output = response.output_text || '';
    if (!output) return res.status(502).json({ error: 'AI_EMPTY_RESPONSE' });

    let json;
    try {
      json = JSON.parse(output);
    } catch {
      return res.status(502).json({ error: 'AI_INVALID_JSON' });
    }

    return res.json({ json });
  } catch (error) {
    console.error('[ConexIA+ AI]', error?.status || '', error?.message || 'provider error');
    return res.status(502).json({ error: 'AI_PROVIDER_ERROR' });
  }
});

app.use(express.static(publicDir, {
  extensions: ['html'],
  maxAge: process.env.NODE_ENV === 'production' ? '1h' : 0
}));

app.get(/.*/, (_req, res) => {
  res.sendFile(path.join(publicDir, 'index.html'));
});

app.use((err, _req, res, _next) => {
  if (err?.type === 'entity.too.large') return res.status(413).json({ error: 'REQUEST_TOO_LARGE' });
  console.error('[ConexIA+ Server]', err?.message || err);
  res.status(500).json({ error: 'INTERNAL_SERVER_ERROR' });
});

app.listen(port, '0.0.0.0', () => {
  console.log(`ConexIA+ psicológico escuchando en http://0.0.0.0:${port}`);
  console.log(`IA: ${hasApiKey ? `configurada (${model})` : 'NO configurada'}`);
});
