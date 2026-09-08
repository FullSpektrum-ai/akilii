import { decodeJson, encodeJson, threadFromRow, workFromRow } from './codecs.js';

const text = (value, max = 1200) =>
  typeof value === 'string' ? value.trim().slice(0, max) : '';

function sameSubject(subjectId, userId) {
  if (!subjectId || subjectId !== userId) {
    throw Object.assign(new Error('Subject is unavailable.'), { code: 'SUBJECT_MISMATCH' });
  }
  return subjectId;
}

function expectOne(result, message) {
  if (Number(result?.changes || 0) !== 1) {
    throw Object.assign(new Error(message), { code: 'VERSION_CONFLICT' });
  }
}

function boundedLimit(value, fallback = 100) {
  return Math.max(1, Math.min(200, Number(value) || fallback));
}

export function createProfileRepository(store, { userId } = {}) {
  return Object.freeze({
    async get({ subjectId } = {}) {
      sameSubject(subjectId, userId);
      return store.first('SELECT user_id,name,focus,style,created_at FROM profiles WHERE user_id=?', [userId]);
    },
  });
}

export function createConversationRepository(store, { userId } = {}) {
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
      const existing = await store.first('SELECT id FROM conversations WHERE id=? AND user_id=?', [id, userId]);
      if (!existing) throw new Error('Conversation id is unavailable.');
    }
    return { id };
  }

  async function append({ id, subjectId, conversationId, role, content, at } = {}) {
    sameSubject(subjectId, userId);
    if (!['user', 'assistant'].includes(role)) throw new TypeError('Invalid conversation role.');
    const body = text(content, 20_000);
    if (!body) throw new TypeError('Message content is required.');
    const result = await store.run(
      'INSERT INTO messages(id,user_id,conversation_id,role,content,created_at) VALUES(?,?,?,?,?,?) ON CONFLICT(id) DO NOTHING',
      [id, userId, conversationId, role, body, at],
    );
    if (result.changes === 0) {
      const existing = await store.first(
        'SELECT id FROM messages WHERE id=? AND user_id=? AND conversation_id=?',
        [id, userId, conversationId],
      );
      if (!existing) throw new Error('Message id is unavailable.');
    }
    await store.run('UPDATE conversations SET updated_at=? WHERE id=? AND user_id=?', [at, conversationId, userId]);
    return { id, role, content: body };
  }

  return Object.freeze({ list, listRecent, ensure, append });
}

export function createEpisodeRepository(store, { userId } = {}) {
  async function open(episode) {
    sameSubject(episode?.subjectId, userId);
    const result = await store.run(
      `INSERT INTO episodes(
        id,user_id,conversation_id,thread_id,objective,intervention_ref,status,started_at,ended_at
      ) VALUES(?,?,?,?,?,?,?,?,?) ON CONFLICT(id) DO NOTHING`,
      [episode.id, userId, episode.conversationId, episode.threadId, episode.objective, episode.interventionRef, episode.status, episode.startedAt, episode.endedAt],
    );
    if (result.changes === 0) {
      const existing = await store.first('SELECT id FROM episodes WHERE id=? AND user_id=?', [episode.id, userId]);
      if (!existing) throw new Error('Episode id is unavailable.');
    }
    return episode;
  }

  async function close({ subjectId, id, status, endedAt } = {}) {
    sameSubject(subjectId, userId);
    if (!['completed', 'abandoned'].includes(status)) throw new TypeError('Invalid Episode close state.');
    const result = await store.run(
      "UPDATE episodes SET status=?,ended_at=? WHERE id=? AND user_id=? AND status='open'",
      [status, endedAt, id, userId],
    );
    if (result.changes === 0) {
      const existing = await store.first('SELECT status FROM episodes WHERE id=? AND user_id=?', [id, userId]);
      if (!existing || existing.status !== status) throw new Error('Episode could not be closed.');
    }
    return { id, status, endedAt };
  }

  return Object.freeze({ open, close });
}

