import { readSseEvents } from './sse-client.js';

export class IntegrationApiError extends Error {
  constructor(message, { status = 0, code = null } = {}) {
    super(message);
    this.name = 'IntegrationApiError';
    this.status = status;
    this.code = code;
  }
}

function cleanBase(value) {
  const base = typeof value === 'string' && value.trim() ? value.trim() : '/api/v1';
  return base.endsWith('/') ? base.slice(0, -1) : base;
}

async function parseResponse(response) {
  const type = response.headers?.get?.('content-type') || '';
  if (response.status === 204) return null;
  if (type.includes('application/json')) return response.json();
  return { message: await response.text() };
}

export function createIntegrationApiClient({
  fetchImpl = globalThis.fetch,
  baseUrl = '/api/v1',
  tokenProvider = null,
} = {}) {
  if (typeof fetchImpl !== 'function') throw new TypeError('API client requires fetch.');
  const base = cleanBase(baseUrl);

  async function headers(body) {
    const result = new Headers();
    if (body !== undefined) result.set('Content-Type', 'application/json');
    if (typeof tokenProvider === 'function') {
      const token = await tokenProvider();
      if (token) result.set('Authorization', `Bearer ${token}`);
    }
    return result;
  }

  async function raw(path, { method = 'GET', body, signal } = {}) {
    return fetchImpl(`${base}${path}`, {
      method,
      credentials: 'same-origin',
      headers: await headers(body),
      body: body === undefined ? undefined : JSON.stringify(body),
      signal,
    });
  }

  async function request(path, options = {}) {
    const response = await raw(path, options);
    const payload = await parseResponse(response);
    if (!response.ok) {
      throw new IntegrationApiError(
        payload?.error?.message || payload?.message || `Request failed (${response.status}).`,
        { status: response.status, code: payload?.error?.code || null },
      );
    }
    return payload;
  }

  async function startChat(input, signal) {
    const response = await raw('/chat', { method: 'POST', body: input, signal });
    if (!response.ok) {
      const payload = await parseResponse(response);
      throw new IntegrationApiError(
        payload?.error?.message || `Request failed (${response.status}).`,
        { status: response.status, code: payload?.error?.code || null },
      );
    }
    return Object.freeze({
      runId: response.headers.get('x-akilii-run-id'),
      conversationId: response.headers.get('x-akilii-conversation-id'),
      events: readSseEvents(response.body),
    });
  }

  return Object.freeze({
    bootstrap: () => request('/bootstrap'),
    startChat,
    getContext: () => request('/context'),
    confirmContextProposal: (id, input) => request(
      `/context/proposals/${encodeURIComponent(id)}/confirm`,
      { method: 'POST', body: input },
    ),
    rejectContextProposal: (id, input) => request(
      `/context/proposals/${encodeURIComponent(id)}/reject`,
      { method: 'POST', body: input },
    ),
    updateContextControl: (id, input) => request(
      `/context/items/${encodeURIComponent(id)}/control`,
      { method: 'PATCH', body: input },
    ),
    deleteContextItem: (id, input) => request(
      `/context/items/${encodeURIComponent(id)}`,
      { method: 'DELETE', body: input },
    ),
    createVoiceSession: input => request('/voice/session', { method: 'POST', body: input }),
    saveVoiceTranscript: input => request('/voice/transcript', { method: 'POST', body: input }),
  });
}
