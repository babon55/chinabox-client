<template>
  <div class="empty-state">
    <div class="empty-heart">💔</div>
    <h2>{{ $t('wishlist.emptyTitle') }}</h2>
    <p>{{ $t('wishlist.emptyDesc') }}</p>
    <NuxtLink to="/products" class="shop-btn">
      🛍️ {{ $t('wishlist.browseProducts') }}
    </NuxtLink>
  </div>
</template>

<style scoped>
.empty-state {
  display: flex; flex-direction: column; align-items: center;
  gap: 16px; padding: 80px 20px; text-align: center;
}
.empty-heart { font-size: 64px; animation: heartbeat 2s ease-in-out infinite; }
@keyframes heartbeat { 0%,100% { transform: scale(1); } 50% { transform: scale(1.1); } }
.empty-state h2 { font-family: var(--font-display); font-size: 24px; font-weight: 700; color: var(--dark); }
.empty-state p  { font-size: 15px; color: var(--subtle); max-width: 400px; line-height: 1.6; }
.shop-btn {
  display: inline-flex; align-items: center;
  height: 46px; padding: 0 28px; border-radius: var(--radius-pill);
  background: linear-gradient(135deg, var(--gold), var(--gold-dark));
  color: white; font-size: 14px; font-weight: 700;
  text-decoration: none; box-shadow: 0 4px 16px var(--gold-shadow);
  transition: all .15s; margin-top: 8px;
}
.shop-btn:hover { transform: translateY(-2px); }
</style>