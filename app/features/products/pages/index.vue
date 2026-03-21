<script setup lang="ts">
definePageMeta({ layout: 'default' })

const lang  = ref<'tk' | 'ru'>('tk')
const cartStore = useCartStore()

onMounted(() => {
  const saved = localStorage.getItem('silkshop_lang')
  if (saved === 'tk' || saved === 'ru') lang.value = saved
})

const route = useRoute()
const API   = 'http://localhost:3001/api/v1'

interface Category { id: string; nameTk: string; nameRu: string }
interface Product {
  id: string; nameTk: string; nameRu: string
  image: string; imageUrl?: string | null
  price: number; weightG?: number | null; sold: number; stock: number
  category: { id: string; nameTk: string; nameRu: string }
}

const search     = ref((route.query.search as string) ?? '')
const categoryId = ref((route.query.category as string) ?? '')
const page       = ref(1)
const sortBy     = ref<'newest' | 'price_asc' | 'price_desc' | 'popular'>('newest')

const { data, pending, refresh } = await useAsyncData(
  'products-list',
  () => $fetch<{ items: Product[]; total: number; pages: number }>(`${API}/products`, {
    params: { search: search.value || undefined, page: page.value, limit: 12 },
  }),
  { watch: [page] }
)

const { data: categories } = await useAsyncData('prod-cats',
  () => $fetch<Category[]>(`${API}/products/categories/all`)
)

const products = computed(() => {
  let items = data.value?.items ?? []
  if (categoryId.value) items = items.filter(p => p.category?.id === categoryId.value)
  if (sortBy.value === 'price_asc')  items = [...items].sort((a,b) => Number(a.price) - Number(b.price))
  if (sortBy.value === 'price_desc') items = [...items].sort((a,b) => Number(b.price) - Number(a.price))
  if (sortBy.value === 'popular')    items = [...items].sort((a,b) => b.sold - a.sold)
  return items
})

let st: ReturnType<typeof setTimeout>
watch(search, () => {
  clearTimeout(st)
  st = setTimeout(() => { page.value = 1; refresh() }, 400)
})

// ── Cart: use store so header badge updates instantly ──────────
const addedId = ref<string | null>(null)
function addToCart(p: Product) {
  cartStore.addItem({
    id:      p.id,
    name:    { tk: p.nameTk, ru: p.nameRu },
    image:   p.imageUrl ?? p.image,
    price:   Number(p.price),
    weightG: p.weightG ?? null,
    quantity: 1,
    seller:  'SilkShop',
    inStock: p.stock > 0,
  })
  addedId.value = p.id
  setTimeout(() => addedId.value = null, 1500)
}

function fmt(n: number) { return Number(n).toFixed(2) }

const sortOptions = computed(() => [
  { value: 'newest',     label: lang.value === 'tk' ? 'Täzeler'              : 'Новинки'        },
  { value: 'popular',    label: lang.value === 'tk' ? 'Meşhurlar'            : 'Популярные'     },
  { value: 'price_asc',  label: lang.value === 'tk' ? 'Bahasy: arzan→gymmat' : 'Цена: по возр.' },
  { value: 'price_desc', label: lang.value === 'tk' ? 'Bahasy: gymmat→arzan' : 'Цена: по убыв.' },
])

useHead({ title: computed(() => lang.value === 'tk' ? 'Harytlar – SilkShop' : 'Товары – SilkShop') })
</script>

