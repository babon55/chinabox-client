import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import type { CartItem } from '@/features/cart/types'
import { useCartStore } from '@/features/cart/stores/cart.store'

// Mock Nuxt globals
vi.stubGlobal('$fetch', vi.fn())
vi.stubGlobal('navigateTo', vi.fn())

// Mock Nuxt's useRuntimeConfig
vi.mock('#app', () => ({
  useRuntimeConfig: vi.fn(() => ({
    public: { apiBase: 'http://localhost:3001/api/v1' }
  }))
}))

describe('CartStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    localStorage.clear()
    vi.clearAllMocks()
  })

  it('should add item to cart', () => {
    const store = useCartStore()
    store.addItem({
      id: 'p1',
      name: 'Test Product',
      price: 100,
      quantity: 1,
      weightG: 500
    })
    expect(store.items).toHaveLength(1)
    expect(store.items[0].id).toBe('p1')
    expect(store.totalItems).toBe(1)
  })

  it('should accumulate totalItems correctly', () => {
    const store = useCartStore()
    store.addItem({ id: 'p1', name: 'Prod1', price: 100, quantity: 2, weightG: 0 })
    store.addItem({ id: 'p2', name: 'Prod2', price: 50, quantity: 3, weightG: 0 })
    expect(store.totalItems).toBe(5) // 2 + 3
  })

  it('should calculate subtotal correctly', () => {
    const store = useCartStore()
    store.addItem({ id: 'p1', name: 'Prod1', price: 100, quantity: 2, weightG: 0 })
    store.addItem({ id: 'p2', name: 'Prod2', price: 50, quantity: 1, weightG: 0 })
    expect(store.subtotal).toBe(250) // 2*100 + 1*50
  })

  it('should update quantity', () => {
    const store = useCartStore()
    store.addItem({ id: 'p1', name: 'Prod', price: 100, quantity: 1, weightG: 0 })
    store.updateQuantity('p1', 5)
    expect(store.items[0].quantity).toBe(5)
    expect(store.totalItems).toBe(5)
  })

  it('should remove item', () => {
    const store = useCartStore()
    store.addItem({ id: 'p1', name: 'Prod', price: 100, quantity: 1, weightG: 0 })
    store.removeItem('p1')
    expect(store.items).toHaveLength(0)
  })

  it('should clear cart', () => {
    const store = useCartStore()
    store.addItem({ id: 'p1', name: 'Prod', price: 100, quantity: 1, weightG: 0 })
    store.clearCart()
    expect(store.items).toHaveLength(0)
  })

  it('should calculate total (subtotal + delivery) based on weight', () => {
    const store = useCartStore()
    // 2 items with weightG=1000 => total weight 2kg => delivery $14
    store.addItem({ id: 'p1', name: 'Prod', price: 100, quantity: 2, weightG: 1000 })
    // subtotal = 200, delivery = 2*7 = 14, total = 214
    expect(store.total).toBe(214)
  })
})
