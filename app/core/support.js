const REPRESENTATIONS = new Set([
  'one_next_move',
  'bounded_workset',
  'meaning_field',
  'reflective_space',
]);
const LEVELS = new Set(['low', 'medium', 'high']);
const LENGTHS = new Set(['short', 'medium', 'detailed']);
const PACES = new Set(['patient', 'balanced', 'quick']);

const DEFAULT_PROFILE = Object.freeze({
  version: 1,
  representation: 'bounded_workset',
  responseLength: 'medium',
  decomposition: 'medium',
  challenge: 'medium',
  initiative: 'suggestive',
  socraticDepth: 'medium',
  verificationDepth: 'medium',
  pace: 'balanced',
  maxOptions: 2,
});

const text = value => (typeof value === 'string' ? value.trim() : '');
const itemsOf = projection => (Array.isArray(projection?.items) ? projection.items : []);

function payloadOf(item) {
  return item?.payload && typeof item.payload === 'object' ? item.payload : {};
}

function first(items, predicate) {
  return items.find(item => predicate(item.itemType, payloadOf(item)));
}

function strategyValue(payload) {
  return text(payload.strategy || payload.value).toLowerCase();
}

function explicitRepresentation(message) {
  if (!message) return null;
  if (/\b(just listen|listen for now|do not solve|don't solve|let me think aloud|reflect this back)\b/i.test(message)) {
    return 'reflective_space';
  }
  if (/\b(one thing|one step|one next step|one next move|just the next step|keep it simple)\b/i.test(message)) {
    return 'one_next_move';
  }
  if (/\b(full picture|whole picture|big picture|overview first|map (?:it|this|everything)|show me the system)\b/i.test(message)) {
    return 'meaning_field';
  }
  if (/\b(options|few choices|top three|short plan|bounded plan|prioriti[sz]e)\b/i.test(message)) {
    return 'bounded_workset';
  }
  return null;
}

function explicitLevel(message, patterns) {
  for (const [level, pattern] of patterns) if (pattern.test(message)) return level;
  return null;
}

function explicitOverrides(input) {
  const message = text(input.message);
  const session = input.session && typeof input.session === 'object' ? input.session : {};
  const representation = REPRESENTATIONS.has(session.representation)
    ? session.representation
    : explicitRepresentation(message);
  const responseLength = LENGTHS.has(session.responseLength)
    ? session.responseLength
    : explicitLevel(message, [
        ['short', /\b(short|brief|concise|quick answer)\b/i],
        ['detailed', /\b(detailed|deep dive|in depth|thorough)\b/i],
      ]);
  const challenge = LEVELS.has(session.challenge)
    ? session.challenge
    : explicitLevel(message, [
        ['high', /\b(challenge me|push back|devil'?s advocate|adversarial|stress[- ]test)\b/i],
        ['low', /\b(no pushback|gentle|low pressure|don't challenge|do not challenge)\b/i],
      ]);
  const pace = PACES.has(session.pace)
    ? session.pace
    : explicitLevel(message, [
        ['patient', /\b(give me time|slow(?:er)?|patient)\b/i],
        ['quick', /\b(keep it moving|move quickly|fast pace)\b/i],
      ]);
  const socraticDepth = LEVELS.has(session.socraticDepth)
    ? session.socraticDepth
    : explicitLevel(message, [
        ['high', /\b(question my assumptions|socratic|interrogate this|ask me questions)\b/i],
        ['low', /\b(no questions|don't ask questions|do not ask questions|just answer)\b/i],
      ]);

  return { representation, responseLength, challenge, pace, socraticDepth };
}

function learnedPreferences(items) {
  const oneMove = first(items, (type, payload) =>
    ['support_preference', 'strategy'].includes(type) &&
    ['one_next_move', 'offer_one_next_action_first', 'microstep_first'].includes(strategyValue(payload)),
  );
  const wholeMap = first(items, (type, payload) =>
    ['support_preference', 'strategy'].includes(type) &&
    ['whole_map_first', 'meaning_field', 'overview_first'].includes(strategyValue(payload)),
  );
  const options = first(items, (type, payload) =>
    ['support_preference', 'strategy'].includes(type) &&
    ['options_first', 'present_options_before_recommendation'].includes(strategyValue(payload)),
  );
  const gentle = first(items, (type, payload) =>
    type === 'support_preference' && ['gentle_pace', 'low_pressure'].includes(strategyValue(payload)),
  );
  const challenge = first(items, (type, payload) =>
    type === 'support_preference' && ['direct_challenge', 'adversarial_review'].includes(strategyValue(payload)),
  );
  const responseLength = first(items, (type, payload) =>
    type === 'communication_preference' && payload.dimension === 'response_length',
  );
  const pace = first(items, (type, payload) =>
    type === 'communication_preference' && payload.dimension === 'pace',
  );

  return { oneMove, wholeMap, options, gentle, challenge, responseLength, pace };
}

function learnedLength(item) {
  const value = text(payloadOf(item).value).toLowerCase();
  if (['short', 'concise', 'concise_with_expand'].includes(value)) return 'short';
  if (['detailed', 'detailed_with_summary'].includes(value)) return 'detailed';
  return null;
}

function learnedPace(item) {
  const value = text(payloadOf(item).value).toLowerCase();
  return PACES.has(value) ? value : null;
}

function representationFrom(preferences) {
  if (preferences.oneMove) return 'one_next_move';
  if (preferences.wholeMap) return 'meaning_field';
  if (preferences.options) return 'bounded_workset';
  return DEFAULT_PROFILE.representation;
}

/**
 * Compile ephemeral interaction policy from a bounded context projection.
 * The current explicit request always outranks stored preferences.
 */
export function compileSupportProfile(projection = { items: [] }, input = {}) {
  const items = itemsOf(projection);
  const preferences = learnedPreferences(items);
  const explicit = explicitOverrides(input);

  const representation = explicit.representation || representationFrom(preferences);
  const responseLength =
    explicit.responseLength || learnedLength(preferences.responseLength) || DEFAULT_PROFILE.responseLength;
  const challenge =
    explicit.challenge ||
    (preferences.challenge ? 'high' : preferences.gentle ? 'low' : DEFAULT_PROFILE.challenge);
  const pace = explicit.pace || learnedPace(preferences.pace) || DEFAULT_PROFILE.pace;
  const socraticDepth =
    explicit.socraticDepth ||
    (challenge === 'high' ? 'high' : challenge === 'low' ? 'low' : DEFAULT_PROFILE.socraticDepth);

  const decomposition =
    representation === 'one_next_move' ? 'high' : representation === 'meaning_field' ? 'low' : 'medium';
  const initiative =
    representation === 'reflective_space'
      ? 'listening'
      : preferences.options
        ? 'choice_led'
        : DEFAULT_PROFILE.initiative;
  const maxOptions =
    representation === 'reflective_space' ? 0 : representation === 'one_next_move' ? 1 : preferences.options ? 3 : 2;
  const verificationDepth = challenge === 'high' ? 'high' : DEFAULT_PROFILE.verificationDepth;

  const reasons = [];
  if (Object.values(explicit).some(Boolean)) reasons.push('current explicit request or session choice');
  if (preferences.oneMove) reasons.push('confirmed one-move support preference');
  if (preferences.wholeMap) reasons.push('confirmed whole-map support preference');
  if (preferences.options) reasons.push('confirmed options-first support preference');
  if (preferences.challenge) reasons.push('confirmed challenge preference');
  if (preferences.gentle) reasons.push('confirmed low-pressure support preference');
  if (!reasons.length) reasons.push('safe product default');

  return {
    ...DEFAULT_PROFILE,
    representation,
    responseLength,
    decomposition,
    challenge,
    initiative,
    socraticDepth,
    verificationDepth,
    pace,
    maxOptions,
    reasons,
  };
}

export const supportContract = Object.freeze({
  representations: Object.freeze([...REPRESENTATIONS]),
  levels: Object.freeze([...LEVELS]),
  lengths: Object.freeze([...LENGTHS]),
  paces: Object.freeze([...PACES]),
  defaultProfile: DEFAULT_PROFILE,
});
