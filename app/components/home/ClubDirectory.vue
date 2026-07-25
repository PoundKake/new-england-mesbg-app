<script setup lang="ts">
import { CLUBS } from '~/data/clubs'
import { NEW_ENGLAND_STATES } from '~/data/states'

const clubsByState = computed(() =>
  NEW_ENGLAND_STATES.map((state) => ({
    state,
    clubs: CLUBS.filter((club) => club.state === state.code)
  })).filter((group) => group.clubs.length > 0)
)
</script>

<template>
  <section>
    <h2 class="text-2xl font-bold text-mesbg-ink">Find a Local Group</h2>
    <div class="mt-6 grid gap-6 sm:grid-cols-2">
      <div
        v-for="group in clubsByState"
        :key="group.state.code"
        class="rounded-lg border border-mesbg-ink/10 bg-white/50 p-5"
      >
        <h3 class="text-xs font-bold tracking-wide text-mesbg-gold uppercase">
          {{ group.state.name }}
        </h3>
        <ul class="mt-3 space-y-3">
          <li v-for="club in group.clubs" :key="club.name">
            <a
              :href="club.url"
              target="_blank"
              rel="noopener noreferrer"
              class="font-semibold text-mesbg-ink hover:text-mesbg-red"
            >
              {{ club.name }}
            </a>
            <p class="text-sm text-mesbg-ink/60">{{ club.city }}, {{ group.state.code }}</p>
            <p v-if="club.notes" class="text-xs text-mesbg-ink/50">{{ club.notes }}</p>
          </li>
        </ul>
      </div>
    </div>
  </section>
</template>
