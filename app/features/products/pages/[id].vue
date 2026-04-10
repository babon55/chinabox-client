<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'

definePageMeta({ layout: 'default' })

import { useWishlistStore }      from '~/features/wishlist/stores/wishlist.store'
import ProductComments            from '../components/ProductComments.vue'
import ProductOptionsSelector     from '../components/ProductOptionsSelector.vue'
import type { Product, SelectedOptions } from '../types/product'

const { locale } = useI18n()
const lang       = computed(() => locale.value)
const cartStore  = useCartStore()
const wishlist   = useWishlistStore()
const homeDelivery = ref(false)

onMounted(() => {
  const saved = localStorage.getItem('silkshop_lang')
  if (saved === 'tk' || saved === 'ru') locale.value = saved

  if (product.value) {
    const key     = 'silkshop_viewed'
    const list    = JSON.parse(localStorage.getItem(key) ?? '[]') as string[]
    const updated = [product.value.id, ...list.filter(i => i !== product.value!.id)].slice(0, 10)
    localStorage.setItem(key, JSON.stringify(updated))
  }
})

// ── Route / API ───────────────────────────────────────────────────────────────
const route  = useRoute()
const config = useRuntimeConfig()
const API    = config.public.apiBase

const { data: product, error } = await useAsyncData(
  `product-${route.params.id}`,
  () => $fetch<Product>(`${API}/products/${route.params.id}`)
)
if (error.value || !product.value) throw createError({ statusCode: 404, message: 'Product not found' })

const { data: relatedData } = await useAsyncData(
  `related-${route.params.id}`,
  async () => {
    if (!product.value) return { items: [] as Product[] }
    const res = await $fetch<{ items: Product[] }>(`${API}/products`, { params: { limit: 8 } })
    return { items: res.items.filter(p => p.category?.id === product.value!.category?.id && p.id !== product.value!.id).slice(0, 4) }
  }
)
const related = computed(() => relatedData.value?.items ?? [])

// ── Gallery ───────────────────────────────────────────────────────────────────
const allImages = computed(() => {
  if (!product.value) return []
  const urls = product.value.imageUrls?.length
    ? product.value.imageUrls
    : product.value.imageUrl
      ? [product.value.imageUrl]
      : []
  return urls
})
const activeIdx   = ref(0)
const activeImage = computed(() => allImages.value[activeIdx.value] ?? null)
const lightboxOpen = ref(false)

function prevImage() { activeIdx.value = (activeIdx.value - 1 + allImages.value.length) % allImages.value.length }
function nextImage() { activeIdx.value = (activeIdx.value + 1) % allImages.value.length }

// keyboard nav for lightbox
onMounted(() => {
  window.addEventListener('keydown', (e) => {
    if (!lightboxOpen.value) return
    if (e.key === 'ArrowLeft')  prevImage()
    if (e.key === 'ArrowRight') nextImage()
    if (e.key === 'Escape')     lightboxOpen.value = false
  })
})

// ── Delivery ──────────────────────────────────────────────────────────────────
const FAST_RATE   = 11
const SIMPLE_RATE = 7
const HOME_RATE   = 1  // ← ADD

const delivery = ref<'simple' | 'fast' | 'home'>('simple')  // ← ADD 'home'
const qty         = ref(1)
const added       = ref(false)

const markup       = computed(() => product.value?.markup ?? 50)
const clientPrice  = computed(() => Number(product.value?.price ?? 0) * (1 + markup.value / 100))
const weightKg     = computed(() => (product.value?.weightG ?? 0) / 1000)
const deliveryCost = computed(() =>
  weightKg.value * (delivery.value === 'fast' ? FAST_RATE : SIMPLE_RATE)
  + (homeDelivery.value ? 1 : 0)
)
const totalPrice   = computed(() => clientPrice.value + deliveryCost.value)

// ── Options ───────────────────────────────────────────────────────────────────
const selectedOptions    = ref<SelectedOptions>({})
const optionsSelectorRef = ref<InstanceType<typeof ProductOptionsSelector> | null>(null)
const hasOptions         = computed(() => (product.value?.options ?? []).length > 0)

