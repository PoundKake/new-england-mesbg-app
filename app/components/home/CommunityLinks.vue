<script setup lang="ts">
import { COMMUNITY_LINKS } from '~/data/communityLinks'
</script>

<template>
  <section class="text-center">
    <h2 class="text-2xl font-bold text-mesbg-ink">Join the Community</h2>
    <div class="mt-6 flex flex-wrap justify-center gap-4">
      <a
        v-for="link in COMMUNITY_LINKS"
        :key="link.label"
        :href="link.url"
        target="_blank"
        rel="noopener noreferrer"
        :title="link.description"
        class="rounded border border-mesbg-ink/20 px-6 py-3 text-sm font-semibold text-mesbg-ink transition hover:border-mesbg-gold hover:text-mesbg-gold"
      >
        {{ link.label }}
      </a>
    </div>
  </section>
</template>
