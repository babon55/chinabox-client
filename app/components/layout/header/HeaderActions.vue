<script setup lang="ts">
type Lang = 'tk' | 'ru'

defineProps<{
  currentLang: Lang
  isLoggedIn: boolean
  cartCount: number
}>()
</script>

<template>
  <div class="header-actions">

    <!-- Guest: Sign In + Sign Up -->
    <template v-if="!isLoggedIn">
      <NuxtLink to="/signin" class="btn-signin">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
          <polyline points="10 17 15 12 10 7"/>
          <line x1="15" y1="12" x2="3" y2="12"/>
        </svg>
        {{ currentLang === 'tk' ? 'Giriş' : 'Войти' }}
      </NuxtLink>

      <NuxtLink to="/signup" class="btn-signup">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
          <circle cx="9" cy="7" r="4"/>
          <line x1="19" y1="8" x2="19" y2="14"/>
          <line x1="22" y1="11" x2="16" y2="11"/>
        </svg>
        {{ currentLang === 'tk' ? 'Hasap Aç' : 'Регистрация' }}
      </NuxtLink>
    </template>

    <!-- Logged in: User avatar -->
    <template v-else>
      <button class="user-avatar" title="Profile">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
          <circle cx="12" cy="7" r="4"/>
        </svg>
      </button>
    </template>

    <!-- Cart -->
    <NuxtLink to="/cart" class="cart-btn">
      <div class="cart-icon-wrap">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
          <line x1="3" y1="6" x2="21" y2="6"/>
          <path d="M16 10a4 4 0 0 1-8 0"/>
        </svg>
        <span v-if="cartCount > 0" class="cart-badge">{{ cartCount }}</span>
      </div>
      <span class="cart-label">
        {{ currentLang === 'tk' ? 'Sebet' : 'Корзина' }}
      </span>
    </NuxtLink>

  </div>
</template>

<style scoped>
.header-actions {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
}

.btn-signin {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 9px 18px;
  border-radius: 10px;
  border: 2px solid #E5E7EB;
  background: white;
  color: #0F1117;
  font-size: 13px;
  font-weight: 600;
  text-decoration: none;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
  font-family: 'Plus Jakarta Sans', sans-serif;
}
.btn-signin:hover {
  border-color: #E8A020;
  color: #E8A020;
  background: rgba(232,160,32,0.04);
}

.btn-signup {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 9px 18px;
  border-radius: 10px;
  border: none;
  background: linear-gradient(135deg, #0F1117, #2A2D3A);
  color: white;
  font-size: 13px;
  font-weight: 600;
  text-decoration: none;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
  font-family: 'Plus Jakarta Sans', sans-serif;
}
.btn-signup:hover {
  background: linear-gradient(135deg, #E8A020, #FF8C00);
  transform: translateY(-1px);
  box-shadow: 0 4px 14px rgba(232,160,32,0.35);
}

.user-avatar {
  width: 38px; height: 38px;
  border-radius: 50%;
  background: linear-gradient(135deg, #E8A020, #FF8C00);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
}
.user-avatar:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 14px rgba(232,160,32,0.4);
}

.cart-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border-radius: 10px;
  background: #0F1117;
  color: white;
  text-decoration: none;
  transition: all 0.2s;
  position: relative;
}
.cart-btn:hover {
  background: linear-gradient(135deg, #E8A020, #FF8C00);
  transform: translateY(-1px);
  box-shadow: 0 4px 14px rgba(232,160,32,0.35);
}

.cart-icon-wrap { position: relative; display: flex; }

.cart-badge {
  position: absolute;
  top: -8px; right: -8px;
  background: #EF4444;
  color: white;
  font-size: 10px;
  font-weight: 700;
  width: 18px; height: 18px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid #0F1117;
  animation: pop 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}
.cart-btn:hover .cart-badge { border-color: #FF8C00; }

@keyframes pop {
  0%   { transform: scale(0); }
  100% { transform: scale(1); }
}

.cart-label { font-size: 13px; font-weight: 600; }

@media (max-width: 1024px) { .cart-label { display: none; } }
@media (max-width: 768px)  { .btn-signin, .btn-signup { display: none; } }
</style>