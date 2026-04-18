<template>
  <div class="wishlist-page">

    <!-- Breadcrumb -->
    <div class="bc-bar">
      <div class="bc-inner">
        <NuxtLink to="/">{{ $t('footer.home') }}</NuxtLink>
        <span>›</span>
        <span>{{ $t('wishlist.title') }}</span>
        <span v-if="store.total > 0" class="bc-count">({{ store.total }})</span>
      </div>
    </div>

    <div class="page-inner">

      <!-- Header -->
      <div class="page-header">
        <div class="header-left">
          <h1 class="page-title">
            <span class="heart-icon">❤️</span>
            {{ $t('wishlist.title') }}
          </h1>
          <span v-if="store.total > 0" class="item-count">
            {{ store.total }} {{ $t('wishlist.items') }}
          </span>
        </div>
        <button v-if="store.total > 0" class="clear-btn" @click="store.clear()">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="3 6 5 6 21 6"/>
            <path d="M19 6l-1 14H6L5 6"/>
          </svg>
          {{ $t('wishlist.clearAll') }}
        </button>
      </div>

      <!-- Empty -->
      <WishlistEmpty v-if="!store.total" />

      <!-- Grid -->
      <div v-else class="wishlist-grid">
        <TransitionGroup name="item" tag="div" class="grid-inner">
          <WishlistCard
            v-for="item in store.items"
            :key="item.id"
            :item="item"
            @remove="store.remove"
            @move-to-cart="moveToCart"
          />
        </TransitionGroup>
      </div>

      <!-- Continue shopping -->
      <div v-if="store.total > 0" class="continue-row">
        <NuxtLink to="/products" class="continue-link">
          ← {{ $t('common.continueShopping') }}
        </NuxtLink>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, computed } from 'vue'
import { useI18n }             from 'vue-i18n'
import { useWishlistStore }    from '../stores/wishlist.store'
import { useWishlist }         from '../composables/useWishlist'
import WishlistCard            from '../components/WishlistCard.vue'
import WishlistEmpty           from '../components/WishlistEmpty.vue'

definePageMeta({ layout: 'default' })

const { t, locale } = useI18n()
const store         = useWishlistStore()
const cartStore     = useCartStore()
const { moveToCart } = useWishlist()

onMounted(() => {
  store.restore()
  cartStore.restoreCart()
})

useHead({
  title: computed(() =>
    `${t('wishlist.title')} (${store.total}) – SilkShop`
  ),
})
</script>

<style scoped>
.wishlist-page { min-height: 80vh; background: var(--surface); font-family: var(--font-body); }

.bc-bar   { background: var(--white); border-bottom: 1px solid var(--border-light); padding: 12px 0; }
.bc-inner { max-width: 1280px; margin: 0 auto; padding: 0 24px; display: flex; align-items: center; gap: 8px; font-size: 13px; color: var(--subtle); }
.bc-inner a { color: var(--subtle); text-decoration: none; }
.bc-inner a:hover { color: var(--gold); }
.bc-count { color: var(--subtle); }

.page-inner { max-width: 1280px; margin: 0 auto; padding: 28px 24px 60px; }

/* Header */
.page-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 28px; flex-wrap: wrap; gap: 12px; }
.header-left { display: flex; align-items: center; gap: 14px; }
.page-title  { font-family: var(--font-display); font-size: 26px; font-weight: 700; color: var(--dark); display: flex; align-items: center; gap: 10px; }
.heart-icon  { font-size: 24px; }
.item-count  { font-size: 14px; color: var(--subtle); background: var(--surface); border: 1.5px solid var(--border-light); padding: 3px 12px; border-radius: var(--radius-pill); }
.clear-btn   { display: flex; align-items: center; gap: 6px; height: 36px; padding: 0 16px; border-radius: var(--radius-md); border: 1.5px solid #fecaca; background: #fef2f2; color: #dc2626; font-size: 12px; font-weight: 600; cursor: pointer; font-family: var(--font-body); transition: all .15s; }
.clear-btn:hover { background: #dc2626; color: white; border-color: #dc2626; }

/* Grid */
.grid-inner { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 18px; }

/* Continue */
.continue-row  { margin-top: 32px; display: flex; justify-content: center; }
.continue-link { font-size: 14px; font-weight: 700; color: var(--gold); text-decoration: none; }
.continue-link:hover { text-decoration: underline; }

/* Transitions */
.item-enter-active { transition: all .3s ease; }
.item-leave-active { transition: all .25s ease; position: absolute; }
.item-enter-from   { opacity: 0; transform: scale(.95); }
.item-leave-to     { opacity: 0; transform: scale(.9); }

@media (max-width: 480px) { .grid-inner { grid-template-columns: repeat(2, 1fr); gap: 12px; } }
</style>