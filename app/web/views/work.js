import { emptyState, h, sectionHeading } from '../dom.js';

export function renderWork(state, actions) {
  const root = h('section', { className: 'view work-view', dataset: { view: 'work' } });
  root.append(sectionHeading('WORK', 'Help me do it.', 'Hold the objective, the current state and the next useful move in one place.'));

  const threads = state.threads.filter(thread => thread.status !== 'closed');
  if (!threads.length && !state.work.length) {
    root.append(emptyState('Nothing is being held here yet.', 'When a conversation becomes something you want to carry forward, it can become a Thread or approved Work item.'));
    root.append(h('button', { className: 'primary-action', text: 'Go to Chat', onClick: () => actions.navigate('chat') }));
    return root;
  }

  if (threads.length) {
    root.append(h('section', { className: 'card-section' }, [
      h('h2', { text: 'Active threads' }),
      h('div', { className: 'work-list' }, threads.map(thread => h('article', { className: 'work-row' }, [
        h('div', { className: 'work-copy' }, [
          h('span', { className: 'status-pill', text: thread.status }),
          h('h3', { text: thread.title }),
          h('p', { text: thread.nextMove || thread.objective }),
        ]),
        h('button', { className: 'secondary-action', text: 'Continue', onClick: () => actions.openThread(thread) }),
      ]))),
    ]));
  }

  if (state.work.length) {
    root.append(h('section', { className: 'card-section' }, [
      h('h2', { text: 'Saved work' }),
      h('div', { className: 'card-grid' }, state.work.slice(0, 8).map(item => h('article', { className: 'quiet-card static' }, [
        h('span', { className: 'status-pill', text: item.status || 'active' }),
        h('strong', { text: item.title }),
        h('span', { text: item.body?.slice(0, 180) || 'Saved Work item' }),
      ]))),
    ]));
  }
  return root;
}
