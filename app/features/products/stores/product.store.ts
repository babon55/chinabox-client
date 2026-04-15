import { defineStore }  from 'pinia'
import { ref, computed } from 'vue'
import type { Product, Category } from '../types'

interface ProductListResult {
  items: Product[]
  total: number
  pages: number
}

export type SortBy = 'random' | 'newest' | 'price_asc' | 'price_desc' | 'popular'

export const useProductStore = defineStore('products', () => {
  const config = useRuntimeConfig()
  const API    = config.public.apiBase

  // ── List state ─────────────────────────────────────────────────────────────
  const items       = ref<Product[]>([])
  const total       = ref(0)
  const pages       = ref(0)
  const listPending = ref(false)
  const listError   = ref<string | null>(null)

  // ── Filters ────────────────────────────────────────────────────────────────
  const search     = ref('')
  const categoryId = ref('')
  const page       = ref(1)
  const sortBy     = ref<SortBy>('random')

  // ── Categories (fetched once, cached) ─────────────────────────────────────
  const categories        = ref<Category[]>([])
  const categoriesFetched = ref(false)

  // ── Detail state ───────────────────────────────────────────────────────────
  const currentProduct = ref<Product | null>(null)
  const detailPending  = ref(false)
  const detailError    = ref<string | null>(null)

  // ── Related state ──────────────────────────────────────────────────────────
  const relatedItems   = ref<Product[]>([])
  const relatedPending = ref(false)

  // ── Computed ───────────────────────────────────────────────────────────────
  const activeCategory = computed(() =>
    categories.value.find(c => c.id === categoryId.value) ?? null
  )

  // ── AbortController — cancels in-flight list requests ─────────────────────
  let listAbort: AbortController | null = null

  // ── Debounce timer for search ──────────────────────────────────────────────
  let searchTimer: ReturnType<typeof setTimeout> | null = null

  // ── Actions ────────────────────────────────────────────────────────────────

  /**
   * Fetch paginated product list.
   * Cancels any in-flight request before starting a new one.
   */
  async function fetchProducts(): Promise<void> {
    // Cancel previous in-flight request
    listAbort?.abort()
    listAbort = new AbortController()

    listPending.value = true
    listError.value   = null

    try {
      const res = await $fetch<ProductListResult>(`${API}/products`, {
        signal: listAbort.signal,
        params: {
          search:   search.value    || undefined,
          category: categoryId.value || undefined,
          sort:     sortBy.value,
          page:     page.value,
          limit:    12,
        },
      })
      items.value = res.items
      total.value = res.total
      pages.value = res.pages
      if (sortBy.value === 'random') {
        items.value = [...items.value].sort(() => Math.random() - 0.5)
      }
    } catch (e: any) {
      // Ignore abort errors — they're intentional
      if (e?.name === 'AbortError' || e?.cause?.name === 'AbortError') return
      listError.value = e?.data?.message ?? e?.message ?? 'Failed to load products'
    } finally {
      listPending.value = false
    }
  }

  /**
   * Debounced version — use for search input changes.
   * Waits 350ms after last call before firing.
   */
  function fetchProductsDebounced(delay = 350): void {
    if (searchTimer) clearTimeout(searchTimer)
    searchTimer = setTimeout(() => {
      page.value = 1
      fetchProducts()
    }, delay)
  }

  /**
   * Fetch categories once — subsequent calls are no-ops.
   */
  async function fetchCategories(): Promise<void> {
    if (categoriesFetched.value) return
    try {
      categories.value    = await $fetch<Category[]>(`${API}/products/categories/all`)
      categoriesFetched.value = true
    } catch {
      // Non-critical — sidebar stays empty
    }
  }

  /**
   * Fetch a single product by id.
   */
  async function fetchProduct(id: string): Promise<void> {
    detailPending.value  = true
    detailError.value    = null
    currentProduct.value = null
    try {
      currentProduct.value = await $fetch<Product>(`${API}/products/${id}`)
    } catch (e: any) {
      detailError.value = e?.data?.message ?? e?.message ?? 'Product not found'
    } finally {
      detailPending.value = false
    }
  }

  /**
   * Fetch related products in the same category.
   * Run in parallel with fetchProduct using Promise.all in [id].vue.
   */
  async function fetchRelated(categoryIdParam: string, excludeId: string): Promise<void> {
    relatedPending.value = true
    relatedItems.value   = []
    try {
      const res = await $fetch<ProductListResult>(`${API}/products`, {
        params: { category: categoryIdParam, exclude: excludeId, limit: 4 },
      })
      relatedItems.value = res.items
    } catch {
      // Non-critical
    } finally {
      relatedPending.value = false
    }
  }

  function resetList(): void {
    listAbort?.abort()
    if (searchTimer) clearTimeout(searchTimer)
    items.value      = []
    total.value      = 0
    pages.value      = 0
    search.value     = ''
    categoryId.value = ''
    page.value       = 1
    sortBy.value     = 'newest'
    listError.value  = null
  }

  function resetDetail(): void {
    currentProduct.value = null
    relatedItems.value   = []
    detailError.value    = null
  }

  return {
    // list
    items, total, pages, listPending, listError,
    // filters
    search, categoryId, page, sortBy,
    // categories
    categories, activeCategory,
    // detail
    currentProduct, detailPending, detailError,
    // related
    relatedItems, relatedPending,
    // actions
    fetchProducts, fetchProductsDebounced,
    fetchCategories, fetchProduct, fetchRelated,
    resetList, resetDetail,
  }
})