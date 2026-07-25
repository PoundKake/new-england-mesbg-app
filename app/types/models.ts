// Mirrors the `api` Postgres schema (see db/migrations/) field-for-field —
// PostgREST returns rows with these exact column names, so there is no
// snake_case/camelCase mapping layer to keep in sync with the database.

export interface Player {
  id: string
  display_name: string
  home_state: string
  created_at: string
}

export interface Season {
  id: string
  name: string
  starts_on: string
  ends_on: string
  created_at: string
}

export interface EventRecord {
  id: string
  season_id: string
  name: string
  series_name: string | null
  event_date: string
  tta_url: string | null
  created_at: string
}

export type Placement = 1 | 2 | 3

export interface GameResult {
  id: string
  event_id: string
  placement: Placement
  player_id: string
  faction: string
  created_at: string
}

export interface AuthenticatedAdmin {
  id: string
  display_name: string
}

/** api.photo_feed row — metadata only, no image bytes. */
export interface PhotoSummary {
  id: string
  event_id: string | null
  caption: string | null
  players: string[] | null
  armies: string[] | null
  models: string[] | null
  mime_type: string
  created_at: string
}

/** Payload shape for one placement when submitting api.create_event_with_results. */
export type ResultSubmission =
  | { placement: Placement; faction: string; player_id: string }
  | { placement: Placement; faction: string; new_player: { display_name: string; home_state: string } }
