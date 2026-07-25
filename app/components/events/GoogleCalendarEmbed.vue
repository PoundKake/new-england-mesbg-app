<script setup lang="ts">
const config = useRuntimeConfig()

const isConfigured = computed(() => Boolean(config.public.googleCalendarId))

const calendarSrc = computed(() => {
  const params = new URLSearchParams({
    src: config.public.googleCalendarId,
    ctz: 'America/New_York'
  })
  return `https://calendar.google.com/calendar/embed?${params.toString()}`
})
</script>

<template>
  <div class="overflow-hidden rounded-lg border border-mesbg-ink/10">
    <p v-if="!isConfigured" class="p-6 text-center text-sm text-mesbg-ink/60">
      Google Calendar isn't configured yet — set
      <code>NUXT_PUBLIC_GOOGLE_CALENDAR_ID</code> (see .env.example). The
      calendar must also be shared as public in Google Calendar's own
      settings, or the embed will show nothing to visitors.
    </p>
    <iframe
      v-else
      :src="calendarSrc"
      title="New England MESBG events calendar"
      class="h-[600px] w-full"
      style="border: 0"
      loading="lazy"
    />
  </div>
</template>
