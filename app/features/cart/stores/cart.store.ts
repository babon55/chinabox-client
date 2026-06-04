import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { CartItem } from '../types'
import { useRuntimeConfig } from '#app'

export type SelectedOptions = Record<string, string>

const SIMPLE_RATE = 60
const FAST_RATE   = 140

async function getToken(): Promise<string | null> {
  let token = localStorage.getItem('customer_access_token')
  if (!token) {
    try {
      const { Preferences } = await import('@capacitor/preferences')
      const { value } = await Preferences.get({ key: 'customer_access_token' })
      token = value
    } catch {}
  }
  return token
}

async function refreshCustomerToken(apiBase?: string): Promise<string | null> {
  let refreshToken = localStorage.getItem('customer_refresh_token')
  if (!refreshToken) {
    try {
      const { Preferences } = await import('@capacitor/preferences')
      const { value } = await Preferences.get({ key: 'customer_refresh_token' })
      refreshToken = value
    } catch {}
  }
  if (!refreshToken) return null

  const base = apiBase || useRuntimeConfig().public.apiBase
  try {
    const data = await $fetch<{ accessToken: string; refreshToken: string }>(
      `${base}/customer/refresh`,
      { method: 'POST', body: { refreshToken } }
    )
    localStorage.setItem('customer_access_token', data.accessToken)
    localStorage.setItem('customer_refresh_token', data.refreshToken)
    try {
      const { Preferences } = await import('@capacitor/preferences')
      await Preferences.set({ key: 'customer_access_token', value: data.accessToken })
      await Preferences.set({ key: 'customer_refresh_token', value: data.refreshToken })
    } catch {}
    return data.accessToken
  } catch {
    localStorage.removeItem('customer_access_token')
    localStorage.removeItem('customer_refresh_token')
    localStorage.removeItem('customer_user')
    return null
  }
}

function optionsKey(opts?: SelectedOptions): string {
  if (!opts || !Object.keys(opts).length) return ''
  return Object.keys(opts).sort().map(k => `${k}:${opts[k]}`).join('|')
}

