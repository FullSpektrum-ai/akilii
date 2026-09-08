const THREAD_STATES = new Set(['active', 'held', 'ready', 'closed']);
const WORK_STATES = new Set(['proposed', 'active', 'completed', 'archived']);
const EPISODE_STATES = new Set(['open', 'completed', 'abandoned']);
const OUTCOME_STATES = new Set(['completed', 'partial', 'blocked', 'abandoned']);

const text = (value, max = 1000) =>
  typeof value === 'string' ? value.trim().slice(0, max) : '';

function requiredText(value, field, max) {
  const result = text(value, max);
  if (!result) throw new TypeError(`${field} is required.`);
  return result;
}

function versionOf(value) {
  const version = Number(value);
  if (!Number.isInteger(version) || version < 1) throw new TypeError('Version must be a positive integer.');
  return version;
}

function timestamp(value) {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  const parsed = typeof value === 'string' ? Date.parse(value) : NaN;
  return Number.isFinite(parsed) ? parsed : Date.now();
}

/** Create a new explicit continuity thread. */
export function createThread(input = {}) {
  const at = timestamp(input.at);
  return {
    id: requiredText(input.id, 'Thread id', 100),
    subjectId: requiredText(input.subjectId, 'Thread subject', 100),
    title: requiredText(input.title, 'Thread title', 180),
    objective: requiredText(input.objective, 'Thread objective', 1200),
    status: 'active',
    conversationId: text(input.conversationId, 100) || null,
    workId: text(input.workId, 100) || null,
    lastConfirmed: text(input.lastConfirmed, 1200),
    lastDecision: text(input.lastDecision, 1200),
    nextMove: text(input.nextMove, 1200),
    openQuestions: Array.isArray(input.openQuestions)
      ? input.openQuestions.map(value => text(value, 500)).filter(Boolean).slice(0, 12)
      : [],
    version: 1,
    createdAt: at,
    updatedAt: at,
  };
}

function validateThread(thread) {
  if (!thread || typeof thread !== 'object') throw new TypeError('Thread is required.');
  if (!THREAD_STATES.has(thread.status)) throw new TypeError('Invalid Thread state.');
  versionOf(thread.version);
  return thread;
}

/**
 * Transition Thread state without inventing progress, readiness, ETA or completion.
 * `ready` means resumable product state only.
 */
export function transitionThread(thread, transition = {}) {
  validateThread(thread);
  const to = transition.to;
  if (!THREAD_STATES.has(to)) throw new TypeError('Invalid Thread transition target.');

  const allowed = {
    active: new Set(['held', 'ready', 'closed']),
    held: new Set(['active', 'ready', 'closed']),
    ready: new Set(['active', 'held', 'closed']),
    closed: new Set(),
  };
  if (to !== thread.status && !allowed[thread.status].has(to)) {
    throw new Error(`Thread cannot move from ${thread.status} to ${to}.`);
  }

  if (to === 'closed' && transition.confirmedComplete !== true) {
    throw new Error('Closing a Thread requires explicit completion confirmation.');
  }

  return {
    ...thread,
    status: to,
    lastConfirmed: text(transition.lastConfirmed ?? thread.lastConfirmed, 1200),
    lastDecision: text(transition.lastDecision ?? thread.lastDecision, 1200),
    nextMove: to === 'closed' ? '' : text(transition.nextMove ?? thread.nextMove, 1200),
    openQuestions: Array.isArray(transition.openQuestions)
      ? transition.openQuestions.map(value => text(value, 500)).filter(Boolean).slice(0, 12)
      : [...(thread.openQuestions || [])],
    version: versionOf(thread.version) + 1,
    updatedAt: timestamp(transition.at),
  };
}

/** A persistence proposal is inert until a user explicitly approves it. */
export function createPersistenceProposal(input = {}) {
  return {
    id: requiredText(input.id, 'Proposal id', 100),
    subjectId: requiredText(input.subjectId, 'Proposal subject', 100),
    kind: requiredText(input.kind, 'Proposal kind', 60),
    title: requiredText(input.title, 'Proposal title', 180),
    payload: input.payload && typeof input.payload === 'object' ? { ...input.payload } : {},
    status: 'proposed',
    sourceRef: text(input.sourceRef, 120) || null,
    createdAt: timestamp(input.at),
  };
}

export function approvePersistenceProposal(proposal, input = {}) {
  if (!proposal || proposal.status !== 'proposed') throw new Error('Only a proposed write can be approved.');
  if (input.approved !== true) throw new Error('Explicit approval is required.');
  return {
    ...proposal,
    status: 'approved',
    approvedAt: timestamp(input.at),
    approvalRef: requiredText(input.approvalRef, 'Approval reference', 120),
  };
}

