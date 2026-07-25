import { defineVitestConfig } from '@nuxt/test-utils/config'

export default defineVitestConfig({
  test: {
    // Every test here needs Nuxt auto-imports (composables, components) —
    // set this explicitly rather than relying on defineVitestConfig's
    // default project-split, which otherwise only applies the Nuxt
    // environment to files named *.nuxt.spec.ts.
    environment: 'nuxt',
    include: ['tests/**/*.spec.ts']
  }
})
