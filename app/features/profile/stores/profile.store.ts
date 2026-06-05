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
  async function getToken(): Promise<string> {
    if (signinStore.accessToken) return signinStore.accessToken

    if (import.meta.client) {
      try {
        const { Preferences } = await import('@capacitor/preferences')
        const { value } = await Preferences.get({ key: 'customer_access_token' })
        if (value) return value
      } catch {}
      return localStorage.getItem('customer_access_token') ?? ''
    }
    return ''
  }
  
  async function authHeaders(): Promise<Record<string, string>> {
    return { Authorization: `Bearer ${await getToken()}` }
  }

  // ── Actions ────────────────────────────────────────────────────────────────
  async function fetchProfile(): Promise<void> {
    loading.value = true
    error.value   = null
    try {
      profile.value = await $fetch<CustomerProfile>(`${API}/customer/me`, {
        headers: await authHeaders(),
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
        headers: await authHeaders(),
        body:    payload,
      })
      profile.value = updated

      try {
        const { Preferences } = await import('@capacitor/preferences')
        const res = await Preferences.get({ key: 'customer_user' })
        const stored = JSON.parse(res.value ?? '{}')
        await Preferences.set({ key: 'customer_user', value: JSON.stringify({ ...stored, ...updated }) })
      } catch {
        const stored = JSON.parse(localStorage.getItem('customer_user') ?? '{}')
        localStorage.setItem('customer_user', JSON.stringify({ ...stored, ...updated }))
      }

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
        headers: await authHeaders(),
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