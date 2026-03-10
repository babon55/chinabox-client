<script setup lang="ts">
type Lang = 'tk' | 'ru'

defineProps<{
  currentLang: Lang
}>()

const searchQuery = defineModel<string>('searchQuery', { default: '' })
const searchFocused = ref(false)

const placeholder = computed(() =>
  searchQuery.value === 'tk' ? 'Haryt gözle...' : 'Поиск товаров...'
)
</script>

<template>
  <div :class="['search-wrap', { focused: searchFocused }]">
    <div class="search-inner">
      <!-- Search Icon -->
      <svg class="search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="11" cy="11" r="8"/>
        <line x1="21" y1="21" x2="16.65" y2="16.65"/>
      </svg>

      <!-- Input -->
      <input
        v-model="searchQuery"
        :placeholder="currentLang === 'tk' ? 'Haryt gözle...' : 'Поиск товаров...'"
        class="search-input"
        @focus="searchFocused = true"
        @blur="searchFocused = false"
      />

      <!-- Clear button -->
      <button v-if="searchQuery" class="search-clear" @click="searchQuery = ''">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
          <line x1="18" y1="6" x2="6" y2="18"/>
          <line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>

      <!-- Search Button -->
      <button class="search-btn">
        {{ currentLang === 'tk' ? 'Gözle' : 'Найти' }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.search-wrap {
  flex: 1;
  max-width: 560px;
  transition: all 0.3s;
}

.search-inner {
  display: flex;
  align-items: center;
  background: #F9FAFB;
  border: 2px solid #E5E7EB;
  border-radius: 14px;
  padding: 0 4px 0 14px;
  gap: 8px;
  transition: all 0.3s;
  overflow: hidden;
}

.search-wrap.focused .search-inner {
  border-color: #E8A020;
  background: white;
  box-shadow: 0 0 0 4px rgba(232,160,32,0.1);
}

.search-icon {
  color: #6B7280;
  flex-shrink: 0;
  transition: color 0.2s;
}
.search-wrap.focused .search-icon { color: #E8A020; }

.search-input {
  flex: 1;
  border: none;
  background: transparent;
  outline: none;
  font-size: 14px;
  font-weight: 400;
  color: #0F1117;
  padding: 11px 0;
  font-family: 'Plus Jakarta Sans', sans-serif;
}
.search-input::placeholder { color: #9CA3AF; }

.search-clear {
  background: none;
  border: none;
  color: #6B7280;
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
  border-radius: 50%;
  transition: all 0.2s;
}
.search-clear:hover { background: #E5E7EB; color: #0F1117; }

.search-btn {
  background: linear-gradient(135deg, #E8A020, #FF8C00);
  color: white;
  border: none;
  padding: 8px 18px;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
  font-family: 'Plus Jakarta Sans', sans-serif;
  flex-shrink: 0;
}
.search-btn:hover {
  transform: scale(1.03);
  box-shadow: 0 4px 12px rgba(232,160,32,0.4);
}
</style>