<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'

definePageMeta({ layout: 'default' })

import WishlistBtn   from '~/features/wishlist/components/WishlistBtn.vue'
import QuickAddModal from '../components/QuickAddModal.vue'
import type { Product, ProductOption, SelectedOptions } from '../types/product'
import type { QuickAddProduct } from '../components/QuickAddModal.vue'

const { locale, t } = useI18n()
const cartStore = useCartStore()

const route  = useRoute()
const config = useRuntimeConfig()
const API    = config.public.apiBase

// ── Filters ───────────────────────────────────────────────────────────────────
const search     = ref((route.query.search as string) ?? '')
const categoryId = ref((route.query.category as string) ?? '')
const page       = ref(1)
const sortBy     = ref<'newest' | 'price_asc' | 'price_desc' | 'popular'>('newest')

watch(() => route.query.search, (val) => {
  search.value = (val as string) ?? ''
  page.value   = 1
  refresh()
})

// ── Fetch ─────────────────────────────────────────────────────────────────────
const { data, pending, refresh } = await useAsyncData(
  'products-list',
  () => $fetch<{ items: Product[]; total: number; pages: number }>(`${API}/products`, {
    params: { search: search.value || undefined, page: page.value, limit: 12 },
  }),
  { watch: [page] }
)

interface Category { id: string; nameTk: string; nameRu: string }
const { data: categories } = await useAsyncData(
  'prod-cats',
  () => $fetch<Category[]>(`${API}/products/categories/all`)
)

// ── Sorted / filtered ─────────────────────────────────────────────────────────
const products = computed<Product[]>(() => {
  let items = data.value?.items ?? []
  if (categoryId.value) items = items.filter(p => p.category?.id === categoryId.value)
  if (sortBy.value === 'price_asc')  items = [...items].sort((a, b) => Number(a.price) - Number(b.price))
  if (sortBy.value === 'price_desc') items = [...items].sort((a, b) => Number(b.price) - Number(a.price))
  if (sortBy.value === 'popular')    items = [...items].sort((a, b) => b.sold - a.sold)
  return items
})

let searchTimer: ReturnType<typeof setTimeout>
watch(search, () => {
  clearTimeout(searchTimer)
  searchTimer = setTimeout(() => { page.value = 1; refresh() }, 400)
})

// ── Quick-add modal ───────────────────────────────────────────────────────────
const quickProduct = ref<QuickAddProduct | null>(null)
const addedId      = ref<string | null>(null)

function handleCartClick(p: Product) {
  if (p.options?.length) {
    quickProduct.value = {
      id: p.id, nameTk: p.nameTk, nameRu: p.nameRu,
      image: p.image, imageUrl: p.imageUrls?.[0] ?? p.imageUrl,
      price: Number(p.price), weightG: p.weightG ?? null,
      stock: p.stock, options: p.options as ProductOption[], category: p.category,
    }
  } else {
    doAddToCart(p, {})
  }
}

function doAddToCart(p: Product, options: SelectedOptions) {
  cartStore.addItem({
    id:       p.id,
    name:     { tk: p.nameTk, ru: p.nameRu },
    image:    p.imageUrls?.[0] ?? p.imageUrl ?? p.image,
    price:    Number(p.price) * (1 + (p.markup ?? 50) / 100),
    quantity: 1,
    seller:   'SilkShop',
    inStock:  p.stock > 0,
    options:  Object.keys(options).length ? { ...options } : undefined,
  })
  addedId.value = p.id
  setTimeout(() => { addedId.value = null }, 1500)
}

function onQuickAdd(productId: string, options: SelectedOptions) {
  const p = products.value.find(x => x.id === productId)
  if (p) doAddToCart(p, options)
}

function fmt(n: number) { return Number(n).toFixed(2) }
function clientPrice(price: number, markup: number = 50) { return Number(price) * (1 + (markup ?? 50) / 100) }

// First image helper
function firstImage(p: Product): string | null {
  return p.imageUrls?.[0] ?? p.imageUrl ?? null
}