export function createWorkItem(input = {}) {
  if (input.approved !== true) throw new Error('Work persistence requires explicit approval.');
  const at = timestamp(input.at);
  return {
    id: requiredText(input.id, 'Work id', 100),
    subjectId: requiredText(input.subjectId, 'Work subject', 100),
    threadId: text(input.threadId, 100) || null,
    title: requiredText(input.title, 'Work title', 180),
    body: requiredText(input.body, 'Work body', 20000),
    status: 'active',
    version: 1,
    createdAt: at,
    updatedAt: at,
  };
}

export function transitionWork(work, input = {}) {
  if (!work || !WORK_STATES.has(work.status)) throw new TypeError('Valid Work item is required.');
  const to = input.to;
  if (!WORK_STATES.has(to)) throw new TypeError('Invalid Work state.');
  const allowed = {
    proposed: new Set(['active', 'archived']),
    active: new Set(['completed', 'archived']),
    completed: new Set(['active', 'archived']),
    archived: new Set(),
  };
  if (to !== work.status && !allowed[work.status].has(to)) {
    throw new Error(`Work cannot move from ${work.status} to ${to}.`);
  }
  if (to === 'completed' && input.confirmedComplete !== true) {
    throw new Error('Completing Work requires explicit confirmation.');
  }
  return { ...work, status: to, version: versionOf(work.version) + 1, updatedAt: timestamp(input.at) };
}

export function createEpisode(input = {}) {
  const at = timestamp(input.at);
  return {
    id: requiredText(input.id, 'Episode id', 100),
    subjectId: requiredText(input.subjectId, 'Episode subject', 100),
    conversationId: text(input.conversationId, 100) || null,
    threadId: text(input.threadId, 100) || null,
    objective: requiredText(input.objective, 'Episode objective', 1200),
    interventionRef: text(input.interventionRef, 120) || null,
    status: 'open',
    startedAt: at,
    endedAt: null,
  };
}

export function closeEpisode(episode, input = {}) {
  if (!episode || !EPISODE_STATES.has(episode.status)) throw new TypeError('Valid Episode is required.');
  if (episode.status !== 'open') throw new Error('Only an open Episode can be closed.');
  const status = input.status;
  if (!['completed', 'abandoned'].includes(status)) throw new TypeError('Invalid Episode close state.');
  return { ...episode, status, endedAt: timestamp(input.at) };
}

export function recordOutcome(input = {}) {
  if (!OUTCOME_STATES.has(input.status)) throw new TypeError('Invalid outcome state.');
  return {
    id: requiredText(input.id, 'Outcome id', 100),
    subjectId: requiredText(input.subjectId, 'Outcome subject', 100),
    episodeId: requiredText(input.episodeId, 'Outcome episode', 100),
    interventionRef: text(input.interventionRef, 120) || null,
    status: input.status,
    feedback: text(input.feedback, 4000),
    evidenceRefs: Array.isArray(input.evidenceRefs)
      ? input.evidenceRefs.map(value => text(value, 100)).filter(Boolean).slice(0, 20)
      : [],
    recordedAt: timestamp(input.at),
  };
}

/**
 * Outcome feedback can create a learning proposal, never a durable NPR item.
 * No textual feedback means no personal learning claim is proposed.
 */
export function proposeLearningFromOutcome(outcome, input = {}) {
  if (!outcome || !OUTCOME_STATES.has(outcome.status)) throw new TypeError('Valid outcome is required.');
  if (!outcome.feedback) return null;

  const statement = text(input.statement, 800);
  if (!statement) return null;

  return {
    id: requiredText(input.id, 'Learning proposal id', 100),
    subjectId: outcome.subjectId,
    outcomeId: outcome.id,
    itemType: input.itemType === 'strategy' ? 'strategy' : 'observation',
    statement,
    status: 'proposed',
    confidence: Math.min(0.75, Math.max(0.1, Number(input.confidence) || 0.4)),
    requiresConfirmation: true,
    createdAt: timestamp(input.at),
  };
}

export const stateContract = Object.freeze({
  threadStates: Object.freeze([...THREAD_STATES]),
  workStates: Object.freeze([...WORK_STATES]),
  episodeStates: Object.freeze([...EPISODE_STATES]),
  outcomeStates: Object.freeze([...OUTCOME_STATES]),
});
