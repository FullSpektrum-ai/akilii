-- Snapshot of the already-applied legacy migration; do not reapply manually.
create table if not exists public.app_sessions (
 id uuid primary key default gen_random_uuid(),
 title text not null default 'New conversation',
 theme text not null default 'forest-cream',
 messages jsonb not null default '[]'::jsonb,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);
alter table public.app_sessions enable row level security;
create policy "public demo sessions" on public.app_sessions for all to anon, authenticated using (true) with check (true);
