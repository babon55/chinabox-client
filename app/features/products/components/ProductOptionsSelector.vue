<script setup lang="ts">
import type { ProductOption, SelectedOptions } from '../types/product'

const props = defineProps<{
  modelValue: SelectedOptions
  options:    ProductOption[]
  lang:       'tk' | 'ru'
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', v: SelectedOptions): void
}>()

// ── Helpers ───────────────────────────────────────────────────────────────────

function optName(opt: ProductOption): string {
  return props.lang === 'tk' ? opt.nameTk : opt.nameRu
}

function select(optId: string, val: string) {
  emit('update:modelValue', { ...props.modelValue, [optId]: val })
}

// ── Validation ────────────────────────────────────────────────────────────────

const showErrors = ref(false)

/**
 * Pure check — no side effects, safe to call from computed properties.
 */
function isValid(): boolean {
  return props.options
    .filter(o => o.required !== false)
    .every(o => !!props.modelValue[o.id])
}

/**
 * Validates and shows inline error messages when invalid.
 * Call this from user-triggered actions (e.g. button click), not from computed.
 */
function validate(): boolean {
  const valid = isValid()
  if (!valid) {
    showErrors.value = true
    setTimeout(() => { showErrors.value = false }, 3000)
  }
  return valid
}

defineExpose({ validate, isValid })

// ── Color helpers ─────────────────────────────────────────────────────────────

const COLOR_NAMES: Record<string, Record<string, string>> = {
  '#000000': { tk: 'Gara',    ru: 'Чёрный'      },
  '#FFFFFF': { tk: 'Ak',      ru: 'Белый'        },
  '#EF4444': { tk: 'Gyzyl',   ru: 'Красный'      },
  '#3B82F6': { tk: 'Gök',     ru: 'Синий'        },
  '#22C55E': { tk: 'Ýaşyl',   ru: 'Зелёный'      },
  '#F59E0B': { tk: 'Sary',    ru: 'Жёлтый'       },
  '#8B5CF6': { tk: 'Melewşe', ru: 'Фиолетовый'   },
  '#EC4899': { tk: 'Pembe',   ru: 'Розовый'       },
  '#6B7280': { tk: 'Çal',     ru: 'Серый'         },
  '#92400E': { tk: 'Goňur',   ru: 'Коричневый'    },
}

function colorName(hex: string): string {
  return COLOR_NAMES[hex]?.[props.lang] ?? hex
}

function isColorValue(val: string): boolean {
  return /^#[0-9A-Fa-f]{6}$/.test(val)
}

function isColorOption(opt: ProductOption): boolean {
  return (
    opt.type === 'color' ||
    (opt.values.length > 0 && opt.values.every(v => isColorValue(v)))
  )
}

// ── Computed ──────────────────────────────────────────────────────────────────

const missingRequired = computed(() =>
  props.options
    .filter(o => o.required !== false && !props.modelValue[o.id])
    .map(o => optName(o))
)
</script>

<template>
  <div v-if="options.length" class="opts-selector">

    <div v-for="opt in options" :key="opt.id" class="opt-group">

      <!-- Label row -->
      <div class="opt-label-row">
        <span class="opt-label">{{ optName(opt) }}</span>

        <!-- Selected value display -->
        <span v-if="modelValue[opt.id] && isColorOption(opt)" class="opt-sel-color">
          <span class="sel-dot" :style="{ background: modelValue[opt.id] }" />
          {{ colorName(modelValue[opt.id]) }}
        </span>
        <span v-else-if="modelValue[opt.id]" class="opt-selected">
          {{ modelValue[opt.id] }}{{ opt.unit ? ' ' + opt.unit : '' }}
        </span>

        <!-- Required hint when errors shown -->
        <span v-else-if="showErrors && opt.required !== false" class="opt-required">
          {{ lang === 'tk' ? 'saýlaň' : 'выберите' }}
        </span>
      </div>

      <!-- Color picker -->
      <div v-if="isColorOption(opt)" class="color-row">
        <button
          v-for="val in opt.values"
          :key="val"
          :class="['color-btn', { active: modelValue[opt.id] === val }]"
          :style="{
            background:    val,
            border:        val === '#FFFFFF' ? '1.5px solid #E5E7EB' : 'none',
            outline:       modelValue[opt.id] === val
                             ? `3px solid ${val === '#FFFFFF' ? '#9CA3AF' : val}`
                             : 'none',
            outlineOffset: '2px',
          }"
          :title="colorName(val)"
          @click="select(opt.id, val)"
        >
          <svg
            v-if="modelValue[opt.id] === val"
            viewBox="0 0 24 24"
            fill="none"
            :stroke="val === '#FFFFFF' || val === '#F59E0B' ? '#374151' : 'white'"
            stroke-width="3.5"
            width="14"
            height="14"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </button>
      </div>

      <!-- Size / select picker -->
      <div v-else-if="opt.type !== 'number' && opt.type !== 'text'" class="size-row">
        <button
          v-for="val in opt.values"
          :key="val"
          :class="['size-btn', { active: modelValue[opt.id] === val }]"
          @click="select(opt.id, val)"
        >
          {{ val }}{{ opt.unit ? ' ' + opt.unit : '' }}
        </button>
      </div>

      <!-- Number input -->
      <div v-else-if="opt.type === 'number'" class="number-wrap">
        <input
          type="number"
          class="number-input"
          :value="modelValue[opt.id] ?? ''"
          :placeholder="lang === 'tk' ? 'Giriziň...' : 'Введите...'"
          @input="select(opt.id, ($event.target as HTMLInputElement).value)"
        />
        <span v-if="opt.unit" class="number-unit">{{ opt.unit }}</span>
      </div>

      <!-- Text input -->
      <div v-else class="number-wrap">
        <input
          type="text"
          class="number-input"
          :value="modelValue[opt.id] ?? ''"
          :placeholder="lang === 'tk' ? 'Giriziň...' : 'Введите...'"
          @input="select(opt.id, ($event.target as HTMLInputElement).value)"
        />
      </div>

    </div>

    <!-- Validation error banner -->
    <Transition name="err">
      <div v-if="showErrors && missingRequired.length" class="val-error">
        ⚠ {{ lang === 'tk' ? 'Saýlaň:' : 'Выберите:' }} {{ missingRequired.join(', ') }}
      </div>
    </Transition>

  </div>
