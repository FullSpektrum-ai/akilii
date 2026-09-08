import { emptyState, h, sectionHeading } from '../dom.js';

function itemLabel(item) {
  return item.payload?.statement || item.payload?.value || item.payload?.title || item.payload?.strategy || item.itemType || 'Context item';
}

export function renderContext(state, actions) {
  const root = h('section', { className: 'view context-view', dataset: { view: 'context' } });
  root.append(sectionHeading('MY AKILII', 'What akilii understands.', 'This is a working, correctable model — not a diagnosis or hidden truth.'));

  const proposals = state.context?.proposals || [];
  if (proposals.length) {
    root.append(h('section', { className: 'card-section' }, [
      h('h2', { text: 'Waiting for you' }),
      h('div', { className: 'context-list' }, proposals.map(proposal => h('article', { className: 'context-card proposed' }, [
        h('span', { className: 'status-pill', text: 'Proposed' }),
        h('h3', { text: itemLabel(proposal) }),
        proposal.rationale ? h('p', { text: proposal.rationale }) : null,
        h('div', { className: 'button-row' }, [
          h('button', { className: 'primary-action', text: 'Keep this', onClick: () => actions.confirmContext(proposal) }),
          h('button', { className: 'secondary-action', text: 'Not for me', onClick: () => actions.rejectContext(proposal) }),
        ]),
      ]))),
    ]));
  }

  const items = state.context?.items || [];
  if (!items.length) {
    root.append(emptyState('Nothing durable yet.', 'akilii can still help. Useful understanding should accumulate through real interactions, not a forced profile questionnaire.'));
    return root;
  }

  root.append(h('section', { className: 'card-section' }, [
    h('h2', { text: 'Currently available to akilii' }),
    h('div', { className: 'context-list' }, items.map(item => h('article', { className: 'context-card' }, [
      h('div', { className: 'context-card-head' }, [
        h('span', { className: 'status-pill', text: item.itemType?.replaceAll('_', ' ') || 'context' }),
        h('span', { className: 'confidence-label', text: item.confirmationState === 'confirmed' ? 'Confirmed' : 'User stated' }),
      ]),
      h('h3', { text: itemLabel(item) }),
      h('p', { className: 'context-meta', text: `${item.tier || 'context'} · ${item.sensitivity || 'standard'} · version ${item.version || 1}` }),
      h('div', { className: 'button-row' }, [
        h('button', { className: 'secondary-action', text: item.controls?.useAllowed === false ? 'Allow use' : 'Pause use', onClick: () => actions.toggleContext(item) }),
        h('button', { className: 'danger-action', text: 'Delete', onClick: () => actions.deleteContext(item) }),
      ]),
    ]))),
  ]));
  return root;
}
