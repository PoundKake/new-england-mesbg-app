/**
 * Gates every /admin/* page except the login page itself behind a valid
 * admin JWT. Applied explicitly via `definePageMeta({ middleware: 'admin-auth' })`
 * on each protected page rather than globally, since /admin/login must stay
 * reachable while unauthenticated.
 */
export default defineNuxtRouteMiddleware((to) => {
  if (to.path === '/admin/login') {
    return
  }

  const { isAuthenticated } = useAuth()
  if (!isAuthenticated.value) {
    return navigateTo('/admin/login')
  }
})
