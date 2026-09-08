const TYPES = new Set([
  'run.started',
  'response.delta',
  'response.completed',
  'response.failed',
  'voice.session.ready',
]);

export function runtimeEvent({ runId, sequence, type, payload = {}, at = Date.now() } = {}) {
  if (typeof runId !== 'string' || !runId) throw new TypeError('Runtime event runId is required.');
  if (!Number.isInteger(sequence) || sequence < 0) throw new TypeError('Runtime event sequence is required.');
  if (!TYPES.has(type)) throw new TypeError(`Unsupported runtime event type: ${type}`);
  return Object.freeze({
    version: 1,
    runId,
    sequence,
    type,
    at: Number(at),
    payload: payload && typeof payload === 'object' ? { ...payload } : {},
  });
}

export const runtimeEventTypes = Object.freeze([...TYPES]);
