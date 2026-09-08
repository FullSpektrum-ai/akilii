-- Additive re-baseline schema. Legacy memories/outcomes remain intact until migration parity is proven.

alter table akilii.work_items add column if not exists thread_id text;
alter table akilii.work_items add column if not exists status text not null default 'active';
alter table akilii.work_items add constraint work_items_rebaseline_status_check
  check (status in ('proposed','active','completed','archived'));
create index if not exists work_items_thread on akilii.work_items(user_id,thread_id);

create table akilii.npr_items(
  id text primary key,
  user_id text not null,
  item_type text not null check(item_type in ('user_assertion','communication_preference','support_preference','observation','goal','friction','strategy','relationship_reference')),
  tier text not null check(tier in ('stable','semi_stable','dynamic')),
  payload_json text not null default '{}',
  lifecycle_state text not null check(lifecycle_state in ('captured','classified','proposed','active','contradicted','superseded','deprecated','expired','deleted')),
  confirmation_state text not null check(confirmation_state in ('user_asserted','proposed','confirmed','rejected','not_required')),
  confidence double precision not null check(confidence between 0 and 1),
  sensitivity text not null check(sensitivity in ('standard','sensitive','highly_sensitive')),
  source_type text not null,
  source_ref text not null default '',
  captured_at bigint not null,
  captured_by text not null,
  valid_from bigint,
  review_after bigint,
  expires_at bigint,
  evidence_refs_json text not null default '[]',
  use_allowed smallint not null default 1 check(use_allowed in (0,1)),
  purpose_scopes_json text not null default '[]',
  export_allowed smallint not null default 1 check(export_allowed in (0,1)),
  version bigint not null default 1 check(version >= 1),
  created_at bigint not null,
  updated_at bigint not null,
  unique(id,user_id)
);

create table akilii.npr_proposals(
  id text primary key,
  user_id text not null,
  candidate_item_id text not null,
  item_type text not null check(item_type in ('user_assertion','communication_preference','support_preference','observation','goal','friction','strategy','relationship_reference')),
  tier text not null check(tier in ('stable','semi_stable','dynamic')),
  payload_json text not null default '{}',
  status text not null check(status in ('proposed','confirmed','rejected','expired')),
  sensitivity text not null check(sensitivity in ('standard','sensitive','highly_sensitive')),
  confidence double precision not null check(confidence between 0 and 1),
  purpose_scopes_json text not null default '[]',
  source_type text not null,
  source_ref text not null default '',
  captured_by text not null,
  evidence_refs_json text not null default '[]',
  rationale text not null default '',
  version bigint not null default 1 check(version >= 1),
  created_at bigint not null,
  updated_at bigint not null,
  unique(id,user_id)
);

create table akilii.episodes(
  id text primary key,
  user_id text not null,
  conversation_id text,
  thread_id text,
  objective text not null,
  intervention_ref text,
  status text not null check(status in ('open','completed','abandoned')),
  started_at bigint not null,
  ended_at bigint,
  unique(id,user_id)
);

create table akilii.interventions(
  id text primary key,
  user_id text not null,
  episode_id text not null,
  strategy text not null,
  support_profile_json text not null default '{}',
  created_at bigint not null,
  unique(id,user_id)
);

create table akilii.npr_evidence(
  id text primary key,
  user_id text not null,
  episode_id text,
  source_type text not null,
  source_ref text not null default '',
  summary text not null default '',
  payload_json text not null default '{}',
  created_at bigint not null,
  unique(id,user_id)
);

create table akilii.support_outcomes(
  id text primary key,
  user_id text not null,
  episode_id text not null,
  intervention_id text,
  status text not null check(status in ('completed','partial','blocked','abandoned')),
  feedback text not null default '',
  evidence_refs_json text not null default '[]',
  recorded_at bigint not null,
  unique(id,user_id)
);

create table akilii.policy_events(
  id bigint generated always as identity primary key,
  user_id text not null,
  event_type text not null,
  subject_ref text not null default '',
  policy_version text not null,
  payload_json text not null default '{}',
  created_at bigint not null
);

create index npr_items_owner on akilii.npr_items(user_id,updated_at desc);
create index npr_items_projection on akilii.npr_items(user_id,lifecycle_state,confirmation_state,use_allowed);
create index npr_proposals_owner on akilii.npr_proposals(user_id,status,created_at desc);
create index episodes_owner on akilii.episodes(user_id,started_at desc);
create index episodes_thread on akilii.episodes(user_id,thread_id,started_at desc);
create index interventions_episode on akilii.interventions(user_id,episode_id,created_at);
create index npr_evidence_episode on akilii.npr_evidence(user_id,episode_id,created_at);
create index support_outcomes_episode on akilii.support_outcomes(user_id,episode_id,recorded_at desc);
create index policy_events_owner on akilii.policy_events(user_id,created_at desc);

alter table akilii.npr_items enable row level security;
alter table akilii.npr_proposals enable row level security;
alter table akilii.episodes enable row level security;
alter table akilii.interventions enable row level security;
alter table akilii.npr_evidence enable row level security;
alter table akilii.support_outcomes enable row level security;
alter table akilii.policy_events enable row level security;

grant select,insert,update,delete on akilii.npr_items to authenticated;
grant select,insert,update,delete on akilii.npr_proposals to authenticated;
grant select,insert,update,delete on akilii.episodes to authenticated;
grant select,insert,update,delete on akilii.interventions to authenticated;
grant select,insert,update,delete on akilii.npr_evidence to authenticated;
grant select,insert,update,delete on akilii.support_outcomes to authenticated;
grant select,insert,update,delete on akilii.policy_events to authenticated;

grant usage,select on all sequences in schema akilii to authenticated;

create policy owner_access on akilii.npr_items for all to authenticated
  using (user_id = (select auth.uid())::text)
  with check (user_id = (select auth.uid())::text);
create policy owner_access on akilii.npr_proposals for all to authenticated
  using (user_id = (select auth.uid())::text)
  with check (user_id = (select auth.uid())::text);
create policy owner_access on akilii.episodes for all to authenticated
  using (user_id = (select auth.uid())::text)
  with check (user_id = (select auth.uid())::text);
create policy owner_access on akilii.interventions for all to authenticated
  using (user_id = (select auth.uid())::text)
  with check (user_id = (select auth.uid())::text);
create policy owner_access on akilii.npr_evidence for all to authenticated
  using (user_id = (select auth.uid())::text)
  with check (user_id = (select auth.uid())::text);
create policy owner_access on akilii.support_outcomes for all to authenticated
  using (user_id = (select auth.uid())::text)
  with check (user_id = (select auth.uid())::text);
create policy owner_access on akilii.policy_events for all to authenticated
  using (user_id = (select auth.uid())::text)
  with check (user_id = (select auth.uid())::text);
