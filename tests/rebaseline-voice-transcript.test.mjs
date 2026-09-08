import test from 'node:test';
import assert from 'node:assert/strict';
import { createVoiceTranscriptService } from '../app/api/index.js';

test('voice transcript persistence is idempotent and never mutates durable context', async () => {
  const messages = new Map();
  const closed = [];
  const service = createVoiceTranscriptService({
    conversationRepository: {
      async ensure() {},
      async append(input) {
        const prior = messages.get(input.id);
        if (prior && (prior.role !== input.role || prior.content !== input.content)) {
          throw Object.assign(new Error('conflict'), { code: 'IDEMPOTENCY_CONFLICT' });
        }
        messages.set(input.id, input);
      },
    },
    episodeRepository: {
      async close(input) { closed.push(input); },
    },
    clock: () => 100,
  });

  const input = {
    subjectId: 'user-1',
    conversationId: 'conversation-1',
    episodeId: 'episode-1',
    turns: [
      { id: 'u1', role: 'user', content: 'I need to think aloud.', order: 0 },
      { id: 'a1', role: 'assistant', content: 'Go on.', order: 1 },
    ],
    ended: false,
  };

  const first = await service.save(input);
  const second = await service.save(input);
  assert.equal(messages.size, 2);
  assert.equal(first.durableContextChanged, false);
  assert.equal(second.savedTurns, 2);
  assert.equal(closed.length, 0);

  const ended = await service.save({ ...input, ended: true });
  assert.equal(ended.episodeStatus, 'completed');
  assert.equal(closed.length, 1);
});
