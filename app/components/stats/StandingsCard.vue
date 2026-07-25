<script setup lang="ts">
export interface StandingsRow {
  rank: number
  label: string
  sublabel?: string
  points: number
}

const props = withDefaults(
  defineProps<{
    title: string
    rows: StandingsRow[]
    /** How many rows to show — the reference site shows a "Top 3" per card. */
    limit?: number
  }>(),
  { limit: 3 }
)

const visibleRows = computed(() => props.rows.slice(0, props.limit))

const RANK_COLOR: Record<number, string> = {
  1: 'text-yellow-600',
  2: 'text-slate-500',
  3: 'text-amber-700'
}
</script>

<template>
  <div class="rounded-lg border border-mesbg-ink/10 bg-white/50 p-5">
    <h3 class="text-xs font-bold tracking-wide text-mesbg-gold uppercase">{{ title }}</h3>

    <p v-if="rows.length === 0" class="mt-3 text-sm text-mesbg-ink/50">No results yet.</p>
    <ol v-else class="mt-3 space-y-2">
      <li
        v-for="row in visibleRows"
        :key="row.rank"
        class="flex items-baseline justify-between gap-2 border-b border-mesbg-ink/5 pb-2 text-sm last:border-b-0 last:pb-0"
      >
        <span class="flex items-baseline gap-2">
          <span class="w-4 text-right text-xs font-bold" :class="RANK_COLOR[row.rank] ?? 'text-mesbg-ink/40'">
            {{ row.rank }}
          </span>
          <span class="font-semibold text-mesbg-ink">{{ row.label }}</span>
          <span v-if="row.sublabel" class="text-xs text-mesbg-ink/50">{{ row.sublabel }}</span>
        </span>
        <span class="text-mesbg-ink/70">{{ row.points }} pts</span>
      </li>
    </ol>
  </div>
</template>
