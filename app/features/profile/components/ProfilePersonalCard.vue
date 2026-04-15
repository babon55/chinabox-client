<template>
  <section class="card">
    <h2 class="card-title">Personal Information</h2>

    <form @submit.prevent="handleSubmit">
      <div class="field">
        <label>Full Name</label>
        <input v-model="form.name" type="text" placeholder="Your name" required />
      </div>

      <div class="field">
        <label>Email</label>
        <input v-model="form.email" type="email" placeholder="your@email.com" required />
      </div>

      <div class="field">
        <label>Phone</label>
        <input v-model="form.phone" type="tel" placeholder="+993 …" />
      </div>

      <div class="field">
        <label>Delivery Address</label>
        <textarea v-model="form.address" rows="2" placeholder="Street, city …" />
      </div>

      <button class="btn-primary" :disabled="saving">
        {{ saving ? 'Saving…' : 'Save Changes' }}
      </button>

      <p v-if="feedback" :class="['msg', feedback.type]">{{ feedback.message }}</p>
    </form>
  </section>
</template>

<script setup lang="ts">
import { reactive, ref, watch } from 'vue'
import { useProfileStore }      from '../stores/profile.store'
import { useProfileFeedback }   from '../composables/useProfileFeedback'
import type { CustomerProfile } from '../types'

const props = defineProps<{ profile: CustomerProfile | null }>()

const profileStore     = useProfileStore()
const { feedback, flash } = useProfileFeedback()
const saving           = ref(false)

const form = reactive({ name: '', email: '', phone: '', address: '' })

// Populate form when profile loads
watch(
  () => props.profile,
  (p) => {
    if (!p) return
    form.name    = p.name    ?? ''
    form.email   = p.email   ?? ''
    form.phone   = p.phone   ?? ''
    form.address = p.address ?? ''
  },
  { immediate: true },
)

async function handleSubmit () {
  saving.value = true
  try {
    const result = await profileStore.updateProfile({
      name:    form.name,
      email:   form.email,
      phone:   form.phone   || undefined,
      address: form.address || undefined,
    })

    if (result.conflict) {
      flash('Email is already in use.', 'error')
    } else if (result.ok) {
      flash('Profile updated successfully!', 'success')
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
.field input,
.field textarea {
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  padding: 0.65rem 0.9rem;
  color: #fff;
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 0.95rem;
  transition: border-color 0.2s;
  resize: vertical;
}
.field input:focus,
.field textarea:focus {
  outline: none;
  border-color: #e8a020;
}
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