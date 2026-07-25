import { describe, expect, it, vi } from 'vitest'
import { mockNuxtImport, mountSuspended } from '@nuxt/test-utils/runtime'
import { flushPromises } from '@vue/test-utils'
import LoginForm from '~/components/admin/LoginForm.vue'

const fetchMock = vi.hoisted(() => vi.fn())
mockNuxtImport('$fetch', () => fetchMock as unknown as typeof $fetch)

describe('LoginForm', () => {
  it('shows an error message when login fails', async () => {
    fetchMock.mockRejectedValueOnce(new Error('unauthorized'))

    const wrapper = await mountSuspended(LoginForm)
    await wrapper.find('#username').setValue('alice')
    await wrapper.find('#password').setValue('wrong-password')
    await wrapper.find('form').trigger('submit.prevent')
    await flushPromises()

    expect(wrapper.text()).toContain('Invalid username or password.')
  })

  it('emits success after a valid login', async () => {
    fetchMock.mockResolvedValueOnce({
      token: 'jwt-token',
      admin: { id: 'admin-1', display_name: 'Alice' }
    })

    const wrapper = await mountSuspended(LoginForm)
    await wrapper.find('#username').setValue('alice')
    await wrapper.find('#password').setValue('correct-password')
    await wrapper.find('form').trigger('submit.prevent')
    await flushPromises()

    expect(wrapper.emitted('success')).toHaveLength(1)
  })
})
