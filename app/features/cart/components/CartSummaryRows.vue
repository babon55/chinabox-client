<template>
  <div class="summary-rows">
    <div class="summary-row">
      <span>{{ t.subtotal }}</span>
      <span>{{ formatPrice(store.subtotal) }}</span>
    </div>

    <div class="summary-row" v-if="store.deliveryCost > 0">
      <span>
        {{ t.shipping }}
        <span class="weight-hint" v-if="store.totalWeightKg > 0">
          ({{ store.totalWeightKg.toFixed(2) }}kg)
        </span>
      </span>
      <span>{{ formatPrice(store.deliveryCost) }}</span>
    </div>

    <div class="summary-row total">
      <span>{{ t.total }}</span>
      <span>{{ formatPrice(store.total) }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useCartStore } from '../stores/cart.store'
import { useCart }      from '../composables/useCart'

const store              = useCartStore()
const { t, formatPrice } = useCart()
</script>

<style scoped>
.summary-rows   { display: flex; flex-direction: column; gap: 10px; }
.summary-row    { display: flex; justify-content: space-between; align-items: center; font-size: 14px; color: #6b7280; }
.summary-row span:last-child { font-weight: 600; color: #374151; }
.summary-row.total { padding-top: 10px; border-top: 1px solid #f3f4f6; font-size: 17px; }
.summary-row.total span { color: #0f1117; font-weight: 800; }
.summary-row.total span:last-child { font-family: 'Playfair Display', serif; font-size: 22px; color: #e8a020; }
.weight-hint { font-size: 11px; color: #d1d5db; font-weight: 400; }
</style>