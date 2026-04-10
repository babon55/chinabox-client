<script setup lang="ts">
import { ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

export interface ProductOption {
  id:     string
  label:  string
  type:   'size' | 'color' | 'text'
  values: string[]
}

const props = defineProps<{
  options: ProductOption[]
}>()

const emit = defineEmits<{
  (e: 'update:selected', v: Record<string, string>): void
  (e: 'valid', v: boolean): void
}>()

const { locale } = useI18n()

const selected = ref<Record<string, string>>({})

// Emit whenever selection changes
watch(selected, (val) => {
  emit('update:selected', { ...val })
  const allSelected = props.options.every(o => val[o.id])
  emit('valid', allSelected)
}, { deep: true })

// Validate on options change
watch(() => props.options, () => {
  selected.value = {}
  emit('valid', props.options.length === 0)
}, { immediate: true })

function select(optId: string, val: string) {
  selected.value = { ...selected.value, [optId]: val }
}

// Color name lookup
const COLOR_NAMES: Record<string, Record<string, string>> = {
  '#000000': { tk: 'Gara',      ru: 'Чёрный'     },
  '#FFFFFF': { tk: 'Ak',        ru: 'Белый'       },
  '#EF4444': { tk: 'Gyzyl',     ru: 'Красный'     },
  '#3B82F6': { tk: 'Gök',       ru: 'Синий'       },
  '#22C55E': { tk: 'Ýaşyl',     ru: 'Зелёный'     },
  '#F59E0B': { tk: 'Sary',      ru: 'Жёлтый'      },
  '#8B5CF6': { tk: 'Melewşe',   ru: 'Фиолетовый'  },
  '#EC4899': { tk: 'Pembe',     ru: 'Розовый'      },
  '#6B7280': { tk: 'Çal',       ru: 'Серый'        },
  '#92400E': { tk: 'Goňur',     ru: 'Коричневый'   },
}
function colorName(hex: string) {
  return COLOR_NAMES[hex]?.[locale.value] ?? hex
}

const missingRequired = computed(() =>
  props.options.filter(o => !selected.value[o.id]).map(o => o.label)
)
</script>

<template>
  <div v-if="options.length" class="variant-picker">

    <div v-for="opt in options" :key="opt.id" class="opt-group">

      <!-- Label + selected value -->
      <div class="opt-label-row">
        <span class="opt-label">{{ opt.label }}</span>
        <span v-if="selected[opt.id]" class="opt-selected">
          <template v-if="opt.type === 'color'">
            <span class="sel-color-dot" :style="{ background: selected[opt.id] }" />
            {{ colorName(selected[opt.id]) }}
          </template>
          <template v-else>{{ selected[opt.id] }}</template>
        </span>
        <span v-else class="opt-required">{{ $t('productOptions.selectOption') }}</span>
      </div>

      <!-- SIZE / TEXT picker -->
      <div v-if="opt.type !== 'color'" class="size-row">
        <button
          v-for="val in opt.values" :key="val"
          :class="['size-btn', { active: selected[opt.id] === val }]"
          @click="select(opt.id, val)"
        >{{ val }}</button>
      </div>

      <!-- COLOR picker -->
      <div v-else class="color-row">
        <button
          v-for="val in opt.values" :key="val"
          :class="['color-btn', { active: selected[opt.id] === val }]"
          :style="{ background: val, border: val === '#FFFFFF' ? '1.5px solid #E5E7EB' : 'none' }"
          :title="colorName(val)"
          @click="select(opt.id, val)"
        >
          <svg v-if="selected[opt.id] === val" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3.5" width="14" height="14"><polyline points="20 6 9 17 4 12"/></svg>
        </button>
      </div>

    </div>

    <!-- Validation hint -->
    <div v-if="missingRequired.length" class="variant-hint">
      ⚠ {{ $t('productOptions.required') }} {{ missingRequired.join(', ') }}
    </div>

  </div>
</template>

<style scoped>
.variant-picker { display: flex; flex-direction: column; gap: 14px; }

.opt-group { display: flex; flex-direction: column; gap: 8px; }

.opt-label-row { display: flex; align-items: center; gap: 8px; }
.opt-label    { font-size: 13px; font-weight: 700; color: var(--dark); font-family: var(--font-body); }
.opt-selected { font-size: 12px; color: var(--gold); font-weight: 600; display: flex; align-items: center; gap: 5px; }
.opt-required { font-size: 11px; color: var(--error); font-weight: 600; }

/* Size / text buttons */
.size-row { display: flex; flex-wrap: wrap; gap: 6px; }
.size-btn {
  min-width: 40px; height: 38px; padding: 0 12px;
  border-radius: var(--radius-md);
  border: 1.5px solid var(--border);
  background: var(--white); color: var(--dark);
  font-size: 13px; font-weight: 600;
  cursor: pointer; font-family: var(--font-body);
  transition: all .15s;
}
.size-btn:hover  { border-color: var(--gold); color: var(--gold); }
.size-btn.active { border-color: var(--dark); background: var(--dark); color: white; }

/* Color buttons */
.color-row { display: flex; flex-wrap: wrap; gap: 8px; }
.color-btn {
  width: 36px; height: 36px; border-radius: 50%;
  cursor: pointer; transition: all .15s;
  display: flex; align-items: center; justify-content: center;
  position: relative;
}
.color-btn:hover  { transform: scale(1.15); }
.color-btn.active { box-shadow: 0 0 0 3px var(--white), 0 0 0 5px var(--dark); transform: scale(1.1); }

/* Selection color dot */
.sel-color-dot { width: 12px; height: 12px; border-radius: 50%; border: 1px solid var(--border-light); flex-shrink: 0; }

/* Hint */
.variant-hint { font-size: 12px; color: var(--error); font-weight: 600; background: var(--error-bg); border-radius: var(--radius-md); padding: 8px 12px; }
</style>