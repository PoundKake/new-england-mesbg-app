<script setup lang="ts">
import type { PhotoSummary } from '~/types/models'

/** A photo_feed row enriched with the linked event's name (resolved client-side, see pages/gallery.vue). */
export interface GalleryPhoto extends PhotoSummary {
  eventName: string | null
}

defineProps<{
  photos: GalleryPhoto[]
}>()

const emit = defineEmits<{
  select: [photo: GalleryPhoto]
}>()

const { imageUrl } = usePhotos()
</script>

<template>
  <div class="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
    <button
      v-for="photo in photos"
      :key="photo.id"
      type="button"
      class="group relative aspect-square overflow-hidden rounded-md bg-mesbg-ink/5"
      @click="emit('select', photo)"
    >
      <img
        :src="imageUrl(photo.id, 'thumb')"
        :alt="photo.caption ?? 'Gallery photo'"
        loading="lazy"
        class="h-full w-full object-cover transition duration-200 group-hover:scale-105"
      />
      <span
        v-if="photo.caption"
        class="absolute inset-x-0 bottom-0 truncate bg-mesbg-ink/70 px-2 py-1 text-xs text-mesbg-parchment opacity-0 transition group-hover:opacity-100"
      >
        {{ photo.caption }}
      </span>
    </button>
  </div>
  <p v-if="photos.length === 0" class="text-center text-sm text-mesbg-ink/50">No photos yet.</p>
</template>
