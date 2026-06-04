<script setup lang="ts">
import { Preferences } from '@capacitor/preferences'

const route = useRoute()
const signinStore = useSigninStore()

onMounted(async () => {
  const token        = route.query.token as string
  const refreshToken = route.query.refresh as string

  if (token) {
    const payload = JSON.parse(atob(token.split('.')[1]!))
    const customer = {
      id:      payload.sub,
      name:    payload.name  ?? '',
      email:   payload.email ?? '',
      phone:   payload.phone ?? null,
      address: null,
      status:  'ACTIVE' as const,
    }

    await Preferences.set({ key: 'customer_access_token',  value: token })
    await Preferences.set({ key: 'customer_refresh_token', value: refreshToken })
    await Preferences.set({ key: 'customer_user',          value: JSON.stringify(customer) })

    signinStore.accessToken = token
    signinStore.user = customer

    // Always try deep link — opens app if installed, fallback to web after 1.5s
    window.location.href = `chinaexpress://auth/google/success?token=${token}&refresh=${refreshToken}`
    setTimeout(() => { navigateTo('/') }, 1500)
  } else {
    navigateTo('/signin?error=google_failed')
  }
})
</script>

<template>
  <div style="display:flex; align-items:center; justify-content:center; height:100vh; background:#0F1117; color:white; font-family:'Plus Jakarta Sans', sans-serif;">
    <div style="text-align:center">
      <div style="font-size:32px; margin-bottom:12px">⏳</div>
      <p>Signing you in...</p>
    </div>
  </div>
</template>