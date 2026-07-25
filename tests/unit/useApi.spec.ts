import { describe, expect, it } from 'vitest'
import { resolveApiBaseUrl } from '~/composables/useApi'

const CONFIG = {
  apiBaseInternal: 'http://postgrest:3000',
  public: { apiBase: '/api' }
}

describe('resolveApiBaseUrl', () => {
  it('uses the internal Docker network URL during SSR', () => {
    expect(resolveApiBaseUrl(true, CONFIG)).toBe('http://postgrest:3000')
  })

  it('uses the public, Caddy-proxied URL from the browser', () => {
    expect(resolveApiBaseUrl(false, CONFIG)).toBe('/api')
  })
})
