import test from 'node:test';
import assert from 'node:assert/strict';

import { createConversationService, createVoiceSessionService } from '../app/api/index.js';
import {
  createAnthropicMessagesAdapter,
  createConversationRuntime,
  createOllamaChatAdapter,
  createOpenAIRealtimeAdapter,
  createOpenAIResponsesAdapter,
  createRuntimeEnvelope,
} from '../app/adapters/runtime/index.js';

function streamText(value) {
  return new ReadableStream({ start(controller) { controller.enqueue(new TextEncoder().encode(value)); controller.close(); } });
}

const request = {
  modality: 'text',
  message: 'Help me review this architecture.',
  history: [{ role: 'user', content: 'Earlier thought.' }],
  instructions: 'CANONICAL_POLICY_MARKER',
  contextProjection: {
    purpose: 'support',
    items: [{ itemId: 'context-1', itemType: 'strategy', payload: { strategy: 'whole_map_first' }, confidence: 0.9, confirmationState: 'confirmed' }],
  },
  supportProfile: { pace: 'patient' },
  episode: { id: 'episode-1' },
};

test('all providers receive the same governed runtime envelope', () => {
  const envelope = createRuntimeEnvelope(request);
  assert.match(envelope.instructions, /CANONICAL_POLICY_MARKER/);
  assert.match(envelope.instructions, /whole_map_first/);
  assert.match(envelope.instructions, /user-authorized context data/i);
  assert.equal(envelope.context.items.length, 1);
});

test('OpenAI Responses disables provider-side response storage and streams normalized events', async () => {
  let payload;
  const adapter = createOpenAIResponsesAdapter({
    apiKey: 'key', model: 'configured-model', idFactory: () => 'run-openai',
    fetchImpl: async (_url, options) => {
      payload = JSON.parse(options.body);
      return new Response(streamText('data: {"type":"response.output_text.delta","delta":"hello"}\n\ndata: {"type":"response.completed"}\n\n'), { status: 200 });
    },
  });
  const run = await adapter.start(request);
  assert.equal(payload.store, false);
  assert.equal(payload.instructions.includes('CANONICAL_POLICY_MARKER'), true);
  assert.equal(payload.instructions.includes('whole_map_first'), true);
  assert.equal(payload.model, 'configured-model');
  const events = [];
  for await (const event of run.events) events.push(event);
  assert.deepEqual(events.map(event => event.type), ['run.started', 'response.delta', 'response.completed']);
  assert.equal(events[1].payload.text, 'hello');
});

test('Anthropic and Ollama do not introduce a second akilii system personality', async () => {
  let anthropicPayload;
  let ollamaPayload;
  const anthropic = createAnthropicMessagesAdapter({
    apiKey: 'key', model: 'claude-configured', idFactory: () => 'run-a',
    fetchImpl: async (_url, options) => {
      anthropicPayload = JSON.parse(options.body);
      return new Response(streamText('data: {"type":"message_stop"}\n\n'), { status: 200 });
    },
  });
  const ollama = createOllamaChatAdapter({
    model: 'local-configured', idFactory: () => 'run-o',
    fetchImpl: async (_url, options) => {
      ollamaPayload = JSON.parse(options.body);
      return new Response(streamText('{"done":true}\n'), { status: 200 });
    },
  });
  await anthropic.start(request);
  await ollama.start(request);
  assert.equal(anthropicPayload.system, ollamaPayload.messages[0].content);
  assert.match(anthropicPayload.system, /CANONICAL_POLICY_MARKER/);
  assert.equal(/supportive practical assistant/i.test(anthropicPayload.system), false);
});

test('OpenAI realtime voice receives the same policy/context envelope and no tools by default', async () => {
  let session;
  const adapter = createOpenAIRealtimeAdapter({
    apiKey: 'key', model: 'gpt-realtime-test', idFactory: () => 'voice-run',
    fetchImpl: async (_url, options) => {
      session = JSON.parse(options.body.get('session'));
      return new Response('v=0\r\nanswer', { status: 201 });
    },
  });
  const run = await adapter.start({ ...request, modality: 'voice', message: '', sdp: 'v=0\r\no=- test', voice: 'marin', speed: 0.85 });
  assert.match(session.instructions, /CANONICAL_POLICY_MARKER/);
  assert.match(session.instructions, /whole_map_first/);
  assert.deepEqual(session.tools, []);
  assert.equal(session.audio.input.turn_detection.eagerness, 'low');
  assert.equal(run.sdpAnswer, 'v=0\r\nanswer');
});

test('runtime router never silently falls back between modalities', async () => {
  const runtime = createConversationRuntime({ textAdapter: { async start() { return { runId: 'text-run' }; } } });
  assert.deepEqual(await runtime.start({ modality: 'text' }), { runId: 'text-run' });
  await assert.rejects(runtime.start({ modality: 'voice' }), error => error.code === 'CAPABILITY_UNAVAILABLE');
});

test('text and voice application services compile the same support state for the same situation', async () => {
  const item = {
    id: 'context-1', itemType: 'support_preference', tier: 'semi_stable', payload: { strategy: 'whole_map_first' },
    lifecycleState: 'active', confirmationState: 'confirmed', confidence: 0.9, sensitivity: 'standard',
    controls: { useAllowed: true, purposeScopes: ['support'], exportAllowed: true },
  };
  const common = {
    contextRepository: { async listForSubject() { return [item]; } },
    conversationRepository: { async listRecent() { return []; } },
    episodeRepository: { async open() {} },
    idFactory: (() => { let n = 0; return () => `episode-${++n}`; })(),
    clock: () => Date.parse('2026-09-08T12:00:00.000Z'),
  };
  const textService = createConversationService({ ...common, conversationRuntime: { async start() { return { runId: 'text' }; } } });
  const voiceService = createVoiceSessionService({ ...common, voiceRuntime: { async start() { return { runId: 'voice', sdpAnswer: 'answer' }; } } });
  const base = { subjectId: 'user-1', objective: 'Review the architecture.', useContext: true, intent: 'Help me review the architecture.' };
  const textPrepared = await textService.prepare({ ...base, message: base.intent, modality: 'text' });
  const voicePrepared = await voiceService.prepare({ ...base, modality: 'voice', sdp: 'v=0' });
  assert.deepEqual(textPrepared.contextProjection, voicePrepared.contextProjection);
  assert.deepEqual(textPrepared.supportProfile, voicePrepared.supportProfile);
  assert.deepEqual(textPrepared.conversationPolicy.support, voicePrepared.conversationPolicy.support);
});
