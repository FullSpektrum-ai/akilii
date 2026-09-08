import { createRuntimeEnvelope } from '../context-envelope.js';
import { runtimeEvent } from '../events.js';
import { readSseJson } from '../streams.js';

const ENDPOINT = 'https://api.openai.com/v1/responses';

function required(value, name) {
  if (typeof value !== 'string' || !value.trim()) throw new TypeError(`${name} is required.`);
  return value.trim();
}

async function* events(body, runId) {
  let sequence = 0;
  yield runtimeEvent({ runId, sequence: sequence++, type: 'run.started' });
  let terminal = false;
  try {
    for await (const event of readSseJson(body)) {
      if (event.type === 'response.output_text.delta' && typeof event.delta === 'string') {
        yield runtimeEvent({ runId, sequence: sequence++, type: 'response.delta', payload: { text: event.delta } });
      } else if (event.type === 'response.completed') {
        terminal = true;
        yield runtimeEvent({ runId, sequence: sequence++, type: 'response.completed' });
      } else if (event.type === 'response.failed' || event.type === 'error') {
        terminal = true;
        yield runtimeEvent({ runId, sequence: sequence++, type: 'response.failed', payload: { code: 'provider_failed' } });
      }
    }
    if (!terminal) yield runtimeEvent({ runId, sequence: sequence++, type: 'response.failed', payload: { code: 'stream_interrupted' } });
  } catch {
    yield runtimeEvent({ runId, sequence: sequence++, type: 'response.failed', payload: { code: 'stream_invalid' } });
  }
}

export function createOpenAIResponsesAdapter({ apiKey, model, fetchImpl = globalThis.fetch, idFactory = () => crypto.randomUUID() } = {}) {
  const key = required(apiKey, 'OpenAI API key');
  const modelId = required(model, 'OpenAI model');
  if (typeof fetchImpl !== 'function') throw new TypeError('OpenAI adapter requires fetch.');

  return Object.freeze({
    async start(request = {}) {
      if (request.modality === 'voice') throw new TypeError('OpenAI Responses adapter only supports text.');
      const envelope = createRuntimeEnvelope(request);
      const runId = idFactory();
      const input = [...envelope.history];
      if (envelope.message) input.push({ role: 'user', content: envelope.message });
      const response = await fetchImpl(ENDPOINT, {
        method: 'POST',
        headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: modelId,
          instructions: envelope.instructions,
          input,
          stream: true,
          store: false,
        }),
        signal: request.signal,
      });
      if (!response.ok) {
        const error = new Error(`OpenAI text provider returned ${response.status}.`);
        error.code = 'PROVIDER_UNAVAILABLE';
        throw error;
      }
      return Object.freeze({ runId, provider: 'openai', model: modelId, events: events(response.body, runId) });
    },
  });
}
