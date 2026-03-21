<script setup lang="ts">
definePageMeta({ layout: 'default' })

const API = 'http://localhost:3001/api/v1'

const lang = ref<'tk' | 'ru'>('tk')
onMounted(() => {
  const saved = localStorage.getItem('silkshop_lang')
  if (saved === 'tk' || saved === 'ru') lang.value = saved as 'tk' | 'ru'
})

const products   = ref<any[]>([])
const categories = ref<any[]>([])
const loadingProducts = ref(true)

onMounted(async () => {
  try {
    const [prodRes, catRes] = await Promise.all([
      $fetch<any>(`${API}/products?limit=8&status=ACTIVE`),
      $fetch<any[]>(`${API}/products/categories/all`),
    ])
    products.value   = prodRes.items ?? []
    categories.value = catRes ?? []
  } catch (e) {
    console.error('Failed to load products', e)
  } finally {
    loadingProducts.value = false
  }
})

const FAST_RATE   = 11
const SIMPLE_RATE = 7

function calcTotal(price: number, weightG: number | null, rate: number) {
  return price + ((weightG ?? 0) / 1000) * rate
}
function fmt(n: number) { return Number(n).toFixed(2) }
function fmtWeight(g: number | null) {
  if (!g) return '—'
  return g >= 1000 ? (g / 1000).toFixed(1) + ' kg' : g + ' g'
}

const steps = computed(() => lang.value === 'tk' ? [
  { num: 1, icon: 'user',   color: '#E8A020', title: 'Hasap Aç',      desc: 'E-poçtaňyz bilen mugt hasap açyň.' },
  { num: 2, icon: 'search', color: '#3B82F6', title: 'Haryt Saýla',   desc: 'Müňlerçe harydyň içinden gerekliňizi tapyň.' },
  { num: 3, icon: 'cart',   color: '#22C55E', title: 'Sargyt Et',     desc: 'Sebede goşuň we sargydyňyzy tassyklaň.' },
  { num: 4, icon: 'truck',  color: '#8B5CF6', title: 'Garaşyň',       desc: 'Sargydyňyz taýýarlanýar we iberilyär.' },
  { num: 5, icon: 'pay',    color: '#EF4444', title: 'Alyň & Töläň',  desc: 'Harydyňyz gowşurylýar — alyň we töläň.' },
] : [
  { num: 1, icon: 'user',   color: '#E8A020', title: 'Регистрация',   desc: 'Создайте бесплатный аккаунт.' },
  { num: 2, icon: 'search', color: '#3B82F6', title: 'Выбор товара',  desc: 'Найдите нужный товар среди тысяч позиций.' },
  { num: 3, icon: 'cart',   color: '#22C55E', title: 'Оформить',      desc: 'Добавьте в корзину и подтвердите заказ.' },
  { num: 4, icon: 'truck',  color: '#8B5CF6', title: 'Ожидание',      desc: 'Заказ обрабатывается и отправляется.' },
  { num: 5, icon: 'pay',    color: '#EF4444', title: 'Получить',      desc: 'Получите посылку и оплатите.' },
])

const CAT_ICONS: Record<string, string> = {
  'Elektronika': '📱', 'Электроника': '📱',
  'Aksesuar': '⌚', 'Аксессуары': '⌚',
  'Egin-eşik': '👗', 'Одежда': '👗',
  'Gözellik': '💄', 'Красота': '💄',
  'Öý üçin': '🏠', 'Для дома': '🏠',
}
function catIcon(c: any) {
  return CAT_ICONS[c.nameTk] ?? CAT_ICONS[c.nameRu] ?? '📦'
}

useHead({ title: computed(() => lang.value === 'tk' ? 'ChinaBox — Baş sahypa' : 'ChinaBox — Главная') })
</script>

