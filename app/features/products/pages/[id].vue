<script setup lang="ts">
definePageMeta({ layout: 'default' })

const lang      = ref<'tk' | 'ru'>('tk')
const cartStore = useCartStore()

onMounted(() => {
  const saved = localStorage.getItem('silkshop_lang')
  if (saved === 'tk' || saved === 'ru') lang.value = saved
})

const route = useRoute()
const API   = 'http://localhost:3001/api/v1'

interface Product {
  id: string; nameTk: string; nameRu: string
  image: string; imageUrl?: string | null
  price: number; weightG?: number | null
  stock: number; sold: number; status: string
  category: { nameTk: string; nameRu: string }
}

const { data: product, error } = await useAsyncData(
  `product-${route.params.id}`,
  () => $fetch<Product>(`${API}/products/${route.params.id}`)
)

if (error.value || !product.value) {
  throw createError({ statusCode: 404, message: 'Product not found' })
}

const FAST_RATE   = 11
const SIMPLE_RATE = 7
const qty      = ref(1)
const delivery = ref<'simple' | 'fast'>('simple')
const added    = ref(false)

const rate         = computed(() => delivery.value === 'fast' ? FAST_RATE : SIMPLE_RATE)
const weightKg     = computed(() => (product.value?.weightG ?? 0) / 1000)
const deliveryCost = computed(() => weightKg.value * rate.value)
const totalPrice   = computed(() => Number(product.value?.price ?? 0) + deliveryCost.value)

// ── Use cartStore so header badge updates instantly ────────────
function addToCart() {
  if (!product.value) return
  cartStore.addItem({
    id:       product.value.id,
    name:     { tk: product.value.nameTk, ru: product.value.nameRu },
    image:    product.value.imageUrl ?? product.value.image,
    price:    Number(product.value.price),
    weightG:  product.value.weightG ?? null,
    quantity: qty.value,
    seller:   'SilkShop',
    inStock:  product.value.stock > 0,
  })
  added.value = true
  setTimeout(() => added.value = false, 2000)
}

function fmt(n: number) { return Number(n).toFixed(2) }

// weightG helper — fixes TypeScript comparison error
function weightDisplay(g: number | null | undefined): string {
  if (!g) return ''
  return g >= 1000 ? (g / 1000).toFixed(2) + ' kg' : g + ' g'
}

useHead({
  title: computed(() => product.value
    ? `${lang.value === 'tk' ? product.value.nameTk : product.value.nameRu} – SilkShop`
    : 'SilkShop')
})
</script>

