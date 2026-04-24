<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from '#app'

const { locale } = useI18n()
const router     = useRouter()

const emit = defineEmits<{
  (e: 'close'): void
}>()

const cartStore = useCartStore()

const navItems = [
  {
    key: 'home',
    to: '/',
    exact: true,
    labelTk: 'Baş sahypa',
    labelRu: 'Главная',
    color: { bg: '#E6F1FB', stroke: '#185FA5' },
    icon: `<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>`,
  },
  {
    key: 'products',
    to: '/products',
    labelTk: 'Harytlar',
    labelRu: 'Товары',
    color: { bg: '#FAC775', stroke: '#633806' },
    icon: `<path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>`,
  },
  {
    key: 'track',
    to: '/track',
    labelTk: 'Yzarlama',
    labelRu: 'Отследить',
    color: { bg: '#E1F5EE', stroke: '#0F6E56' },
    icon: `<path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0z"/><circle cx="12" cy="10" r="3"/>`,
  },
  {
    key: 'request',
    to: '/request',
    labelTk: 'Haýyş',
    labelRu: 'Заявка',
    color: { bg: '#E6F1FB', stroke: '#185FA5' },
    icon: `<path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>`,
  },
  {
    key: 'wishlist',
    to: '/wishlist',
    labelTk: 'Isleg sanawy',
    labelRu: 'Избранное',
    color: { bg: '#FCEBEB', stroke: '#A32D2D' },
    icon: `<path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>`,
  },
  {
    key: 'orders',
    to: '/orders',
    labelTk: 'Sargytlar',
    labelRu: 'Заказы',
    color: { bg: '#EAF3DE', stroke: '#3B6D11' },
    icon: `<path d="M20 7H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z"/><path d="M16 3H8a2 2 0 0 0-2 2v2h12V5a2 2 0 0 0-2-2z"/>`,
  },
  {
    key: 'cart',
    to: '/cart',
    labelTk: 'Sebet',
    labelRu: 'Корзина',
    color: { bg: '#E6F1FB', stroke: '#185FA5' },
    icon: `<path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/>`,
  },
]

function go(to: string) {
  router.push(to)
  emit('close')
}

// ── Swipe to close ──
const sheetRef = ref<HTMLDivElement | null>(null)
const dragY    = ref(0)
const dragging = ref(false)
let startY = 0

function onTouchStart(e: TouchEvent) {
  const touch = e.touches[0]; if (!touch) return
  startY = touch.clientY; dragging.value = true
}
function onTouchMove(e: TouchEvent) {
  if (!dragging.value) return
  const touch = e.touches[0]; if (!touch) return
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
          <p class="section-label">{{ locale === 'tk' ? 'Sahypalar' : 'Навигация' }}</p>

          <div class="nav-list">
            <button
              v-for="(item, idx) in navItems"
              :key="item.key"
              class="nav-row"
              :class="{ 'nav-row--last': idx === navItems.length - 1 }"
              @click="go(item.to)"
            >
              <div
                class="nav-icon"
                :style="{ background: item.color.bg }"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                  :stroke="item.color.stroke"
                  stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                  v-html="item.icon"
                />
                <!-- Cart badge -->
                <span
                  v-if="item.key === 'cart' && cartStore.totalItems > 0"
                  class="nav-badge"
                >{{ cartStore.totalItems > 99 ? '99+' : cartStore.totalItems }}</span>
              </div>

              <span class="nav-label">{{ locale === 'tk' ? item.labelTk : item.labelRu }}</span>

              <svg class="nav-chevron" width="14" height="14" viewBox="0 0 24 24"
                fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
                <polyline points="9 18 15 12 9 6"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.sheet-backdrop {
  position: fixed; inset: 0; z-index: 500;
  background: rgba(0,0,0,0.55);
  display: flex; align-items: flex-end;
  animation: fade-in 0.22s ease;
}
@keyframes fade-in { from { opacity: 0 } to { opacity: 1 } }

.sheet {
  width: 100%;
  background: #111520;
  border-radius: 24px 24px 0 0;
  max-height: 80dvh;
  display: flex; flex-direction: column;
  animation: slide-up 0.38s cubic-bezier(0.16,1,0.3,1);
  will-change: transform;
  padding-bottom: calc(64px + env(safe-area-inset-bottom, 0px));
}
@keyframes slide-up { from { transform: translateY(100%) } to { transform: translateY(0) } }

.handle-row {
  display: flex; justify-content: center;
  padding: 14px 0 8px; flex-shrink: 0; cursor: grab;
}
.handle {
  width: 36px; height: 4px; border-radius: 99px;
  background: rgba(255,255,255,.12);
}

.sheet-scroll {
  overflow-y: auto; overflow-x: hidden;
  overscroll-behavior: contain;
  flex: 1;
  padding: 4px 16px 16px;
}

.section-label {
  font-size: 10px; font-weight: 700;
  color: rgba(255,255,255,.25);
  text-transform: uppercase; letter-spacing: .12em;
  font-family: 'Plus Jakarta Sans', sans-serif;
  margin: 0 0 10px 4px;
}

.nav-list {
  background: rgba(255,255,255,.04);
  border: 1px solid rgba(255,255,255,.07);
  border-radius: 18px;
  overflow: hidden;
}

.nav-row {
  display: flex; align-items: center; gap: 14px;
  width: 100%; padding: 14px 16px;
  background: none; border: none;
  border-bottom: 1px solid rgba(255,255,255,.05);
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
  transition: background 0.15s;
}
.nav-row--last { border-bottom: none; }
.nav-row:active { background: rgba(255,255,255,.06); }

.nav-icon {
  width: 38px; height: 38px; border-radius: 10px;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0; position: relative;
}

.nav-badge {
  position: absolute; top: -5px; right: -5px;
  min-width: 16px; height: 16px; border-radius: 99px;
  background: #EF4444; color: white;
  font-size: 9px; font-weight: 700;
  display: flex; align-items: center; justify-content: center;
  padding: 0 3px; border: 1.5px solid #111520;
  font-family: 'Plus Jakarta Sans', sans-serif;
}

.nav-label {
  flex: 1; text-align: left;
  font-size: 14px; font-weight: 600;
  color: rgba(255,255,255,.8);
  font-family: 'Plus Jakarta Sans', sans-serif;
}

.nav-chevron {
  color: rgba(255,255,255,.2);
  flex-shrink: 0;
}
</style>