<template>
  <div class="home">

    <!-- ══ HOW IT WORKS ══ -->
    <section class="steps-section">
      <div class="steps-inner">
        <div class="steps-head">
          <h2 class="steps-title">{{ lang === 'tk' ? 'Nädip Işleýär?' : 'Как это работает?' }}</h2>
          <p class="steps-sub">{{ lang === 'tk' ? 'Diňe 5 ädimde sargydyňyz gapyňyza gowşurylýar' : 'Всего 5 шагов — и заказ у вас дома' }}</p>
        </div>
        <div class="steps-grid">
          <div v-for="s in steps" :key="s.num" class="step-card">
            <div class="step-num-wrap">
              <div class="step-num" :style="{ background: s.color + '22', color: s.color }">{{ s.num }}</div>
              <div v-if="s.num < 5" class="step-connector"></div>
            </div>
            <div class="step-icon-wrap" :style="{ background: s.color + '18' }">
              <svg v-if="s.icon === 'user'"   viewBox="0 0 24 24" fill="none" :stroke="s.color" stroke-width="2" stroke-linecap="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/></svg>
              <svg v-if="s.icon === 'search'" viewBox="0 0 24 24" fill="none" :stroke="s.color" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              <svg v-if="s.icon === 'cart'"   viewBox="0 0 24 24" fill="none" :stroke="s.color" stroke-width="2" stroke-linecap="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
              <svg v-if="s.icon === 'truck'"  viewBox="0 0 24 24" fill="none" :stroke="s.color" stroke-width="2" stroke-linecap="round"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>
              <svg v-if="s.icon === 'pay'"    viewBox="0 0 24 24" fill="none" :stroke="s.color" stroke-width="2" stroke-linecap="round"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
            </div>
            <h3 class="step-title">{{ s.title }}</h3>
            <p class="step-desc">{{ s.desc }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- ══ CATEGORIES ══ -->
    <section class="full-section white-bg">
      <div class="inner">
        <div class="section-head">
          <h2 class="section-title">{{ lang === 'tk' ? 'Kategoriýalar' : 'Категории' }}</h2>
          <NuxtLink to="/products" class="see-all">
            {{ lang === 'tk' ? 'Hemmesini Gör' : 'Все категории' }}
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </NuxtLink>
        </div>
        <div class="categories-grid">
          <NuxtLink v-for="c in categories" :key="c.id" :to="`/products?category=${c.id}`" class="cat-card">
            <div class="cat-icon">{{ catIcon(c) }}</div>
            <span class="cat-name">{{ lang === 'tk' ? c.nameTk : c.nameRu }}</span>
            <div class="cat-arrow"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg></div>
          </NuxtLink>
        </div>
      </div>
    </section>

    <!-- ══ PRODUCTS ══ -->
    <section class="full-section surface-bg">
      <div class="inner">
        <div class="section-head">
          <h2 class="section-title">{{ lang === 'tk' ? 'Meşhur Önümler' : 'Популярные товары' }}</h2>
          <NuxtLink to="/products" class="see-all">
            {{ lang === 'tk' ? 'Hemmesini Gör' : 'Смотреть все' }}
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </NuxtLink>
        </div>
        <div v-if="loadingProducts" class="products-grid">
          <div v-for="i in 8" :key="i" class="product-skeleton">
            <div class="skel-img"></div>
            <div class="skel-line skel-line-1"></div>
            <div class="skel-line skel-line-2"></div>
            <div class="skel-line skel-line-3"></div>
          </div>
        </div>
        <div v-else class="products-grid">
          <NuxtLink v-for="p in products" :key="p.id" :to="`/products/${p.id}`" class="product-card">
            <div class="product-img-wrap">
              <img v-if="p.imageUrl" :src="p.imageUrl" :alt="lang === 'tk' ? p.nameTk : p.nameRu" class="product-img" />
              <div v-else class="product-emoji">{{ p.image }}</div>
              <div class="product-badge-wrap">
                <span v-if="p.stock === 0" class="prod-badge out">{{ lang === 'tk' ? 'Gutardy' : 'Нет' }}</span>
                <span v-else-if="p.stock <= 10" class="prod-badge low">{{ lang === 'tk' ? 'Az galdy' : 'Мало' }}</span>
              </div>
            </div>
            <div class="product-info">
              <div class="product-cat">{{ lang === 'tk' ? p.category?.nameTk : p.category?.nameRu }}</div>
              <div class="product-name">{{ lang === 'tk' ? p.nameTk : p.nameRu }}</div>
              <div v-if="p.weightG" class="product-weight">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M8 12h8M12 8v8"/></svg>
                {{ fmtWeight(p.weightG) }}
              </div>
              <div class="product-prices">
                <div class="price-base">
                  <span class="price-label">{{ lang === 'tk' ? 'Önüm bahasy' : 'Цена товара' }}</span>
                  <span class="price-val">${{ fmt(p.price) }}</span>
                </div>
                <div v-if="p.weightG" class="price-delivery-row">
                  <div class="price-fast">
                    <span>⚡ {{ lang === 'tk' ? 'Tiz' : 'Быстрая' }}</span>
                    <strong>${{ fmt(calcTotal(Number(p.price), p.weightG, FAST_RATE)) }}</strong>
                  </div>
                  <div class="price-simple">
                    <span>🚚 {{ lang === 'tk' ? 'Adaty' : 'Обычная' }}</span>
                    <strong>${{ fmt(calcTotal(Number(p.price), p.weightG, SIMPLE_RATE)) }}</strong>
                  </div>
                </div>
              </div>
              <button class="product-btn" :disabled="p.stock === 0">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
                {{ p.stock === 0 ? (lang === 'tk' ? 'Gutardy' : 'Нет') : (lang === 'tk' ? 'Sebede Goş' : 'В корзину') }}
              </button>
            </div>
          </NuxtLink>
        </div>
      </div>
    </section>

    <!-- ══ DELIVERY ══ -->
    <section class="delivery-section">
      <div class="inner">
        <div class="delivery-header">
          <h2 class="delivery-title">{{ lang === 'tk' ? 'Eltip Beriş Bahalary' : 'Тарифы доставки' }}</h2>
          <p class="delivery-sub">{{ lang === 'tk' ? 'Agram esasynda hasaplanýar' : 'Рассчитывается по весу товара' }}</p>
        </div>
        <div class="delivery-cards">
          <div class="del-card del-card-fast">
            <div class="del-card-top">
              <div class="del-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg></div>
              <div class="del-type">
                <span class="del-name">{{ lang === 'tk' ? 'Tiz Eltip Beriş' : 'Быстрая доставка' }}</span>
                <span class="del-days">7–15 {{ lang === 'tk' ? 'gün' : 'дней' }}</span>
              </div>
              <div class="del-rate">${{ FAST_RATE }}<span>/kg</span></div>
            </div>
            <ul class="del-features">
              <li>{{ lang === 'tk' ? '✓ Çalt iberiliş' : '✓ Быстрая отправка' }}</li>
              <li>{{ lang === 'tk' ? '✓ Yzarlamak mümkin' : '✓ Отслеживание заказа' }}</li>
              <li>{{ lang === 'tk' ? '✓ Ygtybarly gaplaýyş' : '✓ Надёжная упаковка' }}</li>
            </ul>
            <NuxtLink to="/products" class="del-cta del-cta-fast">{{ lang === 'tk' ? 'Sargyt Et' : 'Заказать' }}</NuxtLink>
          </div>
          <div class="del-card del-card-simple">
            <div class="del-card-top">
              <div class="del-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="1" y="3" width="15" height="13" rx="1"/><path d="M16 8h4l3 3v5h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg></div>
              <div class="del-type">
                <span class="del-name">{{ lang === 'tk' ? 'Adaty Eltip Beriş' : 'Обычная доставка' }}</span>
                <span class="del-days">15–30 {{ lang === 'tk' ? 'gün' : 'дней' }}</span>
              </div>
              <div class="del-rate del-rate-dark">${{ SIMPLE_RATE }}<span>/kg</span></div>
            </div>
            <ul class="del-features">
              <li>{{ lang === 'tk' ? '✓ Amatly baha' : '✓ Экономичная цена' }}</li>
              <li>{{ lang === 'tk' ? '✓ Yzarlamak mümkin' : '✓ Отслеживание заказа' }}</li>
              <li>{{ lang === 'tk' ? '✓ Ygtybarly gaplaýyş' : '✓ Надёжная упаковка' }}</li>
            </ul>
            <NuxtLink to="/products" class="del-cta del-cta-simple">{{ lang === 'tk' ? 'Sargyt Et' : 'Заказать' }}</NuxtLink>
          </div>
        </div>
      </div>
    </section>

    <!-- ══ CTA ══ -->
    <section class="cta-section">
      <div class="inner cta-inner">
        <div>
          <h2 class="cta-title">{{ lang === 'tk' ? 'Şu Gün Başlaň!' : 'Начните сегодня!' }}</h2>
          <p class="cta-sub">{{ lang === 'tk' ? 'Hasap açyň we ilkinji sargydyňyzy ediň' : 'Создайте аккаунт и сделайте первый заказ' }}</p>
        </div>
        <div class="cta-actions">
          <NuxtLink to="/signup" class="cta-btn-main">{{ lang === 'tk' ? 'Mugt Hasap Aç' : 'Создать аккаунт' }}</NuxtLink>
          <NuxtLink to="/products" class="cta-btn-sec">{{ lang === 'tk' ? 'Harytlara Göz At' : 'Смотреть товары' }}</NuxtLink>
        </div>
      </div>
    </section>

  </div>
</template>

<style scoped>
.home { background: var(--surface); }

/* ══ Layout helpers ══ */
.full-section { padding: 48px 24px; }
.white-bg   { background: var(--white); }
.surface-bg { background: var(--surface); }
.inner { max-width: 1200px; margin: 0 auto; }

.section-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 28px; }
.section-title { font-family: var(--font-display); font-size: 26px; font-weight: 700; color: var(--dark); }
.see-all { display: inline-flex; align-items: center; gap: 6px; font-size: 13px; font-weight: 700; color: var(--gold); text-decoration: none; transition: gap .15s; }
.see-all svg { width: 14px; height: 14px; }
.see-all:hover { gap: 10px; }

