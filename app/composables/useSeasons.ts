import type { Season } from '~/types/models'

export interface NewSeasonInput {
  name: string
  starts_on: string
  ends_on: string
}

export function useSeasons() {
  const { apiFetch } = useApi()

  function listSeasons(): Promise<Season[]> {
    return apiFetch<Season[]>('/seasons', {
      query: { order: 'starts_on.desc' }
    })
  }

  function createSeason(input: NewSeasonInput): Promise<Season[]> {
    return apiFetch<Season[]>('/seasons', {
      method: 'POST',
      body: input,
      // Without this, PostgREST returns 201 with an empty body on insert.
      headers: { Prefer: 'return=representation' }
    })
  }

  return { listSeasons, createSeason }
}
