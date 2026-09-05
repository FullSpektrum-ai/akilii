-- Retire the superseded public demo access without deleting any stored data.
drop policy if exists "public demo sessions" on public.app_sessions;
revoke all on public.app_sessions from anon, authenticated;
