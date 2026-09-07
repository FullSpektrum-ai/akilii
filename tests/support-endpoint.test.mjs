import { test } from 'node:test';
import assert from 'node:assert/strict';
import worker from '../dist/server/index.js';
import { makeDB } from './db-adapter.mjs';
test('planner endpoint authenticates, checks origin and returns no-write rules plans', async () => {
  const DB = makeDB();
  const call = async (
    path,
    data,
    identity = true,
    origin = 'https://fixture.test',
  ) =>
    worker.fetch(
      new Request('https://fixture.test/api/' + path, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          origin,
          ...(identity
            ? {
                'oai-authenticated-user-id': 'demo',
                'oai-authenticated-user-email': 'demo@example.test',
              }
            : {}),
        },
        body: JSON.stringify(data),
      }),
      { DB },
      {},
    );
  assert.equal((await call('support/plan', {}, false)).status, 401);
  await call('profile', { name: 'Fixture', consent: '2026-09-05-v1' });
  assert.equal(
    (await call('support/plan', {}, true, 'https://untrusted.test')).status,
    403,
  );
  const r = await call('support/plan', {
    message: 'one thing',
    items: [{ id: 'x', title: 'Draft a sentence' }],
  });
  assert.equal(r.status, 200);
  const result = await r.json();
  assert.equal(result.plan.representation, 'one_next_move');
  assert.equal(result.trace.costUsd, 0);
  assert.equal(DB.db.prepare('SELECT count(*) n FROM work_items').get().n, 0);
  assert.equal(DB.db.prepare('SELECT count(*) n FROM memories').get().n, 0);
  DB.db.close();
});
