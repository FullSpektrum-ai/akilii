import { createWorkItem, transitionWork } from '../core/index.js';
import { validateWorkPorts } from './ports.js';

const text = (value, max = 20000) =>
  typeof value === 'string' ? value.trim().slice(0, max) : '';

export function createWorkService(rawPorts) {
  const ports = validateWorkPorts(rawPorts);

  async function create(input = {}) {
    const approvalRef = text(input.approvalRef, 120);
    if (input.approved !== true || !approvalRef) {
      throw new Error('Work persistence requires explicit approval and an approval reference.');
    }

    const work = createWorkItem({
      id: ports.idFactory(),
      subjectId: text(input.subjectId, 100),
      threadId: text(input.threadId, 100),
      title: text(input.title, 180),
      body: text(input.body, 20000),
      approved: true,
      at: ports.clock(),
    });
    const saved = await ports.workRepository.save({ work, expectedVersion: null });
    return {
      work: saved,
      receipt: {
        operation: 'work.create',
        workId: saved.id,
        version: saved.version,
        approvalRef,
      },
    };
  }

  async function transition(input = {}) {
    const id = text(input.id, 100);
    const subjectId = text(input.subjectId, 100);
    if (!id || !subjectId) throw new TypeError('Work id and subject are required.');

    const current = await ports.workRepository.get({ id, subjectId });
    if (!current) throw new Error('Work item not found.');
    if (input.expectedVersion !== current.version) {
      throw Object.assign(new Error('Work changed. Reload before updating it.'), { code: 'VERSION_CONFLICT' });
    }

    const next = transitionWork(current, {
      to: input.to,
      confirmedComplete: input.confirmedComplete === true,
      at: ports.clock(),
    });
    const saved = await ports.workRepository.save({ work: next, expectedVersion: current.version });
    return {
      work: saved,
      receipt: {
        operation: 'work.transition',
        workId: saved.id,
        version: saved.version,
        from: current.status,
        to: saved.status,
      },
    };
  }

  return Object.freeze({ create, transition });
}
