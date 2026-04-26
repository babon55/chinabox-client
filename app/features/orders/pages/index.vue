<template>
  <div class="orders-page">

    <!-- Hero -->
    <div class="page-hero">
      <div class="hero-inner">
        <div class="hero-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
            <path d="M20 7H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z"/>
            <path d="M16 3H8a2 2 0 0 0-2 2v2h12V5a2 2 0 0 0-2-2z"/>
          </svg>
        </div>
        <div>
          <h1 class="hero-title">{{ $t('pages.orders.title') }}</h1>
          <p class="hero-sub">
            {{ locale === 'tk' ? 'Ähli sargytlaryňyz bir ýerde' : 'Все ваши заказы в одном месте' }}
          </p>
        </div>
      </div>
    </div>

    <div class="page-body">

      <!-- Not logged in -->
      <OrdersLoginPrompt v-if="!signinStore.isLoggedIn" />

      <template v-else>

        <!-- Stats -->
        <OrdersStats :stats="stats" />

        <!-- Filter -->
        <OrdersFilterBar v-model="filterStatus" />

        <!-- Loading -->
        <div v-if="store.loading" class="loading-wrap">
          <div class="spinner" />
        </div>

        <!-- Error -->
        <div v-else-if="store.error" class="error-box">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          {{ store.error }}
        </div>

        <!-- Empty -->
        <OrdersEmpty
          v-else-if="visibleOrders.length === 0"
          :filter-status="filterStatus"
        />

        <!-- Orders list -->
        <div v-else class="orders-list">
          <OrderCard
            v-for="order in visibleOrders"
            :key="order.id"
            :order="order"
          />
        </div>

      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useI18n }                         from 'vue-i18n'
import { useOrdersStore }                  from '../stores/orders.store'
import { useOrders }                       from '../composables/useOrders'
import OrderCard                           from '../components/OrderCard.vue'
import OrdersStats                         from '../components/OrdersStats.vue'
import OrdersFilterBar                     from '../components/OrdersFilterBar.vue'
import OrdersEmpty                         from '../components/OrdersEmpty.vue'
import OrdersLoginPrompt                   from '../components/OrdersLoginPrompt.vue'

definePageMeta({ layout: 'default' })

const { locale, t }  = useI18n()
const store          = useOrdersStore()
const signinStore    = useSigninStore()
const { stats, filteredOrders } = useOrders()

const filterStatus   = ref('ALL')
const visibleOrders  = computed(() => filteredOrders(filterStatus.value))

onMounted(async () => {
  await signinStore.restore()
  if (signinStore.isLoggedIn) store.fetchOrders()
})

// Load when customer logs in during the session
watch(() => signinStore.isLoggedIn, (val, old) => {
  if (val && old === false) store.fetchOrders()
})

useHead({ title: computed(() => `${t('pages.orders.title')} – ChinaExpress`) })
</script>

<style scoped>
.orders-page { background: var(--surface); min-height: 100vh; }

.page-hero {
  background: var(--dark); padding: 36px 24px;
  border-bottom: 1px solid rgba(255,255,255,0.06);
}
.hero-inner  { max-width: 900px; margin: 0 auto; display: flex; align-items: center; gap: 20px; }
.hero-icon {
  width: 56px; height: 56px; border-radius: var(--radius-lg);
  background: var(--gold-glow); border: 1.5px solid rgba(232,160,32,0.25);
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0; color: var(--gold);
}
.hero-icon svg { width: 26px; height: 26px; }
.hero-title { font-family: var(--font-display); font-size: 28px; font-weight: 700; color: white; margin-bottom: 4px; }
.hero-sub   { font-size: 14px; color: rgba(255,255,255,0.45); }

.page-body { max-width: 900px; margin: 0 auto; padding: 32px 24px; display: flex; flex-direction: column; gap: 20px; }

.loading-wrap { display: flex; justify-content: center; padding: 60px; }
.spinner {
  width: 32px; height: 32px;
  border: 3px solid var(--border);
  border-top-color: var(--gold);
  border-radius: 50%; animation: spin .7s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

.error-box {
  display: flex; align-items: center; gap: 8px;
  background: var(--error-bg); color: var(--error);
  border: 1.5px solid var(--error-border);
  border-radius: var(--radius-md); padding: 12px 16px;
  font-size: 13px; font-weight: 600;
}
.error-box svg { width: 16px; height: 16px; flex-shrink: 0; }

.orders-list { display: flex; flex-direction: column; gap: 12px; }

@media (max-width: 700px) { .page-body { padding: 20px 16px; } }
</style>