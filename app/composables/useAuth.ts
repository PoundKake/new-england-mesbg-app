import type { AuthenticatedAdmin } from '~/types/models'

interface LoginResponse {
  token: string
  admin: AuthenticatedAdmin
}

const JWT_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 12 // matches the 12h expiry signed into the JWT itself

/**
 * Manages the admin session. Login goes through the Nuxt server route
 * `server/api/admin/login.post.ts` (which verifies credentials against
 * Postgres and signs the JWT) rather than calling PostgREST directly, since
 * the JWT signing secret must never reach the browser.
 *
 * The token is stored in a plain (non-httpOnly) cookie so client-side code
 * can read it and attach it as an Authorization header on writes — this is
 * a deliberate tradeoff (see project plan): it's readable by any script on
 * the page (XSS risk), accepted here because the worst case is a falsified
 * tournament result, not sensitive data.
 */
export function useAuth() {
  const token = useCookie<string | null>('mesbg_admin_jwt', {
    sameSite: 'lax',
    maxAge: JWT_COOKIE_MAX_AGE_SECONDS
  })
  const adminName = useCookie<string | null>('mesbg_admin_name', {
    sameSite: 'lax',
    maxAge: JWT_COOKIE_MAX_AGE_SECONDS
  })

  const isAuthenticated = computed(() => Boolean(token.value))

  async function login(username: string, password: string): Promise<void> {
    const response = await $fetch<LoginResponse>('/api/admin/login', {
      method: 'POST',
      body: { username, password }
    })
    token.value = response.token
    adminName.value = response.admin.display_name
  }

  function logout(): void {
    token.value = null
    adminName.value = null
  }

  return { token, adminName, isAuthenticated, login, logout }
}
