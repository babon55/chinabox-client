<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from '#app'

const { locale } = useI18n()
const router     = useRouter()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'update:lang', lang: 'tk' | 'ru'): void
}>()

const signinStore = useSigninStore()
const cartStore   = useCartStore()
const config      = useRuntimeConfig()
const API         = config.public.apiBase

interface Product  { id: string; nameTk: string; nameRu: string; image: string; imageUrl?: string | null; price: number; category: { nameTk: string; nameRu: string } }
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
      const res = await $fetch<{ items: Product[] }>(`${API}/products`, { params: { search: val, limit: 5 } })
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
  showDrop.value = false; searchQuery.value = ''
  router.push(`/products/${id}`); emit('close')
}

function goCategory(id: string) {
  showDrop.value = false; searchQuery.value = ''
  router.push(`/products?category=${id}`); emit('close')
}

function nav(to: string) { router.push(to); emit('close') }
function changeLang(code: 'tk' | 'ru') { locale.value = code; emit('update:lang', code) }
function handleLogout() { signinStore.logout(); emit('close') }
function fmt(n: number) { return Number(n).toFixed(2) }

const initials = computed(() => {
  if (!signinStore.user?.name) return '?'
  return signinStore.user.name.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase()
})

// ── Swipe to close ──
const sheetRef = ref<HTMLDivElement | null>(null)
const dragY    = ref(0)
const dragging = ref(false)
let startY = 0

function onTouchStart(e: TouchEvent) {
  const touch = e.touches[0]
  if (!touch) return
  startY = touch.clientY
  dragging.value = true
}
function onTouchMove(e: TouchEvent) {
  if (!dragging.value) return
  const touch = e.touches[0]
  if (!touch) return
  const dy = touch.clientY - startY
  if (dy > 0) dragY.value = dy
}
function onTouchEnd() {
  dragging.value = false
  if (dragY.value > 90) emit('close')
  dragY.value = 0
}

function onBackdrop(e: MouseEvent) {
  if ((e.target as HTMLElement).classList.contains('sheet-backdrop')) emit('close')
}

// No body scroll lock — overscroll-behavior: contain on .sheet-scroll is enough
// and body overflow:hidden breaks position:fixed BottomNav on iOS Safari
</script>

