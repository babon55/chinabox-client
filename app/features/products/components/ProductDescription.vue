<script setup lang="ts">
defineProps<{
  descriptionTk?: string | null
  descriptionRu?: string | null
  lang: string
}>()
</script>

<template>
  <div
    v-if="(lang === 'tk' ? descriptionTk : descriptionRu)"
    class="desc-section"
  >
    <div class="desc-header">
      <svg class="desc-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
        <polyline points="14 2 14 8 20 8"/>
        <line x1="16" y1="13" x2="8" y2="13"/>
        <line x1="16" y1="17" x2="8" y2="17"/>
        <polyline points="10 9 9 9 8 9"/>
      </svg>
      <h3 class="desc-title">
        {{ lang === 'tk' ? 'Haryt Barada' : 'О товаре' }}
      </h3>
    </div>
    <div class="desc-body">
      <p class="desc-text">{{ lang === 'tk' ? descriptionTk : descriptionRu }}</p>
    </div>
  </div>
</template>

<style scoped>
.desc-section {
  background: var(--white);
  border-radius: var(--radius-xl);
  border: 1.5px solid var(--border-light);
  overflow: hidden;
  box-shadow: var(--shadow-sm);
  margin-bottom: 20px;
}

.desc-header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 20px;
  background: var(--surface);
  border-bottom: 1px solid var(--border-light);
}

.desc-icon {
  width: 16px;
  height: 16px;
  color: var(--gold);
  flex-shrink: 0;
}

.desc-title {
  font-family: var(--font-body);
  font-size: 13px;
  font-weight: 700;
  color: var(--subtle);
  text-transform: uppercase;
  letter-spacing: .06em;
}

.desc-body {
  padding: 18px 20px;
}

.desc-text {
  font-size: 14px;
  color: var(--dark);
  line-height: 1.75;
  white-space: pre-wrap;
  font-family: var(--font-body);
}
</style>