import { createRuntimeEnvelope } from '../context-envelope.js';
import { runtimeEvent } from '../events.js';

const ENDPOINT = 'https://api.openai.com/v1/realtime/calls';
const DEFAULT_VOICES = Object.freeze(['marin', 'cedar']);
const SPEEDS = new Set([0.85, 1, 1.1]);
const EAGERNESS = Object.freeze({ patient: 'low', balanced: 'medium', quick: 'high' });

function required(value, name) {
  if (typeof value !== 'string' || !value.trim()) throw new TypeError(`${name} is required.`);
  return value.trim();
}

export function createOpenAIRealtimeAdapter({
  apiKey,
  model = 'gpt-realtime',
  transcriptionModel = 'gpt-4o-mini-transcribe',
  voices = DEFAULT_VOICES,
  fetchImpl = globalThis.fetch,
  idFactory = () => crypto.randomUUID(),
} = {}) {
  const key = required(apiKey, 'OpenAI API key');
  const modelId = required(model, 'OpenAI realtime model');
  const allowedVoices = new Set(voices);
  if (typeof fetchImpl !== 'function') throw new TypeError('OpenAI realtime adapter requires fetch.');

  return Object.freeze({
    async start(request = {}) {
      if (request.modality !== 'voice') throw new TypeError('OpenAI Realtime adapter only supports voice.');
      const sdp = required(request.sdp, 'WebRTC SDP offer');
      if (!sdp.startsWith('v=0') || sdp.length > 20_000) throw new TypeError('Invalid WebRTC SDP offer.');
      const envelope = createRuntimeEnvelope(request);
      const voice = allowedVoices.has(request.voice) ? request.voice : voices[0];
      const speed = SPEEDS.has(Number(request.speed)) ? Number(request.speed) : 1;
      const pace = request.supportProfile?.pace || 'balanced';
      const runId = idFactory();

      const form = new FormData();
      form.set('sdp', sdp);
      form.set('session', JSON.stringify({
        type: 'realtime',
        model: modelId,
        instructions: envelope.instructions,
        tools: [],
        audio: {
          input: {
            transcription: { model: transcriptionModel },
            turn_detection: {
              type: 'semantic_vad',
              eagerness: EAGERNESS[pace] || 'medium',
              interrupt_response: true,
              create_response: true,
            },
          },
          output: { voice, speed },
        },
        max_output_tokens: 600,
      }));

      const response = await fetchImpl(ENDPOINT, {
        method: 'POST',
        headers: { Authorization: `Bearer ${key}` },
        body: form,
        signal: request.signal,
      });
      if (!response.ok) {
        const error = new Error(`OpenAI realtime provider returned ${response.status}.`);
        error.code = 'PROVIDER_UNAVAILABLE';
        throw error;
      }
      const sdpAnswer = await response.text();
      const events = Object.freeze([
        runtimeEvent({ runId, sequence: 0, type: 'run.started' }),
        runtimeEvent({ runId, sequence: 1, type: 'voice.session.ready', payload: { voice, speed } }),
      ]);
      return Object.freeze({ runId, provider: 'openai', model: modelId, sdpAnswer, events });
    },
  });
}
