/* ConexIA+ AI adapter — navegador
 * La clave de OpenAI NO se guarda aquí.
 * Este archivo solo llama al backend del servidor.
 */
window.conexiaAI = window.conexiaAI || {};
window.conexiaAI.endpoint = '/api/ai/generate';

window.conexiaAI.generate = async function (prompt) {
  const response = await fetch(window.conexiaAI.endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'same-origin',
    body: JSON.stringify({ prompt })
  });

  let payload = null;
  try { payload = await response.json(); } catch (_) {}

  if (!response.ok) {
    throw new Error(payload?.error || 'AI_REQUEST_FAILED');
  }

  if (payload?.json && typeof payload.json === 'object') return payload.json;
  throw new Error('AI_INVALID_RESPONSE');
};

window.conexiaAI.health = async function () {
  const response = await fetch('/api/health', { credentials: 'same-origin' });
  return response.json();
};
