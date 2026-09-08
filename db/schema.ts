import {
  index,
  integer,
  real,
  sqliteTable,
  text,
  uniqueIndex,
} from 'drizzle-orm/sqlite-core';

export const profiles = sqliteTable('profiles', {
  user_id: text().primaryKey(),
  name: text().notNull(),
  focus: text().notNull(),
  style: text().notNull(),
  consent_at: integer().notNull(),
  created_at: integer().notNull(),
});

export const conversations = sqliteTable('conversations', {
  id: text().primaryKey(),
  user_id: text().notNull(),
  title: text().notNull(),
  created_at: integer().notNull(),
  updated_at: integer().notNull(),
}, table => [index('conversations_user').on(table.user_id)]);

export const messages = sqliteTable('messages', {
  id: text().primaryKey(),
  user_id: text().notNull(),
  conversation_id: text().notNull(),
  role: text().notNull(),
  content: text().notNull(),
  created_at: integer().notNull(),
}, table => [index('messages_user_conversation').on(table.user_id, table.conversation_id)]);

// Legacy migration source only. New personal context belongs in npr_items / npr_proposals.
export const memories = sqliteTable('memories', {
  id: text().primaryKey(),
  user_id: text().notNull(),
  content: text().notNull(),
  source: text().notNull(),
  created_at: integer().notNull(),
}, table => [index('memories_user').on(table.user_id)]);

export const work_items = sqliteTable('work_items', {
  id: text().primaryKey(),
  user_id: text().notNull(),
  title: text().notNull(),
  body: text().notNull(),
  thread_id: text(),
  status: text().notNull().default('active'),
  version: integer().notNull(),
  created_at: integer().notNull(),
  updated_at: integer().notNull(),
}, table => [
  index('work_user').on(table.user_id),
  index('work_items_thread').on(table.user_id, table.thread_id),
]);

export const work_versions = sqliteTable('work_versions', {
  id: text().primaryKey(),
  user_id: text().notNull(),
  work_id: text().notNull(),
  body: text().notNull(),
  version: integer().notNull(),
  created_at: integer().notNull(),
}, table => [index('versions_user_work').on(table.user_id, table.work_id)]);

export const threads = sqliteTable('threads', {
  id: text().primaryKey(),
  user_id: text().notNull(),
  title: text().notNull(),
  objective: text().notNull(),
  status: text().notNull(),
  conversation_id: text(),
  project_id: text(),
  work_id: text(),
  last_confirmed: text().notNull().default(''),
  last_decision: text().notNull().default(''),
  next_move: text().notNull().default(''),
  open_questions: text().notNull().default('[]'),
  request_key: text().notNull(),
  version: integer().notNull().default(1),
  created_at: integer().notNull(),
  updated_at: integer().notNull(),
}, table => [
  index('threads_owner').on(table.user_id, table.updated_at),
  uniqueIndex('threads_request').on(table.user_id, table.request_key),
]);

export const npr_items = sqliteTable('npr_items', {
  id: text().primaryKey(),
  user_id: text().notNull(),
  item_type: text().notNull(),
  tier: text().notNull(),
  payload_json: text().notNull().default('{}'),
  lifecycle_state: text().notNull(),
  confirmation_state: text().notNull(),
  confidence: real().notNull(),
  sensitivity: text().notNull(),
  source_type: text().notNull(),
  source_ref: text().notNull().default(''),
  captured_at: integer().notNull(),
  captured_by: text().notNull(),
  valid_from: integer(),
  review_after: integer(),
  expires_at: integer(),
  evidence_refs_json: text().notNull().default('[]'),
  use_allowed: integer().notNull().default(1),
  purpose_scopes_json: text().notNull().default('[]'),
  export_allowed: integer().notNull().default(1),
  version: integer().notNull().default(1),
  created_at: integer().notNull(),
  updated_at: integer().notNull(),
}, table => [
  index('npr_items_owner').on(table.user_id, table.updated_at),
  index('npr_items_projection').on(
    table.user_id,
    table.lifecycle_state,
    table.confirmation_state,
    table.use_allowed,
  ),
]);

