<script setup lang="ts">
import SignInSide from '../components/SignInSide.vue'
import SignInForm from '../components/SignInForm.vue'
import type { Lang } from '../types'
import { useI18n } from 'vue-i18n'

definePageMeta({ layout: 'default' })

const { locale } = useI18n()

// two-way mirror of locale — header changes are instantly reflected
const currentLang = computed<Lang>({
  get: () => locale.value as Lang,
  set: (val) => {
    locale.value = val
    if (process.client) localStorage.setItem('silkshop_lang', val)
  },
})

onMounted(() => {
  const saved = localStorage.getItem('silkshop_lang') as Lang | null
  if (saved === 'tk' || saved === 'ru') locale.value = saved
})

useHead({
  title: computed(() =>
    currentLang.value === 'tk' ? 'Giriş – SilkShop' : 'Вход – SilkShop'
  ),
})

function onSuccess() {
  navigateTo('/')
}
</script>

<template>
  <div class="auth-page">

    <!-- Left: brand panel -->
    <div class="auth-side">
      <SignInSide :current-lang="currentLang" />
    </div>

    <!-- Right: form -->
    <div class="auth-main">
      <div class="lang-toggle">
        <button :class="['lang-pill', { active: currentLang === 'tk' }]" @click="currentLang = 'tk'">🇹🇲 TK</button>
        <button :class="['lang-pill', { active: currentLang === 'ru' }]" @click="currentLang = 'ru'">🇷🇺 RU</button>
      </div>

      <SignInForm :current-lang="currentLang" @success="onSuccess" />
    </div>

  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Playfair+Display:wght@700&display=swap');

*, *::before, *::after { box-sizing: border-box; }

.auth-page {
  display: grid;
  grid-template-columns: 460px 1fr;
  min-height: 100vh;
  font-family: 'Plus Jakarta Sans', sans-serif;
}

.auth-side {
  position: sticky;
  top: 0; height: 100vh;
  overflow: hidden;
}

.auth-main {
  display: flex; flex-direction: column; align-items: center;
  background: #FAFAFA;
  padding: 24px 0;
  min-height: 100vh;
}

.lang-toggle {
  display: flex; gap: 6px;
  background: white; border: 1px solid #E5E7EB;
  border-radius: 50px; padding: 4px;
  align-self: flex-end;
  margin-right: 40px; margin-bottom: 8px;
}
.lang-pill {
  padding: 5px 14px; border-radius: 50px; border: none;
  background: transparent; font-size: 12px; font-weight: 600;
  color: #6B7280; cursor: pointer; transition: all 0.2s;
  font-family: 'Plus Jakarta Sans', sans-serif;
}
.lang-pill.active { background: #0F1117; color: white; }

@media (max-width: 1024px) { .auth-page { grid-template-columns: 380px 1fr; } }
@media (max-width: 768px) {
  .auth-page { grid-template-columns: 1fr; }
  .auth-side  { display: none; }
  .lang-toggle { align-self: center; margin-right: 0; }
}
</style>