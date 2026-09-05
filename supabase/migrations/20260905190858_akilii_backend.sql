-- New backend; does not modify legacy public.app_sessions or Sites D1.
create schema akilii;
revoke all on schema akilii from public, anon;
grant usage on schema akilii to authenticated;
CREATE TABLE akilii."conversations" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"title" text NOT NULL,
	"created_at" bigint NOT NULL,
	"updated_at" bigint NOT NULL
);

CREATE INDEX "conversations_user" ON akilii."conversations" ("user_id");
CREATE TABLE akilii."feedback" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"message_id" text NOT NULL,
	"rating" text NOT NULL,
	"created_at" bigint NOT NULL
);

CREATE INDEX "feedback_user" ON akilii."feedback" ("user_id");
CREATE TABLE akilii."locks" (
	"user_id" text PRIMARY KEY NOT NULL,
	"until" bigint NOT NULL,
	"request_id" text NOT NULL
);

CREATE TABLE akilii."memories" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"content" text NOT NULL,
	"source" text NOT NULL,
	"created_at" bigint NOT NULL
);

CREATE INDEX "memories_user" ON akilii."memories" ("user_id");
CREATE TABLE akilii."messages" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"conversation_id" text NOT NULL,
	"role" text NOT NULL,
	"content" text NOT NULL,
	"created_at" bigint NOT NULL
);

CREATE INDEX "messages_user_conversation" ON akilii."messages" ("user_id","conversation_id");
CREATE TABLE akilii."profiles" (
	"user_id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"focus" text NOT NULL,
	"style" text NOT NULL,
	"consent_at" bigint NOT NULL,
	"created_at" bigint NOT NULL
);

CREATE TABLE akilii."requests" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"conversation_id" text NOT NULL,
	"status" text NOT NULL,
	"created_at" bigint NOT NULL
);

CREATE TABLE akilii."usage" (
	"key" text PRIMARY KEY NOT NULL,
	"count" bigint NOT NULL
);

CREATE TABLE akilii."work_items" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"title" text NOT NULL,
	"body" text NOT NULL,
	"version" bigint NOT NULL,
	"created_at" bigint NOT NULL,
	"updated_at" bigint NOT NULL
);

CREATE INDEX "work_user" ON akilii."work_items" ("user_id");
CREATE TABLE akilii."work_versions" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"work_id" text NOT NULL,
	"body" text NOT NULL,
	"version" bigint NOT NULL,
	"created_at" bigint NOT NULL
);

CREATE INDEX "versions_user_work" ON akilii."work_versions" ("user_id","work_id");