// ── Cart ──────────────────────────────────────────────────────────────────────
function addToCart() {
  if (!product.value) return
  if (hasOptions.value && optionsSelectorRef.value && !optionsSelectorRef.value.validate()) return

  cartStore.addItem({
    id:       product.value.id,
    name:     { tk: product.value.nameTk, ru: product.value.nameRu },
    image:    activeImage.value ?? product.value.imageUrl ?? product.value.image,
    price:    clientPrice.value,
    quantity: qty.value,
    seller:   'SilkShop',
    inStock:  product.value.stock > 0,
    options:  Object.keys(selectedOptions.value).length ? { ...selectedOptions.value } : undefined,
  })
  added.value = true
  setTimeout(() => { added.value = false }, 2000)
}

const addedRelated = ref<string | null>(null)
function addRelatedToCart(p: Product) {
  cartStore.addItem({
    id:       p.id,
    name:     { tk: p.nameTk, ru: p.nameRu },
    image:    p.imageUrls?.[0] ?? p.imageUrl ?? p.image,
    price:    Number(p.price) * (1 + (p.markup ?? 50) / 100),
    quantity: 1,
    seller:   'SilkShop',
    inStock:  p.stock > 0,
  })
  addedRelated.value = p.id
  setTimeout(() => { addedRelated.value = null }, 1500)
}

function fmt(n: number) { return Number(n).toFixed(2) }

