<script setup lang="ts">
import type { CartItem, Lang } from '../types'
import { useCart } from '../composables/useCart'
import { useCartStore } from '../stores/cart.store'

const props = defineProps<{
  item:        CartItem
  currentLang: Lang
}>()

const store = useCartStore()
const lang  = computed(() => props.currentLang)
const { t, formatPrice, discountPercent } = useCart(lang)

function dec() { store.updateQuantity(props.item.id, props.item.quantity - 1) }
function inc() { store.updateQuantity(props.item.id, props.item.quantity + 1) }
</script>

<template>
  <div :class="['cart-item', { 'out-of-stock': !item.inStock }]">

    <!-- Product image -->
    <div class="item-img">
      <span class="item-emoji">{{ item.image }}</span>
      <span v-if="!item.inStock" class="stock-overlay">
        {{ t.outOfStock }}
      </span>
    </div>

    <!-- Product info -->
    <div class="item-info">
      <div class="item-top">
        <div>
          <h3 class="item-name">{{ item.name[currentLang] }}</h3>
          <p class="item-seller">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
            {{ t.seller }}: {{ item.seller }}
          </p>
          <div class="item-meta">
            <span v-if="item.color" class="meta-tag">{{ t.color }}: {{ item.color }}</span>
            <span v-if="item.size"  class="meta-tag">{{ t.size }}: {{ item.size }}</span>
            <span v-for="opt in item.optionsDisplay" :key="opt.name" class="meta-tag">
              {{ opt.name }}: <strong>{{ opt.value }}</strong>
            </span>
          </div>
        </div>

        <!-- Stock badge -->
        <span :class="['stock-badge', item.inStock ? 'in' : 'out']">
          <span class="stock-dot" />
          {{ item.inStock ? t.inStock : t.outOfStock }}
        </span>
      </div>

      <div class="item-bottom">
        <!-- Price -->
        <div class="price-wrap">
          <span class="price-current">{{ formatPrice(item.price) }}</span>
          <span v-if="item.oldPrice" class="price-old">{{ formatPrice(item.oldPrice) }}</span>
          <span v-if="item.oldPrice" class="price-badge">
            -{{ discountPercent(item.price, item.oldPrice) }}%
          </span>
        </div>

        <!-- Quantity controls + actions -->
        <div class="item-controls">
          <div class="qty-wrap">
            <button class="qty-btn" @click="dec" :disabled="item.quantity <= 1">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="5" y1="12" x2="19" y2="12"/></svg>
            </button>
            <span class="qty-value">{{ item.quantity }}</span>
            <button class="qty-btn" @click="inc">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            </button>
          </div>

          <button class="action-btn remove" @click="store.removeItem(item.id)">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/>
            </svg>
            {{ t.remove }}
          </button>

          <button class="action-btn save">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
            </svg>
            {{ t.saveForLater }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.cart-item {
  display: flex;
  gap: 20px;
  padding: 24px;
  background: white;
  border-radius: 16px;
  border: 1.5px solid #F3F4F6;
  transition: all 0.2s;
}
.cart-item:hover { border-color: #E5E7EB; box-shadow: 0 4px 20px rgba(0,0,0,0.06); }
.cart-item.out-of-stock { opacity: 0.65; }

/* Image */
.item-img {
  position: relative;
  width: 100px; min-width: 100px; height: 100px;
  background: linear-gradient(135deg, #F9FAFB, #F3F4F6);
  border-radius: 12px;
  display: flex; align-items: center; justify-content: center;
  overflow: hidden;
}
.item-emoji { font-size: 44px; }
.stock-overlay {
  position: absolute; inset: 0;
  background: rgba(0,0,0,0.5);
  color: white; font-size: 10px; font-weight: 700;
  display: flex; align-items: center; justify-content: center;
  text-align: center; padding: 4px;
  font-family: 'Plus Jakarta Sans', sans-serif;
  border-radius: 12px;
}

/* Info */
.item-info { flex: 1; display: flex; flex-direction: column; gap: 12px; min-width: 0; }
.item-top { display: flex; justify-content: space-between; align-items: flex-start; gap: 12px; }

.item-name {
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 15px; font-weight: 700; color: #0F1117;
  margin-bottom: 4px;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.item-seller {
  display: flex; align-items: center; gap: 5px;
  font-size: 12px; color: #9CA3AF;
  font-family: 'Plus Jakarta Sans', sans-serif; margin-bottom: 6px;
}
.item-meta { display: flex; gap: 6px; flex-wrap: wrap; }
.meta-tag {
  font-size: 11px; font-weight: 500; color: #6B7280;
  background: #F3F4F6; border-radius: 6px; padding: 2px 8px;
  font-family: 'Plus Jakarta Sans', sans-serif;
}

.stock-badge {
  display: flex; align-items: center; gap: 5px;
  font-size: 11px; font-weight: 600; padding: 4px 10px;
  border-radius: 20px; white-space: nowrap;
  font-family: 'Plus Jakarta Sans', sans-serif; flex-shrink: 0;
}
.stock-badge.in  { background: rgba(34,197,94,0.1);  color: #16A34A; }
.stock-badge.out { background: rgba(239,68,68,0.1);   color: #DC2626; }
.stock-dot {
  width: 6px; height: 6px; border-radius: 50%;
}
.stock-badge.in .stock-dot  { background: #16A34A; }
.stock-badge.out .stock-dot { background: #DC2626; }

/* Bottom row */
.item-bottom { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px; }

.price-wrap { display: flex; align-items: center; gap: 8px; }
.price-current { font-family: 'Playfair Display', serif; font-size: 20px; font-weight: 700; color: #0F1117; }
.price-old { font-size: 13px; color: #9CA3AF; text-decoration: line-through; font-family: 'Plus Jakarta Sans', sans-serif; }
.price-badge { background: #FEF3C7; color: #D97706; font-size: 11px; font-weight: 700; padding: 2px 8px; border-radius: 20px; font-family: 'Plus Jakarta Sans', sans-serif; }

.item-controls { display: flex; align-items: center; gap: 10px; }

.qty-wrap {
  display: flex; align-items: center; gap: 0;
  border: 1.5px solid #E5E7EB; border-radius: 10px; overflow: hidden;
}
.qty-btn {
  width: 34px; height: 34px;
  background: #F9FAFB; border: none; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  color: #374151; transition: all 0.15s;
}
.qty-btn:hover:not(:disabled) { background: #E8A020; color: white; }
.qty-btn:disabled { opacity: 0.4; cursor: not-allowed; }
.qty-value { min-width: 36px; text-align: center; font-size: 14px; font-weight: 700; color: #0F1117; font-family: 'Plus Jakarta Sans', sans-serif; }

.action-btn {
  display: flex; align-items: center; gap: 5px;
  padding: 6px 12px; border-radius: 8px; border: none;
  font-size: 12px; font-weight: 600; cursor: pointer;
  transition: all 0.2s; font-family: 'Plus Jakarta Sans', sans-serif;
}
.action-btn.remove { background: #FEF2F2; color: #DC2626; }
.action-btn.remove:hover { background: #DC2626; color: white; }
.action-btn.save { background: #F3F4F6; color: #6B7280; }
.action-btn.save:hover { background: #E5E7EB; color: #374151; }

@media (max-width: 600px) {
  .cart-item { flex-direction: column; }
  .item-img { width: 100%; height: 120px; }
  .item-top { flex-direction: column; }
}
</style>