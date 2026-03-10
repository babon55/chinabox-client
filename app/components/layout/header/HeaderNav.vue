<script setup lang="ts">
type Lang = 'tk' | 'ru'

defineProps<{
  currentLang: Lang
}>()
</script>

<template>
  <nav class="nav-bar">
    <div class="nav-inner">

      <!-- Categories Button -->
      <button class="categories-btn">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="3" y1="6" x2="21" y2="6"/>
          <line x1="3" y1="12" x2="21" y2="12"/>
          <line x1="3" y1="18" x2="21" y2="18"/>
        </svg>
        {{ currentLang === 'tk' ? 'Kategoriýalar' : 'Категории' }}
      </button>

      <div class="nav-links">
        <NuxtLink to="/" class="nav-link">
          {{ currentLang === 'tk' ? 'Baş Sahypa' : 'Главная' }}
        </NuxtLink>
        <NuxtLink to="/deals" class="nav-link deals">
          🔥 {{ currentLang === 'tk' ? 'Arzanladyşlar' : 'Скидки' }}
        </NuxtLink>
        <NuxtLink to="/new" class="nav-link">
          {{ currentLang === 'tk' ? 'Täze Önümler' : 'Новинки' }}
        </NuxtLink>
        <NuxtLink to="/track" class="nav-link">
          {{ currentLang === 'tk' ? 'Sargyt Yzarla' : 'Отследить заказ' }}
        </NuxtLink>
        <NuxtLink to="/about" class="nav-link">
          {{ currentLang === 'tk' ? 'Biz Hakda' : 'О нас' }}
        </NuxtLink>
      </div>

    </div>
  </nav>
</template>

<style scoped>
.nav-bar {
  background: white;
  border-bottom: 1px solid #E5E7EB;
}

.nav-inner {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 24px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.categories-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 18px;
  background: linear-gradient(135deg, #E8A020, #FF8C00);
  color: white;
  border: none;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  transition: filter 0.2s;
  font-family: 'Plus Jakarta Sans', sans-serif;
  flex-shrink: 0;
}
.categories-btn:hover { filter: brightness(1.08); }

.nav-links {
  display: flex;
  align-items: center;
  gap: 2px;
  flex: 1;
}

.nav-link {
  padding: 10px 14px;
  color: #6B7280;
  text-decoration: none;
  font-size: 13px;
  font-weight: 600;
  transition: color 0.2s;
  position: relative;
  white-space: nowrap;
}

.nav-link::after {
  content: '';
  position: absolute;
  bottom: 0; left: 14px; right: 14px;
  height: 2px;
  background: #E8A020;
  border-radius: 2px 2px 0 0;
  transform: scaleX(0);
  transition: transform 0.2s;
}
.nav-link:hover        { color: #0F1117; }
.nav-link:hover::after { transform: scaleX(1); }

.nav-link.router-link-active          { color: #0F1117; font-weight: 700; }
.nav-link.router-link-active::after   { transform: scaleX(1); }

.nav-link.deals       { color: #EF4444; font-weight: 700; }
.nav-link.deals:hover { color: #DC2626; }
.nav-link.deals::after { background: #EF4444; }

@media (max-width: 768px) { .nav-bar { display: none; } }
</style>