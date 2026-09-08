import { createSqlRepositories } from './index.js';

const text = (value, max = 20_000) =>
  typeof value === 'string' ? value.trim().slice(0, max) : '';

function sameSubject(subjectId, userId) {
  if (!subjectId || subjectId !== userId) {
    throw Object.assign(new Error('Subject is unavailable.'), { code: 'SUBJECT_MISMATCH' });
  }
}

function boundedLimit(value, fallback = 100) {
  return Math.max(1, Math.min(200, Number(value) || fallback));
}

function createStrictConversationRepository(store, { userId } = {}) {
  async function list({ subjectId, limit = 100 } = {}) {
    sameSubject(subjectId, userId);
    return store.all(
      'SELECT id,title,created_at,updated_at FROM conversations WHERE user_id=? ORDER BY updated_at DESC LIMIT ?',
      [userId, boundedLimit(limit)],
    );
  }

  async function listRecent({ subjectId, conversationId, limit = 16 } = {}) {
    sameSubject(subjectId, userId);
    const rows = await store.all(
      'SELECT role,content,created_at FROM messages WHERE user_id=? AND conversation_id=? ORDER BY created_at DESC LIMIT ?',
      [userId, conversationId, boundedLimit(limit, 16)],
    );
    return rows.reverse();
  }

  async function ensure({ id, subjectId, title, at } = {}) {
    sameSubject(subjectId, userId);
    const result = await store.run(
      'INSERT INTO conversations(id,user_id,title,created_at,updated_at) VALUES(?,?,?,?,?) ON CONFLICT(id) DO NOTHING',
      [id, userId, text(title, 160) || 'Conversation', at, at],
    );
    if (result.changes === 0) {
      const existing = await store.first(
        'SELECT id FROM conversations WHERE id=? AND user_id=?',
        [id, userId],
      );
      if (!existing) throw new Error('Conversation id is unavailable.');
    }
    return { id };
  }

  async function append({ id, subjectId, conversationId, role, content, at } = {}) {
    sameSubject(subjectId, userId);
    if (!['user', 'assistant'].includes(role)) throw new TypeError('Invalid conversation role.');
    const body = text(content);
    if (!body) throw new TypeError('Message content is required.');

    const result = await store.run(
      'INSERT INTO messages(id,user_id,conversation_id,role,content,created_at) VALUES(?,?,?,?,?,?) ON CONFLICT(id) DO NOTHING',
      [id, userId, conversationId, role, body, at],
    );
    if (result.changes === 0) {
      const existing = await store.first(
        'SELECT role,content FROM messages WHERE id=? AND user_id=? AND conversation_id=?',
        [id, userId, conversationId],
      );
      if (!existing) throw new Error('Message id is unavailable.');
      if (existing.role !== role || existing.content !== body) {
        throw Object.assign(
          new Error('Message replay content does not match the original write.'),
          { code: 'IDEMPOTENCY_CONFLICT' },
        );
      }
    }
    await store.run(
      'UPDATE conversations SET updated_at=? WHERE id=? AND user_id=?',
      [at, conversationId, userId],
    );
    return { id, role, content: body };
  }

  return Object.freeze({ list, listRecent, ensure, append });
}

export function createIntegratedSqlRepositories(store, options = {}) {
  const repositories = createSqlRepositories(store, options);
  return Object.freeze({
    ...repositories,
    conversationRepository: createStrictConversationRepository(store, options),
  });
}
