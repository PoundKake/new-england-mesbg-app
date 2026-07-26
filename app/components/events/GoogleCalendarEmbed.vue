<script setup lang="ts">
const config = useRuntimeConfig()

// Comma-separated in .env so one embed can overlay multiple stores'
// calendars — Google renders one `src` per calendar, each auto-colored
// differently, on the same grid.
const calendarIds = computed(() =>
  config.public.googleCalendarIds
    .split(',')
    .map((id: string) => id.trim())
    .filter(Boolean)
)

const isConfigured = computed(() => calendarIds.value.length > 0)

const calendarSrc = computed(() => {
  const params = new URLSearchParams({ ctz: 'America/New_York' })
  for (const id of calendarIds.value) {
    params.append('src', id)
  }
  return `https://calendar.google.com/calendar/embed?${params.toString()}`
})
</script>

<template>
  <div class="overflow-hidden rounded-lg border border-mesbg-ink/10">
    <p v-if="!isConfigured" class="p-6 text-center text-sm text-mesbg-ink/60">
      Google Calendar isn't configured yet — set
      <code>GOOGLE_CALENDAR_IDS</code> (see .env.example). Each
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
