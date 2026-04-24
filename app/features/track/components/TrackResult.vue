<template>
  <div class="result-card">

    <!-- ── Order header ───────────────────────────────────────────────────── -->
    <div class="order-header">
      <div class="order-id-wrap">
        <span class="order-label">{{ $t('orders.orderNumber') }}</span>
        <span class="order-id">#{{ order.id.slice(-10).toUpperCase() }}</span>
      </div>
      <div class="order-status-wrap">
        <span class="status-icon">{{ STATUS_ICONS[order.status] ?? '📦' }}</span>
        <span
          class="status-badge"
          :style="{
            background: (STATUS_COLORS[order.status] ?? '#6B7280') + '18',
            color:       STATUS_COLORS[order.status] ?? '#6B7280',
            border:     `1.5px solid ${(STATUS_COLORS[order.status] ?? '#6B7280')}30`,
          }"
        >{{ statusLabel(order.status) }}</span>
      </div>
    </div>

    <div class="order-date">🗓 {{ $t('orders.date') }}: {{ fmtDate(order.createdAt) }}</div>

    <!-- ── Progress tracker ───────────────────────────────────────────────── -->
    <div v-if="order.status !== 'CANCELLED'" class="progress-section">
      <h3 class="section-label">{{ $t('pages.track.history') }}</h3>
      <div class="progress-track">
        <div v-for="(step, i) in STATUS_STEPS" :key="step" class="progress-step">
          <div class="step-connector">
            <div
              class="step-dot"
              :class="{
                done:    i < stepIndex(order.status),
                current: i === stepIndex(order.status),
              }"
              :style="i <= stepIndex(order.status)
                ? { background: STATUS_COLORS[order.status], borderColor: STATUS_COLORS[order.status] }
                : {}"
            >
              <svg v-if="i < stepIndex(order.status)" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              <div v-else-if="i === stepIndex(order.status)" class="pulse-dot" />
            </div>
            <div
              v-if="i < STATUS_STEPS.length - 1"
              class="step-line"
              :style="i < stepIndex(order.status) ? { background: STATUS_COLORS[order.status] } : {}"
            />
          </div>
          <div
            class="step-label"
            :class="{ active: i === stepIndex(order.status) }"
            :style="i === stepIndex(order.status) ? { color: STATUS_COLORS[order.status], fontWeight: '700' } : {}"
          >{{ statusLabel(step) }}</div>
        </div>
      </div>
    </div>

    <div v-else class="cancelled-box">
      ❌ {{ $t('orders.statusCancelled') }}
    </div>

    <!-- ── Items ──────────────────────────────────────────────────────────── -->
    <div class="items-section">
      <h3 class="section-label">{{ $t('pages.track.orderInfo') }}</h3>
      <div class="items-list">
        <div v-for="(line, idx) in (order.lines ?? [])" :key="line.id ?? idx" class="item-row">
          <div class="item-thumb">
            <span class="item-emoji">{{ productImage(line) }}</span>
          </div>
          <div class="item-info">
            <div class="item-name">{{ productName(line) }}</div>
            <div class="item-qty">× {{ line.qty }}</div>
            <div v-if="line.options && Object.keys(line.options).length" class="item-opts">
              <span v-for="(val, key) in line.options" :key="key" class="opt-chip">{{ val }}</span>
            </div>
          </div>
          <div class="item-price">${{ fmt(Number(line.unitPrice) * line.qty) }}</div>
        </div>
      </div>
      <div class="order-total">
        <span>{{ $t('cart.total') }}</span>
        <strong>${{ fmt(orderTotal) }}</strong>
      </div>
    </div>

    <!-- ── Note ───────────────────────────────────────────────────────────── -->
    <div v-if="order.note" class="order-note">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
      </svg>
      {{ order.note }}
    </div>

    <!-- ── Share row ──────────────────────────────────────────────────────── -->
    <div class="share-row">
      <button class="share-btn" @click="copyLink">
        {{ copied ? '✓ ' + $t('track.copied') : '🔗 ' + $t('track.copy') }}
      </button>
      <NuxtLink to="/products" class="continue-btn">
        {{ $t('common.continueShopping') }} →
      </NuxtLink>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref }         from 'vue'
import type { TrackedOrder } from '../types'
import { useTrack, STATUS_STEPS, STATUS_COLORS, STATUS_ICONS } from '../composables/useTrack'

defineProps<{ order: TrackedOrder }>()

const { statusLabel, stepIndex, fmt, fmtDate, productName, productImage, orderTotal } = useTrack()

const copied = ref(false)

function copyLink() {
  if (!import.meta.client) return
  navigator.clipboard?.writeText(window.location.href).then(() => {
    copied.value = true
    setTimeout(() => { copied.value = false }, 2000)
  })
}
</script>

<style scoped>
.result-card {
  background: var(--white); border-radius: var(--radius-xl);
  border: 1.5px solid var(--border-light); overflow: hidden;
  box-shadow: var(--shadow-md); display: flex; flex-direction: column;
}

