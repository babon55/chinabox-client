<script setup lang="ts">
defineProps<{
  label:       string
  error?:      string
  modelValue:  string
  type?:       string
  placeholder?: string
  autocomplete?: string
  icon?:       string   // 'email' | 'password' | 'user' | 'phone' | 'lock'
  showToggle?: boolean  // show eye button (password fields)
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', val: string): void
}>()

const show = ref(false)

const inputType = computed(() => {
  if (props.showToggle) return show.value ? 'text' : 'password'
  return props.type ?? 'text'
})

const props = defineProps<{
  label:       string
  error?:      string
  modelValue:  string
  type?:       string
  placeholder?: string
  autocomplete?: string
  icon?:       string
  showToggle?: boolean
}>()
</script>

<template>
  <div class="field-group" :class="{ error }">
    <label class="field-label">{{ label }}</label>

    <div class="field-input-wrap">
      <!-- Icon slot -->
      <slot name="icon">
        <svg v-if="icon === 'email'" class="field-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
        <svg v-if="icon === 'user'"  class="field-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
        <svg v-if="icon === 'phone'" class="field-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.62 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
        <svg v-if="icon === 'password'" class="field-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
        <svg v-if="icon === 'lock'"    class="field-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
      </slot>

      <input
        :value="modelValue"
        :type="inputType"
        :placeholder="placeholder"
        :autocomplete="autocomplete"
        class="field-input"
        @input="emit('update:modelValue', ($event.target as HTMLInputElement).value)"
      />

      <!-- Eye toggle for password fields -->
      <button v-if="showToggle" type="button" class="eye-btn" @click="show = !show">
        <svg v-if="!show" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
        <svg v-else        width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
      </button>

      <!-- Any extra right content -->
      <slot name="right" />
    </div>

    <span v-if="error" class="field-error">{{ error }}</span>
  </div>
</template>

<style scoped>
.field-group { display: flex; flex-direction: column; gap: 6px; }
.field-label { font-size: 13px; font-weight: 600; color: #374151; font-family: var(--font-body, 'Plus Jakarta Sans', sans-serif); }

.field-input-wrap {
  display: flex; align-items: center; gap: 10px;
  border: 1.5px solid var(--border, #E5E7EB);
  border-radius: var(--radius-md, 10px);
  padding: 0 12px;
  background: var(--surface, #F9FAFB);
  transition: all 0.2s;
}
.field-input-wrap:focus-within {
  border-color: var(--gold, #E8A020);
  background: white;
  box-shadow: 0 0 0 3px var(--gold-glow, rgba(232,160,32,0.1));
}
.field-group.error .field-input-wrap {
  border-color: var(--error, #EF4444);
  background: var(--error-bg, #FEF2F2);
}

.field-icon { color: var(--subtle, #9CA3AF); flex-shrink: 0; transition: color 0.2s; }
.field-input-wrap:focus-within :deep(.field-icon) { color: var(--gold, #E8A020); }

.field-input {
  flex: 1; border: none; background: transparent; outline: none;
  font-size: 14px; color: var(--dark, #0F1117); padding: 11px 0;
  font-family: var(--font-body, 'Plus Jakarta Sans', sans-serif);
}
.field-input::placeholder { color: var(--subtle, #9CA3AF); }

.eye-btn { background: none; border: none; color: var(--subtle, #9CA3AF); cursor: pointer; padding: 4px; display: flex; align-items: center; transition: color 0.2s; }
.eye-btn:hover { color: var(--gold, #E8A020); }

.field-error { font-size: 12px; color: var(--error, #EF4444); font-weight: 500; font-family: var(--font-body, 'Plus Jakarta Sans', sans-serif); }
.field-error::before { content: '⚠ '; }
</style>