import { describe, expect, it } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import StandingsCard from '~/components/stats/StandingsCard.vue'

describe('StandingsCard', () => {
  it('renders only the top `limit` ranked rows, with points', async () => {
    const wrapper = await mountSuspended(StandingsCard, {
      props: {
        title: 'Season Standings',
        rows: [
          { rank: 1, label: 'Alice', points: 9 },
          { rank: 2, label: 'Bob', points: 6 },
          { rank: 3, label: 'Cy', points: 3 },
          { rank: 4, label: 'Dana', points: 1 }
        ],
        limit: 3
      }
    })

    const text = wrapper.text()
    expect(text).toContain('Season Standings')
    expect(text).toContain('Alice')
    expect(text).toContain('9 pts')
    expect(text).not.toContain('Dana')
  })

  it('shows an empty state when there are no rows', async () => {
    const wrapper = await mountSuspended(StandingsCard, {
      props: { title: 'Season Standings', rows: [] }
    })

    expect(wrapper.text()).toContain('No results yet.')
  })
})
