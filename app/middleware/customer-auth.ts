export default defineNuxtRouteMiddleware(async () => {
  if (import.meta.server) return

  // Check localStorage first
  let token = localStorage.getItem('customer_access_token')

  // Fallback to Capacitor Preferences (native app)
  if (!token) {
    try {
      const { Preferences } = await import('@capacitor/preferences')
      const { value } = await Preferences.get({ key: 'customer_access_token' })
      token = value
    } catch {}
  }

  if (!token) {
    return navigateTo('/signin')  // ← was /auth/signin
  }
})