/* Header */
.order-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 22px 24px; border-bottom: 1px solid var(--border-light);
  flex-wrap: wrap; gap: 12px;
  background: linear-gradient(135deg, var(--dark), #1a1d2e);
}
.order-label  { font-size: 11px; font-weight: 700; color: rgba(255,255,255,.4); text-transform: uppercase; letter-spacing: .1em; display: block; margin-bottom: 4px; }
.order-id     { font-family: monospace; font-size: 20px; font-weight: 800; color: var(--gold); }
.order-status-wrap { display: flex; align-items: center; gap: 10px; }
.status-icon  { font-size: 24px; }
.status-badge { padding: 6px 16px; border-radius: var(--radius-pill); font-size: 13px; font-weight: 700; }
.order-date   { padding: 12px 24px; font-size: 13px; color: var(--subtle); background: var(--surface); border-bottom: 1px solid var(--border-light); }

/* Progress */
.progress-section { padding: 24px; border-bottom: 1px solid var(--border-light); }
.section-label    { font-size: 13px; font-weight: 700; color: var(--subtle); text-transform: uppercase; letter-spacing: .06em; margin-bottom: 20px; }
.progress-track   { display: flex; align-items: flex-start; }
.progress-step    { display: flex; flex-direction: column; align-items: center; flex: 1; }
.step-connector   { display: flex; align-items: center; width: 100%; }
.step-dot {
  width: 28px; height: 28px; border-radius: 50%;
  border: 2px solid var(--border); background: var(--white);
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0; z-index: 1; transition: all .25s;
}
.step-dot svg { width: 13px; height: 13px; }
.pulse-dot    { width: 10px; height: 10px; border-radius: 50%; background: white; animation: pulse-anim 1.5s ease-in-out infinite; }
@keyframes pulse-anim { 0%,100% { opacity:1; transform:scale(1); } 50% { opacity:.5; transform:scale(.8); } }
.step-line    { flex: 1; height: 2px; background: var(--border-light); transition: background .3s; }
.step-label   { font-size: 11px; font-weight: 600; color: var(--subtle); margin-top: 8px; text-align: center; white-space: nowrap; }
.step-label.active { font-size: 12px; }

.cancelled-box { margin: 0 24px 24px; background: #FEE2E2; color: #991B1B; border-radius: var(--radius-md); padding: 14px 18px; font-size: 14px; font-weight: 600; }

/* Items */
.items-section { padding: 24px; border-bottom: 1px solid var(--border-light); }
.items-list    { display: flex; flex-direction: column; gap: 10px; margin-bottom: 14px; }
.item-row      { display: flex; align-items: center; gap: 12px; padding: 10px 14px; background: var(--surface); border-radius: var(--radius-md); border: 1.5px solid var(--border-light); }
.item-thumb    { width: 40px; height: 40px; border-radius: var(--radius-md); background: var(--white); border: 1.5px solid var(--border-light); display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.item-emoji    { font-size: 22px; }
.item-info     { flex: 1; min-width: 0; }
.item-name     { font-size: 13px; font-weight: 700; color: var(--dark); }
.item-qty      { font-size: 12px; color: var(--subtle); margin-top: 2px; }
.item-opts     { display: flex; flex-wrap: wrap; gap: 4px; margin-top: 5px; }
.opt-chip      { font-size: 11px; font-weight: 700; color: var(--gold); background: rgba(232,160,32,.1); border: 1px solid rgba(232,160,32,.3); padding: 1px 7px; border-radius: var(--radius-pill); }
.item-price    { font-size: 14px; font-weight: 700; color: var(--dark); white-space: nowrap; }
.order-total   { display: flex; justify-content: space-between; align-items: center; padding: 12px 0 0; border-top: 1px solid var(--border-light); font-size: 14px; color: var(--subtle); }
.order-total strong { font-family: var(--font-display); font-size: 22px; font-weight: 800; color: var(--gold); }

/* Note */
.order-note { display: flex; align-items: flex-start; gap: 10px; padding: 16px 24px; background: rgba(245,158,11,.06); border-top: 1px solid rgba(245,158,11,.15); font-size: 13px; color: var(--dark); }
.order-note svg { width: 15px; height: 15px; color: #F59E0B; flex-shrink: 0; margin-top: 1px; }

/* Share */
.share-row    { display: flex; align-items: center; gap: 12px; padding: 16px 24px; flex-wrap: wrap; }
.share-btn    { height: 38px; padding: 0 18px; border-radius: var(--radius-pill); border: 1.5px solid var(--border); background: var(--surface); font-size: 13px; font-weight: 600; color: var(--muted); cursor: pointer; font-family: var(--font-body); transition: all .15s; }
.share-btn:hover { border-color: var(--gold); color: var(--gold); }
.continue-btn { margin-left: auto; font-size: 13px; font-weight: 700; color: var(--gold); text-decoration: none; }
.continue-btn:hover { text-decoration: underline; }

@media (max-width: 600px) {
  .progress-track { overflow-x: auto; padding-bottom: 8px; }
  .step-label     { font-size: 10px; }
}
</style>