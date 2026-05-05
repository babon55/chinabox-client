<template>
  <Transition name="fade">
    <div v-if="visible" class="confirm-overlay" @click.self="emit('cancel')">
      <div class="confirm-modal">
        <div class="modal-handle" />
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
  background: white;
  border-radius: 16px;
  padding: 24px;
  max-width: 320px; width: 100%;
  text-align: center;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.25);
}

/* Hide handle on desktop */
.modal-handle { display: none; }

.confirm-modal p {
  font-size: 15px; font-weight: 600;
  color: #374151; margin-bottom: 16px;
  font-family: 'Plus Jakarta Sans', sans-serif;
  line-height: 1.5;
}
.confirm-actions { display: flex; gap: 10px; justify-content: center; }
.btn-cancel, .btn-confirm {
  height: 44px; padding: 0 20px; border-radius: 10px;
  border: none; font-size: 14px; font-weight: 700;
  cursor: pointer; font-family: 'Plus Jakarta Sans', sans-serif;
  transition: all 0.15s;
  flex: 1;
  -webkit-tap-highlight-color: transparent;
}
.btn-cancel  { background: #f3f4f6; color: #6b7280; }
.btn-cancel:hover  { background: #e5e7eb; }
.btn-cancel:active { background: #e5e7eb; transform: scale(0.97); }
.btn-confirm { background: #ef4444; color: white; }
.btn-confirm:hover  { background: #dc2626; }
.btn-confirm:active { background: #dc2626; transform: scale(0.97); }

/* ── Mobile: slide up from bottom ── */
@media (max-width: 480px) {
  .confirm-overlay {
    align-items: flex-end;
    padding: 0;
  }

  .confirm-modal {
    max-width: 100%;
    border-radius: 20px 20px 0 0;
    padding: 12px 20px 24px;
    padding-bottom: calc(24px + env(safe-area-inset-bottom));
    text-align: left;
  }

  .modal-handle {
    display: block;
    width: 36px; height: 4px; border-radius: 2px;
    background: #e5e7eb;
    margin: 0 auto 16px;
  }

  .confirm-modal p { font-size: 15px; margin-bottom: 20px; }

  .confirm-actions { gap: 10px; }

  .btn-cancel,
  .btn-confirm { height: 50px; font-size: 15px; border-radius: 14px; }
}

.fade-enter-active, .fade-leave-active { transition: opacity 0.2s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>