<template>
  <div class="products-page">

    <div class="breadcrumb-bar">
      <div class="bc-inner">
        <NuxtLink to="/">{{ lang === 'tk' ? 'Baş sahypa' : 'Главная' }}</NuxtLink>
        <span>›</span>
        <span>{{ lang === 'tk' ? 'Harytlar' : 'Товары' }}</span>
      </div>
    </div>

    <div class="page-container">

      <aside class="sidebar">
        <div class="sidebar-card">
          <h3 class="sidebar-title">{{ lang === 'tk' ? 'Kategoriýalar' : 'Категории' }}</h3>
          <div class="cat-list">
            <button :class="['cat-btn', { active: !categoryId }]" @click="categoryId = ''; page = 1">
              {{ lang === 'tk' ? 'Hemmesi' : 'Все категории' }}
            </button>
            <button
              v-for="c in categories" :key="c.id"
              :class="['cat-btn', { active: categoryId === c.id }]"
              @click="categoryId = c.id; page = 1"
            >{{ lang === 'tk' ? c.nameTk : c.nameRu }}</button>
          </div>
        </div>
      </aside>

      <div class="main-col">

        <div class="toolbar">
          <div class="search-wrap">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="search-icon">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input v-model="search" class="search-input" :placeholder="lang === 'tk' ? 'Haryt gözle...' : 'Поиск товаров...'" />
          </div>
          <div class="toolbar-right">
            <span class="result-count" v-if="data?.total">{{ data.total }} {{ lang === 'tk' ? 'haryt' : 'товаров' }}</span>
            <select v-model="sortBy" class="sort-select">
              <option v-for="o in sortOptions" :key="o.value" :value="o.value">{{ o.label }}</option>
            </select>
          </div>
        </div>

        <div v-if="pending" class="skeleton-grid">
          <div v-for="i in 8" :key="i" class="skeleton-card" />
        </div>

        <div v-else-if="!products.length" class="empty-state">
          <span>🔍</span>
          <p>{{ lang === 'tk' ? 'Haryt tapylmady' : 'Товары не найдены' }}</p>
          <button @click="search = ''; categoryId = ''; refresh()">{{ lang === 'tk' ? 'Täzele' : 'Сбросить фильтры' }}</button>
        </div>

        <div v-else class="products-grid">
          <div v-for="p in products" :key="p.id" class="prod-card">
            <NuxtLink :to="`/products/${p.id}`" class="prod-img-wrap">
              <img v-if="p.imageUrl" :src="p.imageUrl" :alt="lang === 'tk' ? p.nameTk : p.nameRu" class="prod-img" />
              <span v-else class="prod-emoji">{{ p.image }}</span>
              <span v-if="p.stock === 0" class="out-badge">{{ lang === 'tk' ? 'Ýok' : 'Нет в наличии' }}</span>
            </NuxtLink>
            <div class="prod-body">
              <div class="prod-cat">{{ lang === 'tk' ? p.category?.nameTk : p.category?.nameRu }}</div>
              <NuxtLink :to="`/products/${p.id}`" class="prod-name">{{ lang === 'tk' ? p.nameTk : p.nameRu }}</NuxtLink>
              <div class="prod-footer">
                <div>
                  <div class="prod-price">${{ fmt(p.price) }}</div>
                  <div v-if="p.weightG" class="prod-weight">{{ p.weightG }}g</div>
                </div>
                <button
                  :class="['cart-btn', { added: addedId === p.id }]"
                  :disabled="p.stock === 0"
                  @click.prevent="addToCart(p)"
                >{{ addedId === p.id ? '✓' : '+' }}</button>
              </div>
            </div>
          </div>
        </div>

        <div v-if="(data?.pages ?? 0) > 1" class="pagination">
          <button :disabled="page === 1" @click="page--" class="pg-btn">‹</button>
          <button v-for="n in data!.pages" :key="n" :class="['pg-btn', { active: n === page }]" @click="page = n">{{ n }}</button>
          <button :disabled="page === data!.pages" @click="page++" class="pg-btn">›</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.products-page { min-height: 80vh; background: var(--surface); }
