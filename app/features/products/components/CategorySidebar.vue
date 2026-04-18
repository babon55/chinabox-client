<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import type { Category } from '../types'

const props = defineProps<{
  categories: Category[]
  categoryId: string
}>()

const emit = defineEmits<{
  (e: 'select', id: string): void
}>()

const { locale } = useI18n()

// ── Flyout state ──────────────────────────────────────────────────────────────
const flyoutCat = ref<Category | null>(null)
const flyoutPos = ref({ top: 0, left: 0 })
let closeTimer: ReturnType<typeof setTimeout> | null = null

function onParentEnter(e: MouseEvent, cat: Category) {
  if (closeTimer) clearTimeout(closeTimer)

  if (!cat.children?.length) {
    closeTimer = setTimeout(() => { flyoutCat.value = null }, 80)
    return
  }

  const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
  flyoutPos.value = {
    top:  rect.top,
    left: rect.right + 12,
  }
  flyoutCat.value = cat
}

function onParentLeave() {
  closeTimer = setTimeout(() => { flyoutCat.value = null }, 140)
}

function onFlyoutEnter() {
  if (closeTimer) clearTimeout(closeTimer)
}

function onFlyoutLeave() {
  closeTimer = setTimeout(() => { flyoutCat.value = null }, 140)
}

function name(c: Category) {
  return locale.value === 'tk' ? c.nameTk : c.nameRu
}

function isActive(id: string) {
  return props.categoryId === id
}

function isParentActive(cat: Category) {
  return isActive(cat.id) || (cat.children?.some(c => isActive(c.id)) ?? false)
}

function select(id: string) {
  flyoutCat.value = null
  emit('select', id)
}
</script>

