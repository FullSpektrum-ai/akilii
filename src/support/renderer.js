const node = (tag, copy, className) => {
  const el = document.createElement(tag);
  if (copy) el.textContent = copy;
  if (className) el.className = className;
  return el;
};
export function button(label, action) {
  const el = node('button', label);
  el.type = 'button';
  el.onclick = action;
  return el;
}
const labels = {
  can_move: 'Can move',
  waiting: 'Waiting · supplied context',
  later: 'Later · your choice',
  open: 'Open question',
};
function itemCard(item, actions) {
  const el = node('article', null, 'support-item');
  el.append(
    node('small', labels[item.relation]),
    node('h3', item.title),
    node('p', item.detail),
  );
  if(actions?.explore)el.append(button('Talk this through',()=>actions.explore(item)));
  return el;
}
export const componentRegistry = Object.freeze({
  meaning_field(context, plan, actions) {
    const field = node('div', null, 'support-meaning');
    const centre = node('div', null, 'support-objective');
    centre.append(
      node('small', 'CURRENT OBJECTIVE'),
      node('h2', context.objective || 'Find what matters'),
    );
    field.append(centre);
    context.items.forEach((i) => field.append(itemCard(i, actions)));
    return field;
  },
  bounded_workset(context, plan, actions) {
    const field = node('div', null, 'support-workset');
    field.append(node('h2', context.objective));
    plan.foregroundIds.forEach((id) =>
      field.append(itemCard(context.items.find((i) => i.id === id), actions)),
    );
    return field;
  },
  one_next_move(context, plan, actions) {
    const field = node('div', null, 'support-one');
    field.append(node('small', 'ONE THING FOR NOW'), node('h2', plan.nextMove));
    const item = context.items.find((i) => i.id === plan.foregroundIds[0]);
    field.append(
      node(
        'p',
        item?.detail || 'Fragments are fine. Start in the composer below.',
      ),
    );
    if(item&&actions?.explore)field.append(button('Talk this through',()=>actions.explore(item)));
    return field;
  },
});
export function renderSupport(context, plan, actions) {
  const root = node('section', null, 'support-canvas');
  root.setAttribute('aria-label', 'Support canvas');
  if (context.items.length === 1 && context.items[0].id === 'message') {
    const clarification = node('div', null, 'support-clarify');
    clarification.append(node('small', 'LET’S FIND THE USEFUL PART'),
      node('h2', 'What would a useful outcome look like?'),
      node('p', 'We have a starting thought. Clarify what you want to understand, decide or make before organising it into a plan.'));
    clarification.append(button('Clarify my goal', actions.objective));
    if (actions.explore) clarification.append(button('Think it through together', () => actions.explore(context.items[0])));
    root.append(clarification);
    return root;
  }
  const heading = node('div', null, 'support-heading');
  heading.append(
    node('span', 'YOUR CONTEXT · YOUR CHOICE', 'eyebrow'),
    button('Why this?', actions.why),
  );
  root.append(heading);
  const controls = node('div', null, 'support-controls');
  controls.setAttribute('role', 'group');
  controls.setAttribute('aria-label', 'Choose support view');
  for (const [key, label] of Object.entries({
    meaning_field: 'Meaning Field',
    bounded_workset: 'Bounded Workset',
    one_next_move: 'One Next Move',
  })) {
    const b = button(label, () => actions.override(key));
    b.setAttribute('aria-pressed', String(plan.representation === key));
    controls.append(b);
  }
  root.append(controls);
  root.append(componentRegistry[plan.representation](context, plan, actions));
  const held = context.items.filter((i) => !plan.foregroundIds.includes(i.id));
  if (held.length) {
    const details = node('details');
    details.append(
      node(
        'summary',
        `${held.length} other ${held.length === 1 ? 'thing' : 'things'} held in this session`,
      ),
    );
    held.forEach((i) => details.append(itemCard(i, actions)));
    root.append(details);
  }
  const footer = node('div', null, 'support-controls');
  footer.append(
    button('Change objective', actions.objective),
    button('Shape a useful draft', actions.draft),
  );
  root.append(footer);
  return root;
}
