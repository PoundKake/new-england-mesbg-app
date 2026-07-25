import type { PhotoSummary } from '~/types/models'

const DEFAULT_FEED_LIMIT = 60

export interface PhotoUploadInput {
  file: File
  caption?: string
  eventId?: string | null
  players?: string[]
  armies?: string[]
  models?: string[]
}

export function usePhotos() {
  const { apiFetch } = useApi()
  const { token } = useAuth()

  function listPhotos(limit = DEFAULT_FEED_LIMIT): Promise<PhotoSummary[]> {
    return apiFetch<PhotoSummary[]>('/photo_feed', {
      query: { order: 'created_at.desc', limit }
    })
  }

  /**
   * Uploads via the Nuxt server route (server/api/admin/photos.post.ts),
   * not PostgREST directly — resizing/compressing with `sharp` only runs on
   * the server. The route forwards this same Authorization header on to
   * PostgREST, so authorization is still enforced by PostgREST/RLS, not
   * duplicated here.
   */
  function uploadPhoto(input: PhotoUploadInput): Promise<PhotoSummary> {
    const formData = new FormData()
    formData.set('file', input.file)
    if (input.caption) formData.set('caption', input.caption)
    if (input.eventId) formData.set('event_id', input.eventId)
    for (const player of input.players ?? []) formData.append('players', player)
    for (const army of input.armies ?? []) formData.append('armies', army)
    for (const model of input.models ?? []) formData.append('models', model)

    return $fetch<PhotoSummary>('/api/admin/photos', {
      method: 'POST',
      body: formData,
      headers: token.value ? { Authorization: `Bearer ${token.value}` } : undefined
    })
  }

  function imageUrl(photoId: string, size: 'thumb' | 'full' = 'thumb'): string {
    return `/api/photos/${photoId}/image?size=${size}`
  }

  return { listPhotos, uploadPhoto, imageUrl }
}
