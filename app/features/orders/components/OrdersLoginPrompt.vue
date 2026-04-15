<template>
  <div class="login-prompt">
    <div class="lp-icon">🔐</div>
    <h2>{{ locale === 'tk' ? 'Sargytlaryňyzy görmek üçin giriň' : 'Войдите чтобы увидеть свои заказы' }}</h2>
    <p>{{ locale === 'tk' ? 'Hasabyňyz bilen ähli sargytlaryňyz bir ýerde görnüner' : 'Все ваши заказы будут доступны после входа' }}</p>
    <div class="lp-actions">
      <NuxtLink to="/signin" class="btn-gold">{{ $t('auth.signin.loginButton') }}</NuxtLink>
      <NuxtLink to="/signup" class="btn-outline">{{ $t('auth.signup.registerButton') }}</NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
const { locale } = useI18n()
</script>

<style scoped>
.login-prompt {
  background: var(--white); border-radius: var(--radius-xl);
  border: 1.5px solid var(--border-light); padding: 56px 40px;
  text-align: center; box-shadow: var(--shadow-sm);
}
.lp-icon { font-size: 48px; margin-bottom: 16px; }
.login-prompt h2 {
  font-family: var(--font-display); font-size: 22px;
  font-weight: 700; color: var(--dark); margin-bottom: 10px;
}
.login-prompt p { font-size: 14px; color: var(--subtle); margin-bottom: 24px; }
.lp-actions { display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; }
.btn-gold {
  display: inline-flex; align-items: center; height: 44px; padding: 0 24px;
  border-radius: var(--radius-pill); background: var(--gold);
  color: white; font-size: 13px; font-weight: 700; text-decoration: none;
}
.btn-gold:hover { background: var(--gold-dark); }
.btn-outline {
  display: inline-flex; align-items: center; height: 44px; padding: 0 24px;
  border-radius: var(--radius-pill); border: 1.5px solid var(--border);
  background: var(--surface); color: var(--dark);
  font-size: 13px; font-weight: 700; text-decoration: none;
}
.btn-outline:hover { border-color: var(--gold); color: var(--gold); }
</style>