import { test } from 'node:test';
import assert from 'node:assert/strict';
import worker from '../dist/server/index.js';
import { createNprItem, projectNpr } from '../backend/npr.js';
import { makeDB } from './db-adapter.mjs';

const actor = { id: 'alice', email: 'alice@example.test' };
async function request(db, path, method = 'GET', data) {
  const headers = {
    'oai-authenticated-user-id': actor.id,
    'oai-authenticated-user-email': actor.email,
  };
  if (data) {
    headers['content-type'] = 'application/json';
    headers.origin = 'https://test.local';
  }
  const response = await worker.fetch(
    new Request('https://test.local/api/' + path, {
      method,
      headers,
      body: data ? JSON.stringify(data) : undefined,
    }),
    { DB: db, OPENAI_API_KEY: 'test' },
    { waitUntil() {} },
  );
  return { status: response.status, data: await response.json() };
}

test('NPR projection excludes restricted, expired, unconfirmed and wrong-purpose context', () => {
  const at = Date.now();
  const base = {
    id: 'allowed',
    item_type: 'support_preference',
    tier: 'stable',
    content: 'One step first',
    lifecycle_state: 'active',
    confirmation_state: 'confirmed',
    confidence: 1000,
    sensitivity: 'standard',
    use_allowed: 1,
    valid_from: at - 1,
    expires_at: null,
    purpose_scopes: '["support"]',
  };
  const result = projectNpr([
    base,
    { ...base, id: 'restricted', use_allowed: 0 },
    { ...base, id: 'expired', expires_at: at - 1 },
    { ...base, id: 'proposed', confirmation_state: 'proposed' },
    { ...base, id: 'planning', purpose_scopes: '["planning"]' },
  ], { now: at });
  assert.deepEqual(result.items.map((item) => item.itemId), ['allowed']);
  assert.deepEqual(result.excludedCountsByReason, {
    restricted: 1,
    expired: 1,
    unconfirmed: 1,
    purpose: 1,
  });
});

test('dynamic NPR requires bounded expiry and only accepts user-provided context', () => {
  const at = Date.now();
  assert.throws(
    () => createNprItem({ itemType: 'goal', tier: 'dynamic', content: 'Start', expiresAt: at - 1 }, actor, at),
    /review date/,
  );
  assert.throws(
    () => createNprItem({ itemType: 'observation', tier: 'dynamic', content: 'Inferred', expiresAt: at + 1000, sourceType: 'system_observation' }, actor, at),
    /Only user-provided/,
  );
});

test('fast-start context is owner-bound, visible, removable and unavailable immediately', async () => {
  const db = makeDB();
  await request(db, 'profile', 'POST', {
    name: 'Alice',
    focus: '',
    style: '',
    consent: '2026-09-05-v1',
  });
  const created = await request(db, 'context', 'POST', {
    itemType: 'goal',
    tier: 'dynamic',
    content: 'Prepare the difficult report',
    expiresAt: Date.now() + 7 * 86400000,
    sourceRef: 'onboarding:current-goal',
  });
  assert.equal(created.status, 200);
  const current = await request(db, 'context');
  assert.deepEqual(current.data.projection.items.map((item) => item.value), [
    'Prepare the difficult report',
  ]);
  const foreign = await worker.fetch(
    new Request('https://test.local/api/context', {
      method: 'DELETE',
      headers: {
        'oai-authenticated-user-id': 'bob',
        'oai-authenticated-user-email': 'bob@example.test',
        'content-type': 'application/json',
        origin: 'https://test.local',
      },
      body: JSON.stringify({ id: created.data.item.id }),
    }),
    { DB: db },
    { waitUntil() {} },
  );
  assert.equal(foreign.status, 403);
  assert.equal((await request(db, 'context', 'DELETE', { id: created.data.item.id })).status, 200);
  const removed = await request(db, 'context');
  assert.equal(removed.data.projection.items.length, 0);
  assert.equal(removed.data.items[0].content, '');
  db.db.close();
});
