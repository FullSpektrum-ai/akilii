/** Chips are authored from visible, explicit work context; they only fill the draft. */
export function episodePrompts({
  context,
  plan,
  surface = 'chat',
  thread,
  work = [],
  draft = false,
} = {}) {
  const objective =
    context?.objective || thread?.objective || thread?.title || work[0]?.title;
  if (!objective) return null;
  const next =
    plan?.nextMove || thread?.next_move || 'choose the next useful move';
  const short = (value) =>
    value.length > 36 ? value.slice(0, 33) + '…' : value;
  if (draft)
    return [
      {
        label: 'Refine for this objective',
        prompt: `Help me refine the draft above for “${objective}”, preserving my meaning.`,
      },
      {
        label: 'Check what is missing',
        prompt: `What is still missing from this draft for “${objective}”? Ask one useful question.`,
      },
    ];
  if (surface === 'home' && thread)
    return [
      {
        label: 'Resume ' + short(thread.title),
        prompt: `Continue the Thread “${thread.title}”. Last confirmed: ${thread.last_confirmed || 'No summary saved'}. Next: ${thread.next_move || 'Choose a next move'}.`,
      },
      {
        label: 'One move for this Thread',
        prompt: `One next move for “${thread.title}”: help me with “${thread.next_move || objective}”.`,
      },
    ];
  if (surface === 'work')
    return [
      {
        label: 'Review ' + short(objective),
        prompt: `Help me review “${objective}”. Start with “${next}”; ask for any details you do not have.`,
      },
      {
        label: 'Make the next move smaller',
        prompt: `For “${objective}”, make “${next}” one smaller next move.`,
      },
    ];
  if (plan?.representation === 'one_next_move')
    return [
      {
        label: 'Help me start this',
        prompt: `Help me begin “${next}” for “${objective}”. One next move, with a useful first question.`,
      },
      {
        label: 'Show the whole picture',
        prompt: `Show the full picture for “${objective}”, including the other items held in this session.`,
      },
    ];
  const open = context?.items?.find((item) => item.relation === 'open');
  return [
    {
      label: 'Focus on the next move',
      prompt: `For “${objective}”, focus on “${next}” in a short plan.`,
    },
    {
      label: open ? 'Explore the open question' : 'Just one thing',
      prompt: open
        ? `For “${objective}”, help me explore “${open.title}” without assuming the answer.`
        : `One thing for “${objective}”: help me start “${next}”.`,
    },
    {
      label: 'One next move',
      prompt: `One next move for “${objective}”. Keep the other items held in this session.`,
    },
  ];
}
