create table akilii.npr_items (
 id text primary key,
 user_id text not null,
 item_type text not null check(item_type in ('user_assertion','communication_preference','support_preference','goal','friction','strategy','observation')),
 tier text not null check(tier in ('stable','semi_stable','dynamic')),
 content text not null,
 lifecycle_state text not null check(lifecycle_state in ('proposed','active','contradicted','superseded','deprecated','expired','deleted')),
 confirmation_state text not null check(confirmation_state in ('user_asserted','proposed','confirmed','rejected','not_required')),
 confidence integer not null check(confidence between 0 and 1000),
 sensitivity text not null check(sensitivity in ('standard','sensitive','highly_sensitive')),
 source_type text not null check(source_type in ('user_statement','user_edit','outcome','system_observation','import')),
 source_ref text,
 captured_at bigint not null,
 valid_from bigint,
 review_after bigint,
 expires_at bigint,
 supersedes_id text,
 use_allowed integer not null default 1 check(use_allowed in (0,1)),
 purpose_scopes text not null,
 version bigint not null default 1,
 schema_version text not null default '1.0',
 created_at bigint not null,
 updated_at bigint not null
);
create index npr_owner_state on akilii.npr_items(user_id,lifecycle_state,updated_at desc);

create table akilii.npr_events (
 id text primary key,
 user_id text not null,
 item_id text not null,
 event_type text not null check(event_type in ('created','corrected','restricted','deleted','expired')),
 item_version bigint not null,
 created_at bigint not null,
 foreign key(item_id) references akilii.npr_items(id) on delete cascade
);
create index npr_events_owner_item on akilii.npr_events(user_id,item_id,created_at desc);

alter table akilii.npr_items enable row level security;
alter table akilii.npr_events enable row level security;
grant select,insert,update,delete on akilii.npr_items to authenticated;
grant select,insert,delete on akilii.npr_events to authenticated;
create policy owner_npr_items on akilii.npr_items for all to authenticated
 using(user_id=(select auth.uid())::text)
 with check(user_id=(select auth.uid())::text);
create policy owner_npr_events on akilii.npr_events for all to authenticated
 using(user_id=(select auth.uid())::text)
 with check(user_id=(select auth.uid())::text);
