import { describe, expect, it } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import PhotoGrid from '~/components/gallery/PhotoGrid.vue'
import type { GalleryPhoto } from '~/components/gallery/PhotoGrid.vue'

const PHOTO: GalleryPhoto = {
  id: 'photo-1',
  event_id: null,
  caption: 'Painted Rivendell warband',
  players: null,
  armies: ['Rivendell'],
  models: null,
  mime_type: 'image/jpeg',
  created_at: '2026-01-01T00:00:00Z',
  eventName: null
}

describe('PhotoGrid', () => {
  it('emits select with the clicked photo', async () => {
    const wrapper = await mountSuspended(PhotoGrid, { props: { photos: [PHOTO] } })
    await wrapper.find('button').trigger('click')

    expect(wrapper.emitted('select')?.[0]).toEqual([PHOTO])
  })

  it('shows an empty state when there are no photos', async () => {
    const wrapper = await mountSuspended(PhotoGrid, { props: { photos: [] } })
    expect(wrapper.text()).toContain('No photos yet.')
  })
})
