<script setup lang="ts">
import HeaderTopBar     from './header/Headertopbar.vue'
import HeaderLogo       from './header/HeaderLogo.vue'
import HeaderSearch     from './header/HeaderSearch.vue'
import HeaderActions    from './header/HeaderActions.vue'
import HeaderNav        from './header/HeaderNav.vue'
import HeaderMobileMenu from './header/HeaderMobileMenu.vue'

type Lang = 'tk' | 'ru'

// ── State ──────────────────────────────────────────────────────
const currentLang  = ref<Lang>('tk')
const searchQuery  = ref('')
const mobileOpen   = ref(false)
const scrolled     = ref(false)

// ── Replace these with your Pinia auth/cart store ──────────────
const isLoggedIn = ref(false)
const isAdmin    = ref(false)
const cartCount  = ref(3)

// ── Scroll shadow ──────────────────────────────────────────────
const handleScroll = () => { scrolled.value = window.scrollY > 20 }
onMounted(()  => window.addEventListener('scroll', handleScroll))
onUnmounted(() => window.removeEventListener('scroll', handleScroll))
</script>

<template>
  <header :class="['site-header', { scrolled }]">

    <!-- 1. Top bar: language + admin link -->
    <HeaderTopBar
      :current-lang="currentLang"
      :is-admin="isAdmin"
      @update:current-lang="currentLang = $event"
    />

    <!-- 2. Main bar: logo + search + auth + cart -->
    <div class="main-header">
      <div class="header-inner">

        <HeaderLogo :current-lang="currentLang" />

        <HeaderSearch
          v-model:search-query="searchQuery"
          :current-lang="currentLang"
        />

        <HeaderActions
          :current-lang="currentLang"
          :is-logged-in="isLoggedIn"
          :cart-count="cartCount"
        />

        <!-- Mobile burger -->
        <button class="mobile-toggle" @click="mobileOpen = !mobileOpen" aria-label="Menu">
          <span :class="['burger', { open: mobileOpen }]" />
        </button>

      </div>
    </div>

    <!-- 3. Nav bar: categories + links -->
    <HeaderNav :current-lang="currentLang" />

    <!-- 4. Mobile menu (toggled) -->
    <HeaderMobileMenu
      v-if="mobileOpen"
      :current-lang="currentLang"
      @close="mobileOpen = false"
    />
  </header>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Playfair+Display:wght@700&display=swap');

.site-header {
  position: sticky;
  top: 0;
  z-index: 200;
}

.site-header.scrolled .main-header {
  box-shadow: 0 4px 24px rgba(0,0,0,0.08);
}

.main-header {
  background: white;
  border-bottom: 1px solid #E5E7EB;
  transition: box-shadow 0.3s;
}

.header-inner {
  max-width: 1280px;
  margin: 0 auto;
  padding: 14px 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 24px;
  
}

/* ── Mobile burger ── */
.mobile-toggle {
  display: none;
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px;
  flex-shrink: 0;
}

.burger,
.burger::before,
.burger::after {
  display: block;
  width: 22px;
  height: 2px;
  background: #0F1117;
  border-radius: 2px;
  transition: all 0.3s;
  position: relative;
}
.burger::before, .burger::after {
  content: '';
  position: absolute;
}
.burger::before { top: -6px; }
.burger::after  { top:  6px; }

.burger.open              { background: transparent; }
.burger.open::before      { top: 0; transform: rotate(45deg); }
.burger.open::after       { top: 0; transform: rotate(-45deg); }

@media (max-width: 768px) {
  .mobile-toggle { display: flex; }
  .header-inner  { padding: 12px 16px; gap: 12px; }
}
</style>