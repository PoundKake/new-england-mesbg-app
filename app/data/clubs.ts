import type { StateOption } from './states'

export interface Club {
  name: string
  city: string
  state: StateOption['code']
  /** Link to the club's site, Discord, or Facebook group/page. */
  url: string
  notes?: string
}

/**
 * TODO(site-owner): placeholder content only — replace with the real clubs,
 * game stores, and regular meetup groups you want new players to find. Each
 * entry just needs a name, city/state, and one contact link.
 */
export const CLUBS: Club[] = [
  {
    name: 'TODO: Add your first club or store here',
    city: 'City',
    state: 'MA',
    url: 'https://example.com',
    notes: 'Replace this entry in app/data/clubs.ts with real New England MESBG groups.'
  }
]
