-- Read-only views exposed directly through PostgREST. Plain views, not
-- materialized: at hobby-league data volumes, recomputing on every read
-- keeps standings always current with zero cache-invalidation code.

set search_path = api, public;

create view api.season_player_standings as
select
  e.season_id,
  gr.player_id,
  p.display_name,
  p.home_state,
  count(*)::int                     as events_played,
  sum(pp.points)::int                as total_points,
  sum((gr.placement = 1)::int)::int  as firsts,
  sum((gr.placement = 2)::int)::int  as seconds,
  sum((gr.placement = 3)::int)::int  as thirds,
  rank() over (partition by e.season_id order by sum(pp.points) desc) as standing_rank
from api.game_results gr
join api.events e            on e.id = gr.event_id
join api.players p           on p.id = gr.player_id
join api.placement_points pp on pp.placement = gr.placement
group by e.season_id, gr.player_id, p.display_name, p.home_state;

-- A state's total is the sum of every one of its players' points (not capped
-- to top-N players), so one very active/successful player can carry their
-- state's ranking. Confirmed with the site owner as the intended semantics.
create view api.season_state_standings as
select
  e.season_id,
  p.home_state,
  sum(pp.points)::int as total_points,
  count(*)::int        as podium_finishes,
  rank() over (partition by e.season_id order by sum(pp.points) desc) as standing_rank
from api.game_results gr
join api.events e            on e.id = gr.event_id
join api.players p           on p.id = gr.player_id
join api.placement_points pp on pp.placement = gr.placement
group by e.season_id, p.home_state;

-- Gallery grid/lightbox metadata. Deliberately excludes thumb_image_data and
-- full_image_data — those are fetched one at a time, by id, through
-- server/api/photos/[id]/image.get.ts, not bulk-loaded with the feed.
create view api.photo_feed as
select id, event_id, caption, players, armies, models, mime_type, created_at
from api.photos
order by created_at desc;
