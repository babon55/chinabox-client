import { defineStore }  from 'pinia'
import { ref }          from 'vue'
import type { Order }   from '../types'

export const useOrdersStore = defineStore('orders', () => {
  const config = useRuntimeConfig()
  const API    = config.public.apiBase

  // ── State ──────────────────────────────────────────────────────────────────
  const orders  = ref<Order[]>([])
  const loading = ref(false)
  const error   = ref<string | null>(null)

  // ── Helpers ────────────────────────────────────────────────────────────────
  async function getToken(): Promise<string> {
    const signinStore = useSigninStore()
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

  // ── Actions ────────────────────────────────────────────────────────────────
  async function fetchOrders(): Promise<void> {
    const token = await getToken()
    if (!token) return

    loading.value = true
    error.value   = null

    try {
      const data = await $fetch<Order[] | { items: Order[] }>(
        `${API}/customer/orders`,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      orders.value = Array.isArray(data) ? data : (data.items ?? [])
    } catch (e: any) {
      error.value = e?.data?.message ?? e?.message ?? 'Failed to load orders'
    } finally {
      loading.value = false
    }
  }

  return { orders, loading, error, fetchOrders }
})