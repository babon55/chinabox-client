import { defineStore }  from 'pinia'
import { ref }          from 'vue'
import type { CustomerProfile, UpdateProfilePayload, UpdatePasswordPayload } from '../types'
import { useSigninStore } from '~/features/signin/stores/signin.store'

export const useProfileStore = defineStore('profile', () => {
  const config      = useRuntimeConfig()
  const API         = config.public.apiBase
  const signinStore = useSigninStore()

  // ── State ──────────────────────────────────────────────────────────────────
  const profile = ref<CustomerProfile | null>(null)
  const loading = ref(false)
  const error   = ref<string | null>(null)

  // ── Helpers ────────────────────────────────────────────────────────────────
 function getToken(): string {
  const token = signinStore.accessToken ?? localStorage.getItem('customer_access_token') ?? ''
  console.log('token:', token) // ← add this temporarily
  return token
}
  function authHeaders(): Record<string, string> {
    return { Authorization: `Bearer ${getToken()}` }
  }

  // ── Actions ────────────────────────────────────────────────────────────────
  async function fetchProfile(): Promise<void> {
    loading.value = true
    error.value   = null
    try {
      profile.value = await $fetch<CustomerProfile>(`${API}/customer/me`, {
        headers: authHeaders(),
      })
    } catch (e: any) {
      error.value = e?.data?.message ?? e?.message ?? 'Failed to load profile'
    } finally {
      loading.value = false
    }
  }

  async function updateProfile(payload: UpdateProfilePayload): Promise<{ ok: boolean; conflict?: boolean }> {
    try {
      const updated = await $fetch<CustomerProfile>(`${API}/customer/me`, {
        method:  'PATCH',
        headers: authHeaders(),
        body:    payload,
      })
      profile.value = updated

      // Keep localStorage user object in sync
      const stored = JSON.parse(localStorage.getItem('customer_user') ?? '{}')
      localStorage.setItem('customer_user', JSON.stringify({ ...stored, ...updated }))

      return { ok: true }
    } catch (e: any) {
      if (e?.response?.status === 409 || e?.status === 409) return { ok: false, conflict: true }
      return { ok: false }
    }
  }

  async function updatePassword(payload: UpdatePasswordPayload): Promise<{ ok: boolean }> {
    try {
      await $fetch(`${API}/customer/me`, {
        method:  'PATCH',
        headers: authHeaders(),
        body:    payload,
      })
      return { ok: true }
    } catch {
      return { ok: false }
    }
  }

  return {
    profile,
    loading,
    error,
    fetchProfile,
    updateProfile,
    updatePassword,
  }
})