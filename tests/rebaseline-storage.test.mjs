import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { DatabaseSync } from 'node:sqlite';

import {
  createSqlRepositories,
  createSqliteStore,
} from '../app/adapters/storage/index.js';
import {
  createThread,
  createWorkItem,
  projectContext,
  transitionThread,
  transitionWork,
} from '../app/core/index.js';

const migration0 = fs.readFileSync('drizzle/0000_fair_the_santerians.sql', 'utf8');
const migration1 = fs.readFileSync('drizzle/0001_v01_rebaseline.sql', 'utf8');

function databaseWithSchema() {
  const database = new DatabaseSync(':memory:');
  database.exec(migration0);
  database.exec(migration1);
  return database;
}

function repositories(database, userId = 'user-1', now = 1_000) {
  const store = createSqliteStore(database);
  return {
    store,
    ...createSqlRepositories(store, { userId, clock: () => now }),
  };
}

function seedProposal(database, overrides = {}) {
  const row = {
    id: 'proposal-1',
    user_id: 'user-1',
    candidate_item_id: 'context-1',
    item_type: 'support_preference',
    tier: 'semi_stable',
    payload_json: JSON.stringify({ strategy: 'whole_map_first' }),
    status: 'proposed',
    sensitivity: 'standard',
    confidence: 0.9,
    purpose_scopes_json: JSON.stringify(['support']),
    source_type: 'user_statement',
    source_ref: 'conversation-1',
    captured_by: 'user',
    evidence_refs_json: JSON.stringify([]),
    rationale: 'User explicitly described a useful working preference.',
    version: 1,
    created_at: 100,
    updated_at: 100,
    ...overrides,
  };

  database.prepare(`
    INSERT INTO npr_proposals(
      id,user_id,candidate_item_id,item_type,tier,payload_json,status,sensitivity,
      confidence,purpose_scopes_json,source_type,source_ref,captured_by,evidence_refs_json,
      rationale,version,created_at,updated_at
    ) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
  `).run(
    row.id,
    row.user_id,
    row.candidate_item_id,
    row.item_type,
    row.tier,
    row.payload_json,
    row.status,
    row.sensitivity,
    row.confidence,
    row.purpose_scopes_json,
    row.source_type,
    row.source_ref,
    row.captured_by,
    row.evidence_refs_json,
    row.rationale,
    row.version,
    row.created_at,
    row.updated_at,
  );
}

test('the checked-in SQLite migrations apply cleanly together', () => {
  const database = databaseWithSchema();
  const tables = database
    .prepare("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name")
    .all()
    .map(row => row.name);

  for (const name of [
    'threads',
    'npr_items',
    'npr_proposals',
    'episodes',
    'interventions',
    'npr_evidence',
    'support_outcomes',
    'policy_events',
  ]) {
    assert.ok(tables.includes(name), `missing ${name}`);
  }
  database.close();
});

test('the additive migration preserves legacy user data', () => {
  const database = new DatabaseSync(':memory:');
  database.exec(migration0);
  database
    .prepare('INSERT INTO memories(id,user_id,content,source,created_at) VALUES(?,?,?,?,?)')
    .run('memory-1', 'user-1', 'Legacy preference', 'Added by you', 1);

  database.exec(migration1);

  const memory = database.prepare('SELECT * FROM memories WHERE id=?').get('memory-1');
  assert.equal(memory.content, 'Legacy preference');
  assert.equal(database.prepare('SELECT count(*) AS n FROM support_outcomes').get().n, 0);
  database.close();
});

test('Thread and Work repositories round-trip the canonical state contracts', async () => {
  const database = databaseWithSchema();
  const { threadRepository, workRepository } = repositories(database);

  const thread = createThread({
    id: 'thread-1',
    subjectId: 'user-1',
    title: 'Review architecture',
    objective: 'Make the architecture easy to review.',
    nextMove: 'Review storage boundaries.',
    openQuestions: ['Does local mode use the same semantics?'],
    at: 100,
  });
  const savedThread = await threadRepository.save({ thread, expectedVersion: null });
  assert.equal(savedThread.status, 'active');
  assert.deepEqual(savedThread.openQuestions, ['Does local mode use the same semantics?']);

  const held = transitionThread(savedThread, {
    to: 'held',
    nextMove: 'Resume after storage review.',
    at: 200,
  });
  const updatedThread = await threadRepository.save({
    thread: held,
    expectedVersion: savedThread.version,
  });
  assert.equal(updatedThread.status, 'held');
  assert.equal(updatedThread.version, 2);

  const work = createWorkItem({
    id: 'work-1',
    subjectId: 'user-1',
    threadId: 'thread-1',
    title: 'Storage review',
    body: 'Check cloud/local repository parity.',
    approved: true,
    at: 100,
  });
  const savedWork = await workRepository.save({ work, expectedVersion: null });
  assert.equal(savedWork.threadId, 'thread-1');
  assert.equal(savedWork.status, 'active');

  const completed = transitionWork(savedWork, {
    to: 'completed',
    confirmedComplete: true,
    at: 300,
  });
  const updatedWork = await workRepository.save({
    work: completed,
    expectedVersion: savedWork.version,
  });
  assert.equal(updatedWork.status, 'completed');
  assert.equal(updatedWork.version, 2);
  database.close();
});

