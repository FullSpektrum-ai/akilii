import { createRouter } from '../router.js';
import { createWebStore } from '../state.js';
import { createSupabaseSession } from './auth-session.js';
import { createIntegrationApiClient } from './api-client.js';
import { createIntegrationShell } from './shell.js';
import { createIntegrationVoiceClient } from './voice-client.js';

function bootstrapState(payload = {}) {
  return {
    status: 'ready',
    user: payload.user || null,
    profile: payload.profile || null,
    conversations: Array.isArray(payload.conversations) ? payload.conversations : [],
    messages: [],
    threads: Array.isArray(payload.threads) ? payload.threads : [],
    work: Array.isArray(payload.work) ? payload.work : [],
    context: payload.context || { items: [], proposals: [] },
    capabilities: payload.capabilities || {},
    useContext: true,
    voice: { status: 'idle', turns: [] },
    error: null,
  };
}

function updateMessage(messages, id, content, pending) {
  return messages.map(message => message.id === id
    ? { ...message, content, pending }
    : message);
}

export function createIntegratedWebApplication({
  root,
  windowLike = globalThis.window,
  fetchImpl = globalThis.fetch,
  runtimeConfig = globalThis.__AKILII_RUNTIME_CONFIG__ || {},
} = {}) {
  const store = createWebStore({
    useContext: true,
    voice: { status: 'idle', turns: [] },
  });
  const auth = createSupabaseSession({
    url: runtimeConfig.supabaseUrl,
    anonKey: runtimeConfig.supabaseAnonKey,
  });
  const api = createIntegrationApiClient({
    fetchImpl,
    baseUrl: runtimeConfig.apiBase || '/api/v1',
    tokenProvider: auth ? () => auth.getAccessToken() : null,
  });
  let router;

  const voice = createIntegrationVoiceClient({
    api,
    onState(next) {
      store.patch(state => ({
        voice: { ...(state.voice || {}), ...next },
      }));
    },
    onTurn(turn) {
      store.patch(state => ({
        voice: {
          ...(state.voice || {}),
          turns: [
            ...(state.voice?.turns || []).filter(item => item.id !== turn.id),
            turn,
          ],
        },
      }));
    },
  });

  const actions = {
    navigate(view) {
      router.go(view);
    },
    setUseContext(value) {
      store.patch({ useContext: value === true });
    },
    openThread(thread) {
      store.patch({ activeConversationId: thread.conversationId || null });
      router.go(thread.workId ? 'work' : 'chat');
    },
    async sendMessage(message) {
      const before = store.getState();
      const nonce = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      const userId = `optimistic-user-${nonce}`;
      const assistantId = `optimistic-assistant-${nonce}`;
      store.patch({
        status: 'sending',
        error: null,
        messages: [
          ...before.messages,
          { id: userId, role: 'user', content: message },
          { id: assistantId, role: 'assistant', content: '', pending: true },
        ],
      });

      let assistant = '';
      try {
        const run = await api.startChat({
          message,
          conversationId: before.activeConversationId,
          modality: 'text',
          useContext: before.useContext !== false,
        });
        store.patch({
          activeConversationId: run.conversationId || before.activeConversationId,
        });
        for await (const event of run.events) {
          if (event.type === 'response.delta') {
            assistant += event.payload?.text || '';
            store.patch(state => ({
              messages: updateMessage(state.messages, assistantId, assistant, true),
            }));
          } else if (event.type === 'response.completed') {
            store.patch(state => ({
              status: 'ready',
              messages: updateMessage(state.messages, assistantId, assistant, false),
            }));
          } else if (event.type === 'response.failed') {
            throw Object.assign(
              new Error('The response stopped before it finished.'),
              { code: event.payload?.code || 'RUN_FAILED' },
            );
          }
        }
      } catch (error) {
        store.patch(state => ({
          status: 'ready',
          error,
          messages: state.messages.filter(item => item.id !== assistantId || item.content),
        }));
      }
    },
    async startVoice() {
      store.patch(state => ({
        voice: { ...(state.voice || {}), status: 'connecting' },
      }));
      await voice.start({
        useContext: store.getState().useContext !== false,
        objective: 'Talk this through with me.',
        intent: 'Talk this through with me.',
      });
    },
    async stopVoice() {
      await voice.stop();
    },
    async confirmContext(proposal) {
      await api.confirmContextProposal(proposal.id, {
        expectedVersion: proposal.version,
      });
      store.patch({ context: await api.getContext() });
    },
    async rejectContext(proposal) {
      await api.rejectContextProposal(proposal.id, {
        expectedVersion: proposal.version,
      });
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
      await api.deleteContextItem(item.id, {
        expectedVersion: item.version,
      });
      store.patch({ context: await api.getContext() });
    },
  };

  router = createRouter({
    windowLike,
    onChange: view => store.patch({ view }),
  });
  const shell = createIntegrationShell({ root, store, actions });

  async function start() {
    router.start();
    try {
      store.patch(bootstrapState(await api.bootstrap()));
    } catch (error) {
      store.patch({ status: 'error', error });
    }
  }

  async function stop() {
    await voice.stop({ abandoned: true }).catch(() => {});
    router.stop();
    shell.destroy();
  }

  return Object.freeze({
    actions,
    api,
    auth,
    router,
    start,
    stop,
    store,
    voice,
  });
}

if (typeof document !== 'undefined') {
  const root = document.getElementById('app');
  if (root) createIntegratedWebApplication({ root }).start();
}