/* ══ HOW IT WORKS ══ */
.steps-section { background: var(--dark); padding: 48px 24px; }
.steps-inner { max-width: 1200px; margin: 0 auto; }
.steps-head { text-align: center; margin-bottom: 36px; }
.steps-title { font-family: var(--font-display); font-size: 26px; font-weight: 700; color: white; margin-bottom: 8px; }
.steps-sub { font-size: 14px; color: rgba(255,255,255,0.4); }

.steps-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 0; }
.step-card { display: flex; flex-direction: column; align-items: center; text-align: center; gap: 12px; padding: 8px 12px; position: relative; }

.step-num-wrap { display: flex; align-items: center; width: 100%; justify-content: center; position: relative; margin-bottom: 4px; }
.step-num { width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 800; z-index: 1; flex-shrink: 0; }
.step-connector { position: absolute; top: 50%; left: calc(50% + 20px); right: calc(-50% + 20px); height: 1.5px; background: rgba(255,255,255,0.08); z-index: 0; }

.step-icon-wrap { width: 56px; height: 56px; border-radius: var(--radius-lg); display: flex; align-items: center; justify-content: center; }
.step-icon-wrap svg { width: 24px; height: 24px; }
.step-title { font-size: 14px; font-weight: 700; color: white; }
.step-desc  { font-size: 12px; color: rgba(255,255,255,0.4); line-height: 1.5; }