<template>
  <Teleport to="body">
    <div class="sheet-backdrop" @click="onBackdrop">
      <div
        ref="sheetRef"
        class="sheet"
        :style="{
          transform: `translateY(${dragY}px)`,
          transition: dragging ? 'none' : 'transform 0.38s cubic-bezier(0.16,1,0.3,1)'
        }"
        @touchstart="onTouchStart"
        @touchmove.passive="onTouchMove"
        @touchend="onTouchEnd"
      >
        <!-- Handle -->
        <div class="handle-row">
          <div class="handle" />
        </div>

        <div class="sheet-scroll">

          <!-- User card -->
          <div v-if="signinStore.isLoggedIn" class="user-card">
            <div class="user-card-bg" />
            <div class="user-left">
              <div class="user-avatar">{{ initials }}</div>
              <div class="user-text">
                <div class="user-name">{{ signinStore.user?.name }}</div>
                <div class="user-email">{{ signinStore.user?.email }}</div>
              </div>
            </div>
            <button class="logout-pill" @click="handleLogout">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                <polyline points="16 17 21 12 16 7"/>
                <line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
              {{ $t('auth.logout') }}
            </button>
          </div>

          <!-- Guest auth -->
          <div v-else class="guest-card">
            <div class="guest-text">
              <div class="guest-title">{{ $t('auth.signin.noAccount') }}</div>
              <div class="guest-sub">{{ $t('auth.signin.title') }}</div>
            </div>
            <div class="guest-btns">
              <NuxtLink to="/signin" class="btn-ghost" @click="emit('close')">{{ $t('auth.signin.login') }}</NuxtLink>
              <NuxtLink to="/signup" class="btn-gold" @click="emit('close')">{{ $t('auth.signup.register') }}</NuxtLink>
            </div>
          </div>

          <!-- Search -->
          <div class="search-wrap">
            <div :class="['search-box', { focused: searchFocused }]">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
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
              <button v-if="searchQuery" class="search-clear" @mousedown.prevent="searchQuery = ''; results = []; showDrop = false">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
              <button class="search-go" @click="handleSearch">{{ $t('header.searchButton') }}</button>
            </div>

            <Transition name="drop">
              <div v-if="showDrop" class="search-drop">
                <div v-if="searching" class="drop-spin">
                  <span/><span/><span/>
                  <p>{{ $t('header.searching') }}</p>
                </div>
                <template v-else>
                  <div v-if="results.length" class="drop-group">
                    <div class="drop-label">{{ $t('header.products') }}</div>
                    <div v-for="p in results" :key="p.id" class="drop-row" @mousedown.prevent="goProduct(p.id)">
                      <div class="p-thumb">
                        <img v-if="p.imageUrl" :src="p.imageUrl" />
                        <span v-else>{{ p.image }}</span>
                      </div>
                      <div class="p-text">
                        <span class="p-name">{{ locale === 'tk' ? p.nameTk : p.nameRu }}</span>
                        <span class="p-cat">{{ locale === 'tk' ? p.category.nameTk : p.category.nameRu }}</span>
                      </div>
                      <span class="p-price">${{ fmt(p.price) }}</span>
                    </div>
                  </div>
                  <div v-else-if="searchQuery.trim()" class="drop-empty">{{ $t('common.noResults') }}</div>
                  <div v-if="categories.length" class="drop-group">
                    <div class="drop-label">{{ $t('header.categories') }}</div>
                    <div class="drop-cats">
                      <button v-for="c in categories.slice(0,6)" :key="c.id" class="drop-cat" @mousedown.prevent="goCategory(c.id)">
                        {{ locale === 'tk' ? c.nameTk : c.nameRu }}
                      </button>
                    </div>
                  </div>
                  <div v-if="results.length" class="drop-all" @mousedown.prevent="handleSearch">
                    {{ $t('common.viewAll') }}
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                  </div>
                </template>
              </div>
            </Transition>
          </div>

          <!-- Nav tiles -->
          <div class="tiles-label">{{ locale === 'tk' ? 'Sahypalar' : 'Страницы' }}</div>
          <div class="tiles">
            <button class="tile tile--gold" @click="nav('/products')">
              <div class="tile-icon">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
                </svg>
              </div>
              <span class="tile-name">{{ $t('footer.products') }}</span>
            </button>

            <button class="tile" @click="nav('/track')">
              <div class="tile-icon">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0z"/><circle cx="12" cy="10" r="3"/>
                </svg>
              </div>
              <span class="tile-name">{{ $t('track.title') }}</span>
            </button>

            <button class="tile" @click="nav('/request')">
              <div class="tile-icon">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                </svg>
              </div>
              <span class="tile-name">{{ $t('request.title') }}</span>
            </button>

            <button class="tile" @click="nav('/wishlist')">
              <div class="tile-icon">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                </svg>
              </div>
              <span class="tile-name">{{ $t('auth.wishlist') }}</span>
            </button>

            <button class="tile" @click="nav('/orders')">
              <div class="tile-icon">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M20 7H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z"/>
                  <path d="M16 3H8a2 2 0 0 0-2 2v2h12V5a2 2 0 0 0-2-2z"/>
                </svg>
              </div>
              <span class="tile-name">{{ $t('auth.orders') }}</span>
            </button>

            <button class="tile" @click="nav('/cart')">
              <div class="tile-icon" style="position:relative">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
                  <line x1="3" y1="6" x2="21" y2="6"/>
                  <path d="M16 10a4 4 0 0 1-8 0"/>
                </svg>
                <span v-if="cartStore.totalItems > 0" class="tile-badge">{{ cartStore.totalItems }}</span>
              </div>
              <span class="tile-name">{{ $t('footer.cart') }}</span>
            </button>
          </div>

          <!-- Language row -->
          <div class="lang-strip">
            <div class="lang-left">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <line x1="2" y1="12" x2="22" y2="12"/>
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
              </svg>
              <span>{{ locale === 'tk' ? 'Dil saýlaň' : 'Выберите язык' }}</span>
            </div>
            <div class="lang-pills">
              <button
                v-for="lang in langs" :key="lang.code"
                :class="['lang-pill', { active: locale === lang.code }]"
                @click="changeLang(lang.code)"
              >{{ lang.flag }} {{ lang.label }}</button>
            </div>
          </div>

        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.sheet-backdrop {
  position: fixed; inset: 0;
  z-index: 500;
  background: rgba(0,0,0,0.65);
  display: flex; align-items: flex-end;
  animation: fade-in 0.22s ease;
}
@keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }

.sheet {
  width: 100%;
  background: #111520;
  border-radius: 28px 28px 0 0;
  max-height: 88dvh;
  display: flex; flex-direction: column;
  animation: slide-up 0.38s cubic-bezier(0.16,1,0.3,1);
  will-change: transform;
  /* leave room for BottomNav above */
  padding-bottom: calc(64px + env(safe-area-inset-bottom, 0px));
}
@keyframes slide-up { from { transform: translateY(100%); } to { transform: translateY(0); } }

/* Handle */
.handle-row {
  display: flex; justify-content: center;
  padding: 14px 0 6px; flex-shrink: 0; cursor: grab;
}
.handle {
  width: 40px; height: 4px; border-radius: 99px;
  background: rgba(255,255,255,.12);
}

/* Scrollable body */
.sheet-scroll {
  overflow-y: auto; overflow-x: hidden;
  overscroll-behavior: contain;
  flex: 1; padding: 4px 0 8px;
}

/* ── User card ── */
.user-card {
  margin: 4px 16px 14px;
  border-radius: 18px;
  background: linear-gradient(135deg, #1a1500, #241c00);
  border: 1px solid rgba(232,160,32,.25);
  padding: 16px;
  display: flex; align-items: center; justify-content: space-between; gap: 12px;
  position: relative; overflow: hidden;
}
.user-card-bg {
  position: absolute; top: -30px; right: -30px;
  width: 100px; height: 100px; border-radius: 50%;
  background: radial-gradient(circle, rgba(232,160,32,.18) 0%, transparent 70%);
  pointer-events: none;
}
.user-left { display: flex; align-items: center; gap: 12px; min-width: 0; }
.user-avatar {
  width: 44px; height: 44px; border-radius: 50%; flex-shrink: 0;
  background: linear-gradient(135deg, #E8A020, #FF8C00);
  color: white; font-size: 15px; font-weight: 800;
  display: flex; align-items: center; justify-content: center;
  border: 2px solid rgba(232,160,32,.4);
  box-shadow: 0 0 0 4px rgba(232,160,32,.08);
}
.user-text { min-width: 0; }
.user-name  { font-size: 14px; font-weight: 700; color: #fff; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; font-family: 'Plus Jakarta Sans', sans-serif; }
.user-email { font-size: 11px; color: rgba(255,255,255,.4); margin-top: 2px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; font-family: 'Plus Jakarta Sans', sans-serif; }
.logout-pill {
  display: flex; align-items: center; gap: 5px; flex-shrink: 0;
  padding: 7px 12px; border-radius: 50px;
  background: rgba(239,68,68,.1); border: 1px solid rgba(239,68,68,.25);
  color: #F87171; font-size: 12px; font-weight: 700;
  cursor: pointer; transition: all 0.2s;
  font-family: 'Plus Jakarta Sans', sans-serif;
}
.logout-pill:active { background: rgba(239,68,68,.25); }

/* ── Guest card ── */
.guest-card {
  margin: 4px 16px 14px;
  border-radius: 18px;
  background: rgba(255,255,255,.04);
  border: 1px solid rgba(255,255,255,.08);
  padding: 16px;
  display: flex; align-items: center; justify-content: space-between; gap: 12px;
}
.guest-title { font-size: 13px; font-weight: 700; color: white; font-family: 'Plus Jakarta Sans', sans-serif; }
.guest-sub   { font-size: 11px; color: rgba(255,255,255,.35); margin-top: 2px; font-family: 'Plus Jakarta Sans', sans-serif; }
.guest-btns  { display: flex; gap: 8px; flex-shrink: 0; }
.btn-ghost {
  padding: 8px 14px; border-radius: 10px;
  border: 1px solid rgba(255,255,255,.15); background: transparent;
  color: rgba(255,255,255,.7); font-size: 12px; font-weight: 700;
  text-decoration: none; font-family: 'Plus Jakarta Sans', sans-serif;
  display: flex; align-items: center;
}
.btn-gold {
  padding: 8px 14px; border-radius: 10px; border: none;
  background: linear-gradient(135deg, #E8A020, #FF8C00);
  color: white; font-size: 12px; font-weight: 700;
  text-decoration: none; font-family: 'Plus Jakarta Sans', sans-serif;
  display: flex; align-items: center;
}

/* ── Search ── */
.search-wrap {
  margin: 0 16px 16px;
  position: relative;
}
.search-box {
  display: flex; align-items: center;
  background: rgba(255,255,255,.07);
  border: 1.5px solid rgba(255,255,255,.1);
  border-radius: 14px; padding: 0 4px 0 14px; gap: 10px;
  transition: border-color 0.2s, background 0.2s;
}
.search-box.focused {
  border-color: #E8A020;
  background: rgba(232,160,32,.05);
}
.search-box svg { color: rgba(255,255,255,.3); flex-shrink: 0; transition: color 0.2s; }
.search-box.focused svg { color: #E8A020; }
.search-input {
  flex: 1; border: none; background: transparent; outline: none;
  font-size: 14px; color: white; padding: 13px 0;
  font-family: 'Plus Jakarta Sans', sans-serif; min-width: 0;
}
.search-input::placeholder { color: rgba(255,255,255,.22); }
.search-clear {
  background: none; border: none; color: rgba(255,255,255,.35);
  cursor: pointer; padding: 4px; display: flex; align-items: center;
  border-radius: 50%; flex-shrink: 0;
}
.search-go {
  background: linear-gradient(135deg,#E8A020,#FF8C00);
  color: white; border: none; padding: 8px 16px;
  border-radius: 10px; font-size: 13px; font-weight: 700;
  cursor: pointer; white-space: nowrap; flex-shrink: 0;
  font-family: 'Plus Jakarta Sans', sans-serif;
}

.search-drop {
  position: absolute; top: calc(100% - 12px); left: 0; right: 0;
  background: #1a1d2e; border: 1.5px solid rgba(232,160,32,.25);
  border-top: none; border-radius: 0 0 16px 16px;
  z-index: 10; overflow: hidden; max-height: 280px; overflow-y: auto;
}
.drop-spin { display: flex; align-items: center; gap: 8px; padding: 14px 16px; color: rgba(255,255,255,.3); font-size: 12px; font-family: 'Plus Jakarta Sans', sans-serif; }
.drop-spin span { width: 5px; height: 5px; border-radius: 50%; background: #E8A020; animation: bounce .6s ease-in-out infinite; }
.drop-spin span:nth-child(2) { animation-delay: .1s; }
.drop-spin span:nth-child(3) { animation-delay: .2s; }
@keyframes bounce { 0%,80%,100% { transform: scale(0); } 40% { transform: scale(1); } }
.drop-group  { padding: 8px 0 2px; }
.drop-label  { padding: 2px 14px 6px; font-size: 10px; font-weight: 700; color: rgba(255,255,255,.25); text-transform: uppercase; letter-spacing: .08em; font-family: 'Plus Jakarta Sans', sans-serif; }
.drop-row    { display: flex; align-items: center; gap: 10px; padding: 8px 14px; cursor: pointer; }
.drop-row:active { background: rgba(232,160,32,.07); }
.p-thumb     { width: 32px; height: 32px; border-radius: 7px; background: rgba(255,255,255,.06); display: flex; align-items: center; justify-content: center; flex-shrink: 0; overflow: hidden; }
.p-thumb img { width: 100%; height: 100%; object-fit: cover; }
.p-thumb span { font-size: 16px; }
.p-text      { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 1px; }
.p-name      { font-size: 13px; font-weight: 600; color: white; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; font-family: 'Plus Jakarta Sans', sans-serif; }
.p-cat       { font-size: 10px; color: rgba(255,255,255,.3); font-family: 'Plus Jakarta Sans', sans-serif; }
.p-price     { font-size: 13px; font-weight: 700; color: #E8A020; flex-shrink: 0; font-family: 'Plus Jakarta Sans', sans-serif; }
.drop-empty  { padding: 14px 16px; font-size: 13px; color: rgba(255,255,255,.3); font-family: 'Plus Jakarta Sans', sans-serif; }
.drop-cats   { display: flex; flex-wrap: wrap; gap: 6px; padding: 0 14px 10px; }
.drop-cat    { padding: 5px 12px; border-radius: 50px; border: 1px solid rgba(255,255,255,.1); background: rgba(255,255,255,.04); font-size: 12px; font-weight: 600; color: rgba(255,255,255,.55); cursor: pointer; font-family: 'Plus Jakarta Sans', sans-serif; }
.drop-cat:active { border-color: #E8A020; color: #E8A020; }
.drop-all    { display: flex; align-items: center; gap: 6px; padding: 10px 14px; border-top: 1px solid rgba(255,255,255,.06); font-size: 13px; font-weight: 700; color: #E8A020; cursor: pointer; font-family: 'Plus Jakarta Sans', sans-serif; }
.drop-enter-active, .drop-leave-active { transition: opacity .15s, transform .15s; }
.drop-enter-from, .drop-leave-to { opacity: 0; transform: translateY(-4px); }

/* ── Tiles ── */
.tiles-label {
  padding: 0 20px 10px;
  font-size: 11px; font-weight: 700;
  color: rgba(255,255,255,.25);
  text-transform: uppercase; letter-spacing: .1em;
  font-family: 'Plus Jakarta Sans', sans-serif;
}
.tiles {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  padding: 0 16px 16px;
}
.tile {
  display: flex; flex-direction: column; align-items: center; gap: 9px;
  padding: 18px 8px 14px;
  background: rgba(255,255,255,.04);
  border: 1px solid rgba(255,255,255,.07);
  border-radius: 18px; cursor: pointer;
  transition: background 0.15s, border-color 0.15s, transform 0.15s;
  color: rgba(255,255,255,.55);
  font-family: 'Plus Jakarta Sans', sans-serif;
  -webkit-tap-highlight-color: transparent;
  animation: tile-in 0.4s cubic-bezier(0.16,1,0.3,1) both;
}
.tile:nth-child(1) { animation-delay: .05s; }
.tile:nth-child(2) { animation-delay: .10s; }
.tile:nth-child(3) { animation-delay: .15s; }
.tile:nth-child(4) { animation-delay: .20s; }
.tile:nth-child(5) { animation-delay: .25s; }
.tile:nth-child(6) { animation-delay: .30s; }
@keyframes tile-in { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
.tile:active { background: rgba(232,160,32,.1); border-color: rgba(232,160,32,.3); transform: scale(0.96); }

.tile--gold {
  background: linear-gradient(135deg, rgba(232,160,32,.15), rgba(255,140,0,.08));
  border-color: rgba(232,160,32,.3);
  color: #E8A020;
}
.tile--gold .tile-icon svg { stroke: #E8A020; }

.tile-icon {
  width: 46px; height: 46px; border-radius: 14px;
  background: rgba(255,255,255,.06);
  display: flex; align-items: center; justify-content: center;
  position: relative;
}
.tile--gold .tile-icon { background: rgba(232,160,32,.15); }
.tile-icon svg { stroke: rgba(255,255,255,.45); transition: stroke 0.15s; }
.tile:active .tile-icon svg { stroke: #E8A020; }

.tile-name {
  font-size: 11px; font-weight: 700;
  text-align: center; line-height: 1.3;
}

.tile-badge {
  position: absolute; top: -5px; right: -5px;
  min-width: 16px; height: 16px; border-radius: 50px;
  background: #EF4444; color: white;
  font-size: 9px; font-weight: 800;
  display: flex; align-items: center; justify-content: center;
  padding: 0 3px; border: 1.5px solid #111520;
  font-family: 'Plus Jakarta Sans', sans-serif;
}

/* ── Language strip ── */
.lang-strip {
  display: flex; align-items: center; justify-content: space-between;
  margin: 0 16px;
  padding: 14px 16px;
  background: rgba(255,255,255,.03);
  border: 1px solid rgba(255,255,255,.07);
  border-radius: 14px;
}
.lang-left {
  display: flex; align-items: center; gap: 8px;
  font-size: 13px; font-weight: 600;
  color: rgba(255,255,255,.4);
  font-family: 'Plus Jakarta Sans', sans-serif;
}
.lang-left svg { stroke: rgba(255,255,255,.3); flex-shrink: 0; }
.lang-pills { display: flex; background: rgba(255,255,255,.06); border-radius: 50px; padding: 3px; gap: 2px; }
.lang-pill {
  background: transparent; border: none;
  color: rgba(255,255,255,.4); padding: 5px 14px;
  border-radius: 50px; font-size: 12px; font-weight: 600;
  cursor: pointer; transition: all 0.2s;
  font-family: 'Plus Jakarta Sans', sans-serif;
}
.lang-pill.active { background: #E8A020; color: #0F1117; }
</style>