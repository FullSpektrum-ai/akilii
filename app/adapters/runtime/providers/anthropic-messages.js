import { createRuntimeEnvelope } from '../context-envelope.js';
import { runtimeEvent } from '../events.js';
import { readSseJson } from '../streams.js';

const ENDPOINT = 'https://api.anthropic.com/v1/messages';

function required(value, name) {
  if (typeof value !== 'string' || !value.trim()) throw new TypeError(`${name} is required.`);
  return value.trim();
}

async function* events(body, runId) {
  let sequence = 0;
  let terminal = false;
  yield runtimeEvent({ runId, sequence: sequence++, type: 'run.started' });
  try {
    for await (const event of readSseJson(body)) {
      if (event.type === 'content_block_delta' && event.delta?.type === 'text_delta' && typeof event.delta.text === 'string') {
        yield runtimeEvent({ runId, sequence: sequence++, type: 'response.delta', payload: { text: event.delta.text } });
      } else if (event.type === 'message_stop') {
        terminal = true;
        yield runtimeEvent({ runId, sequence: sequence++, type: 'response.completed' });
      } else if (event.type === 'error') {
        terminal = true;
        yield runtimeEvent({ runId, sequence: sequence++, type: 'response.failed', payload: { code: 'provider_failed' } });
      }
    }
    if (!terminal) yield runtimeEvent({ runId, sequence: sequence++, type: 'response.failed', payload: { code: 'stream_interrupted' } });
  } catch {
    yield runtimeEvent({ runId, sequence: sequence++, type: 'response.failed', payload: { code: 'stream_invalid' } });
  }
}

export function createAnthropicMessagesAdapter({ apiKey, model, maxTokens = 1200, fetchImpl = globalThis.fetch, idFactory = () => crypto.randomUUID() } = {}) {
  const key = required(apiKey, 'Anthropic API key');
  const modelId = required(model, 'Anthropic model');
  if (typeof fetchImpl !== 'function') throw new TypeError('Anthropic adapter requires fetch.');

  return Object.freeze({
    async start(request = {}) {
      if (request.modality === 'voice') throw new TypeError('Anthropic Messages adapter only supports text.');
      const envelope = createRuntimeEnvelope(request);
      const runId = idFactory();
      const messages = [...envelope.history];
      if (envelope.message) messages.push({ role: 'user', content: envelope.message });
      const response = await fetchImpl(ENDPOINT, {
        method: 'POST',
        headers: {
          'x-api-key': key,
          'anthropic-version': '2023-06-01',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: modelId,
          max_tokens: Math.max(128, Math.min(8192, Number(maxTokens) || 1200)),
          system: envelope.instructions,
          messages,
          stream: true,
        }),
        signal: request.signal,
      });
      if (!response.ok) {
        const error = new Error(`Anthropic text provider returned ${response.status}.`);
        error.code = 'PROVIDER_UNAVAILABLE';
        throw error;
      }
      return Object.freeze({ runId, provider: 'anthropic', model: modelId, events: events(response.body, runId) });
    },
  });
}
