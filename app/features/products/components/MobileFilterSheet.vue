<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import type { Category } from '../types'

const { locale } = useI18n()

const props = defineProps<{
  categories:  Category[]
  categoryId:  string
  sortBy:      string
  total:       number
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'apply', payload: { categoryId: string; sortBy: string }): void
}>()

// ── Local state (uncommitted until Apply) ──
const localCategory = ref(props.categoryId)
const localSort     = ref(props.sortBy)
const expandedCat   = ref<string | null>(null)

const sortOptions = [
  { value: 'random',     labelTk: 'Tötänleýin',       labelRu: 'Случайно'          },
  { value: 'newest',     labelTk: 'Täzeler',            labelRu: 'Новинки'           },
  { value: 'popular',    labelTk: 'Meşhurlar',          labelRu: 'Популярные'        },
  { value: 'price_asc',  labelTk: 'Bahasy: az → köp',  labelRu: 'Цена: по возрастанию' },
  { value: 'price_desc', labelTk: 'Bahasy: köp → az',  labelRu: 'Цена: по убыванию'    },
]

const rootCategories = computed(() => props.categories.filter(c => !c.parentId))

function name(c: Category) {
  return locale.value === 'tk' ? c.nameTk : c.nameRu
}

function toggleCat(id: string) {
  expandedCat.value = expandedCat.value === id ? null : id
}

function selectCategory(id: string) {
  localCategory.value = id
}

function apply() {
  emit('apply', { categoryId: localCategory.value, sortBy: localSort.value })
  emit('close')
}

function reset() {
  localCategory.value = ''
  localSort.value     = 'random'
}

function onBackdrop(e: MouseEvent) {
  if ((e.target as HTMLElement).classList.contains('sheet-backdrop')) emit('close')
}

// ── Swipe to close ──
const dragY    = ref(0)
const dragging = ref(false)
let startY = 0

function onTouchStart(e: TouchEvent) {
  const t = e.touches[0]; if (!t) return
  startY = t.clientY; dragging.value = true
}
function onTouchMove(e: TouchEvent) {
  if (!dragging.value) return
  const t = e.touches[0]; if (!t) return
  const dy = t.clientY - startY
  if (dy > 0) dragY.value = dy
}
function onTouchEnd() {
  dragging.value = false
  if (dragY.value > 80) emit('close')
  dragY.value = 0
}

const hasChanges = computed(() =>
  localCategory.value !== props.categoryId || localSort.value !== props.sortBy
)

const activeSortLabel = computed(() => {
  const opt = sortOptions.find(o => o.value === localSort.value)
  return opt ? (locale.value === 'tk' ? opt.labelTk : opt.labelRu) : ''
})
</script>

