<template>
  <div class="products-page">

    <QuickAddModal :product="quickProduct" @close="closeQuickAdd" @add="onQuickAdd" />

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
          <CategorySidebar
            :categories="productStore.categories"
            :category-id="productStore.categoryId"
            @select="selectCategory"
          />
        </div>
      </aside>

      <!-- Main -->
      <div class="main-col">

        <!-- Toolbar -->
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
            <select v-model="productStore.sortBy" class="sort-select" @change="onSortChange">
              <option v-for="o in sortOptions" :key="o.value" :value="o.value">{{ o.label }}</option>
            </select>
            <button class="shuffle-btn" :class="{ spinning: isShuffling }" :title="locale === 'tk' ? 'Tötänleýin' : 'Случайно'" @click="shuffleProducts">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" width="16" height="16">
                <polyline points="16 3 21 3 21 8"/>
                <line x1="4" y1="20" x2="21" y2="3"/>
                <polyline points="21 16 21 21 16 21"/>
                <line x1="15" y1="15" x2="21" y2="21"/>
              </svg>
              <span class="shuffle-label">{{ locale === 'tk' ? 'Tötänleýin' : 'Случайно' }}</span>
            </button>
          </div>
        </div>

        <!-- Active filter chips -->
        <div v-if="productStore.activeCategory" class="active-filters">
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
import { watch }                from 'vue'
import { useI18n }              from 'vue-i18n'
import { useProductStore }      from '../stores/product.store'
import { useProductCatalog }    from '../composables/useProductCatalog'
import ProductCard              from '../components/ProductCard.vue'
import QuickAddModal            from '../components/QuickAddModal.vue'
import CategorySidebar          from '../components/CategorySidebar.vue'

definePageMeta({ layout: 'default' })

const { locale, t } = useI18n()
const productStore  = useProductStore()
const route         = useRoute()

const {
  quickProduct, addedId, sortOptions,
  handleCartClick, onQuickAdd, closeQuickAdd,
} = useProductCatalog()

// ── Sync URL → store on mount ──────────────────────────────────────────────
productStore.search     = (route.query.search   as string) ?? ''
productStore.categoryId = (route.query.category as string) ?? ''

// ── Initial load ───────────────────────────────────────────────────────────
await Promise.all([
  productStore.hasLoaded ? Promise.resolve() : productStore.fetchProducts(),
  productStore.fetchCategories(),
])

// ── React to URL search param (from header search) ─────────────────────────
watch(() => route.query.search, (val) => {
  productStore.search = (val as string) ?? ''
  productStore.page   = 1
  productStore.fetchProducts()
})

// ── Page actions ───────────────────────────────────────────────────────────
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
  isShuffling.value       = true
  productStore.sortBy     = 'random'
  productStore.page       = 1
  await productStore.fetchProducts()
  setTimeout(() => { isShuffling.value = false }, 600)
}

useHead({ title: computed(() => `${t('pages.products.title')} – SilkShop`) })
</script>

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

/* Toolbar */
.toolbar { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-bottom: 14px; flex-wrap: wrap; }
.search-wrap  { position: relative; flex: 1; min-width: 200px; }
.search-icon  { position: absolute; left: 11px; top: 50%; transform: translateY(-50%); width: 15px; height: 15px; color: var(--subtle); pointer-events: none; }
.search-input { width: 100%; height: 42px; border: 1.5px solid var(--border); border-radius: var(--radius-md); background: var(--white); padding: 0 36px; font-size: 13px; font-family: var(--font-body); color: var(--dark); outline: none; box-sizing: border-box; transition: border-color .15s; }
.search-input:focus { border-color: var(--gold); }
.search-clear { position: absolute; right: 10px; top: 50%; transform: translateY(-50%); background: none; border: none; cursor: pointer; color: var(--subtle); font-size: 18px; line-height: 1; padding: 0; }
.toolbar-right { display: flex; align-items: center; gap: 12px; }
.result-count  { font-size: 13px; color: var(--subtle); white-space: nowrap; font-family: var(--font-body); }
.sort-select   { height: 42px; border: 1.5px solid var(--border); border-radius: var(--radius-md); background: var(--white); padding: 0 12px; font-size: 13px; font-family: var(--font-body); color: var(--dark); outline: none; cursor: pointer; }
.active-filters { display: flex; align-items: center; gap: 6px; margin-bottom: 12px; flex-wrap: wrap; }

.filter-chip {
  display: inline-flex; align-items: center; gap: 5px;
  height: 30px; padding: 0 12px;
  border-radius: var(--radius-pill);
  font-size: 12px; font-weight: 700;
  font-family: var(--font-body);
  transition: all .15s;
}
.parent-chip {
  background: var(--surface);
  border: 1.5px solid var(--border-light);
  color: var(--muted);
  cursor: pointer;
}
.parent-chip:hover { border-color: var(--gold); color: var(--gold); background: rgba(232,160,32,.06); }
.chip-sep { font-size: 14px; opacity: .5; }
.active-chip {
  background: rgba(232,160,32,.12);
  border: 1.5px solid rgba(232,160,32,.3);
  color: var(--gold);
  cursor: default;
}
.chip-close {
  background: none; border: none; cursor: pointer;
  color: var(--gold); font-size: 16px; line-height: 1;
  padding: 0; margin-left: 2px; opacity: .7;
  transition: opacity .15s;
}
.chip-close:hover { opacity: 1; }
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

.shuffle-btn {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  height: 42px;
  padding: 0 16px;
  border-radius: var(--radius-md);
  border: 1.5px solid var(--border);
  background: var(--white);
  color: var(--dark);
  font-size: 13px;
  font-weight: 700;
  font-family: var(--font-body);
  cursor: pointer;
  transition: all .2s;
  white-space: nowrap;
  flex-shrink: 0;
}

.shuffle-btn:hover {
  border-color: var(--gold);
  color: var(--gold);
  background: rgba(232,160,32,.06);
  box-shadow: 0 4px 12px rgba(232,160,32,.15);
}

.shuffle-btn svg {
  transition: transform .6s ease;
}

.shuffle-btn.spinning svg {
  transform: rotate(360deg);
}

.shuffle-label {
  display: none;
}

@media (min-width: 640px) {
  .shuffle-label { display: inline; }
}

@media (max-width: 768px) { .page-container { grid-template-columns: 1fr; } .sidebar { position: static; } }
@media (max-width: 480px) { .products-grid { grid-template-columns: repeat(2, 1fr); } }
</style>