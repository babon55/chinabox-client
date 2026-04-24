<template>
  <div class="search-card">
    <div class="search-box" :class="{ focused }">
      <svg class="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M20 7H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z"/>
        <path d="M16 3H8a2 2 0 0 0-2 2v2h12V5a2 2 0 0 0-2-2z"/>
      </svg>
      <input
        :value="modelValue"
        class="search-input"
        :placeholder="$t('pages.track.enterTrackingNumber')"
        @input="emit('update:modelValue', ($event.target as HTMLInputElement).value)"
        @focus="focused = true"
        @blur="focused = false"
        @keydown.enter="emit('search')"
      />
      <button class="track-btn" :disabled="loading" @click="emit('search')">
        <svg v-if="loading" class="spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
        </svg>
        <span v-else>{{ $t('pages.track.track') }}</span>
      </button>
    </div>
    <p v-if="error" class="search-error">⚠ {{ error }}</p>
    <p class="search-hint">💡 {{ $t('pages.track.orderInfo') }}</p>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

defineProps<{
  modelValue: string
  loading:    boolean
  error:      string
}>()

const emit    = defineEmits<{
  (e: 'update:modelValue', val: string): void
  (e: 'search'): void
}>()

const focused = ref(false)
</script>

<style scoped>
.search-card {
  background: var(--white); border-radius: var(--radius-xl);
  border: 1.5px solid var(--border-light); padding: 24px;
  box-shadow: var(--shadow-md); display: flex; flex-direction: column; gap: 12px;
}
.search-box {
  display: flex; align-items: center; gap: 10px;
  border: 2px solid var(--border); border-radius: var(--radius-lg);
  padding: 6px 6px 6px 16px; transition: border-color .15s, box-shadow .15s;
}
.search-box.focused { border-color: var(--gold); box-shadow: 0 0 0 4px var(--gold-glow); }
.search-icon  { width: 18px; height: 18px; color: var(--subtle); flex-shrink: 0; }
.search-input {
  flex: 1; border: none; outline: none;
  font-size: 15px; font-family: var(--font-body);
  color: var(--dark); background: transparent;
  min-width: 0; padding: 8px 0;
}
.search-input::placeholder { color: var(--subtle); }
.track-btn {
  height: 44px; padding: 0 24px; border-radius: var(--radius-md);
  border: none; background: linear-gradient(135deg, var(--gold), var(--gold-dark));
  color: white; font-size: 14px; font-weight: 700;
  cursor: pointer; font-family: var(--font-body);
  transition: all .15s; box-shadow: 0 4px 12px var(--gold-shadow);
  flex-shrink: 0; display: flex; align-items: center; gap: 8px;
}
.track-btn:hover:not(:disabled) { transform: translateY(-1px); }
.track-btn:disabled { opacity: .6; cursor: not-allowed; }
.spin { animation: spin .8s linear infinite; width: 16px; height: 16px; }
@keyframes spin { to { transform: rotate(360deg); } }
.search-error { font-size: 13px; color: var(--error); font-weight: 600; }
.search-hint  { font-size: 12px; color: var(--subtle); }

@media (max-width: 600px) {
  .search-box { flex-wrap: wrap; }
  .track-btn  { width: 100%; justify-content: center; }
}
</style>