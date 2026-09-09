CREATE TABLE `npr_events` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`item_id` text NOT NULL,
	`event_type` text NOT NULL,
	`item_version` integer NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `npr_events_owner_item` ON `npr_events` (`user_id`,`item_id`,`created_at`);--> statement-breakpoint
CREATE TABLE `npr_items` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`item_type` text NOT NULL,
	`tier` text NOT NULL,
	`content` text NOT NULL,
	`lifecycle_state` text NOT NULL,
	`confirmation_state` text NOT NULL,
	`confidence` integer NOT NULL,
	`sensitivity` text NOT NULL,
	`source_type` text NOT NULL,
	`source_ref` text,
	`captured_at` integer NOT NULL,
	`valid_from` integer,
	`review_after` integer,
	`expires_at` integer,
	`supersedes_id` text,
	`use_allowed` integer NOT NULL,
	`purpose_scopes` text NOT NULL,
	`version` integer NOT NULL,
	`schema_version` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `npr_owner_state` ON `npr_items` (`user_id`,`lifecycle_state`,`updated_at`);