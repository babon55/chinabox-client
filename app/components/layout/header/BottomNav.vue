<script setup lang="ts">
import { useRoute } from '#app'

const cartStore = useCartStore()
const route     = useRoute()

const emit = defineEmits<{ 
  (e: 'open-menu'): void
  (e: 'close-menu'): void  // ← add this
}>()

function isActive(path: string, exact = false) {
  return exact ? route.path === path : route.path.startsWith(path)
}
</script>

<template>
  <Teleport to='body'>
    <nav class="bottom-nav">

    <NuxtLink to="/" @click="emit('close-menu')" :class="['nav-item', { active: isActive('/', true) }]">
      <div class="icon-wrap">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
          <polyline points="9 22 9 12 15 12 15 22"/>
        </svg>
      </div>
      <span class="nav-label">{{ $t('footer.home') }}</span>
      <div v-if="isActive('/', true)" class="active-dot" />
    </NuxtLink>

    <NuxtLink to="/products" @click="emit('close-menu')" :class="['nav-item', { active: isActive('/products') }]">
      <div class="icon-wrap">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
        </svg>
      </div>
      <span class="nav-label">{{ $t('footer.products') }}</span>
      <div v-if="isActive('/products')" class="active-dot" />
    </NuxtLink>

    <NuxtLink to="/cart" @click="emit('close-menu')" :class="['nav-item', { active: isActive('/cart') }]">
      <div class="icon-wrap cart-wrap">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
          <line x1="3" y1="6" x2="21" y2="6"/>
          <path d="M16 10a4 4 0 0 1-8 0"/>
        </svg>
        <Transition name="badge">
          <span v-if="cartStore.totalItems > 0" class="cart-badge">
            {{ cartStore.totalItems > 99 ? '99+' : cartStore.totalItems }}
          </span>
        </Transition>
      </div>
      <span class="nav-label">{{ $t('footer.cart') }}</span>
      <div v-if="isActive('/cart')" class="active-dot" />
    </NuxtLink>

    <NuxtLink to="/orders" @click="emit('close-menu')" :class="['nav-item', { active: isActive('/orders') }]">
      <div class="icon-wrap">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M20 7H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z"/>
          <path d="M16 3H8a2 2 0 0 0-2 2v2h12V5a2 2 0 0 0-2-2z"/>
        </svg>
      </div>
      <span class="nav-label">{{ $t('auth.orders') }}</span>
      <div v-if="isActive('/orders')" class="active-dot" />
    </NuxtLink>

    <button class="nav-item" @click="emit('open-menu')">
      <div class="icon-wrap">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="3" y1="6"  x2="21" y2="6"/>
          <line x1="3" y1="12" x2="21" y2="12"/>
          <line x1="3" y1="18" x2="21" y2="18"/>
        </svg>
      </div>
      <span class="nav-label">{{ $t('header.categories') }}</span>
    </button>

  </nav>
  </Teleport>
</template>

<style scoped>
.bottom-nav { display: none; }

@media (max-width: 768px) {
  .bottom-nav {
    display: flex; align-items: center;
    position: fixed; bottom: 0; left: 0; right: 0;
    z-index: 600;
    background: rgba(15, 17, 23, 0.98);
    border-top: 1px solid rgba(255, 255, 255, 0.08);
    padding: 8px 4px env(safe-area-inset-bottom, 10px);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
  }
}

.nav-item {
  flex: 1; display: flex; flex-direction: column; align-items: center; gap: 3px;
  padding: 2px 4px; text-decoration: none;
  background: none; border: none; cursor: pointer;
  color: rgba(255, 255, 255, 0.35); transition: color 0.2s;
  -webkit-tap-highlight-color: transparent;
}
.nav-item.active { color: #E8A020; }

.icon-wrap {
  position: relative; display: flex;
  align-items: center; justify-content: center;
  width: 28px; height: 28px;
}

.nav-label {
  font-size: 9px; font-weight: 600;
  font-family: 'Plus Jakarta Sans', sans-serif;
  white-space: nowrap;
}

.active-dot {
  width: 4px; height: 4px; border-radius: 50%;
  background: #E8A020; margin-top: 1px;
}

.cart-wrap { overflow: visible; }
.cart-badge {
  position: absolute; top: -5px; right: -6px;
  min-width: 15px; height: 15px; border-radius: 50px;
  background: #EF4444; color: white;
  font-size: 8px; font-weight: 800;
  display: flex; align-items: center; justify-content: center;
  padding: 0 3px; border: 1.5px solid #0F1117;
  font-family: 'Plus Jakarta Sans', sans-serif;
}

.badge-enter-active { animation: badge-pop 0.3s cubic-bezier(0.34,1.56,0.64,1); }
.badge-leave-active  { animation: badge-pop 0.2s ease reverse; }
@keyframes badge-pop { from { transform: scale(0); opacity: 0; } to { transform: scale(1); opacity: 1; } }
</style>