-- Private, server-only admission and aggregate traction reporting.
create table akilii.access_control(id boolean primary key default true check(id), capacity integer not null default 30 check(capacity=30));
insert into akilii.access_control default values;
create table akilii.access_requests(user_id uuid primary key references auth.users(id) on delete cascade,email text not null unique,status text not null check(status in ('admitted','waiting','withdrawn')),requested_at timestamptz not null default now(),admitted_at timestamptz,notice_version text not null);
create table akilii.access_admins(user_id uuid primary key references auth.users(id) on delete cascade);
-- Existing explicitly invited reviewers administer this initial single-owner preview.
insert into akilii.access_admins select user_id from akilii.beta_access where enabled and user_id is not null;
create table akilii.traction_events(user_id uuid not null references auth.users(id) on delete cascade,event text not null check(event in ('active_day','download_mac_intel','download_mac_arm','download_windows')),day date not null default current_date,primary key(user_id,event,day));
alter table akilii.access_control enable row level security;
alter table akilii.access_requests enable row level security;
alter table akilii.access_admins enable row level security;
alter table akilii.traction_events enable row level security;
revoke all on akilii.access_control,akilii.access_requests,akilii.access_admins,akilii.traction_events from public,anon,authenticated;
create function akilii.enforce_beta_capacity() returns trigger language plpgsql set search_path='' as $$
begin
 perform 1 from akilii.access_control where id for update;
 if new.enabled and (select count(*) from akilii.beta_access where enabled and email<>new.email)>=30 then raise exception 'Early access capacity reached' using errcode='23514'; end if;
 return new;
end $$;
create trigger beta_capacity before insert or update of enabled on akilii.beta_access for each row execute function akilii.enforce_beta_capacity();
revoke all on function akilii.enforce_beta_capacity() from public,anon,authenticated;
create function akilii.request_early_access(p_user uuid,p_email text) returns text language plpgsql set search_path='' as $$
declare current_grant akilii.beta_access; prior text;
begin
 perform 1 from akilii.access_control where id for update;
 select * into current_grant from akilii.beta_access where email=lower(p_email);
 if found then
  if not current_grant.enabled or (current_grant.user_id is not null and current_grant.user_id<>p_user) then return 'blocked'; end if;
  update akilii.beta_access set user_id=p_user where email=lower(p_email);
  return 'admitted';
 end if;
 select status into prior from akilii.access_requests where user_id=p_user;
 if prior='waiting' then return 'waiting'; end if;
 if (select count(*) from akilii.beta_access where enabled)<30 and not exists(select 1 from akilii.access_requests where status='waiting') then
  insert into akilii.beta_access(email,user_id) values(lower(p_email),p_user);
  insert into akilii.access_requests(user_id,email,status,admitted_at,notice_version) values(p_user,lower(p_email),'admitted',now(),'early-access-2026-09') on conflict(user_id) do update set status='admitted',admitted_at=now();
  return 'admitted';
 end if;
 insert into akilii.access_requests(user_id,email,status,notice_version) values(p_user,lower(p_email),'waiting','early-access-2026-09') on conflict(user_id) do update set status='waiting',requested_at=now();
 return 'waiting';
end $$;
revoke all on function akilii.request_early_access(uuid,text) from public,anon,authenticated;
