import { defineStore } from 'pinia'
import type { CartItem, CartSummary } from '../types'
import { useRuntimeConfig } from '#app'

// ── SelectedOptions type ──────────────────────────────────────────────────────
export type SelectedOptions = Record<string, string>  // optionId → chosen value

// ── Helper: refresh customer token silently ───────────────────────────────────
async function refreshCustomerToken(apiBase?: string): Promise<string | null> {
  const refreshToken = localStorage.getItem('customer_refresh_token')
  if (!refreshToken) return null

  const base = apiBase || useRuntimeConfig().public.apiBase

  try {
    const data = await $fetch<{ accessToken: string; refreshToken: string }>(
      `${base}/customer/refresh`,
      { method: 'POST', body: { refreshToken } }
    )
    localStorage.setItem('customer_access_token',  data.accessToken)
    localStorage.setItem('customer_refresh_token', data.refreshToken)
    return data.accessToken
  } catch {
    // Refresh token also expired — clear everything
    localStorage.removeItem('customer_access_token')
    localStorage.removeItem('customer_refresh_token')
    localStorage.removeItem('customer_user')
    return null
  }
}

// ── Options key: same product + different options = different cart line ───────
function optionsKey(opts?: SelectedOptions): string {
  if (!opts || !Object.keys(opts).length) return ''
  return Object.keys(opts).sort().map(k => `${k}:${opts[k]}`).join('|')
}

export const useCartStore = defineStore('cart', () => {

  const items           = ref<CartItem[]>([])
  const promoCode       = ref('')
  const promoApplied    = ref(false)
  const promoDiscount   = ref(0)
  const checkoutLoading = ref(false)
  const checkoutError   = ref<string | null>(null)
  const lastOrderId     = ref<string | null>(null)

  function restoreCart() {
    if (!import.meta.client) return
    try {
      const raw = localStorage.getItem('silkshop_cart')
      if (raw) items.value = JSON.parse(raw)
    } catch {}
  }

  function _save() {
    if (import.meta.client) localStorage.setItem('silkshop_cart', JSON.stringify(items.value))
  }

  const totalItems = computed(() => items.value.reduce((sum, i) => sum + i.quantity, 0))

  const summary = computed<CartSummary>(() => {
    const subtotal = items.value.reduce((sum, i) => sum + i.price * i.quantity, 0)
    const discount = promoApplied.value ? subtotal * promoDiscount.value : 0
    const shipping = subtotal > 50 ? 0 : 4.99
    const total    = subtotal - discount + shipping
    return { subtotal, discount, shipping, total }
  })

  // ── addItem: same product + same options → increment qty
  //            same product + different options → separate line ────────────────
  function addItem(item: CartItem & { options?: SelectedOptions }) {
    console.log('Cart addItem:', item.id, 'options:', item.options)
    const key      = optionsKey(item.options)
    const existing = items.value.find(
      i => i.id === item.id && optionsKey((i as any).options) === key
    )
    if (existing) {
      existing.quantity = Math.min(existing.quantity + item.quantity, 99)
    } else {
      items.value.push({ ...item })
    }
    _save()
  }

  // ── updateQuantity: supports optional options key ─────────────────────────
  function updateQuantity(id: string, qty: number, options?: SelectedOptions) {
    if (qty < 1) return
    const key  = optionsKey(options)
    const item = items.value.find(
      i => i.id === id && optionsKey((i as any).options) === key
    )
    if (item) { item.quantity = qty; _save() }
  }

  // ── removeItem: supports optional options key ─────────────────────────────
  function removeItem(id: string, options?: SelectedOptions) {
    const key   = optionsKey(options)
    items.value = items.value.filter(
      i => !(i.id === id && optionsKey((i as any).options) === key)
    )
    _save()
  }

  function clearCart() {
    items.value = []; promoCode.value = ''; promoApplied.value = false; _save()
  }

  function applyPromo(code: string): boolean {
    const codes: Record<string, number> = { SILK10: 0.10, SILK20: 0.20, WELCOME: 0.15 }
    const discount = codes[code.toUpperCase()]
    if (discount) { promoDiscount.value = discount; promoApplied.value = true; return true }
    return false
  }

  // ── Checkout with auto-refresh on 401 ────────────────────────────────────
  async function checkout(note?: string): Promise<boolean> {
    if (!import.meta.client) return false

    const config = useRuntimeConfig()
    const API = config.public.apiBase

    let token = localStorage.getItem('customer_access_token')
    if (!token) { navigateTo('/signin'); return false }

    // Guard: ensure all items have a valid product id
    const invalidItems = items.value.filter(i => !i.id || i.id.trim() === '')
    if (invalidItems.length) {
      checkoutError.value = 'Some cart items are missing product IDs. Please remove and re-add them.'
      return false
    }

    checkoutLoading.value = true
    checkoutError.value   = null

    console.log('Checkout cart items:', items.value.map(i => ({ id: i.id, options: i.options })))
    const orderBody = {
      lines: items.value.map(i => {
        const opts = (i as any).options
        // Ensure options is a plain JSON-serializable object (not a Vue Proxy)
        const plainOpts = opts && typeof opts === 'object' ? JSON.parse(JSON.stringify(opts)) : (opts ?? {})
        return {
          productId: i.id,
          qty:       i.quantity,
          unitPrice: i.price,
          options:   plainOpts,
        }
      }),
      note,
    }
    console.log('Checkout orderBody:', orderBody)

    try {
      const order = await $fetch<{ id: string }>(`${API}/customer/orders`, {
        method:  'POST',
        headers: { Authorization: `Bearer ${token}` },
        body:    orderBody,
      })
      lastOrderId.value = order.id
      clearCart()
      return true

    } catch (e: any) {
      const status = e?.response?.status ?? e?.status

      // ── Auto-refresh on 401 ────────────────────────────────────────────────
      if (status === 401) {
        const newToken = await refreshCustomerToken(API)

        if (!newToken) {
          navigateTo('/signin')
          return false
        }

        // Retry checkout with fresh token
        try {
          const order = await $fetch<{ id: string }>(`${API}/customer/orders`, {
            method:  'POST',
            headers: { Authorization: `Bearer ${newToken}` },
            body:    orderBody,
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
    items, promoCode, promoApplied, promoDiscount,
    checkoutLoading, checkoutError, lastOrderId,
    totalItems, summary,
    restoreCart, addItem, updateQuantity, removeItem, clearCart, applyPromo, checkout,
  }
})