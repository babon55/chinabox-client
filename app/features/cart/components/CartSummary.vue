<template>
  <div class="summary-card">
    <CheckoutSuccess :visible="showSuccess" :order-id="store.lastOrderId" />

    <!-- ── Order Confirm Modal ── -->
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

    <!-- Delivery type -->
    <div class="delivery-section">
      <p class="delivery-label">{{ t.deliveryType }}</p>
      <div class="delivery-options">
        <button
          :class="['delivery-btn', { active: store.deliveryType === 'simple' }]"
          @click="store.setDeliveryType('simple')"
        >
          <span class="d-icon">🚚</span>
          <span class="d-info">
            <span class="d-name">{{ t.deliverySimple }}</span>
            <span class="d-days">15–30 {{ t.days }}</span>
          </span>
          <span class="d-rate">$7/kg</span>
        </button>
        <button
          :class="['delivery-btn', { active: store.deliveryType === 'fast' }]"
          @click="store.setDeliveryType('fast')"
        >
          <span class="d-icon">⚡️</span>
          <span class="d-info">
            <span class="d-name">{{ t.deliveryFast }}</span>
            <span class="d-days">7–15 {{ t.days }}</span>
          </span>
          <span class="d-rate">$11/kg</span>
        </button>
      </div>

      <!-- Home delivery toggle -->
      <label class="home-delivery-row">
        <input
          type="checkbox"
          :checked="store.homeDelivery"
          @change="store.setHomeDelivery(($event.target as HTMLInputElement).checked)"
        />
        <span class="home-delivery-text">
          {{ t.deliveryHome }}
          <span class="home-delivery-price">+$1</span>
        </span>
      </label>
    </div>

    <!-- Summary rows -->
    <div class="summary-rows">
      <div class="summary-row">
        <span>{{ t.subtotal }}</span>
        <span>{{ formatPrice(store.subtotal) }}</span>
      </div>
      <div class="summary-row">
        <span>
          {{ t.shipping }}
          <span class="weight-hint" v-if="store.totalWeightKg > 0">
            ({{ store.totalWeightKg.toFixed(2) }}kg)
          </span>
        </span>
        <span :class="{ 'free-label': store.deliveryCost === 0 }">
          {{ store.deliveryCost === 0 ? t.shippingFree : formatPrice(store.deliveryCost) }}
        </span>
      </div>
      <div class="summary-row total">
        <span>{{ t.total }}</span>
        <span>{{ formatPrice(store.total) }}</span>
      </div>
    </div>

    <div v-if="store.checkoutError" class="checkout-error">
      ⚠ {{ store.checkoutError }}
    </div>

    <!-- Checkout button now opens the confirm modal -->
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
import { ref } from 'vue'
import { useCartStore }       from '../stores/cart.store'
import { useCart }            from '../composables/useCart'
import CheckoutSuccess        from './CheckoutSuccsess.vue'
import OrderConfirmModal      from './OrderConfirmModal.vue'

const store              = useCartStore()
const { t, formatPrice } = useCart()
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

/* Delivery section */
.delivery-section { display: flex; flex-direction: column; gap: 10px; }
.delivery-label {
  font-size: 12px; font-weight: 700; text-transform: uppercase;
  letter-spacing: .05em; color: #9ca3af;
}
.delivery-options { display: flex; flex-direction: column; gap: 8px; }

.delivery-btn {
  display: flex; align-items: center; gap: 10px;
  padding: 12px 14px; border-radius: 12px;
  border: 1.5px solid #e5e7eb; background: #f9fafb;
  cursor: pointer; transition: all .18s;
  font-family: 'Plus Jakarta Sans', sans-serif;
  text-align: left; width: 100%;
}
.delivery-btn:hover { border-color: #e8a020; background: rgba(232,160,32,.04); }
.delivery-btn.active {
  border-color: #e8a020;
  background: rgba(232,160,32,.08);
}
.d-icon { font-size: 20px; flex-shrink: 0; }
.d-info { flex: 1; display: flex; flex-direction: column; gap: 1px; }
.d-name { font-size: 13px; font-weight: 700; color: #0f1117; }
.d-days { font-size: 11px; color: #9ca3af; }
.d-rate {
  font-size: 12px; font-weight: 700; color: #e8a020;
  background: rgba(232,160,32,.1); padding: 2px 8px;
  border-radius: 20px; white-space: nowrap;
}

.home-delivery-row {
  display: flex; align-items: center; gap: 10px;
  padding: 10px 14px; border-radius: 10px;
  border: 1.5px solid #e5e7eb; background: #f9fafb;
  cursor: pointer; transition: border-color .15s;
}
.home-delivery-row:hover { border-color: #e8a020; }
.home-delivery-row input[type="checkbox"] {
  width: 16px; height: 16px; accent-color: #e8a020; cursor: pointer; flex-shrink: 0;
}
.home-delivery-text {
  font-size: 13px; font-weight: 600; color: #374151;
  display: flex; align-items: center; gap: 6px;
}
.home-delivery-price {
  font-size: 11px; font-weight: 700; color: #e8a020;
  background: rgba(232,160,32,.1); padding: 1px 7px; border-radius: 20px;
}

/* Summary rows */
.summary-rows   { display: flex; flex-direction: column; gap: 10px; }
.summary-row    {
  display: flex; justify-content: space-between; align-items: center;
  font-size: 14px; color: #6b7280;
}
.summary-row span:last-child { font-weight: 600; color: #374151; }
.summary-row.total {
  padding-top: 10px; border-top: 1px solid #f3f4f6;
  font-size: 17px;
}
.summary-row.total span { color: #0f1117; font-weight: 800; }
.summary-row.total span:last-child {
  font-family: 'Playfair Display', serif;
  font-size: 22px; color: #e8a020;
}
.weight-hint { font-size: 11px; color: #d1d5db; font-weight: 400; }
.free-label  { color: #16a34a !important; }

.checkout-error {
  background: #fef2f2; color: #dc2626;
  border-radius: 8px; padding: 10px 14px;
  font-size: 13px; font-weight: 600;
}

/* Checkout button — opens confirm modal */
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
  box-shadow: 0 8px 24px rgba(232,160,32,0.35);
}
.checkout-btn:disabled { opacity: 0.6; cursor: not-allowed; }

.continue-btn {
  display: block; text-align: center;
  font-size: 13px; font-weight: 600;
  color: #6b7280; text-decoration: none; transition: color 0.2s;
}
.continue-btn:hover { color: #e8a020; }
</style>