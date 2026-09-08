import test from 'node:test';
import assert from 'node:assert/strict';

import {
  createContextService,
  createConversationService,
  createThreadService,
  createWorkService,
} from '../app/api/index.js';

const confirmedWholeMap = {
  id: 'context-1',
  itemType: 'support_preference',
  tier: 'semi_stable',
  payload: { strategy: 'whole_map_first' },
  lifecycleState: 'active',
  confirmationState: 'confirmed',
  confidence: 0.95,
  sensitivity: 'standard',
  controls: { useAllowed: true, purposeScopes: ['support'], exportAllowed: true },
};

function ids(values = []) {
  const queue = [...values];
  let fallback = 0;
  return () => queue.shift() || `id-${++fallback}`;
}

function durableConversationFakes({ history = [] } = {}) {
  const messages = [];
  const episodes = [];
  return {
    messages,
    episodes,
    conversationRepository: {
      async listRecent() { return history; },
      async ensure(input) { return { id: input.id }; },
      async append(input) { messages.push(input); return input; },
    },
    episodeRepository: {
      async open(episode) { episodes.push(['open', episode]); },
      async close(input) { episodes.push(['close', input]); return input; },
    },
  };
}

test('conversation service gives text and voice the same compiled support state', async () => {
  const runtimeRequests = [];
  const durable = durableConversationFakes({
    history: [{ role: 'user', content: 'Earlier context.' }],
  });
  const service = createConversationService({
    contextRepository: { async listForSubject() { return [confirmedWholeMap]; } },
    conversationRepository: durable.conversationRepository,
    episodeRepository: durable.episodeRepository,
    conversationRuntime: {
      async start(request) {
        runtimeRequests.push(request);
        return { runId: `run-${runtimeRequests.length}`, events: [] };
      },
    },
    idFactory: ids(['episode-text', 'message-text', 'episode-voice', 'message-voice']),
    clock: () => Date.parse('2026-09-08T12:00:00.000Z'),
  });
  const base = {
    subjectId: 'user-1',
    conversationId: 'conversation-1',
    message: 'Help me review this architecture.',
    objective: 'Review the architecture.',
    useContext: true,
  };

  const textRun = await service.start({ ...base, modality: 'text' });
  const voiceRun = await service.start({ ...base, modality: 'voice' });

  assert.deepEqual(textRun.request.supportProfile, voiceRun.request.supportProfile);
  assert.deepEqual(textRun.request.contextProjection, voiceRun.request.contextProjection);
  assert.equal(textRun.request.conversationPolicy.modality, 'text');
  assert.equal(voiceRun.request.conversationPolicy.modality, 'voice');
  assert.equal(durable.episodes.filter(([kind]) => kind === 'open').length, 2);
  assert.equal(runtimeRequests.length, 2);
  assert.equal(durable.messages.filter(message => message.role === 'user').length, 2);
});

test('completed runtime output is durable before completion is exposed', async () => {
  const durable = durableConversationFakes();
  const service = createConversationService({
    contextRepository: { async listForSubject() { return []; } },
    conversationRepository: durable.conversationRepository,
    episodeRepository: durable.episodeRepository,
    conversationRuntime: {
      async start() {
        async function* events() {
          yield { runId: 'run-1', sequence: 0, type: 'run.started', payload: {} };
          yield { runId: 'run-1', sequence: 1, type: 'response.delta', payload: { text: 'Useful ' } };
          yield { runId: 'run-1', sequence: 2, type: 'response.delta', payload: { text: 'answer.' } };
          yield { runId: 'run-1', sequence: 3, type: 'response.completed', payload: {} };
        }
        return { runId: 'run-1', events: events() };
      },
    },
    idFactory: ids(['conversation-1', 'episode-1', 'user-message-1', 'assistant-message-1']),
    clock: () => 100,
  });

  const result = await service.start({ subjectId: 'user-1', message: 'Help me.', useContext: false });
  const exposed = [];
  for await (const event of result.run.events) {
    if (event.type === 'response.completed') {
      const assistant = durable.messages.find(message => message.role === 'assistant');
      assert.equal(assistant.content, 'Useful answer.');
      assert.equal(durable.episodes.at(-1)[1].status, 'completed');
    }
    exposed.push(event.type);
  }

  assert.deepEqual(exposed, ['run.started', 'response.delta', 'response.delta', 'response.completed']);
  assert.deepEqual(durable.messages.map(message => message.role), ['user', 'assistant']);
});

