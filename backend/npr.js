const ITEM_TYPES = new Set([
  'user_assertion',
  'communication_preference',
  'support_preference',
  'goal',
  'friction',
  'strategy',
  'observation',
]);
const TIERS = new Set(['stable', 'semi_stable', 'dynamic']);
const PURPOSES = new Set(['support', 'planning', 'action', 'outcome_review']);
const SENSITIVITY = new Set(['standard', 'sensitive', 'highly_sensitive']);
const ACTIVE_CONFIRMATION = new Set(['user_asserted', 'confirmed']);

const bounded = (value, maximum) =>
  typeof value === 'string' ? value.trim().slice(0, maximum) : '';

export function createNprItem(input, actor, at = Date.now()) {
  const itemType = ITEM_TYPES.has(input?.itemType) ? input.itemType : null;
  const tier = TIERS.has(input?.tier) ? input.tier : null;
  const content = bounded(input?.content, 1500);
  const sensitivity = SENSITIVITY.has(input?.sensitivity)
    ? input.sensitivity
    : 'standard';
  const purposes = Array.from(
    new Set(
      (Array.isArray(input?.purposeScopes) ? input.purposeScopes : ['support'])
        .filter((purpose) => PURPOSES.has(purpose))
        .slice(0, 4),
    ),
  );
  if (!actor?.id || !itemType || !tier || !content || !purposes.length)
    throw Object.assign(new Error('This context item is incomplete.'), { status: 400 });
  if (input.sourceType && !['user_statement', 'user_edit'].includes(input.sourceType))
    throw Object.assign(new Error('Only user-provided context can be saved here.'), { status: 400 });
  const expiry = tier === 'dynamic' ? Number(input.expiresAt) : 0;
  if (tier === 'dynamic' && (!Number.isSafeInteger(expiry) || expiry <= at || expiry > at + 31 * 86400000))
    throw Object.assign(new Error('Temporary context needs a valid review date.'), { status: 400 });
  return {
    id: crypto.randomUUID(),
    userId: actor.id,
    itemType,
    tier,
    content,
    lifecycleState: 'active',
    confirmationState: 'user_asserted',
    confidence: 1000,
    sensitivity,
    sourceType: input.sourceType || 'user_statement',
    sourceRef: bounded(input.sourceRef, 100) || null,
    capturedAt: at,
    validFrom: at,
    reviewAfter: tier === 'dynamic' ? expiry : null,
    expiresAt: tier === 'dynamic' ? expiry : null,
    supersedesId: null,
    useAllowed: 1,
    purposeScopes: JSON.stringify(purposes),
    version: 1,
    schemaVersion: '1.0',
    createdAt: at,
    updatedAt: at,
  };
}

function scopes(row) {
  try {
    const values = JSON.parse(row.purpose_scopes);
    return Array.isArray(values) ? values.filter((value) => PURPOSES.has(value)) : [];
  } catch {
    return [];
  }
}

export function projectNpr(rows, { purpose = 'support', now = Date.now(), maxItems = 12 } = {}) {
  if (!PURPOSES.has(purpose))
    throw Object.assign(new Error('Unknown context purpose.'), { status: 400 });
  const excludedCountsByReason = {};
  const exclude = (reason) => {
    excludedCountsByReason[reason] = (excludedCountsByReason[reason] || 0) + 1;
  };
  const items = [];
  for (const row of Array.isArray(rows) ? rows : []) {
    if (row.lifecycle_state !== 'active') exclude('inactive');
    else if (!ACTIVE_CONFIRMATION.has(row.confirmation_state)) exclude('unconfirmed');
    else if (Number(row.use_allowed) !== 1) exclude('restricted');
    else if (row.valid_from && Number(row.valid_from) > now) exclude('not_yet_valid');
    else if (row.expires_at && Number(row.expires_at) <= now) exclude('expired');
    else if (row.sensitivity === 'highly_sensitive') exclude('sensitivity');
    else if (!scopes(row).includes(purpose)) exclude('purpose');
    else if (items.length >= Math.max(0, Math.min(Number(maxItems) || 0, 12))) exclude('limit');
    else
      items.push({
        itemId: row.id,
        itemType: row.item_type,
        tier: row.tier,
        value: row.content,
        confidence: Number(row.confidence) / 1000,
        confirmationState: row.confirmation_state,
        relevantBecause: 'You chose to use this for ' + purpose + '.',
      });
  }
  return {
    projectionId: crypto.randomUUID(),
    purpose,
    items,
    excludedCountsByReason,
    generatedAt: now,
    schemaVersion: '1.0',
  };
}

export function publicNprItem(row) {
  return {
    id: row.id,
    itemType: row.item_type,
    tier: row.tier,
    content: row.content,
    lifecycleState: row.lifecycle_state,
    confirmationState: row.confirmation_state,
    sensitivity: row.sensitivity,
    sourceType: row.source_type,
    useAllowed: Number(row.use_allowed) === 1,
    purposeScopes: scopes(row),
    expiresAt: row.expires_at ? Number(row.expires_at) : null,
    version: Number(row.version),
    createdAt: Number(row.created_at),
    updatedAt: Number(row.updated_at),
  };
}
