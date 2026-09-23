-- Admin sign-in: server-side sessions, the attempt log that drives lockouts, and the TOTP replay guard.

-- A session is a random 256-bit token in the __Host-fsy_admin cookie. Only its SHA-256 is stored, so a copy
-- of this table cannot be replayed as a cookie. Deleting a row signs that browser out.
create table admin_sessions (
  id_hash       text primary key,
  created_at    integer not null,
  last_seen     integer not null,               -- idle timeout counts from here
  expires_at    integer not null,               -- absolute timeout, never extended
  ip            text,
  country       text,
  user_agent    text,
  access_email  text                            -- the Cloudflare Access identity, when Access is on
);
create index admin_sessions_expires on admin_sessions (expires_at);

-- Every sign-in attempt, successful or not. Lockouts are counted from here.
create table login_attempts (
  id          integer primary key,
  ts          integer not null,
  ip          text,
  country     text,
  user_agent  text,
  ok          integer not null,
  reason      text                               -- internal only; the form always says the same thing
);
create index login_attempts_ts on login_attempts (ts);
create index login_attempts_ip on login_attempts (ip, ts);

-- Small counters that must be updated atomically.
create table admin_state (
  key    text primary key,
  value  integer not null
);
-- The last TOTP time step accepted. A code is refused unless its step is newer, so each code works once.
insert into admin_state (key, value) values ('totp_step', 0);
