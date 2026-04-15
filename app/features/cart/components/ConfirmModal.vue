<template>
  <Transition name="fade">
    <div v-if="visible" class="confirm-overlay" @click.self="emit('cancel')">
      <div class="confirm-modal">
        <p>{{ message }}</p>
        <div class="confirm-actions">
          <button class="btn-cancel"  @click="emit('cancel')">{{ cancelText }}</button>
          <button class="btn-confirm" @click="emit('confirm')">{{ confirmText }}</button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
defineProps<{
  visible:     boolean
  message:     string
  confirmText: string
  cancelText:  string
}>()

const emit = defineEmits<{
  (e: 'confirm'): void
  (e: 'cancel'):  void
}>()
</script>

<style scoped>
.confirm-overlay {
  position: fixed; inset: 0;
  background: rgba(0, 0, 0, 0.55);
  display: flex; align-items: center; justify-content: center;
  z-index: 1100; padding: 20px;
}
.confirm-modal {
  background: white; border-radius: 16px;
  padding: 24px; max-width: 320px; width: 100%;
  text-align: center;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.25);
}
.confirm-modal p {
  font-size: 15px; font-weight: 600;
  color: #374151; margin-bottom: 16px;
  font-family: 'Plus Jakarta Sans', sans-serif;
}
.confirm-actions { display: flex; gap: 10px; justify-content: center; }
.btn-cancel, .btn-confirm {
  height: 38px; padding: 0 18px; border-radius: 8px;
  border: none; font-size: 13px; font-weight: 700;
  cursor: pointer;
  font-family: 'Plus Jakarta Sans', sans-serif;
}
.btn-cancel  { background: #f3f4f6; color: #6b7280; }
.btn-cancel:hover  { background: #e5e7eb; }
.btn-confirm { background: #ef4444; color: white; }
.btn-confirm:hover { background: #dc2626; }
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>