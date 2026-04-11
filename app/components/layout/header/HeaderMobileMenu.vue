<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from '#app'

const { locale, t } = useI18n()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'update:lang', lang: 'tk' | 'ru'): void
}>()

const signinStore = useSigninStore()
const cartStore   = useCartStore()
const router      = useRouter()
const config      = useRuntimeConfig()
const API         = config.public.apiBase

interface Product {
  id: string; nameTk: string; nameRu: string
  image: string; imageUrl?: string | null
  price: number
  category: { nameTk: string; nameRu: string }
}
interface Category { id: string; nameTk: string; nameRu: string }

const searchQuery   = ref('')
const searchFocused = ref(false)
const results       = ref<Product[]>([])
const categories    = ref<Category[]>([])
const searching     = ref(false)
const showDrop      = ref(false)

const langs = [
  { code: 'tk' as const, flag: '🇹🇲', label: 'TK' },
  { code: 'ru' as const, flag: '🇷🇺', label: 'RU' },
]

async function loadCategories() {
  try { categories.value = await $fetch<Category[]>(`${API}/products/categories/all`) } catch {}
}
loadCategories()

let st: ReturnType<typeof setTimeout>
watch(searchQuery, (val) => {
  if (!val.trim()) { results.value = []; showDrop.value = false; return }
  clearTimeout(st)
  searching.value = true
  showDrop.value  = true
  st = setTimeout(async () => {
    try {
      const res = await $fetch<{ items: Product[] }>(`${API}/products`, {
        params: { search: val, limit: 5 }
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
  emit('close')
}

function goProduct(id: string) {
  showDrop.value = false
  searchQuery.value = ''
  router.push(`/products/${id}`)
  emit('close')
}

function goCategory(id: string) {
  showDrop.value = false
  searchQuery.value = ''
  router.push(`/products?category=${id}`)
  emit('close')
}

function handleLogout() {
  signinStore.logout()
  emit('close')
}

function changeLang(code: 'tk' | 'ru') {
  locale.value = code
  emit('update:lang', code)
}

function fmt(n: number) { return Number(n).toFixed(2) }

const initials = computed(() => {
  if (!signinStore.user?.name) return '?'
  return signinStore.user.name.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase()
})
</script>

<template>
  <div class="mobile-menu">

    <!-- Search -->
    <div class="search-section">
      <div :class="['search-wrap', { focused: searchFocused }]">
        <svg class="search-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <input
          v-model="searchQuery"
          class="search-input"
          :placeholder="$t('header.searchPlaceholder')"
          autocomplete="off"
          @focus="searchFocused = true; if (searchQuery.trim()) showDrop = true"
          @blur="searchFocused = false"
          @keydown.enter="handleSearch"
          @keydown.escape="showDrop = false"
        />
        <button v-if="searchQuery" class="search-clear" @click="searchQuery = ''; results = []; showDrop = false">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
        <button class="search-btn" @click="handleSearch">
          {{ $t('header.searchButton') }}
        </button>
      </div>

      <!-- Live dropdown -->
      <Transition name="drop">
        <div v-if="showDrop" class="dropdown">

          <div v-if="searching" class="drop-loading">
            <div class="dot-spin"><span /><span /><span /></div>
            <span>{{ $t('header.searching') }}</span>
          </div>

          <template v-else>

            <div v-if="results.length" class="drop-section">
              <div class="drop-label">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>
                {{ $t('header.products') }}
              </div>
              <div
                v-for="p in results" :key="p.id"
                class="drop-item"
                @click="goProduct(p.id)"
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

            <div v-else-if="searchQuery.trim()" class="drop-empty">
              <span>🔍</span>
              <span>{{ $t('common.noResults') }}</span>
            </div>

            <div v-if="categories.length" class="drop-section">
              <div class="drop-label">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/></svg>
                {{ $t('header.categories') }}
              </div>
              <div class="cats-row">
                <button
                  v-for="c in categories.slice(0, 6)" :key="c.id"
                  class="cat-chip"
                  @click="goCategory(c.id)"
                >{{ locale === 'tk' ? c.nameTk : c.nameRu }}</button>
              </div>
            </div>

            <div v-if="results.length" class="drop-footer" @click="handleSearch">
              <span>{{ $t('common.viewAll') }}</span>
              <span class="drop-count">{{ results.length }}+</span>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
            </div>

          </template>
        </div>
      </Transition>
    </div>

    <!-- User banner (logged in) -->
    <div v-if="signinStore.isLoggedIn" class="user-banner">
      <div class="user-avatar">{{ initials }}</div>
      <div class="user-info">
        <div class="user-name">{{ signinStore.user?.name }}</div>
        <div class="user-email">{{ signinStore.user?.email }}</div>
      </div>
    </div>

    <!-- Nav links -->
    <div class="nav-section">
      <NuxtLink to="/"         class="nav-link" @click="emit('close')"><span class="link-icon">🏠</span><span>{{ $t('footer.home') }}</span></NuxtLink>
      <NuxtLink to="/products" class="nav-link" @click="emit('close')"><span class="link-icon">🛍️</span><span>{{ $t('footer.products') }}</span></NuxtLink>
      <NuxtLink to="/track"    class="nav-link" @click="emit('close')"><span class="link-icon">📍</span><span>{{ $t('track.title') }}</span></NuxtLink>
      <NuxtLink to="/request"  class="nav-link" @click="emit('close')"><span class="link-icon">📝</span><span>{{ $t('request.title') }}</span></NuxtLink>
      <NuxtLink to="/orders"   class="nav-link" @click="emit('close')"><span class="link-icon">📦</span><span>{{ $t('auth.orders') }}</span></NuxtLink>
      <NuxtLink to="/cart"     class="nav-link cart-link" @click="emit('close')">
        <span class="link-icon">🛒</span>
        <span>{{ $t('footer.cart') }}</span>
        <span v-if="cartStore.totalItems > 0" class="cart-count">{{ cartStore.totalItems }}</span>
      </NuxtLink>
    </div>

    <!-- Lang + Auth footer -->
    <div class="bottom-section">
      <!-- Language switcher -->
      <div class="lang-row">
        <span class="lang-label">🌐</span>
        <div class="lang-switcher">
          <button
            v-for="lang in langs" :key="lang.code"
            :class="['lang-btn', { active: locale === lang.code }]"
            @click="changeLang(lang.code)"
          >{{ lang.flag }} {{ lang.label }}</button>
        </div>
      </div>

      <!-- Auth buttons -->
      <div class="auth-row">
        <template v-if="!signinStore.isLoggedIn">
          <NuxtLink to="/signin" class="btn-signin" @click="emit('close')">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg>
            {{ $t('auth.signin.login') }}
          </NuxtLink>
          <NuxtLink to="/signup" class="btn-signup" @click="emit('close')">
            {{ $t('auth.signup.register') }}
          </NuxtLink>
        </template>
        <template v-else>
          <NuxtLink to="/orders" class="btn-orders" @click="emit('close')">
            📦 {{ $t('auth.orders') }}
          </NuxtLink>
          <button class="btn-logout" @click="handleLogout">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
            {{ $t('auth.logout') }}
          </button>
        </template>
      </div>
    </div>

  </div>
</template>

<style scoped>
.mobile-menu {
  background: white;
  border-top: 1px solid #E5E7EB;
  display: flex;
  flex-direction: column;
  max-height: calc(100dvh - 110px);
  overflow-y: auto;
  overscroll-behavior: contain;
}

/* ── Search section ── */
.search-section {
  position: relative;
  padding: 12px 14px;
  background: #F9FAFB;
  border-bottom: 1px solid #E5E7EB;
}

.search-wrap {
  display: flex;
  align-items: center;
  background: white;
  border: 2px solid #E5E7EB;
  border-radius: 12px;
  padding: 0 4px 0 12px;
  gap: 8px;
  transition: all 0.2s;
  overflow: hidden;
}
.search-wrap.focused {
  border-color: #E8A020;
  box-shadow: 0 0 0 3px rgba(232,160,32,0.12);
  border-radius: 12px 12px 0 0;
}

.search-icon { color: #9CA3AF; flex-shrink: 0; transition: color 0.2s; }
.search-wrap.focused .search-icon { color: #E8A020; }

.search-input {
  flex: 1; border: none; background: transparent; outline: none;
  font-size: 14px; color: #0F1117; padding: 11px 0;
  font-family: 'Plus Jakarta Sans', sans-serif; min-width: 0;
}
.search-input::placeholder { color: #9CA3AF; }

.search-clear {
  background: none; border: none; color: #9CA3AF;
  cursor: pointer; padding: 4px; display: flex;
  align-items: center; border-radius: 50%; transition: all 0.2s; flex-shrink: 0;
}
.search-clear:hover { background: #F3F4F6; color: #0F1117; }

.search-btn {
  background: linear-gradient(135deg, #E8A020, #FF8C00);
  color: white; border: none; padding: 7px 14px;
  border-radius: 8px; font-size: 13px; font-weight: 600;
  cursor: pointer; white-space: nowrap; flex-shrink: 0;
  font-family: 'Plus Jakarta Sans', sans-serif;
  transition: filter 0.2s;
}
.search-btn:active { filter: brightness(0.92); }

/* ── Dropdown ── */
.dropdown {
  position: absolute; top: calc(100% - 12px); left: 14px; right: 14px;
  background: white;
  border: 2px solid #E8A020; border-top: none;
  border-radius: 0 0 14px 14px;
  box-shadow: 0 12px 32px rgba(0,0,0,0.12);
  z-index: 999; overflow: hidden;
  max-height: 360px; overflow-y: auto;
}

.drop-loading {
  display: flex; align-items: center; gap: 10px;
  padding: 14px 16px; color: #9CA3AF; font-size: 13px;
  font-family: 'Plus Jakarta Sans', sans-serif;
}
.dot-spin { display: flex; gap: 4px; }
.dot-spin span {
  width: 5px; height: 5px; border-radius: 50%;
  background: #E8A020; animation: bounce 0.6s ease-in-out infinite;
}
.dot-spin span:nth-child(2) { animation-delay: .1s; }
.dot-spin span:nth-child(3) { animation-delay: .2s; }
@keyframes bounce { 0%,80%,100% { transform: scale(0); } 40% { transform: scale(1); } }

.drop-section { padding: 8px 0 2px; }
.drop-label {
  display: flex; align-items: center; gap: 6px;
  padding: 2px 14px 6px;
  font-size: 10px; font-weight: 700; color: #9CA3AF;
  text-transform: uppercase; letter-spacing: .08em;
  font-family: 'Plus Jakarta Sans', sans-serif;
}
.drop-item {
  display: flex; align-items: center; gap: 10px;
  padding: 8px 14px; cursor: pointer; transition: background .12s;
}
.drop-item:active { background: #FFF8EE; }

.prod-thumb {
  width: 36px; height: 36px; border-radius: 7px;
  background: #F9FAFB; border: 1px solid #E5E7EB;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0; overflow: hidden;
}
.prod-img   { width: 100%; height: 100%; object-fit: cover; }
.prod-emoji { font-size: 18px; }
.prod-info  { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 1px; }
.prod-name  { font-size: 13px; font-weight: 600; color: #0F1117; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; font-family: 'Plus Jakarta Sans', sans-serif; }
.prod-cat   { font-size: 11px; color: #9CA3AF; font-family: 'Plus Jakarta Sans', sans-serif; }
.prod-price { font-size: 13px; font-weight: 700; color: #E8A020; flex-shrink: 0; font-family: 'Plus Jakarta Sans', sans-serif; }

.drop-empty {
  display: flex; align-items: center; gap: 8px;
  padding: 14px 16px; font-size: 13px; color: #9CA3AF;
  font-family: 'Plus Jakarta Sans', sans-serif;
}

.cats-row { display: flex; gap: 6px; flex-wrap: wrap; padding: 0 14px 8px; }
.cat-chip {
  padding: 5px 12px; border-radius: 50px;
  border: 1.5px solid #E5E7EB; background: #F9FAFB;
  font-size: 12px; font-weight: 600; color: #374151;
  cursor: pointer; transition: all .15s;
  font-family: 'Plus Jakarta Sans', sans-serif;
}
.cat-chip:active { border-color: #E8A020; color: #E8A020; background: #FFF8EE; }

.drop-footer {
  display: flex; align-items: center; gap: 8px;
  padding: 10px 14px; border-top: 1px solid #F3F4F6;
  font-size: 13px; font-weight: 700; color: #E8A020;
  cursor: pointer;
  font-family: 'Plus Jakarta Sans', sans-serif;
}
.drop-count {
  margin-left: auto; background: rgba(232,160,32,.12);
  color: #E8A020; font-size: 11px; font-weight: 700;
  padding: 1px 7px; border-radius: 50px;
}

.drop-enter-active, .drop-leave-active { transition: opacity .15s, transform .15s; }
.drop-enter-from, .drop-leave-to       { opacity: 0; transform: translateY(-4px); }

/* ── User banner ── */
.user-banner {
  display: flex; align-items: center; gap: 12px;
  padding: 14px 20px;
  background: linear-gradient(135deg, #0F1117, #1a1d2e);
  border-bottom: 1px solid rgba(255,255,255,.06);
}
.user-avatar {
  width: 40px; height: 40px; border-radius: 50%;
  background: linear-gradient(135deg, #E8A020, #FF8C00);
  color: white; font-size: 13px; font-weight: 800;
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
}
.user-name  { font-size: 14px; font-weight: 700; color: white; }
.user-email { font-size: 11px; color: rgba(255,255,255,.4); margin-top: 2px; }

/* ── Nav links ── */
.nav-section {
  display: flex; flex-direction: column;
  padding: 8px 10px; gap: 2px;
}
.nav-link {
  display: flex; align-items: center; gap: 12px;
  padding: 12px 12px; border-radius: 10px;
  color: #374151; text-decoration: none;
  font-size: 14px; font-weight: 600;
  font-family: 'Plus Jakarta Sans', sans-serif;
  transition: background 0.15s, color 0.15s;
}
.nav-link:active { background: #FFF8EE; color: #E8A020; }
.nav-link.router-link-active { background: #FFF8EE; color: #E8A020; }
.link-icon { font-size: 18px; width: 24px; text-align: center; flex-shrink: 0; }
.cart-link { position: relative; }
.cart-count {
  margin-left: auto;
  background: #EF4444; color: white;
  font-size: 11px; font-weight: 700;
  padding: 2px 8px; border-radius: 50px;
}

/* ── Bottom: lang + auth ── */
.bottom-section {
  margin-top: auto;
  border-top: 1px solid #E5E7EB;
  padding: 12px 14px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.lang-row {
  display: flex; align-items: center; gap: 10px;
}
.lang-label { font-size: 16px; }
.lang-switcher {
  display: flex; background: #F3F4F6;
  border-radius: 20px; padding: 2px; gap: 2px;
}
.lang-btn {
  background: transparent; border: none;
  color: #6B7280; padding: 4px 12px;
  border-radius: 16px; font-size: 12px; font-weight: 600;
  cursor: pointer; transition: all 0.2s;
  font-family: 'Plus Jakarta Sans', sans-serif;
}
.lang-btn.active { background: #E8A020; color: white; }

.auth-row {
  display: flex; gap: 8px; flex-wrap: wrap;
}

.btn-signin {
  flex: 1; min-width: 120px;
  display: inline-flex; align-items: center; justify-content: center; gap: 7px;
  height: 44px; border-radius: 10px;
  border: 2px solid #E5E7EB; background: white;
  color: #0F1117; font-size: 13px; font-weight: 700;
  text-decoration: none; font-family: 'Plus Jakarta Sans', sans-serif;
  transition: all 0.2s;
}
.btn-signin:active { border-color: #E8A020; color: #E8A020; }

.btn-signup {
  flex: 1; min-width: 120px;
  display: inline-flex; align-items: center; justify-content: center;
  height: 44px; border-radius: 10px; border: none;
  background: linear-gradient(135deg, #0F1117, #2A2D3A);
  color: white; font-size: 13px; font-weight: 700;
  text-decoration: none; font-family: 'Plus Jakarta Sans', sans-serif;
}

.btn-orders {
  flex: 1; min-width: 120px;
  display: inline-flex; align-items: center; justify-content: center;
  height: 44px; border-radius: 10px; border: none;
  background: linear-gradient(135deg, #E8A020, #FF8C00);
  color: white; font-size: 13px; font-weight: 700;
  text-decoration: none; font-family: 'Plus Jakarta Sans', sans-serif;
}

.btn-logout {
  flex: 1; min-width: 120px;
  display: inline-flex; align-items: center; justify-content: center; gap: 7px;
  height: 44px; border-radius: 10px;
  border: 2px solid #FECACA; background: #FEF2F2;
  color: #DC2626; font-size: 13px; font-weight: 700;
  cursor: pointer; font-family: 'Plus Jakarta Sans', sans-serif;
  transition: all 0.2s;
}
.btn-logout:active { background: #DC2626; color: white; border-color: #DC2626; }
</style>