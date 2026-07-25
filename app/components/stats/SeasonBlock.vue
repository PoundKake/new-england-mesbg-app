<script setup lang="ts">
import { stateName } from '~/data/states'
import type { Season } from '~/types/models'
import type { StandingsRow } from './StandingsCard.vue'

const props = defineProps<{ season: Season }>()

const { listPlayerStandings, listStateStandings } = useStandings()
const { listEventsForSeason } = useEvents()

const { data: playerStandings } = await useAsyncData(`season-player-standings-${props.season.id}`, () =>
  listPlayerStandings(props.season.id)
)
const { data: stateStandings } = await useAsyncData(`season-state-standings-${props.season.id}`, () =>
  listStateStandings(props.season.id)
)
const { data: events } = await useAsyncData(`season-events-${props.season.id}`, () =>
  listEventsForSeason(props.season.id)
)

const playerStandingRows = computed<StandingsRow[]>(
  () =>
    playerStandings.value?.map((row) => ({
      rank: row.standing_rank,
      label: row.display_name,
      points: row.total_points
    })) ?? []
)

const stateStandingRows = computed<StandingsRow[]>(
  () =>
    stateStandings.value?.map((row) => ({
      rank: row.standing_rank,
      label: stateName(row.home_state),
      points: row.total_points
    })) ?? []
)

const seasonDateRangeFormatter = new Intl.DateTimeFormat('en-US', { month: 'short', year: 'numeric' })

function formatSeasonDateRange(startsOn: string, endsOn: string): string {
  return `${seasonDateRangeFormatter.format(new Date(startsOn))} – ${seasonDateRangeFormatter.format(new Date(endsOn))}`
}
</script>

<template>
  <section>
    <div class="flex flex-wrap items-baseline gap-3 border-b-2 border-mesbg-red pb-2">
      <h2 class="text-xl font-bold tracking-wide text-mesbg-ink uppercase">{{ season.name }}</h2>
      <span class="text-xs text-mesbg-ink/50">
        {{ formatSeasonDateRange(season.starts_on, season.ends_on) }}
      </span>
    </div>

    <div class="mt-6 grid gap-4 sm:grid-cols-2">
      <StandingsCard title="Season Player Standings — Top 3" :rows="playerStandingRows" />
      <StandingsCard title="State Challenge" :rows="stateStandingRows" />
    </div>

    <div class="mt-6">
      <EventsResultsTable :events="events ?? []" />
    </div>
  </section>
</template>
