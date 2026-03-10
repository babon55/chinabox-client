<script setup lang="ts">
import CartItem    from '../components/CartItem.vue'
import CartSummary from '../components/CartSummary.vue'
import CartEmpty   from '../components/CartEmpty.vue'
import { useCart } from '../composables/useCart'
import { useCartStore } from '../stores/cart.store'
import type { Lang } from '../types'

const currentLang = ref<Lang>('tk')
const store       = useCartStore()
const lang        = computed(() => currentLang.value)
const { t }       = useCart(lang)

useHead({
  title: computed(() =>
    currentLang.value === 'tk' ? `Sebedim (${store.totalItems}) – SilkShop` : `Корзина (${store.totalItems}) – SilkShop`
  ),
})
</script>

<template>
  <div class="cart-page">
    <!-- Page header -->
    <div class="page-header">
      <div class="page-header-inner">
        <div class="breadcrumb">
          <NuxtLink to="/" class="breadcrumb-link">
            {{ currentLang === 'tk' ? 'Baş sahypa' : 'Главная' }}
          </NuxtLink>
          <span class="breadcrumb-sep">/</span>
          <span class="breadcrumb-current">{{ t.title }}</span>
        </div>

        <div class="header-right">
          <h1 class="page-title">
            {{ t.title }}
            <span v-if="store.totalItems > 0" class="item-count">
              {{ store.totalItems }} {{ t.items }}
            </span>
          </h1>

          <div class="header-actions">
            <!-- Language toggle -->
            <div class="lang-toggle">
              <button :class="['lang-pill', { active: currentLang === 'tk' }]" @click="currentLang = 'tk'">🇹🇲 TK</button>
              <button :class="['lang-pill', { active: currentLang === 'ru' }]" @click="currentLang = 'ru'">🇷🇺 RU</button>
            </div>

            <!-- Clear cart -->
            <button v-if="store.items.length > 0" class="clear-btn" @click="store.clearCart()">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/>
              </svg>
              {{ t.clearCart }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Main content -->
    <div class="cart-body">
      <div class="cart-inner">

        <!-- Empty state -->
        <template v-if="store.items.length === 0">
          <CartEmpty :current-lang="currentLang" class="empty-full" />
        </template>

        <!-- Cart items + summary -->
        <template v-else>
          <!-- Left: items list -->
          <div class="items-col">
            <TransitionGroup name="item-list" tag="div" class="items-list">
              <CartItem
                v-for="item in store.items"
                :key="item.id"
                :item="item"
                :current-lang="currentLang"
              />
            </TransitionGroup>
          </div>

          <!-- Right: summary -->
          <div class="summary-col">
            <CartSummary :current-lang="currentLang" />
          </div>
        </template>

      </div>
    </div>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Playfair+Display:wght@700&display=swap');

*, *::before, *::after { box-sizing: border-box; }

.cart-page {
  min-height: 100vh;
  background: #F9FAFB;
  font-family: 'Plus Jakarta Sans', sans-serif;
}

/* Page header */
.page-header {
  background: white;
  border-bottom: 1px solid #E5E7EB;
  padding: 20px 0;
}
.page-header-inner {
  max-width: 1280px; margin: 0 auto;
  padding: 0 24px;
  display: flex; flex-direction: column; gap: 10px;
}
.breadcrumb {
  display: flex; align-items: center; gap: 8px;
  font-size: 13px; color: #9CA3AF;
  font-family: 'Plus Jakarta Sans', sans-serif;
}
.breadcrumb-link { color: #9CA3AF; text-decoration: none; transition: color 0.2s; }
.breadcrumb-link:hover { color: #E8A020; }
.breadcrumb-sep { color: #D1D5DB; }
.breadcrumb-current { color: #374151; font-weight: 600; }

.header-right {
  display: flex; align-items: center;
  justify-content: space-between; flex-wrap: wrap; gap: 12px;
}
.page-title {
  font-family: 'Playfair Display', serif;
  font-size: 28px; font-weight: 700; color: #0F1117;
  display: flex; align-items: center; gap: 12px;
}
.item-count {
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 14px; font-weight: 600; color: #9CA3AF;
}

.header-actions { display: flex; align-items: center; gap: 12px; }

.lang-toggle {
  display: flex; gap: 4px; background: #F3F4F6;
  border-radius: 50px; padding: 3px;
}
.lang-pill {
  padding: 5px 12px; border-radius: 50px; border: none;
  background: transparent; font-size: 12px; font-weight: 600;
  color: #6B7280; cursor: pointer; transition: all 0.2s;
  font-family: 'Plus Jakarta Sans', sans-serif;
}
.lang-pill.active { background: #0F1117; color: white; }

.clear-btn {
  display: flex; align-items: center; gap: 6px;
  padding: 7px 14px; border-radius: 8px;
  border: 1.5px solid #FECACA; background: #FEF2F2;
  color: #DC2626; font-size: 12px; font-weight: 600;
  cursor: pointer; transition: all 0.2s;
  font-family: 'Plus Jakarta Sans', sans-serif;
}
.clear-btn:hover { background: #DC2626; color: white; border-color: #DC2626; }

/* Body */
.cart-body { padding: 32px 0; }
.cart-inner {
  max-width: 1280px; margin: 0 auto;
  padding: 0 24px;
  display: grid;
  grid-template-columns: 1fr 380px;
  gap: 28px;
  align-items: start;
}

.empty-full { grid-column: 1 / -1; }

/* Items list */
.items-col { display: flex; flex-direction: column; gap: 0; }
.items-list { display: flex; flex-direction: column; gap: 16px; }

/* Transition for item removal */
.item-list-enter-active { transition: all 0.4s ease; }
.item-list-leave-active { transition: all 0.3s ease; }
.item-list-enter-from   { opacity: 0; transform: translateX(-20px); }
.item-list-leave-to     { opacity: 0; transform: translateX(20px); height: 0; margin: 0; }

@media (max-width: 1024px) { .cart-inner { grid-template-columns: 1fr 340px; } }
@media (max-width: 768px)  { .cart-inner { grid-template-columns: 1fr; } }
@media (max-width: 480px)  { .cart-inner { padding: 0 16px; } .page-header-inner { padding: 0 16px; } }
</style>