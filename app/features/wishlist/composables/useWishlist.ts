import { ref }                              from 'vue'
import { useWishlistStore, type WishlistItem } from '../stores/wishlist.store'

export function useWishlist() {
  const store       = useWishlistStore()
  const cartStore   = useCartStore()
  const addedToCart = ref<string | null>(null)

  // ── Helpers ─────────────────────────────────────────────────────────────────
  function fmt(n: number): string {
    return Number(n).toFixed(2)
  }

  function fmtDate(d: string, locale: string): string {
    return new Date(d).toLocaleDateString(
      locale === 'tk' ? 'tk-TM' : 'ru-RU',
      { day: '2-digit', month: 'short' }
    )
  }

  // ── Cart action ─────────────────────────────────────────────────────────────
  /**
   * Moves a wishlist item into the cart and removes it from the wishlist.
   * Uses the correct CartItem shape (nameTk/nameRu, not name: { tk, ru }).
   */
  function moveToCart(item: WishlistItem): void {
    cartStore.addItem({
      id:       item.id,
      nameTk:   item.nameTk,
      nameRu:   item.nameRu,
      image:    item.imageUrl ?? item.image,
      price:    item.price,
      weightG:  item.weightG ?? null,
      quantity: 1,
      seller:   'SilkShop',
      inStock:  item.stock > 0,
    })
    store.remove(item.id)
    addedToCart.value = item.id
    setTimeout(() => { addedToCart.value = null }, 2000)
  }

  return { fmt, fmtDate, moveToCart, addedToCart }
}