<template>
  <div class="product-page" v-if="product">

    <div class="breadcrumb-bar">
      <div class="bc-inner">
        <NuxtLink to="/">{{ lang === 'tk' ? 'Baş sahypa' : 'Главная' }}</NuxtLink>
        <span>›</span>
        <NuxtLink to="/products">{{ lang === 'tk' ? 'Harytlar' : 'Товары' }}</NuxtLink>
        <span>›</span>
        <span class="bc-current">{{ lang === 'tk' ? product.nameTk : product.nameRu }}</span>
      </div>
    </div>

    <div class="page-inner">
      <div class="product-layout">

        <!-- Image -->
        <div class="image-col">
          <div class="main-image">
            <img v-if="product.imageUrl" :src="product.imageUrl" :alt="lang === 'tk' ? product.nameTk : product.nameRu" class="real-img" />
            <span v-else class="big-emoji">{{ product.image }}</span>
          </div>
        </div>

        <!-- Info -->
        <div class="info-col">

          <div class="prod-cat">{{ lang === 'tk' ? product.category.nameTk : product.category.nameRu }}</div>
          <h1 class="prod-title">{{ lang === 'tk' ? product.nameTk : product.nameRu }}</h1>

          <div class="prod-meta">
            <span :class="['stock-badge', product.stock > 0 ? 'in' : 'out']">
              {{ product.stock > 0
                ? (lang === 'tk' ? '✓ Stokda bar' : '✓ В наличии')
                : (lang === 'tk' ? 'Stokda ýok' : 'Нет в наличии') }}
            </span>
            <span class="sold-count">{{ product.sold }} {{ lang === 'tk' ? 'gezek satyldy' : 'продано' }}</span>
          </div>

          <div class="price-box">
            <div class="price-main">${{ fmt(product.price) }}</div>
            <div class="price-label">{{ lang === 'tk' ? 'Önüm bahasy' : 'Цена товара' }}</div>
          </div>

          <div v-if="product.weightG" class="weight-info">
            📦 {{ lang === 'tk' ? 'Agramy' : 'Вес' }}: {{ weightDisplay(product.weightG) }}
          </div>

          <div class="delivery-section">
            <h3 class="delivery-title">{{ lang === 'tk' ? 'Eltip Beriş' : 'Способ доставки' }}</h3>
            <div class="delivery-options">
              <label :class="['d-option', { active: delivery === 'simple' }]">
                <input type="radio" v-model="delivery" value="simple" />
                <div class="d-body">
                  <div class="d-top">
                    <span>🚚 {{ lang === 'tk' ? 'Adaty (15–30 gün)' : 'Обычная (15–30 дней)' }}</span>
                    <span class="d-cost">${{ fmt((product.weightG ?? 0) / 1000 * SIMPLE_RATE) }}</span>
                  </div>
                  <span class="d-rate">${{ SIMPLE_RATE }}/kg</span>
                </div>
              </label>
              <label :class="['d-option', { active: delivery === 'fast' }]">
                <input type="radio" v-model="delivery" value="fast" />
                <div class="d-body">
                  <div class="d-top">
                    <span>⚡ {{ lang === 'tk' ? 'Tiz (7–15 gün)' : 'Быстрая (7–15 дней)' }}</span>
                    <span class="d-cost">${{ fmt((product.weightG ?? 0) / 1000 * FAST_RATE) }}</span>
                  </div>
                  <span class="d-rate">${{ FAST_RATE }}/kg</span>
                </div>
              </label>
            </div>
          </div>

          <div class="total-box">
            <div class="total-rows">
              <div class="total-row">
                <span>{{ lang === 'tk' ? 'Önüm' : 'Товар' }}</span>
                <strong>${{ fmt(product.price) }}</strong>
              </div>
              <div class="total-row">
                <span>{{ lang === 'tk' ? 'Eltip beriş' : 'Доставка' }}</span>
                <strong>${{ fmt(deliveryCost) }}</strong>
              </div>
            </div>
            <div class="total-final">
              <span>{{ lang === 'tk' ? 'Jemi' : 'Итого' }}</span>
              <strong>${{ fmt(totalPrice) }}</strong>
            </div>
          </div>

          <div class="action-row">
            <div class="qty-ctrl">
              <button @click="qty = Math.max(1, qty - 1)">−</button>
              <span>{{ qty }}</span>
              <button @click="qty = Math.min(product.stock || 99, qty + 1)">+</button>
            </div>
            <button
              :class="['add-btn', { added }]"
              :disabled="product.stock === 0"
              @click="addToCart"
            >
              <span v-if="!added">🛒 {{ lang === 'tk' ? 'Sebede Goş' : 'В корзину' }}</span>
              <span v-else>✓ {{ lang === 'tk' ? 'Goşuldy!' : 'Добавлено!' }}</span>
            </button>
          </div>

          <NuxtLink to="/cart" class="go-cart-link">
            {{ lang === 'tk' ? 'Sebede git →' : 'Перейти в корзину →' }}
          </NuxtLink>

        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.product-page { min-height: 80vh; background: var(--surface); }