test('Episode persistence is idempotent for the owning subject', async () => {
  const database = databaseWithSchema();
  const { episodeRepository } = repositories(database);
  const episode = {
    id: 'episode-1',
    subjectId: 'user-1',
    conversationId: 'conversation-1',
    threadId: 'thread-1',
    objective: 'Review architecture.',
    interventionRef: null,
    status: 'open',
    startedAt: 100,
    endedAt: null,
  };

  await episodeRepository.open(episode);
  await episodeRepository.open(episode);
  assert.equal(database.prepare('SELECT count(*) AS n FROM episodes').get().n, 1);
  database.close();
});

test('confirming a context proposal is transactional and versioned', async () => {
  const database = databaseWithSchema();
  const { contextRepository } = repositories(database, 'user-1', 1_000);
  seedProposal(database);

  const item = await contextRepository.confirmProposal({
    subjectId: 'user-1',
    proposalId: 'proposal-1',
    expectedVersion: 1,
  });

  assert.equal(item.id, 'context-1');
  assert.equal(item.lifecycleState, 'active');
  assert.equal(item.confirmationState, 'confirmed');
  assert.equal(item.payload.strategy, 'whole_map_first');
  assert.equal(
    database.prepare('SELECT status FROM npr_proposals WHERE id=?').get('proposal-1').status,
    'confirmed',
  );

  await assert.rejects(
    contextRepository.confirmProposal({
      subjectId: 'user-1',
      proposalId: 'proposal-1',
      expectedVersion: 1,
    }),
    /not found|changed/i,
  );
  database.close();
});

test('a failed context confirmation rolls the whole transaction back', async () => {
  const database = databaseWithSchema();
  const { contextRepository } = repositories(database, 'user-1', 1_000);
  seedProposal(database);

  await assert.rejects(
    contextRepository.confirmProposal({
      subjectId: 'user-1',
      proposalId: 'proposal-1',
      expectedVersion: 1,
      edits: { itemType: 'not-a-valid-context-type' },
    }),
    /Invalid context item type/i,
  );

  assert.equal(database.prepare('SELECT count(*) AS n FROM npr_items').get().n, 0);
  const proposal = database.prepare('SELECT status,version FROM npr_proposals WHERE id=?').get('proposal-1');
  assert.equal(proposal.status, 'proposed');
  assert.equal(proposal.version, 1);
  database.close();
});

test('restriction updates are respected by the core projection engine', async () => {
  const database = databaseWithSchema();
  const { contextRepository } = repositories(database, 'user-1', 1_000);
  seedProposal(database);
  const item = await contextRepository.confirmProposal({
    subjectId: 'user-1',
    proposalId: 'proposal-1',
    expectedVersion: 1,
  });

  const restricted = await contextRepository.restrictItem({
    subjectId: 'user-1',
    itemId: item.id,
    expectedVersion: item.version,
    useAllowed: false,
    purposeScopes: ['support'],
  });
  assert.equal(restricted.controls.useAllowed, false);

  const projection = projectContext(await contextRepository.listForSubject('user-1'), {
    purpose: 'support',
    sensitivityAllowance: 'standard',
    now: '2026-09-08T12:00:00.000Z',
  });
  assert.deepEqual(projection.items, []);
  assert.equal(projection.excludedCounts.restricted, 1);
  database.close();
});

test('repositories reject cross-subject access before SQL returns product data', async () => {
  const database = databaseWithSchema();
  const { contextRepository, threadRepository } = repositories(database, 'user-1');

  await assert.rejects(contextRepository.listForSubject('user-2'), error => error.code === 'SUBJECT_MISMATCH');
  await assert.rejects(
    threadRepository.get({ id: 'thread-1', subjectId: 'user-2' }),
    error => error.code === 'SUBJECT_MISMATCH',
  );
  database.close();
});
