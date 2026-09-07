/** Bounded in-memory metadata only; never record messages, drafts or personal context. */
export function createTelemetry(now = () => performance.now()) {
  const events = [];
  return {
    record(type, metadata = {}) {
      const safe = { type, time: now() };
      for (const key of [
        'representation',
        'source',
        'latencyMs',
        'costUsd',
        'costKind',
        'failure',
        'from',
        'to',
      ])
        if (metadata[key] !== undefined) safe[key] = metadata[key];
      events.push(safe);
      if (events.length > 100) events.shift();
    },
    snapshot: () => structuredClone(events),
  };
}
