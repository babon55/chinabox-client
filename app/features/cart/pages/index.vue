<template>
  <div class="cart-page">

    <!-- Page header -->
    <div class="page-header">
      <div class="page-header-inner">
        <div class="breadcrumb">
          <NuxtLink to="/" class="breadcrumb-link">{{ $t('footer.home') }}</NuxtLink>
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
            <div class="lang-toggle">
              <button :class="['lang-pill', { active: locale === 'tk' }]" @click="locale = 'tk'">🇹🇲 TK</button>
              <button :class="['lang-pill', { active: locale === 'ru' }]" @click="locale = 'ru'">🇷🇺 RU</button>
            </div>

            <button v-if="store.items.length > 0" class="clear-btn" @click="showClearConfirm = true">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="3 6 5 6 21 6"/>
                <path d="M19 6l-1 14H6L5 6"/>
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

        <template v-if="store.items.length === 0">
          <CartEmpty class="empty-full" />
        </template>

        <template v-else>
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

          <div class="summary-col">
            <CartSummary />
          </div>
        </template>

      </div>
    </div>

    <!-- Remove item confirm -->
    <ConfirmModal
      :visible="!!store.removeConfirmItem"
      :message="$t('cart.removeConfirm')"
      :confirm-text="$t('cart.removeYes')"
      :cancel-text="$t('cart.removeNo')"
      @confirm="store.confirmRemove()"
      @cancel="store.cancelRemove()"
    />

    <!-- Clear cart confirm -->
    <ConfirmModal
      :visible="showClearConfirm"
      :message="$t('cart.clearConfirm')"
      :confirm-text="$t('cart.clearYes')"
      :cancel-text="$t('cart.clearNo')"
      @confirm="handleClearCart"
      @cancel="showClearConfirm = false"
    />

  </div>
</template>

<script setup lang="ts">
import { ref, computed }  from 'vue'
import { useI18n }        from 'vue-i18n'
import { useCartStore }   from '../stores/cart.store'
import { useCart }        from '../composables/useCart'
import CartItem           from '../components/CartItem.vue'
import CartSummary        from '../components/CartSummary.vue'
import CartEmpty          from '../components/CartEmpty.vue'
import ConfirmModal       from '../components/ConfirmModal.vue'

const { locale, t }      = useI18n()
const store              = useCartStore()
const { t: cartT }       = useCart()
const showClearConfirm   = ref(false)

useHead({
  title: computed(() => `${t('cart.title')} (${store.totalItems}) – SilkShop`),
})

function handleClearCart() {
  store.clearCart()
  showClearConfirm.value = false
}
</script>

<style scoped>
.cart-page {
  min-height: 100vh;
  background: #f9fafb;
  font-family: 'Plus Jakarta Sans', sans-serif;
}

/* Header */
.page-header { background: white; border-bottom: 1px solid #e5e7eb; padding: 20px 0; }
.page-header-inner { max-width: 1280px; margin: 0 auto; padding: 0 24px; display: flex; flex-direction: column; gap: 10px; }
.breadcrumb { display: flex; align-items: center; gap: 8px; font-size: 13px; color: #9ca3af; }
.breadcrumb-link { color: #9ca3af; text-decoration: none; transition: color 0.2s; }
.breadcrumb-link:hover { color: #e8a020; }
.breadcrumb-sep { color: #d1d5db; }
.breadcrumb-current { color: #374151; font-weight: 600; }
.header-right { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px; }
.page-title { font-family: 'Playfair Display', serif; font-size: 28px; font-weight: 700; color: #0f1117; display: flex; align-items: center; gap: 12px; }
.item-count { font-family: 'Plus Jakarta Sans', sans-serif; font-size: 14px; font-weight: 600; color: #9ca3af; }
.header-actions { display: flex; align-items: center; gap: 12px; }

.lang-toggle { display: flex; gap: 4px; background: #f3f4f6; border-radius: 50px; padding: 3px; }
.lang-pill { padding: 5px 12px; border-radius: 50px; border: none; background: transparent; font-size: 12px; font-weight: 600; color: #6b7280; cursor: pointer; transition: all 0.2s; font-family: 'Plus Jakarta Sans', sans-serif; }
.lang-pill.active { background: #0f1117; color: white; }

.clear-btn { display: flex; align-items: center; gap: 6px; padding: 7px 14px; border-radius: 8px; border: 1.5px solid #fecaca; background: #fef2f2; color: #dc2626; font-size: 12px; font-weight: 600; cursor: pointer; transition: all 0.2s; font-family: 'Plus Jakarta Sans', sans-serif; }
.clear-btn:hover { background: #dc2626; color: white; border-color: #dc2626; }

/* Body */
.cart-body { padding: 32px 0; }
.cart-inner { max-width: 1280px; margin: 0 auto; padding: 0 24px; display: grid; grid-template-columns: 1fr 380px; gap: 28px; align-items: start; }
.empty-full { grid-column: 1 / -1; }
.items-col { display: flex; flex-direction: column; }
.items-list { display: flex; flex-direction: column; gap: 16px; }

/* Transitions */
.item-list-enter-active { transition: all 0.4s ease; }
.item-list-leave-active { transition: all 0.3s ease; }
.item-list-enter-from   { opacity: 0; transform: translateX(-20px); }
.item-list-leave-to     { opacity: 0; transform: translateX(20px); height: 0; margin: 0; }

@media (max-width: 1024px) { .cart-inner { grid-template-columns: 1fr 340px; } }
@media (max-width: 768px)  { .cart-inner { grid-template-columns: 1fr; } }
@media (max-width: 480px)  { .cart-inner { padding: 0 16px; } .page-header-inner { padding: 0 16px; } }
</style>