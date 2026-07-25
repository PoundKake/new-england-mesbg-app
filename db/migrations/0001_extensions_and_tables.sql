-- Core schema for the New England MESBG site, exposed to the app via PostgREST.
-- Everything PostgREST serves lives in the `api` schema; nothing here is meant
-- to be queried through any other schema.

create schema if not exists api;

-- Provides gen_random_uuid() (primary keys) and crypt()/gen_salt() (admin
-- password hashing). Installed into `public` since no schema is given here.
create extension if not exists pgcrypto;

set search_path = api, public;

-- Points awarded per event placement. Kept as data (not a hardcoded CASE
-- expression in the standings views) so the scoring weights can be changed
-- with an UPDATE instead of a migration.
create table api.placement_points (
  placement smallint primary key check (placement in (1, 2, 3)),
  points    smallint not null
);
insert into api.placement_points (placement, points) values (1, 3), (2, 2), (3, 1);

create table api.players (
  id           uuid primary key default gen_random_uuid(),
  display_name text not null,
  home_state   text not null,
  created_at   timestamptz not null default now()
);
-- Deliberately no unique constraint on display_name: two real players can
-- share a name. Dedup happens in the admin UI's player picker (which shows
-- home_state alongside the name), not the database.
create index players_home_state_idx on api.players (home_state);

create table api.seasons (
  id         uuid primary key default gen_random_uuid(),
  name       text not null unique,
  starts_on  date not null,
  ends_on    date not null,
  created_at timestamptz not null default now(),
  constraint seasons_date_order check (ends_on >= starts_on)
);

create table api.events (
  id          uuid primary key default gen_random_uuid(),
  season_id   uuid not null references api.seasons (id) on delete restrict,
  name        text not null,
  series_name text,
  event_date  date not null,
  tta_url     text,
  created_at  timestamptz not null default now(),
  unique (season_id, name)
);
create index events_season_date_idx on api.events (season_id, event_date);

create table api.game_results (
  id         uuid primary key default gen_random_uuid(),
  event_id   uuid not null references api.events (id) on delete cascade,
  placement  smallint not null references api.placement_points (placement),
  player_id  uuid not null references api.players (id) on delete restrict,
  faction    text not null,
  created_at timestamptz not null default now(),
  -- One 1st/2nd/3rd per event, and a player can't occupy two placements in
  -- the same event.
  unique (event_id, placement),
  unique (event_id, player_id)
);
create index game_results_event_idx on api.game_results (event_id);
create index game_results_player_idx on api.game_results (player_id);

-- Never exposed through PostgREST (no grants in 0005_grants_and_rls.sql).
-- Admin accounts are provisioned via db/scripts/create_admin.sql, run
-- manually — see that file for why this isn't a migration-time seed.
create table api.admins (
  id            uuid primary key default gen_random_uuid(),
  username      text not null unique,
  display_name  text not null,
  password_hash text not null,
  created_at    timestamptz not null default now()
);

create table api.photos (
  id               uuid primary key default gen_random_uuid(),
  -- Optional: only photos actually taken at a tracked event get linked.
  -- Painting/hobby photos are not required to reference an event.
  event_id         uuid references api.events (id) on delete set null,
  caption          text,
  -- Freeform tags rather than foreign keys: a gallery photo often shows
  -- people or models that were never part of a tracked tournament result.
  players          text[],
  armies           text[],
  models           text[],
  mime_type        text not null,
  -- Generated once at upload time (see server/api/admin/photos.post.ts),
  -- not resized on every read, so the gallery grid doesn't repeatedly
  -- transfer full-resolution images just to render thumbnails.
  thumb_image_data bytea not null,
  full_image_data  bytea not null,
  uploaded_by      uuid not null references api.admins (id),
  created_at       timestamptz not null default now()
);
create index photos_event_idx on api.photos (event_id);
create index photos_created_idx on api.photos (created_at desc);
