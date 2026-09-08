const MODALITIES = new Set(['text', 'voice']);
const REPRESENTATIONS = new Set(['one_next_move', 'bounded_workset', 'meaning_field', 'conversation']);
const LENGTHS = new Set(['short', 'medium', 'detailed']);
const LEVELS = new Set(['low', 'medium', 'high']);

const clean = (value, max = 500) => typeof value === 'string' ? value.trim().slice(0, max) : '';
const oneOf = (value, allowed, fallback) => allowed.has(value) ? value : fallback;

function explicitRepresentation(message = '') {
  if (/\b(one thing|one step|one next move|just this|keep it simple)\b/i.test(message)) return 'one_next_move';
  if (/\b(full picture|whole picture|map it|overview first|show me everything)\b/i.test(message)) return 'meaning_field';
  if (/\b(options|choices|top three|short plan|prioriti[sz]e)\b/i.test(message)) return 'bounded_workset';
  if (/\b(just listen|talk it through|think aloud|do not solve|don't solve)\b/i.test(message)) return 'conversation';
  return null;
}

function sessionOverride(session = {}) {
  const mode = clean(session.mode, 40);
  if (mode === 'focus') return { representation: 'one_next_move', decomposition: 'high' };
  if (mode === 'explore' || mode === 'reflect') return { representation: 'conversation', socraticDepth: 'medium' };
  if (mode === 'rehearse') return { representation: 'conversation', challenge: 'medium', verificationDepth: 'high' };
  if (mode === 'learn') return { representation: 'meaning_field', decomposition: 'medium' };
  return {};
}

export function compileConversationPolicy({
  message = '',
  modality = 'text',
  supportProfile = {},
  session = {},
} = {}) {
  const explicit = explicitRepresentation(clean(message, 5000));
  const sessionPolicy = sessionOverride(session);
  const profileRepresentation = oneOf(supportProfile.representation, REPRESENTATIONS, 'one_next_move');
  const representation = explicit || sessionPolicy.representation || profileRepresentation;

  const responseLength = oneOf(supportProfile.responseLength, LENGTHS, 'medium');
  const decomposition = oneOf(sessionPolicy.decomposition || supportProfile.decomposition, LEVELS, 'medium');
  const challenge = oneOf(sessionPolicy.challenge || supportProfile.challenge, LEVELS, 'medium');
  const socraticDepth = oneOf(sessionPolicy.socraticDepth || supportProfile.socraticDepth, LEVELS, 'medium');
  const verificationDepth = oneOf(sessionPolicy.verificationDepth || supportProfile.verificationDepth, LEVELS, 'medium');

  const maxOptions = Number.isInteger(supportProfile.maxOptions)
    ? Math.max(1, Math.min(5, supportProfile.maxOptions))
    : representation === 'bounded_workset' ? 3 : representation === 'one_next_move' ? 1 : 2;

  return Object.freeze({
    version: 1,
    modality: oneOf(modality, MODALITIES, 'text'),
    representation,
    responseLength,
    decomposition,
    challenge,
    socraticDepth,
    verificationDepth,
    initiative: clean(supportProfile.initiative, 40) || 'suggestive',
    maxOptions,
    reasons: Object.freeze([
      ...(explicit ? ['current explicit user instruction'] : []),
      ...(!explicit && sessionPolicy.representation ? ['current session mode'] : []),
      ...(!explicit && !sessionPolicy.representation && supportProfile.representation ? ['compiled support profile'] : []),
      ...(!explicit && !sessionPolicy.representation && !supportProfile.representation ? ['safe product default'] : []),
    ]),
  });
}

export function policyInstructions(policy) {
  const p = compileConversationPolicy({ supportProfile: policy });
  const lines = [
    `Representation: ${policy?.representation || p.representation}.`,
    `Response length: ${policy?.responseLength || p.responseLength}.`,
    `Decomposition: ${policy?.decomposition || p.decomposition}.`,
    `Challenge: ${policy?.challenge || p.challenge}.`,
    `Socratic depth: ${policy?.socraticDepth || p.socraticDepth}.`,
    `Verification depth: ${policy?.verificationDepth || p.verificationDepth}.`,
    `Maximum useful options at once: ${policy?.maxOptions || p.maxOptions}.`,
  ];

  if ((policy?.representation || p.representation) === 'one_next_move') {
    lines.push('Prefer one concrete next move before expanding the plan.');
  }
  if ((policy?.representation || p.representation) === 'meaning_field') {
    lines.push('Show the whole structure, relationships and trade-offs before narrowing to action.');
  }
  if ((policy?.representation || p.representation) === 'conversation') {
    lines.push('Do not force action. Stay with the thinking and respond conversationally until action is useful.');
  }
  if ((policy?.representation || p.representation) === 'bounded_workset') {
    lines.push('Offer a small bounded set of options or priorities rather than an exhaustive plan.');
  }

  return lines.join('\n');
}
