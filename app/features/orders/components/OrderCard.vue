<template>
  <div class="order-card">

    <!-- ── Header ──────────────────────────────────────────────────────────── -->
    <div class="oc-head" @click="expanded = !expanded">
      <div class="oc-head-left">
        <NuxtLink :to="`/track?id=${order.id}`" class="oc-id" @click.stop>
          {{ order.id }}
        </NuxtLink>
        <span class="oc-date">{{ fmtDate(order.createdAt) }}</span>
        <span class="oc-items-count">{{ order.lines?.length ?? 0 }} {{ $t('cart.itemCount') }}</span>
      </div>

      <div class="oc-head-right">
        <div
          class="oc-badge"
          :style="{
            background: (STATUS_COLORS[order.status] ?? '#6B7280') + '18',
            color:       STATUS_COLORS[order.status] ?? '#6B7280',
            border:     `1.5px solid ${(STATUS_COLORS[order.status] ?? '#6B7280')}30`,
          }"
        >
          {{ STATUS_LABELS[order.status] ?? order.status }}
        </div>
        <div class="oc-total">${{ fmt(order.total) }}</div>
        <div :class="['oc-chevron', { open: expanded }]">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <polyline points="6 9 12 15 18 9"/>
          </svg>
        </div>
      </div>
    </div>

    <!-- ── Progress bar ────────────────────────────────────────────────────── -->
    <div v-if="order.status !== 'CANCELLED'" class="oc-progress">
      <div v-for="(step, i) in STATUS_STEPS" :key="step" class="oc-prog-step">
        <div class="oc-prog-dot-wrap">
          <div
            class="oc-prog-dot"
            :class="{ done: i <= stepIndex(order.status) }"
            :style="i <= stepIndex(order.status)
              ? { background: STATUS_COLORS[order.status], borderColor: STATUS_COLORS[order.status] }
              : {}"
          >
            <svg v-if="i < stepIndex(order.status)" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
            <div v-else-if="i === stepIndex(order.status)" class="dot-pulse" />
          </div>
          <div
            v-if="i < STATUS_STEPS.length - 1"
            class="oc-prog-line"
            :class="{ done: i < stepIndex(order.status) }"
            :style="i < stepIndex(order.status) ? { background: STATUS_COLORS[order.status] } : {}"
          />
        </div>
        <span
          class="oc-prog-lbl"
          :class="{ active: step === order.status }"
          :style="step === order.status ? { color: STATUS_COLORS[order.status] } : {}"
        >
          {{ STATUS_LABELS[step] }}
        </span>
      </div>
    </div>

    <div v-else class="oc-cancelled">
      ❌ {{ locale === 'tk' ? 'Bu sargyt ýatyryldy' : 'Этот заказ был отменён' }}
    </div>

    <!-- ── Expanded detail ─────────────────────────────────────────────────── -->
    <Transition name="expand">
      <div v-if="expanded" class="oc-detail">

        <div class="oc-detail-title">{{ $t('pages.orders.orderDetails') }}</div>

        <!-- Items -->
        <div class="oc-items">
          <div v-for="line in order.lines" :key="line.id" class="oc-item">
            <div class="oc-item-thumb">
              <img
                v-if="line.product?.imageUrl"
                :src="line.product.imageUrl"
                :alt="line.product.nameTk"
                class="oc-item-img"
              />
              <span v-else class="oc-item-emoji">{{ line.product?.image ?? '📦' }}</span>
            </div>
            <div class="oc-item-info">
              <div class="oc-item-name">
                {{ locale === 'tk' ? line.product?.nameTk : line.product?.nameRu }}
              </div>
              <div class="oc-item-cat">
                {{ locale === 'tk' ? line.product?.category?.nameTk : line.product?.category?.nameRu }}
              </div>
            </div>
            <div class="oc-item-right">
              <div class="oc-item-qty">× {{ line.qty }}</div>
              <div class="oc-item-price">${{ fmt(Number(line.unitPrice) * line.qty) }}</div>
            </div>
          </div>
        </div>

        <!-- Note -->
        <div v-if="order.note" class="oc-note">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
          </svg>
          {{ order.note }}
        </div>

        <!-- Summary -->
        <div class="oc-summary">
          <div class="oc-track-row">
            <div class="oc-full-id">
              <span class="oc-full-id-label">{{ $t('orders.orderNumber') }}:</span>
              <span class="oc-full-id-val">{{ order.id }}</span>
            </div>
            <NuxtLink :to="`/track?id=${order.id}`" class="track-link">
              🚚 {{ $t('track.track') }}
            </NuxtLink>
          </div>
          <div class="oc-summary-row">
            <span>{{ $t('cart.items') }}</span>
            <span>${{ fmt(order.total) }}</span>
          </div>
          <div class="oc-summary-total">
            <span>{{ $t('orders.total') }}</span>
            <span class="oc-total-val">${{ fmt(order.total) }}</span>
          </div>
        </div>

      </div>
    </Transition>

  </div>
