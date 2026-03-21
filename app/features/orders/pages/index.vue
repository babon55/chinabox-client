<script setup lang="ts">
definePageMeta({ layout: 'default' })

const API         = 'http://localhost:3001/api/v1'
const signinStore = useSigninStore()

const lang = ref<'tk' | 'ru'>('tk')

onMounted(async () => {
  await signinStore.restore()  // fully await so token is ready
  const saved = localStorage.getItem('silkshop_lang')
  if (saved === 'tk' || saved === 'ru') lang.value = saved as 'tk' | 'ru'
  if (signinStore.isLoggedIn) loadOrders()
})

// ── Orders ────────────────────────────────────────────────────
const orders    = ref<any[]>([])
const loading   = ref(false)
const error     = ref<string | null>(null)
const expanded  = ref<string | null>(null)
const filterSt  = ref<string>('ALL')

async function loadOrders() {
  const token = signinStore.accessToken ?? localStorage.getItem('access_token')
  if (!token) return
  loading.value = true
  error.value   = null
  try {
    const data = await $fetch<any>(`${API}/customer/orders`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    orders.value = Array.isArray(data) ? data : (data.items ?? [])
  } catch {
    error.value = lang.value === 'tk' ? 'Sargytlar ýüklenip bilinmedi' : 'Не удалось загрузить заказы'
  } finally {
    loading.value = false
  }
}

// ── FIXED: only react to real login (false → true), not restore() ─────────────
watch(() => signinStore.isLoggedIn, (val, oldVal) => {
  if (val && oldVal === false) loadOrders()
})

// ── Filter ────────────────────────────────────────────────────
const STATUS_OPTIONS = ['ALL', 'PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED']

const filtered = computed(() => {
  if (filterSt.value === 'ALL') return orders.value
  return orders.value.filter(o => o.status === filterSt.value)
})

// ── Helpers ───────────────────────────────────────────────────
const STATUS_LABELS: Record<string, Record<string, string>> = {
  ALL:        { tk: 'Hemmesi',     ru: 'Все'        },
  PENDING:    { tk: 'Garaşylýar', ru: 'Ожидanie'   },
  PROCESSING: { tk: 'Işlenilýär', ru: 'В работе'   },
  SHIPPED:    { tk: 'Ugradyldy',  ru: 'Отправлен'  },
  DELIVERED:  { tk: 'Gowşuryldy',ru: 'Доставлен'  },
  CANCELLED:  { tk: 'Ýatyryldy', ru: 'Отменён'    },
}

const STATUS_COLORS: Record<string, string> = {
  PENDING:    '#F59E0B',
  PROCESSING: '#3B82F6',
  SHIPPED:    '#8B5CF6',
  DELIVERED:  '#22C55E',
  CANCELLED:  '#EF4444',
}

const STATUS_STEPS = ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED']

function stepIndex(status: string) { return STATUS_STEPS.indexOf(status) }
function fmt(n: number | string)   { return Number(n).toFixed(2) }
function fmtDate(d: string) {
  return new Date(d).toLocaleDateString(lang.value === 'tk' ? 'tk-TM' : 'ru-RU', {
    day: '2-digit', month: 'short', year: 'numeric',
  })
}

function toggle(id: string) {
  expanded.value = expanded.value === id ? null : id
}

// ── Stats ─────────────────────────────────────────────────────
const stats = computed(() => {
  const l = lang.value
  const total   = orders.value.length
  const active  = orders.value.filter(o => ['PENDING','PROCESSING','SHIPPED'].includes(o.status)).length
  const done    = orders.value.filter(o => o.status === 'DELIVERED').length
  const spent   = orders.value.filter(o => o.status !== 'CANCELLED').reduce((s, o) => s + Number(o.total), 0)
  return [
    { label: l === 'tk' ? 'Jemi Sargyt'      : 'Всего заказов',    value: total,            icon: '📦' },
    { label: l === 'tk' ? 'Işjeň'            : 'Активные',         value: active,           icon: '⏳' },
    { label: l === 'tk' ? 'Gowşuryldy'       : 'Доставлено',       value: done,             icon: '✅' },
    { label: l === 'tk' ? 'Umumy Sarp Edildi': 'Всего потрачено',  value: `$${fmt(spent)}`, icon: '💰' },
  ]
})

useHead({ title: computed(() => lang.value === 'tk' ? 'Sargytlarym — ChinaBox' : 'Мои заказы — ChinaBox') })
</script>

<template>
  <div class="orders-page">

    <!-- ══ HERO ══ -->
    <div class="page-hero">
      <div class="hero-inner">
        <div class="hero-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
            <path d="M20 7H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z"/>
            <path d="M16 3H8a2 2 0 0 0-2 2v2h12V5a2 2 0 0 0-2-2z"/>
          </svg>
        </div>
        <div>
          <h1 class="hero-title">{{ lang === 'tk' ? 'Sargytlarym' : 'Мои заказы' }}</h1>
          <p class="hero-sub">{{ lang === 'tk' ? 'Ähli sargytlaryňyz bir ýerde' : 'Все ваши заказы в одном месте' }}</p>
        </div>
      </div>
    </div>

    <div class="page-body">

      <!-- ══ NOT LOGGED IN ══ -->
      <div v-if="!signinStore.isLoggedIn" class="login-prompt">
        <div class="lp-icon">🔐</div>
        <h2>{{ lang === 'tk' ? 'Sargytlaryňyzy görmek üçin giriş ediň' : 'Войдите чтобы увидеть свои заказы' }}</h2>
        <p>{{ lang === 'tk' ? 'Hasabyňyz bilen ähli sargytlaryňyz bir ýerde görüner' : 'Все ваши заказы будут доступны после входа' }}</p>
        <div class="lp-actions">
          <NuxtLink to="/signin" class="btn-gold">{{ lang === 'tk' ? 'Giriş Et' : 'Войти' }}</NuxtLink>
          <NuxtLink to="/signup" class="btn-outline">{{ lang === 'tk' ? 'Hasap Aç' : 'Регистрация' }}</NuxtLink>
        </div>
      </div>

      <template v-else>

        <!-- ══ STATS ══ -->
        <div class="stats-grid">
          <div v-for="s in stats" :key="s.label" class="stat-card">
            <div class="stat-icon">{{ s.icon }}</div>
            <div>
              <div class="stat-val">{{ s.value }}</div>
              <div class="stat-lbl">{{ s.label }}</div>
            </div>
          </div>
        </div>

        <!-- ══ FILTER TABS ══ -->
        <div class="filter-bar">
          <button
            v-for="s in STATUS_OPTIONS"
            :key="s"
            :class="['ftab', { active: filterSt === s }]"
            @click="filterSt = s"
          >
            {{ STATUS_LABELS[s]?.[lang] }}
            <span v-if="s !== 'ALL'" class="ftab-count">
              {{ orders.filter(o => o.status === s).length }}
            </span>
          </button>
        </div>

        <!-- ══ LOADING ══ -->
        <div v-if="loading" class="loading-wrap">
          <div class="spinner"></div>
        </div>

        <!-- ══ ERROR ══ -->
        <div v-else-if="error" class="error-box">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          {{ error }}
        </div>

        <!-- ══ EMPTY ══ -->
        <div v-else-if="filtered.length === 0" class="empty-state">
          <div class="empty-icon">📭</div>
          <h3>{{ lang === 'tk' ? 'Sargyt tapylmady' : 'Заказов не найдено' }}</h3>
          <p>{{ filterSt === 'ALL'
            ? (lang === 'tk' ? 'Entek hiç sargyt etmediňiz' : 'Вы ещё не делали заказов')
            : (lang === 'tk' ? 'Bu ýagdaýda sargyt ýok' : 'Нет заказов с этим статусом')
          }}</p>
          <NuxtLink v-if="filterSt === 'ALL'" to="/products" class="btn-gold">
            {{ lang === 'tk' ? 'Harytlara Git' : 'Смотреть товары' }}
          </NuxtLink>
        </div>

        <!-- ══ ORDERS LIST ══ -->
        <div v-else class="orders-list">
          <div v-for="order in filtered" :key="order.id" class="order-card">

            <!-- Card header -->
            <div class="oc-head" @click="toggle(order.id)">
              <div class="oc-head-left">
                <span class="oc-id">#{{ order.id.slice(-8).toUpperCase() }}</span>
                <span class="oc-date">{{ fmtDate(order.createdAt) }}</span>
                <span class="oc-items-count">
                  {{ order.lines?.length ?? 0 }}
                  {{ lang === 'tk' ? 'haryt' : 'товар(а)' }}
                </span>
              </div>
              <div class="oc-head-right">
                <div
                  class="oc-badge"
                  :style="{ background: (STATUS_COLORS[order.status] ?? '#6B7280') + '18', color: STATUS_COLORS[order.status] ?? '#6B7280', border: `1.5px solid ${(STATUS_COLORS[order.status] ?? '#6B7280')}30` }"
                >
                  {{ STATUS_LABELS[order.status]?.[lang] ?? order.status }}
                </div>
                <div class="oc-total">${{ fmt(order.total) }}</div>
                <div :class="['oc-chevron', { open: expanded === order.id }]">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"/></svg>
                </div>
              </div>
            </div>

            <!-- Progress bar (always visible, not for cancelled) -->
            <div v-if="order.status !== 'CANCELLED'" class="oc-progress">
              <div v-for="(step, i) in STATUS_STEPS" :key="step" class="oc-prog-step">
                <div class="oc-prog-dot-wrap">
                  <div
                    class="oc-prog-dot"
                    :style="i <= stepIndex(order.status)
                      ? { background: STATUS_COLORS[order.status], borderColor: STATUS_COLORS[order.status] }
                      : {}"
                    :class="{ done: i <= stepIndex(order.status) }"
                  >
                    <svg v-if="i < stepIndex(order.status)" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>
                    <div v-else-if="i === stepIndex(order.status)" class="dot-pulse"></div>
                  </div>
                  <div
                    v-if="i < STATUS_STEPS.length - 1"
                    class="oc-prog-line"
                    :class="{ done: i < stepIndex(order.status) }"
                    :style="i < stepIndex(order.status) ? { background: STATUS_COLORS[order.status] } : {}"
                  ></div>
                </div>
                <span
                  class="oc-prog-lbl"
                  :class="{ active: step === order.status }"
                  :style="step === order.status ? { color: STATUS_COLORS[order.status] } : {}"
                >
                  {{ STATUS_LABELS[step]?.[lang] }}
                </span>
              </div>
            </div>
            <div v-else class="oc-cancelled">
              ❌ {{ lang === 'tk' ? 'Bu sargyt ýatyryldy' : 'Этот заказ был отменён' }}
            </div>

            <!-- Expanded detail -->
            <Transition name="expand">
              <div v-if="expanded === order.id" class="oc-detail">

                <!-- Items -->
                <div class="oc-detail-title">{{ lang === 'tk' ? 'Sargyt düzümi' : 'Состав заказа' }}</div>
                <div class="oc-items">
                  <div v-for="line in order.lines" :key="line.id" class="oc-item">
                    <div class="oc-item-thumb">
                      <img v-if="line.product?.imageUrl" :src="line.product.imageUrl" :alt="line.product.nameTk" class="oc-item-img" />
                      <span v-else class="oc-item-emoji">{{ line.product?.image ?? '📦' }}</span>
                    </div>
                    <div class="oc-item-info">
                      <div class="oc-item-name">{{ lang === 'tk' ? line.product?.nameTk : line.product?.nameRu }}</div>
                      <div class="oc-item-cat">{{ lang === 'tk' ? line.product?.category?.nameTk : line.product?.category?.nameRu }}</div>
                    </div>
                    <div class="oc-item-right">
                      <div class="oc-item-qty">× {{ line.qty }}</div>
                      <div class="oc-item-price">${{ fmt(Number(line.unitPrice) * line.qty) }}</div>
                    </div>
                  </div>
                </div>

                <!-- Note -->
                <div v-if="order.note" class="oc-note">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                  {{ order.note }}
                </div>

                <!-- Summary -->
                <div class="oc-summary">
                  <div class="oc-summary-row">
                    <span>{{ lang === 'tk' ? 'Önümler' : 'Товары' }}</span>
                    <span>${{ fmt(order.total) }}</span>
                  </div>
                  <div class="oc-summary-total">
                    <span>{{ lang === 'tk' ? 'Jemi' : 'Итого' }}</span>
                    <span class="oc-total-val">${{ fmt(order.total) }}</span>
                  </div>
                </div>

              </div>
            </Transition>

          </div>
        </div>

      </template>
    </div>
  </div>
</template>

<style scoped>
.orders-page { background: var(--surface); min-height: 100vh; }

/* ══ Hero ══ */
.page-hero {
  background: var(--dark);
  padding: 36px 24px;
  border-bottom: 1px solid rgba(255,255,255,0.06);
}
.hero-inner {
  max-width: 900px; margin: 0 auto;
  display: flex; align-items: center; gap: 20px;
}
.hero-icon {
  width: 56px; height: 56px;
  border-radius: var(--radius-lg);
  background: var(--gold-glow);
  border: 1.5px solid rgba(232,160,32,0.25);
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0; color: var(--gold);
}
.hero-icon svg { width: 26px; height: 26px; }
.hero-title { font-family: var(--font-display); font-size: 28px; font-weight: 700; color: white; margin-bottom: 4px; }
.hero-sub   { font-size: 14px; color: rgba(255,255,255,0.45); }

/* ══ Body ══ */
.page-body { max-width: 900px; margin: 0 auto; padding: 32px 24px; display: flex; flex-direction: column; gap: 20px; }

/* ══ Login prompt ══ */
.login-prompt {
  background: var(--white); border-radius: var(--radius-xl);
  border: 1.5px solid var(--border-light); padding: 56px 40px;
  text-align: center; box-shadow: var(--shadow-sm);
}
.lp-icon { font-size: 48px; margin-bottom: 16px; }
.login-prompt h2 { font-family: var(--font-display); font-size: 22px; font-weight: 700; color: var(--dark); margin-bottom: 10px; }
.login-prompt p  { font-size: 14px; color: var(--subtle); margin-bottom: 24px; }
.lp-actions { display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; }

/* ══ Stats ══ */
.stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; }
.stat-card {
  background: var(--white); border-radius: var(--radius-lg);
  border: 1.5px solid var(--border-light); padding: 16px 18px;
  display: flex; align-items: center; gap: 14px;
  box-shadow: var(--shadow-sm);
}
.stat-icon { font-size: 24px; flex-shrink: 0; }
.stat-val  { font-size: 20px; font-weight: 800; color: var(--dark); font-family: var(--font-display); line-height: 1; }
.stat-lbl  { font-size: 11px; color: var(--subtle); margin-top: 3px; }

