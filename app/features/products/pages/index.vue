<template>
  <div class="products-page">

    <QuickAddModal :product="quickProduct" @close="closeQuickAdd" @add="onQuickAdd" />

    <!-- Mobile filter sheet -->
    <Transition name="sheet-fade">
      <MobileFilterSheet
        v-if="filterSheetOpen"
        :categories="productStore.categories"
        :category-id="productStore.categoryId"
        :sort-by="productStore.sortBy"
        :total="productStore.total"
        @close="filterSheetOpen = false"
        @apply="onMobileFilterApply"
      />
    </Transition>

    <!-- Breadcrumb -->
    <div class="breadcrumb-bar">
      <div class="bc-inner">
        <NuxtLink to="/">{{ $t('footer.home') }}</NuxtLink>
        <span class="bc-sep">›</span>
        <span>{{ $t('footer.products') }}</span>
      </div>
    </div>

    <div class="page-container">

      <!-- Sidebar (desktop only) -->
      <aside class="sidebar">
        <div class="sidebar-card">
          <h3 class="sidebar-title">{{ $t('header.categories') }}</h3>
          <CategorySidebar
            :categories="productStore.categories"
            :category-id="productStore.categoryId"
            @select="selectCategory"
          />
        </div>
      </aside>

      <!-- Main -->
      <div class="main-col">

        <!-- Desktop toolbar -->
        <div class="toolbar">
          <div class="search-wrap">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="search-icon">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input
              v-model="productStore.search"
              class="search-input"
              :placeholder="$t('header.searchPlaceholder')"
              @input="productStore.fetchProductsDebounced()"
            />
            <button v-if="productStore.search" class="search-clear" @click="clearSearch">×</button>
          </div>
          <div class="toolbar-right">
            <span v-if="productStore.total" class="result-count">
              {{ productStore.total }} {{ $t('cart.itemCount') }}
            </span>
            <select v-model="productStore.sortBy" class="sort-select desktop-only" @change="onSortChange">
              <option v-for="o in sortOptions" :key="o.value" :value="o.value">{{ o.label }}</option>
            </select>
            <button class="shuffle-btn desktop-only" :class="{ spinning: isShuffling }" @click="shuffleProducts">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" width="16" height="16">
                <polyline points="16 3 21 3 21 8"/>
                <line x1="4" y1="20" x2="21" y2="3"/>
                <polyline points="21 16 21 21 16 21"/>
                <line x1="15" y1="15" x2="21" y2="21"/>
              </svg>
              <span class="shuffle-label">{{ locale === 'tk' ? 'Tötänleýin' : 'Случайно' }}</span>
            </button>

            <!-- Mobile: Filter & Sort button -->
            <button class="mobile-filter-btn mobile-only" @click="filterSheetOpen = true">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
                <line x1="4" y1="6"  x2="20" y2="6"/>
                <line x1="8" y1="12" x2="20" y2="12"/>
                <line x1="12" y1="18" x2="20" y2="18"/>
              </svg>
              {{ locale === 'tk' ? 'Süzgüç' : 'Фильтр' }}
              <span v-if="activeFilterCount > 0" class="filter-badge">{{ activeFilterCount }}</span>
            </button>
          </div>
        </div>

        <!-- Mobile: active filter chips + category strip -->
        <div class="mobile-filter-bar mobile-only">
          <!-- Active category chip -->
          <button
            :class="['chip', { 'chip--all': !productStore.categoryId, 'chip--active': !!productStore.categoryId }]"
            @click="!productStore.categoryId ? (filterSheetOpen = true) : selectCategory('')"
          >
            <svg v-if="!productStore.categoryId" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
              <rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/>
            </svg>
            <span>
              {{ productStore.activeCategory
                ? (locale === 'tk' ? productStore.activeCategory.nameTk : productStore.activeCategory.nameRu)
                : (locale === 'tk' ? 'Hemmesi' : 'Все') }}
            </span>
            <svg v-if="productStore.categoryId" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>

          <!-- Sort chip -->
          <button class="chip chip--sort" @click="filterSheetOpen = true">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
              <path d="M3 6h18M7 12h10M11 18h2"/>
            </svg>
            <span>{{ activeSortLabel }}</span>
          </button>

          <!-- Shuffle chip -->
          <button class="chip chip--shuffle" :class="{ spinning: isShuffling }" @click="shuffleProducts">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
              <polyline points="16 3 21 3 21 8"/>
              <line x1="4" y1="20" x2="21" y2="3"/>
              <polyline points="21 16 21 21 16 21"/>
            </svg>
          </button>
        </div>

        <!-- Active filter chips (desktop) -->
        <div v-if="productStore.activeCategory" class="active-filters desktop-only">
          <button
            v-if="productStore.activeParentCategory"
            class="filter-chip parent-chip"
            @click="selectCategory(productStore.activeParentCategory!.id)"
          >
            {{ locale === 'tk'
              ? productStore.activeParentCategory.nameTk
              : productStore.activeParentCategory.nameRu }}
            <span class="chip-sep">›</span>
          </button>
          <div class="filter-chip active-chip">
            <span>{{ locale === 'tk'
              ? productStore.activeCategory.nameTk
              : productStore.activeCategory.nameRu }}</span>
            <button class="chip-close" @click="selectCategory('')">×</button>
          </div>
        </div>

        <!-- Skeleton -->
        <div v-if="productStore.listPending" class="skeleton-grid">
          <div v-for="i in 8" :key="i" class="skeleton-card">
            <div class="sk-img" />
            <div class="sk-body">
              <div class="sk-line short" />
              <div class="sk-line" />
              <div class="sk-line medium" />
            </div>
          </div>
        </div>

        <!-- Empty -->
        <div v-else-if="!productStore.items.length" class="empty-state">
          <div class="empty-icon">🔍</div>
          <h3>{{ $t('common.noResults') }}</h3>
          <p>{{ locale === 'tk' ? 'Başga sözler bilen gözläp görüň' : 'Попробуйте другой запрос или сбросьте фильтры' }}</p>
          <button class="reset-btn" @click="resetFilters">{{ $t('common.resetFilters') }}</button>
        </div>

        <!-- Grid -->
        <div v-else class="products-grid">
          <ProductCard
            v-for="p in productStore.items"
            :key="p.id"
            :product="p"
            :is-added="addedId === p.id"
            @cart-click="handleCartClick"
          />
        </div>

        <!-- Pagination -->
        <div v-if="productStore.pages > 1" class="pagination">
          <button :disabled="productStore.page === 1" class="pg-btn pg-arrow" @click="changePage(productStore.page - 1)">‹</button>
          <button
            v-for="n in productStore.pages"
            :key="n"
            :class="['pg-btn', { active: n === productStore.page }]"
            @click="changePage(n)"
          >{{ n }}</button>
          <button :disabled="productStore.page === productStore.pages" class="pg-btn pg-arrow" @click="changePage(productStore.page + 1)">›</button>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { useI18n }              from 'vue-i18n'
