import {
  compileConversationPolicy,
  compileSupportProfile,
  conversationPolicyToInstructions,
  createEpisode,
  projectContext,
} from '../core/index.js';
import { requireFactory, requirePort } from './ports.js';

const text = (value, max = 4000) =>
  typeof value === 'string' ? value.trim().slice(0, max) : '';

function compactHistory(messages) {
  return (Array.isArray(messages) ? messages : [])
    .filter(message => message && ['user', 'assistant'].includes(message.role))
    .map(message => ({ role: message.role, content: text(message.content, 12_000) }))
    .filter(message => message.content)
    .slice(-16);
}

export function createVoiceSessionService(rawPorts = {}) {
  const contextRepository = requirePort(rawPorts.contextRepository, 'contextRepository', ['listForSubject']);
  const conversationRepository = requirePort(rawPorts.conversationRepository, 'conversationRepository', ['listRecent']);
  const episodeRepository = requirePort(rawPorts.episodeRepository, 'episodeRepository', ['open']);
  const voiceRuntime = requirePort(rawPorts.voiceRuntime, 'voiceRuntime', ['start']);
  const idFactory = requireFactory(rawPorts.idFactory, 'idFactory');
  const clock = requireFactory(rawPorts.clock, 'clock');

  async function prepare(input = {}) {
    const subjectId = text(input.subjectId, 100);
    if (!subjectId) throw new TypeError('Voice subject is required.');
    const objective = text(input.objective, 800) || 'Open voice conversation';
    const policyIntent = text(input.intent, 1000) || objective;
    const conversationId = text(input.conversationId, 100) || null;
    const useContext = input.useContext === true;

    const [contextItems, history] = await Promise.all([
      useContext ? contextRepository.listForSubject(subjectId) : Promise.resolve([]),
      conversationId
        ? conversationRepository.listRecent({ subjectId, conversationId, limit: 16 })
        : Promise.resolve([]),
    ]);
    const projection = projectContext(contextItems, {
      purpose: input.purpose || 'support',
      role: input.role,
      activity: input.activity,
      objective,
      environment: input.environment,
      currentState: input.currentState,
      sensitivityAllowance: input.sensitivityAllowance || 'standard',
      maxItems: 8,
      now: new Date(clock()).toISOString(),
    });
    const supportProfile = compileSupportProfile(projection, {
      message: policyIntent,
      session: input.session || {},
    });
    const conversationPolicy = compileConversationPolicy({
      modality: 'voice',
      supportProfile,
      message: policyIntent,
      session: input.session || {},
      capabilities: input.capabilities || [],
    });
    const episode = createEpisode({
      id: idFactory(),
      subjectId,
      conversationId,
      threadId: text(input.threadId, 100) || null,
      objective,
      at: clock(),
    });

    return {
      version: 1,
      subjectId,
      conversationId,
      threadId: episode.threadId,
      modality: 'voice',
      message: '',
      history: compactHistory(history),
      contextProjection: projection,
      supportProfile,
      conversationPolicy,
      instructions: conversationPolicyToInstructions(conversationPolicy),
      episode,
      sdp: input.sdp,
      voice: input.voice,
      speed: input.speed,
    };
  }

  async function start(input) {
    const request = await prepare(input);
    await episodeRepository.open(request.episode);
    const run = await voiceRuntime.start(request);
    if (!run || typeof run.runId !== 'string' || !run.runId) throw new Error('Voice runtime returned an invalid run.');
    return { request, run };
  }

  return Object.freeze({ prepare, start });
}
