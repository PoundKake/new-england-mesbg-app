type FetchOptions = Parameters<typeof $fetch>[1]

interface ApiBaseConfig {
  apiBaseInternal: string
  public: { apiBase: string }
}

/**
 * Picks a different PostgREST base URL depending on where the request
 * originates: the internal Docker network address during SSR (no TLS hop
 * needed container-to-container), or the public URL — reverse-proxied by
 * Caddy — from the browser. Extracted as a pure function (rather than
 * inlined in apiFetch) so this one genuinely tricky branch can be unit
 * tested without needing to simulate Nuxt's server/client rendering split.
 */
export function resolveApiBaseUrl(isServer: boolean, config: ApiBaseConfig): string {
  return isServer ? config.apiBaseInternal : config.public.apiBase
}

/**
 * Wraps $fetch for calls to PostgREST, and attaches the admin JWT (if the
 * visitor is logged in) as a Bearer token — so the same call path works for
 * both anonymous reads and authenticated writes, with PostgREST/RLS
 * deciding what's actually allowed.
 */
export function useApi() {
  const config = useRuntimeConfig()
  const { token } = useAuth()

  function apiFetch<T>(path: string, options: FetchOptions = {}): Promise<T> {
    const baseURL = resolveApiBaseUrl(import.meta.server, config)
    const headers = new Headers(options?.headers as HeadersInit | undefined)
    if (token.value) {
      headers.set('Authorization', `Bearer ${token.value}`)
    }

    // ofetch's overloads infer a route-typed response for known Nitro
    // routes; PostgREST paths aren't in that map, so the generic result
    // needs an explicit cast back to the caller's requested type.
    return $fetch<T>(path, { ...options, baseURL, headers }) as Promise<T>
  }

  return { apiFetch }
}
