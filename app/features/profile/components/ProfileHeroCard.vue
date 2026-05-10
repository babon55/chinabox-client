<template>
  <div class="hero-card">
    <div class="hero-left">
      <div class="hero-avatar">{{ initials }}</div>
      <div class="hero-info">
        <div class="hero-name">{{ profile?.name ?? '—' }}</div>
        <div class="hero-email">{{ profile?.email ?? '—' }}</div>
        <div class="hero-status" :class="profile?.status?.toLowerCase()">
          {{ profile?.status === 'ACTIVE' ? $t('profile.statusActive') : $t('profile.statusBlocked') }}
        </div>
      </div>
    </div>

    <div class="hero-links">
      <NuxtLink to="/orders" class="hero-link">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M20 7H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z"/>
          <path d="M16 3H8a2 2 0 0 0-2 2v2h12V5a2 2 0 0 0-2-2z"/>
        </svg>
        {{ $t('auth.orders') }}
      </NuxtLink>
      <NuxtLink to="/wishlist" class="hero-link">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
        </svg>
        {{ $t('auth.wishlist') }}
      </NuxtLink>
      <NuxtLink to="/cart" class="hero-link">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
          <line x1="3" y1="6" x2="21" y2="6"/>
          <path d="M16 10a4 4 0 0 1-8 0"/>
        </svg>
        {{ $t('footer.cart') }}
        <span v-if="cartCount > 0" class="hero-link-badge">{{ cartCount }}</span>
      </NuxtLink>
      <button class="hero-link logout" @click="emit('logout')">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
          <polyline points="16 17 21 12 16 7"/>
          <line x1="21" y1="12" x2="9" y2="12"/>
        </svg>
        {{ $t('auth.logout') }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { CustomerProfile } from '../types'

const props = defineProps<{
  profile:   CustomerProfile | null
  cartCount: number
}>()
const emit = defineEmits<{ (e: 'logout'): void }>()

const initials = computed(() => {
  if (!props.profile?.name) return '?'
  return props.profile.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
})
</script>

<style scoped>
.hero-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 2rem;
  background: linear-gradient(135deg, #0F1117, #1a1d2e);
  border: 1px solid rgba(232, 160, 32, 0.15);
  border-radius: 20px;
  padding: 1.75rem 2rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
}

/* ── Left: avatar + info ── */
.hero-left {
  display: flex;
  align-items: center;
  gap: 1.25rem;
}
.hero-avatar {
  width: 64px; height: 64px;
  border-radius: 50%;
  background: linear-gradient(135deg, #E8A020, #FF8C00);
  color: #0F1117;
  font-size: 22px; font-weight: 800;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
  font-family: 'Plus Jakarta Sans', sans-serif;
}
.hero-name {
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 1.2rem; font-weight: 700; color: #fff;
  margin-bottom: 3px;
}
.hero-email {
  font-size: 0.85rem; color: rgba(255,255,255,0.45);
  margin-bottom: 8px;
}
.hero-status {
  display: inline-block;
  font-size: 10px; font-weight: 700; letter-spacing: 0.08em;
  text-transform: uppercase;
  padding: 3px 10px; border-radius: 20px;
  font-family: 'Plus Jakarta Sans', sans-serif;
}
.hero-status.active  { background: rgba(74, 222, 128, 0.12); color: #4ade80; border: 1px solid rgba(74,222,128,0.25); }
.hero-status.blocked { background: rgba(248, 113, 113, 0.12); color: #f87171; border: 1px solid rgba(248,113,113,0.25); }

/* ── Right: action links ── */
.hero-links {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}
.hero-link {
  display: inline-flex; align-items: center; gap: 7px;
  padding: 8px 14px; border-radius: 10px;
  font-size: 13px; font-weight: 600;
  color: rgba(255,255,255,0.65);
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(255,255,255,0.08);
  text-decoration: none; cursor: pointer;
  transition: all 0.2s;
  font-family: 'Plus Jakarta Sans', sans-serif;
  white-space: nowrap;
  position: relative;
}
.hero-link:hover {
  background: rgba(232,160,32,0.1);
  border-color: rgba(232,160,32,0.3);
  color: #E8A020;
}
.hero-link svg { flex-shrink: 0; }
.hero-link-badge {
  background: #EF4444; color: white;
  font-size: 10px; font-weight: 700;
  padding: 1px 6px; border-radius: 50px;
}
.hero-link.logout {
  color: rgba(248,113,113,0.75);
  border-color: rgba(248,113,113,0.15);
  background: none;
}
.hero-link.logout:hover {
  background: rgba(248,113,113,0.08);
  border-color: rgba(248,113,113,0.3);
  color: #f87171;
}

@media (max-width: 600px) {
  .hero-card { flex-direction: column; align-items: flex-start; padding: 1.25rem; }
  .hero-links { width: 100%; }
  .hero-link  { flex: 1; justify-content: center; }
}
</style>