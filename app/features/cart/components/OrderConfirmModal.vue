<template>
  <Teleport to="body">
    <Transition name="ocm">
      <div v-if="visible" class="ocm-overlay" @click.self="emit('cancel')">
        <div class="ocm-card" role="dialog" aria-modal="true">

          <!-- ── Header ── -->
          <div class="ocm-head">
            <div class="ocm-head-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" width="28" height="28">
                <path d="M9 12l2 2 4-4"/>
                <path d="M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2z"/>
              </svg>
            </div>
            <div class="ocm-head-text">
              <h2 class="ocm-title">{{ locale === 'tk' ? 'Sargydyňyzy tassyklaň' : 'Подтвердите заказ' }}</h2>
              <p class="ocm-subtitle">
                {{ locale === 'tk'
                  ? 'Ähli harytlary barlaň we sargydyňyzy tassyklaň'
                  : 'Проверьте товары и подтвердите заказ' }}
              </p>
            </div>
            <button class="ocm-close" @click="emit('cancel')">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="14" height="14">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>

          <!-- ── Trust strip ── -->
          <div class="ocm-trust">
            <div class="trust-item">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="13" height="13"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              {{ locale === 'tk' ? 'Howpsuz töleg' : 'Безопасная оплата' }}
            </div>
            <div class="trust-sep" />
            <div class="trust-item">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="13" height="13"><rect x="1" y="3" width="15" height="13" rx="1"/><path d="M16 8h4l3 3v5h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>
              {{ locale === 'tk' ? 'Yzarlanýan eltip beriş' : 'Отслеживаемая доставка' }}
            </div>
            <div class="trust-sep" />
            <div class="trust-item">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="13" height="13"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
              {{ locale === 'tk' ? '24/7 goldaw' : 'Поддержка 24/7' }}
            </div>
          </div>

          <!-- ── Products list ── -->
          <div class="ocm-body">
            <div class="ocm-section-label">
              {{ locale === 'tk' ? 'Harytlar' : 'Товары' }}
              <span class="ocm-item-count">{{ items.length }}</span>
            </div>

            <div class="ocm-items">
              <div v-for="item in items" :key="item.id + JSON.stringify(item.options)" class="ocm-item">
                <!-- Image / emoji -->
                <div class="ocm-item-img">
                  <img v-if="item.image && item.image.startsWith('http')" :src="item.image" :alt="locale === 'tk' ? item.nameTk : item.nameRu" />
                  <span v-else class="ocm-item-emoji">{{ item.image }}</span>
                </div>

                <!-- Info -->
                <div class="ocm-item-info">
                  <span class="ocm-item-name">{{ locale === 'tk' ? item.nameTk : item.nameRu }}</span>
                  <div v-if="item.options && Object.keys(item.options).length" class="ocm-item-opts">
                    <span v-for="(val, key) in item.options" :key="key" class="ocm-opt-tag">{{ val }}</span>
                  </div>
                </div>

                <!-- Qty + price -->
                <div class="ocm-item-right">
                  <span class="ocm-item-qty">× {{ item.quantity }}</span>
                  <span class="ocm-item-price">${{ (item.price * item.quantity).toFixed(2) }}</span>
                </div>
              </div>
            </div>

            <!-- ── Delivery summary ── -->
            <div class="ocm-delivery-row">
              <div class="ocm-delivery-label">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="13" height="13"><rect x="1" y="3" width="15" height="13" rx="1"/><path d="M16 8h4l3 3v5h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>
                {{ locale === 'tk' ? 'Eltip beriş' : 'Доставка' }}
                <span class="ocm-delivery-type">
                  {{ deliveryType === 'fast'
                    ? (locale === 'tk' ? '⚡ Tiz' : '⚡ Быстрая')
                    : (locale === 'tk' ? '🚚 Adaty' : '🚚 Обычная') }}
                  {{ homeDelivery ? (locale === 'tk' ? '+ Öýe' : '+ Домой') : '' }}
                </span>
              </div>
              <span class="ocm-delivery-cost">${{ deliveryCost.toFixed(2) }}</span>
            </div>

            <!-- ── Total ── -->
            <div class="ocm-total-row">
              <span class="ocm-total-label">{{ locale === 'tk' ? 'Jemi' : 'Итого' }}</span>
              <span class="ocm-total-price">${{ total.toFixed(2) }}</span>
            </div>
          </div>

          <!-- ── Footer note ── -->
          <div class="ocm-note">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/></svg>
            <span>
              {{ locale === 'tk'
                ? 'Sargyt iberilenden soň, biz siz bilen habarlaşarys.'
                : 'После оформления заказа мы свяжемся с вами для подтверждения.' }}
            </span>
          </div>

          <!-- ── Actions ── -->
          <div class="ocm-actions">
            <button class="ocm-cancel-btn" @click="emit('cancel')">
              {{ locale === 'tk' ? 'Yzyna' : 'Назад' }}
            </button>
            <button class="ocm-confirm-btn" :disabled="loading" @click="emit('confirm')">
              <svg v-if="loading" class="spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="16" height="16">
                <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
              </svg>
              <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="16" height="16">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              {{ loading
                ? (locale === 'tk' ? 'Iberilýär...' : 'Оформление...')
                : (locale === 'tk' ? 'Sargyt ber' : 'Оформить заказ') }}
            </button>
          </div>

        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import type { CartItem } from '../types'

