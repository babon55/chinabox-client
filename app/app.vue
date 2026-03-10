<template>
  <NuxtLayout>
    <main>
      <UApp>
        <NuxtPage />
      </UApp>
    </main>
  </NuxtLayout>
</template>

<script setup lang="ts">
import { useShortcut } from "vue-shortcut-manager";

useShortcut('shift+u',()=>alert('hello'))
useShortcut('b o',()=>alert('b o'))
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family:
    -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu,
    Cantarell, sans-serif;
  color: #f1f1f1;
  background: #ffffff;
}

main {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  min-height: calc(100vh - 200px);
}

.page-enter-active,
.page-leave-active {
  transition: all 0.4s;
}
.page-enter-from,
.page-leave-to {
  filter: blur(10px);
  transform: translateY(10px) scale(0.7);
  opacity: 0;
}
</style>