const sortOptions = computed(() => [
  { value: 'newest',     label: t('products.sort.newest') },
  { value: 'popular',    label: t('products.sort.popular') },
  { value: 'price_asc',  label: t('products.sort.priceAsc') },
  { value: 'price_desc', label: t('products.sort.priceDesc') },
])

useHead({ title: computed(() => `${t('pages.products.title')} – SilkShop`) })
</script>

<template>
  <div class="products-page">

    <QuickAddModal :product="quickProduct" @close="quickProduct = null" @add="onQuickAdd" />

    <!-- Breadcrumb -->
    <div class="breadcrumb-bar">
      <div class="bc-inner">
        <NuxtLink to="/">{{ $t('footer.home') }}</NuxtLink>
        <span class="bc-sep">›</span>
        <span>{{ $t('footer.products') }}</span>
      </div>
    </div>

    <div class="page-container">

      <!-- Sidebar -->
      <aside class="sidebar">
        <div class="sidebar-card">
          <h3 class="sidebar-title">{{ $t('header.categories') }}</h3>
          <div class="cat-list">
            <button :class="['cat-btn', { active: !categoryId }]" @click="categoryId = ''; page = 1">
              <span class="cat-icon">🏠</span>
              {{ $t('common.allCategories') }}
            </button>
            <button
              v-for="c in categories" :key="c.id"
              :class="['cat-btn', { active: categoryId === c.id }]"
              @click="categoryId = c.id; page = 1"
            >
              {{ locale === 'tk' ? c.nameTk : c.nameRu }}
            </button>
          </div>
        </div>
      </aside>

      <!-- Main content -->
      <div class="main-col">

        <!-- Toolbar -->
        <div class="toolbar">
          <div class="search-wrap">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="search-icon">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input v-model="search" class="search-input" :placeholder="$t('header.searchPlaceholder')" />
            <button v-if="search" class="search-clear" @click="search = ''">×</button>
          </div>
          <div class="toolbar-right">
            <span v-if="data?.total" class="result-count">{{ data.total }} {{ $t('cart.itemCount') }}</span>
            <select v-model="sortBy" class="sort-select">
              <option v-for="o in sortOptions" :key="o.value" :value="o.value">{{ o.label }}</option>
            </select>
          </div>
        </div>

        <!-- Active filter chip -->
        <div v-if="categoryId" class="active-filter">
          <span>{{ locale === 'tk' ? categories?.find(c => c.id === categoryId)?.nameTk : categories?.find(c => c.id === categoryId)?.nameRu }}</span>
          <button @click="categoryId = ''">×</button>
        </div>

        <!-- Skeleton -->
        <div v-if="pending" class="skeleton-grid">
          <div v-for="i in 8" :key="i" class="skeleton-card">
            <div class="sk-img"></div>
            <div class="sk-body">
              <div class="sk-line short"></div>
              <div class="sk-line"></div>
              <div class="sk-line medium"></div>
            </div>
          </div>
        </div>

        <!-- Empty state -->
        <div v-else-if="!products.length" class="empty-state">
          <div class="empty-icon">🔍</div>
          <h3>{{ $t('common.noResults') }}</h3>
          <p>{{ locale === 'tk' ? 'Başga sözler bilen gözläp görüň' : 'Попробуйте другой запрос или сбросьте фильтры' }}</p>
          <button class="reset-btn" @click="search = ''; categoryId = ''; refresh()">
            {{ $t('common.resetFilters') }}
          </button>
        </div>

        <!-- Products grid -->
        <div v-else class="products-grid">
          <div v-for="p in products" :key="p.id" class="prod-card">

            <!-- Image area -->
            <NuxtLink :to="`/products/${p.id}`" class="prod-img-wrap">
              <img
                v-if="firstImage(p)"
                :src="firstImage(p)!"
                :alt="locale === 'tk' ? p.nameTk : p.nameRu"
                class="prod-img"
              />
              <span v-else class="prod-emoji">{{ p.image }}</span>

              <!-- Multi-image indicator -->
              <span v-if="(p.imageUrls?.length ?? 0) > 1" class="multi-img-badge">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="10" height="10"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                {{ p.imageUrls!.length }}
              </span>

              <!-- Out of stock -->
              <span v-if="p.stock === 0" class="out-badge">
                {{ $t('product.outOfStock') }}
              </span>

              <!-- Options badge -->
              <span v-if="p.options?.length" class="opts-badge">
                {{ $t('product.options') }}
              </span>

              <!-- Wishlist overlay -->
              <WishlistBtn
                :item="{
                  id: p.id, nameTk: p.nameTk, nameRu: p.nameRu,
                  image: p.image, imageUrl: firstImage(p),
                  price: Number(p.price), weightG: p.weightG,
                  stock: p.stock, category: p.category,
                }"
                size="sm"
                class="wish-overlay"
              />
            </NuxtLink>

            <!-- Card body -->
            <div class="prod-body">
              <div class="prod-cat">{{ locale === 'tk' ? p.category?.nameTk : p.category?.nameRu }}</div>
              <NuxtLink :to="`/products/${p.id}`" class="prod-name">
                {{ locale === 'tk' ? p.nameTk : p.nameRu }}
              </NuxtLink>
              <div class="prod-footer">
                <div class="prod-price-wrap">
                  <div class="prod-price">${{ fmt(clientPrice(p.price, p.markup)) }}</div>
                  <div v-if="p.weightG" class="prod-weight">{{ p.weightG }}g</div>
                </div>
                <button
                  :class="['cart-btn', { added: addedId === p.id }]"
                  :disabled="p.stock === 0"
                  @click.prevent="handleCartClick(p)"
                  :title="locale === 'tk' ? 'Sebede goş' : 'В корзину'"
                >
                  <span v-if="addedId === p.id">✓</span>
                  <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="14" height="14">
                    <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
                    <line x1="3" y1="6" x2="21" y2="6"/>
                    <path d="M16 10a4 4 0 0 1-8 0"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Pagination -->
        <div v-if="(data?.pages ?? 0) > 1" class="pagination">
          <button :disabled="page === 1" class="pg-btn pg-arrow" @click="page--">‹</button>
          <button
            v-for="n in data!.pages" :key="n"
            :class="['pg-btn', { active: n === page }]"
            @click="page = n"
          >{{ n }}</button>
          <button :disabled="page === data!.pages" class="pg-btn pg-arrow" @click="page++">›</button>
        </div>

      </div>
    </div>
  </div>
