create table if not exists jobs (
  id uuid primary key default gen_random_uuid(),
  user_id text not null references users(id) on delete cascade,
  agent_id text,
  kind text not null check (kind in ('outreach', 'research', 'proposal', 'follow-up', 'scrape')),
  status text not null default 'queued' check (status in ('queued', 'running', 'done', 'failed')),
  params jsonb not null default '{}'::jsonb,
  result jsonb,
  error text,
  created_at timestamptz not null default now(),
  started_at timestamptz,
  finished_at timestamptz
);

create index if not exists jobs_user_status_idx on jobs (user_id, status);

create table if not exists outreach_drafts (
  id uuid primary key default gen_random_uuid(),
  user_id text not null references users(id) on delete cascade,
  agent_id text,
  lead_id uuid not null references leads(id) on delete cascade,
  subject text,
  body text not null,
  rationale text,
  status text not null default 'draft' check (status in ('draft', 'sent')),
  dismissed boolean not null default false,
  created_at timestamptz not null default now(),
  sent_at timestamptz
);

create index if not exists outreach_drafts_user_idx on outreach_drafts (user_id, created_at desc);