.breadcrumb-bar { background: var(--white); border-bottom: 1px solid var(--border-light); padding: 12px 0; }
.bc-inner { max-width: 1280px; margin: 0 auto; padding: 0 24px; display: flex; align-items: center; gap: 8px; font-size: 13px; color: var(--subtle); font-family: var(--font-body); }
.bc-inner a { color: var(--subtle); text-decoration: none; }
.bc-inner a:hover { color: var(--gold); }
.page-container { max-width: 1280px; margin: 0 auto; padding: 28px 24px; display: grid; grid-template-columns: 220px 1fr; gap: 28px; }
.sidebar { position: sticky; top: 90px; height: fit-content; }
.sidebar-card { background: var(--white); border-radius: var(--radius-lg); border: 1.5px solid var(--border-light); padding: 20px; box-shadow: var(--shadow-sm); }
.sidebar-title { font-family: var(--font-display); font-size: 15px; font-weight: 700; color: var(--dark); margin-bottom: 14px; }
.cat-list { display: flex; flex-direction: column; gap: 4px; }
.cat-btn { width: 100%; text-align: left; padding: 8px 12px; border-radius: var(--radius-md); border: none; background: transparent; font-size: 13px; font-weight: 600; color: var(--muted); cursor: pointer; font-family: var(--font-body); transition: all .12s; }
.cat-btn:hover { background: var(--surface); color: var(--dark); }
.cat-btn.active { background: rgba(232,160,32,.1); color: var(--gold); }
.toolbar { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-bottom: 20px; flex-wrap: wrap; }
.search-wrap { position: relative; flex: 1; min-width: 200px; }
.search-icon { position: absolute; left: 10px; top: 50%; transform: translateY(-50%); width: 15px; height: 15px; color: var(--subtle); }
.search-input { width: 100%; height: 40px; border: 1.5px solid var(--border); border-radius: var(--radius-md); background: var(--white); padding: 0 12px 0 34px; font-size: 13px; font-family: var(--font-body); color: var(--dark); outline: none; }
.search-input:focus { border-color: var(--gold); }
.toolbar-right { display: flex; align-items: center; gap: 12px; }
.result-count { font-size: 13px; color: var(--subtle); white-space: nowrap; font-family: var(--font-body); }
.sort-select { height: 40px; border: 1.5px solid var(--border); border-radius: var(--radius-md); background: var(--white); padding: 0 12px; font-size: 13px; font-family: var(--font-body); color: var(--dark); outline: none; cursor: pointer; }
.skeleton-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 18px; }
.skeleton-card { height: 280px; background: var(--white); border-radius: var(--radius-lg); animation: pulse 1.5s ease-in-out infinite; }
@keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: .5; } }
.empty-state { display: flex; flex-direction: column; align-items: center; gap: 14px; padding: 80px 20px; }
.empty-state span { font-size: 48px; }
.empty-state p { font-size: 15px; color: var(--subtle); font-family: var(--font-body); }
.empty-state button { padding: 8px 20px; border-radius: var(--radius-md); border: 1.5px solid var(--gold); background: none; color: var(--gold); font-family: var(--font-body); font-weight: 700; cursor: pointer; }
.products-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 18px; }
.prod-card { background: var(--white); border-radius: var(--radius-lg); border: 1.5px solid var(--border-light); overflow: hidden; box-shadow: var(--shadow-sm); transition: all .15s; }
.prod-card:hover { box-shadow: var(--shadow-md); transform: translateY(-3px); }
.prod-img-wrap { display: block; width: 100%; height: 160px; background: var(--surface); position: relative; overflow: hidden; text-decoration: none; }
.prod-img { width: 100%; height: 100%; object-fit: cover; transition: transform .3s; }
.prod-card:hover .prod-img { transform: scale(1.05); }
.prod-emoji { font-size: 60px; position: absolute; top: 50%; left: 50%; transform: translate(-50%,-50%); }
.out-badge { position: absolute; top: 8px; right: 8px; background: rgba(0,0,0,.65); color: #fff; font-size: 11px; font-weight: 700; padding: 2px 8px; border-radius: var(--radius-pill); font-family: var(--font-body); }
.prod-body { padding: 12px 14px; }
.prod-cat { font-size: 10px; color: var(--subtle); text-transform: uppercase; letter-spacing: .04em; margin-bottom: 4px; font-family: var(--font-body); }
.prod-name { display: block; font-size: 13px; font-weight: 700; color: var(--dark); text-decoration: none; line-height: 1.35; margin-bottom: 10px; font-family: var(--font-body); display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.prod-name:hover { color: var(--gold); }
.prod-footer { display: flex; align-items: flex-end; justify-content: space-between; }
.prod-price { font-family: var(--font-display); font-size: 16px; font-weight: 800; color: var(--gold); }
.prod-weight { font-size: 10px; color: var(--subtle); margin-top: 1px; font-family: var(--font-body); }
.cart-btn { width: 30px; height: 30px; border-radius: 50%; border: none; background: var(--gold); color: var(--white); font-size: 16px; font-weight: 700; cursor: pointer; transition: all .15s; display: flex; align-items: center; justify-content: center; }
.cart-btn.added { background: var(--success); }
.cart-btn:disabled { background: var(--border); cursor: not-allowed; }
.pagination { display: flex; gap: 6px; justify-content: center; margin-top: 32px; flex-wrap: wrap; }
.pg-btn { min-width: 36px; height: 36px; padding: 0 10px; border-radius: var(--radius-md); border: 1.5px solid var(--border); background: var(--white); font-size: 13px; font-weight: 700; color: var(--dark); cursor: pointer; font-family: var(--font-body); transition: all .12s; }
.pg-btn:hover:not(:disabled) { border-color: var(--gold); color: var(--gold); }
.pg-btn.active { background: var(--gold); border-color: var(--gold); color: var(--white); }
.pg-btn:disabled { opacity: .4; cursor: not-allowed; }
@media (max-width: 768px) { .page-container { grid-template-columns: 1fr; } .sidebar { position: static; } }
@media (max-width: 480px) { .products-grid { grid-template-columns: repeat(2, 1fr); } }
</style>