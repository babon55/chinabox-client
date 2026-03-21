<script setup lang="ts">
import type { Lang } from '../types'
import { useCart } from '../composables/useCart'
import { useCartStore } from '../stores/cart.store'

const props = defineProps<{ currentLang: Lang }>()

const store = useCartStore()
const lang  = computed(() => props.currentLang)
const { t, formatPrice } = useCart(lang)

const promoInput   = ref('')
const promoError   = ref(false)
const promoSuccess = ref(false)

function applyPromo() {
  const ok = store.applyPromo(promoInput.value)
  promoError.value   = !ok
  promoSuccess.value =  ok
  if (ok) store.promoCode = promoInput.value.toUpperCase()
}

// ── Checkout ──────────────────────────────────────────────────
const showSuccess = ref(false)
const note        = ref('')

async function handleCheckout() {
  const ok = await store.checkout(note.value || undefined)
  if (ok) showSuccess.value = true
}
</script>

<template>

  <!-- ── Success overlay ── -->
  <Transition name="fade">
    <div v-if="showSuccess" class="success-overlay">
      <div class="success-card">
        <span class="s-icon">🎉</span>
        <h3>{{ currentLang === 'tk' ? 'Sargydyňyz kabul edildi!' : 'Заказ принят!' }}</h3>
        <p v-if="store.lastOrderId">
          {{ currentLang === 'tk' ? 'Sargyt №' : 'Заказ №' }}:
          <strong>#{{ store.lastOrderId.slice(-8).toUpperCase() }}</strong>
        </p>
        <div class="s-actions">
          <NuxtLink to="/orders" class="btn-gold">
            {{ currentLang === 'tk' ? 'Sargytlarym →' : 'Мои заказы →' }}
          </NuxtLink>
          <NuxtLink to="/products" class="btn-outline">
            {{ currentLang === 'tk' ? 'Söwda dowam et' : 'Продолжить' }}
          </NuxtLink>
        </div>
      </div>
    </div>
  </Transition>

  <div class="summary-card">
    <h2 class="summary-title">{{ t.orderSummary }}</h2>

    <div class="summary-rows">
      <div class="summary-row">
        <span>{{ t.subtotal }}</span>
        <span>{{ formatPrice(store.summary.subtotal) }}</span>
      </div>
      <div v-if="store.promoApplied" class="summary-row discount">
        <span>{{ t.discount }} ({{ Math.round(store.promoDiscount * 100) }}%)</span>
        <span>-{{ formatPrice(store.summary.discount) }}</span>
      </div>
      <div class="summary-row">
        <span>{{ t.shipping }}</span>
        <span :class="{ free: store.summary.shipping === 0 }">
          {{ store.summary.shipping === 0 ? t.shippingFree : formatPrice(store.summary.shipping) }}
        </span>
      </div>
      <div class="summary-divider" />
      <div class="summary-row total">
        <span>{{ t.total }}</span>
        <span>{{ formatPrice(store.summary.total) }}</span>
      </div>
    </div>

    <!-- Free shipping progress -->
    <div v-if="store.summary.shipping > 0" class="shipping-progress">
      <div class="shipping-progress-info">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>
        <span>
          {{ currentLang === 'tk'
            ? `Mugt eltip beriş üçin $${(50 - store.summary.subtotal).toFixed(2)} goşuň`
            : `Добавьте $${(50 - store.summary.subtotal).toFixed(2)} для бесплатной доставки` }}
        </span>
      </div>
      <div class="progress-bar">
        <div class="progress-fill" :style="{ width: Math.min((store.summary.subtotal / 50) * 100, 100) + '%' }" />
      </div>
    </div>

    <!-- Promo -->
    <div class="promo-wrap">
      <p class="promo-label">{{ t.promoCode }}</p>
      <div :class="['promo-input-wrap', { error: promoError, success: promoSuccess }]">
        <input v-model="promoInput" :placeholder="t.promoPlaceholder" class="promo-input" :disabled="store.promoApplied" />
        <button class="promo-btn" @click="applyPromo" :disabled="store.promoApplied || !promoInput">
          {{ store.promoApplied ? '✓' : t.promoApply }}
        </button>
      </div>
      <p v-if="promoError"   class="promo-msg error">{{ currentLang === 'tk' ? 'Promo kod ýalňyş' : 'Неверный промокод' }}</p>
      <p v-if="promoSuccess" class="promo-msg success">{{ currentLang === 'tk' ? 'Promo kod ulanyldy!' : 'Промокод применён!' }}</p>
      <p class="promo-hint">{{ currentLang === 'tk' ? 'Synap görüň: SILK10, SILK20' : 'Попробуйте: SILK10, SILK20' }}</p>
    </div>

    <!-- Note -->
    <div class="note-wrap">
      <label class="note-label">{{ currentLang === 'tk' ? 'Bellik (islege görä)' : 'Примечание (необязательно)' }}</label>
      <textarea v-model="note" class="note-input" rows="2" :placeholder="currentLang === 'tk' ? 'Sargyt barada bellik...' : 'Заметка к заказу...'" />
    </div>

    <!-- Error -->
    <div v-if="store.checkoutError" class="checkout-error">⚠ {{ store.checkoutError }}</div>

    <!-- Checkout button -->
    <button class="checkout-btn" :disabled="store.checkoutLoading || store.items.length === 0" @click="handleCheckout">
      <svg v-if="store.checkoutLoading" class="spin" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
      <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
      {{ store.checkoutLoading
        ? (currentLang === 'tk' ? 'Sargyt edilýär...' : 'Оформляется...')
        : t.checkout }}
    </button>

    <NuxtLink to="/products" class="continue-btn">← {{ t.continueShopping }}</NuxtLink>

    <p class="delivery-est">
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
      {{ t.estimatedDelivery }}
    </p>

    <div class="trust-row">
      <div class="trust-item">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
        <span>{{ currentLang === 'tk' ? 'Howpsuz töleg' : 'Безопасная оплата' }}</span>
      </div>
      <div class="trust-item">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-3.51"/></svg>
        <span>{{ currentLang === 'tk' ? 'Yzyna gaýtarmak' : 'Возврат товара' }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* ── Success overlay ── */
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

/* ── Card ── */
.summary-card { background: white; border-radius: 20px; border: 1.5px solid #F3F4F6; padding: 28px 24px; display: flex; flex-direction: column; gap: 20px; position: sticky; top: 20px; font-family: 'Plus Jakarta Sans', sans-serif; }
.summary-title { font-family: 'Playfair Display', serif; font-size: 20px; font-weight: 700; color: #0F1117; }
.summary-rows { display: flex; flex-direction: column; gap: 12px; }
.summary-row { display: flex; justify-content: space-between; align-items: center; font-size: 14px; color: #6B7280; }
.summary-row span:last-child { font-weight: 600; color: #374151; }
.summary-row.discount span { color: #16A34A; }
.summary-row.total { font-size: 17px; }
.summary-row.total span { color: #0F1117; font-weight: 800; }
.summary-row.total span:last-child { font-family: 'Playfair Display', serif; font-size: 22px; color: #E8A020; }
.free { color: #16A34A !important; font-weight: 700 !important; }
.summary-divider { height: 1px; background: #F3F4F6; }
.shipping-progress { display: flex; flex-direction: column; gap: 8px; }
.shipping-progress-info { display: flex; align-items: center; gap: 7px; font-size: 12px; font-weight: 500; color: #6B7280; }
.progress-bar { height: 6px; background: #F3F4F6; border-radius: 3px; overflow: hidden; }
.progress-fill { height: 100%; background: linear-gradient(90deg, #E8A020, #FF8C00); border-radius: 3px; transition: width .5s ease; }
.promo-label { font-size: 13px; font-weight: 600; color: #374151; margin-bottom: -12px; }
.promo-input-wrap { display: flex; border: 1.5px solid #E5E7EB; border-radius: 10px; overflow: hidden; transition: all .2s; }
.promo-input-wrap:focus-within { border-color: #E8A020; box-shadow: 0 0 0 3px rgba(232,160,32,.1); }
.promo-input-wrap.error   { border-color: #EF4444; }
.promo-input-wrap.success { border-color: #22C55E; }
.promo-input { flex: 1; border: none; outline: none; padding: 10px 14px; font-size: 13px; color: #0F1117; background: transparent; text-transform: uppercase; font-family: inherit; }
.promo-input:disabled { background: #F9FAFB; color: #9CA3AF; }
.promo-btn { padding: 10px 16px; background: #0F1117; color: white; border: none; font-size: 12px; font-weight: 700; cursor: pointer; transition: background .2s; font-family: inherit; }
.promo-btn:hover:not(:disabled) { background: #E8A020; }
.promo-btn:disabled { opacity: .5; cursor: not-allowed; }
.promo-msg { font-size: 12px; font-weight: 600; margin-top: -12px; }
.promo-msg.error   { color: #EF4444; }
.promo-msg.success { color: #16A34A; }
.promo-hint { font-size: 11px; color: #9CA3AF; margin-top: -12px; }
.note-label { font-size: 13px; font-weight: 600; color: #374151; margin-bottom: -12px; }
.note-input { width: 100%; border: 1.5px solid #E5E7EB; border-radius: 10px; padding: 10px 14px; font-size: 13px; font-family: inherit; color: #0F1117; resize: vertical; outline: none; }
.note-input:focus { border-color: #E8A020; }
.checkout-error { background: #FEF2F2; color: #DC2626; border-radius: 8px; padding: 10px 14px; font-size: 13px; font-weight: 600; }
.checkout-btn { display: flex; align-items: center; justify-content: center; gap: 10px; padding: 15px; border-radius: 12px; border: none; background: linear-gradient(135deg, #0F1117, #2A2D3A); color: white; font-size: 15px; font-weight: 700; cursor: pointer; transition: all .25s; font-family: inherit; }
.checkout-btn:hover:not(:disabled) { background: linear-gradient(135deg, #E8A020, #FF8C00); transform: translateY(-2px); box-shadow: 0 8px 24px rgba(232,160,32,.35); }
.checkout-btn:disabled { opacity: .6; cursor: not-allowed; }
.spin { animation: spin .8s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
.continue-btn { display: block; text-align: center; font-size: 13px; font-weight: 600; color: #6B7280; text-decoration: none; transition: color .2s; }
.continue-btn:hover { color: #E8A020; }
.delivery-est { display: flex; align-items: center; gap: 6px; font-size: 12px; color: #9CA3AF; justify-content: center; }
.trust-row { display: flex; gap: 12px; border-top: 1px solid #F3F4F6; padding-top: 16px; }
.trust-item { flex: 1; display: flex; align-items: center; gap: 6px; font-size: 11px; font-weight: 600; color: #9CA3AF; }
</style>