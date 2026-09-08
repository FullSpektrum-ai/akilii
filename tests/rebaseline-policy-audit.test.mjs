import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { DatabaseSync } from 'node:sqlite';

const migration0 = fs.readFileSync('drizzle/0000_fair_the_santerians.sql', 'utf8');
const migration1 = fs.readFileSync('drizzle/0001_v01_rebaseline.sql', 'utf8');

function databaseWithSchema() {
  const database = new DatabaseSync(':memory:');
  database.exec(migration0);
  database.exec(migration1);
  return database;
}

test('policy audit events are append-only in the local database', () => {
  const database = databaseWithSchema();
  database.prepare(`
    INSERT INTO policy_events(user_id,event_type,subject_ref,policy_version,payload_json,created_at)
    VALUES(?,?,?,?,?,?)
  `).run('user-1', 'context.confirmed', 'context-1', 'v1', '{}', 100);

  const original = database.prepare('SELECT * FROM policy_events').get();
  assert.equal(original.event_type, 'context.confirmed');

  assert.throws(
    () => database.prepare('UPDATE policy_events SET event_type=? WHERE id=?').run('changed', original.id),
    /append-only/i,
  );
  assert.throws(
    () => database.prepare('DELETE FROM policy_events WHERE id=?').run(original.id),
    /append-only/i,
  );

  const after = database.prepare('SELECT * FROM policy_events WHERE id=?').get(original.id);
  assert.equal(after.event_type, 'context.confirmed');
  database.close();
});