function weightDisplay(g: number | null | undefined): string {
  if (!g) return ''
  return g >= 1000 ? `${(g / 1000).toFixed(2)} kg` : `${g} g`
}

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

    <!-- Lightbox -->
    <Teleport to="body">
      <Transition name="lb">
        <div v-if="lightboxOpen" class="lightbox" @click.self="lightboxOpen = false">
          <button class="lb-close" @click="lightboxOpen = false">×</button>
          <button v-if="allImages.length > 1" class="lb-arrow lb-prev" @click="prevImage">‹</button>
          <img :src="activeImage!" class="lb-img" />
          <button v-if="allImages.length > 1" class="lb-arrow lb-next" @click="nextImage">›</button>
          <div class="lb-counter">{{ activeIdx + 1 }} / {{ allImages.length }}</div>
        </div>
      </Transition>
    </Teleport>

    <!-- Breadcrumb -->
    <div class="breadcrumb-bar">
      <div class="bc-inner">
        <NuxtLink to="/">{{ $t('footer.home') }}</NuxtLink>
        <span class="bc-sep">›</span>
        <NuxtLink to="/products">{{ $t('footer.products') }}</NuxtLink>
        <span class="bc-sep">›</span>
        <NuxtLink :to="`/products?category=${product.categoryId}`">
          {{ locale === 'tk' ? product.category.nameTk : product.category.nameRu }}
        </NuxtLink>
        <span class="bc-sep">›</span>
        <span class="bc-current">{{ locale === 'tk' ? product.nameTk : product.nameRu }}</span>
      </div>
    </div>

    <div class="page-inner">
      <div class="product-layout">

        <!-- ── Image column ─────────────────────────────────────────────────── -->
        <div class="image-col">

          <!-- Main image -->
          <div class="main-image-wrap" @click="allImages.length ? (lightboxOpen = true) : null">
            <img v-if="activeImage" :src="activeImage" :alt="lang === 'tk' ? product.nameTk : product.nameRu" class="main-img" />
            <span v-else class="big-emoji">{{ product.image }}</span>

            <!-- Image count pill -->
            <div v-if="allImages.length > 1" class="img-count-pill">
              {{ activeIdx + 1 }} / {{ allImages.length }}
            </div>

            <!-- Expand icon -->
            <div v-if="allImages.length" class="expand-hint">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/>
              </svg>
            </div>

            <!-- Prev/Next on main image -->
            <button v-if="allImages.length > 1" class="img-nav img-prev" @click.stop="prevImage">‹</button>
            <button v-if="allImages.length > 1" class="img-nav img-next" @click.stop="nextImage">›</button>
          </div>

          <!-- Thumbnails -->
          <div v-if="allImages.length > 1" class="thumbs">
            <button
              v-for="(url, idx) in allImages"
              :key="idx"
              :class="['thumb', { active: idx === activeIdx }]"
              @click="activeIdx = idx"
            >
              <img :src="url" />
            </button>
          </div>

          <!-- Wishlist -->
          <button
            class="wishlist-row"
            @click="wishlist.toggle({
              id: product.id, nameTk: product.nameTk, nameRu: product.nameRu,
              image: product.image, imageUrl: product.imageUrls?.[0] ?? product.imageUrl,
              price: Number(product.price), weightG: product.weightG,
              stock: product.stock, category: product.category,
            })"
          >
            <svg :fill="wishlist.has(product.id) ? '#EF4444' : 'none'" stroke="#EF4444" stroke-width="2" viewBox="0 0 24 24" width="16" height="16">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
            </svg>
            {{ wishlist.has(product.id)
              ? (lang === 'tk' ? 'Halananlardan aýyr' : 'Убрать из избранного')
              : (lang === 'tk' ? 'Halananlara goş'    : 'Добавить в избранное') }}
          </button>
        </div>

        <!-- ── Info column ──────────────────────────────────────────────────── -->
        <div class="info-col">

          <div class="prod-cat">{{ lang === 'tk' ? product.category.nameTk : product.category.nameRu }}</div>
          <h1 class="prod-title">{{ lang === 'tk' ? product.nameTk : product.nameRu }}</h1>

          <div class="prod-meta">
            <span :class="['stock-badge', product.stock > 0 ? 'in' : 'out']">
              {{ product.stock > 0
                ? (lang === 'tk' ? '✓ Stokda bar'  : '✓ В наличии')
                : (lang === 'tk' ? 'Stokda ýok'    : 'Нет в наличии') }}
            </span>
            <span class="sold-count">{{ product.sold }} {{ lang === 'tk' ? 'gezek satyldy' : 'продано' }}</span>
          </div>

          <!-- Price box -->
          <div class="price-box">
            <div class="price-main">${{ fmt(clientPrice) }}</div>
            <div class="price-meta">
              <span class="price-label">{{ lang === 'tk' ? 'Önüm bahasy' : 'Цена товара' }}</span>
            </div>
          </div>

          <!-- Options -->
          <ProductOptionsSelector
            v-if="hasOptions"
            ref="optionsSelectorRef"
            v-model="selectedOptions"
            :options="product.options"
            :lang="lang"
          />

          <!-- Delivery -->
          <div class="delivery-section">
            <h3 class="section-label">{{ lang === 'tk' ? 'Eltip beriş' : 'Способ доставки' }}</h3>
            <div class="delivery-options">
              <label :class="['d-option', { active: delivery === 'simple' }]">
                <input type="radio" v-model="delivery" value="simple" />
                <div class="d-body">
                  <div class="d-top">
                    <span>🚚 {{ lang === 'tk' ? 'Adaty (15–30 gün)' : 'Обычная (15–30 дней)' }}</span>
                    <span class="d-cost">${{ fmt((product.weightG ?? 0) / 1000 * SIMPLE_RATE) }}</span>
                  </div>
                </div>
              </label>
              <label :class="['d-option', { active: delivery === 'fast' }]">
                <input type="radio" v-model="delivery" value="fast" />
                <div class="d-body">
                  <div class="d-top">
                    <span>⚡ {{ lang === 'tk' ? 'Tiz (7–15 gün)' : 'Быстрая (7–15 дней)' }}</span>
                    <span class="d-cost">${{ fmt((product.weightG ?? 0) / 1000 * FAST_RATE) }}</span>
                  </div>
                </div>
              </label>
            </div>
            <div class="home-delivery-toggle">
              <label class="hd-label">
                <input type="checkbox" v-model="homeDelivery" />
                <span class="hd-text">
                  🏠 {{ lang === 'tk' ? 'Öýe eltip bermek' : 'Доставка домой' }}
                </span>
                <span class="hd-cost">+$1.00</span>
              </label>
            </div>
          </div>

          <!-- Total summary -->
          <div class="total-box">
            <div class="total-rows">
              <div class="total-row">
                <span>{{ lang === 'tk' ? 'Önüm' : 'Товар' }}</span>
                <strong>${{ fmt(clientPrice) }}</strong>
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
          <div v-if="hasOptions && Object.keys(selectedOptions).length" class="options-summary">
            <div v-for="opt in product.options.filter(o => selectedOptions[o.id])" :key="opt.id" class="opt-row">
              <span class="opt-key">{{ lang === 'tk' ? opt.nameTk : opt.nameRu }}:</span>
              <span class="opt-val">{{ selectedOptions[opt.id] }}{{ opt.unit ? ' ' + opt.unit : '' }}</span>
            </div>
          </div>

          <!-- Add to cart -->
          <div class="action-row">
            <div class="qty-ctrl">
              <button @click="qty = Math.max(1, qty - 1)">−</button>
              <span>{{ qty }}</span>
              <button @click="qty = Math.min(product.stock || 99, qty + 1)">+</button>
            </div>
            <button :class="['add-btn', { added }]" :disabled="product.stock === 0" @click="addToCart">
              <span v-if="!added">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="16" height="16" style="margin-right:6px;vertical-align:middle"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
                {{ lang === 'tk' ? 'Sebede Goş' : 'В корзину' }}
              </span>
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
                v-if="p.imageUrls?.length || p.imageUrl"
                :src="p.imageUrls?.[0] ?? p.imageUrl"
                :alt="lang === 'tk' ? p.nameTk : p.nameRu"
                class="rel-img"
              />
              <span v-else class="rel-emoji">{{ p.image }}</span>
              <span v-if="p.stock === 0" class="rel-out">{{ lang === 'tk' ? 'Ýok' : 'Нет' }}</span>
              <span v-if="(p.imageUrls?.length ?? 0) > 1" class="rel-img-count">+{{ p.imageUrls!.length - 1 }}</span>
            </NuxtLink>
            <div class="rel-body">
              <div class="rel-cat">{{ lang === 'tk' ? p.category.nameTk : p.category.nameRu }}</div>
              <NuxtLink :to="`/products/${p.id}`" class="rel-name">{{ lang === 'tk' ? p.nameTk : p.nameRu }}</NuxtLink>
              <div class="rel-footer">
                <span class="rel-price">${{ fmt(Number(p.price) * (1 + (p.markup ?? 50) / 100)) }}</span>
                <button :class="['rel-cart-btn', { added: addedRelated === p.id }]" :disabled="p.stock === 0" @click.prevent="addRelatedToCart(p)">
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
.bc-inner a { color: var(--subtle); text-decoration: none; transition: color .12s; }
.bc-inner a:hover { color: var(--gold); }
.bc-sep { opacity: .4; }
.bc-current { color: var(--dark); font-weight: 600; }