<template>
  <Teleport to="body">
    <div class="sheet-backdrop" @click="onBackdrop">
      <div
        class="sheet"
        :style="{
          transform:  `translateY(${dragY}px)`,
          transition: dragging ? 'none' : 'transform 0.38s cubic-bezier(0.16,1,0.3,1)'
        }"
        @touchstart="onTouchStart"
        @touchmove.passive="onTouchMove"
        @touchend="onTouchEnd"
      >
        <!-- Handle -->
        <div class="handle-row">
          <div class="handle" />
        </div>

        <!-- Header -->
        <div class="sheet-header">
          <div class="header-left">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="4" y1="6"  x2="20" y2="6"/>
              <line x1="8" y1="12" x2="20" y2="12"/>
              <line x1="12" y1="18" x2="20" y2="18"/>
            </svg>
            <span class="header-title">{{ locale === 'tk' ? 'Süzgüç & Tertip' : 'Фильтр и сортировка' }}</span>
          </div>
          <button class="reset-btn" :disabled="!hasChanges" @click="reset">
            {{ locale === 'tk' ? 'Arassala' : 'Сбросить' }}
          </button>
        </div>

        <!-- Scrollable body -->
        <div class="sheet-scroll">

          <!-- ── SORT SECTION ── -->
          <div class="section">
            <div class="section-label">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M3 6h18M7 12h10M11 18h2"/>
              </svg>
              {{ locale === 'tk' ? 'Tertipleşdiriş' : 'Сортировка' }}
            </div>
            <div class="sort-list">
              <button
                v-for="opt in sortOptions"
                :key="opt.value"
                :class="['sort-row', { active: localSort === opt.value }]"
                @click="localSort = opt.value"
              >
                <span class="sort-name">{{ locale === 'tk' ? opt.labelTk : opt.labelRu }}</span>
                <div class="sort-check">
                  <svg v-if="localSort === opt.value" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                </div>
              </button>
            </div>
          </div>

          <!-- ── CATEGORY SECTION ── -->
          <div class="section section--last">
            <div class="section-label">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
              </svg>
              {{ locale === 'tk' ? 'Kategoriýa' : 'Категория' }}
            </div>

            <div class="cat-list">
              <!-- All -->
              <button
                :class="['cat-row', { active: localCategory === '' }]"
                @click="selectCategory('')"
              >
                <div class="cat-left">
                  <div :class="['cat-icon', { 'cat-icon--gold': localCategory === '' }]">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <rect x="3" y="3" width="7" height="7" rx="1"/>
                      <rect x="14" y="3" width="7" height="7" rx="1"/>
                      <rect x="14" y="14" width="7" height="7" rx="1"/>
                      <rect x="3" y="14" width="7" height="7" rx="1"/>
                    </svg>
                  </div>
                  <span class="cat-name">{{ locale === 'tk' ? 'Hemmesi' : 'Все товары' }}</span>
                </div>
                <div class="cat-check">
                  <svg v-if="localCategory === ''" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                  <svg v-else width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
                    <polyline points="9 18 15 12 9 6"/>
                  </svg>
                </div>
              </button>

              <!-- Root categories -->
              <div v-for="cat in rootCategories" :key="cat.id" class="cat-group">
                <button
                  :class="['cat-row', {
                    active: localCategory === cat.id,
                    expanded: expandedCat === cat.id,
                    'parent-active': cat.children?.some(c => c.id === localCategory)
                  }]"
                  @click="cat.children?.length ? toggleCat(cat.id) : selectCategory(cat.id)"
                >
                  <div class="cat-left">
                    <div :class="['cat-icon', {
                      'cat-icon--gold': localCategory === cat.id || cat.children?.some(c => c.id === localCategory)
                    }]">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
                      </svg>
                    </div>
                    <span class="cat-name" :class="{ 'cat-name--gold': localCategory === cat.id || cat.children?.some(c => c.id === localCategory) }">
                      {{ name(cat) }}
                    </span>
                    <span v-if="cat.children?.length" class="cat-count">{{ cat.children.length }}</span>
                  </div>
                  <div class="cat-check">
                    <svg v-if="localCategory === cat.id" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                    <svg
                      v-else-if="cat.children?.length"
                      :class="['chevron', { 'chevron--open': expandedCat === cat.id }]"
                      width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"
                    >
                      <polyline points="9 18 15 12 9 6"/>
                    </svg>
                    <svg v-else width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
                      <polyline points="9 18 15 12 9 6"/>
                    </svg>
                  </div>
                </button>

                <!-- Subcategories -->
                <Transition name="sub">
                  <div v-if="expandedCat === cat.id && cat.children?.length" class="sub-list">
                    <!-- See all in parent -->
                    <button
                      :class="['sub-row', 'sub-row--all', { active: localCategory === cat.id }]"
                      @click="selectCategory(cat.id)"
                    >
                      <span class="sub-connector">┌</span>
                      <span class="sub-name sub-name--gold">{{ locale === 'tk' ? 'Hemmesini gör' : 'Смотреть все' }}</span>
                      <div class="cat-check">
                        <svg v-if="localCategory === cat.id" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#E8A020" stroke-width="3" stroke-linecap="round">
                          <polyline points="20 6 9 17 4 12"/>
                        </svg>
                      </div>
                    </button>
                    <button
                      v-for="(child, idx) in cat.children"
                      :key="child.id"
                      :class="['sub-row', { active: localCategory === child.id }]"
                      @click="selectCategory(child.id)"
                    >
                      <span class="sub-connector">{{ idx === cat.children!.length - 1 ? '└' : '├' }}</span>
                      <span class="sub-name" :class="{ 'sub-name--active': localCategory === child.id }">
                        {{ name(child) }}
                      </span>
                      <div class="cat-check">
                        <svg v-if="localCategory === child.id" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#E8A020" stroke-width="3" stroke-linecap="round">
                          <polyline points="20 6 9 17 4 12"/>
                        </svg>
                      </div>
                    </button>
                  </div>
                </Transition>
              </div>
            </div>
          </div>

        </div>

        <!-- Apply footer -->
        <div class="sheet-footer">
          <div class="footer-info">
            <span v-if="total > 0" class="footer-count">{{ total }} {{ locale === 'tk' ? 'haryt' : 'товаров' }}</span>
          </div>
          <button class="apply-btn" @click="apply">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
            {{ locale === 'tk' ? 'Ulanmak' : 'Применить' }}
          </button>
        </div>

      </div>
    </div>
  </Teleport>