.breadcrumb-bar { background: var(--white); border-bottom: 1px solid var(--border-light); padding: 12px 0; }
.bc-inner { max-width: 1280px; margin: 0 auto; padding: 0 24px; display: flex; align-items: center; gap: 8px; font-size: 13px; color: var(--subtle); flex-wrap: wrap; font-family: var(--font-body); }
.bc-inner a { color: var(--subtle); text-decoration: none; }
.bc-inner a:hover { color: var(--gold); }
.bc-current { color: var(--dark); font-weight: 600; }
.page-inner { max-width: 1100px; margin: 0 auto; padding: 36px 24px 60px; }
.product-layout { display: grid; grid-template-columns: 1fr 1fr; gap: 52px; align-items: start; }
.image-col { position: sticky; top: 90px; }
.main-image { width: 100%; aspect-ratio: 1; background: var(--white); border-radius: var(--radius-xl); border: 1.5px solid var(--border-light); overflow: hidden; display: flex; align-items: center; justify-content: center; box-shadow: var(--shadow-md); }
.real-img { width: 100%; height: 100%; object-fit: cover; }
.big-emoji { font-size: 120px; }
.prod-cat { font-size: 12px; color: var(--subtle); text-transform: uppercase; letter-spacing: .06em; margin-bottom: 8px; font-family: var(--font-body); }
.prod-title { font-family: var(--font-display); font-size: 28px; font-weight: 700; color: var(--dark); line-height: 1.25; margin-bottom: 16px; }
.prod-meta { display: flex; align-items: center; gap: 14px; margin-bottom: 20px; flex-wrap: wrap; }
.stock-badge { padding: 4px 12px; border-radius: var(--radius-pill); font-size: 12px; font-weight: 700; font-family: var(--font-body); }
.stock-badge.in  { background: #DCFCE7; color: #14532D; }
.stock-badge.out { background: #FEE2E2; color: #991B1B; }
.sold-count { font-size: 13px; color: var(--subtle); font-family: var(--font-body); }
.price-box { display: flex; align-items: baseline; gap: 10px; background: var(--white); border-radius: var(--radius-lg); border: 1.5px solid var(--border-light); padding: 16px 20px; margin-bottom: 14px; }
.price-main  { font-family: var(--font-display); font-size: 34px; font-weight: 800; color: var(--gold); }
.price-label { font-size: 12px; color: var(--subtle); font-family: var(--font-body); }
.weight-info { font-size: 13px; color: var(--subtle); background: var(--surface); padding: 8px 14px; border-radius: var(--radius-md); margin-bottom: 18px; font-family: var(--font-body); }
.delivery-section { margin-bottom: 18px; }
.delivery-title { font-size: 13px; font-weight: 700; color: var(--dark); margin-bottom: 10px; font-family: var(--font-body); }
.delivery-options { display: flex; flex-direction: column; gap: 8px; }
.d-option { display: flex; align-items: flex-start; gap: 10px; padding: 12px 14px; border-radius: var(--radius-md); border: 1.5px solid var(--border); background: var(--white); cursor: pointer; transition: all .12s; }
.d-option input[type="radio"] { margin-top: 2px; accent-color: var(--gold); }
.d-option.active { border-color: var(--gold); background: rgba(232,160,32,.06); }
.d-body { flex: 1; }
.d-top  { display: flex; justify-content: space-between; font-size: 13px; font-weight: 700; color: var(--dark); font-family: var(--font-body); }
.d-cost { color: var(--gold); }
.d-rate { font-size: 11px; color: var(--subtle); margin-top: 3px; display: block; font-family: var(--font-body); }
.total-box { background: var(--white); border-radius: var(--radius-lg); border: 1.5px solid var(--border-light); overflow: hidden; margin-bottom: 20px; }
.total-rows { padding: 14px 16px; display: flex; flex-direction: column; gap: 8px; border-bottom: 1px solid var(--border-light); }
.total-row { display: flex; justify-content: space-between; font-size: 13px; font-family: var(--font-body); }
.total-row span { color: var(--subtle); }
.total-row strong { color: var(--dark); font-weight: 700; }
.total-final { display: flex; justify-content: space-between; align-items: center; padding: 14px 16px; }
.total-final span { font-size: 14px; font-weight: 700; color: var(--dark); font-family: var(--font-body); }
.total-final strong { font-family: var(--font-display); font-size: 26px; font-weight: 800; color: var(--dark); }
.action-row { display: flex; gap: 12px; align-items: center; margin-bottom: 14px; }
.qty-ctrl { display: flex; align-items: center; background: var(--white); border: 1.5px solid var(--border); border-radius: var(--radius-md); overflow: hidden; }
.qty-ctrl button { width: 38px; height: 46px; border: none; background: none; font-size: 20px; color: var(--dark); cursor: pointer; transition: background .12s; font-family: var(--font-body); }
.qty-ctrl button:hover { background: var(--surface); }
.qty-ctrl span { min-width: 40px; text-align: center; font-size: 16px; font-weight: 700; color: var(--dark); font-family: var(--font-body); }
.add-btn { flex: 1; height: 46px; border-radius: var(--radius-md); border: none; background: linear-gradient(135deg, var(--gold), var(--gold-dark)); color: var(--white); font-size: 15px; font-weight: 800; cursor: pointer; font-family: var(--font-body); transition: all .15s; box-shadow: 0 4px 16px var(--gold-shadow); }
.add-btn.added { background: linear-gradient(135deg, var(--success), #16A34A); box-shadow: none; }
.add-btn:disabled { background: var(--border); box-shadow: none; cursor: not-allowed; color: var(--subtle); }
.add-btn:hover:not(:disabled):not(.added) { transform: translateY(-2px); }
.go-cart-link { display: block; text-align: center; font-size: 13px; font-weight: 700; color: var(--gold); text-decoration: none; font-family: var(--font-body); }
.go-cart-link:hover { text-decoration: underline; }
@media (max-width: 768px) { .product-layout { grid-template-columns: 1fr; } .image-col { position: static; } }
</style>