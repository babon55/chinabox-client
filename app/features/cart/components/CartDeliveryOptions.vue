<template>
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
          <span class="d-days">25–35 {{ t.days }}</span>
        </span>
        <span class="d-rate">60 TMT/kg</span>
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
        <span class="d-rate">140 TMT/kg</span>
      </button>
    </div>

    <label class="home-delivery-row">
      <input
        type="checkbox"
        :checked="store.homeDelivery"
        @change="store.setHomeDelivery(($event.target as HTMLInputElement).checked)"
      />
      <span class="home-delivery-text">
        {{ t.deliveryHome }}
        <span class="home-delivery-price">+20 TMT</span>
      </span>
    </label>
  </div>
</template>

<script setup lang="ts">
import { useCartStore } from '../stores/cart.store'
import { useCart }      from '../composables/useCart'

const store = useCartStore()
const { t } = useCart()
</script>

<style scoped>
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
  -webkit-tap-highlight-color: transparent;
}
.delivery-btn:hover  { border-color: #e8a020; background: rgba(232,160,32,.04); }
.delivery-btn:active { transform: scale(0.98); }
.delivery-btn.active { border-color: #e8a020; background: rgba(232,160,32,.08); }

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
  min-height: 44px;
}
.home-delivery-row:hover { border-color: #e8a020; }
.home-delivery-row input[type="checkbox"] {
  width: 18px; height: 18px; accent-color: #e8a020; cursor: pointer; flex-shrink: 0;
}
.home-delivery-text {
  font-size: 13px; font-weight: 600; color: #374151;
  display: flex; align-items: center; gap: 6px;
}
.home-delivery-price {
  font-size: 11px; font-weight: 700; color: #e8a020;
  background: rgba(232,160,32,.1); padding: 1px 7px; border-radius: 20px;
}
</style>