const ITEM_TYPES = new Set([
  'user_assertion',
  'communication_preference',
  'support_preference',
  'observation',
  'goal',
  'friction',
  'strategy',
  'relationship_reference',
]);

const TIERS = new Set(['stable', 'semi_stable', 'dynamic']);
const LIFECYCLE_STATES = new Set([
  'captured',
  'classified',
  'proposed',
  'active',
  'contradicted',
  'superseded',
  'deprecated',
  'expired',
  'deleted',
]);
const CONFIRMATION_STATES = new Set([
  'user_asserted',
  'proposed',
  'confirmed',
  'rejected',
  'not_required',
]);
const SENSITIVITY = ['standard', 'sensitive', 'highly_sensitive'];
const PURPOSES = new Set(['support', 'planning', 'action', 'outcome_review']);
const ELIGIBLE_CONFIRMATION = new Set(['user_asserted', 'confirmed', 'not_required']);

const asText = (value, max = 500) =>
  typeof value === 'string' ? value.trim().slice(0, max) : '';

const asArray = value => (Array.isArray(value) ? value : []);

const boundedNumber = (value, min, max, fallback) => {
  const number = Number(value);
  return Number.isFinite(number) ? Math.min(max, Math.max(min, number)) : fallback;
};

const copyRecord = value =>
  value && typeof value === 'object' && !Array.isArray(value) ? { ...value } : {};

function requireEnum(value, allowed, field) {
  if (!allowed.has(value)) throw new TypeError(`Invalid ${field}.`);
  return value;
}

function normaliseScopes(value) {
  return asArray(value)
    .map(scope => asText(scope, 40))
    .filter(Boolean)
    .slice(0, 12);
}

/**
 * Normalise one governed NPR/context item at the product boundary.
 * This does not decide whether the item is allowed in a particular interaction.
 */
export function normaliseContextItem(raw = {}) {
  const id = asText(raw.id, 100);
  if (!id) throw new TypeError('Context item id is required.');

  const itemType = requireEnum(
    asText(raw.itemType ?? raw.item_type, 40),
    ITEM_TYPES,
    'context item type',
  );
  const tier = requireEnum(asText(raw.tier, 20), TIERS, 'context tier');
  const lifecycleState = requireEnum(
    asText(raw.lifecycleState ?? raw.lifecycle_state, 30),
    LIFECYCLE_STATES,
    'context lifecycle state',
  );
  const confirmationState = requireEnum(
    asText(raw.confirmationState ?? raw.confirmation_state, 30),
    CONFIRMATION_STATES,
    'context confirmation state',
  );
  const sensitivity = asText(raw.sensitivity, 30);
  if (!SENSITIVITY.includes(sensitivity)) throw new TypeError('Invalid context sensitivity.');

  const controls = copyRecord(raw.controls);
  const provenance = copyRecord(raw.provenance);

  return {
    id,
    itemType,
    tier,
    payload: copyRecord(raw.payload),
    lifecycleState,
    confirmationState,
    confidence: boundedNumber(raw.confidence, 0, 1, 0.5),
    sensitivity,
    provenance: {
      sourceType: asText(provenance.sourceType ?? raw.source_type, 40) || 'unknown',
      sourceRef: asText(provenance.sourceRef ?? raw.source_ref, 120),
      capturedAt: asText(provenance.capturedAt ?? raw.captured_at, 40),
      capturedBy: asText(provenance.capturedBy ?? raw.captured_by, 30) || 'system',
    },
    validFrom: asText(raw.validFrom ?? raw.valid_from, 40),
    reviewAfter: asText(raw.reviewAfter ?? raw.review_after, 40),
    expiresAt: asText(raw.expiresAt ?? raw.expires_at, 40),
    evidenceRefs: asArray(raw.evidenceRefs ?? raw.evidence_refs)
      .map(ref => asText(ref, 100))
      .filter(Boolean)
      .slice(0, 20),
    controls: {
      useAllowed: controls.useAllowed ?? raw.use_allowed ?? true,
      purposeScopes: normaliseScopes(controls.purposeScopes ?? raw.purpose_scopes),
      exportAllowed: controls.exportAllowed ?? raw.export_allowed ?? true,
    },
    version: Math.round(boundedNumber(raw.version, 1, Number.MAX_SAFE_INTEGER, 1)),
  };
}

