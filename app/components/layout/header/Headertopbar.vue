<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

const { locale } = useI18n()
const signinStore = useSigninStore()

const langs = [
  { code: 'tk' as const, flag: '🇹🇲', label: 'TK' },
  { code: 'ru' as const, flag: '🇷🇺', label: 'RU' },
]

function changeLang(code: 'tk' | 'ru') {
  locale.value = code
  localStorage.setItem('chinaexpress_lang', code)
}

const initials = computed(() => {
  if (!signinStore.user?.name) return '?'
  return signinStore.user.name
    .split(' ')
    .map((w: string) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
})

const firstName = computed(() => {
  return signinStore.user?.name?.split(' ')[0] ?? ''
})
</script>

<template>
  <div class="top-bar">
    <div class="top-bar-inner">
      <span class="top-msg">{{ $t('header.delivery') }}</span>

      <div class="top-right">

        <!-- Guest: signin button -->
        <NuxtLink v-if="!signinStore.isLoggedIn" to="/signin" class="top-signin">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
            <polyline points="10 17 15 12 10 7"/>
            <line x1="15" y1="12" x2="3" y2="12"/>
          </svg>
          {{ locale === 'tk' ? 'Gir' : 'Войти' }}
        </NuxtLink>

        <!-- Logged in: user pill -->
        <NuxtLink v-else to="/profile" class="top-user">
          <div class="top-user-avatar">{{ initials }}</div>
          <span class="top-user-name">{{ firstName }}</span>
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
            <polyline points="9 18 15 12 9 6"/>
          </svg>
        </NuxtLink>

        <!-- Lang switcher -->
        <div class="lang-switcher">
          <button
            v-for="lang in langs"
            :key="lang.code"
            :class="['lang-btn', { active: locale === lang.code }]"
            @click="changeLang(lang.code)"
          >{{ lang.flag }} {{ lang.label }}</button>
        </div>

      </div>
    </div>
  </div>
</template>

<style scoped>
.top-bar {
  background: #0F1117;
  color: rgba(255,255,255,0.75);
  font-size: 12px;
  font-weight: 500;
}
.top-bar-inner {
  max-width: 1280px; margin: 0 auto;
  padding: 7px 24px;
  display: flex; justify-content: space-between; align-items: center;
}
.top-msg { letter-spacing: 0.02em; }
.top-right { display: flex; align-items: center; gap: 12px; }

/* ── Guest: signin button ── */
.top-signin {
  display: inline-flex; align-items: center; gap: 5px;
  padding: 3px 12px; border-radius: 20px;
  border: 1px solid #E8A020;
  color: #E8A020;
  font-size: 11px; font-weight: 700;
  text-decoration: none; letter-spacing: 0.03em;
  font-family: 'Plus Jakarta Sans', sans-serif;
  transition: all 0.2s;
  white-space: nowrap;
}
.top-signin:hover {
  background: #E8A020;
  color: #0F1117;
}

/* ── Logged in: user pill ── */
.top-user {
  display: inline-flex; align-items: center; gap: 7px;
  padding: 3px 10px 3px 3px; border-radius: 20px;
  background: rgba(232, 160, 32, 0.12);
  border: 1px solid rgba(232, 160, 32, 0.3);
  text-decoration: none;
  transition: all 0.2s;
  white-space: nowrap;
}
.top-user:hover {
  background: rgba(232, 160, 32, 0.22);
  border-color: #E8A020;
}
.top-user-avatar {
  width: 20px; height: 20px; border-radius: 50%;
  background: linear-gradient(135deg, #E8A020, #FF8C00);
  color: #0F1117;
  font-size: 9px; font-weight: 800;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
.top-user-name {
  font-size: 11px; font-weight: 700;
  color: #E8A020; letter-spacing: 0.02em;
  font-family: 'Plus Jakarta Sans', sans-serif;
  max-width: 80px; overflow: hidden;
  text-overflow: ellipsis;
}
.top-user svg { color: rgba(232, 160, 32, 0.6); }

/* ── Lang switcher ── */
.lang-switcher {
  display: flex; background: rgba(255,255,255,0.08);
  border-radius: 20px; padding: 2px; gap: 2px;
}
.lang-btn {
  background: transparent; border: none;
  color: rgba(255,255,255,0.6); padding: 3px 10px;
  border-radius: 16px; font-size: 11px; font-weight: 600;
  cursor: pointer; transition: all 0.2s;
  letter-spacing: 0.03em;
  font-family: 'Plus Jakarta Sans', sans-serif;
}
.lang-btn.active { background: #E8A020; color: #0F1117; }

/* ── Responsive ── */
@media (max-width: 480px) {
  .top-msg { display: none; }
  .top-bar-inner { justify-content: flex-end; }
}
</style>