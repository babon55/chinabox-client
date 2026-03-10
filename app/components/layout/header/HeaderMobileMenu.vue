<script setup lang="ts">
type Lang = 'tk' | 'ru'

defineProps<{
  currentLang: Lang
}>()

const emit = defineEmits<{
  (e: 'close'): void
}>()

const searchQuery = ref('')
</script>

<template>
  <Transition name="mobile-slide">
    <div class="mobile-menu">
      <!-- Search -->
      <div class="mobile-search">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="11" cy="11" r="8"/>
          <line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <input
          v-model="searchQuery"
          :placeholder="currentLang === 'tk' ? 'Haryt gözle...' : 'Поиск товаров...'"
          class="mobile-search-input"
        />
      </div>

      <!-- Links -->
      <NuxtLink to="/"      class="mobile-link" @click="emit('close')">{{ currentLang === 'tk' ? 'Baş Sahypa'     : 'Главная'             }}</NuxtLink>
      <NuxtLink to="/deals" class="mobile-link" @click="emit('close')">🔥 {{ currentLang === 'tk' ? 'Arzanladyşlar' : 'Скидки'              }}</NuxtLink>
      <NuxtLink to="/new"   class="mobile-link" @click="emit('close')">{{ currentLang === 'tk' ? 'Täze Önümler'   : 'Новинки'             }}</NuxtLink>
      <NuxtLink to="/track" class="mobile-link" @click="emit('close')">{{ currentLang === 'tk' ? 'Sargyt Yzarla'  : 'Отследить заказ'     }}</NuxtLink>
      <NuxtLink to="/about" class="mobile-link" @click="emit('close')">{{ currentLang === 'tk' ? 'Biz Hakda'      : 'О нас'               }}</NuxtLink>

      <!-- Auth -->
      <div class="mobile-auth">
        <NuxtLink to="/auth/login"    class="btn-signin" @click="emit('close')">{{ currentLang === 'tk' ? 'Giriş'    : 'Войти'       }}</NuxtLink>
        <NuxtLink to="/auth/register" class="btn-signup" @click="emit('close')">{{ currentLang === 'tk' ? 'Hasap Aç' : 'Регистрация' }}</NuxtLink>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.mobile-menu {
  background: white;
  padding: 16px 24px 24px;
  border-top: 1px solid #E5E7EB;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.mobile-search {
  display: flex;
  align-items: center;
  gap: 10px;
  background: #F9FAFB;
  border: 1.5px solid #E5E7EB;
  border-radius: 10px;
  padding: 10px 14px;
  margin-bottom: 12px;
  color: #6B7280;
}

.mobile-search-input {
  border: none;
  background: transparent;
  outline: none;
  flex: 1;
  font-size: 14px;
  font-family: 'Plus Jakarta Sans', sans-serif;
  color: #0F1117;
}

.mobile-link {
  padding: 12px 4px;
  color: #6B7280;
  text-decoration: none;
  font-size: 15px;
  font-weight: 600;
  border-bottom: 1px solid #E5E7EB;
  transition: color 0.2s;
}
.mobile-link:hover { color: #E8A020; }

.mobile-auth {
  display: flex;
  gap: 10px;
  margin-top: 12px;
}

.btn-signin {
  flex: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 10px 18px;
  border-radius: 10px;
  border: 2px solid #E5E7EB;
  background: white;
  color: #0F1117;
  font-size: 13px;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.2s;
  font-family: 'Plus Jakarta Sans', sans-serif;
}
.btn-signin:hover { border-color: #E8A020; color: #E8A020; }

.btn-signup {
  flex: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 10px 18px;
  border-radius: 10px;
  border: none;
  background: linear-gradient(135deg, #0F1117, #2A2D3A);
  color: white;
  font-size: 13px;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.2s;
  font-family: 'Plus Jakarta Sans', sans-serif;
}
.btn-signup:hover { background: linear-gradient(135deg, #E8A020, #FF8C00); }

.mobile-slide-enter-active, .mobile-slide-leave-active { transition: all 0.3s ease; }
.mobile-slide-enter-from, .mobile-slide-leave-to { opacity: 0; transform: translateY(-10px); }
</style>