test('conversation service never passes excluded context payloads to the runtime', async () => {
  let runtimeRequest;
  const privateMarker = 'MUST_NOT_REACH_RUNTIME';
  const durable = durableConversationFakes();
  const service = createConversationService({
    contextRepository: {
      async listForSubject() {
        return [
          confirmedWholeMap,
          {
            ...confirmedWholeMap,
            id: 'private-item',
            payload: { strategy: 'one_next_move', privateMarker },
            controls: { useAllowed: false, purposeScopes: ['support'] },
          },
        ];
      },
    },
    conversationRepository: durable.conversationRepository,
    episodeRepository: durable.episodeRepository,
    conversationRuntime: {
      async start(request) {
        runtimeRequest = request;
        return { runId: 'run-1', events: [] };
      },
    },
    idFactory: ids(['conversation-1', 'episode-1', 'message-1']),
    clock: () => Date.parse('2026-09-08T12:00:00.000Z'),
  });

  await service.start({ subjectId: 'user-1', message: 'Help me think.', useContext: true });

  assert.deepEqual(runtimeRequest.contextProjection.items.map(item => item.itemId), ['context-1']);
  assert.equal(JSON.stringify(runtimeRequest).includes(privateMarker), false);
});

test('context service keeps proposal decisions inside the repository port', async () => {
  const calls = [];
  const service = createContextService({
    contextRepository: {
      async listForSubject() { return []; },
      async listProposals() { return []; },
      async confirmProposal(input) { calls.push(['confirm', input]); return { ok: true }; },
      async rejectProposal(input) { calls.push(['reject', input]); return { ok: true }; },
      async restrictItem(input) { calls.push(['restrict', input]); return { ok: true }; },
      async deleteItem(input) { calls.push(['delete', input]); return { ok: true }; },
    },
  });

  await service.confirm({ subjectId: 'user-1', proposalId: 'proposal-1', expectedVersion: 2 });
  await service.reject({ subjectId: 'user-1', proposalId: 'proposal-2', expectedVersion: 1 });
  await service.restrict({ subjectId: 'user-1', itemId: 'item-1', expectedVersion: 3, useAllowed: false });
  await service.remove({ subjectId: 'user-1', itemId: 'item-2', expectedVersion: 1 });

  assert.deepEqual(calls.map(([kind]) => kind), ['confirm', 'reject', 'restrict', 'delete']);
});

test('thread service uses optimistic version checks', async () => {
  let stored = {
    id: 'thread-1', subjectId: 'user-1', title: 'Beta', objective: 'Ship beta.', status: 'active',
    conversationId: null, workId: null, lastConfirmed: '', lastDecision: '', nextMove: '',
    openQuestions: [], version: 2, createdAt: 1, updatedAt: 1,
  };
  const service = createThreadService({
    threadRepository: {
      async list() { return stored ? [stored] : []; },
      async get() { return stored; },
      async save({ thread }) { stored = thread; return thread; },
    },
    idFactory: () => 'unused',
    clock: () => 2,
  });

  await assert.rejects(
    service.transition({ subjectId: 'user-1', id: 'thread-1', expectedVersion: 1, to: 'held' }),
    error => error.code === 'VERSION_CONFLICT',
  );
  const saved = await service.transition({
    subjectId: 'user-1', id: 'thread-1', expectedVersion: 2, to: 'held', nextMove: 'Review the runtime seam.',
  });
  assert.equal(saved.version, 3);
  assert.equal(saved.nextMove, 'Review the runtime seam.');
});

test('work service returns a receipt for an approved write', async () => {
  let stored = null;
  const service = createWorkService({
    workRepository: {
      async list() { return stored ? [stored] : []; },
      async get() { return stored; },
      async save({ work }) { stored = work; return work; },
    },
    idFactory: () => 'work-1',
    clock: () => 1,
  });

  await assert.rejects(
    service.create({ subjectId: 'user-1', title: 'Plan', body: 'Do the work.' }),
    /explicit approval/i,
  );
  const result = await service.create({
    subjectId: 'user-1', title: 'Plan', body: 'Do the work.', approved: true, approvalRef: 'approval-1',
  });
  assert.equal(result.work.id, 'work-1');
  assert.deepEqual(result.receipt, {
    operation: 'work.create', workId: 'work-1', version: 1, approvalRef: 'approval-1',
  });
});
