<script setup lang="ts">
import type { Lang } from '../types'

const props = defineProps<{ currentLang: Lang }>()

const stats = computed(() => [
  { icon: '📦', value: '2M+', label: props.currentLang === 'tk' ? 'Önüm'  : 'Товаров' },
  { icon: '🌍', value: '50+', label: props.currentLang === 'tk' ? 'Ýurt'  : 'Стран'   },
  { icon: '⭐', value: '4.9', label: props.currentLang === 'tk' ? 'Baha'  : 'Рейтинг' },
])

const trustItems = computed(() => [
  { label: props.currentLang === 'tk' ? 'SSL bilen goralýar'  : 'Защита SSL',                 icon: 'shield' },
  { label: props.currentLang === 'tk' ? 'Mugt hasap açmak'    : 'Бесплатная регистрация',      icon: 'check'  },
  { label: props.currentLang === 'tk' ? '24/7 goldaw'         : 'Поддержка 24/7',              icon: 'clock'  },
])
</script>

<template>
  <div class="side-panel">
    <div class="bg-circle bg-circle-1" />
    <div class="bg-circle bg-circle-2" />

    <!-- Logo -->
    <NuxtLink to="/" class="side-logo">
      <div class="side-logo-icon">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
          <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
          <line x1="12" y1="22.08" x2="12" y2="12"/>
        </svg>
      </div>
      <span class="side-logo-name">SilkShop</span>
    </NuxtLink>

    <!-- Hero -->
    <div class="side-hero">
      <h2 class="side-title">{{ currentLang === 'tk' ? 'Dünýä Bazaryna\nGiriş Açyň' : 'Откройте доступ\nк мировому рынку' }}</h2>
      <p class="side-desc">
        {{ currentLang === 'tk'
          ? 'Müňlerçe hytaý önümini amatly bahadan sargyt ediň. Çalt, ygtybarly, arzan.'
          : 'Заказывайте тысячи китайских товаров по выгодным ценам. Быстро, надёжно, дёшево.' }}
      </p>
    </div>

    <!-- Stats -->
    <div class="stats-row">
      <div v-for="s in stats" :key="s.label" class="stat-card">
        <span class="stat-icon">{{ s.icon }}</span>
        <span class="stat-value">{{ s.value }}</span>
        <span class="stat-label">{{ s.label }}</span>
      </div>
    </div>

    <!-- Trust -->
    <div class="trust-list">
      <div v-for="item in trustItems" :key="item.label" class="trust-item">
        <div class="trust-icon">
          <svg v-if="item.icon === 'shield'" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
          <svg v-if="item.icon === 'check'"  width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
          <svg v-if="item.icon === 'clock'"  width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
        </div>
        <span>{{ item.label }}</span>
      </div>
    </div>

    <!-- Floating product card -->
    <div class="floating-card">
      <div class="floating-img">🎧</div>
      <div class="floating-info">
        <span class="floating-name">{{ currentLang === 'tk' ? 'Simsiz Gulaklyk' : 'Беспроводные наушники' }}</span>
        <span class="floating-price">$24.99</span>
      </div>
      <div class="floating-badge">
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
        {{ currentLang === 'tk' ? 'Eltildi' : 'Доставлено' }}
      </div>
    </div>
  </div>
</template>

<style scoped>
.side-panel {
  position: relative; width: 100%; height: 100%;
  background: linear-gradient(145deg, #0F1117 0%, #1C2033 60%, #0F1117 100%);
  padding: 48px 44px;
  display: flex; flex-direction: column; gap: 36px; overflow: hidden;
}
.bg-circle { position: absolute; border-radius: 50%; pointer-events: none; }
.bg-circle-1 { width: 380px; height: 380px; top: -120px; right: -120px; background: radial-gradient(circle, rgba(232,160,32,0.12) 0%, transparent 70%); }
.bg-circle-2 { width: 260px; height: 260px; bottom: 60px; left: -80px;  background: radial-gradient(circle, rgba(232,160,32,0.08) 0%, transparent 70%); }

.side-logo { display: flex; align-items: center; gap: 10px; text-decoration: none; z-index: 1; }
.side-logo-icon { width: 40px; height: 40px; background: linear-gradient(135deg, #E8A020, #FF8C00); border-radius: 11px; display: flex; align-items: center; justify-content: center; color: white; box-shadow: 0 4px 14px rgba(232,160,32,0.35); }
.side-logo-name { font-family: 'Playfair Display', serif; font-size: 22px; font-weight: 700; color: white; }

.side-hero { z-index: 1; }
.side-title { font-family: 'Playfair Display', serif; font-size: 36px; font-weight: 700; color: white; line-height: 1.2; margin-bottom: 14px; white-space: pre-line; }
.side-desc { font-size: 14px; color: rgba(255,255,255,0.55); line-height: 1.7; font-family: 'Plus Jakarta Sans', sans-serif; }

.stats-row { display: flex; gap: 12px; z-index: 1; }
.stat-card { flex: 1; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.08); border-radius: 14px; padding: 14px 12px; display: flex; flex-direction: column; align-items: center; gap: 4px; transition: background 0.2s; }
.stat-card:hover { background: rgba(255,255,255,0.1); }
.stat-icon { font-size: 20px; }
.stat-value { font-family: 'Playfair Display', serif; font-size: 20px; font-weight: 700; color: #E8A020; }
.stat-label { font-size: 11px; color: rgba(255,255,255,0.5); font-weight: 500; font-family: 'Plus Jakarta Sans', sans-serif; }

.trust-list { display: flex; flex-direction: column; gap: 10px; z-index: 1; }
.trust-item { display: flex; align-items: center; gap: 10px; font-size: 13px; color: rgba(255,255,255,0.65); font-family: 'Plus Jakarta Sans', sans-serif; font-weight: 500; }
.trust-icon { width: 26px; height: 26px; background: rgba(232,160,32,0.15); border-radius: 8px; display: flex; align-items: center; justify-content: center; color: #E8A020; flex-shrink: 0; }

.floating-card { position: absolute; bottom: 44px; right: 32px; background: rgba(255,255,255,0.07); backdrop-filter: blur(16px); border: 1px solid rgba(255,255,255,0.12); border-radius: 16px; padding: 12px 16px; display: flex; align-items: center; gap: 12px; z-index: 2; animation: floatCard 4s ease-in-out infinite; }
@keyframes floatCard { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
.floating-img { font-size: 28px; background: rgba(255,255,255,0.08); width: 44px; height: 44px; border-radius: 10px; display: flex; align-items: center; justify-content: center; }
.floating-info { display: flex; flex-direction: column; gap: 2px; }
.floating-name { font-size: 12px; font-weight: 600; color: white; font-family: 'Plus Jakarta Sans', sans-serif; }
.floating-price { font-size: 13px; font-weight: 700; color: #E8A020; font-family: 'Plus Jakarta Sans', sans-serif; }
.floating-badge { display: flex; align-items: center; gap: 4px; background: rgba(39,174,96,0.2); color: #4ADE80; font-size: 10px; font-weight: 700; padding: 4px 8px; border-radius: 20px; white-space: nowrap; font-family: 'Plus Jakarta Sans', sans-serif; }
</style>