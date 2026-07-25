-- Removes the Season Standings / Stats feature. Only needed against a
-- database that was initialized before this migration existed — a fresh
-- volume never creates these views in the first place (see 0003/0005).
-- Apply by hand per the README's "Schema changes after go-live" section.

set search_path = api, public;

drop view if exists api.season_player_standings;
drop view if exists api.season_state_standings;