</template>

<script setup lang="ts">
import { ref }           from 'vue'
import { useI18n }       from 'vue-i18n'
import type { Order }    from '../types'
import { useOrders, STATUS_COLORS, STATUS_STEPS } from '../composables/useOrders'

defineProps<{ order: Order }>()

const { locale }                      = useI18n()
const { STATUS_LABELS, fmt, fmtDate, stepIndex } = useOrders()
const expanded                        = ref(false)
</script>

<style scoped>
.order-card {
  background: var(--white); border-radius: var(--radius-xl);
  border: 1.5px solid var(--border-light); overflow: hidden;
  box-shadow: var(--shadow-sm); transition: box-shadow .2s;
}
.order-card:hover { box-shadow: var(--shadow-md); }

/* Header */
.oc-head {
  display: flex; align-items: center; justify-content: space-between;
  padding: 18px 22px; cursor: pointer; transition: background .15s;
  gap: 12px; flex-wrap: wrap;
}
.oc-head:hover { background: var(--surface); }
.oc-head-left  { display: flex; align-items: center; gap: 14px; flex-wrap: wrap; }
.oc-head-right { display: flex; align-items: center; gap: 12px; flex-shrink: 0; }

.oc-id {
  font-family: monospace; font-size: 14px; font-weight: 700;
  color: var(--gold); text-decoration: none;
}
.oc-id:hover { opacity: .7; text-decoration: underline; }
.oc-date        { font-size: 12px; color: var(--subtle); }
.oc-items-count {
  font-size: 12px; color: var(--subtle);
  background: var(--surface); padding: 2px 8px;
  border-radius: var(--radius-pill); border: 1px solid var(--border-light);
}
.oc-badge {
  display: inline-flex; align-items: center;
  padding: 4px 12px; border-radius: var(--radius-pill);
  font-size: 11px; font-weight: 700;
}
.oc-total { font-family: var(--font-display); font-size: 16px; font-weight: 700; color: var(--dark); }
.oc-chevron { color: var(--subtle); transition: transform .25s; }
.oc-chevron.open { transform: rotate(180deg); }
.oc-chevron svg { width: 16px; height: 16px; }

/* Progress */
.oc-progress { display: flex; align-items: flex-start; padding: 0 22px 18px; }
.oc-prog-step { display: flex; flex-direction: column; align-items: center; flex: 1; }
.oc-prog-dot-wrap { display: flex; align-items: center; width: 100%; }
.oc-prog-dot {
  width: 20px; height: 20px; border-radius: 50%;
  border: 2px solid var(--border); background: var(--white);
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0; z-index: 1; transition: all .2s;
}
.oc-prog-dot.done { border-width: 0; }
.oc-prog-dot svg { width: 10px; height: 10px; }
.dot-pulse {
  width: 8px; height: 8px; border-radius: 50%; background: white;
  animation: pulse 1.5s ease-in-out infinite;
}
@keyframes pulse { 0%,100% { opacity:1; transform:scale(1); } 50% { opacity:.6; transform:scale(.8); } }
.oc-prog-line  { flex: 1; height: 2px; background: var(--border-light); transition: background .2s; }
.oc-prog-lbl   { font-size: 10px; font-weight: 600; color: var(--subtle); margin-top: 6px; text-align: center; }
.oc-prog-lbl.active { font-weight: 800; }

