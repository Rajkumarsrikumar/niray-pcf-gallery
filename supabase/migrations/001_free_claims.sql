-- One free PCF component per email address.
-- A row is created when someone asks for a free component; it is "used" once delivered_at is set.
create table if not exists public.free_claims (
  email            text primary key,          -- normalised mailbox (lower case, no +tag, Gmail dots removed)
  send_to          text not null,             -- address as typed, where the zip is sent
  slug             text not null,             -- component chosen
  token_hash       text unique,               -- sha256 of the emailed verification token (null once used)
  token_expires_at timestamptz,
  requested_at     timestamptz not null default now(),
  verified_at      timestamptz,
  delivered_at     timestamptz                -- set when the zip email was accepted; blocks further free claims
);

-- Only the server (service-role key) touches this table. RLS on with no policies blocks the anon key.
alter table public.free_claims enable row level security;
