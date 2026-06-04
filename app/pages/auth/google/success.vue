<script setup lang="ts">
import { Preferences } from '@capacitor/preferences'
import { Capacitor } from '@capacitor/core'

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

    // If running in native app, redirect via deep link to bring focus back to app
    if (Capacitor.isNativePlatform()) {
      window.location.href = `tm.chinaexpress.app://auth/google/success?token=${token}&refresh=${refreshToken}`
    } else {
      navigateTo('/')
    }
  } else {
    navigateTo('/signin?error=google_failed')
  }
})
</script>