create table akilii.beta_access(email text primary key, user_id uuid unique references auth.users(id), enabled boolean not null default true, created_at timestamptz not null default now());
create table akilii.runs(id text primary key,user_id text not null,work_id text not null,runtime text not null check(runtime in ('direct','flowstate')),status text not null check(status in ('queued','running','awaiting_approval','succeeded','failed','cancelled','reconciliation_required')),request_key text not null,context_version int not null default 1,created_at bigint not null,updated_at bigint not null,unique(user_id,request_key),unique(id,user_id));
create table akilii.run_events(id bigint generated always as identity primary key,user_id text not null,run_id text not null,event_type text not null,payload jsonb not null default '{}',created_at bigint not null,foreign key(run_id,user_id) references akilii.runs(id,user_id) on delete cascade);
create table akilii.actions(id text primary key,user_id text not null,run_id text not null,tool text not null,arguments jsonb not null,status text not null check(status in ('proposed','approved','executed','rejected','expired')),work_version bigint not null,expires_at bigint not null,receipt jsonb,foreign key(run_id,user_id) references akilii.runs(id,user_id) on delete cascade);
create table akilii.connections(id text primary key,user_id text not null,server_key text not null,scopes jsonb not null default '[]',status text not null check(status in ('pending','connected','revoked')),created_at bigint not null,unique(user_id,server_key));
alter table akilii.profiles enable row level security;
grant select,insert,update,delete on akilii.profiles to authenticated;
create policy owner_access on akilii.profiles for all to authenticated using (user_id = (select auth.uid())::text) with check (user_id = (select auth.uid())::text);
alter table akilii.conversations enable row level security;
grant select,insert,update,delete on akilii.conversations to authenticated;
create policy owner_access on akilii.conversations for all to authenticated using (user_id = (select auth.uid())::text) with check (user_id = (select auth.uid())::text);
alter table akilii.messages enable row level security;
grant select,insert,update,delete on akilii.messages to authenticated;
create policy owner_access on akilii.messages for all to authenticated using (user_id = (select auth.uid())::text) with check (user_id = (select auth.uid())::text);
alter table akilii.memories enable row level security;
grant select,insert,update,delete on akilii.memories to authenticated;
create policy owner_access on akilii.memories for all to authenticated using (user_id = (select auth.uid())::text) with check (user_id = (select auth.uid())::text);
alter table akilii.work_items enable row level security;
grant select,insert,update,delete on akilii.work_items to authenticated;
create policy owner_access on akilii.work_items for all to authenticated using (user_id = (select auth.uid())::text) with check (user_id = (select auth.uid())::text);
alter table akilii.work_versions enable row level security;
grant select,insert,update,delete on akilii.work_versions to authenticated;
create policy owner_access on akilii.work_versions for all to authenticated using (user_id = (select auth.uid())::text) with check (user_id = (select auth.uid())::text);
alter table akilii.feedback enable row level security;
grant select,insert,update,delete on akilii.feedback to authenticated;
create policy owner_access on akilii.feedback for all to authenticated using (user_id = (select auth.uid())::text) with check (user_id = (select auth.uid())::text);
alter table akilii.locks enable row level security;
grant select,insert,update,delete on akilii.locks to authenticated;
create policy owner_access on akilii.locks for all to authenticated using (user_id = (select auth.uid())::text) with check (user_id = (select auth.uid())::text);
alter table akilii.requests enable row level security;
grant select,insert,update,delete on akilii.requests to authenticated;
create policy owner_access on akilii.requests for all to authenticated using (user_id = (select auth.uid())::text) with check (user_id = (select auth.uid())::text);
alter table akilii.runs enable row level security;
grant select,insert,update,delete on akilii.runs to authenticated;
create policy owner_access on akilii.runs for all to authenticated using (user_id = (select auth.uid())::text) with check (user_id = (select auth.uid())::text);
alter table akilii.run_events enable row level security;
grant select,insert,update,delete on akilii.run_events to authenticated;
create policy owner_access on akilii.run_events for all to authenticated using (user_id = (select auth.uid())::text) with check (user_id = (select auth.uid())::text);
alter table akilii.actions enable row level security;
grant select,insert,update,delete on akilii.actions to authenticated;
create policy owner_access on akilii.actions for all to authenticated using (user_id = (select auth.uid())::text) with check (user_id = (select auth.uid())::text);
alter table akilii.connections enable row level security;
grant select,insert,update,delete on akilii.connections to authenticated;
create policy owner_access on akilii.connections for all to authenticated using (user_id = (select auth.uid())::text) with check (user_id = (select auth.uid())::text);
alter table akilii.beta_access enable row level security;
alter table akilii.usage enable row level security;
-- Quotas are only reachable through the authenticated backend's bounded reserve function.
create function akilii.reserve_usage(k text, maximum bigint) returns bigint language plpgsql security definer set search_path='' as $$
declare changed bigint;
begin
 if auth.uid() is null or maximum not between 1 and 60 or (k not like 'global:%' and k not like auth.uid()::text||':%') then raise exception 'unauthorised quota'; end if;
 insert into akilii.usage(key,count) values(k,1) on conflict(key) do update set count=akilii.usage.count+1 where akilii.usage.count<maximum;
 get diagnostics changed=row_count;return changed;
end;$$;
revoke all on function akilii.reserve_usage(text,bigint) from public,anon;
grant execute on function akilii.reserve_usage(text,bigint) to authenticated;
grant usage,select on all sequences in schema akilii to authenticated;
create index runs_owner on akilii.runs(user_id,created_at);
create index events_run on akilii.run_events(user_id,run_id,id);
create index actions_owner on akilii.actions(user_id,run_id);
create index connections_owner on akilii.connections(user_id);