<template>
  <div class="cat-sidebar">

    <!-- All -->
    <button :class="['cat-item', { active: !categoryId }]" @click="select('')">
      <span class="cat-icon">🏠</span>
      <span class="cat-name">{{ locale === 'tk' ? 'Hemmesi' : 'Все' }}</span>
    </button>

    <div class="cat-divider" />

    <!-- Root categories -->
    <div
      v-for="cat in categories"
      :key="cat.id"
      class="cat-row"
      @mouseenter="onParentEnter($event, cat)"
      @mouseleave="onParentLeave"
    >
      <button
        :class="['cat-item', { active: isParentActive(cat) }]"
        @click="select(cat.id)"
      >
        <span class="cat-name">{{ name(cat) }}</span>
        <svg
          v-if="cat.children?.length"
          class="cat-chevron"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </button>

      <!-- Active subcategory hint -->
      <div
        v-if="isParentActive(cat) && cat.children?.some(c => isActive(c.id))"
        class="active-sub-hint"
      >
        {{ name(cat.children!.find(c => isActive(c.id))!) }}
      </div>
    </div>

  </div>

  <!-- Flyout -->
  <Teleport to="body">
    <Transition name="flyout">
      <div
        v-if="flyoutCat"
        class="cat-flyout"
        :style="{ top: flyoutPos.top + 'px', left: flyoutPos.left + 'px' }"
        @mouseenter="onFlyoutEnter"
        @mouseleave="onFlyoutLeave"
      >
        <!-- Header -->
        <div class="flyout-head">
          <div class="flyout-head-left">
            <span class="flyout-title">{{ name(flyoutCat) }}</span>
            <span class="flyout-count">
              {{ flyoutCat.children?.length }}
              {{ locale === 'tk' ? 'bölek' : 'раздела' }}
            </span>
          </div>
          <button class="flyout-see-all" @click="select(flyoutCat!.id)">
            {{ locale === 'tk' ? 'Hemmesini gör' : 'Смотреть все' }}
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="12" height="12">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </div>

        <!-- Subcategory chips -->
        <div class="flyout-body">
          <button
            v-for="child in flyoutCat.children"
            :key="child.id"
            :class="['flyout-chip', { active: isActive(child.id) }]"
            @click="select(child.id)"
          >
            <span class="chip-dot" />
            {{ name(child) }}
          </button>
        </div>

        <!-- Footer -->
        <div class="flyout-foot">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="12" height="12">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          {{ locale === 'tk' ? 'Bölümi saýla' : 'Выберите подраздел' }}
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.cat-sidebar {
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.cat-divider {
  height: 1px;
  background: var(--border-light);
  margin: 6px 0;
}

.cat-row { position: relative; }

.cat-item {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 9px 10px;
  border-radius: var(--radius-md);
  border: none;
  background: transparent;
  font-size: 13px;
  font-weight: 600;
  color: var(--muted);
  cursor: pointer;
  font-family: var(--font-body);
  transition: all .15s;
  text-align: left;
}
.cat-item:hover,
.cat-row:hover .cat-item {
  background: var(--surface);
  color: var(--dark);
}
.cat-item.active {
  background: rgba(232, 160, 32, .1);
  color: var(--gold);
  font-weight: 700;
}

.cat-icon { font-size: 14px; flex-shrink: 0; }
.cat-name { flex: 1; }

.cat-chevron {
  width: 13px;
  height: 13px;
  flex-shrink: 0;
  color: var(--border);
  transition: transform .2s ease, color .15s;
}
.cat-row:hover .cat-chevron {
  color: var(--gold);
  transform: translateX(2px);
}
.cat-item.active .cat-chevron { color: var(--gold); }

.active-sub-hint {
  font-size: 11px;
  color: var(--gold);
  font-weight: 600;
  padding: 0 10px 6px 10px;
  font-family: var(--font-body);
  opacity: .8;
}

/* ── Flyout ── */
.cat-flyout {
  position: fixed;
  z-index: 9000;
  background: var(--white);
  border-radius: var(--radius-xl);
  border: 1.5px solid var(--border-light);
  box-shadow: 0 20px 56px rgba(0,0,0,.16), 0 4px 16px rgba(0,0,0,.06);
  width: 296px;
  overflow: hidden;
  pointer-events: auto;
}

/* Arrow pointing left */
.cat-flyout::before {
  content: '';
  position: absolute;
  left: -7px;
  top: 20px;
  width: 12px;
  height: 12px;
  background: var(--white);
  border-left: 1.5px solid var(--border-light);
  border-bottom: 1.5px solid var(--border-light);
  transform: rotate(45deg);
}

.flyout-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px 12px;
  background: linear-gradient(135deg, var(--surface), #FEFDF8);
  border-bottom: 1px solid var(--border-light);
}
.flyout-head-left {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.flyout-title {
  font-family: var(--font-display);
  font-size: 15px;
  font-weight: 800;
  color: var(--dark);
  line-height: 1.2;
}
.flyout-count {
  font-size: 11px;
  color: var(--subtle);
  font-family: var(--font-body);
}

.flyout-see-all {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  height: 30px;
  padding: 0 12px;
  border-radius: var(--radius-pill);
  border: 1.5px solid rgba(232,160,32,.3);
  background: rgba(232,160,32,.07);
  color: var(--gold);
  font-size: 11px;
  font-weight: 700;
  cursor: pointer;
  font-family: var(--font-body);
  transition: all .15s;
  white-space: nowrap;
  flex-shrink: 0;
}
.flyout-see-all:hover {
  background: rgba(232,160,32,.15);
  border-color: var(--gold);
}

.flyout-body {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 14px 16px 12px;
}

.flyout-chip {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  height: 34px;
  padding: 0 14px;
  border-radius: var(--radius-pill);
  border: 1.5px solid var(--border);
  background: var(--white);
  font-size: 12px;
  font-weight: 600;
  color: var(--dark);
  cursor: pointer;
  font-family: var(--font-body);
  transition: all .15s;
}
.flyout-chip:hover {
  border-color: var(--gold);
  color: var(--gold);
  background: rgba(232,160,32,.06);
  transform: translateY(-1px);
  box-shadow: 0 3px 10px rgba(232,160,32,.15);
}
.flyout-chip.active {
  border-color: var(--gold);
  background: rgba(232,160,32,.12);
  color: var(--gold);
  font-weight: 700;
}

.chip-dot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: currentColor;
  opacity: .5;
  flex-shrink: 0;
}

.flyout-foot {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px 10px;
  border-top: 1px solid var(--border-light);
  background: var(--surface);
  font-size: 11px;
  color: var(--subtle);
  font-family: var(--font-body);
}

/* Transition */
.flyout-enter-active { transition: opacity .18s ease, transform .18s ease; }
.flyout-leave-active { transition: opacity .13s ease, transform .13s ease; }
.flyout-enter-from   { opacity: 0; transform: translateX(-10px) scale(.97); }
.flyout-leave-to     { opacity: 0; transform: translateX(-6px) scale(.98); }
</style>