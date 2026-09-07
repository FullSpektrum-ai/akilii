/** Presentation contracts. No writes, permissions, HTML or inferred person traits. */
export const representations = [
  'meaning_field',
  'bounded_workset',
  'one_next_move',
];
const text = (value, max = 1000) =>
  typeof value === 'string' ? value.trim().slice(0, max) : '';
export function supportProjection(entries = [], enabled = true) {
  if (!enabled) return [];
  return (Array.isArray(entries) ? entries : [])
    .filter(
      (e) =>
        e &&
        ['explicit', 'session', 'confirmed'].includes(e.source) &&
        e.included === true,
    )
    .slice(0, 8)
    .map((e) => ({
      id: text(e.id, 80),
      value: text(e.value, 300),
      source: e.source,
      included: true,
    }))
    .filter((e) => e.id && e.value);
}
export function episodeContext(input = {}) {
  const items = (Array.isArray(input.items) ? input.items : [])
    .slice(0, 12)
    .map((item, index) => ({
      id: text(item.id, 80) || `item-${index}`,
      title: text(item.title, 160),
      detail: text(item.detail, 500),
      relation: ['can_move', 'waiting', 'later', 'open'].includes(item.relation)
        ? item.relation
        : 'open',
    }))
    .filter((item) => item.title);
  if (new Set(items.map((i) => i.id)).size !== items.length)
    throw new Error('Duplicate context identifiers.');
  return {
    version: 1,
    objective: text(input.objective, 300),
    message: text(input.message, 5000),
    surface: ['home', 'chat', 'work', 'resume'].includes(input.surface)
      ? input.surface
      : 'chat',
    items,
    override: representations.includes(input.override) ? input.override : null,
    projection: supportProjection(input.projection, input.useContext !== false),
  };
}
export function validateSupportPlan(plan, context) {
  const keys = [
    'version',
    'representation',
    'foregroundIds',
    'reason',
    'nextMove',
    'composer',
  ];
  if (
    !plan ||
    Object.keys(plan).some((k) => !keys.includes(k)) ||
    plan.version !== 1 ||
    !representations.includes(plan.representation)
  )
    throw new Error('Unsupported SupportPlan.');
  const limit =
    plan.representation === 'one_next_move'
      ? 1
      : plan.representation === 'bounded_workset'
        ? 3
        : 12;
  if (
    !Array.isArray(plan.foregroundIds) ||
    plan.foregroundIds.length > limit ||
    new Set(plan.foregroundIds).size !== plan.foregroundIds.length ||
    plan.foregroundIds.some((id) => !context.items.some((i) => i.id === id))
  )
    throw new Error('Unsupported foreground reference.');
  for (const key of ['reason', 'nextMove', 'composer'])
    if (typeof plan[key] !== 'string' || plan[key].length > 600)
      throw new Error('Invalid support copy.');
  return structuredClone(plan);
}
