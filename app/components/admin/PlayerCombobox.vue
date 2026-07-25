<script setup lang="ts">
import { NEW_ENGLAND_STATES } from '~/data/states'
import type { Player } from '~/types/models'

/**
 * Either an existing player picked from search results, or a brand-new one
 * to be created inline. See db/migrations/0004_functions.sql's
 * create_event_with_results for how "new" selections turn into a player row.
 */
export type PlayerSelection =
  | { kind: 'existing'; playerId: string; displayName: string }
  | { kind: 'new'; displayName: string; homeState: string }

const props = defineProps<{
  modelValue: PlayerSelection | null
  label: string
}>()
const emit = defineEmits<{
  'update:modelValue': [value: PlayerSelection | null]
}>()

const { searchPlayers } = usePlayers()

const query = ref(props.modelValue?.displayName ?? '')
const results = ref<Player[]>([])
const showResults = ref(false)
const newPlayerState = ref(NEW_ENGLAND_STATES[0]!.code)

let searchTimeoutId: ReturnType<typeof setTimeout> | undefined

// Typing invalidates whatever was previously selected — the parent form
// requires a fresh explicit pick (existing or new) before it will submit.
watch(query, (value) => {
  emit('update:modelValue', null)
  if (searchTimeoutId) clearTimeout(searchTimeoutId)
  searchTimeoutId = setTimeout(async () => {
    results.value = await searchPlayers(value)
  }, 200)
})

function selectExisting(player: Player): void {
  query.value = player.display_name
  showResults.value = false
  emit('update:modelValue', { kind: 'existing', playerId: player.id, displayName: player.display_name })
}

function selectNew(): void {
  const displayName = query.value.trim()
  if (!displayName) return
  showResults.value = false
  emit('update:modelValue', { kind: 'new', displayName, homeState: newPlayerState.value })
}
</script>

<template>
  <div class="relative">
    <label class="block text-sm font-semibold text-mesbg-ink">{{ label }}</label>
    <input
      v-model="query"
      type="text"
      placeholder="Search or type a new player's name"
      class="mt-1 w-full rounded border border-mesbg-ink/20 px-3 py-2"
      @focus="showResults = true"
    />

    <div
      v-if="showResults && query"
      class="absolute z-10 mt-1 w-full rounded border border-mesbg-ink/20 bg-white shadow-lg"
    >
      <button
        v-for="player in results"
        :key="player.id"
        type="button"
        class="block w-full px-3 py-2 text-left text-sm hover:bg-mesbg-gold/10"
        @mousedown.prevent="selectExisting(player)"
      >
        {{ player.display_name }}
        <span class="text-xs text-mesbg-ink/50">({{ player.home_state }})</span>
      </button>

      <div class="flex items-center gap-2 border-t border-mesbg-ink/10 px-3 py-2 text-sm">
        <span>New player from</span>
        <select v-model="newPlayerState" class="rounded border border-mesbg-ink/20 px-1 py-0.5 text-xs">
          <option v-for="state in NEW_ENGLAND_STATES" :key="state.code" :value="state.code">
            {{ state.code }}
          </option>
        </select>
        <button type="button" class="font-semibold text-mesbg-red" @mousedown.prevent="selectNew">
          Add "{{ query }}"
        </button>
      </div>
    </div>

    <p v-if="modelValue" class="mt-1 text-xs text-mesbg-ink/50">
      {{ modelValue.kind === 'existing' ? 'Existing player' : `New player (${modelValue.homeState})` }}
    </p>
  </div>
</template>
