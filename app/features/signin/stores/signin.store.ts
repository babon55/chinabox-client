import { defineStore } from 'pinia'
import { Preferences } from '@capacitor/preferences'

interface CustomerUser {
  id:      string
  name:    string
  email:   string
  phone:   string | null
  address: string | null
  status:  'ACTIVE' | 'BLOCKED'
}

async function setItem(key: string, value: string) {
  try {
    await Preferences.set({ key, value })
  } catch {
    localStorage.setItem(key, value)
  }
}

async function getItem(key: string): Promise<string | null> {
  try {
    const { value } = await Preferences.get({ key })
    if (value !== null) return value          // ← add this check
    return localStorage.getItem(key)          // ← fallback
  } catch {
    return localStorage.getItem(key)
  }
}

async function removeItem(key: string) {
  try {
    await Preferences.remove({ key })
  } catch {
    localStorage.removeItem(key)
  }
}

export const useSigninStore = defineStore('signin', () => {
  const { public: { apiBase: API } } = useRuntimeConfig()
  const router = useRouter()

  const user        = ref<CustomerUser | null>(null)
  const accessToken = ref<string | null>(null)
  const loading     = ref(false)
  const error       = ref<string | null>(null)

  const isLoggedIn = computed(() => !!user.value && !!accessToken.value)

  async function restore() {
    if (!import.meta.client) return
    const token        = await getItem('customer_access_token')
    const refreshToken = await getItem('customer_refresh_token')
    const userData     = await getItem('customer_user')
    if (!userData) return

    const isExpired = (t: string) => {
      try {
        const { exp } = JSON.parse((globalThis as any).atob(t.split('.')[1]))
        return Date.now() / 1000 >= exp
      } catch { return true }
    }

    if (token && !isExpired(token)) {
      accessToken.value = token
      try { user.value = JSON.parse(userData) } catch { clearSession(); return }
      return
    }

    if (refreshToken) {
      try {
        const data = await $fetch<{ accessToken: string; refreshToken: string }>(
          `${API}/customer/refresh`,
          { method: 'POST', body: { refreshToken } }
        )
        await setItem('customer_access_token',  data.accessToken)
        await setItem('customer_refresh_token', data.refreshToken)
        accessToken.value = data.accessToken
        try { user.value = JSON.parse(userData) } catch { clearSession(); return }
      } catch { await clearSession() }
    } else {
      await clearSession()
    }
  }

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
        await setItem('customer_access_token',  data.accessToken)
        await setItem('customer_refresh_token', data.refreshToken)
        await setItem('customer_user',          JSON.stringify(data.customer))
      }
    } catch (err: any) {
      error.value = err?.data?.message ?? 'Login failed'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function logout() {
    await clearSession()
    router.push('/signin')
  }

  async function clearSession() {
    user.value        = null
    accessToken.value = null
    if (import.meta.client) {
      await removeItem('customer_access_token')
      await removeItem('customer_refresh_token')
      await removeItem('customer_user')
    }
  }

  return { user, accessToken, loading, error, isLoggedIn, restore, login, logout, clearSession }
})