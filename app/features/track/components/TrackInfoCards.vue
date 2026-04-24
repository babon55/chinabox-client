<template>
  <div class="info-cards">
    <div
      v-for="c in cards"
      :key="c.titleKey"
      class="info-card"
    >
      <span class="card-icon">{{ c.icon }}</span>
      <div>
        <div class="card-title">{{ $t(c.titleKey) }}</div>
        <div class="card-sub">{{ $t(c.subKey) }}</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const cards = [
  { icon: '⚡', titleKey: 'footer.delivery1', subKey: 'footer.delivery1' },
  { icon: '🚚', titleKey: 'footer.delivery2', subKey: 'footer.delivery2' },
  { icon: '📞', titleKey: 'footer.contact',   subKey: 'footer.phone'    },
]
</script>

<style scoped>
.info-cards { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; }
.info-card  {
  background: var(--white); border-radius: var(--radius-lg);
  border: 1.5px solid var(--border-light); padding: 18px;
  display: flex; align-items: center; gap: 14px; box-shadow: var(--shadow-sm);
}
.card-icon  { font-size: 28px; flex-shrink: 0; }
.card-title { font-size: 13px; font-weight: 700; color: var(--dark); }
.card-sub   { font-size: 12px; color: var(--subtle); margin-top: 2px; }
@media (max-width: 600px) { .info-cards { grid-template-columns: 1fr; } }
</style>