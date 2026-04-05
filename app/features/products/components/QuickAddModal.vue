<script setup lang="ts">
import ProductOptionsSelector from './ProductOptionsSelector.vue'
import type { ProductOption, SelectedOptions } from '../types/product'
import type { Category } from '../types/product'

// ── Public types ──────────────────────────────────────────────────────────────

export interface QuickAddProduct {
  id:       string
  nameTk:   string
  nameRu:   string
  image:    string
  imageUrl?: string | null
  price:    number
  weightG?: number | null
  stock:    number
  options:  ProductOption[]
  category: Category
}

// ── Props / emits ─────────────────────────────────────────────────────────────

const props = defineProps<{
  product: QuickAddProduct | null
  lang:    'tk' | 'ru'
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'add', productId: string, options: SelectedOptions): void
}>()

// ── State ─────────────────────────────────────────────────────────────────────

const selectedOptions = ref<SelectedOptions>({})
const selectorRef     = ref<InstanceType<typeof ProductOptionsSelector> | null>(null)

// Reset when product changes
watch(() => props.product, () => {
  selectedOptions.value = {}
})

// ── Computed ──────────────────────────────────────────────────────────────────

/**
 * Uses isValid() — a pure, side-effect-free check — so this computed
 * never accidentally triggers error UI while Vue evaluates it reactively.
 */
const canSubmit = computed<boolean>(() => {
  if (!props.product) return false
  return selectorRef.value?.isValid() ?? false
})

// ── Actions ───────────────────────────────────────────────────────────────────

function submit() {
  if (!props.product) return

  // validate() shows inline errors when invalid — only call on user action
  if (selectorRef.value && !selectorRef.value.validate()) return

  emit('add', props.product.id, { ...selectedOptions.value })
  emit('close')
}

function fmt(n: number) { return Number(n).toFixed(2) }
</script>

<template>
  <Teleport to="body">
    <Transition name="quick-modal">
      <div v-if="product" class="overlay" @click.self="emit('close')">
        <div class="modal" role="dialog" aria-modal="true">

          <!-- Header -->
          <div class="modal-head">
            <div class="prod-info">
              <div class="prod-thumb">
                <img v-if="product.imageUrl" :src="product.imageUrl" :alt="lang === 'tk' ? product.nameTk : product.nameRu" class="thumb-img" />
                <span v-else class="thumb-emoji">{{ product.image }}</span>
              </div>
              <div class="prod-text">
                <div class="prod-name">{{ lang === 'tk' ? product.nameTk : product.nameRu }}</div>
                <div class="prod-price">${{ fmt(product.price) }}</div>
              </div>
            </div>
            <button class="close-btn" :aria-label="lang === 'tk' ? 'Ýap' : 'Закрыть'" @click="emit('close')">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <line x1="18" y1="6"  x2="6"  y2="18" />
                <line x1="6"  y1="6"  x2="18" y2="18" />
              </svg>
            </button>
          </div>

          <!-- Options body -->
          <div class="modal-body">
            <p class="section-label">
              {{ lang === 'tk' ? 'Saýlawyňyzy ediň' : 'Выберите параметры' }}
            </p>
            <ProductOptionsSelector
              ref="selectorRef"
              v-model="selectedOptions"
              :options="product.options"
              :lang="lang"
            />
          </div>

          <!-- Footer -->
          <div class="modal-foot">
            <button class="cancel-btn" @click="emit('close')">
              {{ lang === 'tk' ? 'Ýatyr' : 'Отмена' }}
            </button>
            <button
              class="add-btn"
              :disabled="product.stock === 0 || !canSubmit"
              @click="submit"
            >
              🛒 {{ lang === 'tk' ? 'Sebede Goş' : 'В корзину' }}
            </button>
          </div>

        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
/* Overlay */
.overlay {
  position: fixed; inset: 0; z-index: 600;
  background: rgba(15, 17, 23, 0.55);
  backdrop-filter: blur(4px);
  display: flex; align-items: flex-end; justify-content: center;
  padding: 20px;
}

@media (min-width: 540px) {
  .overlay { align-items: center; }
}

/* Modal */
.modal {
  background: var(--white);
  border-radius: var(--radius-xl);
  width: 100%; max-width: 440px;
  box-shadow: 0 24px 64px rgba(0,0,0,.25);
  display: flex; flex-direction: column;
  overflow: hidden;
}

/* Head */
.modal-head {
  display: flex; align-items: center; justify-content: space-between;
  padding: 16px 18px;
  border-bottom: 1px solid var(--border-light);
  gap: 12px;
}
.prod-info {
  display: flex; align-items: center; gap: 12px; min-width: 0;
}
.prod-thumb {
  width: 48px; height: 48px; border-radius: var(--radius-md);
  background: var(--surface); border: 1.5px solid var(--border-light);
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0; overflow: hidden;
}
.thumb-img   { width: 100%; height: 100%; object-fit: cover; }
.thumb-emoji { font-size: 24px; }
.prod-text   { min-width: 0; }
.prod-name   {
  font-size: 14px; font-weight: 700; color: var(--dark);
  font-family: var(--font-body);
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  max-width: 220px;
}
.prod-price  {
  font-family: var(--font-display); font-size: 16px;
  font-weight: 800; color: var(--gold); margin-top: 2px;
}

/* Close button */
.close-btn {
  width: 30px; height: 30px; border-radius: var(--radius-md);
  border: 1.5px solid var(--border); background: var(--surface);
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; color: var(--muted); transition: all .15s;
  flex-shrink: 0;
}
.close-btn svg { width: 14px; height: 14px; }
.close-btn:hover { border-color: var(--error); color: var(--error); background: var(--error-bg); }

/* Body */
.modal-body {
  padding: 20px 18px;
  display: flex; flex-direction: column; gap: 12px;
}
.section-label {
  font-size: 11px; font-weight: 700; text-transform: uppercase;
  letter-spacing: .06em; color: var(--subtle);
  font-family: var(--font-body); margin: 0;
}

/* Footer */
.modal-foot {
  display: flex; gap: 10px; justify-content: flex-end;
  padding: 14px 18px;
  border-top: 1px solid var(--border-light);
}
.cancel-btn {
  height: 40px; padding: 0 18px; border-radius: var(--radius-md);
  border: 1.5px solid var(--border); background: var(--surface);
  font-size: 13px; font-weight: 600; color: var(--muted);
  cursor: pointer; font-family: var(--font-body); transition: all .15s;
}
.cancel-btn:hover { border-color: var(--dark); color: var(--dark); }
.add-btn {
  height: 40px; padding: 0 22px; border-radius: var(--radius-md);
  border: none;
  background: linear-gradient(135deg, var(--gold), var(--gold-dark));
  font-size: 13px; font-weight: 800; color: white;
  cursor: pointer; font-family: var(--font-body);
  transition: all .15s; box-shadow: 0 4px 12px var(--gold-shadow);
}
.add-btn:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 6px 16px var(--gold-shadow); }
.add-btn:disabled { background: var(--border); box-shadow: none; cursor: not-allowed; color: var(--subtle); }

/* Transition */
.quick-modal-enter-active,
.quick-modal-leave-active { transition: opacity .2s ease; }
.quick-modal-enter-active .modal,
.quick-modal-leave-active .modal { transition: opacity .2s ease, transform .22s ease; }
.quick-modal-enter-from,
.quick-modal-leave-to { opacity: 0; }
.quick-modal-enter-from .modal,
.quick-modal-leave-to .modal { transform: translateY(18px); opacity: 0; }
</style>