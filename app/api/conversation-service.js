import {
  compileConversationPolicy,
  compileSupportProfile,
  conversationPolicyToInstructions,
  createEpisode,
  projectContext,
} from '../core/index.js';
import { validateConversationPorts } from './ports.js';

const text = (value, max = 4000) =>
  typeof value === 'string' ? value.trim().slice(0, max) : '';

function validateInput(input = {}) {
  const subjectId = text(input.subjectId, 100);
  const message = text(input.message, 5000);
  const modality = input.modality === 'voice' ? 'voice' : 'text';
  if (!subjectId) throw new TypeError('Conversation subject is required.');
  if (!message) throw new TypeError('Conversation message is required.');

  return {
    subjectId,
    message,
    modality,
    conversationId: text(input.conversationId, 100) || null,
    threadId: text(input.threadId, 100) || null,
    role: text(input.role, 160),
    activity: text(input.activity, 240),
    objective: text(input.objective, 800) || message,
    environment: text(input.environment, 240),
    currentState: text(input.currentState, 800),
    purpose: ['support', 'planning', 'action', 'outcome_review'].includes(input.purpose)
      ? input.purpose
      : 'support',
    sensitivityAllowance: ['standard', 'sensitive', 'highly_sensitive'].includes(
      input.sensitivityAllowance,
    )
      ? input.sensitivityAllowance
      : 'standard',
    useContext: input.useContext === true,
    session: input.session && typeof input.session === 'object' ? { ...input.session } : {},
    capabilities: Array.isArray(input.capabilities) ? input.capabilities : [],
  };
}

function compactHistory(messages) {
  if (!Array.isArray(messages)) return [];
  let characters = 0;
  const selected = [];
  for (const message of [...messages].reverse()) {
    if (!message || !['user', 'assistant'].includes(message.role)) continue;
    const content = text(message.content, 12000);
    if (!content || characters + content.length > 12000) continue;
    characters += content.length;
    selected.push({ role: message.role, content });
    if (selected.length === 16) break;
  }
  return selected.reverse();
}

export function createConversationService(rawPorts) {
  const ports = validateConversationPorts(rawPorts);

  async function prepare(rawInput) {
    const input = validateInput(rawInput);
    const [contextItems, history] = await Promise.all([
      input.useContext ? ports.contextRepository.listForSubject(input.subjectId) : Promise.resolve([]),
      input.conversationId
        ? ports.conversationRepository.listRecent({
            subjectId: input.subjectId,
            conversationId: input.conversationId,
            limit: 16,
          })
        : Promise.resolve([]),
    ]);

    const projection = projectContext(contextItems, {
      purpose: input.purpose,
      role: input.role,
      activity: input.activity,
      objective: input.objective,
      environment: input.environment,
      currentState: input.currentState,
      sensitivityAllowance: input.sensitivityAllowance,
      maxItems: 8,
      now: new Date(ports.clock()).toISOString(),
    });

    const supportProfile = compileSupportProfile(projection, {
      message: input.message,
      session: input.session,
    });
    const policy = compileConversationPolicy({
      modality: input.modality,
      supportProfile,
      message: input.message,
      session: input.session,
      capabilities: input.capabilities,
    });

    const episode = createEpisode({
      id: ports.idFactory(),
      subjectId: input.subjectId,
      conversationId: input.conversationId,
      threadId: input.threadId,
      objective: input.objective,
      at: ports.clock(),
    });

    return {
      version: 1,
      subjectId: input.subjectId,
      conversationId: input.conversationId,
      threadId: input.threadId,
      modality: input.modality,
      message: input.message,
      history: compactHistory(history),
      contextProjection: projection,
      supportProfile,
      conversationPolicy: policy,
      instructions: conversationPolicyToInstructions(policy),
      episode,
    };
  }

  async function start(rawInput) {
    const request = await prepare(rawInput);
    await ports.episodeRepository.open(request.episode);
    const run = await ports.conversationRuntime.start(request);
    if (!run || typeof run !== 'object' || !text(run.runId, 120)) {
      throw new Error('Conversation runtime returned an invalid run.');
    }
    return { request, run };
  }

  return Object.freeze({ prepare, start });
}
