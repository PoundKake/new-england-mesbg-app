import { describe, expect, it, vi } from 'vitest'
import { mockNuxtImport, mountSuspended } from '@nuxt/test-utils/runtime'
import { flushPromises } from '@vue/test-utils'
import ResultEntryForm from '~/components/admin/ResultEntryForm.vue'

const fetchMock = vi.hoisted(() => vi.fn())
mockNuxtImport('$fetch', () => fetchMock as unknown as typeof $fetch)

describe('ResultEntryForm', () => {
  it('blocks submission until a season and all 3 placements are filled in', async () => {
    // The only network call an empty, untouched form should make is the
    // initial seasons list fetch for the <select> — never the RPC write.
    fetchMock.mockResolvedValueOnce([
      {
        id: 'season-1',
        name: '2026 Season 1',
        starts_on: '2026-01-01',
        ends_on: '2026-12-31',
        created_at: '2026-01-01T00:00:00Z'
      }
    ])

    const wrapper = await mountSuspended(ResultEntryForm)
    await flushPromises()

    await wrapper.find('form').trigger('submit.prevent')
    await flushPromises()

    expect(wrapper.text()).toContain('Choose a season.')
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })
})
