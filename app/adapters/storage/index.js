export { createPostgresStore, createSqliteStore } from './sql-store.js';
export { createContextRepository } from './context-repository.js';
export {
  createConversationRepository,
  createEpisodeRepository,
  createProfileRepository,
  createThreadRepository,
  createWorkRepository,
  outcomeFromRow,
} from './activity-repositories.js';

import { createContextRepository } from './context-repository.js';
import {
  createConversationRepository,
  createEpisodeRepository,
  createProfileRepository,
  createThreadRepository,
  createWorkRepository,
} from './activity-repositories.js';

export function createSqlRepositories(store, options = {}) {
  return Object.freeze({
    profileRepository: createProfileRepository(store, options),
    contextRepository: createContextRepository(store, options),
    conversationRepository: createConversationRepository(store, options),
    episodeRepository: createEpisodeRepository(store, options),
    threadRepository: createThreadRepository(store, options),
    workRepository: createWorkRepository(store, options),
  });
}