import { useProductStore }      from '../stores/product.store'
import { useProductCatalog }    from '../composables/useProductCatalog'
import ProductCard              from '../components/ProductCard.vue'
import QuickAddModal            from '../components/QuickAddModal.vue'
import CategorySidebar          from '../components/CategorySidebar.vue'
import MobileFilterSheet        from '../components/MobileFilterSheet.vue'

definePageMeta({ layout: 'default' })

const { locale, t } = useI18n()
const productStore  = useProductStore()
const route         = useRoute()

const {
  quickProduct, addedId, sortOptions,
  handleCartClick, onQuickAdd, closeQuickAdd,
} = useProductCatalog()

// ── Filter sheet state ──
const filterSheetOpen = ref(false)

const activeFilterCount = computed(() => {
  let count = 0
  if (productStore.categoryId) count++
  if (productStore.sortBy !== 'random') count++
  return count
})

const activeSortLabel = computed(() => {
  const map: Record<string, { tk: string; ru: string }> = {
    random:     { tk: 'Tötänleýin',      ru: 'Случайно'    },
    newest:     { tk: 'Täzeler',          ru: 'Новинки'     },
    popular:    { tk: 'Meşhurlar',        ru: 'Популярные'  },
    price_asc:  { tk: 'Bahasy: az→köp',  ru: 'Цена ↑'      },
    price_desc: { tk: 'Bahasy: köp→az',  ru: 'Цена ↓'      },
  }
  const entry = map[productStore.sortBy]
  return entry ? (locale.value === 'tk' ? entry.tk : entry.ru) : ''
})

function onMobileFilterApply(payload: { categoryId: string; sortBy: string }) {
  productStore.categoryId = payload.categoryId
  productStore.sortBy     = payload.sortBy as any
  productStore.page       = 1
  productStore.fetchProducts()
}

// ── Sync URL → store on mount ──
productStore.search     = (route.query.search   as string) ?? ''
productStore.categoryId = (route.query.category as string) ?? ''

// ── Initial load ──
await Promise.all([
  productStore.hasLoaded ? Promise.resolve() : productStore.fetchProducts(),
  productStore.fetchCategories(),
])

// ── React to URL search param ──
watch(() => route.query.search, (val) => {
  productStore.search = (val as string) ?? ''
  productStore.page   = 1
  productStore.fetchProducts()
})

// ── Page actions ──
function selectCategory(id: string): void {
  productStore.categoryId = id
  productStore.page       = 1
  productStore.fetchProducts()
}

function onSortChange(): void {
  productStore.page = 1
  productStore.fetchProducts()
}