.oc-cancelled {
  margin: 0 22px 18px; background: #FEE2E2; color: #991B1B;
  border-radius: var(--radius-md); padding: 10px 14px;
  font-size: 13px; font-weight: 600;
}

/* Detail */
.oc-detail {
  border-top: 1px solid var(--border-light); padding: 20px 22px;
  display: flex; flex-direction: column; gap: 16px; background: var(--surface);
}
.oc-detail-title { font-size: 12px; font-weight: 700; color: var(--subtle); text-transform: uppercase; letter-spacing: .06em; }

.oc-items { display: flex; flex-direction: column; gap: 10px; }
.oc-item {
  display: flex; align-items: center; gap: 12px;
  background: var(--white); border-radius: var(--radius-md);
  border: 1.5px solid var(--border-light); padding: 10px 14px;
}
.oc-item-thumb {
  width: 44px; height: 44px; border-radius: var(--radius-md);
  background: var(--surface); border: 1.5px solid var(--border-light);
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0; overflow: hidden;
}
.oc-item-img   { width: 100%; height: 100%; object-fit: cover; }
.oc-item-emoji { font-size: 22px; }
.oc-item-info  { flex: 1; min-width: 0; }
.oc-item-name  { font-size: 13px; font-weight: 700; color: var(--dark); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.oc-item-cat   { font-size: 11px; color: var(--subtle); margin-top: 2px; }
.oc-item-right { display: flex; flex-direction: column; align-items: flex-end; gap: 2px; flex-shrink: 0; }
.oc-item-qty   { font-size: 11px; color: var(--subtle); }
.oc-item-price { font-size: 14px; font-weight: 700; color: var(--dark); }

.oc-note {
  display: flex; align-items: flex-start; gap: 8px;
  background: var(--warning-bg); border-radius: var(--radius-md);
  padding: 10px 14px; font-size: 13px; color: var(--dark);
  border: 1px solid rgba(245,158,11,.2);
}
.oc-note svg { width: 15px; height: 15px; color: var(--warning); flex-shrink: 0; margin-top: 1px; }

.oc-summary {
  background: var(--white); border-radius: var(--radius-md);
  border: 1.5px solid var(--border-light); padding: 14px 16px;
  display: flex; flex-direction: column; gap: 8px;
}
.oc-summary-row { display: flex; justify-content: space-between; font-size: 13px; color: var(--subtle); }
.oc-summary-total {
  display: flex; justify-content: space-between; align-items: center;
  font-size: 14px; font-weight: 700; color: var(--dark);
  border-top: 1px solid var(--border-light); padding-top: 8px; margin-top: 2px;
}
.oc-total-val { font-family: var(--font-display); font-size: 20px; font-weight: 700; color: var(--gold); }

.oc-track-row { display: flex; align-items: center; justify-content: space-between; gap: 12px; flex-wrap: wrap; }
.oc-full-id {
  display: flex; align-items: center; gap: 6px;
  background: var(--white); border: 1.5px solid var(--border-light);
  border-radius: var(--radius-md); padding: 6px 12px;
  min-width: 0; flex: 1;
}
.oc-full-id-label { font-size: 11px; font-weight: 700; color: var(--subtle); white-space: nowrap; }
.oc-full-id-val   { font-family: monospace; font-size: 12px; color: var(--dark); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

.track-link {
  display: inline-flex; align-items: center; height: 36px; padding: 0 18px;
  border-radius: var(--radius-pill);
  background: linear-gradient(135deg, var(--gold), var(--gold-dark));
  color: white; font-size: 13px; font-weight: 700;
  text-decoration: none; white-space: nowrap;
  transition: all .15s; box-shadow: 0 4px 12px var(--gold-shadow); flex-shrink: 0;
}
.track-link:hover { transform: translateY(-1px); box-shadow: 0 6px 16px var(--gold-shadow); }

/* Expand transition */
.expand-enter-active, .expand-leave-active { transition: opacity .2s, transform .2s; }
.expand-enter-from, .expand-leave-to { opacity: 0; transform: translateY(-8px); }

@media (max-width: 700px) {
  .oc-head { padding: 14px 16px; }
  .oc-progress { padding: 0 16px 14px; }
  .oc-detail { padding: 16px; }
}
</style>