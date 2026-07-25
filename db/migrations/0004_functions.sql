-- RPC functions exposed through PostgREST as POST /rpc/<name>.

set search_path = api, public;

-- Verifies a login attempt against api.admins and returns the admin's
-- id/display_name on success. Raises on bad credentials.
--
-- This function only proves the password was correct — it does not issue a
-- JWT. Signing happens afterward in server/api/admin/login.post.ts (a Nuxt
-- server route), using the well-maintained `jsonwebtoken` npm package rather
-- than the pgjwt Postgres extension, which isn't in the official Postgres
-- image and would require maintaining a custom-compiled image.
--
-- security definer: must be able to read api.admins even though neither
-- web_anon nor web_admin is ever granted access to that table directly.
-- search_path is pinned (not inherited from the caller) so this definer
-- function can't be tricked by a caller-controlled search_path.
create or replace function api.check_login(username text, password text)
returns table (admin_id uuid, display_name text)
language plpgsql
security definer
set search_path = api, public
as $$
declare
  _admin api.admins;
begin
  select * into _admin from api.admins a where a.username = check_login.username;

  if _admin.id is null or _admin.password_hash <> crypt(check_login.password, _admin.password_hash) then
    raise exception 'invalid username or password' using errcode = '28000';
  end if;

  return query select _admin.id, _admin.display_name;
end;
$$;

revoke all on function api.check_login(text, text) from public;
grant execute on function api.check_login(text, text) to web_anon;

-- Inserts one event plus its 1st/2nd/3rd place results (creating any
-- brand-new players inline) as a single transaction, so a mid-submit failure
-- can't leave an event with fewer than 3 placements.
--
-- p_results must be a jsonb array of exactly 3 objects, each shaped as
-- either {"placement": 1, "faction": "...", "player_id": "<uuid>"}
-- or     {"placement": 1, "faction": "...",
--         "new_player": {"display_name": "...", "home_state": "MA"}}
--
-- security invoker (not definer): this function only succeeds because
-- web_admin already holds direct INSERT grants on the underlying tables, so
-- authorization stays in one place (the GRANTs in
-- 0005_grants_and_rls.sql) instead of being duplicated here.
create or replace function api.create_event_with_results(
  p_season_id   uuid,
  p_name        text,
  p_series_name text,
  p_event_date  date,
  p_tta_url     text,
  p_results     jsonb
)
returns uuid
language plpgsql
security invoker
set search_path = api, public
as $$
declare
  v_event_id  uuid;
  v_player_id uuid;
  r           jsonb;
begin
  if jsonb_array_length(p_results) <> 3 then
    raise exception 'exactly 3 placements (1st, 2nd, 3rd) are required';
  end if;

  insert into api.events (season_id, name, series_name, event_date, tta_url)
  values (p_season_id, p_name, nullif(p_series_name, ''), p_event_date, nullif(p_tta_url, ''))
  returning id into v_event_id;

  for r in select * from jsonb_array_elements(p_results) loop
    if r ? 'player_id' then
      v_player_id := (r ->> 'player_id')::uuid;
    else
      insert into api.players (display_name, home_state)
      values (r -> 'new_player' ->> 'display_name', r -> 'new_player' ->> 'home_state')
      returning id into v_player_id;
    end if;

    insert into api.game_results (event_id, placement, player_id, faction)
    values (v_event_id, (r ->> 'placement')::smallint, v_player_id, r ->> 'faction');
  end loop;

  return v_event_id;
end;
$$;

grant execute on function api.create_event_with_results(uuid, text, text, date, text, jsonb) to web_admin;
