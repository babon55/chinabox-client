<template>
  <Transition name="fade">
    <div v-if="visible" class="success-overlay">
      <div class="success-card">
        <span class="s-icon">🎉</span>
        <h3>{{ $t('checkout.successTitle') }}</h3>
        <p v-if="orderId">
          {{ $t('checkout.orderNumber') }}:
          <strong>#{{ orderId.slice(-8).toUpperCase() }}</strong>
        </p>
        <div class="s-actions">
          <NuxtLink to="/orders" class="btn-gold">{{ $t('checkout.viewOrders') }}</NuxtLink>
          <NuxtLink to="/products" class="btn-outline">{{ $t('checkout.continueShopping') }}</NuxtLink>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
defineProps<{
  visible: boolean
  orderId: string | null
}>()
</script>

<style scoped>
.success-overlay {
  position: fixed; inset: 0;
  background: rgba(0, 0, 0, 0.55);
  display: flex; align-items: center; justify-content: center;
  z-index: 999; padding: 20px;
}
.success-card {
  background: white;
  border-radius: 24px;
  padding: 48px 40px;
  text-align: center;
  max-width: 380px; width: 100%;
  box-shadow: 0 24px 64px rgba(0, 0, 0, 0.3);
  display: flex; flex-direction: column;
  align-items: center; gap: 14px;
}
.s-icon { font-size: 56px; }
.success-card h3 {
  font-family: 'Playfair Display', serif;
  font-size: 22px; font-weight: 700; color: #0f1117;
}
.success-card p { font-size: 14px; color: #6b7280; }
.success-card strong { color: #e8a020; font-weight: 800; }
.s-actions {
  display: flex; gap: 10px;
  flex-wrap: wrap; justify-content: center;
  margin-top: 6px;
}
.btn-gold {
  display: inline-flex; align-items: center;
  height: 44px; padding: 0 20px; border-radius: 50px;
  background: linear-gradient(135deg, #e8a020, #ff8c00);
  color: white; font-size: 13px; font-weight: 700;
  text-decoration: none;
  -webkit-tap-highlight-color: transparent;
}
.btn-outline {
  display: inline-flex; align-items: center;
  height: 44px; padding: 0 20px; border-radius: 50px;
  border: 1.5px solid #e5e7eb; background: none;
  color: #374151; font-size: 13px; font-weight: 700;
  text-decoration: none;
  -webkit-tap-highlight-color: transparent;
}
.btn-gold:active   { opacity: 0.9; transform: scale(0.97); }
.btn-outline:active { background: #f3f4f6; }

/* ── Mobile ── */
@media (max-width: 480px) {
  .success-overlay {
    align-items: flex-end;
    padding: 0;
  }

  .success-card {
    border-radius: 24px 24px 0 0;
    padding: 32px 24px;
    padding-bottom: calc(32px + env(safe-area-inset-bottom));
    max-width: 100%;
    gap: 12px;
  }

  .s-icon { font-size: 48px; }
  .success-card h3 { font-size: 20px; }

  .s-actions {
    flex-direction: column;
    width: 100%;
    gap: 8px;
  }
  .btn-gold,
  .btn-outline {
    width: 100%;
    justify-content: center;
    height: 50px;
    font-size: 14px;
    border-radius: 14px;
  }
}

.fade-enter-active, .fade-leave-active { transition: opacity 0.2s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>