/* Layout */
.page-inner { max-width: 1100px; margin: 0 auto; padding: 36px 24px 52px; }
.product-layout { display: grid; grid-template-columns: 1fr 1fr; gap: 56px; align-items: start; }

/* ── Image column ── */
.image-col { position: sticky; top: 90px; display: flex; flex-direction: column; gap: 12px; }

.main-image-wrap {
  position: relative; width: 100%; aspect-ratio: 1;
  background: var(--white); border-radius: var(--radius-xl);
  border: 1.5px solid var(--border-light);
  overflow: hidden; cursor: zoom-in;
  box-shadow: 0 8px 32px rgba(0,0,0,.08);
}
.main-img { width: 100%; height: 100%; object-fit: cover; transition: transform .4s ease; }
.main-image-wrap:hover .main-img { transform: scale(1.03); }
.big-emoji { position: absolute; top: 50%; left: 50%; transform: translate(-50%,-50%); font-size: 120px; }

.img-count-pill {
  position: absolute; bottom: 14px; left: 50%; transform: translateX(-50%);
  background: rgba(0,0,0,.55); color: #fff;
  font-size: 12px; font-weight: 700;
  padding: 4px 12px; border-radius: var(--radius-pill);
  backdrop-filter: blur(4px);
  pointer-events: none;
}

.expand-hint {
  position: absolute; top: 12px; right: 12px;
  width: 32px; height: 32px; border-radius: var(--radius-md);
  background: rgba(255,255,255,.85); backdrop-filter: blur(4px);
  display: flex; align-items: center; justify-content: center;
  opacity: 0; transition: opacity .2s;
  pointer-events: none;
}
.main-image-wrap:hover .expand-hint { opacity: 1; }
.expand-hint svg { width: 14px; height: 14px; color: var(--dark); }

.img-nav {
  position: absolute; top: 50%; transform: translateY(-50%);
  width: 36px; height: 36px; border-radius: 50%;
  background: rgba(255,255,255,.9); backdrop-filter: blur(4px);
  border: 1.5px solid var(--border-light);
  font-size: 20px; color: var(--dark); cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  opacity: 0; transition: opacity .2s, transform .15s;
  z-index: 5;
}
.img-prev { left: 10px; }
.img-next { right: 10px; }
.main-image-wrap:hover .img-nav { opacity: 1; }
.img-nav:hover { background: var(--white); transform: translateY(-50%) scale(1.08); }