function timestamp(value) {
  const parsed = value ? Date.parse(value) : NaN;
  return Number.isFinite(parsed) ? parsed : null;
}

function eligibility(item, request, now) {
  if (item.lifecycleState !== 'active') return 'lifecycle';
  if (!ELIGIBLE_CONFIRMATION.has(item.confirmationState)) return 'confirmation';
  if (item.controls.useAllowed !== true) return 'restricted';

  const validFrom = timestamp(item.validFrom);
  if (validFrom !== null && validFrom > now) return 'not_yet_valid';

  const expiresAt = timestamp(item.expiresAt);
  if (expiresAt !== null && expiresAt <= now) return 'expired';

  const allowedSensitivity = SENSITIVITY.indexOf(request.sensitivityAllowance);
  const itemSensitivity = SENSITIVITY.indexOf(item.sensitivity);
  if (itemSensitivity > allowedSensitivity) return 'sensitivity';

  const scopes = item.controls.purposeScopes;
  if (scopes.length && !scopes.includes('*') && !scopes.includes(request.purpose)) {
    return 'purpose';
  }

  return null;
}

function requestWords(request) {
  return [request.role, request.activity, request.objective, request.environment, request.currentState]
    .join(' ')
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter(word => word.length >= 5)
    .slice(0, 60);
}

function itemSearchText(item) {
  const payload = item.payload;
  const explicit = [
    payload.value,
    payload.statement,
    payload.title,
    payload.description,
    payload.strategy,
    ...asArray(payload.tags),
    ...asArray(payload.domains),
  ];
  return explicit.map(value => asText(value, 300).toLowerCase()).join(' ');
}

function relevanceScore(item, request, words) {
  let score = 0;
  if (item.confirmationState === 'user_asserted') score += 40;
  else if (item.confirmationState === 'confirmed') score += 35;
  else score += 15;

  score += item.confidence * 10;
  score += item.tier === 'dynamic' ? 8 : item.tier === 'semi_stable' ? 5 : 2;

  const scopes = item.controls.purposeScopes;
  score += scopes.includes(request.purpose) ? 18 : scopes.includes('*') ? 10 : 4;

  const haystack = itemSearchText(item);
  for (const word of words) if (haystack.includes(word)) score += 1;
  return score;
}

/**
 * Create the smallest permitted context projection for one declared purpose.
 * The function never mutates source items and never returns excluded payloads.
 */
export function projectContext(items = [], input = {}) {
  const purpose = PURPOSES.has(input.purpose) ? input.purpose : 'support';
  const sensitivityAllowance = SENSITIVITY.includes(input.sensitivityAllowance)
    ? input.sensitivityAllowance
    : 'standard';
  const request = {
    purpose,
    sensitivityAllowance,
    role: asText(input.role, 160),
    activity: asText(input.activity, 240),
    objective: asText(input.objective, 800),
    environment: asText(input.environment, 240),
    currentState: asText(input.currentState, 800),
  };
  const now = timestamp(input.now) ?? Date.now();
  const maxItems = Math.round(boundedNumber(input.maxItems, 0, 20, 8));
  const excludedCounts = {};
  const eligible = [];
  const words = requestWords(request);

  for (const raw of asArray(items)) {
    let item;
    try {
      item = normaliseContextItem(raw);
    } catch {
      excludedCounts.invalid = (excludedCounts.invalid ?? 0) + 1;
      continue;
    }

    const reason = eligibility(item, request, now);
    if (reason) {
      excludedCounts[reason] = (excludedCounts[reason] ?? 0) + 1;
      continue;
    }

    eligible.push({ item, score: relevanceScore(item, request, words) });
  }

  eligible.sort((left, right) =>
    right.score - left.score || left.item.id.localeCompare(right.item.id),
  );

  return {
    version: 1,
    purpose,
    generatedAt: new Date(now).toISOString(),
    items: eligible.slice(0, maxItems).map(({ item }) => ({
      itemId: item.id,
      itemType: item.itemType,
      tier: item.tier,
      payload: item.payload,
      confidence: item.confidence,
      confirmationState: item.confirmationState,
      evidenceRefs: item.evidenceRefs,
    })),
    excludedCounts,
  };
}

export const contextContract = Object.freeze({
  itemTypes: Object.freeze([...ITEM_TYPES]),
  purposes: Object.freeze([...PURPOSES]),
  sensitivity: Object.freeze([...SENSITIVITY]),
});
