// app/middleware/customer-auth.ts
// Protects routes that require a logged-in customer.
// Redirects to /auth/signin if no access token is found in localStorage.

export default defineNuxtRouteMiddleware(() => {
  // Only runs on client — localStorage is not available on server
  if (import.meta.server) return

  const token = localStorage.getItem('customer_access_token')

  if (!token) {
    return navigateTo('/auth/signin')
  }
})