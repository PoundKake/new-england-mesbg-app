import type { Player } from '~/types/models'

const SEARCH_RESULT_LIMIT = 10

/** Search-existing-or-create-new backing for the admin PlayerCombobox. */
export function usePlayers() {
  const { apiFetch } = useApi()

  function searchPlayers(query: string): Promise<Player[]> {
    const trimmed = query.trim()
    if (!trimmed) {
      return Promise.resolve([])
    }
    return apiFetch<Player[]>('/players', {
      query: {
        display_name: `ilike.*${trimmed}*`,
        order: 'display_name.asc',
        limit: SEARCH_RESULT_LIMIT
      }
    })
  }

  return { searchPlayers }
}
