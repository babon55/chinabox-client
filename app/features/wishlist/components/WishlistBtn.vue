<script setup lang="ts">
import { useWishlistStore, type WishlistItem } from '../stores/wishlist.store'

const props = defineProps<{
  item: Omit<WishlistItem, 'addedAt'>
  size?: 'sm' | 'md'
}>()

const store   = useWishlistStore()
const liked   = computed(() => store.has(props.item.id))
const popping = ref(false)

function toggle() {
  store.toggle(props.item)
  if (!liked.value) return
  popping.value = true
  setTimeout(() => popping.value = false, 400)
}
</script>

<template>
  <button
    :class="['wishlist-btn', `size-${size ?? 'md'}`, { liked, popping }]"
    :title="liked ? 'Halananlardan aýyr' : 'Halananlar'"
    @click.prevent.stop="toggle"
  >
    <svg viewBox="0 0 24 24" :fill="liked ? 'currentColor' : 'none'" stroke="currentColor" :stroke-width="liked ? 0 : 2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
    </svg>
  </button>
</template>

<style scoped>
.wishlist-btn {
  display: flex; align-items: center; justify-content: center;
  border-radius: 50%; border: none; cursor: pointer;
  transition: all .2s; flex-shrink: 0;
  background: rgba(255,255,255,.9);
  backdrop-filter: blur(4px);
  color: #9CA3AF;
}
.wishlist-btn:hover { color: #EF4444; background: white; transform: scale(1.1); }
.wishlist-btn.liked { color: #EF4444; background: #FEF2F2; }
.wishlist-btn.popping { animation: pop .4s cubic-bezier(.36,.07,.19,.97); }

@keyframes pop {
  0%   { transform: scale(1); }
  30%  { transform: scale(1.35); }
  60%  { transform: scale(.9); }
  100% { transform: scale(1); }
}

.size-sm { width: 30px; height: 30px; }
.size-sm svg { width: 14px; height: 14px; }
.size-md { width: 36px; height: 36px; }
.size-md svg { width: 17px; height: 17px; }
</style>