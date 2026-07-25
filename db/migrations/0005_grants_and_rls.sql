-- Access control. The real authorization boundary is these GRANTs — RLS
-- policies below are permissive (using (true)) since there's no per-admin
-- row ownership requirement (any named admin may edit any result/photo).
-- RLS is enabled anyway as cheap insurance against a future accidental
-- over-grant.

set search_path = api, public;

grant usage on schema api to web_anon, web_admin;

-- Reads: public data, open to both roles. api.admins is intentionally never
-- granted to either role — it is not exposed through PostgREST at all.
grant select on
  api.players,
  api.seasons,
  api.events,
  api.game_results,
  api.photos,
  api.photo_feed
to web_anon, web_admin;

-- Writes: admin only.
grant insert, update, delete on
  api.players,
  api.seasons,
  api.events,
  api.game_results,
  api.photos
to web_admin;

alter table api.players enable row level security;
alter table api.seasons enable row level security;
alter table api.events enable row level security;
alter table api.game_results enable row level security;
alter table api.photos enable row level security;

create policy players_read on api.players for select using (true);
create policy players_write on api.players for all to web_admin using (true) with check (true);

create policy seasons_read on api.seasons for select using (true);
create policy seasons_write on api.seasons for all to web_admin using (true) with check (true);

create policy events_read on api.events for select using (true);
create policy events_write on api.events for all to web_admin using (true) with check (true);

create policy game_results_read on api.game_results for select using (true);
create policy game_results_write on api.game_results for all to web_admin using (true) with check (true);

create policy photos_read on api.photos for select using (true);
create policy photos_write on api.photos for all to web_admin using (true) with check (true);
