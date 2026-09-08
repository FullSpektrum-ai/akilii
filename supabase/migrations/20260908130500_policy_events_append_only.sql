-- Policy/AIMS audit events are append-only even for privileged application roles.

create or replace function akilii.prevent_policy_event_mutation()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  raise exception 'akilii.policy_events is append-only';
end;
$$;

create trigger policy_events_no_update
before update on akilii.policy_events
for each row execute function akilii.prevent_policy_event_mutation();

create trigger policy_events_no_delete
before delete on akilii.policy_events
for each row execute function akilii.prevent_policy_event_mutation();
