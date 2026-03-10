<script setup lang="ts">
import type { Lang } from '../types'

defineProps<{
  currentLang: Lang
  dark?: boolean   // true = white text (for dark backgrounds)
  size?: 'sm' | 'md' | 'lg'
}>()
</script>

<template>
  <NuxtLink to="/" class="logo-wrap">
    <div :class="['logo-icon', size ?? 'md']">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
        <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
        <line x1="12" y1="22.08" x2="12" y2="12"/>
      </svg>
    </div>
    <div class="logo-text">
      <span :class="['logo-main', { light: dark }]">SilkShop</span>
      <span class="logo-sub">
        {{ currentLang === 'tk' ? 'Hytaý Bazary' : 'Китайский рынок' }}
      </span>
    </div>
  </NuxtLink>
</template>

<style scoped>
.logo-wrap {
  display: flex;
  align-items: center;
  gap: 10px;
  text-decoration: none;
  flex-shrink: 0;
}

/* Icon sizes */
.logo-icon {
  background: linear-gradient(135deg, #E8A020, #FF8C00);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  box-shadow: 0 4px 14px rgba(232,160,32,0.4);
  transition: transform 0.2s, box-shadow 0.2s;
  flex-shrink: 0;
}
.logo-wrap:hover .logo-icon {
  transform: rotate(-6deg) scale(1.05);
  box-shadow: 0 6px 20px rgba(232,160,32,0.5);
}

.logo-icon.sm  { width: 32px; height: 32px; border-radius: 9px; }
.logo-icon.sm  svg { width: 16px; height: 16px; }
.logo-icon.md  { width: 40px; height: 40px; border-radius: 11px; }
.logo-icon.md  svg { width: 20px; height: 20px; }
.logo-icon.lg  { width: 48px; height: 48px; border-radius: 14px; }
.logo-icon.lg  svg { width: 24px; height: 24px; }

/* Text */
.logo-text { display: flex; flex-direction: column; line-height: 1; }

.logo-main {
  font-family: 'Playfair Display', serif;
  font-size: 20px;
  font-weight: 700;
  color: #0F1117;
  letter-spacing: -0.02em;
}
.logo-main.light { color: white; }

.logo-sub {
  font-size: 10px;
  font-weight: 600;
  color: #E8A020;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  margin-top: 2px;
}

@media (max-width: 480px) {
  .logo-main { font-size: 17px; }
  .logo-sub  { display: none; }
}
</style>