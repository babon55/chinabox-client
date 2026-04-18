<script setup lang="ts">
const route = useRoute()
const signinStore = useSigninStore()

onMounted(() => {
  const token = route.query.token as string
  const refreshToken = route.query.refresh as string  // ✅ add this

  if (token) {
    // Decode JWT payload to get user info
      const payload = JSON.parse(atob(token.split('.')[1]!))
        const customer = {
          id:      payload.sub,
          name:    payload.name  ?? '',
          email:   payload.email ?? '',
          phone:   payload.phone ?? null,
          address: null,
          status:  'ACTIVE' as const,
        }

    // Save exactly like your normal login does
    localStorage.setItem('customer_access_token', token)
    localStorage.setItem('customer_refresh_token', refreshToken)  // ✅ add this
    localStorage.setItem('customer_user', JSON.stringify(customer))

    // Update store state
    signinStore.accessToken = token
    signinStore.user = customer

    navigateTo('/')
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