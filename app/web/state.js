const DEFAULT_STATE = Object.freeze({
  status: 'booting',
  view: 'home',
  user: null,
  profile: null,
  conversations: [],
  activeConversationId: null,
  messages: [],
  threads: [],
  work: [],
  context: { items: [], proposals: [] },
  capabilities: {},
  error: null,
});

function normaliseState(input = {}) {
  const context = input.context && typeof input.context === 'object' ? input.context : {};
  return {
    ...DEFAULT_STATE,
    ...input,
    conversations: Array.isArray(input.conversations) ? [...input.conversations] : [],
    messages: Array.isArray(input.messages) ? [...input.messages] : [],
    threads: Array.isArray(input.threads) ? [...input.threads] : [],
    work: Array.isArray(input.work) ? [...input.work] : [],
    context: {
      items: Array.isArray(context.items) ? [...context.items] : [],
      proposals: Array.isArray(context.proposals) ? [...context.proposals] : [],
    },
    capabilities: input.capabilities && typeof input.capabilities === 'object'
      ? { ...input.capabilities }
      : {},
  };
}

export function createWebStore(initial = {}) {
  let state = normaliseState(initial);
  const listeners = new Set();

  function getState() {
    return state;
  }

  function notify() {
    for (const listener of listeners) listener(state);
  }

  function replace(next) {
    state = normaliseState(next);
    notify();
    return state;
  }

  function patch(update) {
    const next = typeof update === 'function' ? update(state) : update;
    if (!next || typeof next !== 'object') throw new TypeError('State patch must be an object.');
    state = normaliseState({ ...state, ...next });
    notify();
    return state;
  }

  function subscribe(listener) {
    if (typeof listener !== 'function') throw new TypeError('State listener must be a function.');
    listeners.add(listener);
    return () => listeners.delete(listener);
  }

  return Object.freeze({ getState, patch, replace, subscribe });
}

export { DEFAULT_STATE };
