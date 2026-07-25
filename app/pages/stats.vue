<script setup lang="ts">
const { listSeasons } = useSeasons()
const { data: seasons } = await useAsyncData('stats-seasons', () => listSeasons())
</script>

<template>
  <div class="space-y-16">
    <header class="text-center">
      <h1 class="text-3xl font-bold text-mesbg-ink">Season Results</h1>
      <p class="mt-2 text-mesbg-ink/70">Tournament results and standings for New England MESBG.</p>
    </header>

    <SeasonBlock v-for="season in seasons ?? []" :key="season.id" :season="season" />

    <p v-if="(seasons ?? []).length === 0" class="text-center text-sm text-mesbg-ink/50">
      No seasons recorded yet.
    </p>
  </div>
</template>
