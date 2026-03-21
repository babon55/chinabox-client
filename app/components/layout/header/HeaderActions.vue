<script setup lang="ts">
type Lang = 'tk' | 'ru'

interface User { id: string; name: string; email: string; phone: string }

const props = defineProps<{
  currentLang: Lang
  isLoggedIn:  boolean
  cartCount:   number
  user?:       User | null
}>()

const emit = defineEmits<{ (e: 'logout'): void }>()

const dropdownOpen = ref(false)
const dropdownRef  = ref<HTMLDivElement | null>(null)

// Close dropdown on outside click
function onClickOutside(e: MouseEvent) {
  if (dropdownRef.value && !dropdownRef.value.contains(e.target as Node)) {
    dropdownOpen.value = false
  }
}
onMounted(()  => document.addEventListener('click', onClickOutside))
onUnmounted(() => document.removeEventListener('click', onClickOutside))

// Avatar initials
const initials = computed(() => {
  if (!props.user?.name) return '?'
  return props.user.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
})

function handleLogout() {
  dropdownOpen.value = false
  emit('logout')
}
</script>

<template>
  <div class="header-actions">

    <!-- ── Guest ── -->
    <template v-if="!isLoggedIn">
      <NuxtLink to="/signin" class="btn-signin">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
          <polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/>
        </svg>
        {{ currentLang === 'tk' ? 'Giriş' : 'Войти' }}
      </NuxtLink>
      <NuxtLink to="/signup" class="btn-signup">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
          <line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/>
        </svg>
        {{ currentLang === 'tk' ? 'Hasap Aç' : 'Регистрация' }}
      </NuxtLink>
    </template>

    <!-- ── Logged in: user dropdown ── -->
    <template v-else>
      <div class="user-wrap" ref="dropdownRef">
        <button class="user-btn" @click.stop="dropdownOpen = !dropdownOpen">
          <div class="user-avatar">{{ initials }}</div>
          <div class="user-info">
            <span class="user-name">{{ user?.name ?? '...' }}</span>
            <span class="user-role">{{ currentLang === 'tk' ? 'Müşderi' : 'Покупатель' }}</span>
          </div>
          <svg class="chevron" :class="{ open: dropdownOpen }" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <polyline points="6 9 12 15 18 9"/>
          </svg>
        </button>

        <!-- Dropdown -->
        <Transition name="drop">
          <div v-if="dropdownOpen" class="dropdown">

            <!-- User info header -->
            <div class="dd-header">
              <div class="dd-avatar">{{ initials }}</div>
              <div>
                <div class="dd-name">{{ user?.name }}</div>
                <div class="dd-email">{{ user?.email }}</div>
              </div>
            </div>

            <div class="dd-divider" />

            <!-- Menu items -->
            <NuxtLink to="/orders" class="dd-item" @click="dropdownOpen = false">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M20 7H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z"/>
                <path d="M16 3H8a2 2 0 0 0-2 2v2h12V5a2 2 0 0 0-2-2z"/>
              </svg>
              {{ currentLang === 'tk' ? 'Sargytlarym' : 'Мои заказы' }}
            </NuxtLink>

            <NuxtLink to="/cart" class="dd-item" @click="dropdownOpen = false">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
                <line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/>
              </svg>
              {{ currentLang === 'tk' ? 'Sebedim' : 'Корзина' }}
              <span v-if="cartCount > 0" class="dd-badge">{{ cartCount }}</span>
            </NuxtLink>

            <NuxtLink to="/products" class="dd-item" @click="dropdownOpen = false">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              {{ currentLang === 'tk' ? 'Harytlar' : 'Товары' }}
            </NuxtLink>

            <div class="dd-divider" />

            <button class="dd-item logout" @click="handleLogout">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                <polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
              {{ currentLang === 'tk' ? 'Çykyş' : 'Выйти' }}
            </button>

          </div>
        </Transition>
      </div>
    </template>

    <!-- ── Cart button ── -->
    <NuxtLink to="/cart" class="cart-btn">
      <div class="cart-icon-wrap">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
          <line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/>
        </svg>
        <span v-if="cartCount > 0" class="cart-badge">{{ cartCount > 99 ? '99+' : cartCount }}</span>
      </div>
      <span class="cart-label">{{ currentLang === 'tk' ? 'Sebet' : 'Корзина' }}</span>
    </NuxtLink>

  </div>
</template>

<style scoped>
.header-actions { display: flex; align-items: center; gap: 10px; flex-shrink: 0; }

