<script setup lang="ts">
definePageMeta({ layout: 'default' })

const lang = ref<'tk' | 'ru'>('tk')
onMounted(() => {
  const saved = localStorage.getItem('silkshop_lang')
  if (saved === 'tk' || saved === 'ru') lang.value = saved
})

const config   = useRuntimeConfig()
const API      = config.public.apiBase
const input    = ref('')
const loading  = ref(false)
const error    = ref('')
const order    = ref<any>(null)
const focused  = ref(false)

// ── FIX 1: get URL safely on client only ──────────────────────────────────────
const copied = ref(false)
function copyLink() {
  if (!import.meta.client) return
  const url = window.location.href
  navigator.clipboard?.writeText(url).then(() => {
    copied.value = true
    setTimeout(() => copied.value = false, 2000)
  })
}

// Pre-fill from URL query ?id=xxx
const route = useRoute()
onMounted(() => {
  if (route.query.id) {
    input.value = route.query.id as string
    track()
  }
})

async function track() {
  const id = input.value.trim()
  if (!id) {
    error.value = lang.value === 'tk' ? 'Sargyt ID giriziň' : 'Введите ID заказа'
    return
  }
  loading.value = true
  error.value   = ''
  order.value   = null
  try {
    order.value = await $fetch(`${API}/orders/track/${id}`)
  } catch (e: any) {
    // ── FIX 2: show more specific error if available ────────────────────────
    const msg = e?.data?.message ?? e?.message
    error.value = msg
      ? msg
      : lang.value === 'tk'
        ? 'Sargyt tapylmady. ID-ni barlaň.'
        : 'Заказ не найден. Проверьте ID.'
  } finally {
    loading.value = false
  }
}

const STATUS_STEPS = ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED']

const STATUS_LABELS: Record<string, Record<string, string>> = {
  PENDING:    { tk: 'Garaşylýar',  ru: 'Ожидание'    },
  PROCESSING: { tk: 'Işlenilýär',  ru: 'В работе'    },
  SHIPPED:    { tk: 'Ugradyldy',   ru: 'Отправлен'   },
  DELIVERED:  { tk: 'Gowşuryldy', ru: 'Доставлен'   },
  CANCELLED:  { tk: 'Ýatyryldy',  ru: 'Отменён'     },
}

const STATUS_COLORS: Record<string, string> = {
  PENDING:    '#F59E0B',
  PROCESSING: '#3B82F6',
  SHIPPED:    '#8B5CF6',
  DELIVERED:  '#22C55E',
  CANCELLED:  '#EF4444',
}

const STATUS_ICONS: Record<string, string> = {
  PENDING:    '⏳',
  PROCESSING: '⚙️',
  SHIPPED:    '🚚',
  DELIVERED:  '✅',
  CANCELLED:  '❌',
}

function stepIndex(status: string) { return STATUS_STEPS.indexOf(status) }
function fmt(n: number | string)   { return Number(n).toFixed(2) }
function fmtDate(d: string) {
  return new Date(d).toLocaleDateString(lang.value === 'tk' ? 'tk-TM' : 'ru-RU', {
    day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit',
  })
}

// ── FIX 3: safe product name — handles null/deleted products ─────────────────
function productName(line: any): string {
  if (!line.product) return lang.value === 'tk' ? 'Önüm' : 'Товар'
  return lang.value === 'tk'
    ? (line.product.nameTk ?? line.product.nameRu ?? 'Önüm')
    : (line.product.nameRu ?? line.product.nameTk ?? 'Товар')
}

function productImage(line: any): string {
  return line.product?.image ?? '📦'
}

// ── FIX 4: safe total — fallback to summing lines if order.total missing ──────
const orderTotal = computed(() => {
  if (!order.value) return 0
  if (order.value.total != null) return Number(order.value.total)
  // Fallback: sum lines
  return (order.value.lines ?? []).reduce(
    (s: number, l: any) => s + Number(l.unitPrice ?? 0) * (l.qty ?? 1), 0
  )
})

useHead({ title: computed(() => lang.value === 'tk' ? 'Sargyt Yzarla – SilkShop' : 'Отследить заказ – SilkShop') })
</script>

