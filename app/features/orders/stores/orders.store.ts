import { defineStore } from 'pinia'
import type { OrderItem } from '../types'

export const useOrdersStore = defineStore('orders', () => {
  const items   = ref<OrderItem[]>([])
  const loading = ref(false)
  const error   = ref<string | null>(null)

  async function fetchItems() {
    loading.value = true
    error.value   = null
    try {
      items.value = await $fetch<OrderItem[]>('/api/orders')
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'An error occurred'
    } finally {
      loading.value = false
    }
  }

  return { items, loading, error, fetchItems }
})