<template>
  <div class="profile-page">
    <div class="profile-container">
      <h1 class="profile-title">My Profile</h1>

      <!-- Loading skeleton -->
      <div v-if="profileStore.loading" class="profile-loading">
        <div class="spinner" />
      </div>

      <!-- Error state -->
      <div v-else-if="profileStore.error" class="profile-error">
        <p>{{ profileStore.error }}</p>
        <button class="btn-retry" @click="profileStore.fetchProfile">Try again</button>
      </div>

      <!-- Cards -->
      <div v-else class="profile-grid">
        <ProfilePersonalCard :profile="profileStore.profile" />
        <ProfilePasswordCard />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted }            from 'vue'
import { useProfileStore }      from '../stores/profile.store'
import ProfilePersonalCard      from '../components/ProfilePersonalCard.vue'
import ProfilePasswordCard      from '../components/ProfilePasswordCard.vue'

definePageMeta({ middleware: 'customer-auth' })

const profileStore = useProfileStore()

onMounted(() => profileStore.fetchProfile())
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
.profile-title {
  font-family: 'Playfair Display', serif;
  font-size: 2rem;
  color: #e8a020;
  margin-bottom: 2rem;
}
.profile-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
}
@media (max-width: 768px) {
  .profile-grid { grid-template-columns: 1fr; }
}

/* Loading */
.profile-loading {
  display: flex;
  justify-content: center;
  padding: 4rem;
}
.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid rgba(232, 160, 32, 0.2);
  border-top-color: #e8a020;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

/* Error */
.profile-error {
  text-align: center;
  color: #f87171;
  padding: 3rem;
}
.btn-retry {
  margin-top: 1rem;
  padding: 0.5rem 1.5rem;
  background: transparent;
  border: 1px solid #e8a020;
  color: #e8a020;
  border-radius: 8px;
  cursor: pointer;
  font-family: 'Plus Jakarta Sans', sans-serif;
}
.btn-retry:hover { background: rgba(232, 160, 32, 0.1); }
</style>