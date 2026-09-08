import { createApiClient } from './api-client.js';
import { createRouter } from './router.js';
import { createShell } from './shell.js';
import { createWebStore } from './state.js';

function normaliseBootstrap(payload = {}) {
  return {
    status: 'ready',
    user: payload.user || null,
    profile: payload.profile || null,
    conversations: Array.isArray(payload.conversations) ? payload.conversations : [],
    activeConversationId: payload.activeConversationId || null,
    messages: Array.isArray(payload.messages) ? payload.messages : [],
    threads: Array.isArray(payload.threads) ? payload.threads : [],
    work: Array.isArray(payload.work) ? payload.work : [],
    context: payload.context || { items: [], proposals: [] },
    capabilities: payload.capabilities || {},
    error: null,
  };
}

export function createWebApplication({
  root,
  windowLike = globalThis.window,
  fetchImpl = globalThis.fetch,
  baseUrl = '/api/v1',
} = {}) {
  const store = createWebStore();
  const api = createApiClient({ fetchImpl, baseUrl });
  let router;

  const actions = {
    navigate(view) { router.go(view); },
    openThread(thread) {
      store.patch({ activeConversationId: thread.conversationId || null });
      router.go(thread.workId ? 'work' : 'chat');
    },
    async sendMessage(message) {
      store.patch(state => ({ status: 'sending', messages: [...state.messages, { role: 'user', content: message }] }));
      try {
        const result = await api.startChat({
          message,
          conversationId: store.getState().activeConversationId,
          modality: 'text',
          useContext: true,
        });
        const nextMessages = Array.isArray(result?.messages)
          ? result.messages
          : [...store.getState().messages, result?.message ? { role: 'assistant', content: result.message } : null].filter(Boolean);
        store.patch({ status: 'ready', messages: nextMessages, activeConversationId: result?.conversationId || store.getState().activeConversationId });
      } catch (error) {
        store.patch({ status: 'ready', error });
      }
    },
    async confirmContext(proposal) {
      await api.confirmContextProposal(proposal.id, { expectedVersion: proposal.version });
      store.patch({ context: await api.getContext() });
    },
    async rejectContext(proposal) {
      await api.rejectContextProposal(proposal.id, { expectedVersion: proposal.version });
      store.patch({ context: await api.getContext() });
    },
    async toggleContext(item) {
      await api.updateContextControl(item.id, {
        expectedVersion: item.version,
        useAllowed: item.controls?.useAllowed === false,
        purposeScopes: item.controls?.purposeScopes || [],
      });
      store.patch({ context: await api.getContext() });
    },
    async deleteContext(item) {
      await api.deleteContextItem(item.id, { expectedVersion: item.version });
      store.patch({ context: await api.getContext() });
    },
  };

  router = createRouter({
    windowLike,
    onChange: view => store.patch({ view }),
  });
  const shell = createShell({ root, store, actions });

  async function start() {
    router.start();
    try {
      store.patch(normaliseBootstrap(await api.bootstrap()));
    } catch (error) {
      store.patch({ status: 'error', error });
    }
  }

  function stop() {
    router.stop();
    shell.destroy();
  }

  return Object.freeze({ actions, api, router, start, stop, store });
}

if (typeof document !== 'undefined') {
  const root = document.getElementById('app');
  if (root) createWebApplication({ root }).start();
}
