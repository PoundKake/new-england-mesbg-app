import type { SeasonPlayerStanding, SeasonStateStanding } from '~/types/models'

export function useStandings() {
  const { apiFetch } = useApi()

  function listPlayerStandings(seasonId: string): Promise<SeasonPlayerStanding[]> {
    return apiFetch<SeasonPlayerStanding[]>('/season_player_standings', {
      query: { season_id: `eq.${seasonId}`, order: 'standing_rank.asc' }
    })
  }

  function listStateStandings(seasonId: string): Promise<SeasonStateStanding[]> {
    return apiFetch<SeasonStateStanding[]>('/season_state_standings', {
      query: { season_id: `eq.${seasonId}`, order: 'standing_rank.asc' }
    })
  }

  return { listPlayerStandings, listStateStandings }
}
