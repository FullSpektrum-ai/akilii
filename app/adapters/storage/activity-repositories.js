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

export function createConversationRepository(store, { userId } = {}) {
  return Object.freeze({
    async listRecent({ subjectId, conversationId, limit = 16 } = {}) {
      sameSubject(subjectId, userId);
      const boundedLimit = Math.max(1, Math.min(50, Number(limit) || 16));
      return store.all(
        'SELECT role,content,created_at FROM messages WHERE user_id=? AND conversation_id=? ORDER BY created_at DESC LIMIT ?',
        [userId, conversationId, boundedLimit],
      );
    },
  });
}

export function createEpisodeRepository(store, { userId } = {}) {
  return Object.freeze({
    async open(episode) {
      sameSubject(episode?.subjectId, userId);
      const result = await store.run(
        `INSERT INTO episodes(
          id,user_id,conversation_id,thread_id,objective,intervention_ref,status,started_at,ended_at
        ) VALUES(?,?,?,?,?,?,?,?,?) ON CONFLICT(id) DO NOTHING`,
        [
          episode.id,
          userId,
          episode.conversationId,
          episode.threadId,
          episode.objective,
          episode.interventionRef,
          episode.status,
          episode.startedAt,
          episode.endedAt,
        ],
      );
      if (result.changes === 0) {
        const existing = await store.first('SELECT id,user_id FROM episodes WHERE id=? AND user_id=?', [episode.id, userId]);
        if (!existing) throw new Error('Episode id is already in use.');
      }
      return episode;
    },
  });
}

export function createThreadRepository(store, { userId } = {}) {
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
        [
          thread.id,
          userId,
          thread.title,
          thread.objective,
          thread.status,
          thread.conversationId,
          null,
          thread.workId,
          thread.lastConfirmed,
          thread.lastDecision,
          thread.nextMove,
          encodeJson(thread.openQuestions || []),
          thread.id,
          thread.version,
          thread.createdAt,
          thread.updatedAt,
        ],
      );
      expectOne(result, 'Thread already exists.');
      return get({ id: thread.id, subjectId: userId });
    }

    const result = await store.run(
      `UPDATE threads SET
        title=?,objective=?,status=?,conversation_id=?,work_id=?,last_confirmed=?,last_decision=?,
        next_move=?,open_questions=?,version=?,updated_at=?
       WHERE id=? AND user_id=? AND version=?`,
      [
        thread.title,
        thread.objective,
        thread.status,
        thread.conversationId,
        thread.workId,
        thread.lastConfirmed,
        thread.lastDecision,
        thread.nextMove,
        encodeJson(thread.openQuestions || []),
        thread.version,
        thread.updatedAt,
        thread.id,
        userId,
        expectedVersion,
      ],
    );
    expectOne(result, 'Thread changed. Reload before updating it.');
    return get({ id: thread.id, subjectId: userId });
  }

  return Object.freeze({ get, save });
}

export function createWorkRepository(store, { userId } = {}) {
  async function get({ id, subjectId } = {}) {
    sameSubject(subjectId, userId);
    return workFromRow(await store.first('SELECT * FROM work_items WHERE id=? AND user_id=?', [id, userId]));
  }

  async function save({ work, expectedVersion } = {}) {
    sameSubject(work?.subjectId, userId);
    if (expectedVersion === null || expectedVersion === undefined) {
      const result = await store.run(
        `INSERT INTO work_items(
          id,user_id,title,body,thread_id,status,version,created_at,updated_at
        ) VALUES(?,?,?,?,?,?,?,?,?) ON CONFLICT(id) DO NOTHING`,
        [
          work.id,
          userId,
          work.title,
          work.body,
          work.threadId,
          work.status,
          work.version,
          work.createdAt,
          work.updatedAt,
        ],
      );
      expectOne(result, 'Work item already exists.');
      return get({ id: work.id, subjectId: userId });
    }

    const current = await get({ id: work.id, subjectId: userId });
    if (!current || Number(current.version) !== Number(expectedVersion)) {
      throw Object.assign(new Error('Work changed. Reload before updating it.'), { code: 'VERSION_CONFLICT' });
    }

    const result = await store.run(
      `UPDATE work_items SET title=?,body=?,thread_id=?,status=?,version=?,updated_at=?
       WHERE id=? AND user_id=? AND version=?`,
      [
        work.title,
        work.body,
        work.threadId,
        work.status,
        work.version,
        work.updatedAt,
        work.id,
        userId,
        expectedVersion,
      ],
    );
    expectOne(result, 'Work changed. Reload before updating it.');
    return get({ id: work.id, subjectId: userId });
  }

  return Object.freeze({ get, save });
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
