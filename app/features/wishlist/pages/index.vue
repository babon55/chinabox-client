<script setup lang="ts">
import { useWishlistStore } from '../stores/wishlist.store'

definePageMeta({ layout: 'default' })

const lang  = ref<'tk' | 'ru'>('tk')
const store = useWishlistStore()
const cart  = useCartStore()

onMounted(() => {
  store.restore()
  cart.restoreCart()
  const saved = localStorage.getItem('silkshop_lang')
  if (saved === 'tk' || saved === 'ru') lang.value = saved
})

const addedToCart = ref<string | null>(null)

function moveToCart(item: typeof store.items[0]) {
  cart.addItem({
    id:      item.id,
    name:    { tk: item.nameTk, ru: item.nameRu },
    image:   item.imageUrl ?? item.image,
    price:   item.price,
    weightG: item.weightG ?? null,
    quantity: 1,
    seller:  'SilkShop',
    inStock: item.stock > 0,
  })
  store.remove(item.id)
  addedToCart.value = item.id
  setTimeout(() => addedToCart.value = null, 2000)
}

function fmt(n: number) { return Number(n).toFixed(2) }

useHead({ title: computed(() => lang.value === 'tk' ? `Halanlar (${store.total}) – SilkShop` : `Избранное (${store.total}) – SilkShop`) })
</script>

<template>
  <div class="wishlist-page">

    <!-- Breadcrumb -->
    <div class="bc-bar">
      <div class="bc-inner">
        <NuxtLink to="/">{{ lang === 'tk' ? 'Baş sahypa' : 'Главная' }}</NuxtLink>
        <span>›</span>
        <span>{{ lang === 'tk' ? 'Halanlar' : 'Избранное' }}</span>
        <span v-if="store.total > 0" class="bc-count">({{ store.total }})</span>
      </div>
    </div>

    <div class="page-inner">

      <!-- Header -->
      <div class="page-header">
        <div class="header-left">
          <h1 class="page-title">
            <span class="heart-icon">❤️</span>
            {{ lang === 'tk' ? 'Halanlarym' : 'Избранное' }}
          </h1>
          <span v-if="store.total > 0" class="item-count">{{ store.total }} {{ lang === 'tk' ? 'haryt' : 'товаров' }}</span>
        </div>
        <button v-if="store.total > 0" class="clear-btn" @click="store.clear()">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/></svg>
          {{ lang === 'tk' ? 'Hemmesini aýyr' : 'Очистить всё' }}
        </button>
      </div>

      <!-- Empty state -->
      <div v-if="!store.total" class="empty-state">
        <div class="empty-heart">💔</div>
        <h2>{{ lang === 'tk' ? 'Halanlar sanaw boş' : 'Список избранного пуст' }}</h2>
        <p>{{ lang === 'tk'
          ? 'Harytlary görmek we ýürek nyşanyna basmak bilen halanlaryňyzy ýygnaň'
          : 'Просматривайте товары и нажимайте на сердечко чтобы добавить в избранное' }}</p>
        <NuxtLink to="/products" class="shop-btn">
          {{ lang === 'tk' ? '🛍️ Harytlara Git' : '🛍️ Смотреть товары' }}
        </NuxtLink>
      </div>

      <!-- Grid -->
      <div v-else class="wishlist-grid">
        <TransitionGroup name="item" tag="div" class="grid-inner">
          <div v-for="item in store.items" :key="item.id" class="wish-card">

            <!-- Remove button -->
            <button class="remove-btn" @click="store.remove(item.id)" :title="lang === 'tk' ? 'Aýyr' : 'Удалить'">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>

            <!-- Image -->
            <NuxtLink :to="`/products/${item.id}`" class="card-img-wrap">
              <img v-if="item.imageUrl" :src="item.imageUrl" :alt="lang === 'tk' ? item.nameTk : item.nameRu" class="card-img" />
              <span v-else class="card-emoji">{{ item.image }}</span>
              <span v-if="item.stock === 0" class="out-badge">{{ lang === 'tk' ? 'Ýok' : 'Нет в наличии' }}</span>
            </NuxtLink>

            <!-- Body -->
            <div class="card-body">
              <div class="card-cat">{{ lang === 'tk' ? item.category.nameTk : item.category.nameRu }}</div>
              <NuxtLink :to="`/products/${item.id}`" class="card-name">
                {{ lang === 'tk' ? item.nameTk : item.nameRu }}
              </NuxtLink>
              <div class="card-price">${{ fmt(item.price) }}</div>

              <!-- Added date -->
              <div class="added-date">
                🕐 {{ new Date(item.addedAt).toLocaleDateString(lang === 'tk' ? 'tk-TM' : 'ru-RU', { day: '2-digit', month: 'short' }) }}
              </div>

              <!-- Actions -->
              <div class="card-actions">
                <button
                  class="cart-btn"
                  :disabled="item.stock === 0"
                  @click="moveToCart(item)"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
                    <line x1="3" y1="6" x2="21" y2="6"/>
                    <path d="M16 10a4 4 0 0 1-8 0"/>
                  </svg>
                  {{ item.stock === 0
                    ? (lang === 'tk' ? 'Stokda ýok' : 'Нет в наличии')
                    : (lang === 'tk' ? 'Sebede Goş' : 'В корзину') }}
                </button>
              </div>
            </div>

          </div>
        </TransitionGroup>
      </div>

      <!-- Continue shopping -->
      <div v-if="store.total > 0" class="continue-row">
        <NuxtLink to="/products" class="continue-link">
          ← {{ lang === 'tk' ? 'Söwda dowam et' : 'Продолжить покупки' }}
        </NuxtLink>
      </div>

    </div>
  </div>
