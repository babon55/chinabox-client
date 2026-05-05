<template>
  <div class="summary-card">
    <CheckoutSuccess :visible="showSuccess" :order-id="store.lastOrderId" />
    <OrderConfirmModal
      :visible="showConfirm"
      :items="store.items"
      :delivery-type="store.deliveryType"
      :home-delivery="store.homeDelivery"
      :delivery-cost="store.deliveryCost"
      :total="store.total"
      :loading="store.checkoutLoading"
      @confirm="handleCheckout"
      @cancel="showConfirm = false"
    />

    <h2 class="summary-title">{{ t.orderSummary }}</h2>
    <CartDeliveryOptions />
    <CartSummaryRows />

    <div v-if="store.checkoutError" class="checkout-error">⚠ {{ store.checkoutError }}</div>

    <button
      class="checkout-btn"
      :disabled="store.checkoutLoading || store.items.length === 0"
      @click="showConfirm = true"
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <rect x="1" y="4" width="22" height="16" rx="2"/>
        <line x1="1" y1="10" x2="23" y2="10"/>
      </svg>
      {{ t.checkout }}
    </button>

    <NuxtLink to="/products" class="continue-btn">← {{ t.continueShopping }}</NuxtLink>
  </div>
</template>

<script setup lang="ts">
import { ref }             from 'vue'
import { useCartStore }    from '../stores/cart.store'
import { useCart }         from '../composables/useCart'
import CheckoutSuccess     from './CheckoutSuccsess.vue'
import OrderConfirmModal   from './OrderConfirmModal.vue'
import CartDeliveryOptions from './CartDeliveryOptions.vue'
import CartSummaryRows     from './CartSummaryRows.vue'

const store              = useCartStore()
const { t }              = useCart()
const showSuccess        = ref(false)
const showConfirm        = ref(false)

async function handleCheckout() {
  const ok = await store.checkout()
  if (ok) {
    showConfirm.value = false
    showSuccess.value = true
  }
}
</script>

<style scoped>
.summary-card {
  background: white;
  border-radius: 20px;
  border: 1.5px solid #f3f4f6;
  padding: 28px 24px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  position: sticky;
  top: 80px;
  font-family: 'Plus Jakarta Sans', sans-serif;
}
.summary-title {
  font-family: 'Playfair Display', serif;
  font-size: 20px; font-weight: 700; color: #0f1117;
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
  min-height: 52px;
  -webkit-tap-highlight-color: transparent;
}
.checkout-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, #e8a020, #ff8c00);
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(232,160,32,0.35);
}
.checkout-btn:active:not(:disabled) { transform: translateY(0); box-shadow: none; }
.checkout-btn:disabled { opacity: 0.6; cursor: not-allowed; }

.continue-btn {
  display: block; text-align: center;
  font-size: 13px; font-weight: 600;
  color: #6b7280; text-decoration: none; transition: color 0.2s;
}
.continue-btn:hover { color: #e8a020; }

/* Un-stick on mobile so it flows naturally below the items */
@media (max-width: 768px) {
  .summary-card { position: static; }
}
</style>