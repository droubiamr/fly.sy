-- fly.sy on Cloudflare D1 (SQLite). Apply with:
--   npx wrangler d1 migrations apply fly-sy --local    (next dev / wrangler dev)
--   npx wrangler d1 migrations apply fly-sy --remote   (production)
-- Only the Worker can reach D1, through its binding, so there are no roles or row-level policies: what the
-- public can see is decided by the queries in src/lib. Times are Unix milliseconds.

-- Community reports. Anyone can submit (lands as 'pending'); the public feed reads only 'published' rows and
-- never the contact column, which exists for the moderator alone.
create table reports (
  id            text primary key,                 -- random UUID
  created_at    integer not null,
  entry         text not null,                    -- entry id from data/entries.json (JDE, DAM, ...)
  travelled_on  text not null check (travelled_on glob '[0-9][0-9][0-9][0-9]-[0-9][0-9]-[0-9][0-9]'),
  wait_minutes  integer check (wait_minutes is null or wait_minutes between 0 and 4320),
  passport      text not null check (passport in ('sy', 'voa', 'res')),
  note          text not null check (length(note) between 10 and 1000),
  contact       text check (contact is null or length(contact) <= 200),
  status        text not null default 'pending' check (status in ('pending', 'published', 'rejected')),
  reviewed_by   text,
  published_at  integer
);
create index reports_status_travelled on reports (status, travelled_on desc);
create index reports_status_created on reports (status, created_at desc);

-- One row per page view, written by /api/track.
create table page_views (
  id           integer primary key,
  ts           integer not null,
  path         text not null,
  locale       text not null check (locale in ('ar', 'en')),
  source       text,                              -- utm_source, else the referring host
  ip           text,                              -- CF-Connecting-IP
  country      text,                              -- two-letter, from Cloudflare
  region       text,
  city         text,
  asn          integer,                           -- the visitor's network
  as_org       text,                              -- and its name (ISP, mobile carrier, host)
  user_agent   text,
  device       text not null check (device in ('mobile', 'tablet', 'desktop', 'other')),
  browser      text,
  os           text,
  visitor_id   text,                              -- the fsy_vid cookie
  new_visitor  integer not null default 0         -- 1 on the view that set the cookie
);
create index page_views_ts on page_views (ts);
create index page_views_visitor on page_views (visitor_id, ts);
create index page_views_ip on page_views (ip, ts);
