import { normaliseContextItem } from '../../core/index.js';
import {
  contextItemFromRow,
  contextProposalFromRow,
  decodeJson,
  encodeJson,
} from './codecs.js';

const text = (value, max = 1000) =>
  typeof value === 'string' ? value.trim().slice(0, max) : '';

function sameSubject(subjectId, userId) {
  if (!subjectId || subjectId !== userId) {
    throw Object.assign(new Error('Context subject is unavailable.'), { code: 'SUBJECT_MISMATCH' });
  }
  return subjectId;
}

function version(value) {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 1) throw new TypeError('Expected version is required.');
  return parsed;
}

function proposalCandidate(row, edits, now) {
  const payload = edits?.payload && typeof edits.payload === 'object'
    ? edits.payload
    : decodeJson(row.payload_json, {});
  const purposeScopes = Array.isArray(edits?.purposeScopes)
    ? edits.purposeScopes
    : decodeJson(row.purpose_scopes_json, []);
  return normaliseContextItem({
    id: row.candidate_item_id,
    itemType: text(edits?.itemType, 40) || row.item_type,
    tier: text(edits?.tier, 20) || row.tier,
    payload,
    lifecycleState: 'active',
    confirmationState: 'confirmed',
    confidence: edits?.confidence ?? row.confidence,
    sensitivity: text(edits?.sensitivity, 30) || row.sensitivity,
    provenance: {
      sourceType: row.source_type,
      sourceRef: row.source_ref,
      capturedAt: new Date(Number(row.created_at || now)).toISOString(),
      capturedBy: row.captured_by,
    },
    evidenceRefs: decodeJson(row.evidence_refs_json, []),
    controls: {
      useAllowed: true,
      purposeScopes,
      exportAllowed: true,
    },
    version: 1,
  });
}

