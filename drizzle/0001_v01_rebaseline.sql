ALTER TABLE `work_items` ADD COLUMN `thread_id` text;
--> statement-breakpoint
ALTER TABLE `work_items` ADD COLUMN `status` text NOT NULL DEFAULT 'active' CHECK (`status` IN ('proposed','active','completed','archived'));
--> statement-breakpoint
CREATE INDEX `work_items_thread` ON `work_items` (`user_id`,`thread_id`);
--> statement-breakpoint
CREATE TABLE `threads` (
  `id` text PRIMARY KEY NOT NULL,
  `user_id` text NOT NULL,
  `title` text NOT NULL,
  `objective` text NOT NULL,
  `status` text NOT NULL CHECK (`status` IN ('active','held','ready','closed')),
  `conversation_id` text,
  `project_id` text,
  `work_id` text,
  `last_confirmed` text NOT NULL DEFAULT '',
  `last_decision` text NOT NULL DEFAULT '',
  `next_move` text NOT NULL DEFAULT '',
  `open_questions` text NOT NULL DEFAULT '[]',
  `request_key` text NOT NULL,
  `version` integer NOT NULL DEFAULT 1,
  `created_at` integer NOT NULL,
  `updated_at` integer NOT NULL,
  UNIQUE (`user_id`,`request_key`)
);
--> statement-breakpoint
CREATE INDEX `threads_owner` ON `threads` (`user_id`,`updated_at`);
--> statement-breakpoint
CREATE TABLE `npr_items` (
  `id` text PRIMARY KEY NOT NULL,
  `user_id` text NOT NULL,
  `item_type` text NOT NULL CHECK (`item_type` IN ('user_assertion','communication_preference','support_preference','observation','goal','friction','strategy','relationship_reference')),
  `tier` text NOT NULL CHECK (`tier` IN ('stable','semi_stable','dynamic')),
  `payload_json` text NOT NULL DEFAULT '{}',
  `lifecycle_state` text NOT NULL CHECK (`lifecycle_state` IN ('captured','classified','proposed','active','contradicted','superseded','deprecated','expired','deleted')),
  `confirmation_state` text NOT NULL CHECK (`confirmation_state` IN ('user_asserted','proposed','confirmed','rejected','not_required')),
  `confidence` real NOT NULL CHECK (`confidence` >= 0 AND `confidence` <= 1),
  `sensitivity` text NOT NULL CHECK (`sensitivity` IN ('standard','sensitive','highly_sensitive')),
  `source_type` text NOT NULL,
  `source_ref` text NOT NULL DEFAULT '',
  `captured_at` integer NOT NULL,
  `captured_by` text NOT NULL,
  `valid_from` integer,
  `review_after` integer,
  `expires_at` integer,
  `evidence_refs_json` text NOT NULL DEFAULT '[]',
  `use_allowed` integer NOT NULL DEFAULT 1 CHECK (`use_allowed` IN (0,1)),
  `purpose_scopes_json` text NOT NULL DEFAULT '[]',
  `export_allowed` integer NOT NULL DEFAULT 1 CHECK (`export_allowed` IN (0,1)),
  `version` integer NOT NULL DEFAULT 1 CHECK (`version` >= 1),
  `created_at` integer NOT NULL,
  `updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `npr_items_owner` ON `npr_items` (`user_id`,`updated_at`);
--> statement-breakpoint
CREATE INDEX `npr_items_projection` ON `npr_items` (`user_id`,`lifecycle_state`,`confirmation_state`,`use_allowed`);
--> statement-breakpoint
CREATE TABLE `npr_proposals` (
  `id` text PRIMARY KEY NOT NULL,
  `user_id` text NOT NULL,
  `candidate_item_id` text NOT NULL,
  `item_type` text NOT NULL CHECK (`item_type` IN ('user_assertion','communication_preference','support_preference','observation','goal','friction','strategy','relationship_reference')),
  `tier` text NOT NULL CHECK (`tier` IN ('stable','semi_stable','dynamic')),
  `payload_json` text NOT NULL DEFAULT '{}',
  `status` text NOT NULL CHECK (`status` IN ('proposed','confirmed','rejected','expired')),
  `sensitivity` text NOT NULL CHECK (`sensitivity` IN ('standard','sensitive','highly_sensitive')),
  `confidence` real NOT NULL CHECK (`confidence` >= 0 AND `confidence` <= 1),
  `purpose_scopes_json` text NOT NULL DEFAULT '[]',
  `source_type` text NOT NULL,
  `source_ref` text NOT NULL DEFAULT '',
  `captured_by` text NOT NULL,
  `evidence_refs_json` text NOT NULL DEFAULT '[]',
  `rationale` text NOT NULL DEFAULT '',
  `version` integer NOT NULL DEFAULT 1 CHECK (`version` >= 1),
  `created_at` integer NOT NULL,
  `updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `npr_proposals_owner` ON `npr_proposals` (`user_id`,`status`,`created_at`);
--> statement-breakpoint
CREATE TABLE `episodes` (
  `id` text PRIMARY KEY NOT NULL,
  `user_id` text NOT NULL,
  `conversation_id` text,
  `thread_id` text,
  `objective` text NOT NULL,
  `intervention_ref` text,
  `status` text NOT NULL CHECK (`status` IN ('open','completed','abandoned')),
  `started_at` integer NOT NULL,
  `ended_at` integer
);
--> statement-breakpoint
CREATE INDEX `episodes_owner` ON `episodes` (`user_id`,`started_at`);
--> statement-breakpoint
CREATE INDEX `episodes_thread` ON `episodes` (`user_id`,`thread_id`,`started_at`);
--> statement-breakpoint
CREATE TABLE `interventions` (
  `id` text PRIMARY KEY NOT NULL,
  `user_id` text NOT NULL,
  `episode_id` text NOT NULL,
  `strategy` text NOT NULL,
  `support_profile_json` text NOT NULL DEFAULT '{}',
  `created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `interventions_episode` ON `interventions` (`user_id`,`episode_id`,`created_at`);
--> statement-breakpoint
CREATE TABLE `npr_evidence` (
  `id` text PRIMARY KEY NOT NULL,
  `user_id` text NOT NULL,
  `episode_id` text,
  `source_type` text NOT NULL,
  `source_ref` text NOT NULL DEFAULT '',
  `summary` text NOT NULL DEFAULT '',
  `payload_json` text NOT NULL DEFAULT '{}',
  `created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `npr_evidence_episode` ON `npr_evidence` (`user_id`,`episode_id`,`created_at`);
--> statement-breakpoint
CREATE TABLE `support_outcomes` (
  `id` text PRIMARY KEY NOT NULL,
  `user_id` text NOT NULL,
  `episode_id` text NOT NULL,
  `intervention_id` text,
  `status` text NOT NULL CHECK (`status` IN ('completed','partial','blocked','abandoned')),
  `feedback` text NOT NULL DEFAULT '',
  `evidence_refs_json` text NOT NULL DEFAULT '[]',
  `recorded_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `support_outcomes_episode` ON `support_outcomes` (`user_id`,`episode_id`,`recorded_at`);
--> statement-breakpoint
CREATE TABLE `policy_events` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  `user_id` text NOT NULL,
  `event_type` text NOT NULL,
  `subject_ref` text NOT NULL DEFAULT '',
  `policy_version` text NOT NULL,
  `payload_json` text NOT NULL DEFAULT '{}',
  `created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `policy_events_owner` ON `policy_events` (`user_id`,`created_at`);
