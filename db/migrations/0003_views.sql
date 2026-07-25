-- Read-only views exposed directly through PostgREST. Plain views, not
-- materialized: at hobby-league data volumes, recomputing on every read
-- avoids cache-invalidation code.

set search_path = api, public;

-- Gallery grid/lightbox metadata. Deliberately excludes thumb_image_data and
-- full_image_data — those are fetched one at a time, by id, through
-- server/api/photos/[id]/image.get.ts, not bulk-loaded with the feed.
create view api.photo_feed as
select id, event_id, caption, players, armies, models, mime_type, created_at
from api.photos
order by created_at desc;
