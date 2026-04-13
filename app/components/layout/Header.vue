<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'

import HeaderTopBar      from './header/Headertopbar.vue'
import HeaderLogo        from './header/HeaderLogo.vue'
import HeaderSearch      from './header/HeaderSearch.vue'
import HeaderActions     from './header/HeaderActions.vue'
import HeaderNav         from './header/HeaderNav.vue'
import BottomNav         from './header/BottomNav.vue'
import MobileBottomSheet from './header/MobileBottomSheet.vue'

const signinStore = useSigninStore()
const cartStore   = useCartStore()

const { locale } = useI18n()

onMounted(() => {
  cartStore.restoreCart()
  signinStore.restore()
  const saved = localStorage.getItem('silkshop_lang')
  if (saved === 'tk' || saved === 'ru') locale.value = saved as 'tk' | 'ru'
})

function onLangChange(l: 'tk' | 'ru') {
  locale.value = l
  localStorage.setItem('silkshop_lang', l)
}

const searchQuery  = ref('')
const sheetOpen    = ref(false)
const scrolled     = ref(false)

const handleScroll = () => { scrolled.value = window.scrollY > 20 }
onMounted(()  => window.addEventListener('scroll', handleScroll))
onUnmounted(() => window.removeEventListener('scroll', handleScroll))
</script>

<template>
  <header :class="['site-header', { scrolled }]">
    <HeaderTopBar @update:current-lang="onLangChange" />

    <div class="main-header">
      <div class="header-inner">
        <HeaderLogo />
        <HeaderSearch v-model:search-query="searchQuery" />
        <HeaderActions
          :is-logged-in="signinStore.isLoggedIn"
          :cart-count="cartStore.totalItems"
          :user="signinStore.user"
          @logout="signinStore.logout()"
        />
      </div>
    </div>

    <HeaderNav />
  </header>

  <!-- Mobile bottom nav -->
  <BottomNav 
    @open-menu="sheetOpen = true" 
    @close-menu="sheetOpen = false"
  />

  <!-- Mobile bottom sheet -->
  <Transition name="sheet-fade">
    <MobileBottomSheet
      v-if="sheetOpen"
      @close="sheetOpen = false"
      @update:lang="onLangChange"
    />
  </Transition>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

.site-header { position: sticky; top: 0; z-index: 200; }
.site-header.scrolled .main-header { box-shadow: 0 4px 24px rgba(0,0,0,0.08); }
.main-header { background: white; border-bottom: 1px solid #E5E7EB; transition: box-shadow 0.3s; }

.header-inner {
  max-width: 1280px; margin: 0 auto;
  padding: 14px 24px;
  display: flex; justify-content: space-between; align-items: center; gap: 24px;
}

@media (max-width: 768px) {
  .header-inner { padding: 10px 16px; gap: 10px; }
}

.sheet-fade-enter-active { transition: opacity 0.2s ease; }
.sheet-fade-leave-active  { transition: opacity 0.2s ease; }
.sheet-fade-enter-from, .sheet-fade-leave-to { opacity: 0; }
</style>