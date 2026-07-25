import type { EventWithPlacements, ResultSubmission } from '~/types/models'

export interface NewEventInput {
  season_id: string
  name: string
  series_name: string | null
  event_date: string
  tta_url: string | null
  /** Exactly 3 entries: 1st, 2nd, and 3rd place. */
  results: ResultSubmission[]
}

const EVENT_WITH_PLACEMENTS_SELECT =
  'id,season_id,name,series_name,event_date,tta_url,created_at,' +
  'game_results(placement,faction,player:players(id,display_name,home_state))'

export function useEvents() {
  const { apiFetch } = useApi()

  function listEventsForSeason(seasonId: string): Promise<EventWithPlacements[]> {
    return apiFetch<EventWithPlacements[]>('/events', {
      query: {
        season_id: `eq.${seasonId}`,
        select: EVENT_WITH_PLACEMENTS_SELECT,
        order: 'event_date.asc'
      }
    })
  }

  /**
   * Creates one event plus its 3 placements as a single transaction via
   * api.create_event_with_results — see db/migrations/0004_functions.sql.
   * Returns the new event's id.
   */
  function createEventWithResults(input: NewEventInput): Promise<string> {
    return apiFetch<string>('/rpc/create_event_with_results', {
      method: 'POST',
      body: {
        p_season_id: input.season_id,
        p_name: input.name,
        p_series_name: input.series_name,
        p_event_date: input.event_date,
        p_tta_url: input.tta_url,
        p_results: input.results
      }
    })
  }

  return { listEventsForSeason, createEventWithResults }
}
