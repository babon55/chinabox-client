<template>
  <div class="filter-bar">
    <button
      v-for="s in STATUS_OPTIONS"
      :key="s"
      :class="['ftab', { active: modelValue === s }]"
      @click="emit('update:modelValue', s)"
    >
      {{ STATUS_LABELS[s] }}
      <span v-if="s !== 'ALL'" class="ftab-count">{{ countByStatus(s) }}</span>
    </button>
  </div>
</template>

<script setup lang="ts">
import { useOrders, STATUS_OPTIONS } from '../composables/useOrders'

defineProps<{ modelValue: string }>()
const emit = defineEmits<{ (e: 'update:modelValue', val: string): void }>()

const { STATUS_LABELS, countByStatus } = useOrders()
</script>

<style scoped>
.filter-bar {
  display: flex; gap: 4px; flex-wrap: wrap;
  background: var(--white); border: 1.5px solid var(--border-light);
  border-radius: var(--radius-lg); padding: 6px; box-shadow: var(--shadow-sm);
}
.ftab {
  display: flex; align-items: center; gap: 6px;
  padding: 7px 14px; border-radius: var(--radius-md);
  border: none; background: transparent;
  font-size: 12px; font-weight: 600; color: var(--subtle);
  cursor: pointer; font-family: var(--font-body); transition: all .15s;
}
.ftab:hover  { background: var(--surface); color: var(--dark); }
.ftab.active { background: var(--dark); color: white; }
.ftab-count {
  background: rgba(255,255,255,0.15);
  padding: 1px 6px; border-radius: var(--radius-pill);
  font-size: 10px; font-weight: 700;
}
.ftab:not(.active) .ftab-count { background: var(--border-light); color: var(--muted); }
@media (max-width: 700px) { .ftab { padding: 6px 10px; font-size: 11px; } }
</style>