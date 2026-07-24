create table if not exists proposals (
  id uuid primary key default gen_random_uuid(),
  user_id text not null references users(id) on delete cascade,
  agent_id text,
  lead_id uuid not null references leads(id) on delete cascade,
  title text not null,
  body text not null,
  products jsonb not null default '[]'::jsonb,
  status text not null default 'draft' check (status in ('draft', 'sent')),
  created_at timestamptz not null default now(),
  sent_at timestamptz
);

create index if not exists proposals_user_idx on proposals (user_id, created_at desc);

-- Follow-up nudges reuse outreach_drafts (same shape: subject/body/rationale, opened the same way);
-- "kind" distinguishes a first pitch from a later follow-up in the same inbox.
alter table outreach_drafts add column if not exists kind text not null default 'outreach';
