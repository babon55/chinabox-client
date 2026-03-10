<script setup lang="ts">
import type { Lang } from '../types'

const props = defineProps<{
  modelValue: Lang
  align?: 'left' | 'right' | 'center'
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', val: Lang): void
}>()
</script>

<template>
  <div :class="['lang-toggle-wrap', `align-${align ?? 'right'}`]">
    <div class="lang-toggle">
      <button
        :class="['lang-pill', { active: modelValue === 'tk' }]"
        @click="emit('update:modelValue', 'tk')"
      >
        🇹🇲 TK
      </button>
      <button
        :class="['lang-pill', { active: modelValue === 'ru' }]"
        @click="emit('update:modelValue', 'ru')"
      >
        🇷🇺 RU
      </button>
    </div>
  </div>
</template>

<style scoped>
.lang-toggle-wrap { display: flex; width: 100%; }
.align-right  { justify-content: flex-end;    padding-right: 40px; }
.align-left   { justify-content: flex-start;  padding-left: 40px; }
.align-center { justify-content: center; }

.lang-toggle {
  display: flex; gap: 4px;
  background: white;
  border: 1px solid var(--border, #E5E7EB);
  border-radius: 50px;
  padding: 4px;
}
.lang-pill {
  padding: 5px 14px;
  border-radius: 50px;
  border: none;
  background: transparent;
  font-size: 12px;
  font-weight: 600;
  color: #6B7280;
  cursor: pointer;
  transition: all 0.2s;
  font-family: var(--font-body, 'Plus Jakarta Sans', sans-serif);
}
.lang-pill.active { background: #0F1117; color: white; }

@media (max-width: 768px) {
  .align-right { justify-content: center; padding-right: 0; }
  .align-left  { justify-content: center; padding-left: 0; }
}
</style>