/* ══ Filter ══ */
.filter-bar {
  display: flex; gap: 4px; flex-wrap: wrap;
  background: var(--white); border: 1.5px solid var(--border-light);
  border-radius: var(--radius-lg); padding: 6px; box-shadow: var(--shadow-sm);
}
.ftab {
  display: flex; align-items: center; gap: 6px;
  padding: 7px 14px; border-radius: var(--radius-md);
  border: none; background: transparent;
  font-size: 12px; font-weight: 600; color: var(--subtle);
  cursor: pointer; font-family: var(--font-body);
  transition: all .15s;
}
.ftab:hover { background: var(--surface); color: var(--dark); }
.ftab.active { background: var(--dark); color: white; }
.ftab-count {
  background: rgba(255,255,255,0.15);
  padding: 1px 6px; border-radius: var(--radius-pill);
  font-size: 10px; font-weight: 700;
}
.ftab:not(.active) .ftab-count { background: var(--border-light); color: var(--muted); }

/* ══ Loading / Error / Empty ══ */
.loading-wrap { display: flex; justify-content: center; padding: 60px; }
.spinner { width: 32px; height: 32px; border: 3px solid var(--border); border-top-color: var(--gold); border-radius: 50%; animation: spin .7s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

.error-box {
  display: flex; align-items: center; gap: 8px;
  background: var(--error-bg); color: var(--error);
  border: 1.5px solid var(--error-border);
  border-radius: var(--radius-md); padding: 12px 16px;
  font-size: 13px; font-weight: 600;
}
.error-box svg { width: 16px; height: 16px; flex-shrink: 0; }

.empty-state {
  background: var(--white); border-radius: var(--radius-xl);
  border: 1.5px solid var(--border-light); padding: 56px 40px;
  text-align: center; box-shadow: var(--shadow-sm);
}
.empty-icon { font-size: 48px; margin-bottom: 16px; }
.empty-state h3 { font-family: var(--font-display); font-size: 20px; font-weight: 700; color: var(--dark); margin-bottom: 8px; }
.empty-state p  { font-size: 14px; color: var(--subtle); margin-bottom: 24px; }

/* ══ Buttons ══ */
.btn-gold {
  display: inline-flex; align-items: center; height: 44px; padding: 0 24px;
  border-radius: var(--radius-pill); background: var(--gold); color: white;
  font-size: 13px; font-weight: 700; text-decoration: none; transition: background .15s;
}
.btn-gold:hover { background: var(--gold-dark); }
.btn-outline {
  display: inline-flex; align-items: center; height: 44px; padding: 0 24px;
  border-radius: var(--radius-pill); border: 1.5px solid var(--border);
  background: var(--surface); color: var(--dark);
  font-size: 13px; font-weight: 700; text-decoration: none; transition: all .15s;
}
.btn-outline:hover { border-color: var(--gold); color: var(--gold); }

/* ══ Orders list ══ */
.orders-list { display: flex; flex-direction: column; gap: 12px; }

/* ══ Order card ══ */
.order-card {
  background: var(--white); border-radius: var(--radius-xl);
  border: 1.5px solid var(--border-light); overflow: hidden;
  box-shadow: var(--shadow-sm); transition: box-shadow .2s;
}
.order-card:hover { box-shadow: var(--shadow-md); }

/* Header */
.oc-head {
  display: flex; align-items: center; justify-content: space-between;
  padding: 18px 22px; cursor: pointer;
  transition: background .15s; gap: 12px; flex-wrap: wrap;
}
.oc-head:hover { background: var(--surface); }
.oc-head-left  { display: flex; align-items: center; gap: 14px; flex-wrap: wrap; }
.oc-head-right { display: flex; align-items: center; gap: 12px; flex-shrink: 0; }

.oc-id   { font-family: monospace; font-size: 14px; font-weight: 700; color: var(--gold); }
.oc-date { font-size: 12px; color: var(--subtle); }
.oc-items-count { font-size: 12px; color: var(--subtle); background: var(--surface); padding: 2px 8px; border-radius: var(--radius-pill); border: 1px solid var(--border-light); }

.oc-badge {
  display: inline-flex; align-items: center;
  padding: 4px 12px; border-radius: var(--radius-pill);
  font-size: 11px; font-weight: 700;
}
.oc-total { font-family: var(--font-display); font-size: 16px; font-weight: 700; color: var(--dark); }
.oc-chevron { color: var(--subtle); transition: transform .25s; }
.oc-chevron.open { transform: rotate(180deg); }
.oc-chevron svg { width: 16px; height: 16px; }

/* Progress */
.oc-progress {
  display: flex; align-items: flex-start;
  padding: 0 22px 18px; gap: 0;
}
.oc-prog-step { display: flex; flex-direction: column; align-items: center; flex: 1; }
.oc-prog-dot-wrap { display: flex; align-items: center; width: 100%; position: relative; }
.oc-prog-dot {
  width: 20px; height: 20px; border-radius: 50%;
  border: 2px solid var(--border);
  background: var(--white); display: flex; align-items: center; justify-content: center;
  flex-shrink: 0; z-index: 1; transition: all .2s;
}
.oc-prog-dot.done { border-width: 0; }
.oc-prog-dot svg { width: 10px; height: 10px; }
.dot-pulse { width: 8px; height: 8px; border-radius: 50%; background: white; animation: pulse 1.5s ease-in-out infinite; }
@keyframes pulse { 0%,100% { opacity: 1; transform: scale(1); } 50% { opacity: .6; transform: scale(0.8); } }

.oc-prog-line {
  flex: 1; height: 2px; background: var(--border-light);
  transition: background .2s;
}

.oc-prog-lbl {
  font-size: 10px; font-weight: 600; color: var(--subtle);
  margin-top: 6px; text-align: center;
  transition: color .2s;
}
.oc-prog-lbl.active { font-weight: 800; }

.oc-cancelled {
  margin: 0 22px 18px;
  background: #FEE2E2; color: #991B1B;
  border-radius: var(--radius-md); padding: 10px 14px;
  font-size: 13px; font-weight: 600;
}

/* Detail */
.oc-detail {
  border-top: 1px solid var(--border-light);
  padding: 20px 22px;
  display: flex; flex-direction: column; gap: 16px;
  background: var(--surface);
}
.oc-detail-title { font-size: 12px; font-weight: 700; color: var(--subtle); text-transform: uppercase; letter-spacing: .06em; }

.oc-items { display: flex; flex-direction: column; gap: 10px; }
.oc-item {
  display: flex; align-items: center; gap: 12px;
  background: var(--white); border-radius: var(--radius-md);
  border: 1.5px solid var(--border-light); padding: 10px 14px;
}
.oc-item-thumb {
  width: 44px; height: 44px; border-radius: var(--radius-md);
  background: var(--surface); border: 1.5px solid var(--border-light);
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
  overflow: hidden;
}
.oc-item-img   { width: 100%; height: 100%; object-fit: cover; }
.oc-item-emoji { font-size: 22px; }
.oc-item-info  { flex: 1; min-width: 0; }
.oc-item-name  { font-size: 13px; font-weight: 700; color: var(--dark); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.oc-item-cat   { font-size: 11px; color: var(--subtle); margin-top: 2px; }
.oc-item-right { display: flex; flex-direction: column; align-items: flex-end; gap: 2px; flex-shrink: 0; }
.oc-item-qty   { font-size: 11px; color: var(--subtle); }
.oc-item-price { font-size: 14px; font-weight: 700; color: var(--dark); }

.oc-note {
  display: flex; align-items: flex-start; gap: 8px;
  background: var(--warning-bg); border-radius: var(--radius-md);
  padding: 10px 14px; font-size: 13px; color: var(--dark);
  border: 1px solid rgba(245,158,11,0.2);
}
.oc-note svg { width: 15px; height: 15px; color: var(--warning); flex-shrink: 0; margin-top: 1px; }

.oc-summary {
  background: var(--white); border-radius: var(--radius-md);
  border: 1.5px solid var(--border-light); padding: 14px 16px;
  display: flex; flex-direction: column; gap: 8px;
}
.oc-summary-row {
  display: flex; justify-content: space-between;
  font-size: 13px; color: var(--subtle);
}
.oc-summary-total {
  display: flex; justify-content: space-between; align-items: center;
  font-size: 14px; font-weight: 700; color: var(--dark);
  border-top: 1px solid var(--border-light); padding-top: 8px; margin-top: 2px;
}
.oc-total-val { font-family: var(--font-display); font-size: 20px; font-weight: 700; color: var(--gold); }

/* ══ Expand transition ══ */
.expand-enter-active, .expand-leave-active { transition: opacity .2s, transform .2s; }
.expand-enter-from, .expand-leave-to { opacity: 0; transform: translateY(-8px); }

/* ══ Responsive ══ */
@media (max-width: 700px) {
  .stats-grid { grid-template-columns: repeat(2, 1fr); }
  .filter-bar { gap: 2px; }
  .ftab { padding: 6px 10px; font-size: 11px; }
  .oc-head { padding: 14px 16px; }
  .oc-progress { padding: 0 16px 14px; }
  .oc-detail { padding: 16px; }
  .page-body { padding: 20px 16px; }
}
</style>