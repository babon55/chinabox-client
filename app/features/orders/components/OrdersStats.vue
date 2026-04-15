<template>
  <div class="stats-grid">
    <div v-for="s in stats" :key="s.label" class="stat-card">
      <div class="stat-icon">{{ s.icon }}</div>
      <div>
        <div class="stat-val">{{ s.value }}</div>
        <div class="stat-lbl">{{ s.label }}</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { OrderStats } from '../types'
defineProps<{ stats: OrderStats[] }>()
</script>

<style scoped>
.stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; }
.stat-card {
  background: var(--white); border-radius: var(--radius-lg);
  border: 1.5px solid var(--border-light); padding: 16px 18px;
  display: flex; align-items: center; gap: 14px;
  box-shadow: var(--shadow-sm);
}
.stat-icon { font-size: 24px; flex-shrink: 0; }
.stat-val  { font-size: 20px; font-weight: 800; color: var(--dark); font-family: var(--font-display); line-height: 1; }
.stat-lbl  { font-size: 11px; color: var(--subtle); margin-top: 3px; }
@media (max-width: 700px) { .stats-grid { grid-template-columns: repeat(2, 1fr); } }
</style>