import { afterEach, describe, expect, it, vi } from 'vitest'
import { mockNuxtImport } from '@nuxt/test-utils/runtime'

// mockNuxtImport's factory is hoisted like vi.mock — vi.hoisted() is required
// so `fetchMock` is initialized before that hoisted call runs.
const fetchMock = vi.hoisted(() => vi.fn())
mockNuxtImport('$fetch', () => fetchMock as unknown as typeof $fetch)

describe('useAuth', () => {
  afterEach(() => {
    useAuth().logout()
    fetchMock.mockReset()
  })

  it('stores the token and admin name after a successful login', async () => {
    fetchMock.mockResolvedValueOnce({
      token: 'jwt-token',
      admin: { id: 'admin-1', display_name: 'Alice' }
    })

    const { login, token, adminName, isAuthenticated } = useAuth()
    await login('alice', 'correct-password')

    expect(token.value).toBe('jwt-token')
    expect(adminName.value).toBe('Alice')
    expect(isAuthenticated.value).toBe(true)
  })

  it('leaves no session in place when login fails', async () => {
    fetchMock.mockRejectedValueOnce(new Error('Unauthorized'))

    const { login, isAuthenticated } = useAuth()
    await expect(login('alice', 'wrong-password')).rejects.toThrow()
    expect(isAuthenticated.value).toBe(false)
  })

  it('clears the session on logout', async () => {
    fetchMock.mockResolvedValueOnce({
      token: 'jwt-token',
      admin: { id: 'admin-1', display_name: 'Alice' }
    })

    const { login, logout, isAuthenticated } = useAuth()
    await login('alice', 'correct-password')
    logout()

    expect(isAuthenticated.value).toBe(false)
  })
})
