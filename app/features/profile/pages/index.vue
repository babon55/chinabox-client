<template>
  <div class="profile-page">
    <div class="profile-container">

      <div v-if="profileStore.loading" class="profile-loading">
        <div class="spinner" />
      </div>

      <div v-else-if="profileStore.error" class="profile-error">
        <p>{{ profileStore.error }}</p>
        <button class="btn-retry" @click="profileStore.fetchProfile">Try again</button>
      </div>

      <template v-else>
        <ProfileHeroCard
          :profile="profileStore.profile"
          :cart-count="cartCount"
          @logout="handleLogout"
        />

        <h2 class="section-title">{{ $t('profile.editDetails') }}</h2>

        <div class="profile-grid">
          <ProfilePersonalCard :profile="profileStore.profile" />
          <ProfilePasswordCard />
        </div>
      </template>

    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, computed }   from 'vue'
import { useRouter }             from 'vue-router'
import { useProfileStore }       from '../stores/profile.store'
import { useSigninStore }        from '~/features/signin/stores/signin.store'
import ProfileHeroCard           from '../components/ProfileHeroCard.vue'
import ProfilePersonalCard       from '../components/ProfilePersonalCard.vue'
import ProfilePasswordCard       from '../components/ProfilePasswordCard.vue'

definePageMeta({ middleware: 'customer-auth' })

const signinStore  = useSigninStore()
const profileStore = useProfileStore()

const cartCount = computed(() => 0)

onMounted(async () => {
  await signinStore.restore()
  await profileStore.fetchProfile()
})

function handleLogout() {
  signinStore.logout()
}
</script>

<style scoped>
.profile-page {
  min-height: 100vh;
  background: #0f1117;
  padding: 2rem 1rem 4rem;
}
.profile-container {
  max-width: 860px;
  margin: 0 auto;
}
.section-title {
  font-family: 'Playfair Display', serif;
  font-size: 1.3rem;
  color: rgba(255,255,255,0.4);
  font-weight: 400;
  margin-bottom: 1.25rem;
  letter-spacing: 0.01em;
}
.profile-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
}
@media (max-width: 768px) {
  .profile-grid { grid-template-columns: 1fr; }
}
.profile-loading { display: flex; justify-content: center; padding: 4rem; }
.spinner {
  width: 40px; height: 40px;
  border: 3px solid rgba(232, 160, 32, 0.2);
  border-top-color: #e8a020;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }
.profile-error { text-align: center; color: #f87171; padding: 3rem; }
.btn-retry {
  margin-top: 1rem; padding: 0.5rem 1.5rem;
  background: transparent; border: 1px solid #e8a020;
  color: #e8a020; border-radius: 8px; cursor: pointer;
  font-family: 'Plus Jakarta Sans', sans-serif;
}
.btn-retry:hover { background: rgba(232, 160, 32, 0.1); }
</style>