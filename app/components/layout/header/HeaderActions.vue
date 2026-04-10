<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

interface User { id: string; name: string; email: string; phone: string }

const props = defineProps<{
  isLoggedIn:  boolean
  cartCount:   number
  user?:       User | null
}>()
const emit = defineEmits<{ (e: 'logout'): void }>()

const dropdownOpen = ref(false)
const dropdownRef  = ref<HTMLDivElement | null>(null)

function onClickOutside(e: MouseEvent) {
  if (dropdownRef.value && !dropdownRef.value.contains(e.target as Node))
    dropdownOpen.value = false
}
onMounted(()  => document.addEventListener('click', onClickOutside))
onUnmounted(() => document.removeEventListener('click', onClickOutside))

const initials = computed(() => {
  if (!props.user?.name) return '?'
  return props.user.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
})

function handleLogout() { dropdownOpen.value = false; emit('logout') }
</script>

<template>
  <div class="header-actions">

    <!-- Guest — hidden on mobile (shown in mobile menu) -->
    <template v-if="!isLoggedIn">
      <NuxtLink to="/signin" class="btn-signin desktop-only">
        {{ $t('auth.signin.login') }}
      </NuxtLink>
      <NuxtLink to="/signup" class="btn-signup desktop-only">
        {{ $t('auth.signup.register') }}
      </NuxtLink>
    </template>

    <!-- Logged in: user dropdown -->
    <template v-else>
      <div class="user-wrap" ref="dropdownRef">
        <button class="user-btn" @click.stop="dropdownOpen = !dropdownOpen">
          <div class="user-avatar">{{ initials }}</div>
          <span class="user-name desktop-only">{{ user?.name?.split(' ')[0] }}</span>
          <svg class="chevron desktop-only" :class="{ open: dropdownOpen }" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <polyline points="6 9 12 15 18 9"/>
          </svg>
        </button>

        <Transition name="drop">
          <div v-if="dropdownOpen" class="dropdown">
            <div class="dd-header">
              <div class="dd-avatar">{{ initials }}</div>
              <div>
                <div class="dd-name">{{ user?.name }}</div>
                <div class="dd-email">{{ user?.email }}</div>
              </div>
            </div>
            <div class="dd-divider" />
            <NuxtLink to="/orders" class="dd-item" @click="dropdownOpen = false">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 7H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z"/><path d="M16 3H8a2 2 0 0 0-2 2v2h12V5a2 2 0 0 0-2-2z"/></svg>
              {{ $t('auth.orders') }}
            </NuxtLink>
            <NuxtLink to="/wishlist" class="dd-item" @click="dropdownOpen = false">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
              {{ $t('auth.wishlist') }}
            </NuxtLink>
            <NuxtLink to="/cart" class="dd-item" @click="dropdownOpen = false">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
              {{ $t('footer.cart') }}
              <span v-if="cartCount > 0" class="dd-badge">{{ cartCount }}</span>
            </NuxtLink>
            <div class="dd-divider" />
            <button class="dd-item logout" @click="handleLogout">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
              {{ $t('auth.logout') }}
            </button>
          </div>
        </Transition>
      </div>
    </template>

    <!-- Cart — always visible -->
    <NuxtLink to="/cart" class="cart-btn">
      <div class="cart-icon-wrap">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
          <line x1="3" y1="6" x2="21" y2="6"/>
          <path d="M16 10a4 4 0 0 1-8 0"/>
        </svg>
        <span v-if="cartCount > 0" class="cart-badge">{{ cartCount > 99 ? '99+' : cartCount }}</span>
      </div>
      <span class="cart-label desktop-only">{{ $t('footer.cart') }}</span>
    </NuxtLink>

  </div>
</template>

<style scoped>
.header-actions { display: flex; align-items: center; gap: 8px; flex-shrink: 0; }

/* desktop-only elements hidden on mobile */
@media (max-width: 768px) { .desktop-only { display: none !important; } }

