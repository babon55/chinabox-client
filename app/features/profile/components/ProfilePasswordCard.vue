<template>
  <section class="card">
    <h2 class="card-title">Change Password</h2>

    <form @submit.prevent="handleSubmit">
      <div class="field">
        <label>New Password</label>
        <div class="input-eye">
          <input
            v-model="passwords.new"
            :type="showNew ? 'text' : 'password'"
            placeholder="Min 6 characters"
            required
            minlength="6"
          />
          <button type="button" class="eye-btn" @click="showNew = !showNew">
            <IconEyeOff v-if="showNew" />
            <IconEye v-else />
          </button>
        </div>
      </div>

      <div class="field">
        <label>Confirm Password</label>
        <div class="input-eye">
          <input
            v-model="passwords.confirm"
            :type="showConfirm ? 'text' : 'password'"
            placeholder="Repeat password"
            required
            minlength="6"
          />
          <button type="button" class="eye-btn" @click="showConfirm = !showConfirm">
            <IconEyeOff v-if="showConfirm" />
            <IconEye v-else />
          </button>
        </div>
      </div>

      <button class="btn-primary" :disabled="saving">
        {{ saving ? 'Updating…' : 'Update Password' }}
      </button>

      <p v-if="feedback" :class="['msg', feedback.type]">{{ feedback.message }}</p>
    </form>
  </section>
</template>

<script setup lang="ts">
import { reactive, ref }      from 'vue'
import { useProfileStore }    from '../stores/profile.store'
import { useProfileFeedback } from '../composables/useProfileFeedback'

/* ── Inline icon components (no extra dep) ───────────────────────────────── */
const IconEye = {
  template: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" stroke-width="2" width="18" height="18">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>`,
}
const IconEyeOff = {
  template: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" stroke-width="2" width="18" height="18">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94
             M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19
             m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
    <line x1="1" y1="1" x2="23" y2="23"/>
  </svg>`,
}

const profileStore        = useProfileStore()
const { feedback, flash } = useProfileFeedback()
const saving              = ref(false)
const showNew             = ref(false)
const showConfirm         = ref(false)
const passwords           = reactive({ new: '', confirm: '' })

async function handleSubmit () {
  if (passwords.new !== passwords.confirm) {
    flash('Passwords do not match.', 'error')
    return
  }

  saving.value = true
  try {
    const result = await profileStore.updatePassword({ password: passwords.new })
    if (result.ok) {
      passwords.new     = ''
      passwords.confirm = ''
      flash('Password changed successfully!', 'success')
    } else {
      flash('Something went wrong. Try again.', 'error')
    }
  } finally {
    saving.value = false
  }
}
</script>

<style scoped>
.card {
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  padding: 1.75rem;
}
.card-title {
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 1.05rem;
  font-weight: 600;
  color: #fff;
  margin-bottom: 1.5rem;
}
.field {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 1.1rem;
}
.field label {
  font-size: 0.8rem;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.5);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
.field input {
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  padding: 0.65rem 0.9rem;
  color: #fff;
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 0.95rem;
  transition: border-color 0.2s;
  width: 100%;
  box-sizing: border-box;
}
.field input:focus {
  outline: none;
  border-color: #e8a020;
}
.input-eye {
  position: relative;
}
.input-eye input {
  padding-right: 2.8rem;
}
.eye-btn {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  color: rgba(255, 255, 255, 0.4);
  display: flex;
  align-items: center;
  padding: 0;
}
.eye-btn:hover { color: #e8a020; }
.btn-primary {
  width: 100%;
  padding: 0.75rem;
  background: #e8a020;
  color: #0f1117;
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-weight: 700;
  font-size: 0.95rem;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  transition: opacity 0.2s, transform 0.15s;
  margin-top: 0.5rem;
}
.btn-primary:hover:not(:disabled) { opacity: 0.9; transform: translateY(-1px); }
.btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }
.msg {
  margin-top: 0.75rem;
  font-size: 0.88rem;
  font-weight: 500;
  text-align: center;
}
.msg.success { color: #4ade80; }
.msg.error   { color: #f87171; }
</style>