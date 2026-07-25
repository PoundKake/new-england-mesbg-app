<script setup lang="ts">
const { apiFetch } = useApi()
const { uploadPhoto } = usePhotos()

const { data: events } = await useAsyncData('photo-form-events', () =>
  apiFetch<Array<{ id: string; name: string }>>('/events', {
    query: { select: 'id,name', order: 'event_date.desc' }
  })
)

const file = ref<File | null>(null)
const caption = ref('')
const eventId = ref('')
const playersText = ref('')
const armiesText = ref('')
const modelsText = ref('')

const isSubmitting = ref(false)
const errorMessage = ref<string | null>(null)
const successMessage = ref<string | null>(null)

function onFileChange(event: Event): void {
  const input = event.target as HTMLInputElement
  file.value = input.files?.[0] ?? null
}

function splitList(value: string): string[] {
  return value
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean)
}

function resetForm(): void {
  file.value = null
  caption.value = ''
  eventId.value = ''
  playersText.value = ''
  armiesText.value = ''
  modelsText.value = ''
}

async function handleSubmit(): Promise<void> {
  errorMessage.value = null
  successMessage.value = null

  if (!file.value) {
    errorMessage.value = 'Choose a photo to upload.'
    return
  }

  isSubmitting.value = true
  try {
    await uploadPhoto({
      file: file.value,
      caption: caption.value.trim() || undefined,
      eventId: eventId.value || null,
      players: splitList(playersText.value),
      armies: splitList(armiesText.value),
      models: splitList(modelsText.value)
    })
    successMessage.value = 'Photo uploaded.'
    resetForm()
  } catch {
    errorMessage.value = 'Upload failed — check the file size/type and try again.'
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <form class="max-w-xl space-y-4" @submit.prevent="handleSubmit">
    <div>
      <label class="block text-sm font-semibold text-mesbg-ink" for="photo-file">Photo</label>
      <input id="photo-file" type="file" accept="image/*" required class="mt-1 w-full text-sm" @change="onFileChange" />
    </div>

    <div>
      <label class="block text-sm font-semibold text-mesbg-ink" for="photo-caption">Caption</label>
      <input
        id="photo-caption"
        v-model="caption"
        type="text"
        class="mt-1 w-full rounded border border-mesbg-ink/20 px-3 py-2"
      />
    </div>

    <div>
      <label class="block text-sm font-semibold text-mesbg-ink" for="photo-event">Event (optional)</label>
      <select id="photo-event" v-model="eventId" class="mt-1 w-full rounded border border-mesbg-ink/20 px-3 py-2">
        <option value="">Not tied to a tracked event</option>
        <option v-for="event in events ?? []" :key="event.id" :value="event.id">{{ event.name }}</option>
      </select>
    </div>

    <div>
      <label class="block text-sm font-semibold text-mesbg-ink" for="photo-players">
        Players in this photo (comma-separated)
      </label>
      <input
        id="photo-players"
        v-model="playersText"
        type="text"
        class="mt-1 w-full rounded border border-mesbg-ink/20 px-3 py-2"
      />
    </div>
    <div>
      <label class="block text-sm font-semibold text-mesbg-ink" for="photo-armies">
        Armies shown (comma-separated)
      </label>
      <input
        id="photo-armies"
        v-model="armiesText"
        type="text"
        class="mt-1 w-full rounded border border-mesbg-ink/20 px-3 py-2"
      />
    </div>
    <div>
      <label class="block text-sm font-semibold text-mesbg-ink" for="photo-models">
        Notable models shown (comma-separated)
      </label>
      <input
        id="photo-models"
        v-model="modelsText"
        type="text"
        class="mt-1 w-full rounded border border-mesbg-ink/20 px-3 py-2"
      />
    </div>

    <p v-if="errorMessage" role="alert" class="text-sm text-mesbg-red">{{ errorMessage }}</p>
    <p v-if="successMessage" class="text-sm text-green-700">{{ successMessage }}</p>

    <button
      type="submit"
      :disabled="isSubmitting"
      class="rounded bg-mesbg-red px-6 py-3 font-semibold text-mesbg-parchment disabled:opacity-50"
    >
      {{ isSubmitting ? 'Uploading…' : 'Upload Photo' }}
    </button>
  </form>
</template>
