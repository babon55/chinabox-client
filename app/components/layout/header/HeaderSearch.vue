<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter, useRoute } from '#app'

const { locale, t } = useI18n()

const searchQuery   = defineModel<string>('searchQuery', { default: '' })
const searchFocused = ref(false)
const router        = useRouter()
const route         = useRoute()

const config = useRuntimeConfig()
const API   = config.public.apiBase

interface Product {
  id: string; nameTk: string; nameRu: string
  image: string; imageUrl?: string | null
  price: number
  category: { nameTk: string; nameRu: string }
}

interface Category {
  id: string; nameTk: string; nameRu: string
}

const results    = ref<Product[]>([])
const categories = ref<Category[]>([])
const searching  = ref(false)
const showDrop   = ref(false)
const inputRef   = ref<HTMLInputElement | null>(null)

// Load categories once
onMounted(async () => {
  try {
    categories.value = await $fetch<Category[]>(`${API}/products/categories/all`)
  } catch {}
})

// Debounced instant search
let st: ReturnType<typeof setTimeout>
watch(searchQuery, (val) => {
  if (!val.trim()) { results.value = []; showDrop.value = false; return }
  clearTimeout(st)
  searching.value = true
  showDrop.value  = true
  st = setTimeout(async () => {
    try {
      const res = await $fetch<{ items: Product[] }>(`${API}/products`, {
        params: { search: val, limit: 6 }
      })
      results.value = res.items
    } catch {}
    finally { searching.value = false }
  }, 250)
})

function handleSearch() {
  if (!searchQuery.value.trim()) return
  showDrop.value = false
  router.push(`/products?search=${encodeURIComponent(searchQuery.value)}`)
}

function goProduct(id: string) {
  showDrop.value  = false
  searchQuery.value = ''
  router.push(`/products/${id}`)
}

function goCategory(id: string) {
  showDrop.value    = false
  searchQuery.value = ''
  router.push(`/products?category=${id}`)
}

function onFocus() {
  searchFocused.value = true
  if (searchQuery.value.trim()) showDrop.value = true
}

function onBlur() {
  searchFocused.value = false
  setTimeout(() => showDrop.value = false, 180)
}

function fmt(n: number) { return Number(n).toFixed(2) }
</script>

<template>
  <div :class="['search-wrap', { focused: searchFocused }]">
    <div class="search-inner">
      <svg class="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
      </svg>
      <input
        ref="inputRef"
        v-model="searchQuery"
        :placeholder="$t('header.searchPlaceholder')"
        class="search-input"
        autocomplete="off"
        @focus="onFocus"
        @blur="onBlur"
        @keydown.enter="handleSearch"
        @keydown.escape="showDrop = false"
      />
      <button v-if="searchQuery" class="search-clear" @click="searchQuery = ''; results = []; showDrop = false">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
          <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>
      <button class="search-btn" @click="handleSearch">
        {{ $t('header.searchButton') }}
      </button>
    </div>

    <!-- ── Dropdown ── -->
    <Transition name="drop">
      <div v-if="showDrop" class="dropdown">

        <!-- Searching spinner -->
        <div v-if="searching" class="drop-loading">
          <div class="dot-spin">
            <span /><span /><span />
          </div>
          <span>{{ $t('header.searching') }}</span>
        </div>

        <template v-else>

          <!-- Products -->
          <div v-if="results.length" class="drop-section">
            <div class="drop-label">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>
              {{ $t('header.products') }}
            </div>
            <div
              v-for="p in results" :key="p.id"
              class="drop-item product-item"
              @mousedown.prevent="goProduct(p.id)"
            >
              <div class="prod-thumb">
                <img v-if="p.imageUrl" :src="p.imageUrl" class="prod-img" />
                <span v-else class="prod-emoji">{{ p.image }}</span>
              </div>
              <div class="prod-info">
                <span class="prod-name">{{ locale === 'tk' ? p.nameTk : p.nameRu }}</span>
                <span class="prod-cat">{{ locale === 'tk' ? p.category.nameTk : p.category.nameRu }}</span>
              </div>
              <span class="prod-price">${{ fmt(p.price) }}</span>
            </div>
          </div>

          <!-- No results -->
          <div v-else-if="searchQuery.trim() && !searching" class="drop-empty">
            <span>🔍</span>
            <span>{{ $t('common.noResults') }}</span>
          </div>

          <!-- Categories (always shown) -->
          <div v-if="categories.length" class="drop-section">
            <div class="drop-label">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/></svg>
              {{ $t('header.categories') }}
            </div>
            <div class="cats-row">
              <button
                v-for="c in categories.slice(0, 5)" :key="c.id"
                class="cat-chip"
                @mousedown.prevent="goCategory(c.id)"
              >{{ locale === 'tk' ? c.nameTk : c.nameRu }}</button>
            </div>
          </div>

          <!-- View all -->
          <div v-if="results.length" class="drop-footer" @mousedown.prevent="handleSearch">
            <span>{{ $t('common.viewAll') }}</span>
            <span class="drop-count">{{ results.length }}+</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
          </div>

        </template>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.search-wrap {
  flex: 1; max-width: 560px;
  transition: all 0.3s;
  position: relative;
}

.search-inner {
  display: flex; align-items: center;
  background: #F9FAFB; border: 2px solid #E5E7EB;
  border-radius: 14px; padding: 0 4px 0 14px;
  gap: 8px; transition: all 0.3s; overflow: hidden;
}
.search-wrap.focused .search-inner {
  border-color: #E8A020; background: white;
  box-shadow: 0 0 0 4px rgba(232,160,32,0.1);
  border-radius: 14px 14px 0 0;
}

