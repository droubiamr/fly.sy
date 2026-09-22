-- fly.sy community reports
-- Anyone can submit (lands as 'pending'); only 'published' rows are readable, and only through
-- the public view, which never exposes the contact field. Moderation = flipping status in the
-- Supabase dashboard (or a later admin UI) with the service role.

create type report_status as enum ('pending', 'published', 'rejected');
create type passport_kind as enum ('sy', 'voa', 'res');

create table public.reports (
  id            uuid primary key default gen_random_uuid(),
  created_at    timestamptz not null default now(),
  entry         text not null,                 -- entry id from data/entries.json (JDE, DAM, ...)
  travelled_on  date not null,
  wait_minutes  integer check (wait_minutes is null or (wait_minutes >= 0 and wait_minutes <= 4320)),
  passport      passport_kind not null,
  note          text not null check (char_length(note) between 10 and 1000),
  contact       text check (contact is null or char_length(contact) <= 200),  -- private, never published
  status        report_status not null default 'pending',
  reviewed_by   text,
  published_at  timestamptz
);

create index reports_status_idx on public.reports (status, travelled_on desc);

alter table public.reports enable row level security;

-- Public may insert, but only as pending and never setting review fields.
create policy "anyone can submit a pending report"
  on public.reports for insert
  to anon, authenticated
  with check (status = 'pending' and reviewed_by is null and published_at is null);

-- No direct select for the public: reads go through the view below.

create view public.published_reports with (security_invoker = false) as
  select id, entry, travelled_on, wait_minutes, passport, note, published_at
  from public.reports
  where status = 'published';

grant select on public.published_reports to anon, authenticated;
grant insert on public.reports to anon, authenticated;
