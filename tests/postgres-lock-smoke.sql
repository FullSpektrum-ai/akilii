-- Run against the linked Postgres database. All synthetic changes are rolled back.
begin;
insert into akilii.locks(user_id,until,request_id)
values('11111111-1111-4111-8111-111111111111',100,'lock-smoke')
on conflict(user_id) do update set until=excluded.until,request_id=excluded.request_id where locks.until<50;
insert into akilii.locks(user_id,until,request_id)
values('11111111-1111-4111-8111-111111111111',200,'lock-smoke-second')
on conflict(user_id) do update set until=excluded.until,request_id=excluded.request_id where locks.until<50;
do $$ begin
if (select until from akilii.locks where user_id='11111111-1111-4111-8111-111111111111')<>100 then raise exception 'active lock overwritten'; end if;
end $$;
rollback;
