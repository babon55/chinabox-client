<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { useSignIn } from '../composables/useSignIn'
import type { Lang } from '../types'

const config = useRuntimeConfig()
function loginWithGoogle() {
  window.location.href = `http://localhost:3001/auth/google`
}

// prop kept so parent template doesn't need changes
defineProps<{ currentLang?: string }>()
const emit = defineEmits<{ (e: 'success'): void }>()

const { locale } = useI18n()
const lang = computed(() => locale.value as Lang)

const { form, errors, isLoading, t, handleSubmit } = useSignIn(lang)

const showPassword = ref(false)
</script>
<template>
  <div class="form-panel">

    <!-- Header -->
    <div class="form-header">
      <h1 class="form-title">{{ t.title }}</h1>
      <p class="form-subtitle">{{ t.subtitle }}</p>
    </div>

   <!-- Social buttons -->
    <div class="social-row">
      <button class="social-btn google-btn" @click="loginWithGoogle">
        <svg width="18" height="18" viewBox="0 0 48 48">
          <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
          <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
          <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
          <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
        </svg>
        {{ lang === 'tk' ? 'Google bilen giriş' : 'Войти через Google' }}
      </button>
    </div>

    <div class="divider"><span>{{ t.orContinue }}</span></div>

    <!-- General error -->
    <Transition name="fade">
      <div v-if="errors.general" class="general-error">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
        {{ errors.general }}
      </div>
    </Transition>

    <!-- Form -->
    <form class="signin-form" @submit.prevent="handleSubmit(() => emit('success'))" novalidate>

      <!-- Email -->
      <div class="field-group" :class="{ error: errors.email }">
        <label class="field-label">{{ t.email }}</label>
        <div class="field-input-wrap">
          <svg class="field-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
            <polyline points="22,6 12,13 2,6"/>
          </svg>
          <input
            v-model="form.email"
            :placeholder="t.emailPh"
            type="email"
            class="field-input"
            autocomplete="email"
          />
        </div>
        <span v-if="errors.email" class="field-error">{{ errors.email }}</span>
      </div>

      <!-- Password -->
      <div class="field-group" :class="{ error: errors.password }">
        <div class="label-row">
          <label class="field-label">{{ t.password }}</label>
          <NuxtLink to="/auth/forgot-password" class="forgot-link">{{ t.forgotPass }}</NuxtLink>
        </div>
        <div class="field-input-wrap">
          <svg class="field-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
          </svg>
          <input
            v-model="form.password"
            :type="showPassword ? 'text' : 'password'"
            :placeholder="t.passwordPh"
            class="field-input"
            autocomplete="current-password"
          />
          <button type="button" class="eye-btn" @click="showPassword = !showPassword">
            <svg v-if="!showPassword" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
            </svg>
            <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
              <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
              <line x1="1" y1="1" x2="23" y2="23"/>
            </svg>
          </button>
        </div>
        <span v-if="errors.password" class="field-error">{{ errors.password }}</span>
      </div>

      <!-- Remember me -->
      <label class="remember-label">
        <input v-model="form.rememberMe" type="checkbox" class="checkbox-input" />
        <span class="checkbox-custom" />
        <span class="remember-text">{{ t.rememberMe }}</span>
      </label>

      <!-- Submit -->
      <button type="submit" class="submit-btn" :disabled="isLoading">
        <svg v-if="isLoading" class="spin" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
          <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
        </svg>
        <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
          <polyline points="10 17 15 12 10 7"/>
          <line x1="15" y1="12" x2="3" y2="12"/>
        </svg>
        {{ isLoading ? t.loading : t.submit }}
      </button>

      <!-- Sign up link -->
      <p class="signup-link">
        {{ t.noAccount }}
        <NuxtLink to="/signup" class="signup-anchor">{{ t.signUp }}</NuxtLink>
      </p>

    </form>
  </div>
</template>

<style scoped>
.form-panel {
  width: 100%; height: 100%;
  padding: 48px 52px;
  display: flex; flex-direction: column; gap: 24px;
  overflow-y: auto; background: white;
}

