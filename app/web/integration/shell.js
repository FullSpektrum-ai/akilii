import { clear, h } from '../dom.js';
import { PRIMARY_VIEWS } from '../router.js';
import { renderContext } from '../views/context.js';
import { renderHome } from '../views/home.js';
import { renderWork } from '../views/work.js';
import { renderIntegrationChat } from './chat-view.js';

const NAV_LABELS = Object.freeze({
  home: 'Home',
  chat: 'Chat',
  work: 'Work',
});

const VIEWS = Object.freeze({
  home: renderHome,
  chat: renderIntegrationChat,
  work: renderWork,
  context: renderContext,
});

function brand() {
  return h('a', {
    className: 'brand',
    href: '#/home',
    'aria-label': 'akilii home',
  }, [
    h('span', {
      className: 'brand-mark',
      text: 'ai',
      'aria-hidden': 'true',
    }),
    h('span', { className: 'brand-word', text: 'akilii' }),
  ]);
}

function statusView(state) {
  if (state.status === 'booting') {
    return h('section', { className: 'system-state', role: 'status' }, [
      h('span', { className: 'pulse', 'aria-hidden': 'true' }),
      h('p', { text: 'Opening your akilii space…' }),
    ]);
  }
  if (state.status === 'error') {
    return h('section', {
      className: 'system-state error-state',
      role: 'alert',
    }, [
      h('h1', { text: 'akilii could not open this workspace.' }),
      h('p', { text: state.error?.message || 'Reconnect and try again.' }),
      h('p', { text: 'Your existing saved data has not been changed.' }),
    ]);
  }
  return null;
}

export function createIntegrationShell({ root, store, actions }) {
  if (!(root instanceof Element)) throw new TypeError('Shell root element is required.');

  function render(state) {
    clear(root);
    const primary = h('nav', {
      className: 'primary-nav',
      'aria-label': 'Primary',
    }, PRIMARY_VIEWS.map(view => h('button', {
      className: state.view === view ? 'nav-item active' : 'nav-item',
      text: NAV_LABELS[view],
      'aria-current': state.view === view ? 'page' : null,
      onClick: () => actions.navigate(view),
    })));
    const context = h('div', { className: 'secondary-nav' }, [
      h('button', {
        className: state.view === 'context'
          ? 'nav-item context-link active'
          : 'nav-item context-link',
        text: 'My akilii',
        'aria-current': state.view === 'context' ? 'page' : null,
        onClick: () => actions.navigate('context'),
      }),
    ]);
    const sidebar = h('aside', { className: 'sidebar' }, [
      brand(),
      primary,
      context,
      h('p', { className: 'preview-label', text: 'V0.1 INTEGRATION' }),
    ]);
    const view = statusView(state) || (VIEWS[state.view] || renderHome)(state, actions);
    const main = h('main', {
      className: 'workspace',
      id: 'workspace',
      tabIndex: -1,
    }, [view]);
    root.append(h('div', { className: 'app-shell' }, [sidebar, main]));
  }

  render(store.getState());
  const unsubscribe = store.subscribe(render);
  return Object.freeze({
    destroy: unsubscribe,
    render: () => render(store.getState()),
  });
}
