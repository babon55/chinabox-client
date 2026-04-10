<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import CartItem    from '../components/CartItem.vue'
import CartSummary from '../components/CartSummary.vue'
import CartEmpty   from '../components/CartEmpty.vue'
import { useCart } from '../composables/useCart'
import { useCartStore } from '../stores/cart.store'

const { locale, t } = useI18n()
const store = useCartStore()
const { t: cartT } = useCart() // cart-specific translations

const clearConfirm = ref(false)

useHead({
  title: computed(() =>
    `${t('cart.title')} (${store.totalItems}) – SilkShop`
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
            {{ $t('footer.home') }}
          </NuxtLink>
          <span class="breadcrumb-sep">/</span>
          <span class="breadcrumb-current">{{ cartT.title }}</span>
        </div>

        <div class="header-right">
          <h1 class="page-title">
            {{ cartT.title }}
            <span v-if="store.totalItems > 0" class="item-count">
              {{ store.totalItems }} {{ cartT.items }}
            </span>
          </h1>

          <div class="header-actions">
            <!-- Language toggle -->
            <div class="lang-toggle">
              <button :class="['lang-pill', { active: locale === 'tk' }]" @click="locale = 'tk'">🇹🇲 TK</button>
              <button :class="['lang-pill', { active: locale === 'ru' }]" @click="locale = 'ru'">🇷🇺 RU</button>
            </div>

            <!-- Clear cart -->
            <button v-if="store.items.length > 0" class="clear-btn" @click="clearConfirm = true">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/>
              </svg>
              {{ cartT.clearCart }}
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
          <CartEmpty class="empty-full" />
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
                @remove-requested="store.requestRemove(item)"
              />
            </TransitionGroup>
          </div>

          <!-- Right: summary -->
          <div class="summary-col">
            <CartSummary />
          </div>
        </template>

      </div>
    </div>
  </div>

  <!-- Confirm Remove Item Modal -->
  <Transition name="fade">
    <div v-if="store.removeConfirmItem" class="confirm-overlay" @click.self="store.cancelRemove()">
      <div class="confirm-modal">
        <p>{{ $t('cart.removeConfirm') }}</p>
        <div class="confirm-actions">
          <button class="btn-cancel" @click="store.cancelRemove()">{{ $t('cart.removeNo') }}</button>
          <button class="btn-confirm" @click="store.confirmRemove()">{{ $t('cart.removeYes') }}</button>
        </div>
      </div>
    </div>
  </Transition>

  <!-- Confirm Clear Cart Modal -->
  <Transition name="fade">
    <div v-if="clearConfirm" class="confirm-overlay" @click.self="clearConfirm = false">
      <div class="confirm-modal">
        <p>{{ $t('cart.clearConfirm') }}</p>
        <div class="confirm-actions">
          <button class="btn-cancel" @click="clearConfirm = false">{{ $t('cart.clearNo') }}</button>
          <button class="btn-confirm" @click="store.clearCart(); clearConfirm = false">{{ $t('cart.clearYes') }}</button>
        </div>
      </div>
    </div>
  </Transition>
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

/* Confirm modal overlay */
.confirm-overlay {
  position: fixed; inset: 0; background: rgba(0,0,0,.55);
  display: flex; align-items: center; justify-content: center;
  z-index: 1100; padding: 20px;
}
.confirm-modal {
  background: white; border-radius: 16px; padding: 24px;
  max-width: 320px; width: 100%; text-align: center;
  box-shadow: 0 12px 40px rgba(0,0,0,.25);
}
.confirm-modal p {
  font-size: 15px; font-weight: 600; color: #374151; margin-bottom: 16px;
}
.confirm-actions { display: flex; gap: 10px; justify-content: center; }
.btn-cancel, .btn-confirm {
  height: 38px; padding: 0 18px; border-radius: 8px; border: none;
  font-size: 13px; font-weight: 700; cursor: pointer; font-family: inherit;
}
.btn-cancel { background: #F3F4F6; color: #6B7280; }
.btn-cancel:hover { background: #E5E7EB; }
.btn-confirm { background: #EF4444; color: white; }
.btn-confirm:hover { background: #DC2626; }
</style>