.btn-signin { display: inline-flex; align-items: center; gap: 7px; padding: 8px 16px; border-radius: 10px; border: 2px solid #E5E7EB; background: white; color: #0F1117; font-size: 13px; font-weight: 600; text-decoration: none; transition: all 0.2s; white-space: nowrap; font-family: 'Plus Jakarta Sans', sans-serif; }
.btn-signin:hover { border-color: #E8A020; color: #E8A020; }
.btn-signup { display: inline-flex; align-items: center; gap: 7px; padding: 8px 16px; border-radius: 10px; border: none; background: linear-gradient(135deg, #0F1117, #2A2D3A); color: white; font-size: 13px; font-weight: 600; text-decoration: none; transition: all 0.2s; white-space: nowrap; font-family: 'Plus Jakarta Sans', sans-serif; }
.btn-signup:hover { background: linear-gradient(135deg, #E8A020, #FF8C00); transform: translateY(-1px); }

/* User button */
.user-wrap { position: relative; }
.user-btn { display: flex; align-items: center; gap: 8px; padding: 5px 10px 5px 5px; border-radius: 50px; border: 1.5px solid #E5E7EB; background: white; cursor: pointer; transition: all .2s; font-family: 'Plus Jakarta Sans', sans-serif; }
.user-btn:hover { border-color: #E8A020; }
.user-avatar { width: 30px; height: 30px; border-radius: 50%; background: linear-gradient(135deg, #E8A020, #FF8C00); color: white; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 800; flex-shrink: 0; }
.user-name { font-size: 13px; font-weight: 700; color: #0F1117; max-width: 80px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.chevron { color: #9CA3AF; transition: transform .2s; }
.chevron.open { transform: rotate(180deg); }

/* Dropdown */
.dropdown { position: absolute; top: calc(100% + 8px); right: 0; min-width: 210px; background: white; border-radius: 16px; border: 1.5px solid #F3F4F6; box-shadow: 0 16px 48px rgba(0,0,0,.15); z-index: 300; overflow: hidden; }
.dd-header { display: flex; align-items: center; gap: 10px; padding: 14px 16px; background: linear-gradient(135deg, #0F1117, #1a1d2e); }
.dd-avatar { width: 36px; height: 36px; border-radius: 50%; background: linear-gradient(135deg, #E8A020, #FF8C00); color: white; display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 800; flex-shrink: 0; }
.dd-name  { font-size: 13px; font-weight: 700; color: white; }
.dd-email { font-size: 11px; color: rgba(255,255,255,.45); margin-top: 1px; }
.dd-divider { height: 1px; background: #F3F4F6; }
.dd-item { display: flex; align-items: center; gap: 10px; padding: 10px 16px; font-size: 13px; font-weight: 600; color: #374151; text-decoration: none; background: none; border: none; width: 100%; text-align: left; cursor: pointer; transition: background .12s; font-family: 'Plus Jakarta Sans', sans-serif; }
.dd-item:hover { background: #F9FAFB; }
.dd-item svg { color: #9CA3AF; flex-shrink: 0; }
.dd-item:hover svg { color: #E8A020; }
.dd-badge { margin-left: auto; background: #EF4444; color: white; font-size: 10px; font-weight: 700; padding: 1px 6px; border-radius: 50px; }
.dd-item.logout { color: #EF4444; }
.dd-item.logout svg { color: #EF4444; }
.dd-item.logout:hover { background: #FEF2F2; }

/* Cart */
.cart-btn { display: flex; align-items: center; gap: 8px; padding: 8px 14px; border-radius: 10px; background: #0F1117; color: white; text-decoration: none; transition: all 0.2s; position: relative; }
.cart-btn:hover { background: linear-gradient(135deg, #E8A020, #FF8C00); transform: translateY(-1px); }
.cart-icon-wrap { position: relative; display: flex; }
.cart-badge { position: absolute; top: -8px; right: -8px; background: #EF4444; color: white; font-size: 10px; font-weight: 700; width: 18px; height: 18px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 2px solid #0F1117; }
.cart-btn:hover .cart-badge { border-color: #FF8C00; }
.cart-label { font-size: 13px; font-weight: 600; }

.drop-enter-active, .drop-leave-active { transition: opacity .15s, transform .15s; }
.drop-enter-from, .drop-leave-to { opacity: 0; transform: translateY(-6px) scale(.97); }
</style>