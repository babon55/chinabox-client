import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { CustomerProfile, UpdateProfilePayload, UpdatePasswordPayload } from '../types'
import { useSigninStore } from '~/features/signin/stores/signin.store'

export const useProfileStore = defineStore('profile', () => {
  const config      = useRuntimeConfig()
  const API         = config.public.apiBase
  const signinStore = useSigninStore()

  // ── State ──────────────────────────────────────────────────────────────────
  const profile  = ref<CustomerProfile | null>(null)
  const loading  = ref(false)
  const error    = ref<string | null>(null)

  // ── Helpers ────────────────────────────────────────────────────────────────
  function getToken (): string {
    return signinStore.accessToken ?? localStorage.getItem('customer_access_token') ?? ''
  }

  function authHeaders () {
    return {
      'Content-Type': 'application/json',
      Authorization:  `Bearer ${getToken()}`,
    }
  }

  // ── Actions ────────────────────────────────────────────────────────────────
  async function fetchProfile (): Promise<void> {
    loading.value = true
    error.value   = null
    try {
      const res = await fetch(`${API}/customer-auth/me`, {
        headers: authHeaders(),
      })
      if (!res.ok) throw new Error('Failed to load profile')
      profile.value = await res.json()
    } catch (e: any) {
      error.value = e.message ?? 'Unknown error'
    } finally {
      loading.value = false
    }
  }

  async function updateProfile (payload: UpdateProfilePayload): Promise<{ ok: boolean; conflict?: boolean }> {
    const res = await fetch(`${API}/customer-auth/me`, {
      method:  'PATCH',
      headers: authHeaders(),
      body:    JSON.stringify(payload),
    })

    if (res.status === 409) return { ok: false, conflict: true }
    if (!res.ok)             return { ok: false }

    const updated: CustomerProfile = await res.json()
    profile.value = updated

    // Keep localStorage user object in sync
    const stored = JSON.parse(localStorage.getItem('customer_user') ?? '{}')
    localStorage.setItem('customer_user', JSON.stringify({ ...stored, ...updated }))

    return { ok: true }
  }

  async function updatePassword (payload: UpdatePasswordPayload): Promise<{ ok: boolean }> {
    const res = await fetch(`${API}/customer-auth/me`, {
      method:  'PATCH',
      headers: authHeaders(),
      body:    JSON.stringify(payload),
    })
    return { ok: res.ok }
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