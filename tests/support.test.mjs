import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  episodeContext,
  supportProjection,
  validateSupportPlan,
} from '../src/support/contracts.js';
import { resolveSupport } from '../src/support/resolver.js';
import { planSupport } from '../backend/support-planner.js';
import { createDemoStore } from '../src/support/demo-store.js';
import { createTelemetry } from '../src/support/telemetry.js';
import { flagshipFixture } from '../src/support/fixtures.js';
const fixture = () => episodeContext(flagshipFixture);
const storage = () => {
  const data = new Map();
  return { getItem: (k) => data.get(k), setItem: (k, v) => data.set(k, v) };
};
test('projection admits only explicit included context; repeated normalization preserves consent', () => {
  const entries = [
    'explicit',
    'session',
    'confirmed',
    'inferred',
    'passive',
  ].map((source) => ({
    id: source,
    source,
    included: true,
    value: 'one_next_move',
  }));
  entries.push({
    id: 'excluded',
    source: 'confirmed',
    included: false,
    value: 'secret',
  });
  const projection = supportProjection(entries);
  assert.equal(projection.length, 3);
  assert.deepEqual(supportProjection(projection), projection);
  assert.deepEqual(supportProjection(entries, false), []);
});
test('episode strips unexpected factual/permission/person fields and bounds supplied input', () => {
  const ctx = episodeContext({
    ...flagshipFixture,
    diagnosis: 'invented',
    permissions: ['write'],
    message: 'x'.repeat(8000),
  });
  assert.equal(ctx.message.length, 5000);
  assert.equal(ctx.diagnosis, undefined);
  assert.equal(ctx.permissions, undefined);
  assert.throws(
    () =>
      episodeContext({
        items: [
          { id: 'x', title: 'a' },
          { id: 'x', title: 'b' },
        ],
      }),
    /Duplicate/,
  );
});
test('explicit request beats preference; override beats request; same items survive every view', () => {
  const context = fixture(),
    before = structuredClone(context.items);
  const preference = [
    { id: 'p', value: 'meaning_field', source: 'session', included: true },
  ];
  const one = resolveSupport(
    episodeContext({
      ...context,
      message: 'One thing please',
      projection: preference,
    }),
  );
  assert.equal(one.representation, 'one_next_move');
  assert.equal(one.foregroundIds.length, 1);
  assert.equal(
    resolveSupport({
      ...context,
      message: 'one thing',
      override: 'bounded_workset',
    }).foregroundIds.length,
    2,
  );
  assert.deepEqual(context.items, before);
});
test('plan rejects arbitrary components, unknown fields and nonexistent or duplicate references', () => {
  const c = fixture(),
    p = resolveSupport(c);
  for (const invalid of [
    { ...p, representation: 'html' },
    { ...p, permissions: ['write'] },
    { ...p, foregroundIds: ['unknown'] },
    { ...p, foregroundIds: ['opening', 'opening'] },
    { ...p, composer: 7 },
  ])
    assert.throws(() => validateSupportPlan(invalid, c));
  assert.throws(() =>
    validateSupportPlan({ ...p, representation: 'one_next_move' }, c),
  );
});
test('rules path has zero provider calls and measured zero cost', async () => {
  let called = 0;
  const r = await planSupport(
    { ...flagshipFixture, message: 'one thing' },
    {
      planner: () => {
        called++;
      },
    },
  );
  assert.equal(called, 0);
  assert.equal(r.plan.representation, 'one_next_move');
  const direct = await planSupport(flagshipFixture);
  assert.equal(direct.trace.costUsd, 0);
  assert.equal(direct.trace.source, 'rules');
});
test('invalid, failing and timed-out planners fall back without changing source facts', async () => {
  for (const planner of [
    async () => ({ html: 'bad' }),
    async () => {
      throw new Error('bad');
    },
    () => new Promise(() => {}),
  ]) {
    const r = await planSupport(flagshipFixture, { planner, timeoutMs: 5 });
    assert.equal(r.trace.source, 'rules');
    assert.ok(r.trace.failure);
    assert.equal(r.trace.costUsd, null);
  }
});
test('telemetry is bounded and drops raw content', () => {
  const t = createTelemetry();
  for (let i = 0; i < 150; i++)
    t.record('override', {
      from: 'one_next_move',
      to: 'meaning_field',
      message: 'private',
    });
  assert.equal(t.snapshot().length, 100);
  assert.equal(t.snapshot()[0].message, undefined);
});
test('demo proposal requires approval, replays once, survives reload and holds/resumes exact state', async () => {
  const disk = storage(),
    api = createDemoStore(disk);
  const args = {
    operation: 'create',
    title: 'Synthetic opening',
    body: 'Draft opening',
    request_key: 'request-12345',
  };
  const p = await api('runs', 'POST', args);
  assert.equal((await api('bootstrap')).work.length, 0);
  await assert.rejects(
    api('runs/' + p.run.id + '/approve', 'POST', { action_id: 'wrong' }),
  );
  const saved = await api('runs/' + p.run.id + '/approve', 'POST', {
    action_id: p.action_id,
  });
  await api('runs/' + p.run.id + '/approve', 'POST', {
    action_id: p.action_id,
  });
  assert.equal((await api('bootstrap')).work.length, 1);
  const held = await api('threads', 'POST', {
    title: 'Thursday',
    objective: 'Clear opening',
    work_id: saved.receipt.work_id,
    status: 'held',
    last_confirmed: 'Opening saved',
    next_move: 'Review the ask',
    request_key: 'thread-12345',
  });
  const reloaded = createDemoStore(disk);
  assert.equal(
    (await reloaded('threads')).threads[0].last_confirmed,
    'Opening saved',
  );
  const resumed = await reloaded('threads/' + held.thread.id, 'POST', {
    version: 1,
    status: 'active',
  });
  assert.equal(resumed.thread.next_move, 'Review the ask');
  await assert.rejects(
    reloaded('threads/' + held.thread.id, 'POST', {
      version: 1,
      status: 'held',
    }),
    /changed/,
  );
  const close = {
    version: 2,
    rating: 'helpful',
    note: '',
    request_key: 'outcome-12345',
  };
  await reloaded('threads/' + held.thread.id + '/close', 'POST', close);
  await reloaded('threads/' + held.thread.id + '/close', 'POST', close);
  assert.equal((await reloaded('bootstrap')).memories.length, 0);
});
test('cancelled proposals cannot save; failed storage produces no receipt or partial state', async () => {
  const disk = storage(),
    api = createDemoStore(disk),
    args = {
      operation: 'create',
      title: 'Fixture',
      body: 'Text',
      request_key: 'request-54321',
    };
  const p = await api('runs', 'POST', args);
  await api('runs/' + p.run.id + '/cancel', 'POST', {});
  await assert.rejects(
    api('runs/' + p.run.id + '/approve', 'POST', { action_id: p.action_id }),
    /cancelled/,
  );
  const q = await api('runs', 'POST', {
    ...args,
    request_key: 'request-54322',
  });
  disk.setItem = () => {
    throw new Error('full');
  };
  await assert.rejects(
    api('runs/' + q.run.id + '/approve', 'POST', { action_id: q.action_id }),
    /save failed/,
  );
  assert.equal((await api('bootstrap')).work.length, 0);
});
test('demo writes reject a stale second tab rather than losing updates', async () => {
  const disk = storage(),
    first = createDemoStore(disk),
    second = createDemoStore(disk);
  await first('runs', 'POST', {
    operation: 'create',
    title: 'A',
    body: 'A',
    request_key: 'first-request',
  });
  await assert.rejects(
    second('runs', 'POST', {
      operation: 'create',
      title: 'B',
      body: 'B',
      request_key: 'second-request',
    }),
    /another tab/,
  );
});
test('malformed episode bodies produce a bounded client error', async () => {
  for (const input of [null, [], { items: [null] }])
    await assert.rejects(planSupport(input), (error) => error.status === 400);
});
test('waiting and later items remain held when support narrows', () => {
  const c = episodeContext({ ...flagshipFixture, message: 'short plan' }),
    p = resolveSupport(c);
  assert.deepEqual(p.foregroundIds, ['opening', 'question']);
  assert.equal(c.items.length, 4);
});
