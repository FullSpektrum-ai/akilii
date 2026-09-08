function safeEvent(event) {
  if (!event || typeof event !== 'object') return null;
  const type = typeof event.type === 'string' ? event.type : '';
  if (!['run.started','response.delta','response.completed','response.failed'].includes(type)) return null;
  return {
    version: 1,
    runId: typeof event.runId === 'string' ? event.runId : '',
    sequence: Number.isInteger(event.sequence) ? event.sequence : 0,
    type,
    at: Number(event.at || Date.now()),
    payload: type === 'response.delta'
      ? { text: typeof event.payload?.text === 'string' ? event.payload.text : '' }
      : type === 'response.failed'
        ? { code: typeof event.payload?.code === 'string' ? event.payload.code : 'run_failed' }
        : {},
  };
}

export function runtimeEventsResponse(events, { runId, conversationId } = {}) {
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      try {
        for await (const raw of events || []) {
          const event = safeEvent(raw);
          if (event) controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`));
        }
      } catch {
        const failed = { version: 1, runId, sequence: 0, type: 'response.failed', at: Date.now(), payload: { code: 'stream_failed' } };
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(failed)}\n\n`));
      } finally { controller.close(); }
    },
  });
  const headers = new Headers({
    'Content-Type': 'text/event-stream; charset=utf-8',
    'Cache-Control': 'no-store',
    'X-Content-Type-Options': 'nosniff',
  });
  if (runId) headers.set('X-Akilii-Run-Id', runId);
  if (conversationId) headers.set('X-Akilii-Conversation-Id', conversationId);
  return new Response(stream, { status: 200, headers });
}