export function createThreadRepository(store, { userId } = {}) {
  async function list({ subjectId, limit = 100 } = {}) {
    sameSubject(subjectId, userId);
    const rows = await store.all(
      'SELECT * FROM threads WHERE user_id=? ORDER BY updated_at DESC LIMIT ?',
      [userId, boundedLimit(limit)],
    );
    return rows.map(threadFromRow);
  }

  async function get({ id, subjectId } = {}) {
    sameSubject(subjectId, userId);
    return threadFromRow(await store.first('SELECT * FROM threads WHERE id=? AND user_id=?', [id, userId]));
  }

  async function save({ thread, expectedVersion } = {}) {
    sameSubject(thread?.subjectId, userId);
    if (expectedVersion === null || expectedVersion === undefined) {
      const result = await store.run(
        `INSERT INTO threads(
          id,user_id,title,objective,status,conversation_id,project_id,work_id,
          last_confirmed,last_decision,next_move,open_questions,request_key,version,created_at,updated_at
        ) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?) ON CONFLICT(id) DO NOTHING`,
        [thread.id,userId,thread.title,thread.objective,thread.status,thread.conversationId,null,thread.workId,thread.lastConfirmed,thread.lastDecision,thread.nextMove,encodeJson(thread.openQuestions || []),thread.id,thread.version,thread.createdAt,thread.updatedAt],
      );
      expectOne(result, 'Thread already exists.');
      return get({ id: thread.id, subjectId: userId });
    }
    const result = await store.run(
      `UPDATE threads SET title=?,objective=?,status=?,conversation_id=?,work_id=?,last_confirmed=?,last_decision=?,next_move=?,open_questions=?,version=?,updated_at=?
       WHERE id=? AND user_id=? AND version=?`,
      [thread.title,thread.objective,thread.status,thread.conversationId,thread.workId,thread.lastConfirmed,thread.lastDecision,thread.nextMove,encodeJson(thread.openQuestions || []),thread.version,thread.updatedAt,thread.id,userId,expectedVersion],
    );
    expectOne(result, 'Thread changed. Reload before updating it.');
    return get({ id: thread.id, subjectId: userId });
  }

  return Object.freeze({ list, get, save });
}

export function createWorkRepository(store, { userId } = {}) {
  async function list({ subjectId, limit = 100 } = {}) {
    sameSubject(subjectId, userId);
    const rows = await store.all(
      'SELECT * FROM work_items WHERE user_id=? ORDER BY updated_at DESC LIMIT ?',
      [userId, boundedLimit(limit)],
    );
    return rows.map(workFromRow);
  }

  async function get({ id, subjectId } = {}) {
    sameSubject(subjectId, userId);
    return workFromRow(await store.first('SELECT * FROM work_items WHERE id=? AND user_id=?', [id, userId]));
  }

  async function save({ work, expectedVersion } = {}) {
    sameSubject(work?.subjectId, userId);
    if (expectedVersion === null || expectedVersion === undefined) {
      const result = await store.run(
        'INSERT INTO work_items(id,user_id,title,body,thread_id,status,version,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?,?) ON CONFLICT(id) DO NOTHING',
        [work.id,userId,work.title,work.body,work.threadId,work.status,work.version,work.createdAt,work.updatedAt],
      );
      expectOne(result, 'Work item already exists.');
      return get({ id: work.id, subjectId: userId });
    }
    const result = await store.run(
      'UPDATE work_items SET title=?,body=?,thread_id=?,status=?,version=?,updated_at=? WHERE id=? AND user_id=? AND version=?',
      [work.title,work.body,work.threadId,work.status,work.version,work.updatedAt,work.id,userId,expectedVersion],
    );
    expectOne(result, 'Work changed. Reload before updating it.');
    return get({ id: work.id, subjectId: userId });
  }

  return Object.freeze({ list, get, save });
}

export function outcomeFromRow(row) {
  if (!row) return null;
  return {
    id: text(row.id, 100),
    subjectId: text(row.user_id, 100),
    episodeId: text(row.episode_id, 100),
    interventionRef: text(row.intervention_id, 100) || null,
    status: text(row.status, 30),
    feedback: text(row.feedback, 4000),
    evidenceRefs: decodeJson(row.evidence_refs_json, []),
    recordedAt: Number(row.recorded_at || 0),
  };
}
