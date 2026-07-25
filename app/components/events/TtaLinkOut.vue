<script setup lang="ts">
const config = useRuntimeConfig()
</script>

<template>
  <section class="rounded-lg border border-mesbg-ink/10 bg-white/50 p-6 text-center">
    <h2 class="text-xl font-bold text-mesbg-ink">Brackets &amp; Army Lists</h2>
    <p class="mx-auto mt-2 max-w-xl text-sm text-mesbg-ink/70">
      Tournament brackets, pairings, and army lists for our events are managed
      on Table Top Admiral, not on this site.
    </p>
    <a
      :href="config.public.tableTopAdmiralUrl"
      target="_blank"
      rel="noopener noreferrer"
      class="mt-4 inline-block rounded bg-mesbg-red px-6 py-3 text-sm font-semibold tracking-wide text-mesbg-parchment uppercase transition hover:bg-mesbg-red/90"
    >
      Open Table Top Admiral
    </a>
  </section>
</template>
