import { createThread, transitionThread } from '../core/index.js';
import { validateThreadPorts } from './ports.js';

const text = (value, max = 1200) =>
  typeof value === 'string' ? value.trim().slice(0, max) : '';

export function createThreadService(rawPorts) {
  const ports = validateThreadPorts(rawPorts);

  async function list(input = {}) {
    const subjectId = text(input.subjectId, 100);
    if (!subjectId) throw new TypeError('Thread subject is required.');
    return ports.threadRepository.list({ subjectId, limit: input.limit });
  }

  async function create(input = {}) {
    const thread = createThread({
      id: ports.idFactory(),
      subjectId: text(input.subjectId, 100),
      title: text(input.title, 180),
      objective: text(input.objective, 1200),
      conversationId: text(input.conversationId, 100),
      workId: text(input.workId, 100),
      lastConfirmed: text(input.lastConfirmed, 1200),
      lastDecision: text(input.lastDecision, 1200),
      nextMove: text(input.nextMove, 1200),
      openQuestions: input.openQuestions,
      at: ports.clock(),
    });
    return ports.threadRepository.save({ thread, expectedVersion: null });
  }

  async function transition(input = {}) {
    const id = text(input.id, 100);
    const subjectId = text(input.subjectId, 100);
    if (!id || !subjectId) throw new TypeError('Thread id and subject are required.');
    const current = await ports.threadRepository.get({ id, subjectId });
    if (!current) throw new Error('Thread not found.');
    if (input.expectedVersion !== current.version) {
      throw Object.assign(new Error('Thread changed. Reload before updating it.'), { code: 'VERSION_CONFLICT' });
    }
    const next = transitionThread(current, {
      to: input.to,
      confirmedComplete: input.confirmedComplete === true,
      lastConfirmed: input.lastConfirmed,
      lastDecision: input.lastDecision,
      nextMove: input.nextMove,
      openQuestions: input.openQuestions,
      at: ports.clock(),
    });
    return ports.threadRepository.save({ thread: next, expectedVersion: current.version });
  }

  return Object.freeze({ list, create, transition });
}