<template>
  <div class="track-page">

    <!-- Breadcrumb -->
    <div class="bc-bar">
      <div class="bc-inner">
        <NuxtLink to="/">{{ lang === 'tk' ? 'Baş sahypa' : 'Главная' }}</NuxtLink>
        <span>›</span>
        <span>{{ lang === 'tk' ? 'Sargyt Yzarla' : 'Отследить заказ' }}</span>
      </div>
    </div>

    <div class="page-inner">

      <!-- Hero -->
      <div class="track-hero">
        <div class="hero-icon">🚚</div>
        <h1>{{ lang === 'tk' ? 'Sargydyňyzy Yzarlaň' : 'Отследите ваш заказ' }}</h1>
        <p>{{ lang === 'tk'
          ? 'Sargyt ID-ni giriziň we ýagdaýyny derhal biliň'
          : 'Введите ID заказа и узнайте его статус' }}</p>
      </div>

      <!-- Search box -->
      <div class="search-card">
        <!-- FIX 5: focused state uses ref, not hardcoded true -->
        <div class="search-box" :class="{ focused }">
          <svg class="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M20 7H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z"/>
            <path d="M16 3H8a2 2 0 0 0-2 2v2h12V5a2 2 0 0 0-2-2z"/>
          </svg>
          <input
            v-model="input"
            class="search-input"
            :placeholder="lang === 'tk' ? 'Sargyt ID giriziň...' : 'Введите ID заказа...'"
            @focus="focused = true"
            @blur="focused = false"
            @keydown.enter="track"
          />
          <button class="track-btn" :disabled="loading" @click="track">
            <svg v-if="loading" class="spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
            </svg>
            <span v-else>{{ lang === 'tk' ? 'Yzarla' : 'Найти' }}</span>
          </button>
        </div>
        <p v-if="error" class="search-error">⚠ {{ error }}</p>
        <p class="search-hint">
          {{ lang === 'tk'
            ? '💡 Sargyt ID-ni e-poçtaňyzda ýa-da sargyt tassyklamasynda tapyp bilersiňiz'
            : '💡 ID заказа можно найти в письме подтверждения или в разделе «Мои заказы»' }}
        </p>
      </div>

      <!-- Result -->
      <Transition name="slide-up">
        <div v-if="order" class="result-card">

          <!-- Order header -->
          <div class="order-header">
            <div class="order-id-wrap">
              <span class="order-label">{{ lang === 'tk' ? 'Sargyt' : 'Заказ' }}</span>
              <span class="order-id">#{{ order.id.slice(-10).toUpperCase() }}</span>
            </div>
            <div class="order-status-wrap">
              <span class="status-icon">{{ STATUS_ICONS[order.status] ?? '📦' }}</span>
              <span
                class="status-badge"
                :style="{
                  background: (STATUS_COLORS[order.status] ?? '#6B7280') + '18',
                  color:      STATUS_COLORS[order.status] ?? '#6B7280',
                  border:    `1.5px solid ${(STATUS_COLORS[order.status] ?? '#6B7280')}30`,
                }"
              >{{ STATUS_LABELS[order.status]?.[lang] ?? order.status }}</span>
            </div>
          </div>

          <div class="order-date">
            🗓 {{ lang === 'tk' ? 'Sargyt edildi' : 'Заказ оформлен' }}: {{ fmtDate(order.createdAt) }}
          </div>

          <!-- Progress tracker -->
          <div v-if="order.status !== 'CANCELLED'" class="progress-section">
            <h3 class="progress-title">{{ lang === 'tk' ? 'Sargyt ýoly' : 'Путь заказа' }}</h3>
            <div class="progress-track">
              <div v-for="(step, i) in STATUS_STEPS" :key="step" class="progress-step">
                <div class="step-connector">
                  <div
                    class="step-dot"
                    :class="{
                      done:    i < stepIndex(order.status),
                      current: i === stepIndex(order.status),
                      pending: i > stepIndex(order.status),
                    }"
                    :style="i <= stepIndex(order.status)
                      ? { background: STATUS_COLORS[order.status], borderColor: STATUS_COLORS[order.status] }
                      : {}"
                  >
                    <svg v-if="i < stepIndex(order.status)" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                    <div v-else-if="i === stepIndex(order.status)" class="pulse-dot" />
                  </div>
                  <div
                    v-if="i < STATUS_STEPS.length - 1"
                    class="step-line"
                    :style="i < stepIndex(order.status) ? { background: STATUS_COLORS[order.status] } : {}"
                  />
                </div>
                <div
                  class="step-label"
                  :class="{ active: i === stepIndex(order.status) }"
                  :style="i === stepIndex(order.status)
                    ? { color: STATUS_COLORS[order.status], fontWeight: '700' }
                    : {}"
                >{{ STATUS_LABELS[step]?.[lang] }}</div>
              </div>
            </div>
          </div>

          <div v-else class="cancelled-box">
            ❌ {{ lang === 'tk' ? 'Bu sargyt ýatyryldy' : 'Этот заказ был отменён' }}
          </div>

          <!-- Order items -->
          <div class="items-section">
            <h3 class="items-title">{{ lang === 'tk' ? 'Sargyt düzümi' : 'Состав заказа' }}</h3>
            <div class="items-list">
              <!-- FIX 6: safe key, safe product access -->
              <div v-for="(line, idx) in (order.lines ?? [])" :key="line.id ?? idx" class="item-row">
                <div class="item-thumb">
                  <span class="item-emoji">{{ productImage(line) }}</span>
                </div>
                <div class="item-info">
                  <div class="item-name">{{ productName(line) }}</div>
                  <div class="item-qty">× {{ line.qty }}</div>
                  <!-- FIX 7: show selected options if present -->
                  <div v-if="line.options && Object.keys(line.options).length" class="item-opts">
                    <span v-for="(val, key) in line.options" :key="key" class="opt-chip">
                      {{ val }}
                    </span>
                  </div>
                </div>
                <div class="item-price">${{ fmt(Number(line.unitPrice) * line.qty) }}</div>
              </div>
            </div>
            <div class="order-total">
              <span>{{ lang === 'tk' ? 'Jemi' : 'Итого' }}</span>
              <!-- FIX 4: use safe computed total -->
              <strong>${{ fmt(orderTotal) }}</strong>
            </div>
          </div>

          <!-- Note -->
          <div v-if="order.note" class="order-note">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
            {{ order.note }}
          </div>

          <!-- FIX 1: share button uses safe client-only function -->
          <div class="share-row">
            <button class="share-btn" @click="copyLink">
              {{ copied
                ? (lang === 'tk' ? '✓ Göçürildi!' : '✓ Скопировано!')
                : (lang === 'tk' ? '🔗 Salgysy göçür' : '🔗 Скопировать ссылку') }}
            </button>
            <NuxtLink to="/products" class="continue-btn">
              {{ lang === 'tk' ? 'Söwda dowam et →' : 'Продолжить покупки →' }}
            </NuxtLink>
          </div>

        </div>
      </Transition>

      <!-- Info cards -->
      <div v-if="!order" class="info-cards">
        <div
          v-for="c in [
            { icon: '⚡', title: lang === 'tk' ? 'Tiz Eltip Beriş' : 'Быстрая доставка', sub: lang === 'tk' ? '7–15 gün' : '7–15 дней' },
            { icon: '🚚', title: lang === 'tk' ? 'Adaty Eltip Beriş' : 'Обычная доставка', sub: lang === 'tk' ? '15–30 gün' : '15–30 дней' },
            { icon: '📞', title: lang === 'tk' ? '7/24 Goldaw' : 'Поддержка 24/7', sub: lang === 'tk' ? 'Her wagt ýanynyzda' : 'Всегда на связи' },
          ]"
          :key="c.title"
          class="info-card"
        >
          <span class="card-icon">{{ c.icon }}</span>
          <div>
            <div class="card-title">{{ c.title }}</div>
            <div class="card-sub">{{ c.sub }}</div>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<style scoped>
