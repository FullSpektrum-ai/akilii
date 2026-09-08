export class ApiError extends Error {
  constructor(message, { status = 0, code = null, details = null } = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.details = details;
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

export function createApiClient({ fetchImpl = globalThis.fetch, baseUrl = '/api/v1' } = {}) {
  if (typeof fetchImpl !== 'function') throw new TypeError('API client requires fetch.');
  const base = cleanBase(baseUrl);

  async function request(path, { method = 'GET', body, signal } = {}) {
    const response = await fetchImpl(`${base}${path}`, {
      method,
      credentials: 'same-origin',
      headers: body === undefined ? undefined : { 'Content-Type': 'application/json' },
      body: body === undefined ? undefined : JSON.stringify(body),
      signal,
    });
    const payload = await parseResponse(response);
    if (!response.ok) {
      throw new ApiError(
        payload?.error?.message || payload?.message || `Request failed (${response.status}).`,
        {
          status: response.status,
          code: payload?.error?.code || null,
          details: payload?.error?.details || null,
        },
      );
    }
    return payload;
  }

  return Object.freeze({
    bootstrap: () => request('/bootstrap'),
    getConversation: id => request(`/conversations/${encodeURIComponent(id)}`),
    startChat: input => request('/chat', { method: 'POST', body: input }),
    getContext: () => request('/context'),
    confirmContextProposal: (id, input) => request(`/context/proposals/${encodeURIComponent(id)}/confirm`, { method: 'POST', body: input }),
    rejectContextProposal: (id, input = {}) => request(`/context/proposals/${encodeURIComponent(id)}/reject`, { method: 'POST', body: input }),
    updateContextControl: (id, input) => request(`/context/items/${encodeURIComponent(id)}/control`, { method: 'PATCH', body: input }),
    deleteContextItem: (id, input) => request(`/context/items/${encodeURIComponent(id)}`, { method: 'DELETE', body: input }),
    listThreads: () => request('/threads'),
    createThread: input => request('/threads', { method: 'POST', body: input }),
    transitionThread: (id, input) => request(`/threads/${encodeURIComponent(id)}`, { method: 'PATCH', body: input }),
    listWork: () => request('/work'),
    createWork: input => request('/work', { method: 'POST', body: input }),
    transitionWork: (id, input) => request(`/work/${encodeURIComponent(id)}`, { method: 'PATCH', body: input }),
  });
}
