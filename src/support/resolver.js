import { validateSupportPlan } from './contracts.js';
export function explicitRepresentation(message) {
  if (/\b(one thing|one step|one next move|less|just this)\b/i.test(message))
    return 'one_next_move';
  if (/\b(full picture|show everything|whole|map|untangle)\b/i.test(message))
    return 'meaning_field';
  if (/\b(focus|short plan|prioriti[sz]e|workset)\b/i.test(message))
    return 'bounded_workset';
  return null;
}
export function resolveSupport(context) {
  const explicit = explicitRepresentation(context.message);
  const preference = context.projection.find(
    (p) =>
      p.value === 'one_next_move' ||
      p.value === 'meaning_field' ||
      p.value === 'bounded_workset',
  );
  const representation =
    context.override ||
    explicit ||
    preference?.value ||
    (context.items.length > 2 ? 'meaning_field' : 'one_next_move');
  const ordered = [...context.items].sort(
    (a, b) =>
      Number(b.relation === 'can_move') - Number(a.relation === 'can_move'),
  );
  const candidates =
    representation === 'meaning_field'
      ? ordered
      : ordered.filter((i) => !['waiting', 'later'].includes(i.relation));
  const selected = candidates.slice(
    0,
    representation === 'one_next_move'
      ? 1
      : representation === 'bounded_workset'
        ? 3
        : 12,
  );
  return validateSupportPlan(
    {
      version: 1,
      representation,
      foregroundIds: selected.map((i) => i.id),
      reason: context.override
        ? 'You chose this view.'
        : explicit
          ? 'You explicitly asked for this kind of support.'
          : preference
            ? 'Using the support preference you chose to include.'
            : 'A suggested starting view based on the items you supplied. You can change it.',
      nextMove:
        selected[0]?.title || 'Name the one thing you want to move forward.',
      composer:
        representation === 'one_next_move'
          ? 'Just this part…'
          : representation === 'meaning_field'
            ? 'What still does not fit?'
            : 'What matters most right now?',
    },
    context,
  );
}