</template>

<style scoped>
.opts-selector { display: flex; flex-direction: column; gap: 16px; }

/* Option group */
.opt-group { display: flex; flex-direction: column; gap: 8px; }

/* Label row */
.opt-label-row  { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.opt-label      { font-size: 13px; font-weight: 700; color: var(--dark); font-family: var(--font-body); }
.opt-selected   {
  font-size: 12px; color: var(--gold); font-weight: 700;
  background: rgba(232,160,32,.1); padding: 1px 8px;
  border-radius: var(--radius-pill); border: 1px solid rgba(232,160,32,.3);
}
.opt-required   { font-size: 11px; color: var(--error); font-weight: 600; }
.opt-sel-color  { display: flex; align-items: center; gap: 5px; font-size: 12px; font-weight: 600; color: var(--subtle); }
.sel-dot        { width: 14px; height: 14px; border-radius: 50%; border: 1px solid rgba(0,0,0,.1); flex-shrink: 0; }

/* Size buttons */
.size-row { display: flex; flex-wrap: wrap; gap: 6px; }
.size-btn {
  min-width: 44px; height: 40px; padding: 0 14px;
  border-radius: var(--radius-md);
  border: 1.5px solid var(--border);
  background: var(--white); color: var(--dark);
  font-size: 13px; font-weight: 600;
  cursor: pointer; font-family: var(--font-body);
  transition: all .15s;
}
.size-btn:hover  { border-color: var(--gold); color: var(--gold); background: rgba(232,160,32,.05); }
.size-btn.active { border-color: var(--dark); background: var(--dark); color: white; font-weight: 700; }

/* Color buttons */
.color-row { display: flex; flex-wrap: wrap; gap: 10px; }
.color-btn {
  width: 38px; height: 38px; border-radius: 50%;
  cursor: pointer; transition: all .15s;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
.color-btn:hover  { transform: scale(1.12); }
.color-btn.active { transform: scale(1.08); }

/* Number / text input */
.number-wrap  { display: flex; align-items: center; gap: 8px; }
.number-input {
  height: 40px; border: 1.5px solid var(--border);
  border-radius: var(--radius-md); padding: 0 12px;
  font-size: 14px; font-family: var(--font-body);
  color: var(--dark); background: var(--white); outline: none;
  width: 140px; transition: border-color .15s;
}
.number-input:focus { border-color: var(--gold); }
.number-unit { font-size: 13px; font-weight: 600; color: var(--subtle); }

/* Validation error */
.val-error {
  background: var(--error-bg); color: var(--error);
  border-radius: var(--radius-md); padding: 10px 14px;
  font-size: 12px; font-weight: 600;
  border: 1.5px solid rgba(239,68,68,.2);
  animation: shake .3s ease;
}

@keyframes shake {
  0%,100% { transform: translateX(0); }
  25%      { transform: translateX(-5px); }
  75%      { transform: translateX(5px); }
}

.err-enter-active, .err-leave-active { transition: opacity .2s; }
.err-enter-from,  .err-leave-to      { opacity: 0; }
</style>