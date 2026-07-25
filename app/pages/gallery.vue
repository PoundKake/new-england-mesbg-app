<script setup lang="ts">
import type { GalleryPhoto } from '~/components/gallery/PhotoGrid.vue'

const { listPhotos } = usePhotos()
const { apiFetch } = useApi()

const { data: photoSummaries } = await useAsyncData('gallery-photos', () => listPhotos())
// A lightweight id->name lookup so the lightbox can show the linked event's
// name without needing a dedicated view — the number of events is small
// enough that fetching all of them here is cheap.
const { data: eventsLookup } = await useAsyncData('gallery-events-lookup', () =>
  apiFetch<Array<{ id: string; name: string }>>('/events', { query: { select: 'id,name' } })
)

const eventNameById = computed(() => new Map((eventsLookup.value ?? []).map((event) => [event.id, event.name])))

const galleryPhotos = computed<GalleryPhoto[]>(() =>
  (photoSummaries.value ?? []).map((photo) => ({
    ...photo,
    eventName: photo.event_id ? (eventNameById.value.get(photo.event_id) ?? null) : null
  }))
)

const selectedPhoto = ref<GalleryPhoto | null>(null)
</script>

<template>
  <div class="space-y-8">
    <header class="text-center">
      <h1 class="text-3xl font-bold text-mesbg-ink">Photo Gallery</h1>
      <p class="mt-2 text-mesbg-ink/70">Event photos and painted miniatures from the community.</p>
    </header>

    <PhotoGrid :photos="galleryPhotos" @select="selectedPhoto = $event" />
    <PhotoLightbox :photo="selectedPhoto" @close="selectedPhoto = null" />
  </div>
</template>