async function writeCandidate(store, userId, item, now) {
  const existing = await store.first(
    'SELECT id,version FROM npr_items WHERE id=? AND user_id=?',
    [item.id, userId],
  );
  const fields = [
    item.itemType,
    item.tier,
    encodeJson(item.payload),
    item.lifecycleState,
    item.confirmationState,
    item.confidence,
    item.sensitivity,
    item.provenance.sourceType,
    item.provenance.sourceRef,
    now,
    item.provenance.capturedBy,
    encodeJson(item.evidenceRefs),
    1,
    encodeJson(item.controls.purposeScopes),
    1,
    now,
  ];

  if (!existing) {
    await store.run(
      `INSERT INTO npr_items(
        id,user_id,item_type,tier,payload_json,lifecycle_state,confirmation_state,
        confidence,sensitivity,source_type,source_ref,captured_at,captured_by,
        evidence_refs_json,use_allowed,purpose_scopes_json,export_allowed,version,created_at,updated_at
      ) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [item.id, userId, ...fields.slice(0, 12), ...fields.slice(12, 15), 1, now, now],
    );
    return contextItemFromRow(
      await store.first('SELECT * FROM npr_items WHERE id=? AND user_id=?', [item.id, userId]),
    );
  }

  const currentVersion = Number(existing.version);
  const result = await store.run(
    `UPDATE npr_items SET
      item_type=?,tier=?,payload_json=?,lifecycle_state=?,confirmation_state=?,confidence=?,
      sensitivity=?,source_type=?,source_ref=?,captured_at=?,captured_by=?,evidence_refs_json=?,
      use_allowed=?,purpose_scopes_json=?,export_allowed=?,version=?,updated_at=?
     WHERE id=? AND user_id=? AND version=?`,
    [
      ...fields.slice(0, 15),
      currentVersion + 1,
      now,
      item.id,
      userId,
      currentVersion,
    ],
  );
  if (result.changes !== 1) throw Object.assign(new Error('Context changed. Reload before updating it.'), { code: 'VERSION_CONFLICT' });
  return contextItemFromRow(
    await store.first('SELECT * FROM npr_items WHERE id=? AND user_id=?', [item.id, userId]),
  );
}

export function createContextRepository(store, { userId, clock = Date.now } = {}) {
  if (!store?.transaction) throw new TypeError('Transactional store is required.');
  if (!text(userId, 100)) throw new TypeError('Repository user is required.');

  async function listForSubject(subjectId) {
    sameSubject(subjectId, userId);
    const rows = await store.all(
      "SELECT * FROM npr_items WHERE user_id=? AND lifecycle_state<>'deleted' ORDER BY updated_at DESC",
      [userId],
    );
    return rows.map(contextItemFromRow);
  }

  async function listProposals(subjectId) {
    sameSubject(subjectId, userId);
    const rows = await store.all(
      "SELECT * FROM npr_proposals WHERE user_id=? AND status='proposed' ORDER BY created_at DESC",
      [userId],
    );
    return rows.map(contextProposalFromRow);
  }

  async function confirmProposal(input) {
    sameSubject(input.subjectId, userId);
    const expectedVersion = version(input.expectedVersion);
    return store.transaction(async tx => {
      const row = await tx.first(
        "SELECT * FROM npr_proposals WHERE id=? AND user_id=? AND status='proposed'",
        [input.proposalId, userId],
      );
      if (!row) throw new Error('Context proposal not found.');
      if (Number(row.version) !== expectedVersion) throw Object.assign(new Error('Context proposal changed.'), { code: 'VERSION_CONFLICT' });
      const now = Number(clock());
      const item = await writeCandidate(tx, userId, proposalCandidate(row, input.edits, now), now);
      const result = await tx.run(
        "UPDATE npr_proposals SET status='confirmed',version=version+1,updated_at=? WHERE id=? AND user_id=? AND version=? AND status='proposed'",
        [now, input.proposalId, userId, expectedVersion],
      );
      if (result.changes !== 1) throw Object.assign(new Error('Context proposal changed.'), { code: 'VERSION_CONFLICT' });
      return item;
    });
  }

  async function rejectProposal(input) {
    sameSubject(input.subjectId, userId);
    const expectedVersion = version(input.expectedVersion);
    const result = await store.run(
      "UPDATE npr_proposals SET status='rejected',version=version+1,updated_at=? WHERE id=? AND user_id=? AND version=? AND status='proposed'",
      [Number(clock()), input.proposalId, userId, expectedVersion],
    );
    if (result.changes !== 1) throw Object.assign(new Error('Context proposal changed.'), { code: 'VERSION_CONFLICT' });
    return { proposalId: input.proposalId, status: 'rejected' };
  }

  async function restrictItem(input) {
    sameSubject(input.subjectId, userId);
    const expectedVersion = version(input.expectedVersion);
    const result = await store.run(
      'UPDATE npr_items SET use_allowed=?,purpose_scopes_json=?,version=version+1,updated_at=? WHERE id=? AND user_id=? AND version=?',
      [input.useAllowed === true ? 1 : 0, encodeJson(input.purposeScopes || []), Number(clock()), input.itemId, userId, expectedVersion],
    );
    if (result.changes !== 1) throw Object.assign(new Error('Context changed.'), { code: 'VERSION_CONFLICT' });
    return contextItemFromRow(await store.first('SELECT * FROM npr_items WHERE id=? AND user_id=?', [input.itemId, userId]));
  }

  async function deleteItem(input) {
    sameSubject(input.subjectId, userId);
    const expectedVersion = version(input.expectedVersion);
    const result = await store.run(
      'DELETE FROM npr_items WHERE id=? AND user_id=? AND version=?',
      [input.itemId, userId, expectedVersion],
    );
    if (result.changes !== 1) throw Object.assign(new Error('Context changed.'), { code: 'VERSION_CONFLICT' });
    return { itemId: input.itemId, deleted: true };
  }

  return Object.freeze({
    listForSubject,
    listProposals,
    confirmProposal,
    rejectProposal,
    restrictItem,
    deleteItem,
  });
}