</template>

<style scoped>
.products-page { min-height: 80vh; background: var(--surface); }

/* Breadcrumb */
.breadcrumb-bar { background: var(--white); border-bottom: 1px solid var(--border-light); padding: 12px 0; }
.bc-inner { max-width: 1280px; margin: 0 auto; padding: 0 24px; display: flex; align-items: center; gap: 8px; font-size: 13px; color: var(--subtle); font-family: var(--font-body); }
.bc-inner a { color: var(--subtle); text-decoration: none; transition: color .12s; }
.bc-inner a:hover { color: var(--gold); }
.bc-sep { opacity: .4; }

/* Layout */
.page-container { max-width: 1280px; margin: 0 auto; padding: 28px 24px; display: grid; grid-template-columns: 220px 1fr; gap: 28px; }

/* Sidebar */
.sidebar { position: sticky; top: 90px; height: fit-content; }
.sidebar-card { background: var(--white); border-radius: var(--radius-lg); border: 1.5px solid var(--border-light); padding: 20px; box-shadow: var(--shadow-sm); }
.sidebar-title { font-family: var(--font-display); font-size: 15px; font-weight: 700; color: var(--dark); margin-bottom: 14px; }
.cat-list { display: flex; flex-direction: column; gap: 2px; }
.cat-btn { width: 100%; text-align: left; padding: 9px 12px; border-radius: var(--radius-md); border: none; background: transparent; font-size: 13px; font-weight: 600; color: var(--muted); cursor: pointer; font-family: var(--font-body); transition: all .12s; display: flex; align-items: center; gap: 8px; }
.cat-btn:hover  { background: var(--surface); color: var(--dark); }
.cat-btn.active { background: rgba(232,160,32,.1); color: var(--gold); }
.cat-icon { font-size: 14px; }

