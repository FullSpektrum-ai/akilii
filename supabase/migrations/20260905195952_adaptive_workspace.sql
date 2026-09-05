create table akilii.workspace_settings (
 user_id text primary key, role text not null default '', objective text not null default '',
 presentation text not null default 'balanced' check(presentation in ('balanced','one-step','overview')),
 needs text not null default '', updated_at bigint not null
);
create table akilii.projects (
 id text primary key, user_id text not null, title text not null, objective text not null default '',
 tasks jsonb not null default '[]'::jsonb check(jsonb_typeof(tasks)='array'),
 status text not null default 'active' check(status in ('active','paused','complete')),
 version bigint not null default 1, created_at bigint not null, updated_at bigint not null
);
create index projects_owner_updated on akilii.projects(user_id,updated_at desc);
alter table akilii.workspace_settings enable row level security;
alter table akilii.projects enable row level security;
create policy owner_settings on akilii.workspace_settings for all to authenticated using(user_id=(select auth.uid())::text) with check(user_id=(select auth.uid())::text);
create policy owner_projects on akilii.projects for all to authenticated using(user_id=(select auth.uid())::text) with check(user_id=(select auth.uid())::text);
grant select,insert,update,delete on akilii.workspace_settings,akilii.projects to authenticated;
-- Provider access tokens are encrypted by the Edge service and inaccessible to client roles.
create table akilii.email_tokens(user_id text primary key,ciphertext text not null,expires_at bigint not null);
alter table akilii.email_tokens enable row level security;
revoke all on akilii.email_tokens from public,anon,authenticated;
create table akilii.email_receipts(id text primary key,user_id text not null,request_key text not null,status text not null check(status in ('pending','created','uncertain','failed')),provider_draft_id text,created_at bigint not null,unique(user_id,request_key));
alter table akilii.email_receipts enable row level security;
create policy owner_email_receipts on akilii.email_receipts for select to authenticated using(user_id=(select auth.uid())::text);
grant select,delete on akilii.email_receipts to authenticated;
create policy owner_delete_email_receipts on akilii.email_receipts for delete to authenticated using(user_id=(select auth.uid())::text);
