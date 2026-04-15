<template>
  <div class="prod-card">

    <NuxtLink :to="`/products/${product.id}`" class="prod-img-wrap">
      <img
        v-if="firstImage"
        :src="firstImage"
        :alt="locale === 'tk' ? product.nameTk : product.nameRu"
        loading="lazy"
        class="prod-img"
      />
      <span v-else class="prod-emoji">{{ product.image }}</span>

      <span v-if="(product.imageUrls?.length ?? 0) > 1" class="multi-img-badge">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="10" height="10">
          <rect x="3" y="3" width="18" height="18" rx="2"/>
          <circle cx="8.5" cy="8.5" r="1.5"/>
          <polyline points="21 15 16 10 5 21"/>
        </svg>
        {{ product.imageUrls!.length }}
      </span>

      <span v-if="product.stock === 0" class="out-badge">{{ $t('product.outOfStock') }}</span>
      <span v-if="product.options?.length" class="opts-badge">{{ $t('product.options') }}</span>

      <WishlistBtn
        :item="{
          id:       product.id,
          nameTk:   product.nameTk,
          nameRu:   product.nameRu,
          image:    product.image,
          imageUrl: firstImage,
          price:    Number(product.price),
          weightG:  product.weightG,
          stock:    product.stock,
          category: product.category,
        }"
        size="sm"
        class="wish-overlay"
      />
    </NuxtLink>

    <div class="prod-body">
      <div class="prod-cat">
        {{ locale === 'tk' ? product.category?.nameTk : product.category?.nameRu }}
      </div>
      <NuxtLink :to="`/products/${product.id}`" class="prod-name">
        {{ locale === 'tk' ? product.nameTk : product.nameRu }}
      </NuxtLink>
      <div class="prod-footer">
        <div class="prod-price-wrap">
          <div class="prod-price">${{ fmt(clientPrice(product.price, product.markup)) }}</div>
          <div v-if="product.weightG" class="prod-weight">{{ product.weightG }}g</div>
        </div>
        <button
          :class="['cart-btn', { added: isAdded }]"
          :disabled="product.stock === 0"
          :title="locale === 'tk' ? 'Sebede goş' : 'В корзину'"
          @click.prevent="emit('cartClick', product)"
        >
          <span v-if="isAdded">✓</span>
          <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="14" height="14">
            <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
            <line x1="3" y1="6" x2="21" y2="6"/>
            <path d="M16 10a4 4 0 0 1-8 0"/>
          </svg>
        </button>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { computed }   from 'vue'
import { useI18n }    from 'vue-i18n'
import WishlistBtn    from '~/features/wishlist/components/WishlistBtn.vue'
import type { Product } from '../types'

const props = defineProps<{
  product: Product
  isAdded: boolean
}>()

const emit = defineEmits<{
  (e: 'cartClick', product: Product): void
}>()

const { locale } = useI18n()

const firstImage = computed(() =>
  props.product.imageUrls?.[0] ?? props.product.imageUrl ?? null
)

function fmt(n: number): string { return Number(n).toFixed(2) }
function clientPrice(price: number, markup = 50): number {
  return Number(price) * (1 + markup / 100)
}
</script>

<style scoped>
.prod-card {
  background: var(--white); border-radius: var(--radius-lg);
  border: 1.5px solid var(--border-light); overflow: hidden;
  box-shadow: var(--shadow-sm); transition: all .2s;
}
.prod-card:hover { box-shadow: 0 12px 32px rgba(0,0,0,.1); transform: translateY(-4px); border-color: rgba(232,160,32,.25); }

.prod-img-wrap {
  display: block; width: 100%; height: 180px;
  background: var(--surface); position: relative;
  overflow: hidden; text-decoration: none;
}
.prod-img { width: 100%; height: 100%; object-fit: cover; transition: transform .35s; }
.prod-card:hover .prod-img { transform: scale(1.06); }
.prod-emoji { font-size: 64px; position: absolute; top: 50%; left: 50%; transform: translate(-50%,-50%); }

/* Badges */
.multi-img-badge {
  position: absolute; bottom: 8px; left: 8px;
  background: rgba(0,0,0,.55); color: white;
  font-size: 10px; font-weight: 700; padding: 3px 7px;
  border-radius: var(--radius-pill);
  display: flex; align-items: center; gap: 3px;
  backdrop-filter: blur(4px);
}
.out-badge {
  position: absolute; top: 8px; left: 8px;
  background: rgba(0,0,0,.65); color: #fff;
  font-size: 10px; font-weight: 700; padding: 2px 8px;
  border-radius: var(--radius-pill); font-family: var(--font-body);
}
.opts-badge {
  position: absolute; bottom: 8px; right: 8px;
  background: rgba(232,160,32,.9); color: white;
  font-size: 10px; font-weight: 700; padding: 2px 8px;
  border-radius: var(--radius-pill); font-family: var(--font-body);
}
.wish-overlay { position: absolute; top: 8px; right: 8px; z-index: 2; }

/* Body */
.prod-body { padding: 12px 14px; }
.prod-cat {
  font-size: 10px; color: var(--subtle); text-transform: uppercase;
  letter-spacing: .05em; margin-bottom: 4px;
  font-family: var(--font-body); font-weight: 700;
}
.prod-name {
  display: block;
  overflow: hidden; font-size: 13px; font-weight: 700;
  color: var(--dark); text-decoration: none;
  line-height: 1.4; margin-bottom: 12px;
  font-family: var(--font-body);
  display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;
}
.prod-name:hover { color: var(--gold); }

.prod-footer { display: flex; align-items: center; justify-content: space-between; }
.prod-price-wrap { display: flex; flex-direction: column; gap: 1px; }
.prod-price  { font-family: var(--font-display); font-size: 17px; font-weight: 800; color: var(--gold); }
.prod-weight { font-size: 10px; color: var(--subtle); font-family: var(--font-body); }

.cart-btn {
  width: 34px; height: 34px; border-radius: 50%;
  border: none; background: var(--dark); color: white;
  cursor: pointer; transition: all .15s;
  display: flex; align-items: center; justify-content: center;
  font-size: 14px; font-weight: 700;
}
.cart-btn.added  { background: #22C55E; }
.cart-btn:disabled { background: var(--border); cursor: not-allowed; }
.cart-btn:hover:not(:disabled):not(.added) { background: var(--gold); transform: scale(1.1); }
</style>