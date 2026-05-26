<script setup lang="ts">
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
</script>

<template>
  <NuxtLink to="/" class="logo">
    <div class="logo-icon">
      <img src="/images/logo.png" alt="ChinaExpress" class="logo-img" />
    </div>
    <div class="logo-text">
      <span class="logo-main">ChinaExpress</span>
      <span class="logo-sub">
        {{ $t('header.logoTagline') }}
      </span>
    </div>
  </NuxtLink>
</template>

<style scoped>
.logo {
  display: flex;
  align-items: center;
  gap: 10px;
  text-decoration: none;
  flex-shrink: 0;
}

.logo-icon {
  width: 52px;
  height: 52px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  flex-shrink: 0;
  transition: transform 0.2s;
}

.logo-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}
.logo:hover .logo-icon {
  transform: rotate(0deg) scale(1.2);
  box-shadow: 0 6px 20px rgba(232,160,32,0.5);
}

.logo-text {
  display: flex;
  flex-direction: column;
  line-height: 1;
}

.logo-main {
  font-family: 'intel';
  font-size: 20px;
  font-weight: 700;
  color: #0F1117;
  letter-spacing: -0.02em;
}

.logo-sub {
  font-size: 10px;
  font-weight: 600;
  color: #E8A020;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  margin-top: 2px;
}

@media (max-width: 768px) {
  .logo-icon { width: 42px; height: 42px; }
  .logo-main { font-size: 16px; }
  .logo-sub  { font-size: 9px; letter-spacing: 0.05em; }
}

@media (max-width: 480px) {
  /* ← removed display:none — text stays visible now */
  .logo-icon { width: 38px; height: 38px; border-radius: 9px; }
  .logo-main { font-size: 15px; }
  .logo-sub  { display: none; } /* tagline can still hide, just keep the name */
}
</style>