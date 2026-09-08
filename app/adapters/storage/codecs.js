const text = (value, fallback = '') => (typeof value === 'string' ? value : fallback);
const number = (value, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

export function encodeJson(value) {
  return JSON.stringify(value ?? null);
}

export function decodeJson(value, fallback) {
  if (value === null || value === undefined || value === '') return fallback;
  if (typeof value === 'object') return value;
  try {
    const parsed = JSON.parse(value);
    return parsed ?? fallback;
  } catch {
    return fallback;
  }
}

export function contextItemFromRow(row) {
  if (!row) return null;
  return {
    id: text(row.id),
    itemType: text(row.item_type),
    tier: text(row.tier),
    payload: decodeJson(row.payload_json, {}),
    lifecycleState: text(row.lifecycle_state),
    confirmationState: text(row.confirmation_state),
    confidence: number(row.confidence, 0.5),
    sensitivity: text(row.sensitivity, 'standard'),
    provenance: {
      sourceType: text(row.source_type, 'unknown'),
      sourceRef: text(row.source_ref),
      capturedAt: row.captured_at ? new Date(number(row.captured_at)).toISOString() : '',
      capturedBy: text(row.captured_by, 'system'),
    },
    validFrom: row.valid_from ? new Date(number(row.valid_from)).toISOString() : '',
    reviewAfter: row.review_after ? new Date(number(row.review_after)).toISOString() : '',
    expiresAt: row.expires_at ? new Date(number(row.expires_at)).toISOString() : '',
    evidenceRefs: decodeJson(row.evidence_refs_json, []),
    controls: {
      useAllowed: Number(row.use_allowed) === 1 || row.use_allowed === true,
      purposeScopes: decodeJson(row.purpose_scopes_json, []),
      exportAllowed: Number(row.export_allowed) === 1 || row.export_allowed === true,
    },
    version: number(row.version, 1),
  };
}

export function contextProposalFromRow(row) {
  if (!row) return null;
  return {
    id: text(row.id),
    candidateItemId: text(row.candidate_item_id),
    itemType: text(row.item_type),
    tier: text(row.tier),
    payload: decodeJson(row.payload_json, {}),
    status: text(row.status),
    sensitivity: text(row.sensitivity, 'standard'),
    confidence: number(row.confidence, 0.5),
    purposeScopes: decodeJson(row.purpose_scopes_json, []),
    sourceRef: text(row.source_ref),
    rationale: text(row.rationale),
    version: number(row.version, 1),
    createdAt: number(row.created_at),
    updatedAt: number(row.updated_at),
  };
}

export function threadFromRow(row) {
  if (!row) return null;
  return {
    id: text(row.id),
    subjectId: text(row.user_id),
    title: text(row.title),
    objective: text(row.objective),
    status: text(row.status),
    conversationId: text(row.conversation_id) || null,
    workId: text(row.work_id) || null,
    lastConfirmed: text(row.last_confirmed),
    lastDecision: text(row.last_decision),
    nextMove: text(row.next_move),
    openQuestions: decodeJson(row.open_questions, []),
    version: number(row.version, 1),
    createdAt: number(row.created_at),
    updatedAt: number(row.updated_at),
  };
}

export function workFromRow(row) {
  if (!row) return null;
  return {
    id: text(row.id),
    subjectId: text(row.user_id),
    threadId: text(row.thread_id) || null,
    title: text(row.title),
    body: text(row.body),
    status: text(row.status, 'active'),
    version: number(row.version, 1),
    createdAt: number(row.created_at),
    updatedAt: number(row.updated_at),
  };
}
