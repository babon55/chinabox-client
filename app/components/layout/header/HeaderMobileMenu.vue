<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from '#app'

const { t } = useI18n()

const emit = defineEmits<{ (e: 'close'): void }>()

const signinStore = useSigninStore()
const cartStore   = useCartStore()

const searchQuery = ref('')
const router      = useRouter()

function handleSearch() {
  if (!searchQuery.value.trim()) return
  router.push(`/products?search=${encodeURIComponent(searchQuery.value)}`)
  emit('close')
}

function handleLogout() {
  signinStore.logout()
  emit('close')
}

const initials = computed(() => {
  if (!signinStore.user?.name) return '?'
  return signinStore.user.name.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase()
})
</script>

<template>
  <div class="mobile-menu">

    <!-- Search -->
    <div class="search-wrap">
      <svg class="search-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
      </svg>
      <input
        v-model="searchQuery"
        class="search-input"
        :placeholder="$t('header.searchPlaceholder')"
        @keydown.enter="handleSearch"
      />
      <button v-if="searchQuery" class="search-go" @click="handleSearch">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
        </svg>
      </button>
    </div>

    <!-- User banner -->
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
      <NuxtLink to="/request"  class="nav-link" @click="emit('close')"><span class="link-icon">📝</span><span>{{ $t('request.title') }}</span></NuxtLink>
      <NuxtLink to="/orders"   class="nav-link" @click="emit('close')"><span class="link-icon">📦</span><span>{{ $t('auth.orders') }}</span></NuxtLink>
      <NuxtLink to="/cart"     class="nav-link cart-link" @click="emit('close')">
        <span class="link-icon">🛒</span>
        <span>{{ $t('footer.cart') }}</span>
        <span v-if="cartStore.totalItems > 0" class="cart-count">{{ cartStore.totalItems }}</span>
      </NuxtLink>
    </div>

    <!-- Auth section -->
    <div class="auth-section">
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

/* Search */
.search-wrap {
  display: flex;
  align-items: center;
  gap: 10px;
  background: #F9FAFB;
  border-bottom: 1px solid #E5E7EB;
  padding: 10px 16px;
}
.search-icon { color: #9CA3AF; flex-shrink: 0; }
.search-input {
  flex: 1;
  border: none;
  background: transparent;
  outline: none;
  font-size: 14px;
  font-family: 'Plus Jakarta Sans', sans-serif;
  color: #0F1117;
  padding: 4px 0;
}
.search-input::placeholder { color: #9CA3AF; }
.search-go {
  width: 30px; height: 30px;
  border-radius: 8px; border: none;
  background: #E8A020; color: white;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; flex-shrink: 0;
  transition: background 0.2s;
}
.search-go:hover { background: #FF8C00; }

/* User banner */
.user-banner {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 20px;
  background: linear-gradient(135deg, #0F1117, #1a1d2e);
  border-bottom: 1px solid rgba(255,255,255,.06);
}
.user-avatar {
  width: 40px; height: 40px; border-radius: 50%;
  background: linear-gradient(135deg, #E8A020, #FF8C00);
  color: white; font-size: 13px; font-weight: 800;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
.user-name  { font-size: 14px; font-weight: 700; color: white; }
.user-email { font-size: 11px; color: rgba(255,255,255,.4); margin-top: 2px; }

/* Nav links */
.nav-section {
  display: flex;
  flex-direction: column;
  padding: 8px 10px;
  gap: 2px;
}
.nav-link {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 12px;
  border-radius: 10px;
  color: #374151;
  text-decoration: none;
  font-size: 14px;
  font-weight: 600;
  font-family: 'Plus Jakarta Sans', sans-serif;
  transition: background 0.15s, color 0.15s;
}
.nav-link:hover { background: #F9FAFB; color: #E8A020; }
.nav-link.router-link-active { background: #FFF8EE; color: #E8A020; }

.link-icon { font-size: 18px; width: 24px; text-align: center; flex-shrink: 0; }
.cart-link { position: relative; }
.cart-count {
  margin-left: auto;
  background: #EF4444; color: white;
  font-size: 11px; font-weight: 700;
  padding: 2px 8px; border-radius: 50px;
}

/* Auth section */
.auth-section {
  display: flex;
  gap: 10px;
  padding: 12px 14px;
  border-top: 1px solid #E5E7EB;
  flex-wrap: wrap;
  margin-top: auto;
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
.btn-signin:hover { border-color: #E8A020; color: #E8A020; }

.btn-signup {
  flex: 1; min-width: 120px;
  display: inline-flex; align-items: center; justify-content: center;
  height: 44px; border-radius: 10px; border: none;
  background: linear-gradient(135deg, #0F1117, #2A2D3A);
  color: white; font-size: 13px; font-weight: 700;
  text-decoration: none; font-family: 'Plus Jakarta Sans', sans-serif;
  transition: all 0.2s;
}
.btn-signup:hover { background: linear-gradient(135deg, #E8A020, #FF8C00); }

.btn-orders {
  flex: 1; min-width: 120px;
  display: inline-flex; align-items: center; justify-content: center;
  height: 44px; border-radius: 10px; border: none;
  background: linear-gradient(135deg, #E8A020, #FF8C00);
  color: white; font-size: 13px; font-weight: 700;
  text-decoration: none; font-family: 'Plus Jakarta Sans', sans-serif;
  transition: filter 0.2s;
}
.btn-orders:hover { filter: brightness(1.08); }

.btn-logout {
  flex: 1; min-width: 120px;
  display: inline-flex; align-items: center; justify-content: center; gap: 7px;
  height: 44px; border-radius: 10px;
  border: 2px solid #FECACA; background: #FEF2F2;
  color: #DC2626; font-size: 13px; font-weight: 700;
  cursor: pointer; font-family: 'Plus Jakarta Sans', sans-serif;
  transition: all 0.2s;
}
.btn-logout:hover { background: #DC2626; color: white; border-color: #DC2626; }
</style>