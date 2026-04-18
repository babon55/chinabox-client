<template>
  <div class="wish-card">

    <!-- Remove -->
    <button class="remove-btn" :title="$t('wishlist.remove')" @click="emit('remove', item.id)">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
        <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
      </svg>
    </button>

    <!-- Image -->
    <NuxtLink :to="`/products/${item.id}`" class="card-img-wrap">
      <img v-if="item.imageUrl" :src="item.imageUrl" :alt="name" class="card-img" />
      <span v-else class="card-emoji">{{ item.image }}</span>
      <span v-if="item.stock === 0" class="out-badge">{{ $t('product.outOfStock') }}</span>
    </NuxtLink>

    <!-- Body -->
    <div class="card-body">
      <div class="card-cat">{{ locale === 'tk' ? item.category.nameTk : item.category.nameRu }}</div>
      <NuxtLink :to="`/products/${item.id}`" class="card-name">{{ name }}</NuxtLink>
      <div class="card-price">${{ fmt(item.price) }}</div>
      <div class="added-date">🕐 {{ fmtDate(item.addedAt, locale) }}</div>

      <div class="card-actions">
        <button class="cart-btn" :disabled="item.stock === 0" @click="emit('moveToCart', item)">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
            <line x1="3" y1="6" x2="21" y2="6"/>
            <path d="M16 10a4 4 0 0 1-8 0"/>
          </svg>
          {{ item.stock === 0 ? $t('product.outOfStock') : $t('wishlist.addToCart') }}
        </button>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { computed }    from 'vue'
import { useI18n }     from 'vue-i18n'
import type { WishlistItem } from '../stores/wishlist.store'
import { useWishlist } from '../composables/useWishlist'

const props = defineProps<{ item: WishlistItem }>()

const emit = defineEmits<{
  (e: 'remove',     id: string):         void
  (e: 'moveToCart', item: WishlistItem): void
}>()

const { locale }       = useI18n()
const { fmt, fmtDate } = useWishlist()

const name = computed(() =>
  locale.value === 'tk' ? props.item.nameTk : props.item.nameRu
)
</script>

<style scoped>
.wish-card {
  background: var(--white); border-radius: var(--radius-lg);
  border: 1.5px solid var(--border-light); overflow: hidden;
  box-shadow: var(--shadow-sm); transition: all .18s;
  display: flex; flex-direction: column; position: relative;
}
.wish-card:hover { box-shadow: var(--shadow-md); transform: translateY(-3px); border-color: rgba(239,68,68,.2); }

.remove-btn {
  position: absolute; top: 10px; right: 10px; z-index: 10;
  width: 28px; height: 28px; border-radius: 50%;
  border: none; background: rgba(255,255,255,.9);
  backdrop-filter: blur(4px); color: #9ca3af;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; transition: all .15s;
}
.remove-btn svg { width: 12px; height: 12px; }
.remove-btn:hover { background: #ef4444; color: white; }

.card-img-wrap { display: block; width: 100%; aspect-ratio: 1; background: var(--surface); position: relative; overflow: hidden; text-decoration: none; }
.card-img      { width: 100%; height: 100%; object-fit: cover; transition: transform .3s; }
.wish-card:hover .card-img { transform: scale(1.05); }
.card-emoji    { position: absolute; top: 50%; left: 50%; transform: translate(-50%,-50%); font-size: 64px; }
.out-badge     { position: absolute; top: 10px; left: 10px; background: rgba(0,0,0,.65); color: white; font-size: 11px; font-weight: 700; padding: 2px 8px; border-radius: var(--radius-pill); }

.card-body  { padding: 14px 16px; display: flex; flex-direction: column; gap: 6px; flex: 1; }
.card-cat   { font-size: 10px; color: var(--subtle); text-transform: uppercase; letter-spacing: .05em; }
.card-name  { font-size: 14px; font-weight: 700; color: var(--dark); text-decoration: none; line-height: 1.35; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.card-name:hover { color: var(--gold); }
.card-price { font-family: var(--font-display); font-size: 18px; font-weight: 800; color: var(--gold); }
.added-date { font-size: 11px; color: var(--subtle); }

.card-actions { margin-top: auto; padding-top: 8px; }
.cart-btn {
  width: 100%; height: 38px; border-radius: var(--radius-md);
  border: none; background: var(--dark); color: white;
  font-size: 13px; font-weight: 700; cursor: pointer;
  font-family: var(--font-body); transition: all .15s;
  display: flex; align-items: center; justify-content: center; gap: 7px;
}
.cart-btn:hover:not(:disabled) { background: var(--gold); }
.cart-btn:disabled { background: var(--border); color: var(--subtle); cursor: not-allowed; }
</style>