export const npr_proposals = sqliteTable('npr_proposals', {
  id: text().primaryKey(),
  user_id: text().notNull(),
  candidate_item_id: text().notNull(),
  item_type: text().notNull(),
  tier: text().notNull(),
  payload_json: text().notNull().default('{}'),
  status: text().notNull(),
  sensitivity: text().notNull(),
  confidence: real().notNull(),
  purpose_scopes_json: text().notNull().default('[]'),
  source_type: text().notNull(),
  source_ref: text().notNull().default(''),
  captured_by: text().notNull(),
  evidence_refs_json: text().notNull().default('[]'),
  rationale: text().notNull().default(''),
  version: integer().notNull().default(1),
  created_at: integer().notNull(),
  updated_at: integer().notNull(),
}, table => [index('npr_proposals_owner').on(table.user_id, table.status, table.created_at)]);

export const episodes = sqliteTable('episodes', {
  id: text().primaryKey(),
  user_id: text().notNull(),
  conversation_id: text(),
  thread_id: text(),
  objective: text().notNull(),
  intervention_ref: text(),
  status: text().notNull(),
  started_at: integer().notNull(),
  ended_at: integer(),
}, table => [
  index('episodes_owner').on(table.user_id, table.started_at),
  index('episodes_thread').on(table.user_id, table.thread_id, table.started_at),
]);

export const interventions = sqliteTable('interventions', {
  id: text().primaryKey(),
  user_id: text().notNull(),
  episode_id: text().notNull(),
  strategy: text().notNull(),
  support_profile_json: text().notNull().default('{}'),
  created_at: integer().notNull(),
}, table => [index('interventions_episode').on(table.user_id, table.episode_id, table.created_at)]);

export const npr_evidence = sqliteTable('npr_evidence', {
  id: text().primaryKey(),
  user_id: text().notNull(),
  episode_id: text(),
  source_type: text().notNull(),
  source_ref: text().notNull().default(''),
  summary: text().notNull().default(''),
  payload_json: text().notNull().default('{}'),
  created_at: integer().notNull(),
}, table => [index('npr_evidence_episode').on(table.user_id, table.episode_id, table.created_at)]);

export const support_outcomes = sqliteTable('support_outcomes', {
  id: text().primaryKey(),
  user_id: text().notNull(),
  episode_id: text().notNull(),
  intervention_id: text(),
  status: text().notNull(),
  feedback: text().notNull().default(''),
  evidence_refs_json: text().notNull().default('[]'),
  recorded_at: integer().notNull(),
}, table => [index('support_outcomes_episode').on(table.user_id, table.episode_id, table.recorded_at)]);

export const policy_events = sqliteTable('policy_events', {
  id: integer().primaryKey({ autoIncrement: true }),
  user_id: text().notNull(),
  event_type: text().notNull(),
  subject_ref: text().notNull().default(''),
  policy_version: text().notNull(),
  payload_json: text().notNull().default('{}'),
  created_at: integer().notNull(),
}, table => [index('policy_events_owner').on(table.user_id, table.created_at)]);

export const usage = sqliteTable('usage', {
  key: text().primaryKey(),
  count: integer().notNull(),
});

export const locks = sqliteTable('locks', {
  user_id: text().primaryKey(),
  until: integer().notNull(),
  request_id: text().notNull(),
});

export const requests = sqliteTable('requests', {
  id: text().primaryKey(),
  user_id: text().notNull(),
  conversation_id: text().notNull(),
  status: text().notNull(),
  created_at: integer().notNull(),
});

export const feedback = sqliteTable('feedback', {
  id: text().primaryKey(),
  user_id: text().notNull(),
  message_id: text().notNull(),
  rating: text().notNull(),
  created_at: integer().notNull(),
}, table => [index('feedback_user').on(table.user_id)]);
