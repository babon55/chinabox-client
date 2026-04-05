<script setup lang="ts">
definePageMeta({ layout: 'default' })

import { useWishlistStore }      from '~/features/wishlist/stores/wishlist.store'
import ProductComments            from '../components/ProductComments.vue'
import ProductOptionsSelector     from '../components/ProductOptionsSelector.vue'
import type { Product, SelectedOptions } from '../types/product'

// ── Language ──────────────────────────────────────────────────────────────────
const lang     = ref<'tk' | 'ru'>('tk')
const cartStore = useCartStore()
const wishlist  = useWishlistStore()

onMounted(() => {
  const saved = localStorage.getItem('silkshop_lang')
  if (saved === 'tk' || saved === 'ru') lang.value = saved

  if (product.value) {
    const key     = 'silkshop_viewed'
    const list    = JSON.parse(localStorage.getItem(key) ?? '[]') as string[]
    const updated = [product.value.id, ...list.filter(i => i !== product.value!.id)].slice(0, 10)
    localStorage.setItem(key, JSON.stringify(updated))
  }
})

// ── Route / API ───────────────────────────────────────────────────────────────
const route = useRoute()
const config = useRuntimeConfig()
const API   = config.public.apiBase

// ── Fetch product ─────────────────────────────────────────────────────────────
const { data: product, error } = await useAsyncData(
  `product-${route.params.id}`,
  () => $fetch<Product>(`${API}/products/${route.params.id}`)
)

if (error.value || !product.value) {
  throw createError({ statusCode: 404, message: 'Product not found' })
}

// ── Related products ──────────────────────────────────────────────────────────
const { data: relatedData } = await useAsyncData(
  `related-${route.params.id}`,
  async () => {
    if (!product.value) return { items: [] as Product[] }
    const res = await $fetch<{ items: Product[] }>(`${API}/products`, { params: { limit: 8 } })
    return {
      items: res.items
        .filter(p => p.category?.id === product.value!.category?.id && p.id !== product.value!.id)
        .slice(0, 4),
    }
  }
)
const related = computed(() => relatedData.value?.items ?? [])

// ── Delivery ──────────────────────────────────────────────────────────────────
const FAST_RATE   = 11
const SIMPLE_RATE = 7

const qty      = ref(1)
const delivery = ref<'simple' | 'fast'>('simple')
const added    = ref(false)

const weightKg     = computed(() => (product.value?.weightG ?? 0) / 1000)
const deliveryCost = computed(() => weightKg.value * (delivery.value === 'fast' ? FAST_RATE : SIMPLE_RATE))
const totalPrice   = computed(() => Number(product.value?.price ?? 0) + deliveryCost.value)

// ── Options ───────────────────────────────────────────────────────────────────
const selectedOptions    = ref<SelectedOptions>({})
const optionsSelectorRef = ref<InstanceType<typeof ProductOptionsSelector> | null>(null)

const hasOptions = computed(() => (product.value?.options ?? []).length > 0)

// ── Cart ──────────────────────────────────────────────────────────────────────
function addToCart() {
  if (!product.value) return

  // Validate required options before adding — validate() shows inline errors
  if (hasOptions.value && optionsSelectorRef.value) {
    if (!optionsSelectorRef.value.validate()) return
  }

  const selectedOpts = selectedOptions.value
  const hasAnyOption = Object.keys(selectedOpts).length > 0

  // Build display-friendly array of selected options
  const optionsDisplay = hasAnyOption
    ? product.value.options
        .filter(o => selectedOpts[o.id])
        .map(o => ({
          name: lang.value === 'tk' ? o.nameTk : o.nameRu,
          value: selectedOpts[o.id]
        }))
    : undefined

  cartStore.addItem({
    id:       product.value.id,
    name:     { tk: product.value.nameTk, ru: product.value.nameRu },
    image:    product.value.imageUrl ?? product.value.image,
    price:    Number(product.value.price),
    weightG:  product.value.weightG ?? null,
    quantity: qty.value,
    seller:   'SilkShop',
    inStock:  product.value.stock > 0,
    options:  hasAnyOption ? { ...selectedOpts } : undefined,
    optionsDisplay,
  })

  added.value = true
  setTimeout(() => { added.value = false }, 2000)
}

