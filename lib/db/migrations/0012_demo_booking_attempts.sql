create table if not exists demo_booking_attempts (
  id serial primary key,
  ip text not null,
  created_at timestamptz not null default now()
);
create index if not exists demo_booking_attempts_ip_created_idx on demo_booking_attempts (ip, created_at);
