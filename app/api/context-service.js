import { projectContext } from '../core/index.js';
import { validateContextPorts } from './ports.js';

const text = (value, max = 1000) =>
  typeof value === 'string' ? value.trim().slice(0, max) : '';

function subjectIdOf(input) {
  const subjectId = text(input?.subjectId, 100);
  if (!subjectId) throw new TypeError('Context subject is required.');
  return subjectId;
}

function proposalIdOf(input) {
  const proposalId = text(input?.proposalId, 100);
  if (!proposalId) throw new TypeError('Context proposal id is required.');
  return proposalId;
}

function itemIdOf(input) {
  const itemId = text(input?.itemId, 100);
  if (!itemId) throw new TypeError('Context item id is required.');
  return itemId;
}

export function createContextService(rawPorts) {
  const { contextRepository } = validateContextPorts(rawPorts);

  async function inspect(input) {
    const subjectId = subjectIdOf(input);
    const [items, proposals] = await Promise.all([
      contextRepository.listForSubject(subjectId),
      contextRepository.listProposals(subjectId),
    ]);
    return {
      subjectId,
      items: Array.isArray(items) ? items : [],
      proposals: Array.isArray(proposals) ? proposals : [],
    };
  }

  async function project(input) {
    const subjectId = subjectIdOf(input);
    const items = input.useContext === false
      ? []
      : await contextRepository.listForSubject(subjectId);
    return projectContext(items, {
      purpose: input.purpose,
      role: input.role,
      activity: input.activity,
      objective: input.objective,
      environment: input.environment,
      currentState: input.currentState,
      sensitivityAllowance: input.sensitivityAllowance,
      maxItems: input.maxItems,
      now: input.now,
    });
  }

  async function confirm(input) {
    const subjectId = subjectIdOf(input);
    const proposalId = proposalIdOf(input);
    return contextRepository.confirmProposal({
      subjectId,
      proposalId,
      edits: input.edits && typeof input.edits === 'object' ? { ...input.edits } : null,
      expectedVersion: input.expectedVersion,
    });
  }

  async function reject(input) {
    return contextRepository.rejectProposal({
      subjectId: subjectIdOf(input),
      proposalId: proposalIdOf(input),
      expectedVersion: input.expectedVersion,
      reason: text(input.reason, 500),
    });
  }

  async function restrict(input) {
    return contextRepository.restrictItem({
      subjectId: subjectIdOf(input),
      itemId: itemIdOf(input),
      expectedVersion: input.expectedVersion,
      useAllowed: input.useAllowed === true,
      purposeScopes: Array.isArray(input.purposeScopes) ? [...input.purposeScopes] : [],
    });
  }

  async function remove(input) {
    return contextRepository.deleteItem({
      subjectId: subjectIdOf(input),
      itemId: itemIdOf(input),
      expectedVersion: input.expectedVersion,
    });
  }

  return Object.freeze({ inspect, project, confirm, reject, restrict, remove });
}