/* ══ CATEGORIES ══ */
.categories-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 12px; }
.cat-card { background: var(--surface); border: 1.5px solid var(--border-light); border-radius: var(--radius-lg); padding: 20px 16px; display: flex; flex-direction: column; align-items: center; gap: 10px; text-decoration: none; transition: all .2s; position: relative; overflow: hidden; }
.cat-card::before { content: ''; position: absolute; bottom: 0; left: 0; right: 0; height: 2px; background: var(--gold); transform: scaleX(0); transition: transform .2s; }
.cat-card:hover { border-color: var(--gold); transform: translateY(-3px); box-shadow: var(--shadow-md); }
.cat-card:hover::before { transform: scaleX(1); }
.cat-card:hover .cat-arrow { opacity: 1; transform: translateX(3px); }
.cat-icon { font-size: 32px; }
.cat-name { font-size: 13px; font-weight: 700; color: var(--dark); text-align: center; }
.cat-arrow { width: 20px; height: 20px; color: var(--gold); opacity: 0; transition: all .2s; }
.cat-arrow svg { width: 100%; height: 100%; }

/* ══ PRODUCTS ══ */
.products-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; }

.product-skeleton { background: var(--white); border-radius: var(--radius-lg); overflow: hidden; border: 1.5px solid var(--border-light); }
.skel-img { height: 180px; background: linear-gradient(90deg, var(--border-light) 25%, var(--surface) 50%, var(--border-light) 75%); background-size: 200% 100%; animation: shimmer 1.5s infinite; }
.skel-line { margin: 12px; height: 12px; border-radius: 6px; background: linear-gradient(90deg, var(--border-light) 25%, var(--surface) 50%, var(--border-light) 75%); background-size: 200% 100%; animation: shimmer 1.5s infinite; }
.skel-line-1 { width: 60%; } .skel-line-2 { width: 80%; } .skel-line-3 { width: 50%; }
@keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }

.product-card { background: var(--white); border: 1.5px solid var(--border-light); border-radius: var(--radius-lg); overflow: hidden; text-decoration: none; display: flex; flex-direction: column; transition: all .2s; }
.product-card:hover { border-color: var(--gold); transform: translateY(-4px); box-shadow: var(--shadow-md); }
.product-img-wrap { position: relative; height: 180px; background: var(--surface); overflow: hidden; display: flex; align-items: center; justify-content: center; }
.product-img { width: 100%; height: 100%; object-fit: cover; transition: transform .3s; }
.product-card:hover .product-img { transform: scale(1.05); }
.product-emoji { font-size: 56px; }
.product-badge-wrap { position: absolute; top: 8px; left: 8px; display: flex; gap: 4px; flex-direction: column; }
.prod-badge { font-size: 10px; font-weight: 700; padding: 3px 8px; border-radius: var(--radius-pill); }
.prod-badge.out { background: #FEE2E2; color: #991B1B; }
.prod-badge.low { background: #FEF3C7; color: #92400E; }
.product-info { padding: 14px; display: flex; flex-direction: column; gap: 6px; flex: 1; }
.product-cat { font-size: 10px; font-weight: 700; color: var(--gold); text-transform: uppercase; letter-spacing: .06em; }
.product-name { font-size: 13px; font-weight: 700; color: var(--dark); line-height: 1.4; }
.product-weight { display: flex; align-items: center; gap: 4px; font-size: 11px; color: var(--subtle); }
.product-weight svg { width: 11px; height: 11px; }
.product-prices { display: flex; flex-direction: column; gap: 4px; margin-top: 2px; }
.price-base { display: flex; align-items: center; justify-content: space-between; }
.price-label { font-size: 11px; color: var(--subtle); }
.price-val { font-size: 15px; font-weight: 800; color: var(--dark); font-family: var(--font-display); }
.price-delivery-row { display: flex; gap: 6px; }
.price-fast, .price-simple { flex: 1; display: flex; flex-direction: column; padding: 5px 7px; border-radius: var(--radius-sm); font-size: 10px; }
.price-fast { background: #FEF3C7; color: #92400E; }
.price-simple { background: #DBEAFE; color: #1E40AF; }
.price-fast span, .price-simple span { font-weight: 600; margin-bottom: 1px; }
.price-fast strong, .price-simple strong { font-size: 12px; font-weight: 800; }
.product-btn { margin-top: auto; height: 38px; border-radius: var(--radius-md); border: none; background: var(--gold); color: white; font-size: 12px; font-weight: 700; font-family: var(--font-body); cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 6px; transition: all .15s; }
.product-btn svg { width: 13px; height: 13px; }
.product-btn:hover:not(:disabled) { background: var(--gold-dark); }
.product-btn:disabled { background: var(--border); color: var(--subtle); cursor: not-allowed; }

/* ══ DELIVERY ══ */
.delivery-section { background: var(--dark); padding: 48px 24px; }
.delivery-header { text-align: center; margin-bottom: 32px; }
.delivery-title { font-family: var(--font-display); font-size: 28px; font-weight: 700; color: white; margin-bottom: 8px; }
.delivery-sub { font-size: 14px; color: rgba(255,255,255,0.4); }
.delivery-cards { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
.del-card { border-radius: var(--radius-xl); padding: 28px; display: flex; flex-direction: column; gap: 16px; }
.del-card-fast   { background: rgba(232,160,32,0.1); border: 1.5px solid rgba(232,160,32,0.2); }
.del-card-simple { background: rgba(255,255,255,0.04); border: 1.5px solid rgba(255,255,255,0.08); }
.del-card-top { display: flex; align-items: center; gap: 14px; }
.del-icon { width: 44px; height: 44px; border-radius: var(--radius-md); display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.del-card-fast   .del-icon { background: rgba(232,160,32,0.2); color: var(--gold); }
.del-card-simple .del-icon { background: rgba(255,255,255,0.08); color: rgba(255,255,255,0.6); }
.del-icon svg { width: 20px; height: 20px; }
.del-type { flex: 1; }
.del-name { display: block; font-size: 15px; font-weight: 700; color: white; }
.del-days { font-size: 12px; color: rgba(255,255,255,0.4); margin-top: 2px; display: block; }
.del-rate { font-family: var(--font-display); font-size: 26px; font-weight: 700; color: var(--gold); }
.del-rate-dark { color: rgba(255,255,255,0.6); }
.del-rate span { font-size: 14px; font-weight: 400; }
.del-features { list-style: none; display: flex; flex-direction: column; gap: 6px; }
.del-features li { font-size: 13px; color: rgba(255,255,255,0.5); }
.del-card-fast .del-features li { color: rgba(232,160,32,0.8); }
.del-cta { height: 42px; border-radius: var(--radius-pill); display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 700; text-decoration: none; transition: all .15s; }
.del-cta-fast { background: var(--gold); color: white; }
.del-cta-fast:hover { background: var(--gold-dark); }
.del-cta-simple { border: 1.5px solid rgba(255,255,255,0.15); color: rgba(255,255,255,0.6); }
.del-cta-simple:hover { border-color: var(--gold); color: var(--gold); background: var(--gold-glow); }

/* ══ CTA ══ */
.cta-section { background: linear-gradient(135deg, var(--gold) 0%, var(--gold-dark) 100%); padding: 48px 24px; }
.cta-inner { display: flex; align-items: center; justify-content: space-between; gap: 32px; flex-wrap: wrap; }
.cta-title { font-family: var(--font-display); font-size: 28px; font-weight: 700; color: white; margin-bottom: 6px; }
.cta-sub { font-size: 14px; color: rgba(255,255,255,0.75); }
.cta-actions { display: flex; gap: 12px; flex-wrap: wrap; }
.cta-btn-main { height: 46px; padding: 0 28px; border-radius: var(--radius-pill); background: white; color: var(--gold-dark); font-size: 14px; font-weight: 800; text-decoration: none; display: flex; align-items: center; transition: all .15s; }
.cta-btn-main:hover { transform: translateY(-2px); }
.cta-btn-sec { height: 46px; padding: 0 24px; border-radius: var(--radius-pill); border: 2px solid rgba(255,255,255,0.4); color: white; font-size: 14px; font-weight: 700; text-decoration: none; display: flex; align-items: center; transition: all .15s; }
.cta-btn-sec:hover { background: rgba(255,255,255,0.15); border-color: white; }

/* ══ RESPONSIVE ══ */
@media (max-width: 900px) {
  .categories-grid { grid-template-columns: repeat(3, 1fr); }
  .products-grid { grid-template-columns: repeat(2, 1fr); }
  .delivery-cards { grid-template-columns: 1fr; }
  .steps-grid { grid-template-columns: repeat(3, 1fr); gap: 16px; }
  .step-connector { display: none; }
}
@media (max-width: 600px) {
  .categories-grid { grid-template-columns: repeat(2, 1fr); }
  .products-grid { grid-template-columns: 1fr 1fr; }
  .steps-grid { grid-template-columns: repeat(2, 1fr); }
  .cta-inner { flex-direction: column; text-align: center; }
  .cta-actions { justify-content: center; }
}
</style>