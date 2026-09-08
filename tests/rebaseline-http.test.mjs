import test from 'node:test';
import assert from 'node:assert/strict';

import { createHttpApi } from '../app/adapters/http/index.js';

function jsonRequest(path, method = 'POST', body = {}) {
  return new Request(`https://akilii.example${path}`, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: ['GET', 'HEAD'].includes(method) ? undefined : JSON.stringify(body),
  });
}

function baseServices(overrides = {}) {
  return {
    bootstrap: { async load(input) { return { version: 1, user: input.user, threads: [], work: [], context: { items: [], proposals: [] } }; } },
    context: {
      async inspect(input) { return { subjectId: input.subjectId, items: [], proposals: [] }; },
      async confirm(input) { return input; },
      async reject(input) { return input; },
      async restrict(input) { return input; },
      async remove(input) { return input; },
    },
    threads: {
      async list() { return []; }, async create(input) { return input; }, async transition(input) { return input; },
    },
    work: {
      async list() { return []; }, async create(input) { return { work: input, receipt: { operation: 'work.create' } }; }, async transition(input) { return input; },
    },
    chat: {
      async start(input) {
        async function* events() {
          yield { version: 1, runId: 'run-1', sequence: 0, type: 'run.started', at: 1, payload: {} };
          yield { version: 1, runId: 'run-1', sequence: 1, type: 'response.delta', at: 2, payload: { text: `hello ${input.subjectId}` } };
          yield { version: 1, runId: 'run-1', sequence: 2, type: 'response.completed', at: 3, payload: {} };
        }
        return { request: { conversationId: 'conversation-1' }, run: { runId: 'run-1', provider: 'secret-provider', model: 'secret-model', events: events() } };
      },
    },
    voice: { async start() { return { request: { episode: { id: 'episode-1' }, conversationId: null }, run: { runId: 'voice-1', provider: 'secret', model: 'secret', sdpAnswer: 'v=0\r\nanswer' } }; } },
    ...overrides,
  };
}

const actor = { actor: { id: 'user-1', email: 'user@example.com' } };

test('HTTP identity is server-derived and request body ownership fields are ignored', async () => {
  let seen;
  const api = createHttpApi({ services: baseServices({ context: {
    async inspect() { return { items: [], proposals: [] }; },
    async confirm(input) { seen = input; return input; },
    async reject() {}, async restrict() {}, async remove() {},
  } }) });
  const response = await api.handle(jsonRequest('/api/v1/context/proposals/p1/confirm', 'POST', {
    subjectId: 'attacker', userId: 'attacker', user_id: 'attacker', expectedVersion: 1,
  }), actor);
  assert.equal(response.status, 200);
  assert.equal(seen.subjectId, 'user-1');
  assert.equal('userId' in seen, false);
  assert.equal('user_id' in seen, false);
});

test('authentication is required before routing to product services', async () => {
  const api = createHttpApi({ services: baseServices() });
  const response = await api.handle(new Request('https://akilii.example/api/v1/bootstrap'));
  assert.equal(response.status, 401);
  assert.equal((await response.json()).error.code, 'AUTH_REQUIRED');
});

test('transport rejects non-JSON writes and oversized bodies', async () => {
  const api = createHttpApi({ services: baseServices() });
  const wrongType = await api.handle(new Request('https://akilii.example/api/v1/threads', {
    method: 'POST', body: 'hello', headers: { 'Content-Type': 'text/plain' },
  }), actor);
  assert.equal(wrongType.status, 415);

  const oversized = await api.handle(new Request('https://akilii.example/api/v1/threads', {
    method: 'POST', body: JSON.stringify({ title: 'x'.repeat(50_000) }), headers: { 'Content-Type': 'application/json' },
  }), actor);
  assert.equal(oversized.status, 413);
});

test('known routes reject the wrong method and unknown routes return 404', async () => {
  const api = createHttpApi({ services: baseServices() });
  assert.equal((await api.handle(new Request('https://akilii.example/api/v1/context', { method: 'POST' }), actor)).status, 405);
  assert.equal((await api.handle(new Request('https://akilii.example/api/v1/nope'), actor)).status, 404);
});

test('optimistic conflicts map to HTTP 409', async () => {
  const error = Object.assign(new Error('Thread changed.'), { code: 'VERSION_CONFLICT' });
  const api = createHttpApi({ services: baseServices({ threads: {
    async list() { return []; }, async create() {}, async transition() { throw error; },
  } }) });
  const response = await api.handle(jsonRequest('/api/v1/threads/t1', 'PATCH', { expectedVersion: 1, to: 'held' }), actor);
  assert.equal(response.status, 409);
  assert.equal((await response.json()).error.code, 'VERSION_CONFLICT');
});

test('chat streams normalized events without provider or model internals', async () => {
  const api = createHttpApi({ services: baseServices() });
  const response = await api.handle(jsonRequest('/api/v1/chat', 'POST', { message: 'Hello', subjectId: 'attacker' }), actor);
  assert.equal(response.status, 200);
  assert.match(response.headers.get('content-type'), /text\/event-stream/);
  assert.equal(response.headers.get('x-akilii-conversation-id'), 'conversation-1');
  const body = await response.text();
  assert.match(body, /response\.delta/);
  assert.match(body, /hello user-1/);
  assert.equal(body.includes('secret-provider'), false);
  assert.equal(body.includes('secret-model'), false);
});

test('voice session response exposes only product-facing session identifiers and SDP', async () => {
  const api = createHttpApi({ services: baseServices() });
  const response = await api.handle(jsonRequest('/api/v1/voice/session', 'POST', { sdp: 'v=0' }), actor);
  const payload = await response.json();
  assert.deepEqual(payload, { runId: 'voice-1', episodeId: 'episode-1', conversationId: null, sdpAnswer: 'v=0\r\nanswer' });
  assert.equal('provider' in payload, false);
  assert.equal('model' in payload, false);
});
