import { createRuntimeEnvelope } from '../context-envelope.js';
import { runtimeEvent } from '../events.js';
import { readNdjson } from '../streams.js';

function required(value, name) {
  if (typeof value !== 'string' || !value.trim()) throw new TypeError(`${name} is required.`);
  return value.trim();
}

async function* events(body, runId) {
  let sequence = 0;
  let terminal = false;
  yield runtimeEvent({ runId, sequence: sequence++, type: 'run.started' });
  try {
    for await (const event of readNdjson(body)) {
      if (event.error) {
        terminal = true;
        yield runtimeEvent({ runId, sequence: sequence++, type: 'response.failed', payload: { code: 'provider_failed' } });
        continue;
      }
      if (typeof event.message?.content === 'string' && event.message.content) {
        yield runtimeEvent({ runId, sequence: sequence++, type: 'response.delta', payload: { text: event.message.content } });
      }
      if (event.done) {
        terminal = true;
        yield runtimeEvent({ runId, sequence: sequence++, type: 'response.completed' });
      }
    }
    if (!terminal) yield runtimeEvent({ runId, sequence: sequence++, type: 'response.failed', payload: { code: 'stream_interrupted' } });
  } catch {
    yield runtimeEvent({ runId, sequence: sequence++, type: 'response.failed', payload: { code: 'stream_invalid' } });
  }
}

export function createOllamaChatAdapter({ model, baseUrl = 'http://127.0.0.1:11434', keepAlive = '5m', fetchImpl = globalThis.fetch, idFactory = () => crypto.randomUUID() } = {}) {
  const modelId = required(model, 'Ollama model');
  if (typeof fetchImpl !== 'function') throw new TypeError('Ollama adapter requires fetch.');
  const endpoint = `${String(baseUrl).replace(/\/$/, '')}/api/chat`;

  return Object.freeze({
    async start(request = {}) {
      if (request.modality === 'voice') throw new TypeError('Ollama chat adapter only supports text.');
      const envelope = createRuntimeEnvelope(request);
      const runId = idFactory();
      const messages = [
        { role: 'system', content: envelope.instructions },
        ...envelope.history,
      ];
      if (envelope.message) messages.push({ role: 'user', content: envelope.message });
      const response = await fetchImpl(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: modelId, messages, stream: true, keep_alive: keepAlive }),
        signal: request.signal,
      });
      if (!response.ok) {
        const error = new Error(`Local model provider returned ${response.status}.`);
        error.code = 'PROVIDER_UNAVAILABLE';
        throw error;
      }
      return Object.freeze({ runId, provider: 'ollama', model: modelId, events: events(response.body, runId) });
    },
  });
}
