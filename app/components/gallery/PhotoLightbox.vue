<script setup lang="ts">
import type { GalleryPhoto } from './PhotoGrid.vue'

defineProps<{
  photo: GalleryPhoto | null
}>()

const emit = defineEmits<{
  close: []
}>()

const { imageUrl } = usePhotos()

function onKeydown(event: KeyboardEvent): void {
  if (event.key === 'Escape') {
    emit('close')
  }
}

onMounted(() => window.addEventListener('keydown', onKeydown))
onUnmounted(() => window.removeEventListener('keydown', onKeydown))
</script>

<template>
  <div
    v-if="photo"
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
    @click.self="emit('close')"
  >
    <button
      type="button"
      class="fixed top-4 right-4 text-3xl leading-none text-white"
      aria-label="Close"
      @click="emit('close')"
    >
      &times;
    </button>

    <div class="max-h-full w-full max-w-3xl overflow-y-auto rounded-lg bg-mesbg-parchment">
      <img :src="imageUrl(photo.id, 'full')" :alt="photo.caption ?? 'Gallery photo'" class="w-full" />
      <div class="space-y-2 p-5 text-sm text-mesbg-ink">
        <p v-if="photo.caption" class="text-base font-semibold">{{ photo.caption }}</p>
        <dl class="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-mesbg-ink/70">
          <template v-if="photo.eventName">
            <dt class="font-semibold">Event</dt>
            <dd>{{ photo.eventName }}</dd>
          </template>
          <template v-if="photo.players?.length">
            <dt class="font-semibold">Players</dt>
            <dd>{{ photo.players.join(', ') }}</dd>
          </template>
          <template v-if="photo.armies?.length">
            <dt class="font-semibold">Armies</dt>
            <dd>{{ photo.armies.join(', ') }}</dd>
          </template>
          <template v-if="photo.models?.length">
            <dt class="font-semibold">Models</dt>
            <dd>{{ photo.models.join(', ') }}</dd>
          </template>
        </dl>
      </div>
    </div>
  </div>
</template>