/* Toolbar */
.toolbar { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-bottom: 14px; flex-wrap: wrap; }
.search-wrap  { position: relative; flex: 1; min-width: 200px; }
.search-icon  { position: absolute; left: 11px; top: 50%; transform: translateY(-50%); width: 15px; height: 15px; color: var(--subtle); pointer-events: none; }
.search-input { width: 100%; height: 42px; border: 1.5px solid var(--border); border-radius: var(--radius-md); background: var(--white); padding: 0 36px 0 36px; font-size: 13px; font-family: var(--font-body); color: var(--dark); outline: none; box-sizing: border-box; transition: border-color .15s; }
.search-input:focus { border-color: var(--gold); }
.search-clear { position: absolute; right: 10px; top: 50%; transform: translateY(-50%); background: none; border: none; cursor: pointer; color: var(--subtle); font-size: 18px; line-height: 1; padding: 0; }
.toolbar-right { display: flex; align-items: center; gap: 12px; }
.result-count  { font-size: 13px; color: var(--subtle); white-space: nowrap; font-family: var(--font-body); }
.sort-select   { height: 42px; border: 1.5px solid var(--border); border-radius: var(--radius-md); background: var(--white); padding: 0 12px; font-size: 13px; font-family: var(--font-body); color: var(--dark); outline: none; cursor: pointer; }

/* Active filter chip */
.active-filter {
  display: inline-flex; align-items: center; gap: 6px;
  background: rgba(232,160,32,.1); border: 1.5px solid rgba(232,160,32,.3);
  border-radius: var(--radius-pill); padding: 4px 10px 4px 14px;
  font-size: 12px; font-weight: 700; color: var(--gold);
  margin-bottom: 14px;
}
.active-filter button { background: none; border: none; cursor: pointer; color: var(--gold); font-size: 16px; line-height: 1; padding: 0; }

/* Skeleton */
.skeleton-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 18px; }
.skeleton-card { background: var(--white); border-radius: var(--radius-lg); border: 1.5px solid var(--border-light); overflow: hidden; }
.sk-img { height: 180px; background: linear-gradient(90deg, var(--surface) 25%, var(--border-light) 50%, var(--surface) 75%); background-size: 200% 100%; animation: shimmer 1.4s infinite; }
.sk-body { padding: 12px 14px; display: flex; flex-direction: column; gap: 8px; }
.sk-line { height: 10px; background: linear-gradient(90deg, var(--surface) 25%, var(--border-light) 50%, var(--surface) 75%); background-size: 200% 100%; animation: shimmer 1.4s infinite; border-radius: 4px; }
.sk-line.short  { width: 40%; }
.sk-line.medium { width: 60%; }
@keyframes shimmer { to { background-position: -200% 0; } }

/* Empty state */
.empty-state { display: flex; flex-direction: column; align-items: center; gap: 12px; padding: 80px 20px; text-align: center; }
.empty-icon { font-size: 52px; }
.empty-state h3 { font-family: var(--font-display); font-size: 20px; font-weight: 700; color: var(--dark); }
.empty-state p  { font-size: 14px; color: var(--subtle); font-family: var(--font-body); }
.reset-btn { padding: 10px 24px; border-radius: var(--radius-md); border: 1.5px solid var(--gold); background: none; color: var(--gold); font-family: var(--font-body); font-weight: 700; cursor: pointer; transition: all .15s; }
.reset-btn:hover { background: rgba(232,160,32,.08); }

/* Product grid */
.products-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(210px, 1fr)); gap: 18px; }

/* Product card */
.prod-card {
  background: var(--white); border-radius: var(--radius-lg);
  border: 1.5px solid var(--border-light); overflow: hidden;
  box-shadow: var(--shadow-sm); transition: all .2s;
}
.prod-card:hover { box-shadow: 0 12px 32px rgba(0,0,0,.1); transform: translateY(-4px); border-color: rgba(232,160,32,.25); }

