<script setup lang="ts">
import type { Lang } from '../types'
import { useSignIn } from '../composables/useSignIn'

const props = defineProps<{ currentLang: Lang }>()
const emit  = defineEmits<{ (e: 'success'): void }>()

const lang = computed(() => props.currentLang)

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
      <button class="social-btn">
        <svg width="18" height="18" viewBox="0 0 24 24">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
        </svg>
        Google
      </button>
      <button class="social-btn">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="#1877F2">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
        </svg>
        Facebook
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

.social-row { display: flex; gap: 12px; }
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