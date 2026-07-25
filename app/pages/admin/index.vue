<script setup lang="ts">
definePageMeta({ middleware: 'admin-auth' })

const { listSeasons } = useSeasons()
const { data: seasons } = await useAsyncData('admin-dashboard-seasons', () => listSeasons())
</script>

<template>
  <div class="space-y-8">
    <h1 class="text-2xl font-bold text-mesbg-ink">Admin Dashboard</h1>

    <div class="flex flex-wrap gap-4">
      <NuxtLink
        to="/admin/seasons"
        class="rounded border border-mesbg-ink/20 px-4 py-2 text-sm font-semibold hover:border-mesbg-gold hover:text-mesbg-gold"
      >
        Manage Seasons
      </NuxtLink>
      <NuxtLink
        to="/admin/results/new"
        class="rounded border border-mesbg-ink/20 px-4 py-2 text-sm font-semibold hover:border-mesbg-gold hover:text-mesbg-gold"
      >
        Add Event Result
      </NuxtLink>
      <NuxtLink
        to="/admin/photos/new"
        class="rounded border border-mesbg-ink/20 px-4 py-2 text-sm font-semibold hover:border-mesbg-gold hover:text-mesbg-gold"
      >
        Upload Photo
      </NuxtLink>
    </div>

    <section>
      <h2 class="text-lg font-bold text-mesbg-ink">Seasons</h2>
      <ul class="mt-3 space-y-1 text-sm text-mesbg-ink/80">
        <li v-for="season in seasons ?? []" :key="season.id">
          {{ season.name }} ({{ season.starts_on }} – {{ season.ends_on }})
        </li>
      </ul>
      <p v-if="(seasons ?? []).length === 0" class="text-sm text-mesbg-ink/50">
        No seasons yet — create one to get started.
      </p>
    </section>
  </div>
</template>
