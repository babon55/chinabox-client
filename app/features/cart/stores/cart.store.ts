import { defineStore } from 'pinia'
import type { CartItem, CartSummary } from '../types'

export const useCartStore = defineStore('cart', () => {
  // ── State ────────────────────────────────────────────────────
  const items = ref<CartItem[]>([
    // Demo items — remove when wiring real API
    {
      id: '1',
      name: { tk: 'Simsiz Gulaklyk Pro', ru: 'Беспроводные наушники Pro' },
      image: '🎧',
      price: 24.99,
      oldPrice: 39.99,
      quantity: 1,
      color: 'Gara / Чёрный',
      seller: 'TechZone Store',
      inStock: true,
    },
    {
      id: '2',
      name: { tk: 'Akylly Sagat Series 8', ru: 'Умные часы Series 8' },
      image: '⌚',
      price: 89.99,
      oldPrice: 120.00,
      quantity: 2,
      color: 'Kümüş / Серебро',
      size: '44mm',
      seller: 'SmartGadgets',
      inStock: true,
    },
    {
      id: '3',
      name: { tk: 'Kamera Çantasy', ru: 'Сумка для камеры' },
      image: '🎒',
      price: 18.50,
      quantity: 1,
      seller: 'BagWorld',
      inStock: false,
    },
  ])

  const promoCode      = ref('')
  const promoApplied   = ref(false)
  const promoDiscount  = ref(0)

  // ── Getters ──────────────────────────────────────────────────
  const totalItems = computed(() =>
    items.value.reduce((sum, i) => sum + i.quantity, 0)
  )

  const summary = computed<CartSummary>(() => {
    const subtotal = items.value.reduce(
      (sum, i) => sum + i.price * i.quantity, 0
    )
    const discount  = promoApplied.value ? subtotal * promoDiscount.value : 0
    const shipping  = subtotal > 50 ? 0 : 4.99
    const total     = subtotal - discount + shipping
    return { subtotal, discount, shipping, total }
  })

  // ── Actions ──────────────────────────────────────────────────
  function updateQuantity(id: string, qty: number) {
    if (qty < 1) return
    const item = items.value.find(i => i.id === id)
    if (item) item.quantity = qty
  }

  function removeItem(id: string) {
    items.value = items.value.filter(i => i.id !== id)
  }

  function clearCart() {
    items.value = []
    promoCode.value    = ''
    promoApplied.value = false
  }

  function applyPromo(code: string): boolean {
    const codes: Record<string, number> = {
      SILK10: 0.10,
      SILK20: 0.20,
      WELCOME: 0.15,
    }
    if (codes[code.toUpperCase()]) {
      promoDiscount.value = codes[code.toUpperCase()]
      promoApplied.value  = true
      return true
    }
    return false
  }

  return {
    items,
    promoCode,
    promoApplied,
    promoDiscount,
    totalItems,
    summary,
    updateQuantity,
    removeItem,
    clearCart,
    applyPromo,
  }
})