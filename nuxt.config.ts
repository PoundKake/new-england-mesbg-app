import tailwindcss from '@tailwindcss/vite'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  css: ['~/assets/css/main.css'],

  vite: {
    plugins: [tailwindcss()]
  },

  // Component filenames are already unambiguous (AppHeader, PhotoGrid, ...) —
  // disable Nuxt's default directory-based prefixing (e.g.
  // components/gallery/PhotoGrid.vue -> <GalleryPhotoGrid>) so templates can
  // use the plain component name.
  components: [{ path: '~/components', pathPrefix: false }],

  runtimeConfig: {
    // Server-only. Reaches PostgREST directly over the Docker network during SSR
    // and from Nuxt server routes — never sent to the browser.
    apiBaseInternal: process.env.NUXT_API_BASE_INTERNAL || 'http://localhost:3001',
    // Server-only. Must match PostgREST's PGRST_JWT_SECRET so tokens signed here
    // are accepted there.
    jwtSecret: process.env.NUXT_JWT_SECRET || '',
    public: {
      // Client-side base URL, reached through the Caddy reverse proxy.
      apiBase: process.env.NUXT_PUBLIC_API_BASE || '/api',
      // Comma-separated list of one or more calendar IDs — see
      // GoogleCalendarEmbed.vue. Read as plain GOOGLE_CALENDAR_IDS (no
      // NUXT_PUBLIC_ prefix) so the same .env value works both for local
      // `npm run dev` and through docker-compose.yml unchanged.
      googleCalendarIds: process.env.GOOGLE_CALENDAR_IDS || '',
      tableTopAdmiralUrl: 'http://modular.tabletopadmiral.com/'
    }
  }
})
