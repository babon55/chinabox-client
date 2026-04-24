import { defineStore } from 'pinia'
import { ref }         from 'vue'
import type { TrackedOrder } from '../types'

export const useTrackStore = defineStore('track', () => {
  const config = useRuntimeConfig()
  const API    = config.public.apiBase

  // ── State ──────────────────────────────────────────────────────────────────
  const order   = ref<TrackedOrder | null>(null)
  const loading = ref(false)
  const error   = ref<string | null>(null)

  // ── Actions ────────────────────────────────────────────────────────────────
  async function trackOrder(id: string): Promise<void> {
    loading.value = true
    error.value   = null
    order.value   = null
    try {
      order.value = await $fetch<TrackedOrder>(`${API}/orders/track/${id}`)
    } catch (e: any) {
      error.value = e?.data?.message ?? e?.message ?? null
    } finally {
      loading.value = false
    }
  }

  function reset(): void {
    order.value   = null
    error.value   = null
    loading.value = false
  }

  return { order, loading, error, trackOrder, reset }
})