function changePage(n: number): void {
  productStore.page = n
  productStore.fetchProducts()
}

function clearSearch(): void {
  productStore.search = ''
  productStore.page   = 1
  productStore.fetchProducts()
}

function resetFilters(): void {
  productStore.search     = ''
  productStore.categoryId = ''
  productStore.page       = 1
  productStore.fetchProducts()
}

const isShuffling = ref(false)

async function shuffleProducts(): Promise<void> {
  isShuffling.value   = true
  productStore.sortBy = 'random'
  productStore.page   = 1
  await productStore.fetchProducts()
  setTimeout(() => { isShuffling.value = false }, 600)
}

useHead({ title: computed(() => `${t('pages.products.title')} – SilkShop`) })
</script>

<style scoped>
.products-page { min-height: 80vh; background: var(--surface); }

/* ── Helpers ── */
.desktop-only { display: flex; }
.mobile-only  { display: none; }

@media (max-width: 768px) {
  .desktop-only { display: none !important; }
  .mobile-only  { display: flex !important; }
}

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

/* Toolbar */
.toolbar { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-bottom: 14px; flex-wrap: wrap; }
.search-wrap  { position: relative; flex: 1; min-width: 200px; }
.search-icon  { position: absolute; left: 11px; top: 50%; transform: translateY(-50%); width: 15px; height: 15px; color: var(--subtle); pointer-events: none; }
.search-input { width: 100%; height: 42px; border: 1.5px solid var(--border); border-radius: var(--radius-md); background: var(--white); padding: 0 36px; font-size: 13px; font-family: var(--font-body); color: var(--dark); outline: none; box-sizing: border-box; transition: border-color .15s; }
.search-input:focus { border-color: var(--gold); }
.search-clear { position: absolute; right: 10px; top: 50%; transform: translateY(-50%); background: none; border: none; cursor: pointer; color: var(--subtle); font-size: 18px; line-height: 1; padding: 0; }
.toolbar-right { display: flex; align-items: center; gap: 10px; }
.result-count { font-size: 13px; color: var(--subtle); white-space: nowrap; font-family: var(--font-body); }
.sort-select  { height: 42px; border: 1.5px solid var(--border); border-radius: var(--radius-md); background: var(--white); padding: 0 12px; font-size: 13px; font-family: var(--font-body); color: var(--dark); outline: none; cursor: pointer; }

/* Mobile filter button */
.mobile-filter-btn {
  display: inline-flex; align-items: center; gap: 7px;
  height: 40px; padding: 0 16px; border-radius: var(--radius-md);
  border: 1.5px solid var(--border); background: var(--white);
  color: var(--dark); font-size: 13px; font-weight: 700;
  cursor: pointer; font-family: var(--font-body);
  transition: all .15s; position: relative; flex-shrink: 0;
}
.mobile-filter-btn:active { border-color: var(--gold); color: var(--gold); }
.filter-badge {
  position: absolute; top: -6px; right: -6px;
  width: 18px; height: 18px; border-radius: 50%;
  background: #E8A020; color: white;
  font-size: 10px; font-weight: 800;
  display: flex; align-items: center; justify-content: center;
  border: 2px solid var(--surface);
}

/* ── Mobile filter chips bar ── */
.mobile-filter-bar {
  display: flex; align-items: center; gap: 8px;
  overflow-x: auto; scrollbar-width: none;
  padding-bottom: 12px; margin-bottom: 4px;
  flex-wrap: nowrap;
}
.mobile-filter-bar::-webkit-scrollbar { display: none; }

.chip {
  display: inline-flex; align-items: center; gap: 6px;
  height: 34px; padding: 0 13px;
  border-radius: 50px; border: 1.5px solid var(--border);
  background: var(--white); color: var(--dark);
  font-size: 12px; font-weight: 700;
  cursor: pointer; white-space: nowrap;
  font-family: var(--font-body); flex-shrink: 0;
  transition: all .15s;
  -webkit-tap-highlight-color: transparent;
}
.chip:active { border-color: var(--gold); }
.chip--all { border-color: var(--border-light); color: var(--subtle); }
.chip--active {
  background: rgba(232,160,32,.1);
  border-color: rgba(232,160,32,.4);
  color: var(--gold);
}
.chip--sort {
  border-style: dashed;
  color: var(--subtle);
}
.chip--shuffle {
  width: 34px; height: 34px; padding: 0;
  display: flex; align-items: center; justify-content: center;
  border-style: dashed;
}
.chip--shuffle svg { transition: transform .6s ease; }
.chip--shuffle.spinning svg { transform: rotate(360deg); }

