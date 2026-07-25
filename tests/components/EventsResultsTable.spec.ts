import { describe, expect, it } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import EventsResultsTable from '~/components/stats/EventsResultsTable.vue'
import type { EventWithPlacements } from '~/types/models'

const EVENT: EventWithPlacements = {
  id: 'evt-1',
  season_id: 'season-1',
  name: 'Test Cup',
  series_name: 'Cube Free or Die',
  event_date: '2026-03-01',
  tta_url: null,
  created_at: '2026-01-01T00:00:00Z',
  game_results: [
    { placement: 1, faction: 'Rivendell', player: { id: 'p1', display_name: 'Alice', home_state: 'MA' } },
    { placement: 2, faction: 'Mordor', player: { id: 'p2', display_name: 'Bob', home_state: 'NH' } }
    // Deliberately no 3rd place row, to exercise the "missing placement" path.
  ]
}

describe('EventsResultsTable', () => {
  it('renders placements/factions and tolerates a missing 3rd place', async () => {
    const wrapper = await mountSuspended(EventsResultsTable, { props: { events: [EVENT] } })
    const text = wrapper.text()

    expect(text).toContain('Test Cup')
    expect(text).toContain('Cube Free or Die')
    expect(text).toContain('Alice')
    expect(text).toContain('Rivendell')
    expect(text).toContain('Bob')
    expect(text).toContain('Mordor')
  })

  it('shows an empty state when there are no events', async () => {
    const wrapper = await mountSuspended(EventsResultsTable, { props: { events: [] } })
    expect(wrapper.text()).toContain('No events recorded yet.')
  })
})
