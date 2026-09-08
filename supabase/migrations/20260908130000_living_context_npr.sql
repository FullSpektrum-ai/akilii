-- Living Context / NPR augmentation. Keeps canonical person context separate from chat, Thread and runtime memory.
create table if not exists akilii.npr_items(
  id text primary key,
  user_id text not null,
  item_type text not null check(item_type in ('user_assertion','communication_preference','support_preference','observation','goal','friction','strategy','relationship_reference')),
  tier text not null check(tier in ('stable','semi_stable','dynamic')),
  payload jsonb not null default '{}',
  lifecycle_state text not null check(lifecycle_state in ('captured','classified','proposed','active','contradicted','superseded','deprecated','expired','deleted')),
  confirmation_state text not null check(confirmation_state in ('user_asserted','proposed','confirmed','rejected','not_required')),
  confidence double precision not null check(confidence between 0 and 1),
  sensitivity text not null check(sensitivity in ('standard','sensitive','highly_sensitive')),
  source_type text not null,
  source_ref text,
  captured_at bigint not null,
  captured_by text not null,
  valid_from bigint,
  review_after bigint,
  expires_at bigint,
  supersedes_id text,
  contradiction_refs jsonb not null default '[]',
  evidence_refs jsonb not null default '[]',
  use_allowed boolean not null default true,
  purpose_scopes jsonb not null default '[]',
  export_allowed boolean not null default true,
  restriction_reason text,
  version bigint not null default 1,
  created_at bigint not null,
  updated_at bigint not null,
  unique(id,user_id)
);

create table if not exists akilii.npr_proposals(
  id text primary key,
  user_id text not null,
  operation text not null check(operation in ('create','update','reinforce','contradict','deprecate')),
  target_item_id text,
  proposed_item jsonb not null,
  plain_language_reason text not null,
  evidence_refs jsonb not null default '[]',
  confirmation_required boolean not null default true,
  status text not null check(status in ('pending','confirmed','rejected','expired','cancelled')),
  source_ref text,
  version bigint not null default 1,
  created_at bigint not null,
  resolved_at bigint,
  unique(id,user_id)
);

create table if not exists akilii.npr_controls(
  user_id text primary key,
  default_use_context boolean not null default true,
  sensitive_context_allowed boolean not null default false,
  proactive_discovery boolean not null default true,
  updated_at bigint not null
);

create index if not exists npr_items_owner_active on akilii.npr_items(user_id,lifecycle_state,use_allowed,updated_at desc);
create index if not exists npr_items_owner_type on akilii.npr_items(user_id,item_type,tier);
create index if not exists npr_proposals_owner_pending on akilii.npr_proposals(user_id,status,created_at desc);

alter table akilii.npr_items enable row level security;
alter table akilii.npr_proposals enable row level security;
alter table akilii.npr_controls enable row level security;

grant select,insert,update,delete on akilii.npr_items to authenticated;
grant select,insert,update,delete on akilii.npr_proposals to authenticated;
grant select,insert,update,delete on akilii.npr_controls to authenticated;

create policy owner_access on akilii.npr_items for all to authenticated using (user_id=(select auth.uid())::text) with check (user_id=(select auth.uid())::text);
create policy owner_access on akilii.npr_proposals for all to authenticated using (user_id=(select auth.uid())::text) with check (user_id=(select auth.uid())::text);
create policy owner_access on akilii.npr_controls for all to authenticated using (user_id=(select auth.uid())::text) with check (user_id=(select auth.uid())::text);

comment on table akilii.npr_items is 'Canonical user-governed Personal Support Intelligence context. Not conversation history or runtime memory.';
comment on table akilii.npr_proposals is 'Evidence-backed candidate context changes requiring governed resolution.';
comment on table akilii.npr_controls is 'User controls over context projection and progressive discovery.';
