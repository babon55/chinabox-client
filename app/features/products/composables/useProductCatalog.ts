import { ref, computed }      from 'vue'
import { useI18n }            from 'vue-i18n'
import { useProductStore }    from '../stores/product.store'
import type { Product, SelectedOptions, ProductOption } from '../types'
import type { QuickAddProduct } from '../components/QuickAddModal.vue'

export function useProductCatalog() {
  const { t, locale }        = useI18n()
  const cartStore    = useCartStore()
  const productStore = useProductStore()

  // ── Quick-add modal state ──────────────────────────────────────────────────
  const quickProduct = ref<QuickAddProduct | null>(null)
  const addedId      = ref<string | null>(null)

  // ── Sort options (i18n) ────────────────────────────────────────────────────
  const sortOptions = computed(() => [
    { value: 'random',     label: locale.value === 'tk' ? 'Tötänleýin' : 'Случайно' },
    { value: 'newest',     label: t('products.sort.newest')   },
    { value: 'popular',    label: t('products.sort.popular')  },
    { value: 'price_asc',  label: t('products.sort.priceAsc') },
    { value: 'price_desc', label: t('products.sort.priceDesc') },
  ])

  // ── Helpers ────────────────────────────────────────────────────────────────
  function fmt(n: number): string {
    return Number(n).toFixed(2)
  }

  function clientPrice(price: number, markup = 50): number {
    return Number(price) * (1 + markup / 100)
  }

  function firstImage(p: Product): string | null {
    return p.imageUrls?.[0] ?? p.imageUrl ?? null
  }

  // ── Cart actions ───────────────────────────────────────────────────────────

  /**
   * Called when the cart button on a product card is clicked.
   * Opens QuickAddModal if the product has options, otherwise adds directly.
   */
  function handleCartClick(p: Product): void {
    if (p.options?.length) {
      quickProduct.value = {
        id:       p.id,
        nameTk:   p.nameTk,
        nameRu:   p.nameRu,
        image:    p.image,
        imageUrl: firstImage(p),
        price:    Number(p.price),
        weightG:  p.weightG ?? null,
        stock:    p.stock,
        options:  p.options as ProductOption[],
        category: p.category,
      }
    } else {
      addToCart(p, {})
    }
  }

  /**
   * Adds a product to cart with optional selected options.
   * Shows a brief "added" checkmark animation on the card button.
   */
  function addToCart(p: Product, options: SelectedOptions): void {
    cartStore.addItem({
      id:       p.id,
      nameTk:   p.nameTk,
      nameRu:   p.nameRu,
      image:    firstImage(p) ?? p.image ?? '',
      price:    clientPrice(Number(p.price), p.markup ?? 50),
      quantity: 1,
      seller:   'SilkShop',
      inStock:  p.stock > 0,
      weightG:  p.weightG ?? null,
      options:  Object.keys(options).length ? { ...options } : undefined,
    })
    addedId.value = p.id
    setTimeout(() => { addedId.value = null }, 1500)
  }

  /**
   * Called by QuickAddModal's @add event.
   */
  function onQuickAdd(productId: string, options: SelectedOptions): void {
    const p = productStore.items.find(x => x.id === productId)
    if (p) addToCart(p, options)
  }

  function closeQuickAdd(): void {
    quickProduct.value = null
  }

  return {
    quickProduct,
    addedId,
    sortOptions,
    fmt,
    clientPrice,
    firstImage,
    handleCartClick,
    addToCart,
    onQuickAdd,
    closeQuickAdd,
  }
}