.track-page { min-height: 80vh; background: var(--surface); font-family: var(--font-body); }

.bc-bar   { background: var(--white); border-bottom: 1px solid var(--border-light); padding: 12px 0; }
.bc-inner { max-width: 800px; margin: 0 auto; padding: 0 24px; display: flex; align-items: center; gap: 8px; font-size: 13px; color: var(--subtle); }
.bc-inner a { color: var(--subtle); text-decoration: none; }
.bc-inner a:hover { color: var(--gold); }

.page-inner { max-width: 800px; margin: 0 auto; padding: 40px 24px 60px; display: flex; flex-direction: column; gap: 24px; }

/* Hero */
.track-hero { text-align: center; display: flex; flex-direction: column; align-items: center; gap: 12px; }
.hero-icon  { font-size: 56px; animation: float 3s ease-in-out infinite; }
@keyframes float { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
.track-hero h1 { font-family: var(--font-display); font-size: 30px; font-weight: 700; color: var(--dark); }
.track-hero p  { font-size: 15px; color: var(--subtle); }

/* Search */
.search-card { background: var(--white); border-radius: var(--radius-xl); border: 1.5px solid var(--border-light); padding: 24px; box-shadow: var(--shadow-md); display: flex; flex-direction: column; gap: 12px; }
.search-box  { display: flex; align-items: center; gap: 10px; border: 2px solid var(--border); border-radius: var(--radius-lg); padding: 6px 6px 6px 16px; transition: border-color .15s, box-shadow .15s; }
.search-box.focused { border-color: var(--gold); box-shadow: 0 0 0 4px var(--gold-glow); }
.search-icon  { width: 18px; height: 18px; color: var(--subtle); flex-shrink: 0; }
.search-input { flex: 1; border: none; outline: none; font-size: 15px; font-family: var(--font-body); color: var(--dark); background: transparent; min-width: 0; padding: 8px 0; }
.search-input::placeholder { color: var(--subtle); }
.track-btn    { height: 44px; padding: 0 24px; border-radius: var(--radius-md); border: none; background: linear-gradient(135deg, var(--gold), var(--gold-dark)); color: white; font-size: 14px; font-weight: 700; cursor: pointer; font-family: var(--font-body); transition: all .15s; box-shadow: 0 4px 12px var(--gold-shadow); flex-shrink: 0; display: flex; align-items: center; gap: 8px; }
.track-btn:hover:not(:disabled) { transform: translateY(-1px); }
.track-btn:disabled { opacity: .6; cursor: not-allowed; }
.spin { animation: spin .8s linear infinite; width: 16px; height: 16px; }
@keyframes spin { to { transform: rotate(360deg); } }
.search-error { font-size: 13px; color: var(--error); font-weight: 600; }
.search-hint  { font-size: 12px; color: var(--subtle); }

/* Result card */
.result-card { background: var(--white); border-radius: var(--radius-xl); border: 1.5px solid var(--border-light); overflow: hidden; box-shadow: var(--shadow-md); display: flex; flex-direction: column; }

.order-header { display: flex; align-items: center; justify-content: space-between; padding: 22px 24px; border-bottom: 1px solid var(--border-light); flex-wrap: wrap; gap: 12px; background: linear-gradient(135deg, var(--dark), #1a1d2e); }
.order-label  { font-size: 11px; font-weight: 700; color: rgba(255,255,255,.4); text-transform: uppercase; letter-spacing: .1em; display: block; margin-bottom: 4px; }
.order-id     { font-family: monospace; font-size: 20px; font-weight: 800; color: var(--gold); }
.order-status-wrap { display: flex; align-items: center; gap: 10px; }
.status-icon  { font-size: 24px; }
.status-badge { padding: 6px 16px; border-radius: var(--radius-pill); font-size: 13px; font-weight: 700; }

.order-date { padding: 12px 24px; font-size: 13px; color: var(--subtle); background: var(--surface); border-bottom: 1px solid var(--border-light); }

/* Progress */
.progress-section { padding: 24px; border-bottom: 1px solid var(--border-light); }
.progress-title   { font-size: 13px; font-weight: 700; color: var(--subtle); text-transform: uppercase; letter-spacing: .06em; margin-bottom: 20px; }
.progress-track   { display: flex; align-items: flex-start; }

.progress-step    { display: flex; flex-direction: column; align-items: center; flex: 1; }
.step-connector   { display: flex; align-items: center; width: 100%; }
.step-dot {
  width: 28px; height: 28px; border-radius: 50%;
  border: 2px solid var(--border); background: var(--white);
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0; z-index: 1; transition: all .25s;
}
.step-dot svg { width: 13px; height: 13px; }
.pulse-dot { width: 10px; height: 10px; border-radius: 50%; background: white; animation: pulse-anim 1.5s ease-in-out infinite; }
@keyframes pulse-anim { 0%,100% { opacity: 1; transform: scale(1); } 50% { opacity: .5; transform: scale(.8); } }

.step-line { flex: 1; height: 2px; background: var(--border-light); transition: background .3s; }
.step-label { font-size: 11px; font-weight: 600; color: var(--subtle); margin-top: 8px; text-align: center; transition: color .2s; white-space: nowrap; }
.step-label.active { font-size: 12px; }

/* Cancelled */
.cancelled-box { margin: 0 24px 24px; background: #FEE2E2; color: #991B1B; border-radius: var(--radius-md); padding: 14px 18px; font-size: 14px; font-weight: 600; }

/* Items */
.items-section { padding: 24px; border-bottom: 1px solid var(--border-light); }
.items-title   { font-size: 13px; font-weight: 700; color: var(--subtle); text-transform: uppercase; letter-spacing: .06em; margin-bottom: 14px; }
.items-list    { display: flex; flex-direction: column; gap: 10px; margin-bottom: 14px; }
.item-row      { display: flex; align-items: center; gap: 12px; padding: 10px 14px; background: var(--surface); border-radius: var(--radius-md); border: 1.5px solid var(--border-light); }
.item-thumb    { width: 40px; height: 40px; border-radius: var(--radius-md); background: var(--white); border: 1.5px solid var(--border-light); display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.item-emoji    { font-size: 22px; }
.item-info     { flex: 1; min-width: 0; }
.item-name     { font-size: 13px; font-weight: 700; color: var(--dark); }
.item-qty      { font-size: 12px; color: var(--subtle); margin-top: 2px; }
.item-opts     { display: flex; flex-wrap: wrap; gap: 4px; margin-top: 5px; }
.opt-chip      { font-size: 11px; font-weight: 700; color: var(--gold); background: rgba(232,160,32,.1); border: 1px solid rgba(232,160,32,.3); padding: 1px 7px; border-radius: var(--radius-pill); }
.item-price    { font-size: 14px; font-weight: 700; color: var(--dark); white-space: nowrap; }
.order-total   { display: flex; justify-content: space-between; align-items: center; padding: 12px 0 0; border-top: 1px solid var(--border-light); font-size: 14px; color: var(--subtle); }
.order-total strong { font-family: var(--font-display); font-size: 22px; font-weight: 800; color: var(--gold); }

/* Note */
.order-note { display: flex; align-items: flex-start; gap: 10px; padding: 16px 24px; background: rgba(245,158,11,.06); border-top: 1px solid rgba(245,158,11,.15); font-size: 13px; color: var(--dark); }
.order-note svg { width: 15px; height: 15px; color: #F59E0B; flex-shrink: 0; margin-top: 1px; }

/* Share row */
.share-row    { display: flex; align-items: center; gap: 12px; padding: 16px 24px; flex-wrap: wrap; }
.share-btn    { height: 38px; padding: 0 18px; border-radius: var(--radius-pill); border: 1.5px solid var(--border); background: var(--surface); font-size: 13px; font-weight: 600; color: var(--muted); cursor: pointer; font-family: var(--font-body); transition: all .15s; }
.share-btn:hover { border-color: var(--gold); color: var(--gold); }
.continue-btn { margin-left: auto; font-size: 13px; font-weight: 700; color: var(--gold); text-decoration: none; }
.continue-btn:hover { text-decoration: underline; }

/* Info cards */
.info-cards { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; }
.info-card  { background: var(--white); border-radius: var(--radius-lg); border: 1.5px solid var(--border-light); padding: 18px; display: flex; align-items: center; gap: 14px; box-shadow: var(--shadow-sm); }
.card-icon  { font-size: 28px; flex-shrink: 0; }
.card-title { font-size: 13px; font-weight: 700; color: var(--dark); }
.card-sub   { font-size: 12px; color: var(--subtle); margin-top: 2px; }

/* Transition */
.slide-up-enter-active { transition: all .35s cubic-bezier(.4,0,.2,1); }
.slide-up-enter-from   { opacity: 0; transform: translateY(16px); }

@media (max-width: 600px) {
  .info-cards { grid-template-columns: 1fr; }
  .search-box { flex-wrap: wrap; }
  .track-btn  { width: 100%; justify-content: center; }
  .progress-track { overflow-x: auto; padding-bottom: 8px; }
  .step-label { font-size: 10px; }
}
</style>