</template>

<style scoped>
/* ── Backdrop ── */
.sheet-backdrop {
  position: fixed; inset: 0; z-index: 700;
  background: rgba(0,0,0,0.6);
  display: flex; align-items: flex-end;
  animation: fade-in 0.2s ease;
}
@keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }

/* ── Sheet ── */
.sheet {
  width: 100%;
  background: #111520;
  border-radius: 24px 24px 0 0;
  max-height: 90dvh;
  display: flex; flex-direction: column;
  animation: slide-up 0.38s cubic-bezier(0.16,1,0.3,1);
  will-change: transform;
}
@keyframes slide-up { from { transform: translateY(100%); } to { transform: translateY(0); } }

/* ── Handle ── */
.handle-row {
  display: flex; justify-content: center;
  padding: 12px 0 4px; flex-shrink: 0; cursor: grab;
}
.handle {
  width: 36px; height: 4px; border-radius: 99px;
  background: rgba(255,255,255,.12);
}

/* ── Header ── */
.sheet-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 10px 20px 14px; flex-shrink: 0;
  border-bottom: 1px solid rgba(255,255,255,.06);
}
.header-left {
  display: flex; align-items: center; gap: 10px;
}
.header-left svg { stroke: #E8A020; }
.header-title {
  font-size: 15px; font-weight: 700; color: white;
  font-family: 'Plus Jakarta Sans', sans-serif;
}
.reset-btn {
  background: rgba(255,255,255,.06);
  border: 1px solid rgba(255,255,255,.1);
  border-radius: 8px; padding: 6px 14px;
  color: rgba(255,255,255,.5); font-size: 12px; font-weight: 700;
  cursor: pointer; font-family: 'Plus Jakarta Sans', sans-serif;
  transition: all 0.2s;
}
.reset-btn:not(:disabled):hover { border-color: #E8A020; color: #E8A020; }
.reset-btn:disabled { opacity: 0.35; cursor: not-allowed; }

/* ── Scroll body ── */
.sheet-scroll {
  overflow-y: auto; overflow-x: hidden;
  overscroll-behavior: contain;
  flex: 1;
}

/* ── Sections ── */
.section {
  padding: 20px 20px 0;
  border-bottom: 1px solid rgba(255,255,255,.05);
  padding-bottom: 8px;
}
.section--last { border-bottom: none; }

.section-label {
  display: flex; align-items: center; gap: 7px;
  font-size: 10px; font-weight: 700;
  color: rgba(255,255,255,.25);
  text-transform: uppercase; letter-spacing: .1em;
  font-family: 'Plus Jakarta Sans', sans-serif;
  margin-bottom: 12px;
}
.section-label svg { stroke: rgba(255,255,255,.25); flex-shrink: 0; }

/* ── Sort ── */
.sort-list { display: flex; flex-direction: column; gap: 2px; margin-bottom: 12px; }

.sort-row {
  display: flex; align-items: center; justify-content: space-between;
  padding: 13px 14px; border-radius: 12px;
  background: rgba(255,255,255,.03);
  border: 1px solid transparent;
  cursor: pointer; transition: all .15s;
  -webkit-tap-highlight-color: transparent;
}
.sort-row:active { background: rgba(232,160,32,.08); }
.sort-row.active {
  background: rgba(232,160,32,.12);
  border-color: rgba(232,160,32,.25);
}
.sort-name {
  font-size: 13px; font-weight: 600;
  color: rgba(255,255,255,.6);
  font-family: 'Plus Jakarta Sans', sans-serif;
}
.sort-row.active .sort-name { color: #E8A020; font-weight: 700; }

.sort-check {
  width: 22px; height: 22px; border-radius: 50%;
  background: rgba(255,255,255,.06);
  border: 1.5px solid rgba(255,255,255,.1);
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0; transition: all .15s;
}
.sort-row.active .sort-check {
  background: #E8A020;
  border-color: #E8A020;
}
.sort-row.active .sort-check svg { stroke: white; }

/* ── Category list ── */
.cat-list { display: flex; flex-direction: column; gap: 2px; margin-bottom: 12px; }
.cat-group { display: flex; flex-direction: column; }

.cat-row {
  display: flex; align-items: center; justify-content: space-between;
  padding: 12px 14px; border-radius: 12px;
  background: rgba(255,255,255,.03);
  border: 1px solid transparent;
  cursor: pointer; transition: all .15s;
  -webkit-tap-highlight-color: transparent; gap: 10px;
}
.cat-row:active { background: rgba(232,160,32,.08); }
.cat-row.active,
.cat-row.parent-active {
  background: rgba(232,160,32,.1);
  border-color: rgba(232,160,32,.2);
}

.cat-left { display: flex; align-items: center; gap: 10px; flex: 1; min-width: 0; }

.cat-icon {
  width: 30px; height: 30px; border-radius: 8px; flex-shrink: 0;
  background: rgba(255,255,255,.06);
  border: 1px solid rgba(255,255,255,.08);
  display: flex; align-items: center; justify-content: center;
  transition: all .15s;
}
.cat-icon svg { stroke: rgba(255,255,255,.4); }
.cat-icon--gold { background: rgba(232,160,32,.15); border-color: rgba(232,160,32,.25); }
.cat-icon--gold svg { stroke: #E8A020; }

.cat-name {
  font-size: 13px; font-weight: 600;
  color: rgba(255,255,255,.65);
  font-family: 'Plus Jakarta Sans', sans-serif;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  transition: color .15s;
}
.cat-name--gold { color: #E8A020; font-weight: 700; }

.cat-count {
  font-size: 10px; font-weight: 700;
  color: rgba(255,255,255,.3);
  background: rgba(255,255,255,.07);
  padding: 1px 7px; border-radius: 50px; flex-shrink: 0;
  font-family: 'Plus Jakarta Sans', sans-serif;
}
.cat-row.active .cat-count,
.cat-row.parent-active .cat-count { background: rgba(232,160,32,.15); color: #E8A020; }

.cat-check {
  width: 22px; height: 22px; border-radius: 50%;
  background: rgba(255,255,255,.06);
  border: 1.5px solid rgba(255,255,255,.1);
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0; transition: all .15s;
}
.cat-row.active .cat-check { background: #E8A020; border-color: #E8A020; }
.cat-row.active .cat-check svg { stroke: white; }

.chevron { stroke: rgba(255,255,255,.2); transition: transform .25s ease; }
.chevron--open { transform: rotate(90deg); }

/* ── Subcategories ── */
.sub-list {
  display: flex; flex-direction: column;
  margin: 2px 0 2px 16px;
  background: rgba(0,0,0,.15);
  border-radius: 10px; overflow: hidden;
}
.sub-row {
  display: flex; align-items: center; gap: 8px;
  padding: 11px 12px;
  background: none; border: none;
  border-bottom: 1px solid rgba(255,255,255,.03);
  cursor: pointer; transition: background .15s;
  -webkit-tap-highlight-color: transparent;
}
.sub-row:last-child { border-bottom: none; }
.sub-row:active { background: rgba(232,160,32,.07); }
.sub-row--all { background: rgba(232,160,32,.04); }

.sub-connector {
  font-size: 12px; color: rgba(255,255,255,.15);
  flex-shrink: 0; width: 14px; font-family: monospace;
}
.sub-name {
  font-size: 13px; font-weight: 600;
  color: rgba(255,255,255,.45);
  font-family: 'Plus Jakarta Sans', sans-serif;
  flex: 1; text-align: left;
  transition: color .15s;
}
.sub-name--gold  { color: #E8A020; }
.sub-name--active { color: #E8A020; font-weight: 700; }

.sub-enter-active { transition: all .22s ease; }
.sub-leave-active { transition: all .18s ease; }
.sub-enter-from { opacity: 0; transform: translateY(-6px); }
.sub-leave-to   { opacity: 0; transform: translateY(-4px); }

/* ── Footer ── */
.sheet-footer {
  display: flex; align-items: center; justify-content: space-between;
  padding: 14px 20px calc(14px + env(safe-area-inset-bottom, 0px));
  border-top: 1px solid rgba(255,255,255,.07);
  flex-shrink: 0; gap: 14px;
  background: #111520;
}
.footer-info { flex: 1; }
.footer-count {
  font-size: 13px; font-weight: 600;
  color: rgba(255,255,255,.35);
  font-family: 'Plus Jakarta Sans', sans-serif;
}
.apply-btn {
  display: inline-flex; align-items: center; gap: 8px;
  height: 48px; padding: 0 28px; border-radius: 14px; border: none;
  background: linear-gradient(135deg, #E8A020, #FF8C00);
  color: white; font-size: 14px; font-weight: 800;
  cursor: pointer; font-family: 'Plus Jakarta Sans', sans-serif;
  transition: all .15s;
  box-shadow: 0 4px 16px rgba(232,160,32,.3);
  flex-shrink: 0;
}
.apply-btn:active { transform: scale(0.97); }
</style>