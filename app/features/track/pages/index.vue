<template>
  <div class="track-page">

    <!-- Breadcrumb -->
    <div class="bc-bar">
      <div class="bc-inner">
        <NuxtLink to="/">{{ $t('footer.home') }}</NuxtLink>
        <span>›</span>
        <span>{{ $t('pages.track.title') }}</span>
      </div>
    </div>

    <div class="page-inner">

      <!-- Hero -->
      <div class="track-hero">
        <div class="hero-icon">🚚</div>
        <h1>{{ $t('pages.track.title') }}</h1>
        <p>{{ $t('pages.track.enterTrackingNumber') }}</p>
      </div>

      <!-- Search -->
      <TrackSearchBox
        v-model="input"
        :loading="store.loading"
        :error="errorMsg"
        @search="handleSearch"
      />

      <!-- Result -->
      <Transition name="slide-up">
        <TrackResult v-if="store.order" :order="store.order" />
      </Transition>

      <!-- Info cards (shown only before any result) -->
      <TrackInfoCards v-if="!store.order" />

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useI18n }                  from 'vue-i18n'
import { useTrackStore }            from '../stores/track.store'
import TrackSearchBox               from '../components/TrackSearchBox.vue'
import TrackResult                  from '../components/TrackResult.vue'
import TrackInfoCards               from '../components/TrackInfoCards.vue'

definePageMeta({ layout: 'default' })

const { t }   = useI18n()
const route   = useRoute()
const store   = useTrackStore()
const input   = ref('')

// Show translated error — store.error is raw API message, fallback to i18n key
const errorMsg = computed(() =>
  store.error ?? (store.error === null && !store.order && !store.loading ? '' : '')
)

async function handleSearch() {
  const id = input.value.trim()
  if (!id) return
  await store.trackOrder(id)
  // If API had no message, use i18n fallback
  if (!store.order && !store.error) {
    store.error = t('track.notFound')
  }
}

// Pre-fill + auto-search from URL query ?id=xxx
onMounted(() => {
  if (route.query.id) {
    input.value = route.query.id as string
    handleSearch()
  }
})

useHead({ title: computed(() => `${t('pages.track.title')} – SilkShop`) })
</script>

<style scoped>
.track-page  { min-height: 80vh; background: var(--surface); font-family: var(--font-body); }

.bc-bar   { background: var(--white); border-bottom: 1px solid var(--border-light); padding: 12px 0; }
.bc-inner { max-width: 800px; margin: 0 auto; padding: 0 24px; display: flex; align-items: center; gap: 8px; font-size: 13px; color: var(--subtle); }
.bc-inner a { color: var(--subtle); text-decoration: none; }
.bc-inner a:hover { color: var(--gold); }

.page-inner { max-width: 800px; margin: 0 auto; padding: 40px 24px 60px; display: flex; flex-direction: column; gap: 24px; }

/* Hero */
.track-hero { text-align: center; display: flex; flex-direction: column; align-items: center; gap: 12px; }
.hero-icon  { font-size: 56px; animation: float 3s ease-in-out infinite; }
@keyframes float { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
.track-hero h1 { font-family: var(--font-display); font-size: 30px; font-weight: 700; color: var(--dark); }
.track-hero p  { font-size: 15px; color: var(--subtle); }

/* Transition */
.slide-up-enter-active { transition: all .35s cubic-bezier(.4,0,.2,1); }
.slide-up-enter-from   { opacity: 0; transform: translateY(16px); }
</style>