</template>

<style scoped>
.wishlist-page { min-height: 80vh; background: var(--surface); font-family: var(--font-body); }

.bc-bar   { background: var(--white); border-bottom: 1px solid var(--border-light); padding: 12px 0; }
.bc-inner { max-width: 1280px; margin: 0 auto; padding: 0 24px; display: flex; align-items: center; gap: 8px; font-size: 13px; color: var(--subtle); }
.bc-inner a { color: var(--subtle); text-decoration: none; }
.bc-inner a:hover { color: var(--gold); }
.bc-count { color: var(--subtle); }

.page-inner  { max-width: 1280px; margin: 0 auto; padding: 28px 24px 60px; }

/* Header */
.page-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 28px; flex-wrap: wrap; gap: 12px; }
.header-left { display: flex; align-items: center; gap: 14px; }
.page-title  { font-family: var(--font-display); font-size: 26px; font-weight: 700; color: var(--dark); display: flex; align-items: center; gap: 10px; }
.heart-icon  { font-size: 24px; }
.item-count  { font-size: 14px; color: var(--subtle); background: var(--surface); border: 1.5px solid var(--border-light); padding: 3px 12px; border-radius: var(--radius-pill); }
.clear-btn   { display: flex; align-items: center; gap: 6px; height: 36px; padding: 0 16px; border-radius: var(--radius-md); border: 1.5px solid #FECACA; background: #FEF2F2; color: #DC2626; font-size: 12px; font-weight: 600; cursor: pointer; font-family: var(--font-body); transition: all .15s; }
.clear-btn:hover { background: #DC2626; color: white; border-color: #DC2626; }

/* Empty */
.empty-state { display: flex; flex-direction: column; align-items: center; gap: 16px; padding: 80px 20px; text-align: center; }
.empty-heart { font-size: 64px; animation: heartbeat 2s ease-in-out infinite; }
@keyframes heartbeat { 0%,100% { transform: scale(1); } 50% { transform: scale(1.1); } }
.empty-state h2 { font-family: var(--font-display); font-size: 24px; font-weight: 700; color: var(--dark); }
.empty-state p  { font-size: 15px; color: var(--subtle); max-width: 400px; line-height: 1.6; }
.shop-btn { display: inline-flex; align-items: center; height: 46px; padding: 0 28px; border-radius: var(--radius-pill); background: linear-gradient(135deg, var(--gold), var(--gold-dark)); color: white; font-size: 14px; font-weight: 700; text-decoration: none; box-shadow: 0 4px 16px var(--gold-shadow); transition: all .15s; margin-top: 8px; }
.shop-btn:hover { transform: translateY(-2px); }

/* Grid */
.wishlist-grid { }
.grid-inner    { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 18px; }

/* Card */
.wish-card {
  background: var(--white); border-radius: var(--radius-lg);
  border: 1.5px solid var(--border-light); overflow: hidden;
  box-shadow: var(--shadow-sm); transition: all .18s;
  display: flex; flex-direction: column; position: relative;
}
.wish-card:hover { box-shadow: var(--shadow-md); transform: translateY(-3px); border-color: rgba(239,68,68,.2); }

.remove-btn {
  position: absolute; top: 10px; right: 10px; z-index: 10;
  width: 28px; height: 28px; border-radius: 50%;
  border: none; background: rgba(255,255,255,.9);
  backdrop-filter: blur(4px); color: #9CA3AF;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; transition: all .15s;
}
.remove-btn svg { width: 12px; height: 12px; }
.remove-btn:hover { background: #EF4444; color: white; }

.card-img-wrap { display: block; width: 100%; aspect-ratio: 1; background: var(--surface); position: relative; overflow: hidden; text-decoration: none; }
.card-img  { width: 100%; height: 100%; object-fit: cover; transition: transform .3s; }
.wish-card:hover .card-img { transform: scale(1.05); }
.card-emoji { position: absolute; top: 50%; left: 50%; transform: translate(-50%,-50%); font-size: 64px; }
.out-badge  { position: absolute; top: 10px; left: 10px; background: rgba(0,0,0,.65); color: white; font-size: 11px; font-weight: 700; padding: 2px 8px; border-radius: var(--radius-pill); }

.card-body  { padding: 14px 16px; display: flex; flex-direction: column; gap: 6px; flex: 1; }
.card-cat   { font-size: 10px; color: var(--subtle); text-transform: uppercase; letter-spacing: .05em; }
.card-name  { font-size: 14px; font-weight: 700; color: var(--dark); text-decoration: none; line-height: 1.35; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.card-name:hover { color: var(--gold); }
.card-price { font-family: var(--font-display); font-size: 18px; font-weight: 800; color: var(--gold); }
.added-date { font-size: 11px; color: var(--subtle); }

.card-actions { margin-top: auto; padding-top: 8px; }
.cart-btn {
  width: 100%; height: 38px; border-radius: var(--radius-md);
  border: none; background: var(--dark); color: white;
  font-size: 13px; font-weight: 700; cursor: pointer;
  font-family: var(--font-body); transition: all .15s;
  display: flex; align-items: center; justify-content: center; gap: 7px;
}
.cart-btn:hover:not(:disabled) { background: var(--gold); }
.cart-btn:disabled { background: var(--border); color: var(--subtle); cursor: not-allowed; }

/* Continue */
.continue-row  { margin-top: 32px; display: flex; justify-content: center; }
.continue-link { font-size: 14px; font-weight: 700; color: var(--gold); text-decoration: none; }
.continue-link:hover { text-decoration: underline; }

/* Transitions */
.item-enter-active { transition: all .3s ease; }
.item-leave-active { transition: all .25s ease; }
.item-enter-from   { opacity: 0; transform: scale(.95); }
.item-leave-to     { opacity: 0; transform: scale(.9); }
.item-leave-active { position: absolute; }

@media (max-width: 480px) {
  .grid-inner { grid-template-columns: repeat(2, 1fr); gap: 12px; }
}
</style>