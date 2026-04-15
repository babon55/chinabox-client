<template>
  <div class="summary-card">
    <CheckoutSuccess :visible="showSuccess" :order-id="store.lastOrderId" />

    <h2 class="summary-title">{{ t.orderSummary }}</h2>

    <div class="summary-rows">
      <div class="summary-row total">
        <span>{{ t.total }}</span>
        <span>{{ formatPrice(store.total) }}</span>
      </div>
    </div>

    <div v-if="store.checkoutError" class="checkout-error">
      ⚠ {{ store.checkoutError }}
    </div>

    <button
      class="checkout-btn"
      :disabled="store.checkoutLoading || store.items.length === 0"
      @click="handleCheckout"
    >
      <svg v-if="store.checkoutLoading" class="spin" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
        <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
      </svg>
      <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <rect x="1" y="4" width="22" height="16" rx="2"/>
        <line x1="1" y1="10" x2="23" y2="10"/>
      </svg>
      {{ store.checkoutLoading ? $t('checkout.loading') : t.checkout }}
    </button>

    <NuxtLink to="/products" class="continue-btn">← {{ t.continueShopping }}</NuxtLink>
  </div>
</template>

<script setup lang="ts">
import { ref }              from 'vue'
import { useCartStore }     from '../stores/cart.store'
import { useCart }          from '../composables/useCart'
import CheckoutSuccess      from './CheckoutSuccsess.vue'

const store              = useCartStore()
const { t, formatPrice } = useCart()
const showSuccess        = ref(false)

async function handleCheckout() {
  const ok = await store.checkout()
  if (ok) showSuccess.value = true
}
</script>

<style scoped>
.summary-card {
  background: white; border-radius: 20px;
  border: 1.5px solid #f3f4f6; padding: 28px 24px;
  display: flex; flex-direction: column; gap: 20px;
  position: sticky; top: 20px;
  font-family: 'Plus Jakarta Sans', sans-serif;
}
.summary-title {
  font-family: 'Playfair Display', serif;
  font-size: 20px; font-weight: 700; color: #0f1117;
}
.summary-rows   { display: flex; flex-direction: column; gap: 12px; }
.summary-row    { display: flex; justify-content: space-between; align-items: center; font-size: 14px; color: #6b7280; }
.summary-row span:last-child { font-weight: 600; color: #374151; }
.summary-row.total { font-size: 17px; }
.summary-row.total span { color: #0f1117; font-weight: 800; }
.summary-row.total span:last-child {
  font-family: 'Playfair Display', serif;
  font-size: 22px; color: #e8a020;
}
.checkout-error {
  background: #fef2f2; color: #dc2626;
  border-radius: 8px; padding: 10px 14px;
  font-size: 13px; font-weight: 600;
}
.checkout-btn {
  display: flex; align-items: center; justify-content: center; gap: 10px;
  padding: 15px; border-radius: 12px; border: none;
  background: linear-gradient(135deg, #0f1117, #2a2d3a);
  color: white; font-size: 15px; font-weight: 700;
  cursor: pointer; transition: all 0.25s; font-family: inherit;
}
.checkout-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, #e8a020, #ff8c00);
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(232, 160, 32, 0.35);
}
.checkout-btn:disabled { opacity: 0.6; cursor: not-allowed; }
.spin { animation: spin 0.8s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
.continue-btn {
  display: block; text-align: center;
  font-size: 13px; font-weight: 600;
  color: #6b7280; text-decoration: none; transition: color 0.2s;
}
.continue-btn:hover { color: #e8a020; }
</style>