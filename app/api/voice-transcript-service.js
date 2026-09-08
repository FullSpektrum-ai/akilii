import { validateVoiceTranscriptPorts } from './ports.js';

const text = (value, max = 10_000) =>
  typeof value === 'string' ? value.trim().slice(0, max) : '';

function validateTurn(turn) {
  const id = text(turn?.id, 100);
  const role = turn?.role;
  const content = text(turn?.content, 10_000);
  const order = Number(turn?.order);
  if (!/^[A-Za-z0-9_-]{1,100}$/.test(id)) throw new TypeError('Invalid voice turn id.');
  if (!['user', 'assistant'].includes(role)) throw new TypeError('Invalid voice turn role.');
  if (!content) throw new TypeError('Voice turn content is required.');
  if (!Number.isInteger(order) || order < 0 || order > 500) throw new TypeError('Invalid voice turn order.');
  return { id, role, content, order };
}

export function createVoiceTranscriptService(rawPorts = {}) {
  const ports = validateVoiceTranscriptPorts(rawPorts);

  async function save(input = {}) {
    const subjectId = text(input.subjectId, 100);
    const conversationId = text(input.conversationId, 100);
    const episodeId = text(input.episodeId, 100);
    if (!subjectId || !conversationId || !episodeId) {
      throw new TypeError('Voice transcript subject, conversation and episode are required.');
    }
    if (!Array.isArray(input.turns) || input.turns.length > 80) {
      throw new TypeError('Voice transcript must contain at most 80 turns.');
    }

    const turns = input.turns.map(validateTurn).sort((a, b) => a.order - b.order);
    const at = ports.clock();
    await ports.conversationRepository.ensure({
      id: conversationId,
      subjectId,
      title: 'Voice conversation',
      at,
    });
    for (const turn of turns) {
      await ports.conversationRepository.append({
        id: `${episodeId}:${turn.id}`,
        subjectId,
        conversationId,
        role: turn.role,
        content: turn.content,
        at: at + turn.order,
      });
    }

    let episodeStatus = 'open';
    if (input.ended === true) {
      episodeStatus = input.status === 'abandoned' ? 'abandoned' : 'completed';
      await ports.episodeRepository.close({
        subjectId,
        id: episodeId,
        status: episodeStatus,
        endedAt: ports.clock(),
      });
    }

    return Object.freeze({
      conversationId,
      episodeId,
      savedTurns: turns.length,
      episodeStatus,
      durableContextChanged: false,
    });
  }

  return Object.freeze({ save });
}
