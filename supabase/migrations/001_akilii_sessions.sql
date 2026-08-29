create table if not exists public.sessions (
  id uuid primary key default gen_random_uuid(),
  title text not null default 'New conversation',
  theme text not null default 'forest-cream',
  messages jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.sessions enable row level security;
