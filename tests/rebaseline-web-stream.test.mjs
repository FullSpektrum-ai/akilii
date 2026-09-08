import test from 'node:test';
import assert from 'node:assert/strict';
import { createApiClient } from '../app/web/api-client.js';

function body(value) {
  return new ReadableStream({
    start(controller) {
      controller.enqueue(new TextEncoder().encode(value));
      controller.close();
    },
  });
}

test('browser chat client consumes normalized SSE and sends bearer auth', async () => {
  let authorization;
  const client = createApiClient({
    baseUrl: 'https://api.example/api/v1',
    tokenProvider: async () => 'token-1',
    fetchImpl: async (_url, options) => {
      authorization = options.headers.get('authorization');
      return new Response(body(
        'data: {"type":"run.started","runId":"r1","sequence":0,"payload":{}}\n\n' +
        'data: {"type":"response.delta","runId":"r1","sequence":1,"payload":{"text":"hello"}}\n\n' +
        'data: {"type":"response.completed","runId":"r1","sequence":2,"payload":{}}\n\n'
      ), {
        status: 200,
        headers: {
          'Content-Type': 'text/event-stream',
          'X-Akilii-Run-Id': 'r1',
          'X-Akilii-Conversation-Id': 'c1',
        },
      });
    },
  });

  const run = await client.startChat({ message: 'Hi' });
  const events = [];
  for await (const event of run.events) events.push(event);

  assert.equal(authorization, 'Bearer token-1');
  assert.equal(run.conversationId, 'c1');
  assert.deepEqual(events.map(event => event.type), [
    'run.started',
    'response.delta',
    'response.completed',
  ]);
});