/* Thumbnails */
.thumbs { display: flex; gap: 8px; overflow-x: auto; padding-bottom: 2px; scrollbar-width: none; }
.thumbs::-webkit-scrollbar { display: none; }
.thumb {
  flex-shrink: 0; width: 68px; height: 68px;
  border-radius: var(--radius-md); overflow: hidden;
  border: 2px solid var(--border-light);
  background: var(--surface); cursor: pointer;
  transition: border-color .15s, transform .15s;
  padding: 0;
}
.thumb img { width: 100%; height: 100%; object-fit: cover; }
.thumb.active { border-color: var(--gold); transform: scale(1.05); }
.thumb:hover:not(.active) { border-color: var(--border); transform: scale(1.03); }

/* Wishlist */
.wishlist-row {
  display: flex; align-items: center; gap: 8px; justify-content: center;
  padding: 10px 16px; border-radius: var(--radius-md);
  border: 1.5px solid var(--border-light); background: var(--white);
  font-size: 13px; font-weight: 600; color: var(--muted);
  cursor: pointer; font-family: var(--font-body); transition: all .15s;
}
.wishlist-row:hover { border-color: #EF4444; color: #EF4444; background: #FEF2F2; }

/* ── Info column ── */
.prod-cat   { font-size: 11px; color: var(--subtle); text-transform: uppercase; letter-spacing: .08em; margin-bottom: 8px; font-family: var(--font-body); font-weight: 700; }
.prod-title { font-family: var(--font-display); font-size: 28px; font-weight: 700; color: var(--dark); line-height: 1.25; margin-bottom: 16px; }

.prod-meta  { display: flex; align-items: center; gap: 12px; margin-bottom: 20px; flex-wrap: wrap; }
.stock-badge { padding: 4px 12px; border-radius: var(--radius-pill); font-size: 12px; font-weight: 700; font-family: var(--font-body); }
.stock-badge.in  { background: #DCFCE7; color: #14532D; }
.stock-badge.out { background: #FEE2E2; color: #991B1B; }
.sold-count { font-size: 13px; color: var(--subtle); font-family: var(--font-body); }

/* Price */
.price-box {
  display: flex; align-items: center; justify-content: space-between;
  background: var(--white); border-radius: var(--radius-lg);
  border: 1.5px solid var(--border-light);
  padding: 16px 20px; margin-bottom: 14px;
  box-shadow: 0 2px 8px rgba(0,0,0,.04);
}
.price-main  { font-family: var(--font-display); font-size: 36px; font-weight: 800; color: var(--gold); }
.price-meta  { display: flex; flex-direction: column; align-items: flex-end; gap: 4px; }
.price-label { font-size: 11px; color: var(--subtle); font-family: var(--font-body); }
.markup-chip { font-size: 11px; font-weight: 700; background: #EDE9FE; color: #7C3AED; padding: 2px 8px; border-radius: var(--radius-pill); }

.weight-info { display: flex; align-items: center; gap: 6px; font-size: 13px; color: var(--subtle); background: var(--surface); padding: 8px 14px; border-radius: var(--radius-md); margin-bottom: 14px; font-family: var(--font-body); }

/* Section label */
.section-label { font-size: 12px; font-weight: 700; color: var(--dark); margin-bottom: 10px; font-family: var(--font-body); text-transform: uppercase; letter-spacing: .04em; }

/* Delivery */
.delivery-section { margin: 14px 0 16px; }
.delivery-options { display: flex; flex-direction: column; gap: 8px; }
.d-option { display: flex; align-items: flex-start; gap: 10px; padding: 12px 14px; border-radius: var(--radius-md); border: 1.5px solid var(--border); background: var(--white); cursor: pointer; transition: all .12s; }
.d-option input[type="radio"] { margin-top: 3px; accent-color: var(--gold); }
.d-option.active { border-color: var(--gold); background: rgba(232,160,32,.05); }
.d-body { flex: 1; }
.d-top  { display: flex; justify-content: space-between; font-size: 13px; font-weight: 700; color: var(--dark); font-family: var(--font-body); }
.d-cost { color: var(--gold); }
.d-rate { font-size: 11px; color: var(--subtle); margin-top: 3px; display: block; font-family: var(--font-body); }

/* Total */
.total-box { background: var(--white); border-radius: var(--radius-lg); border: 1.5px solid var(--border-light); overflow: hidden; margin-bottom: 14px; box-shadow: 0 2px 8px rgba(0,0,0,.04); }
.total-rows { padding: 14px 16px; display: flex; flex-direction: column; gap: 8px; border-bottom: 1px solid var(--border-light); }
.total-row  { display: flex; justify-content: space-between; font-size: 13px; font-family: var(--font-body); }
.total-row span { color: var(--subtle); }
.total-row strong { color: var(--dark); font-weight: 700; }
.total-final { display: flex; justify-content: space-between; align-items: center; padding: 14px 16px; background: linear-gradient(135deg, rgba(232,160,32,.06), rgba(232,160,32,.02)); }
.total-final span { font-size: 13px; font-weight: 700; color: var(--dark); font-family: var(--font-body); }
.total-final strong { font-family: var(--font-display); font-size: 28px; font-weight: 800; color: var(--dark); }

/* Options summary */
.options-summary { display: flex; flex-wrap: wrap; gap: 8px; padding: 10px 14px; background: var(--surface); border-radius: var(--radius-md); border: 1px solid var(--border-light); margin-bottom: 14px; }
.opt-row { display: flex; align-items: center; gap: 5px; }
.opt-key { font-size: 12px; color: var(--subtle); font-family: var(--font-body); }
.opt-val { font-size: 12px; font-weight: 700; border: 1.5px solid var(--gold); color: var(--gold); padding: 1px 8px; border-radius: var(--radius-pill); font-family: var(--font-body); }

/* Action row */
.action-row { display: flex; gap: 12px; align-items: center; margin-bottom: 12px; }
.qty-ctrl { display: flex; align-items: center; background: var(--white); border: 1.5px solid var(--border); border-radius: var(--radius-md); overflow: hidden; }
.qty-ctrl button { width: 38px; height: 48px; border: none; background: none; font-size: 20px; color: var(--dark); cursor: pointer; transition: background .12s; font-family: var(--font-body); }
.qty-ctrl button:hover { background: var(--surface); }
.qty-ctrl span { min-width: 40px; text-align: center; font-size: 16px; font-weight: 700; color: var(--dark); font-family: var(--font-body); }

.add-btn {
  flex: 1; height: 48px; border-radius: var(--radius-md); border: none;
  background: linear-gradient(135deg, var(--gold), var(--gold-dark));
  color: var(--white); font-size: 15px; font-weight: 800;
  cursor: pointer; font-family: var(--font-body);
  transition: all .2s; box-shadow: 0 4px 16px var(--gold-shadow);
  display: flex; align-items: center; justify-content: center;
}
.add-btn.added  { background: linear-gradient(135deg, #22C55E, #16A34A); box-shadow: none; }
.add-btn:disabled { background: var(--border); box-shadow: none; cursor: not-allowed; color: var(--subtle); }
.add-btn:hover:not(:disabled):not(.added) { transform: translateY(-2px); box-shadow: 0 8px 24px var(--gold-shadow); }

.go-cart-link { display: block; text-align: center; font-size: 13px; font-weight: 700; color: var(--gold); text-decoration: none; font-family: var(--font-body); transition: opacity .15s; }
.go-cart-link:hover { opacity: .75; }

/* Related */
.related-section { background: var(--white); border-top: 1px solid var(--border-light); padding: 52px 0; }
.related-inner   { max-width: 1100px; margin: 0 auto; padding: 0 24px; }
.related-header  { display: flex; align-items: center; justify-content: space-between; margin-bottom: 24px; }
.related-title   { font-family: var(--font-display); font-size: 22px; font-weight: 700; color: var(--dark); }
.see-all         { font-size: 13px; font-weight: 700; color: var(--gold); text-decoration: none; }
.see-all:hover   { text-decoration: underline; }

.related-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; }
.rel-card { background: var(--surface); border-radius: var(--radius-lg); border: 1.5px solid var(--border-light); overflow: hidden; transition: all .2s; }
.rel-card:hover { transform: translateY(-4px); box-shadow: 0 12px 32px rgba(0,0,0,.1); border-color: rgba(232,160,32,.3); }

.rel-img-wrap { display: block; width: 100%; aspect-ratio: 1; background: var(--white); position: relative; overflow: hidden; text-decoration: none; }
.rel-img { width: 100%; height: 100%; object-fit: cover; transition: transform .35s; }
.rel-card:hover .rel-img { transform: scale(1.06); }
.rel-emoji { position: absolute; top: 50%; left: 50%; transform: translate(-50%,-50%); font-size: 52px; }
.rel-out { position: absolute; top: 8px; left: 8px; background: rgba(0,0,0,.65); color: white; font-size: 10px; font-weight: 700; padding: 2px 7px; border-radius: var(--radius-pill); }
.rel-img-count { position: absolute; bottom: 8px; right: 8px; background: rgba(0,0,0,.55); color: white; font-size: 10px; font-weight: 700; padding: 2px 7px; border-radius: var(--radius-pill); backdrop-filter: blur(4px); }

.rel-body { padding: 12px 14px; }
.rel-cat  { font-size: 10px; color: var(--subtle); text-transform: uppercase; letter-spacing: .04em; margin-bottom: 4px; font-family: var(--font-body); }
.rel-name { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; font-size: 13px; font-weight: 700; color: var(--dark); text-decoration: none; line-height: 1.35; margin-bottom: 10px; font-family: var(--font-body); display: block; }
.rel-name:hover { color: var(--gold); }
.rel-footer { display: flex; align-items: center; justify-content: space-between; }
.rel-price  { font-family: var(--font-display); font-size: 16px; font-weight: 800; color: var(--gold); }
.rel-cart-btn { width: 30px; height: 30px; border-radius: 50%; border: none; background: var(--dark); color: white; font-size: 16px; font-weight: 700; cursor: pointer; transition: all .15s; display: flex; align-items: center; justify-content: center; }
.rel-cart-btn.added { background: #22C55E; }
.rel-cart-btn:disabled { background: var(--border); cursor: not-allowed; }
.rel-cart-btn:hover:not(:disabled):not(.added) { background: var(--gold); }

/* ── Lightbox ── */
.lightbox {
  position: fixed; inset: 0; z-index: 9999;
  background: rgba(0,0,0,.92);
  display: flex; align-items: center; justify-content: center;
  padding: 20px;
}
.lb-img { max-width: 90vw; max-height: 88vh; object-fit: contain; border-radius: var(--radius-lg); box-shadow: 0 24px 80px rgba(0,0,0,.5); }
.lb-close {
  position: absolute; top: 20px; right: 24px;
  width: 40px; height: 40px; border-radius: 50%;
  background: rgba(255,255,255,.15); border: none;
  color: white; font-size: 24px; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  transition: background .15s;
}
.lb-close:hover { background: rgba(255,255,255,.25); }
.lb-arrow {
  position: absolute; top: 50%; transform: translateY(-50%);
  width: 44px; height: 44px; border-radius: 50%;
  background: rgba(255,255,255,.15); border: none;
  color: white; font-size: 26px; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  transition: background .15s;
}
.lb-arrow:hover { background: rgba(255,255,255,.25); }
.lb-prev { left: 20px; }
.lb-next { right: 20px; }
.lb-counter { position: absolute; bottom: 20px; left: 50%; transform: translateX(-50%); color: rgba(255,255,255,.7); font-size: 13px; font-weight: 600; font-family: var(--font-body); }

.lb-enter-active, .lb-leave-active { transition: opacity .2s; }
.lb-enter-from, .lb-leave-to { opacity: 0; }
.home-delivery-toggle {
  margin-top: 10px;
  padding: 12px 14px;
  border-radius: var(--radius-md);
  border: 1.5px solid var(--border);
  background: var(--white);
}
.hd-label {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
}
.hd-label input[type="checkbox"] { accent-color: var(--gold); width: 16px; height: 16px; }
.hd-text  { flex: 1; font-size: 13px; font-weight: 700; color: var(--dark); font-family: var(--font-body); }
.hd-cost  { font-size: 13px; font-weight: 700; color: var(--gold); }
/* Responsive */
@media (max-width: 768px) {
  .product-layout { grid-template-columns: 1fr; gap: 28px; }
  .image-col { position: static; }
  .related-grid { grid-template-columns: repeat(2, 1fr); }
  .prod-title { font-size: 22px; }
}
</style>