<script setup lang="ts">
definePageMeta({ middleware: 'admin-auth' })

const { listSeasons, createSeason } = useSeasons()
const { data: seasons, refresh } = await useAsyncData('admin-seasons-list', () => listSeasons())

const name = ref('')
const startsOn = ref('')
const endsOn = ref('')
const isSubmitting = ref(false)
const errorMessage = ref<string | null>(null)

async function handleSubmit(): Promise<void> {
  errorMessage.value = null
  isSubmitting.value = true
  try {
    await createSeason({ name: name.value.trim(), starts_on: startsOn.value, ends_on: endsOn.value })
    name.value = ''
    startsOn.value = ''
    endsOn.value = ''
    await refresh()
  } catch {
    errorMessage.value = 'Could not create season — check the dates (end must be on/after start) and try again.'
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <div class="space-y-10">
    <h1 class="text-2xl font-bold text-mesbg-ink">Seasons</h1>

    <form class="max-w-md space-y-4" @submit.prevent="handleSubmit">
      <div>
        <label class="block text-sm font-semibold text-mesbg-ink" for="season-name">Name</label>
        <input
          id="season-name"
          v-model="name"
          type="text"
          required
          placeholder="2026 Season 1"
          class="mt-1 w-full rounded border border-mesbg-ink/20 px-3 py-2"
        />
      </div>
      <div class="flex gap-4">
        <div class="flex-1">
          <label class="block text-sm font-semibold text-mesbg-ink" for="starts-on">Starts</label>
          <input
            id="starts-on"
            v-model="startsOn"
            type="date"
            required
            class="mt-1 w-full rounded border border-mesbg-ink/20 px-3 py-2"
          />
        </div>
        <div class="flex-1">
          <label class="block text-sm font-semibold text-mesbg-ink" for="ends-on">Ends</label>
          <input
            id="ends-on"
            v-model="endsOn"
            type="date"
            required
            class="mt-1 w-full rounded border border-mesbg-ink/20 px-3 py-2"
          />
        </div>
      </div>
      <p v-if="errorMessage" role="alert" class="text-sm text-mesbg-red">{{ errorMessage }}</p>
      <button
        type="submit"
        :disabled="isSubmitting"
        class="rounded bg-mesbg-red px-4 py-2 font-semibold text-mesbg-parchment disabled:opacity-50"
      >
        {{ isSubmitting ? 'Creating…' : 'Create Season' }}
      </button>
    </form>

    <section>
      <h2 class="text-lg font-bold text-mesbg-ink">Existing Seasons</h2>
      <ul class="mt-3 space-y-1 text-sm text-mesbg-ink/80">
        <li v-for="season in seasons ?? []" :key="season.id">{{ season.name }}</li>
      </ul>
      <p v-if="(seasons ?? []).length === 0" class="text-sm text-mesbg-ink/50">No seasons yet.</p>
    </section>
  </div>
</template>