const { locale } = useI18n()

defineProps<{
  visible:      boolean
  items:        CartItem[]
  deliveryType: 'simple' | 'fast'
  homeDelivery: boolean
  deliveryCost: number
  total:        number
  loading:      boolean
}>()

const emit = defineEmits<{
  (e: 'confirm'): void
  (e: 'cancel'):  void
}>()
</script>

<style scoped>
/* ── Overlay ── */
.ocm-overlay {
  position: fixed; inset: 0; z-index: 1200;
  background: rgba(10, 12, 20, 0.72);
  backdrop-filter: blur(6px);
  display: flex; align-items: center; justify-content: center;
  padding: 20px;
}

/* ── Card ── */
.ocm-card {
  background: #fff;
  border-radius: 24px;
  width: 100%; max-width: 500px;
  max-height: 90dvh;
  overflow: hidden;
  display: flex; flex-direction: column;
  box-shadow: 0 32px 80px rgba(0,0,0,0.28), 0 8px 24px rgba(0,0,0,0.1);
  border: 1px solid rgba(255,255,255,0.6);
}

/* ── Head ── */
.ocm-head {
  display: flex; align-items: flex-start; gap: 14px;
  padding: 24px 24px 20px;
  background: linear-gradient(135deg, #0F1117 0%, #1a1d2e 100%);
  position: relative;
}
.ocm-head-icon {
  width: 52px; height: 52px; border-radius: 16px; flex-shrink: 0;
  background: rgba(232,160,32,0.15);
  border: 1.5px solid rgba(232,160,32,0.3);
  display: flex; align-items: center; justify-content: center;
  color: #E8A020;
}
.ocm-head-text { flex: 1; min-width: 0; }
.ocm-title {
  font-family: 'Playfair Display', 'Georgia', serif;
  font-size: 20px; font-weight: 700; color: #fff;
  margin: 0 0 4px; line-height: 1.2;
}
.ocm-subtitle {
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 13px; color: rgba(255,255,255,0.45); margin: 0;
}
.ocm-close {
  position: absolute; top: 18px; right: 18px;
  width: 28px; height: 28px; border-radius: 8px;
  border: 1px solid rgba(255,255,255,0.12);
  background: rgba(255,255,255,0.07);
  color: rgba(255,255,255,0.5); cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  transition: all .15s; flex-shrink: 0;
}
.ocm-close:hover { background: rgba(255,255,255,0.15); color: #fff; }

/* ── Trust strip ── */
.ocm-trust {
  display: flex; align-items: center; justify-content: center;
  gap: 10px; padding: 11px 20px;
  background: linear-gradient(90deg, rgba(232,160,32,0.06), rgba(232,160,32,0.1), rgba(232,160,32,0.06));
  border-bottom: 1px solid rgba(232,160,32,0.15);
}
.trust-item {
  display: flex; align-items: center; gap: 5px;
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 11px; font-weight: 700; color: #92711A;
  white-space: nowrap;
}
.trust-item svg { color: #E8A020; flex-shrink: 0; }
.trust-sep { width: 1px; height: 14px; background: rgba(232,160,32,0.25); flex-shrink: 0; }

/* ── Scrollable body ── */
.ocm-body {
  flex: 1; overflow-y: auto; overflow-x: hidden;
  padding: 20px 24px;
  display: flex; flex-direction: column; gap: 0;
  overscroll-behavior: contain;
}
.ocm-body::-webkit-scrollbar { width: 4px; }
.ocm-body::-webkit-scrollbar-track { background: transparent; }
.ocm-body::-webkit-scrollbar-thumb { background: #E5E7EB; border-radius: 4px; }

.ocm-section-label {
  display: flex; align-items: center; gap: 8px;
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 10px; font-weight: 700; color: #9CA3AF;
  text-transform: uppercase; letter-spacing: .08em;
  margin-bottom: 12px;
}
.ocm-item-count {
  background: #F3F4F6; color: #6B7280;
  font-size: 10px; font-weight: 800;
  padding: 1px 7px; border-radius: 20px;
}

/* ── Items ── */
.ocm-items {
  display: flex; flex-direction: column; gap: 8px;
  margin-bottom: 16px;
}
.ocm-item {
  display: flex; align-items: center; gap: 12px;
  padding: 12px 14px;
  background: #F9FAFB;
  border-radius: 12px;
  border: 1.5px solid #F3F4F6;
  transition: border-color .15s;
}
.ocm-item:hover { border-color: #E5E7EB; }

.ocm-item-img {
  width: 44px; height: 44px; border-radius: 10px; flex-shrink: 0;
  background: #fff; border: 1px solid #E5E7EB;
  display: flex; align-items: center; justify-content: center; overflow: hidden;
}
.ocm-item-img img { width: 100%; height: 100%; object-fit: cover; }
.ocm-item-emoji { font-size: 22px; }

.ocm-item-info { flex: 1; min-width: 0; }
.ocm-item-name {
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 13px; font-weight: 700; color: #0F1117;
  display: block;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  margin-bottom: 4px;
}
.ocm-item-opts { display: flex; gap: 4px; flex-wrap: wrap; }
.ocm-opt-tag {
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 10px; font-weight: 700; color: #E8A020;
  background: rgba(232,160,32,0.1);
  border: 1px solid rgba(232,160,32,0.25);
  padding: 1px 7px; border-radius: 20px;
}

.ocm-item-right { display: flex; flex-direction: column; align-items: flex-end; gap: 2px; flex-shrink: 0; }
.ocm-item-qty { font-family: 'Plus Jakarta Sans', sans-serif; font-size: 11px; color: #9CA3AF; font-weight: 600; }
.ocm-item-price { font-family: 'Playfair Display', 'Georgia', serif; font-size: 15px; font-weight: 700; color: #0F1117; }

/* ── Delivery row ── */
.ocm-delivery-row {
  display: flex; align-items: center; justify-content: space-between;
  padding: 12px 14px;
  background: #F9FAFB; border-radius: 10px;
  border: 1.5px solid #F3F4F6;
  margin-bottom: 0;
}
.ocm-delivery-label {
  display: flex; align-items: center; gap: 6px;
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 12px; font-weight: 700; color: #6B7280;
}
.ocm-delivery-label svg { color: #9CA3AF; }
.ocm-delivery-type {
  font-size: 11px; font-weight: 700; color: #374151;
  background: #fff; border: 1px solid #E5E7EB;
  padding: 1px 8px; border-radius: 20px;
}
.ocm-delivery-cost { font-family: 'Plus Jakarta Sans', sans-serif; font-size: 13px; font-weight: 700; color: #374151; }

/* ── Total ── */
.ocm-total-row {
  display: flex; align-items: center; justify-content: space-between;
  padding: 16px 14px 4px;
  border-top: 1.5px solid #F3F4F6;
  margin-top: 12px;
}
.ocm-total-label {
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 14px; font-weight: 800; color: #0F1117;
}
.ocm-total-price {
  font-family: 'Playfair Display', 'Georgia', serif;
  font-size: 26px; font-weight: 800; color: #E8A020;
}

/* ── Footer note ── */
.ocm-note {
  display: flex; align-items: flex-start; gap: 8px;
  margin: 0 24px 0;
  padding: 10px 14px;
  background: #F0F9FF;
  border-radius: 10px;
  border: 1px solid #BAE6FD;
}
.ocm-note svg { color: #0284C7; flex-shrink: 0; margin-top: 1px; }
.ocm-note span {
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 12px; color: #0369A1; font-weight: 600; line-height: 1.5;
}

/* ── Actions ── */
.ocm-actions {
  display: flex; gap: 10px;
  padding: 16px 24px 24px;
}
.ocm-cancel-btn {
  flex: 1; height: 50px; border-radius: 14px;
  border: 1.5px solid #E5E7EB; background: #F9FAFB;
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 14px; font-weight: 700; color: #6B7280;
  cursor: pointer; transition: all .15s;
}
.ocm-cancel-btn:hover { border-color: #D1D5DB; color: #374151; background: #F3F4F6; }

.ocm-confirm-btn {
  flex: 2; height: 50px; border-radius: 14px; border: none;
  background: linear-gradient(135deg, #E8A020, #FF8C00);
  color: #fff; font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 14px; font-weight: 800;
  cursor: pointer; transition: all .2s;
  display: flex; align-items: center; justify-content: center; gap: 8px;
  box-shadow: 0 4px 20px rgba(232,160,32,0.4);
}
.ocm-confirm-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 28px rgba(232,160,32,0.5);
}
.ocm-confirm-btn:disabled { opacity: 0.65; cursor: not-allowed; transform: none; }
.spin { animation: spin .8s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

/* ── Transition ── */
.ocm-enter-active { transition: opacity .22s ease; }
.ocm-leave-active { transition: opacity .15s ease; }
.ocm-enter-active .ocm-card,
.ocm-leave-active .ocm-card { transition: opacity .22s ease, transform .22s cubic-bezier(0.16,1,0.3,1); }
.ocm-enter-from, .ocm-leave-to { opacity: 0; }
.ocm-enter-from .ocm-card { transform: translateY(24px) scale(0.97); opacity: 0; }
.ocm-leave-to .ocm-card { transform: translateY(12px) scale(0.98); opacity: 0; }

@media (max-width: 540px) {
  .ocm-card { border-radius: 20px 20px 0 0; max-height: 95dvh; }
  .ocm-overlay { align-items: flex-end; padding: 0; }
  .trust-sep, .trust-item:not(:first-child) { display: none; }
}
</style>