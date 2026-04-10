<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

const { locale, t } = useI18n()

const langs = [
  { code: 'tk' as const, flag: '🇹🇲', label: 'TK' },
  { code: 'ru' as const, flag: '🇷🇺', label: 'RU' },
]

const currentLang = computed(() => locale.value)
</script>

<template>
  <div class="top-bar">
    <div class="top-bar-inner">
      <span class="top-msg">
        ✈ {{ $t('header.delivery') }}
      </span>
      <div class="top-right">
        <div class="lang-switcher">
          <button
            v-for="lang in langs" :key="lang.code"
            :class="['lang-btn', { active: currentLang === lang.code }]"
            @click="locale = lang.code"
          >{{ lang.flag }} {{ lang.label }}</button>
        </div>
        <NuxtLink v-if="false" to="/admin" class="admin-link">{{ $t('admin.dashboard') }}</NuxtLink>
      </div>
    </div>
  </div>
</template>

<style scoped>
.top-bar { background: #0F1117; color: rgba(255,255,255,0.75); font-size: 12px; font-weight: 500; }
.top-bar-inner { max-width: 1280px; margin: 0 auto; padding: 7px 24px; display: flex; justify-content: space-between; align-items: center; }
.top-msg { letter-spacing: 0.02em; }
.top-right { display: flex; align-items: center; gap: 16px; }
.lang-switcher { display: flex; background: rgba(255,255,255,0.08); border-radius: 20px; padding: 2px; gap: 2px; }
.lang-btn { background: transparent; border: none; color: rgba(255,255,255,0.6); padding: 3px 10px; border-radius: 16px; font-size: 11px; font-weight: 600; cursor: pointer; transition: all 0.2s; letter-spacing: 0.03em; }
.lang-btn.active { background: #E8A020; color: #0F1117; }
.admin-link { color: #F5C05A; text-decoration: none; font-size: 11px; font-weight: 600; }
.admin-link:hover { color: white; }

/* Hide message on very small screens */
@media (max-width: 480px) {
  .top-msg { display: none; }
  .top-bar-inner { justify-content: flex-end; }
}
</style>