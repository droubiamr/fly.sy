-- fly.sy visitor analytics
-- One row per page view, written by /api/track with the service role. No IP address and no raw user agent
-- are stored: only the path, where the visit came from, the country Cloudflare resolved, coarse device and
-- browser names, and the first-party visitor id cookie (null when the browser sent Global Privacy Control).
-- The public can neither read nor write this table; the admin dashboard reads it with the service role.

create table public.page_views (
  id           bigint generated always as identity primary key,
  created_at   timestamptz not null default now(),
  path         text not null check (char_length(path) between 1 and 300),
  locale       text not null check (locale in ('ar', 'en')),
  source       text check (source is null or char_length(source) <= 200),   -- referring host or utm_source
  country      text check (country is null or country ~ '^[A-Z]{2}$'),
  device       text not null check (device in ('mobile', 'tablet', 'desktop', 'other')),
  browser      text check (browser is null or char_length(browser) <= 40),
  os           text check (os is null or char_length(os) <= 40),
  visitor_id   uuid,
  new_visitor  boolean not null default false                              -- true on the view that set the cookie
);

create index page_views_created_idx on public.page_views (created_at desc);
create index page_views_visitor_idx on public.page_views (visitor_id, created_at desc) where visitor_id is not null;

alter table public.page_views enable row level security;
-- No policies: anon and authenticated get nothing. The service role bypasses RLS.
revoke all on public.page_views from anon, authenticated;

-- Everything the dashboard shows for one period, in one round trip.
-- bucket is 'hour' or 'day'; buckets are UTC.
create or replace function public.analytics_summary(since timestamptz, until timestamptz, bucket text default 'day')
returns jsonb
language sql
stable
set search_path = public
as $$
  with v as (
    select * from public.page_views where created_at >= since and created_at < until
  )
  select jsonb_build_object(
    'views',        (select count(*) from v),
    'visitors',     (select count(distinct visitor_id) from v),
    'new_visitors', (select count(distinct visitor_id) from v where new_visitor),
    'no_cookie',    (select count(*) from v where visitor_id is null),
    'series', coalesce((
      select jsonb_agg(jsonb_build_object('t', t, 'views', n, 'visitors', u) order by t)
      from (
        select date_trunc(case when bucket = 'hour' then 'hour' else 'day' end, created_at, 'UTC') as t,
               count(*) as n, count(distinct visitor_id) as u
        from v group by 1
      ) s
    ), '[]'::jsonb),
    'pages', coalesce((
      select jsonb_agg(jsonb_build_object('key', k, 'views', n, 'visitors', u) order by n desc, k)
      from (select path as k, count(*) as n, count(distinct visitor_id) as u from v group by 1 order by 2 desc, 1 limit 25) s
    ), '[]'::jsonb),
    'sources', coalesce((
      select jsonb_agg(jsonb_build_object('key', k, 'views', n, 'visitors', u) order by n desc, k)
      from (select source as k, count(*) as n, count(distinct visitor_id) as u from v where source is not null group by 1 order by 2 desc, 1 limit 25) s
    ), '[]'::jsonb),
    'countries', coalesce((
      select jsonb_agg(jsonb_build_object('key', k, 'views', n, 'visitors', u) order by n desc, k)
      from (select country as k, count(*) as n, count(distinct visitor_id) as u from v where country is not null group by 1 order by 2 desc, 1 limit 25) s
    ), '[]'::jsonb),
    'devices', coalesce((
      select jsonb_agg(jsonb_build_object('key', k, 'views', n, 'visitors', u) order by n desc, k)
      from (select device as k, count(*) as n, count(distinct visitor_id) as u from v group by 1) s
    ), '[]'::jsonb),
    'browsers', coalesce((
      select jsonb_agg(jsonb_build_object('key', k, 'views', n, 'visitors', u) order by n desc, k)
      from (select coalesce(browser, 'Unknown') as k, count(*) as n, count(distinct visitor_id) as u from v group by 1 order by 2 desc, 1 limit 10) s
    ), '[]'::jsonb),
    'os', coalesce((
      select jsonb_agg(jsonb_build_object('key', k, 'views', n, 'visitors', u) order by n desc, k)
      from (select coalesce(os, 'Unknown') as k, count(*) as n, count(distinct visitor_id) as u from v group by 1 order by 2 desc, 1 limit 10) s
    ), '[]'::jsonb),
    'locales', coalesce((
      select jsonb_agg(jsonb_build_object('key', k, 'views', n, 'visitors', u) order by n desc, k)
      from (select locale as k, count(*) as n, count(distinct visitor_id) as u from v group by 1) s
    ), '[]'::jsonb)
  )
$$;

revoke execute on function public.analytics_summary(timestamptz, timestamptz, text) from public, anon, authenticated;
grant execute on function public.analytics_summary(timestamptz, timestamptz, text) to service_role;

-- Moderation reads and updates reports with the service role; nothing to grant. This index serves the
-- admin queue, which lists by status and newest submission first.
create index if not exists reports_status_created_idx on public.reports (status, created_at desc);
