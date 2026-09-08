import { emptyState, h, sectionHeading } from '../dom.js';

function activeThreads(state) {
  return state.threads.filter(thread => ['active', 'held', 'ready'].includes(thread.status));
}

export function renderHome(state, actions) {
  const name = state.profile?.name || state.user?.name || '';
  const threads = activeThreads(state);
  const primary = threads.find(thread => thread.status === 'active') || threads[0];
  const root = h('section', { className: 'view home-view', dataset: { view: 'home' } });

  root.append(sectionHeading(
    'HOME',
    name ? `Good to see you, ${name}.` : 'Your world, right now.',
    'Pick up what matters without rebuilding the context around it.',
  ));

  if (!primary) {
    root.append(emptyState('Start anywhere.', 'Bring something you are thinking about, trying to finish, or not sure how to begin.'));
    root.append(h('button', { className: 'primary-action', text: 'Think with akilii', onClick: () => actions.navigate('chat') }));
    return root;
  }

  root.append(h('article', { className: 'hero-card' }, [
    h('span', { className: 'eyebrow', text: primary.status === 'held' ? 'READY TO RESUME' : 'PICK UP HERE' }),
    h('h2', { text: primary.title }),
    h('p', { className: 'objective', text: primary.objective }),
    primary.lastDecision ? h('div', { className: 'state-line' }, [h('strong', { text: 'Last decision' }), h('span', { text: primary.lastDecision })]) : null,
    primary.nextMove ? h('div', { className: 'next-move' }, [h('strong', { text: 'Next useful move' }), h('p', { text: primary.nextMove })]) : null,
    h('button', { className: 'primary-action', text: 'Continue', onClick: () => actions.openThread(primary) }),
  ]));

  const other = threads.filter(thread => thread.id !== primary.id).slice(0, 4);
  if (other.length) {
    root.append(h('section', { className: 'card-section' }, [
      h('div', { className: 'section-row' }, [h('h2', { text: 'Also in play' }), h('button', { className: 'text-action', text: 'Open Work', onClick: () => actions.navigate('work') })]),
      h('div', { className: 'card-grid' }, other.map(thread => h('button', { className: 'quiet-card', onClick: () => actions.openThread(thread) }, [
        h('strong', { text: thread.title }),
        h('span', { text: thread.nextMove || thread.objective }),
      ]))),
    ]));
  }

  const proposals = state.context?.proposals || [];
  if (proposals.length) {
    root.append(h('aside', { className: 'context-nudge' }, [
      h('div', {}, [h('strong', { text: 'Something to review' }), h('p', { text: `akilii has ${proposals.length} context proposal${proposals.length === 1 ? '' : 's'} waiting for your decision.` })]),
      h('button', { className: 'secondary-action', text: 'Review My akilii', onClick: () => actions.navigate('context') }),
    ]));
  }

  return root;
}