/* Active filters (desktop) */
.active-filters { display: flex; align-items: center; gap: 6px; margin-bottom: 12px; flex-wrap: wrap; }
.filter-chip { display: inline-flex; align-items: center; gap: 5px; height: 30px; padding: 0 12px; border-radius: var(--radius-pill); font-size: 12px; font-weight: 700; font-family: var(--font-body); transition: all .15s; }
.parent-chip { background: var(--surface); border: 1.5px solid var(--border-light); color: var(--muted); cursor: pointer; }
.parent-chip:hover { border-color: var(--gold); color: var(--gold); background: rgba(232,160,32,.06); }
.chip-sep { font-size: 14px; opacity: .5; }
.active-chip { background: rgba(232,160,32,.12); border: 1.5px solid rgba(232,160,32,.3); color: var(--gold); cursor: default; }
.chip-close { background: none; border: none; cursor: pointer; color: var(--gold); font-size: 16px; line-height: 1; padding: 0; margin-left: 2px; opacity: .7; transition: opacity .15s; }
.chip-close:hover { opacity: 1; }

/* Shuffle */
.shuffle-btn { display: inline-flex; align-items: center; gap: 7px; height: 42px; padding: 0 16px; border-radius: var(--radius-md); border: 1.5px solid var(--border); background: var(--white); color: var(--dark); font-size: 13px; font-weight: 700; font-family: var(--font-body); cursor: pointer; transition: all .2s; white-space: nowrap; flex-shrink: 0; }
.shuffle-btn:hover { border-color: var(--gold); color: var(--gold); background: rgba(232,160,32,.06); }
.shuffle-btn svg { transition: transform .6s ease; }
.shuffle-btn.spinning svg { transform: rotate(360deg); }
.shuffle-label { display: none; }
@media (min-width: 640px) { .shuffle-label { display: inline; } }

/* Skeleton */
.skeleton-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 18px; }
.skeleton-card { background: var(--white); border-radius: var(--radius-lg); border: 1.5px solid var(--border-light); overflow: hidden; }
.sk-img { height: 180px; background: linear-gradient(90deg, var(--surface) 25%, var(--border-light) 50%, var(--surface) 75%); background-size: 200% 100%; animation: shimmer 1.4s infinite; }
.sk-body { padding: 12px 14px; display: flex; flex-direction: column; gap: 8px; }
.sk-line { height: 10px; background: linear-gradient(90deg, var(--surface) 25%, var(--border-light) 50%, var(--surface) 75%); background-size: 200% 100%; animation: shimmer 1.4s infinite; border-radius: 4px; }
.sk-line.short  { width: 40%; }
.sk-line.medium { width: 60%; }
@keyframes shimmer { to { background-position: -200% 0; } }

/* Empty */
.empty-state { display: flex; flex-direction: column; align-items: center; gap: 12px; padding: 80px 20px; text-align: center; }
.empty-icon { font-size: 52px; }
.empty-state h3 { font-family: var(--font-display); font-size: 20px; font-weight: 700; color: var(--dark); }
.empty-state p  { font-size: 14px; color: var(--subtle); font-family: var(--font-body); }
.reset-btn { padding: 10px 24px; border-radius: var(--radius-md); border: 1.5px solid var(--gold); background: none; color: var(--gold); font-family: var(--font-body); font-weight: 700; cursor: pointer; transition: all .15s; }
.reset-btn:hover { background: rgba(232,160,32,.08); }

/* Grid */
.products-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(210px, 1fr)); gap: 18px; }

/* Pagination */
.pagination { display: flex; gap: 6px; justify-content: center; margin-top: 36px; flex-wrap: wrap; }
.pg-btn { min-width: 38px; height: 38px; padding: 0 10px; border-radius: var(--radius-md); border: 1.5px solid var(--border); background: var(--white); font-size: 13px; font-weight: 700; color: var(--dark); cursor: pointer; font-family: var(--font-body); transition: all .12s; }
.pg-btn:hover:not(:disabled) { border-color: var(--gold); color: var(--gold); }
.pg-btn.active { background: var(--gold); border-color: var(--gold); color: var(--white); }
.pg-btn:disabled { opacity: .4; cursor: not-allowed; }
.pg-arrow { font-size: 18px; }

/* Sheet fade transition */
.sheet-fade-enter-active { transition: opacity 0.2s ease; }
.sheet-fade-leave-active  { transition: opacity 0.2s ease; }
.sheet-fade-enter-from, .sheet-fade-leave-to { opacity: 0; }

/* Responsive */
@media (max-width: 768px) {
  .page-container { grid-template-columns: 1fr; padding: 16px 16px 80px; }
  .sidebar { display: none; }
  .toolbar { margin-bottom: 0; }
  .products-grid { grid-template-columns: repeat(2, 1fr); gap: 12px; }
}
@media (max-width: 380px) {
  .products-grid { grid-template-columns: repeat(2, 1fr); gap: 10px; }
}
</style>