export const useCartStore = defineStore('cart', () => {
  const items             = ref<CartItem[]>([])
  const checkoutLoading   = ref(false)
  const checkoutError     = ref<string | null>(null)
  const lastOrderId       = ref<string | null>(null)
  const removeConfirmItem = ref<CartItem | null>(null)
  const deliveryType      = ref<'simple' | 'fast'>('simple')
  const homeDelivery      = ref(false)
  const router = useRouter()

  function restoreCart() {
    if (!import.meta.client) return
    try {
      const raw = localStorage.getItem('chinaexpress_cart')
      if (raw) items.value = JSON.parse(raw).map((item: CartItem) => ({
        ...item,
        price: Number(item.price),
      }))
      const savedDelivery = localStorage.getItem('chinaexpress_delivery')
      if (savedDelivery) {
        const d = JSON.parse(savedDelivery)
        deliveryType.value = d.type ?? 'simple'
        homeDelivery.value = d.home ?? false
      }
    } catch {}
  }

  function _save() {
    if (import.meta.client) localStorage.setItem('chinaexpress_cart', JSON.stringify(items.value))
  }

  function _saveDelivery() {
    if (import.meta.client)
      localStorage.setItem('chinaexpress_delivery', JSON.stringify({
        type: deliveryType.value,
        home: homeDelivery.value,
      }))
  }

  function setDeliveryType(t: 'simple' | 'fast') {
    deliveryType.value = t
    _saveDelivery()
  }

  function setHomeDelivery(v: boolean) {
    homeDelivery.value = v
    _saveDelivery()
  }

  const totalItems = computed(() => items.value.reduce((sum, i) => sum + i.quantity, 0))
  const subtotal   = computed(() => items.value.reduce((sum, i) => sum + i.price * i.quantity, 0))

  // Replace deliveryCost computed:
  const totalWeightKg = computed(() =>
    items.value.reduce((sum, i) => sum + ((i.weightG ?? 0) * i.quantity), 0) / 1000
  )

  const deliveryCost = computed(() =>
    items.value.length === 0 ? 0 :
    totalWeightKg.value * (deliveryType.value === 'fast' ? FAST_RATE : SIMPLE_RATE)
    + (homeDelivery.value ? 20 : 0)
  )

  const total = computed(() => subtotal.value + deliveryCost.value)

  function addItem(item: CartItem & { options?: SelectedOptions }) {
    const normalizedItem: CartItem = {
      ...item,
      price: Number(item.price),
    }
    const key = optionsKey(item.options)
    const existing = items.value.find(
      i => i.id === item.id && optionsKey(i.options ?? {}) === key
    )
    if (existing) {
      existing.quantity = Math.min(existing.quantity + item.quantity, 99)
    } else {
      items.value.push({ ...normalizedItem, options: item.options })
    }
    _save()
  }

  function updateQuantity(id: string, qty: number, options?: SelectedOptions) {
    if (qty < 1) return
    const key  = optionsKey(options)
    const item = items.value.find(
      i => i.id === id && optionsKey(i.options ?? {}) === key
    )
    if (item) { item.quantity = qty; _save() }
  }

  function requestRemove(item: CartItem) { removeConfirmItem.value = item }

  function confirmRemove() {
    if (removeConfirmItem.value) {
      removeItem(removeConfirmItem.value.id, removeConfirmItem.value.options)
      removeConfirmItem.value = null
    }
  }

  function cancelRemove() { removeConfirmItem.value = null }

  function removeItem(id: string, options?: SelectedOptions) {
    const key   = optionsKey(options)
    items.value = items.value.filter(
      i => !(i.id === id && optionsKey(i.options ?? {}) === key)
    )
    _save()
  }

  function clearCart() {
    items.value = []
    _save()
  }

  async function checkout(): Promise<boolean> {
    if (!import.meta.client) return false
    const config = useRuntimeConfig()
    const API    = config.public.apiBase
    let token = await getToken()
    if (!token) { router.push('/signin'); return false }

    const invalidItems = items.value.filter(i => !i.id || i.id.trim() === '')
    if (invalidItems.length) {
      checkoutError.value = 'Some cart items are missing product IDs.'
      return false
    }

    checkoutLoading.value = true
    checkoutError.value   = null

    const orderBody = {
      deliveryType: deliveryType.value,
      homeDelivery: homeDelivery.value,
      lines: items.value.map(i => {
        const opts      = i.options
        const plainOpts = opts && typeof opts === 'object'
          ? JSON.parse(JSON.stringify(opts))
          : (opts ?? {})
        return { productId: i.id, qty: i.quantity, unitPrice: i.price, options: plainOpts }
      }),
    }

    try {
      const order = await $fetch<{ id: string }>(`${API}/customer/orders`, {
        method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: orderBody,
      })
      lastOrderId.value = order.id
      clearCart()
      return true
    } catch (e: any) {
      const status = e?.response?.status ?? e?.status
      if (status === 401) {
        const newToken = await refreshCustomerToken(API)
        if (!newToken) { router.push('/signin'); return false }
        try {
          const order = await $fetch<{ id: string }>(`${API}/customer/orders`, {
            method: 'POST', headers: { Authorization: `Bearer ${newToken}` }, body: orderBody,
          })
          lastOrderId.value = order.id
          clearCart()
          return true
        } catch (retryErr: any) {
          checkoutError.value = retryErr?.data?.message ?? retryErr?.message ?? 'Checkout failed'
          return false
        }
      }
      checkoutError.value = e?.data?.message ?? e?.message ?? 'Checkout failed'
      return false
    } finally {
      checkoutLoading.value = false
    }
  }

  return {
    items, checkoutLoading, checkoutError, lastOrderId, removeConfirmItem,
    deliveryType, homeDelivery, deliveryCost,
    totalItems, subtotal, total,
    restoreCart, addItem, updateQuantity, removeItem,
    requestRemove, confirmRemove, cancelRemove,
    clearCart, checkout,
    setDeliveryType, setHomeDelivery, totalWeightKg,
  }
})