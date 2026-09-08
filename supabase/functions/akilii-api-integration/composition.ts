import {
  createBootstrapService,
  createContextService,
  createConversationService,
  createThreadService,
  createWorkService,
} from '../../../app/api/index.js';
import { createDurableVoiceSessionService } from '../../../app/api/integration/voice-session-service.js';
import { createVoiceTranscriptService } from '../../../app/api/integration/voice-transcript-service.js';
import { createIntegrationHttpApi } from '../../../app/adapters/http/integration/api.js';
import {
  createAnthropicMessagesAdapter,
  createConversationRuntime,
  createOpenAIRealtimeAdapter,
  createOpenAIResponsesAdapter,
} from '../../../app/adapters/runtime/index.js';
import { createPostgresStore } from '../../../app/adapters/storage/index.js';
import { createIntegratedSqlRepositories } from '../../../app/adapters/storage/integration-repositories.js';

type Environment = Record<string, string | undefined>;

function createTextAdapter(env: Environment, fetchImpl: typeof fetch) {
  const provider = env.AKILII_TEXT_PROVIDER?.trim().toLowerCase();
  if (!provider) return null;
  if (provider === 'openai') {
    if (!env.OPENAI_API_KEY || !env.AKILII_OPENAI_MODEL) return null;
    return createOpenAIResponsesAdapter({
      apiKey: env.OPENAI_API_KEY,
      model: env.AKILII_OPENAI_MODEL,
      fetchImpl,
    });
  }
  if (provider === 'anthropic') {
    if (!env.ANTHROPIC_API_KEY || !env.AKILII_ANTHROPIC_MODEL) return null;
    return createAnthropicMessagesAdapter({
      apiKey: env.ANTHROPIC_API_KEY,
      model: env.AKILII_ANTHROPIC_MODEL,
      fetchImpl,
    });
  }
  throw new Error(`Unsupported AKILII_TEXT_PROVIDER: ${provider}`);
}

function createVoiceAdapter(env: Environment, fetchImpl: typeof fetch) {
  if (!env.OPENAI_API_KEY || !env.AKILII_REALTIME_MODEL) return null;
  return createOpenAIRealtimeAdapter({
    apiKey: env.OPENAI_API_KEY,
    model: env.AKILII_REALTIME_MODEL,
    fetchImpl,
  });
}

export function composeIntegrationApi({
  sql,
  actor,
  env,
  fetchImpl = fetch,
}: {
  sql: any;
  actor: { id: string; email?: string };
  env: Environment;
  fetchImpl?: typeof fetch;
}) {
  const store = createPostgresStore(sql, actor);
  const repositories = createIntegratedSqlRepositories(store, {
    userId: actor.id,
    clock: Date.now,
  });
  const textAdapter = createTextAdapter(env, fetchImpl);
  const voiceAdapter = createVoiceAdapter(env, fetchImpl);
  const conversationRuntime = createConversationRuntime({
    textAdapter,
    voiceAdapter,
  });
  const factories = {
    idFactory: () => crypto.randomUUID(),
    clock: Date.now,
  };
  const capabilities = Object.freeze({
    chat: !!textAdapter,
    voice: !!voiceAdapter,
    context: true,
    threads: true,
    work: true,
    automaticSync: false,
    flowState: 'unqualified',
  });

  const services: Record<string, any> = {
    bootstrap: createBootstrapService(repositories, { capabilities }),
    context: createContextService(repositories),
    threads: createThreadService({ ...repositories, ...factories }),
    work: createWorkService({ ...repositories, ...factories }),
    chat: createConversationService({
      ...repositories,
      ...factories,
      conversationRuntime,
    }),
    voiceTranscript: createVoiceTranscriptService({
      ...repositories,
      clock: Date.now,
    }),
  };
  if (voiceAdapter) {
    services.voice = createDurableVoiceSessionService({
      ...repositories,
      ...factories,
      voiceRuntime: voiceAdapter,
    });
  }
  return createIntegrationHttpApi({ services });
}
