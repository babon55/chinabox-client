<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'

import HeaderTopBar     from './header/Headertopbar.vue'
import HeaderLogo       from './header/HeaderLogo.vue'
import HeaderSearch     from './header/HeaderSearch.vue'
import HeaderActions    from './header/HeaderActions.vue'
import HeaderNav        from './header/HeaderNav.vue'
import HeaderMobileMenu from './header/HeaderMobileMenu.vue'

const signinStore = useSigninStore()
const cartStore   = useCartStore()

// Use Vue I18n
const { locale } = useI18n()

onMounted(() => {
  cartStore.restoreCart()
  signinStore.restore()
  const saved = localStorage.getItem('silkshop_lang')
  if (saved === 'tk' || saved === 'ru') {
    locale.value = saved as 'tk' | 'ru'
  }
})

function onLangChange(l: 'tk' | 'ru') {
  locale.value = l
  localStorage.setItem('silkshop_lang', l)
}

const searchQuery = ref('')
const mobileOpen  = ref(false)
const scrolled    = ref(false)

const handleScroll = () => { scrolled.value = window.scrollY > 20 }
onMounted(()  => window.addEventListener('scroll', handleScroll))
onUnmounted(() => window.removeEventListener('scroll', handleScroll))
</script>

<template>
  <header :class="['site-header', { scrolled }]">
    <HeaderTopBar
      @update:current-lang="onLangChange"
    />

    <div class="main-header">
      <div class="header-inner">
        <HeaderLogo />

        <HeaderSearch
          v-model:search-query="searchQuery"
        />

        <HeaderActions
          :is-logged-in="signinStore.isLoggedIn"
          :cart-count="cartStore.totalItems"
          :user="signinStore.user"
          @logout="signinStore.logout()"
        />

        <button
          class="mobile-toggle"
          :class="{ open: mobileOpen }"
          @click="mobileOpen = !mobileOpen"
          aria-label="Menu"
        >
          <span class="bar" />
          <span class="bar" />
          <span class="bar" />
        </button>
      </div>
    </div>

    <HeaderNav />

    <Transition name="mobile-slide">
      <HeaderMobileMenu
        v-if="mobileOpen"
        @close="mobileOpen = false"
      />
    </Transition>
  </header>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Playfair+Display:wght@700&display=swap');

.site-header { position: sticky; top: 0; z-index: 200; }
.site-header.scrolled .main-header { box-shadow: 0 4px 24px rgba(0,0,0,0.08); }
.main-header { background: white; border-bottom: 1px solid #E5E7EB; transition: box-shadow 0.3s; }

.header-inner {
  max-width: 1280px;
  margin: 0 auto;
  padding: 14px 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 24px;
}

/* ── Hamburger / Close button ── */
.mobile-toggle {
  display: none;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 5px;
  width: 40px;
  height: 40px;
  padding: 0;
  border-radius: 10px;
  border: 1.5px solid #E5E7EB;
  background: white;
  cursor: pointer;
  flex-shrink: 0;
  transition: border-color 0.2s, background 0.2s;
}
.mobile-toggle:hover { border-color: #E8A020; }

/* When open → looks like a proper X close button */
.mobile-toggle.open {
  background: #F3F4F6;
  border-color: #D1D5DB;
}

.bar {
  display: block;
  width: 16px;
  height: 1.5px;
  background: #0F1117;
  border-radius: 2px;
  transition: transform 0.25s ease, opacity 0.2s ease;
}

.mobile-toggle.open .bar:nth-child(1) { transform: translateY(6.5px) rotate(45deg); }
.mobile-toggle.open .bar:nth-child(2) { opacity: 0; transform: scaleX(0); }
.mobile-toggle.open .bar:nth-child(3) { transform: translateY(-6.5px) rotate(-45deg); }

@media (max-width: 768px) {
  .mobile-toggle { display: flex; }
  .header-inner  { padding: 10px 16px; gap: 10px; }
}

/* X state */
.mobile-toggle.open .bar:nth-child(1) { transform: translateY(6.5px) rotate(45deg); }
.mobile-toggle.open .bar:nth-child(2) { opacity: 0; transform: scaleX(0); }
.mobile-toggle.open .bar:nth-child(3) { transform: translateY(-6.5px) rotate(-45deg); }

/* Mobile menu slide transition */
.mobile-slide-enter-active { transition: opacity 0.22s ease, transform 0.22s cubic-bezier(0.16,1,0.3,1); }
.mobile-slide-leave-active  { transition: opacity 0.18s ease, transform 0.18s ease-in; }
.mobile-slide-enter-from,
.mobile-slide-leave-to      { opacity: 0; transform: translateY(-8px); }

@media (max-width: 768px) {
  .mobile-toggle { display: flex; }
  .header-inner  { padding: 10px 16px; gap: 10px; }
}
</style>