// ── Related cart ──────────────────────────────────────────────────────────────
const addedRelated = ref<string | null>(null)

function addRelatedToCart(p: Product) {
  cartStore.addItem({
    id:       p.id,
    name:     { tk: p.nameTk, ru: p.nameRu },
    image:    p.imageUrl ?? p.image,
    price:    Number(p.price),
    weightG:  p.weightG ?? null,
    quantity: 1,
    seller:   'SilkShop',
    inStock:  p.stock > 0,
  })
  addedRelated.value = p.id
  setTimeout(() => { addedRelated.value = null }, 1500)
}

// ── Formatting ────────────────────────────────────────────────────────────────
function fmt(n: number) { return Number(n).toFixed(2) }

function weightDisplay(g: number | null | undefined): string {
  if (!g) return ''
  return g >= 1000 ? `${(g / 1000).toFixed(2)} kg` : `${g} g`
}

// ── Head ──────────────────────────────────────────────────────────────────────
useHead({
  title: computed(() =>
    product.value
      ? `${lang.value === 'tk' ? product.value.nameTk : product.value.nameRu} – SilkShop`
      : 'SilkShop'
  ),
})
</script>

<template>
  <div v-if="product" class="product-page">

    <!-- Breadcrumb -->
    <div class="breadcrumb-bar">
      <div class="bc-inner">
        <NuxtLink to="/">{{ lang === 'tk' ? 'Baş sahypa' : 'Главная' }}</NuxtLink>
        <span>›</span>
        <NuxtLink to="/products">{{ lang === 'tk' ? 'Harytlar' : 'Товары' }}</NuxtLink>
        <span>›</span>
        <NuxtLink :to="`/products?category=${product.categoryId}`">
          {{ lang === 'tk' ? product.category.nameTk : product.category.nameRu }}
        </NuxtLink>
        <span>›</span>
        <span class="bc-current">{{ lang === 'tk' ? product.nameTk : product.nameRu }}</span>
      </div>
    </div>

    <div class="page-inner">
      <div class="product-layout">

        <!-- ── Image column ─────────────────────────────────────────────────── -->
        <div class="image-col">
          <div class="main-image">
            <img
              v-if="product.imageUrl"
              :src="product.imageUrl"
              :alt="lang === 'tk' ? product.nameTk : product.nameRu"
              class="real-img"
            />
            <span v-else class="big-emoji">{{ product.image }}</span>
          </div>

          <button
            class="wishlist-row"
            @click="wishlist.toggle({
              id: product.id, nameTk: product.nameTk, nameRu: product.nameRu,
              image: product.image, imageUrl: product.imageUrl,
              price: Number(product.price), weightG: product.weightG,
              stock: product.stock, category: product.category,
            })"
          >
            <svg
              :fill="wishlist.has(product.id) ? '#EF4444' : 'none'"
              stroke="#EF4444"
              stroke-width="2"
              viewBox="0 0 24 24"
              width="16"
              height="16"
            >
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
            {{ wishlist.has(product.id)
              ? (lang === 'tk' ? 'Halananlardan aýyr' : 'Убрать из избранного')
              : (lang === 'tk' ? 'Halananlara goş'    : 'Добавить в избранное') }}
          </button>
        </div>

        <!-- ── Info column ──────────────────────────────────────────────────── -->
        <div class="info-col">

          <div class="prod-cat">
            {{ lang === 'tk' ? product.category.nameTk : product.category.nameRu }}
          </div>
          <h1 class="prod-title">{{ lang === 'tk' ? product.nameTk : product.nameRu }}</h1>

          <div class="prod-meta">
            <span :class="['stock-badge', product.stock > 0 ? 'in' : 'out']">
              {{ product.stock > 0
                ? (lang === 'tk' ? '✓ Stokda bar'  : '✓ В наличии')
                : (lang === 'tk' ? 'Stokda ýok'    : 'Нет в наличии') }}
            </span>
            <span class="sold-count">
              {{ product.sold }} {{ lang === 'tk' ? 'gezek satyldy' : 'продано' }}
            </span>
          </div>

          <!-- Price -->
          <div class="price-box">
            <div class="price-main">${{ fmt(product.price) }}</div>
            <div class="price-label">{{ lang === 'tk' ? 'Önüm bahasy' : 'Цена товара' }}</div>
          </div>

          <!-- Weight -->
          <div v-if="product.weightG" class="weight-info">
            📦 {{ lang === 'tk' ? 'Agramy' : 'Вес' }}: {{ weightDisplay(product.weightG) }}
          </div>

          <!-- Options selector — single component, no duplicates -->
          <ProductOptionsSelector
            v-if="hasOptions"
            ref="optionsSelectorRef"
            v-model="selectedOptions"
            :options="product.options"
            :lang="lang"
          />

          <!-- Delivery -->
          <div class="delivery-section">
            <h3 class="delivery-title">
              {{ lang === 'tk' ? 'Eltip Beriş' : 'Способ доставки' }}
            </h3>
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

          <!-- Price summary -->
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

          <!-- Selected options summary -->
          <div
            v-if="hasOptions && Object.keys(selectedOptions).length"
            class="options-summary"
          >
            <div
              v-for="opt in product.options.filter(o => selectedOptions[o.id])"
              :key="opt.id"
              class="opt-summary-row"
            >
              <span class="opt-summary-key">
                {{ lang === 'tk' ? opt.nameTk : opt.nameRu }}:
              </span>
              <span class="opt-summary-val">
                {{ selectedOptions[opt.id] }}{{ opt.unit ? ' ' + opt.unit : '' }}
              </span>
            </div>
          </div>

          <!-- Add to cart -->
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

    <!-- Comments -->
    <ProductComments :product-id="product.id" :lang="lang" />

    <!-- Related products -->
    <section v-if="related.length" class="related-section">
      <div class="related-inner">
        <div class="related-header">
          <h2 class="related-title">{{ lang === 'tk' ? 'Meňzeş Harytlar' : 'Похожие товары' }}</h2>
          <NuxtLink :to="`/products?category=${product.categoryId}`" class="see-all">
            {{ lang === 'tk' ? 'Hemmesini gör →' : 'Смотреть все →' }}
          </NuxtLink>
        </div>
        <div class="related-grid">
          <div v-for="p in related" :key="p.id" class="rel-card">
            <NuxtLink :to="`/products/${p.id}`" class="rel-img-wrap">
              <img
                v-if="p.imageUrl"
                :src="p.imageUrl"
                :alt="lang === 'tk' ? p.nameTk : p.nameRu"
                class="rel-img"
              />
              <span v-else class="rel-emoji">{{ p.image }}</span>
              <span v-if="p.stock === 0" class="rel-out">
                {{ lang === 'tk' ? 'Ýok' : 'Нет' }}
              </span>
            </NuxtLink>
            <div class="rel-body">
              <div class="rel-cat">{{ lang === 'tk' ? p.category.nameTk : p.category.nameRu }}</div>
              <NuxtLink :to="`/products/${p.id}`" class="rel-name">
                {{ lang === 'tk' ? p.nameTk : p.nameRu }}
              </NuxtLink>
              <div class="rel-footer">
                <span class="rel-price">${{ fmt(p.price) }}</span>
                <button
                  :class="['rel-cart-btn', { added: addedRelated === p.id }]"
                  :disabled="p.stock === 0"
                  @click.prevent="addRelatedToCart(p)"
                >
                  {{ addedRelated === p.id ? '✓' : '+' }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

  </div>
</template>

<style scoped>
.product-page { min-height: 80vh; background: var(--surface); }

/* Breadcrumb */
.breadcrumb-bar { background: var(--white); border-bottom: 1px solid var(--border-light); padding: 12px 0; }
.bc-inner { max-width: 1280px; margin: 0 auto; padding: 0 24px; display: flex; align-items: center; gap: 8px; font-size: 13px; color: var(--subtle); flex-wrap: wrap; font-family: var(--font-body); }
.bc-inner a { color: var(--subtle); text-decoration: none; }
.bc-inner a:hover { color: var(--gold); }
.bc-current { color: var(--dark); font-weight: 600; }

/* Layout */
.page-inner { max-width: 1100px; margin: 0 auto; padding: 36px 24px 40px; }
.product-layout { display: grid; grid-template-columns: 1fr 1fr; gap: 52px; align-items: start; }

/* Image column */
.image-col { position: sticky; top: 90px; display: flex; flex-direction: column; gap: 12px; }
.main-image {
  width: 100%; aspect-ratio: 1;
  background: var(--white); border-radius: var(--radius-xl);
  border: 1.5px solid var(--border-light); overflow: hidden;
  display: flex; align-items: center; justify-content: center;
  box-shadow: var(--shadow-md);
}
.real-img  { width: 100%; height: 100%; object-fit: cover; }
.big-emoji { font-size: 120px; }

.wishlist-row {
  display: flex; align-items: center; gap: 8px; justify-content: center;
  padding: 10px; border-radius: var(--radius-md);
  border: 1.5px solid var(--border-light); background: var(--white);
  font-size: 13px; font-weight: 600; color: var(--muted);
  cursor: pointer; font-family: var(--font-body); transition: all .15s;
}
.wishlist-row:hover { border-color: #EF4444; color: #EF4444; background: #FEF2F2; }

/* Info column */
.prod-cat   { font-size: 12px; color: var(--subtle); text-transform: uppercase; letter-spacing: .06em; margin-bottom: 8px; font-family: var(--font-body); }
.prod-title { font-family: var(--font-display); font-size: 28px; font-weight: 700; color: var(--dark); line-height: 1.25; margin-bottom: 16px; }

.prod-meta  { display: flex; align-items: center; gap: 14px; margin-bottom: 20px; flex-wrap: wrap; }
.stock-badge { padding: 4px 12px; border-radius: var(--radius-pill); font-size: 12px; font-weight: 700; font-family: var(--font-body); }
.stock-badge.in  { background: #DCFCE7; color: #14532D; }
.stock-badge.out { background: #FEE2E2; color: #991B1B; }
.sold-count { font-size: 13px; color: var(--subtle); font-family: var(--font-body); }

/* Price */
.price-box { display: flex; align-items: baseline; gap: 10px; background: var(--white); border-radius: var(--radius-lg); border: 1.5px solid var(--border-light); padding: 16px 20px; margin-bottom: 14px; }
.price-main  { font-family: var(--font-display); font-size: 34px; font-weight: 800; color: var(--gold); }
.price-label { font-size: 12px; color: var(--subtle); font-family: var(--font-body); }

.weight-info { font-size: 13px; color: var(--subtle); background: var(--surface); padding: 8px 14px; border-radius: var(--radius-md); margin-bottom: 14px; font-family: var(--font-body); }

/* Delivery */
.delivery-section { margin: 14px 0 18px; }
.delivery-title   { font-size: 13px; font-weight: 700; color: var(--dark); margin-bottom: 10px; font-family: var(--font-body); }
.delivery-options { display: flex; flex-direction: column; gap: 8px; }
.d-option { display: flex; align-items: flex-start; gap: 10px; padding: 12px 14px; border-radius: var(--radius-md); border: 1.5px solid var(--border); background: var(--white); cursor: pointer; transition: all .12s; }
.d-option input[type="radio"] { margin-top: 2px; accent-color: var(--gold); }
.d-option.active { border-color: var(--gold); background: rgba(232,160,32,.06); }
.d-body { flex: 1; }
.d-top  { display: flex; justify-content: space-between; font-size: 13px; font-weight: 700; color: var(--dark); font-family: var(--font-body); }
.d-cost { color: var(--gold); }
.d-rate { font-size: 11px; color: var(--subtle); margin-top: 3px; display: block; font-family: var(--font-body); }

/* Total box */
.total-box { background: var(--white); border-radius: var(--radius-lg); border: 1.5px solid var(--border-light); overflow: hidden; margin-bottom: 16px; }
.total-rows { padding: 14px 16px; display: flex; flex-direction: column; gap: 8px; border-bottom: 1px solid var(--border-light); }
.total-row  { display: flex; justify-content: space-between; font-size: 13px; font-family: var(--font-body); }
.total-row span { color: var(--subtle); }
.total-row strong { color: var(--dark); font-weight: 700; }
.total-final { display: flex; justify-content: space-between; align-items: center; padding: 14px 16px; }
.total-final span { font-size: 14px; font-weight: 700; color: var(--dark); font-family: var(--font-body); }
.total-final strong { font-family: var(--font-display); font-size: 26px; font-weight: 800; color: var(--dark); }

/* Options summary chips */
.options-summary {
  display: flex; flex-wrap: wrap; gap: 8px;
  padding: 10px 14px; background: var(--surface);
  border-radius: var(--radius-md); border: 1px solid var(--border-light);
  margin-bottom: 14px;
}
.opt-summary-row { display: flex; align-items: center; gap: 5px; }
.opt-summary-key { font-size: 12px; color: var(--subtle); font-family: var(--font-body); }
.opt-summary-val {
  font-size: 12px; font-weight: 700;
  border: 1.5px solid var(--gold); color: var(--gold);
  padding: 1px 8px; border-radius: var(--radius-pill);
  font-family: var(--font-body);
}

/* Action row */
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

/* Related products */
.related-section { background: var(--surface); border-top: 1px solid var(--border-light); padding: 48px 0; }
.related-inner   { max-width: 1100px; margin: 0 auto; padding: 0 24px; }
.related-header  { display: flex; align-items: center; justify-content: space-between; margin-bottom: 24px; }
.related-title   { font-family: var(--font-display); font-size: 22px; font-weight: 700; color: var(--dark); }
.see-all         { font-size: 13px; font-weight: 700; color: var(--gold); text-decoration: none; }
.see-all:hover   { text-decoration: underline; }
.related-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; }
.rel-card { background: var(--white); border-radius: var(--radius-lg); border: 1.5px solid var(--border-light); overflow: hidden; box-shadow: var(--shadow-sm); transition: all .15s; }
.rel-card:hover { box-shadow: var(--shadow-md); transform: translateY(-3px); border-color: rgba(232,160,32,.3); }
.rel-img-wrap { display: block; width: 100%; aspect-ratio: 1; background: var(--surface); position: relative; overflow: hidden; text-decoration: none; }
.rel-img  { width: 100%; height: 100%; object-fit: cover; transition: transform .3s; }
.rel-card:hover .rel-img { transform: scale(1.05); }
.rel-emoji { position: absolute; top: 50%; left: 50%; transform: translate(-50%,-50%); font-size: 52px; }
.rel-out  { position: absolute; top: 8px; left: 8px; background: rgba(0,0,0,.65); color: white; font-size: 10px; font-weight: 700; padding: 2px 7px; border-radius: var(--radius-pill); }
.rel-body { padding: 12px 14px; }
.rel-cat  { font-size: 10px; color: var(--subtle); text-transform: uppercase; letter-spacing: .04em; margin-bottom: 4px; font-family: var(--font-body); }
.rel-name { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; font-size: 13px; font-weight: 700; color: var(--dark); text-decoration: none; line-height: 1.35; margin-bottom: 10px; font-family: var(--font-body); }
.rel-name:hover { color: var(--gold); }
.rel-footer { display: flex; align-items: center; justify-content: space-between; }
.rel-price  { font-family: var(--font-display); font-size: 16px; font-weight: 800; color: var(--gold); }
.rel-cart-btn { width: 30px; height: 30px; border-radius: 50%; border: none; background: var(--dark); color: white; font-size: 16px; font-weight: 700; cursor: pointer; transition: all .15s; display: flex; align-items: center; justify-content: center; }
.rel-cart-btn.added { background: var(--success); }
.rel-cart-btn:disabled { background: var(--border); cursor: not-allowed; }
.rel-cart-btn:hover:not(:disabled):not(.added) { background: var(--gold); }

/* Responsive */
@media (max-width: 768px) {
  .product-layout { grid-template-columns: 1fr; }
  .image-col { position: static; }
  .related-grid { grid-template-columns: repeat(2, 1fr); }
}
</style>