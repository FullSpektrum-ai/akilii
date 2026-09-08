import test from 'node:test';
import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';
import fs from 'node:fs';
import { createSqlRepositories, createSqliteStore } from '../app/adapters/storage/index.js';

const migration0 = fs.readFileSync('drizzle/0000_fair_the_santerians.sql', 'utf8');
const migration1 = fs.readFileSync('drizzle/0001_v01_rebaseline.sql', 'utf8');

test('message replay requires identical content', async () => {
  const database = new DatabaseSync(':memory:');
  database.exec(migration0);
  database.exec(migration1);
  const repositories = createSqlRepositories(createSqliteStore(database), { userId: 'user-1' });

  await repositories.conversationRepository.ensure({
    id: 'c1',
    subjectId: 'user-1',
    title: 'Test',
    at: 1,
  });
  const write = {
    id: 'm1',
    subjectId: 'user-1',
    conversationId: 'c1',
    role: 'user',
    content: 'original',
    at: 2,
  };

  await repositories.conversationRepository.append(write);
  await repositories.conversationRepository.append(write);
  await assert.rejects(
    repositories.conversationRepository.append({ ...write, content: 'changed' }),
    error => error.code === 'IDEMPOTENCY_CONFLICT',
  );
  assert.equal(database.prepare('select content from messages where id=?').get('m1').content, 'original');
  database.close();
});