.form-title { font-family: 'Playfair Display', serif; font-size: 32px; font-weight: 700; color: #0F1117; margin-bottom: 6px; }
.form-subtitle { font-size: 14px; color: #6B7280; font-family: 'Plus Jakarta Sans', sans-serif; }

.social-row { display: flex; }
.google-btn { 
  flex: 1; 
  display: flex; align-items: center; justify-content: center; gap: 10px;
  padding: 13px 16px; border: 1.5px solid #E5E7EB;
  border-radius: 12px; background: white;
  font-size: 14px; font-weight: 600; color: #374151;
  cursor: pointer; transition: all 0.2s;
  font-family: 'Plus Jakarta Sans', sans-serif;
}
.google-btn:hover { 
  border-color: #4285F4; 
  box-shadow: 0 4px 12px rgba(66,133,244,0.15); 
  transform: translateY(-1px); 
}
.social-btn { flex: 1; display: flex; align-items: center; justify-content: center; gap: 8px; padding: 11px 16px; border: 1.5px solid #E5E7EB; border-radius: 10px; background: white; font-size: 13px; font-weight: 600; color: #374151; cursor: pointer; transition: all 0.2s; font-family: 'Plus Jakarta Sans', sans-serif; }
.social-btn:hover { border-color: #D1D5DB; background: #F9FAFB; transform: translateY(-1px); box-shadow: 0 4px 12px rgba(0,0,0,0.06); }

.divider { display: flex; align-items: center; gap: 12px; color: #9CA3AF; font-size: 12px; font-weight: 500; font-family: 'Plus Jakarta Sans', sans-serif; }
.divider::before, .divider::after { content: ''; flex: 1; height: 1px; background: #E5E7EB; }

/* General error */
.general-error {
  display: flex; align-items: center; gap: 10px;
  background: #FEF2F2; border: 1px solid #FECACA;
  border-radius: 10px; padding: 12px 16px;
  font-size: 13px; font-weight: 500; color: #DC2626;
  font-family: 'Plus Jakarta Sans', sans-serif;
}
.fade-enter-active, .fade-leave-active { transition: all 0.3s; }
.fade-enter-from, .fade-leave-to { opacity: 0; transform: translateY(-6px); }

/* Form */
.signin-form { display: flex; flex-direction: column; gap: 18px; }
.field-group { display: flex; flex-direction: column; gap: 6px; }
.label-row { display: flex; align-items: center; justify-content: space-between; }
.field-label { font-size: 13px; font-weight: 600; color: #374151; font-family: 'Plus Jakarta Sans', sans-serif; }
.forgot-link { font-size: 12px; font-weight: 600; color: #E8A020; text-decoration: none; transition: color 0.2s; font-family: 'Plus Jakarta Sans', sans-serif; }
.forgot-link:hover { color: #FF8C00; text-decoration: underline; }

.field-input-wrap { display: flex; align-items: center; gap: 10px; border: 1.5px solid #E5E7EB; border-radius: 10px; padding: 0 12px; background: #F9FAFB; transition: all 0.2s; }
.field-input-wrap:focus-within { border-color: #E8A020; background: white; box-shadow: 0 0 0 3px rgba(232,160,32,0.1); }
.field-group.error .field-input-wrap { border-color: #EF4444; background: #FFF5F5; }

.field-icon { color: #9CA3AF; flex-shrink: 0; transition: color 0.2s; }
.field-input-wrap:focus-within .field-icon { color: #E8A020; }

.field-input { flex: 1; border: none; background: transparent; outline: none; font-size: 14px; color: #0F1117; padding: 12px 0; font-family: 'Plus Jakarta Sans', sans-serif; }
.field-input::placeholder { color: #9CA3AF; }

.eye-btn { background: none; border: none; color: #9CA3AF; cursor: pointer; padding: 4px; display: flex; align-items: center; transition: color 0.2s; }
.eye-btn:hover { color: #E8A020; }

.field-error { font-size: 12px; color: #EF4444; font-weight: 500; font-family: 'Plus Jakarta Sans', sans-serif; }
.field-error::before { content: '⚠ '; }

/* Remember me */
.remember-label { display: flex; align-items: center; gap: 10px; cursor: pointer; }
.checkbox-input { display: none; }
.checkbox-custom { width: 18px; height: 18px; border: 1.5px solid #D1D5DB; border-radius: 5px; flex-shrink: 0; transition: all 0.2s; position: relative; background: white; }
.checkbox-input:checked + .checkbox-custom { background: #E8A020; border-color: #E8A020; }
.checkbox-input:checked + .checkbox-custom::after { content: ''; position: absolute; top: 2px; left: 5px; width: 5px; height: 9px; border: 2px solid white; border-top: none; border-left: none; transform: rotate(45deg); }
.remember-text { font-size: 13px; color: #6B7280; font-family: 'Plus Jakarta Sans', sans-serif; font-weight: 500; }

/* Submit */
.submit-btn { display: flex; align-items: center; justify-content: center; gap: 10px; width: 100%; padding: 14px; border-radius: 12px; border: none; background: linear-gradient(135deg, #0F1117, #2A2D3A); color: white; font-size: 15px; font-weight: 700; cursor: pointer; transition: all 0.25s; font-family: 'Plus Jakarta Sans', sans-serif; margin-top: 4px; }
.submit-btn:hover:not(:disabled) { background: linear-gradient(135deg, #E8A020, #FF8C00); transform: translateY(-2px); box-shadow: 0 8px 24px rgba(232,160,32,0.35); }
.submit-btn:disabled { opacity: 0.7; cursor: not-allowed; }

@keyframes spin { to { transform: rotate(360deg); } }
.spin { animation: spin 0.8s linear infinite; }

.signup-link { text-align: center; font-size: 13px; color: #6B7280; font-family: 'Plus Jakarta Sans', sans-serif; }
.signup-anchor { color: #E8A020; font-weight: 700; text-decoration: none; margin-left: 4px; }
.signup-anchor:hover { color: #FF8C00; text-decoration: underline; }

@media (max-width: 520px) {
  .form-panel { padding: 32px 24px; }
  .form-title { font-size: 26px; }
}
</style>