.prod-img-wrap { display: block; width: 100%; height: 180px; background: var(--surface); position: relative; overflow: hidden; text-decoration: none; }
.prod-img { width: 100%; height: 100%; object-fit: cover; transition: transform .35s; }
.prod-card:hover .prod-img { transform: scale(1.06); }
.prod-emoji { font-size: 64px; position: absolute; top: 50%; left: 50%; transform: translate(-50%,-50%); }

/* Badges */
.multi-img-badge {
  position: absolute; bottom: 8px; left: 8px;
  background: rgba(0,0,0,.55); color: white;
  font-size: 10px; font-weight: 700;
  padding: 3px 7px; border-radius: var(--radius-pill);
  display: flex; align-items: center; gap: 3px;
  backdrop-filter: blur(4px);
}
.out-badge {
  position: absolute; top: 8px; left: 8px;
  background: rgba(0,0,0,.65); color: #fff;
  font-size: 10px; font-weight: 700; padding: 2px 8px;
  border-radius: var(--radius-pill); font-family: var(--font-body);
}
.opts-badge {
  position: absolute; bottom: 8px; right: 8px;
  background: rgba(232,160,32,.9); color: white;
  font-size: 10px; font-weight: 700;
  padding: 2px 8px; border-radius: var(--radius-pill);
  font-family: var(--font-body);
}
.wish-overlay { position: absolute; top: 8px; right: 8px; z-index: 2; }

/* Card body */
.prod-body { padding: 12px 14px; }
.prod-cat  { font-size: 10px; color: var(--subtle); text-transform: uppercase; letter-spacing: .05em; margin-bottom: 4px; font-family: var(--font-body); font-weight: 700; }
.prod-name {
  display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;
  overflow: hidden; font-size: 13px; font-weight: 700; color: var(--dark);
  text-decoration: none; line-height: 1.4; margin-bottom: 12px; font-family: var(--font-body);
  display: block;
}
.prod-name:hover { color: var(--gold); }

.prod-footer { display: flex; align-items: center; justify-content: space-between; }
.prod-price-wrap { display: flex; flex-direction: column; gap: 1px; }
.prod-price  { font-family: var(--font-display); font-size: 17px; font-weight: 800; color: var(--gold); }
.prod-weight { font-size: 10px; color: var(--subtle); font-family: var(--font-body); }

.cart-btn {
  width: 34px; height: 34px; border-radius: 50%;
  border: none; background: var(--dark); color: white;
  cursor: pointer; transition: all .15s;
  display: flex; align-items: center; justify-content: center;
  font-size: 14px; font-weight: 700;
}
.cart-btn.added  { background: #22C55E; }
.cart-btn:disabled { background: var(--border); cursor: not-allowed; }
.cart-btn:hover:not(:disabled):not(.added) { background: var(--gold); transform: scale(1.1); }

/* Pagination */
.pagination { display: flex; gap: 6px; justify-content: center; margin-top: 36px; flex-wrap: wrap; }
.pg-btn { min-width: 38px; height: 38px; padding: 0 10px; border-radius: var(--radius-md); border: 1.5px solid var(--border); background: var(--white); font-size: 13px; font-weight: 700; color: var(--dark); cursor: pointer; font-family: var(--font-body); transition: all .12s; }
.pg-btn:hover:not(:disabled) { border-color: var(--gold); color: var(--gold); }
.pg-btn.active { background: var(--gold); border-color: var(--gold); color: var(--white); }
.pg-btn:disabled { opacity: .4; cursor: not-allowed; }
.pg-arrow { font-size: 18px; }

/* Responsive */
@media (max-width: 768px) {
  .page-container { grid-template-columns: 1fr; }
  .sidebar { position: static; }
}
@media (max-width: 480px) {
  .products-grid { grid-template-columns: repeat(2, 1fr); }
}
</style>