<script setup lang="ts">
import type { Lang } from '../types'
import { useCart } from '../composables/useCart'

const props = defineProps<{ currentLang: Lang }>()
const lang  = computed(() => props.currentLang)
const { t } = useCart(lang)
</script>

<template>
  <div class="empty-wrap">
    <div class="empty-icon">
      <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
        <line x1="3" y1="6" x2="21" y2="6"/>
        <path d="M16 10a4 4 0 0 1-8 0"/>
      </svg>
    </div>
    <h2 class="empty-title">{{ t.empty }}</h2>
    <p class="empty-desc">{{ t.emptyDesc }}</p>
    <NuxtLink to="/" class="shop-btn">
      {{ t.shopNow }}
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
      </svg>
    </NuxtLink>
  </div>
</template>

<style scoped>
.empty-wrap {
  display: flex; flex-direction: column; align-items: center;
  justify-content: center; gap: 16px;
  padding: 80px 40px; text-align: center;
  background: white; border-radius: 20px;
  border: 1.5px dashed #E5E7EB;
}
.empty-icon {
  width: 120px; height: 120px; border-radius: 50%;
  background: #F9FAFB;
  display: flex; align-items: center; justify-content: center;
  color: #D1D5DB;
  margin-bottom: 8px;
}
.empty-title {
  font-family: 'Playfair Display', serif;
  font-size: 26px; font-weight: 700; color: #0F1117;
}
.empty-desc {
  font-size: 15px; color: #9CA3AF;
  font-family: 'Plus Jakarta Sans', sans-serif;
  max-width: 320px; line-height: 1.6;
}
.shop-btn {
  display: inline-flex; align-items: center; gap: 8px;
  padding: 13px 28px; border-radius: 12px;
  background: linear-gradient(135deg, #0F1117, #2A2D3A);
  color: white; text-decoration: none;
  font-size: 14px; font-weight: 700;
  transition: all 0.25s; font-family: 'Plus Jakarta Sans', sans-serif;
  margin-top: 8px;
}
.shop-btn:hover {
  background: linear-gradient(135deg, #E8A020, #FF8C00);
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(232,160,32,0.35);
}
</style>