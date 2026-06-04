<template>
  <UApp>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </UApp>
</template>

<script setup lang="ts">
import { useShortcut } from "vue-shortcut-manager"
import { Preferences } from '@capacitor/preferences'

useShortcut('shift+u', () => alert('hello'))
useShortcut('b o', () => alert('b o'))

const signinStore = useSigninStore()

onMounted(async () => {
  signinStore.restore()

  // Handle deep links (Google OAuth callback in native app)
  if (import.meta.client) {
    try {
      const { App } = await import('@capacitor/app')
      App.addListener('appUrlOpen', async (event) => {
        const url = new URL(event.url)
        const token   = url.searchParams.get('token')
        const refresh = url.searchParams.get('refresh')

        if (token && refresh) {
          const payload  = JSON.parse(atob(token.split('.')[1]!))
          const customer = {
            id:      payload.sub,
            name:    payload.name  ?? '',
            email:   payload.email ?? '',
            phone:   null,
            address: null,
            status:  'ACTIVE' as const,
          }

          await Preferences.set({ key: 'customer_access_token',  value: token })
          await Preferences.set({ key: 'customer_refresh_token', value: refresh })
          await Preferences.set({ key: 'customer_user',          value: JSON.stringify(customer) })

          signinStore.accessToken = token
          signinStore.user        = customer

          navigateTo('/')
        }
      })
    } catch {
      // Not running in Capacitor (web), ignore
    }
  }
})
</script>

<style>
*, *::before, *::after {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: var(--font-body, 'Plus Jakarta Sans', sans-serif);
  color: var(--dark, #0F1117);
  background: var(--surface, #F9FAFB);
  -webkit-font-smoothing: antialiased;
}

@media (max-width: 768px) {
  body {
    padding-bottom: calc(64px + env(safe-area-inset-bottom, 0px));
  }
}

.page-enter-active,
.page-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}
.page-enter-from,
.page-leave-to {
  opacity: 0;
  transform: translateY(8px);
}
</style>