.search-icon { color: #6B7280; flex-shrink: 0; transition: color 0.2s; }
.search-wrap.focused .search-icon { color: #E8A020; }

.search-input {
  flex: 1; border: none; background: transparent; outline: none;
  font-size: 14px; color: #0F1117; padding: 11px 0;
  font-family: 'Plus Jakarta Sans', sans-serif; min-width: 0;
}
.search-input::placeholder { color: #9CA3AF; }

.search-clear {
  background: none; border: none; color: #6B7280;
  cursor: pointer; padding: 4px; display: flex;
  align-items: center; border-radius: 50%; transition: all 0.2s;
}
.search-clear:hover { background: #E5E7EB; color: #0F1117; }

.search-btn {
  background: linear-gradient(135deg, #E8A020, #FF8C00);
  color: white; border: none; padding: 8px 18px;
  border-radius: 10px; font-size: 13px; font-weight: 600;
  cursor: pointer; transition: all 0.2s; white-space: nowrap;
  font-family: 'Plus Jakarta Sans', sans-serif; flex-shrink: 0;
}
.search-btn:hover { transform: scale(1.03); box-shadow: 0 4px 12px rgba(232,160,32,0.4); }

/* ── Dropdown ── */
.dropdown {
  position: absolute; top: 100%; left: 0; right: 0;
  background: white; border: 2px solid #E8A020;
  border-top: none; border-radius: 0 0 16px 16px;
  box-shadow: 0 16px 48px rgba(0,0,0,.12);
  z-index: 999; overflow: hidden;
  max-height: 480px; overflow-y: auto;
}

/* Loading */
.drop-loading {
  display: flex; align-items: center; gap: 10px;
  padding: 16px 18px; color: #9CA3AF; font-size: 13px;
  font-family: 'Plus Jakarta Sans', sans-serif;
}
.dot-spin { display: flex; gap: 4px; }
.dot-spin span {
  width: 6px; height: 6px; border-radius: 50%;
  background: #E8A020; animation: bounce 0.6s ease-in-out infinite;
}
.dot-spin span:nth-child(2) { animation-delay: .1s; }
.dot-spin span:nth-child(3) { animation-delay: .2s; }
@keyframes bounce { 0%,80%,100% { transform: scale(0); } 40% { transform: scale(1); } }

/* Section */
.drop-section { padding: 10px 0 4px; }
.drop-label {
  display: flex; align-items: center; gap: 7px;
  padding: 4px 16px 8px;
  font-size: 10px; font-weight: 700; color: #9CA3AF;
  text-transform: uppercase; letter-spacing: .08em;
  font-family: 'Plus Jakarta Sans', sans-serif;
}

/* Product items */
.product-item {
  display: flex; align-items: center; gap: 12px;
  padding: 8px 16px; cursor: pointer; transition: background .12s;
}
.product-item:hover { background: #FFF8EE; }

.prod-thumb {
  width: 40px; height: 40px; border-radius: 8px;
  background: #F9FAFB; border: 1px solid #E5E7EB;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0; overflow: hidden;
}
.prod-img   { width: 100%; height: 100%; object-fit: cover; }
.prod-emoji { font-size: 20px; }
.prod-info  { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 2px; }
.prod-name  { font-size: 13px; font-weight: 600; color: #0F1117; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; font-family: 'Plus Jakarta Sans', sans-serif; }
.prod-cat   { font-size: 11px; color: #9CA3AF; font-family: 'Plus Jakarta Sans', sans-serif; }
.prod-price { font-size: 13px; font-weight: 700; color: #E8A020; flex-shrink: 0; font-family: 'Plus Jakarta Sans', sans-serif; }

/* No results */
.drop-empty {
  display: flex; align-items: center; gap: 10px;
  padding: 16px 18px; font-size: 13px; color: #9CA3AF;
  font-family: 'Plus Jakarta Sans', sans-serif;
}

/* Categories */
.cats-row { display: flex; gap: 6px; flex-wrap: wrap; padding: 0 16px 10px; }
.cat-chip {
  padding: 5px 12px; border-radius: 50px;
  border: 1.5px solid #E5E7EB; background: #F9FAFB;
  font-size: 12px; font-weight: 600; color: #374151;
  cursor: pointer; transition: all .15s;
  font-family: 'Plus Jakarta Sans', sans-serif;
}
.cat-chip:hover { border-color: #E8A020; color: #E8A020; background: #FFF8EE; }

/* Footer */
.drop-footer {
  display: flex; align-items: center; gap: 8px;
  padding: 12px 16px; border-top: 1px solid #F3F4F6;
  font-size: 13px; font-weight: 700; color: #E8A020;
  cursor: pointer; transition: background .12s;
  font-family: 'Plus Jakarta Sans', sans-serif;
}
.drop-footer:hover { background: #FFF8EE; }
.drop-count {
  margin-left: auto; background: rgba(232,160,32,.12);
  color: #E8A020; font-size: 11px; font-weight: 700;
  padding: 1px 7px; border-radius: 50px;
}

/* Transition */
.drop-enter-active, .drop-leave-active { transition: opacity .15s, transform .15s; }
.drop-enter-from, .drop-leave-to       { opacity: 0; transform: translateY(-4px); }

@media (max-width: 768px) { .search-wrap { display: none; } }
</style>