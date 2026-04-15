<template>
  <div class="empty-state">
    <div class="empty-icon">🔭</div>
    <h3>{{ $t('orders.noOrders') }}</h3>
    <p>{{ message }}</p>
    <NuxtLink v-if="showShopLink" to="/products" class="btn-gold">
      {{ $t('common.continueShopping') }}
    </NuxtLink>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n }  from 'vue-i18n'

const props = defineProps<{ filterStatus: string }>()
const { locale } = useI18n()

const showShopLink = computed(() => props.filterStatus === 'ALL')

const message = computed(() =>
  props.filterStatus === 'ALL'
    ? (locale.value === 'tk' ? 'Entek hiç sargyt ýok' : 'Заказов пока нет')
    : (locale.value === 'tk' ? 'Bu ýagdaýda sargyt ýok'  : 'Нет заказов с этим статусом')
)
</script>

<style scoped>
.empty-state {
  background: var(--white); border-radius: var(--radius-xl);
  border: 1.5px solid var(--border-light); padding: 56px 40px;
  text-align: center; box-shadow: var(--shadow-sm);
}
.empty-icon { font-size: 48px; margin-bottom: 16px; }
.empty-state h3 { font-family: var(--font-display); font-size: 20px; font-weight: 700; color: var(--dark); margin-bottom: 8px; }
.empty-state p  { font-size: 14px; color: var(--subtle); margin-bottom: 24px; }
.btn-gold {
  display: inline-flex; align-items: center; height: 44px; padding: 0 24px;
  border-radius: var(--radius-pill); background: var(--gold);
  color: white; font-size: 13px; font-weight: 700; text-decoration: none;
}
.btn-gold:hover { background: var(--gold-dark); }
</style>