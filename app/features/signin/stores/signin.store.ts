import { defineStore } from 'pinia'

const API = 'http://localhost:3001/api/v1'

interface CustomerUser {
  id:    string
  name:  string
  email: string
  phone: string
}

export const useSigninStore = defineStore('signin', () => {
  const user         = ref<CustomerUser | null>(null)
  const accessToken  = ref<string | null>(null)
  const loading      = ref(false)
  const error        = ref<string | null>(null)

  const isLoggedIn = computed(() => !!user.value && !!accessToken.value)

  // ── Restore session on app load ───────────────────────────────────────────
  // If accessToken is expired, try refreshing silently before giving up
  async function restore() {
    if (!import.meta.client) return

    const token        = localStorage.getItem('customer_access_token')
    const refreshToken = localStorage.getItem('customer_refresh_token')
    const userData     = localStorage.getItem('customer_user')

    if (!userData) return // no session at all

    // Try to load existing token first
    if (token) {
      accessToken.value = token
      try { user.value = JSON.parse(userData) } catch { clearSession(); return }
      return
    }

    // Access token missing but refresh token exists — silently refresh
    if (refreshToken) {
      try {
        const data = await $fetch<{ accessToken: string; refreshToken: string }>(
          `${API}/customer/refresh`,
          { method: 'POST', body: { refreshToken } }
        )
        localStorage.setItem('customer_access_token',  data.accessToken)
        localStorage.setItem('customer_refresh_token', data.refreshToken)
        accessToken.value = data.accessToken
        try { user.value = JSON.parse(userData) } catch { clearSession(); return }
      } catch {
        // Refresh token also expired — clear everything
        clearSession()
      }
    }
  }

  // ── Login ─────────────────────────────────────────────────────────────────
  async function login(email: string, password: string) {
    loading.value = true
    error.value   = null
    try {
      const data = await $fetch<{ accessToken: string; refreshToken: string; customer: CustomerUser }>(
        `${API}/customer/login`,
        { method: 'POST', body: { email, password } }
      )
      accessToken.value = data.accessToken
      user.value        = data.customer
      if (import.meta.client) {
        localStorage.setItem('customer_access_token',  data.accessToken)
        localStorage.setItem('customer_refresh_token', data.refreshToken)
        localStorage.setItem('customer_user',          JSON.stringify(data.customer))
      }
    } catch (err: any) {
      error.value = err?.data?.message ?? 'Login failed'
      throw err
    } finally {
      loading.value = false
    }
  }

  // ── Logout ────────────────────────────────────────────────────────────────
  function logout() {
    clearSession()
    navigateTo('/signin')
  }

  function clearSession() {
    user.value        = null
    accessToken.value = null
    if (import.meta.client) {
      localStorage.removeItem('customer_access_token')
      localStorage.removeItem('customer_refresh_token')
      localStorage.removeItem('customer_user')
    }
  }

  return { user, accessToken, loading, error, isLoggedIn, restore, login, logout, clearSession }
})