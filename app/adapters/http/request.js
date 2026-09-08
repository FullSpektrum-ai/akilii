import { HttpError } from './errors.js';

export const MAX_JSON_BYTES = 48 * 1024;

export function requireActor(context = {}) {
  const id = typeof context.actor?.id === 'string' ? context.actor.id.trim() : '';
  if (!id) throw new HttpError(401, 'Please sign in.', 'AUTH_REQUIRED');
  return { id, email: typeof context.actor.email === 'string' ? context.actor.email.trim() : '' };
}

export async function readJson(request, { maxBytes = MAX_JSON_BYTES, optional = false } = {}) {
  const length = Number(request.headers.get('content-length') || 0);
  if (length > maxBytes) throw new HttpError(413, 'Request body is too large.', 'BODY_TOO_LARGE');
  if (!request.body) {
    if (optional) return {};
    throw new HttpError(400, 'A JSON request body is required.', 'BODY_REQUIRED');
  }
  const type = request.headers.get('content-type') || '';
  if (!type.toLowerCase().startsWith('application/json')) {
    throw new HttpError(415, 'Use application/json for this request.', 'JSON_REQUIRED');
  }
  const reader = request.body.getReader();
  const chunks = [];
  let size = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > maxBytes) {
        await reader.cancel();
        throw new HttpError(413, 'Request body is too large.', 'BODY_TOO_LARGE');
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock?.();
  }
  if (!size) return optional ? {} : (() => { throw new HttpError(400, 'A JSON request body is required.', 'BODY_REQUIRED'); })();
  const bytes = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.byteLength; }
  try { return JSON.parse(new TextDecoder().decode(bytes)); }
  catch { throw new HttpError(400, 'The JSON request could not be read.', 'INVALID_JSON'); }
}