/* Guest buttons */
.btn-signin { display: inline-flex; align-items: center; gap: 7px; padding: 9px 18px; border-radius: 10px; border: 2px solid #E5E7EB; background: white; color: #0F1117; font-size: 13px; font-weight: 600; text-decoration: none; cursor: pointer; transition: all 0.2s; white-space: nowrap; font-family: 'Plus Jakarta Sans', sans-serif; }
.btn-signin:hover { border-color: #E8A020; color: #E8A020; background: rgba(232,160,32,0.04); }
.btn-signup { display: inline-flex; align-items: center; gap: 7px; padding: 9px 18px; border-radius: 10px; border: none; background: linear-gradient(135deg, #0F1117, #2A2D3A); color: white; font-size: 13px; font-weight: 600; text-decoration: none; cursor: pointer; transition: all 0.2s; white-space: nowrap; font-family: 'Plus Jakarta Sans', sans-serif; }
.btn-signup:hover { background: linear-gradient(135deg, #E8A020, #FF8C00); transform: translateY(-1px); box-shadow: 0 4px 14px rgba(232,160,32,0.35); }

/* User button */
.user-wrap { position: relative; }
.user-btn { display: flex; align-items: center; gap: 8px; padding: 6px 12px 6px 6px; border-radius: 50px; border: 1.5px solid #E5E7EB; background: white; cursor: pointer; transition: all .2s; font-family: 'Plus Jakarta Sans', sans-serif; }
.user-btn:hover { border-color: #E8A020; box-shadow: 0 2px 12px rgba(232,160,32,.15); }
.user-avatar { width: 32px; height: 32px; border-radius: 50%; background: linear-gradient(135deg, #E8A020, #FF8C00); color: white; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 800; flex-shrink: 0; }
.user-info { display: flex; flex-direction: column; gap: 0; text-align: left; }
.user-name { font-size: 13px; font-weight: 700; color: #0F1117; line-height: 1.2; max-width: 100px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.user-role { font-size: 10px; color: #9CA3AF; line-height: 1.2; }
.chevron { color: #9CA3AF; transition: transform .2s; flex-shrink: 0; }
.chevron.open { transform: rotate(180deg); }

/* Dropdown */
.dropdown { position: absolute; top: calc(100% + 10px); right: 0; min-width: 220px; background: white; border-radius: 16px; border: 1.5px solid #F3F4F6; box-shadow: 0 16px 48px rgba(0,0,0,.15); z-index: 300; overflow: hidden; }
.dd-header { display: flex; align-items: center; gap: 12px; padding: 16px; background: linear-gradient(135deg, #0F1117, #1a1d2e); }
.dd-avatar { width: 40px; height: 40px; border-radius: 50%; background: linear-gradient(135deg, #E8A020, #FF8C00); color: white; display: flex; align-items: center; justify-content: center; font-size: 14px; font-weight: 800; flex-shrink: 0; }
.dd-name  { font-size: 14px; font-weight: 700; color: white; }
.dd-email { font-size: 11px; color: rgba(255,255,255,.5); margin-top: 2px; }
.dd-divider { height: 1px; background: #F3F4F6; }
.dd-item { display: flex; align-items: center; gap: 10px; padding: 11px 16px; font-size: 13px; font-weight: 600; color: #374151; text-decoration: none; background: none; border: none; width: 100%; text-align: left; cursor: pointer; transition: background .12s; font-family: 'Plus Jakarta Sans', sans-serif; }
.dd-item:hover { background: #F9FAFB; color: #0F1117; }
.dd-item svg { flex-shrink: 0; color: #9CA3AF; }
.dd-item:hover svg { color: #E8A020; }
.dd-badge { margin-left: auto; background: #EF4444; color: white; font-size: 10px; font-weight: 700; padding: 1px 6px; border-radius: 50px; }
.dd-item.logout { color: #EF4444; }
.dd-item.logout svg { color: #EF4444; }
.dd-item.logout:hover { background: #FEF2F2; }

/* Cart */
.cart-btn { display: flex; align-items: center; gap: 8px; padding: 8px 16px; border-radius: 10px; background: #0F1117; color: white; text-decoration: none; transition: all 0.2s; position: relative; }
.cart-btn:hover { background: linear-gradient(135deg, #E8A020, #FF8C00); transform: translateY(-1px); box-shadow: 0 4px 14px rgba(232,160,32,0.35); }
.cart-icon-wrap { position: relative; display: flex; }
.cart-badge { position: absolute; top: -8px; right: -8px; background: #EF4444; color: white; font-size: 10px; font-weight: 700; width: 18px; height: 18px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 2px solid #0F1117; animation: pop .3s cubic-bezier(.175,.885,.32,1.275); }
.cart-btn:hover .cart-badge { border-color: #FF8C00; }
@keyframes pop { 0% { transform: scale(0); } 100% { transform: scale(1); } }
.cart-label { font-size: 13px; font-weight: 600; }

/* Dropdown animation */
.drop-enter-active, .drop-leave-active { transition: opacity .15s, transform .15s; }
.drop-enter-from, .drop-leave-to { opacity: 0; transform: translateY(-6px) scale(.97); }

@media (max-width: 1024px) { .cart-label { display: none; } .user-info { display: none; } .chevron { display: none; } .user-btn { padding: 4px; border-radius: 50%; } }
@media (max-width: 768px)  { .btn-signin, .btn-signup { display: none; } }
</style>