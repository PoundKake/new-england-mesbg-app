<script setup lang="ts">
const { isAuthenticated, adminName, logout } = useAuth()

const navLinks = [
  { to: '/', label: 'Home' },
  { to: '/events', label: 'Events' },
  { to: '/gallery', label: 'Photos' }
]
</script>

<template>
  <header class="border-b border-mesbg-gold/30 bg-mesbg-ink text-mesbg-parchment">
    <div class="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-4 px-4 py-4">
      <NuxtLink to="/" class="text-lg font-bold tracking-wide uppercase">
        New England MESBG
      </NuxtLink>

      <nav class="flex flex-wrap items-center gap-4 text-sm font-semibold tracking-wide uppercase">
        <NuxtLink
          v-for="link in navLinks"
          :key="link.to"
          :to="link.to"
          class="text-mesbg-parchment/80 transition hover:text-mesbg-gold"
          active-class="text-mesbg-gold"
        >
          {{ link.label }}
        </NuxtLink>

        <NuxtLink
          v-if="isAuthenticated"
          to="/admin"
          class="text-mesbg-parchment/80 transition hover:text-mesbg-gold"
        >
          Admin ({{ adminName }})
        </NuxtLink>

        <button
          v-if="isAuthenticated"
          type="button"
          class="normal-case text-mesbg-parchment/60 transition hover:text-mesbg-red"
          @click="logout"
        >
          Log out
        </button>
      </nav>
    </div>
  </header>
</template>
