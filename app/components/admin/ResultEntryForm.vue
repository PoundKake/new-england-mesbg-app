<script setup lang="ts">
import { reactive } from 'vue'
import type { PlayerSelection } from './PlayerCombobox.vue'
import type { ResultSubmission } from '~/types/models'

const { listSeasons } = useSeasons()
const { createEventWithResults } = useEvents()

const { data: seasons } = await useAsyncData('result-form-seasons', () => listSeasons())

const seasonId = ref('')
const eventName = ref('')
const seriesName = ref('')
const eventDate = ref('')
const ttaUrl = ref('')

interface PlacementSlot {
  label: string
  selection: PlayerSelection | null
  faction: string
}

function createEmptyPlacements(): PlacementSlot[] {
  return [
    { label: '1st Place', selection: null, faction: '' },
    { label: '2nd Place', selection: null, faction: '' },
    { label: '3rd Place', selection: null, faction: '' }
  ]
}

// An array of per-slot objects (not parallel arrays of players/factions
// indexed together) so the template can bind v-model to a named property
// (`placement.selection`) instead of an array index — array-index access
// under noUncheckedIndexedAccess would otherwise widen every read to
// `T | undefined`.
const placements = reactive<PlacementSlot[]>(createEmptyPlacements())

const isSubmitting = ref(false)
const errorMessage = ref<string | null>(null)
const successMessage = ref<string | null>(null)

const validationError = computed<string | null>(() => {
  if (!seasonId.value) return 'Choose a season.'
  if (!eventName.value.trim()) return 'Event name is required.'
  if (!eventDate.value) return 'Event date is required.'

  for (const placement of placements) {
    if (!placement.selection) return `${placement.label}: choose or add a player.`
    if (!placement.faction) return `${placement.label}: choose a faction.`
  }

  const existingPlayerIds = placements
    .map((placement) => placement.selection)
    .filter((selection): selection is Extract<PlayerSelection, { kind: 'existing' }> => selection?.kind === 'existing')
    .map((selection) => selection.playerId)
  if (new Set(existingPlayerIds).size !== existingPlayerIds.length) {
    return 'The same player is selected for more than one placement.'
  }

  return null
})

function resetForm(): void {
  eventName.value = ''
  seriesName.value = ''
  eventDate.value = ''
  ttaUrl.value = ''
  const emptyPlacements = createEmptyPlacements()
  placements.forEach((placement, index) => Object.assign(placement, emptyPlacements[index]))
}

async function handleSubmit(): Promise<void> {
  errorMessage.value = validationError.value
  if (errorMessage.value) return

  successMessage.value = null
  isSubmitting.value = true
  try {
    const results: ResultSubmission[] = placements.map((placement, index) => {
      const placementNumber = (index + 1) as 1 | 2 | 3
      const selection = placement.selection!
      return selection.kind === 'existing'
        ? { placement: placementNumber, faction: placement.faction, player_id: selection.playerId }
        : {
            placement: placementNumber,
            faction: placement.faction,
            new_player: { display_name: selection.displayName, home_state: selection.homeState }
          }
    })

    const savedEventName = eventName.value
    await createEventWithResults({
      season_id: seasonId.value,
      name: eventName.value.trim(),
      series_name: seriesName.value.trim() || null,
      event_date: eventDate.value,
      tta_url: ttaUrl.value.trim() || null,
      results
    })

    successMessage.value = `"${savedEventName}" was saved.`
    resetForm()
  } catch {
    errorMessage.value = 'Could not save this event — please try again.'
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <form class="max-w-2xl space-y-6" @submit.prevent="handleSubmit">
    <div>
      <label class="block text-sm font-semibold text-mesbg-ink" for="result-season">Season</label>
      <select
        id="result-season"
        v-model="seasonId"
        required
        class="mt-1 w-full rounded border border-mesbg-ink/20 px-3 py-2"
      >
        <option value="" disabled>Select a season</option>
        <option v-for="season in seasons ?? []" :key="season.id" :value="season.id">{{ season.name }}</option>
      </select>
    </div>

    <div class="grid gap-4 sm:grid-cols-2">
      <div>
        <label class="block text-sm font-semibold text-mesbg-ink" for="event-name">Event name</label>
        <input
          id="event-name"
          v-model="eventName"
          type="text"
          required
          class="mt-1 w-full rounded border border-mesbg-ink/20 px-3 py-2"
        />
      </div>
      <div>
        <label class="block text-sm font-semibold text-mesbg-ink" for="event-series">Series (optional)</label>
        <input
          id="event-series"
          v-model="seriesName"
          type="text"
          placeholder="e.g. GHC Qualifier"
          class="mt-1 w-full rounded border border-mesbg-ink/20 px-3 py-2"
        />
      </div>
      <div>
        <label class="block text-sm font-semibold text-mesbg-ink" for="event-date">Date</label>
        <input
          id="event-date"
          v-model="eventDate"
          type="date"
          required
          class="mt-1 w-full rounded border border-mesbg-ink/20 px-3 py-2"
        />
      </div>
      <div>
        <label class="block text-sm font-semibold text-mesbg-ink" for="event-tta-url">
          Table Top Admiral link (optional)
        </label>
        <input
          id="event-tta-url"
          v-model="ttaUrl"
          type="url"
          placeholder="http://modular.tabletopadmiral.com/…"
          class="mt-1 w-full rounded border border-mesbg-ink/20 px-3 py-2"
        />
      </div>
    </div>

    <div v-for="placement in placements" :key="placement.label" class="rounded-lg border border-mesbg-ink/10 p-4">
      <h3 class="mb-3 text-sm font-bold tracking-wide text-mesbg-gold uppercase">{{ placement.label }}</h3>
      <div class="grid gap-4 sm:grid-cols-2">
        <PlayerCombobox v-model="placement.selection" label="Player" />
        <FactionSelect v-model="placement.faction" label="Faction" />
      </div>
    </div>

    <p v-if="errorMessage" role="alert" class="text-sm text-mesbg-red">{{ errorMessage }}</p>
    <p v-if="successMessage" class="text-sm text-green-700">{{ successMessage }}</p>

    <button
      type="submit"
      :disabled="isSubmitting"
      class="rounded bg-mesbg-red px-6 py-3 font-semibold text-mesbg-parchment disabled:opacity-50"
    >
      {{ isSubmitting ? 'Saving…' : 'Save Event & Results' }}
    </button>
  </form>
</template>
