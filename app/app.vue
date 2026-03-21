<template>
  <UApp>         <!-- ← move UApp outside -->
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </UApp>
</template>

<script setup lang="ts">
import { useShortcut } from "vue-shortcut-manager";
useShortcut('shift+u', () => alert('hello'))
useShortcut('b o', () => alert('b o'))
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