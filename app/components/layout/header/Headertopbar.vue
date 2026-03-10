<script setup lang="ts">
type Lang = 'tk' | 'ru'

const props = defineProps<{
  currentLang: Lang
  isAdmin: boolean
}>()

const emit = defineEmits<{
  (e: 'update:currentLang', val: Lang): void
}>()

const langs: Record<Lang, { flag: string; label: string }> = {
  tk: { flag: '🇹🇲', label: 'TK' },
  ru: { flag: '🇷🇺', label: 'RU' },
}
</script>

<template>
  <div class="top-bar">
    <div class="top-bar-inner">
      <span class="top-msg">
        ✈ {{ currentLang === 'tk' ? 'turkmenistan boýunça eltip bermek' : 'Доставка по всему туркменистану' }}
      </span>

      <div class="top-right">
        <!-- Language Switcher -->
        <div class="lang-switcher">
          <button
            v-for="(meta, code) in langs"
            :key="code"
            :class="['lang-btn', { active: currentLang === code }]"
            @click="emit('update:currentLang', code as Lang)"
          >
            {{ meta.flag }} {{ meta.label }}
          </button>
        </div>

        <!-- Admin Link (only if admin) -->
        <NuxtLink v-if="isAdmin" to="/admin" class="admin-link">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 20h9"/>
            <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
          </svg>
          Admin
        </NuxtLink>
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
  max-width: 1280px;
  margin: 0 auto;
  padding: 7px 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.top-msg { letter-spacing: 0.02em; }

.top-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.lang-switcher {
  display: flex;
  background: rgba(255,255,255,0.08);
  border-radius: 20px;
  padding: 2px;
  gap: 2px;
}

.lang-btn {
  background: transparent;
  border: none;
  color: rgba(255,255,255,0.6);
  padding: 3px 10px;
  border-radius: 16px;
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  letter-spacing: 0.03em;
}

.lang-btn.active {
  background: #E8A020;
  color: #0F1117;
}

.admin-link {
  display: flex;
  align-items: center;
  gap: 5px;
  color: #F5C05A;
  text-decoration: none;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.05em;
  transition: color 0.2s;
}
.admin-link:hover { color: white; }
</style>