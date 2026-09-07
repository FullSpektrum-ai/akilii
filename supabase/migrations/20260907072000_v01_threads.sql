create table akilii.threads (
 id text primary key,
 user_id text not null,
 title text not null,
 objective text not null default '',
 status text not null default 'active' check(status in ('active','held','ready','closed')),
 conversation_id text,
 project_id text,
 work_id text,
 last_confirmed text not null default '',
 last_decision text not null default '',
 next_move text not null default '',
 open_questions jsonb not null default '[]'::jsonb check(jsonb_typeof(open_questions)='array'),
 request_key text not null,
 version bigint not null default 1,
 created_at bigint not null,
 updated_at bigint not null,
 closed_at bigint,
 unique(user_id,request_key)
);
create index threads_owner_state_updated on akilii.threads(user_id,status,updated_at desc);
alter table akilii.threads enable row level security;
grant select,insert,update,delete on akilii.threads to authenticated;
create policy owner_threads on akilii.threads for all to authenticated using(user_id=(select auth.uid())::text) with check(user_id=(select auth.uid())::text);
