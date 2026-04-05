import { defineStore } from 'pinia'

export interface WishlistItem {
  id:       string
  nameTk:   string
  nameRu:   string
  image:    string
  imageUrl?: string | null
  price:    number
  weightG?: number | null
  stock:    number
  category: { nameTk: string; nameRu: string }
  addedAt:  string
}

export const useWishlistStore = defineStore('wishlist', () => {
  const items = ref<WishlistItem[]>([])

  function restore() {
    if (!import.meta.client) return
    try {
      const raw = localStorage.getItem('silkshop_wishlist')
      if (raw) items.value = JSON.parse(raw)
    } catch {}
  }

  function _save() {
    if (import.meta.client)
      localStorage.setItem('silkshop_wishlist', JSON.stringify(items.value))
  }

  const total    = computed(() => items.value.length)
  const ids      = computed(() => new Set(items.value.map(i => i.id)))
  const has      = (id: string) => ids.value.has(id)

  function toggle(item: Omit<WishlistItem, 'addedAt'>) {
    if (has(item.id)) {
      items.value = items.value.filter(i => i.id !== item.id)
    } else {
      items.value.unshift({ ...item, addedAt: new Date().toISOString() })
    }
    _save()
  }

  function remove(id: string) {
    items.value = items.value.filter(i => i.id !== id)
    _save()
  }

  function clear() {
    items.value = []
    _save()
  }

  return { items, total, ids, has, restore, toggle, remove, clear }
})