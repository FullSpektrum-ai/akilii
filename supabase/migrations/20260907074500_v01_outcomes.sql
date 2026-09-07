create table akilii.outcomes (
 id text primary key,
 user_id text not null,
 thread_id text not null,
 work_id text,
 project_id text,
 rating text not null check(rating in ('helpful','partial','unhelpful')),
 note text not null default '',
 request_key text not null,
 created_at bigint not null,
 unique(user_id,request_key)
);
create index outcomes_owner_thread on akilii.outcomes(user_id,thread_id,created_at desc);
alter table akilii.outcomes enable row level security;
grant select,insert,delete on akilii.outcomes to authenticated;
create policy owner_outcomes on akilii.outcomes for all to authenticated using(user_id=(select auth.uid())::text) with check(user_id=(select auth.uid())::text);
