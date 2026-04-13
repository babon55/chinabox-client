<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { ref, computed } from 'vue'
import { useCart } from '../composables/useCart'
import { useCartStore } from '../stores/cart.store'

const { locale } = useI18n()
const store = useCartStore()
const { t, formatPrice } = useCart()

const lang = computed(() => locale.value)
const showSuccess = ref(false)

async function handleCheckout() {
  const ok = await store.checkout()
  if (ok) showSuccess.value = true
}
</script>

<template>
  <!-- Success overlay -->
  <Transition name="fade">
    <div v-if="showSuccess" class="success-overlay">
      <div class="success-card">
        <span class="s-icon">🎉</span>
        <h3>{{ $t('checkout.successTitle') }}</h3>
        <p v-if="store.lastOrderId">
          {{ $t('checkout.orderNumber') }}:
          <strong>#{{ store.lastOrderId.slice(-8).toUpperCase() }}</strong>
        </p>
        <div class="s-actions">
          <NuxtLink to="/orders" class="btn-gold">{{ $t('checkout.viewOrders') }}</NuxtLink>
          <NuxtLink to="/products" class="btn-outline">{{ $t('checkout.continueShopping') }}</NuxtLink>
        </div>
      </div>
    </div>
  </Transition>

  <div class="summary-card">
    <h2 class="summary-title">{{ t.orderSummary }}</h2>

    <!-- Price breakdown -->
    <div class="summary-rows">
      <div class="summary-row total"> 
        <span>{{ t.total }}</span>
        <span>{{ formatPrice(store.total) }}</span>
      </div>
    </div>

    <div v-if="store.checkoutError" class="checkout-error">⚠ {{ store.checkoutError }}</div>

    <button
      class="checkout-btn"
      :disabled="store.checkoutLoading || store.items.length === 0"
      @click="handleCheckout"
    >
      <svg v-if="store.checkoutLoading" class="spin" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
      <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
      {{ store.checkoutLoading
        ? (lang === 'tk' ? 'Sargyt edilýär...' : 'Оформляется...')
        : t.checkout }}
    </button>

    <NuxtLink to="/products" class="continue-btn">← {{ t.continueShopping }}</NuxtLink>
  </div>
</template>

<style scoped>
.success-overlay { position: fixed; inset: 0; background: rgba(0,0,0,.55); display: flex; align-items: center; justify-content: center; z-index: 999; padding: 20px; }
.success-card { background: white; border-radius: 24px; padding: 48px 40px; text-align: center; max-width: 380px; width: 100%; box-shadow: 0 24px 64px rgba(0,0,0,.3); display: flex; flex-direction: column; align-items: center; gap: 14px; }
.s-icon { font-size: 56px; }
.success-card h3 { font-family: 'Playfair Display', serif; font-size: 22px; font-weight: 700; color: #0F1117; }
.success-card p  { font-size: 14px; color: #6B7280; }
.success-card strong { color: #E8A020; font-weight: 800; }
.s-actions { display: flex; gap: 10px; flex-wrap: wrap; justify-content: center; margin-top: 6px; }
.btn-gold    { display: inline-flex; align-items: center; height: 42px; padding: 0 20px; border-radius: 50px; background: linear-gradient(135deg, #E8A020, #FF8C00); color: white; font-size: 13px; font-weight: 700; text-decoration: none; }
.btn-outline { display: inline-flex; align-items: center; height: 42px; padding: 0 20px; border-radius: 50px; border: 1.5px solid #E5E7EB; background: none; color: #374151; font-size: 13px; font-weight: 700; text-decoration: none; }
.fade-enter-active, .fade-leave-active { transition: opacity .2s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

.summary-card { background: white; border-radius: 20px; border: 1.5px solid #F3F4F6; padding: 28px 24px; display: flex; flex-direction: column; gap: 20px; position: sticky; top: 20px; font-family: 'Plus Jakarta Sans', sans-serif; }
.summary-title { font-family: 'Playfair Display', serif; font-size: 20px; font-weight: 700; color: #0F1117; }

/* Delivery block */
.delivery-block { display: flex; flex-direction: column; gap: 8px; }
.delivery-label { font-size: 11px; font-weight: 700; color: #6B7280; text-transform: uppercase; letter-spacing: .04em; }
.delivery-opts  { display: flex; flex-direction: column; gap: 6px; }

.d-opt {
  display: flex; align-items: center; gap: 10px;
  padding: 10px 12px; border-radius: 10px;
  border: 1.5px solid #E5E7EB; background: #F9FAFB;
  cursor: pointer; transition: all .15s;
}
.d-opt input { accent-color: #E8A020; flex-shrink: 0; }
.d-opt.active { border-color: #E8A020; background: rgba(232,160,32,.05); }
.d-opt-body { display: flex; justify-content: space-between; align-items: center; flex: 1; }
.d-opt-name  { font-size: 13px; font-weight: 600; color: #374151; }
.d-opt-price { font-size: 13px; font-weight: 700; color: #E8A020; }

.home-delivery {
  display: flex; align-items: center; gap: 10px;
  padding: 10px 12px; border-radius: 10px;
  border: 1.5px solid #E5E7EB; background: #F9FAFB;
  cursor: pointer; transition: all .15s;
}
.home-delivery input { accent-color: #E8A020; flex-shrink: 0; }
.home-delivery .d-opt-name  { flex: 1; font-size: 13px; font-weight: 600; color: #374151; }
.home-delivery .d-opt-price { font-size: 13px; font-weight: 700; color: #E8A020; }
.home-delivery:has(input:checked) { border-color: #E8A020; background: rgba(232,160,32,.05); }

/* Summary rows */
.summary-rows   { display: flex; flex-direction: column; gap: 12px; }
.summary-row    { display: flex; justify-content: space-between; align-items: center; font-size: 14px; color: #6B7280; }
.summary-row span:last-child { font-weight: 600; color: #374151; }
.summary-divider { height: 1px; background: #F3F4F6; }
.summary-row.total { font-size: 17px; }
.summary-row.total span { color: #0F1117; font-weight: 800; }
.summary-row.total span:last-child { font-family: 'Playfair Display', serif; font-size: 22px; color: #E8A020; }

.checkout-error { background: #FEF2F2; color: #DC2626; border-radius: 8px; padding: 10px 14px; font-size: 13px; font-weight: 600; }
.checkout-btn { display: flex; align-items: center; justify-content: center; gap: 10px; padding: 15px; border-radius: 12px; border: none; background: linear-gradient(135deg, #0F1117, #2A2D3A); color: white; font-size: 15px; font-weight: 700; cursor: pointer; transition: all .25s; font-family: inherit; }
.checkout-btn:hover:not(:disabled) { background: linear-gradient(135deg, #E8A020, #FF8C00); transform: translateY(-2px); box-shadow: 0 8px 24px rgba(232,160,32,.35); }
.checkout-btn:disabled { opacity: .6; cursor: not-allowed; }
.spin { animation: spin .8s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
.continue-btn { display: block; text-align: center; font-size: 13px; font-weight: 600; color: #6B7280; text-decoration: none; transition: color .2s; }
.continue-btn:hover { color: #E8A020; }
</style>