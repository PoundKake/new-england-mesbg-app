<script setup lang="ts">
import type { EmbeddedPlacement, EventWithPlacements, Placement } from '~/types/models'

defineProps<{
  events: EventWithPlacements[]
}>()

const PLACEMENTS: Placement[] = [1, 2, 3]
const PLACEMENT_MEDAL: Record<Placement, string> = { 1: '🥇 1st', 2: '🥈 2nd', 3: '🥉 3rd' }

const dateFormatter = new Intl.DateTimeFormat('en-US', { month: 'numeric', day: 'numeric', year: '2-digit' })

function formatEventDate(isoDate: string): string {
  return dateFormatter.format(new Date(`${isoDate}T00:00:00`))
}

function placementFor(event: EventWithPlacements, placement: Placement): EmbeddedPlacement | undefined {
  return event.game_results.find((result) => result.placement === placement)
}
</script>

<template>
  <div class="overflow-x-auto rounded-lg border border-mesbg-ink/10">
    <table class="w-full min-w-[640px] text-left text-sm">
      <thead>
        <tr class="border-b border-mesbg-ink/10 text-xs tracking-wide text-mesbg-ink/50 uppercase">
          <th class="px-3 py-2">Date</th>
          <th class="px-3 py-2">Event</th>
          <th v-for="placement in PLACEMENTS" :key="placement" class="min-w-[130px] px-3 py-2">
            {{ PLACEMENT_MEDAL[placement] }}
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="event in events" :key="event.id" class="border-b border-mesbg-ink/5 last:border-b-0">
          <td class="px-3 py-3 align-top text-xs whitespace-nowrap text-mesbg-ink/60">
            {{ formatEventDate(event.event_date) }}
          </td>
          <td class="px-3 py-3 align-top">
            <div
              v-if="event.series_name"
              class="text-[0.65rem] font-bold tracking-wide text-mesbg-gold uppercase"
            >
              {{ event.series_name }}
            </div>
            <a
              v-if="event.tta_url"
              :href="event.tta_url"
              target="_blank"
              rel="noopener noreferrer"
              class="font-semibold text-mesbg-ink hover:text-mesbg-red"
            >
              {{ event.name }}
            </a>
            <span v-else class="font-semibold text-mesbg-ink">{{ event.name }}</span>
          </td>
          <td v-for="placement in PLACEMENTS" :key="placement" class="px-3 py-3 align-top">
            <template v-if="placementFor(event, placement)">
              <div class="font-semibold text-mesbg-ink">
                {{ placementFor(event, placement)!.player.display_name }}
              </div>
              <div class="text-xs text-mesbg-ink/50">{{ placementFor(event, placement)!.faction }}</div>
            </template>
          </td>
        </tr>
      </tbody>
    </table>
    <p v-if="events.length === 0" class="p-6 text-center text-sm text-mesbg-ink/50">
      No events recorded yet.
    </p>
  </div>
</template>
