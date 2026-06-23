<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import type { Product, Category } from '~/features/products/types'
import { onMounted, ref } from 'vue'

definePageMeta({ layout: 'default' })

const config     = useRuntimeConfig()
const API        = config.public.apiBase
const { locale } = useI18n()
const isNativeApp = ref(false)

// ── Cart & quick-add ──────────────────────────────────────────────────────────
const {
  fmt,
  clientPrice,
  firstImage,
} = useProductCatalog()

// ── SSR data fetching ─────────────────────────────────────────────────────────
// Runs on the server → no loading flash, better SEO, no onMounted needed
const { data: productsData, error: productsError } = await useAsyncData(
  'home-products',
  () => $fetch<{ items: Product[] }>(`${API}/products?limit=8&status=ACTIVE&sort=popular`)
)

const { data: categoriesData, error: categoriesError } = await useAsyncData(
  'home-categories',
  () => $fetch<Category[]>(`${API}/products/categories/all`)
)

const products   = computed(() => productsData.value?.items   ?? [])
const categories = computed(() => categoriesData.value        ?? [])

// ── Category images ───────────────────────────────────────────────────────────
const CAT_IMAGES: Record<string, string> = {
  'Elektronika': '/images/categories/electronics.png',
  'Электроника': '/images/categories/electronics.png',
  'Aksesuar':    '/images/categories/accessories.png',
  'Аксессуары':  '/images/categories/accessories.png',
  'Egin-eşik':   '/images/categories/clothing.png',
  'Одежда':      '/images/categories/clothing.png',
  'Gözellik':    '/images/categories/beauty.png',
  'Красота':     '/images/categories/beauty.png',
  'Öý üçin':    '/images/categories/home.png',
  'Для дома':    '/images/categories/home.png',
}

function catImage(c: Category): string {
  if (c.imageUrl) return c.imageUrl
  return CAT_IMAGES[c.nameTk] ?? CAT_IMAGES[c.nameRu] ?? ''
}

// ── Steps ─────────────────────────────────────────────────────────────────────
const steps = computed(() => locale.value === 'tk' ? [
  { num: 1, icon: 'user',   color: '#E8A020', title: 'Hasap Aç',     desc: 'E-poçtaňyz bilen mugt hasap açyň.' },
  { num: 2, icon: 'search', color: '#3B82F6', title: 'Haryt Saýla',  desc: 'Müňlerçe harydyň içinden gerekliňizi tapyň.' },
  { num: 3, icon: 'cart',   color: '#22C55E', title: 'Sargyt Et',    desc: 'Sebede goşuň we sargydyňyzy tassyklaň.' },
  { num: 4, icon: 'truck',  color: '#8B5CF6', title: 'Garaşyň',      desc: 'Sargydyňyz taýýarlanýar we iberilyär.' },
  { num: 5, icon: 'pay',    color: '#EF4444', title: 'Alyň & Töläň', desc: 'Harydyňyz gowşurylýar — alyň we töläň.' },
] : [
  { num: 1, icon: 'user',   color: '#E8A020', title: 'Регистрация',  desc: 'Создайте бесплатный аккаунт.' },
  { num: 2, icon: 'search', color: '#3B82F6', title: 'Выбор товара', desc: 'Найдите нужный товар среди тысяч позиций.' },
  { num: 3, icon: 'cart',   color: '#22C55E', title: 'Оформить',     desc: 'Добавьте в корзину и подтвердите заказ.' },
  { num: 4, icon: 'truck',  color: '#8B5CF6', title: 'Ожидание',     desc: 'Заказ обрабатывается и отправляется.' },
  { num: 5, icon: 'pay',    color: '#EF4444', title: 'Получить',     desc: 'Получите посылку и оплатите.' },
])

useHead({
  title: computed(() =>
    locale.value === 'tk' ? 'ChinaExpress — Baş sahypa' : 'ChinaExpress — Главная'
  ),
})

onMounted(() => {
  // Capacitor injects window.Capacitor when running inside the native app
  isNativeApp.value = !!(window as any).Capacitor?.isNativePlatform?.()
})
</script>

<template>
  <div class="home">

    <!-- ══ HERO ══════════════════════════════════════════════════════════════ -->
    <section class="hero">
      <div class="hero-blob hero-blob-1" />
      <div class="hero-blob hero-blob-2" />

      <div class="hero-inner">
        <!-- Left: text -->
        <div class="hero-content">
          <div class="hero-badge">
            🇨🇳 {{ locale === 'tk' ? 'Hytaýdan Göni Siziň Gapyňyza' : 'Прямо из Китая к вашей двери' }}
          </div>

          <h1 class="hero-title">
            {{ locale === 'tk' ? 'Iň Gowy Önümleri' : 'Лучшие товары' }}<br>
            <em>{{ locale === 'tk' ? 'Amatly Bahadan Al' : 'По лучшей цене' }}</em>
          </h1>

          <p class="hero-sub">
            {{ locale === 'tk'
              ? 'Müňlerçe haryt, çalt eltip bermek we amatly töleg — hemmesi bir ýerde.'
              : 'Тысячи товаров, быстрая доставка и удобная оплата — всё в одном месте.' }}
          </p>

          <div class="hero-actions">
            <NuxtLink to="/products" class="hero-btn-primary">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
                <line x1="3" y1="6" x2="21" y2="6"/>
                <path d="M16 10a4 4 0 0 1-8 0"/>
              </svg>
              {{ locale === 'tk' ? 'Harytlara Göz Gezdiriň' : 'Смотреть товары' }}
            </NuxtLink>
            <a
              v-if="!isNativeApp"
              href="https://github.com/babon55/chinabox-client/releases/download/v1.0.0/app-release.apk"
              class="hero-btn-apk"
              download
            >
              <span class="apk-pulse-dot" />
              <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                <path d="M17.523 15.34c-.5 0-.91-.41-.91-.91s.41-.91.91-.91.91.41.91.91-.41.91-.91.91M6.477 15.34c-.5 0-.91-.41-.91-.91s.41-.91.91-.91.91.41.91.91-.41.91-.91.91M17.81 9.74l1.92-3.32a.4.4 0 0 0-.15-.55.4.4 0 0 0-.55.15l-1.94 3.36a11.7 11.7 0 0 0-9.07 0L6.06 6.02a.4.4 0 0 0-.55-.15.4.4 0 0 0-.15.55l1.92 3.32C3.97 11.39 1.69 14.6 1.27 18.4h21.46c-.42-3.8-2.7-7.01-6.22-8.66"/>
              </svg>
              <span class="apk-text">
                <span class="apk-label">{{ locale === 'tk' ? 'Ýüklemek' : 'Скачать' }}</span>
                <span class="apk-sub">{{ locale === 'tk' ? 'Android Programmany Ýükle' : 'Скачать Android приложение' }}</span>
              </span>
            </a>
            <NuxtLink to="/track" class="hero-btn-secondary">
              {{ locale === 'tk' ? 'Sargyt Yzarla' : 'Отследить заказ' }}
            </NuxtLink>
          </div>
        </div>

        <!-- Right: floating visual -->
        <div class="hero-visual">
          <div class="hero-globe">🛍️</div>

          <div class="hero-card hero-card-1">
            <div class="hc-icon">📦</div>
            <div>
              <div class="hc-title">{{ locale === 'tk' ? 'Çalt Eltip Bermek' : 'Быстрая доставка' }}</div>
              <div class="hc-sub">1-2 {{ locale === 'tk' ? 'gün' : 'дней' }}</div>
            </div>
          </div>

          <div class="hero-card hero-card-2">
            <div class="hc-icon">⭐</div>
            <div>
              <div class="hc-title">{{ locale === 'tk' ? 'Ýokary Hilli' : 'Высокое качество' }}</div>
              <div class="hc-stars">★★★★★</div>
            </div>
          </div>

          <div class="hero-card hero-card-3">
            <div class="hc-icon">💳</div>
            <div>
              <div class="hc-title">{{ locale === 'tk' ? 'Amatly Töleg' : 'Удобная оплата' }}</div>
              <div class="hc-sub">{{ locale === 'tk' ? 'Gowşurylanda töle' : 'Оплата при получении' }}</div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ══ HOW IT WORKS ══════════════════════════════════════════════════════ -->
    <section class="steps-section">
      <div class="steps-inner">
        <div class="steps-head">
          <h2 class="steps-title">{{ locale === 'tk' ? 'Nädip Işleýär?' : 'Как это работает?' }}</h2>
          <p class="steps-sub">{{ locale === 'tk' ? 'Diňe 5 ädimde sargydyňyz gapyňyza gowşurylýar' : 'Всего 5 шагов — и заказ у вас дома' }}</p>
        </div>
        <div class="steps-grid">
          <div v-for="s in steps" :key="s.num" class="step-card">
            <div class="step-num-wrap">
              <div class="step-num" :style="{ background: s.color + '22', color: s.color }">{{ s.num }}</div>
              <div v-if="s.num < 5" class="step-connector" />
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

    <!-- ══ CATEGORIES ════════════════════════════════════════════════════════ -->
    <section class="full-section white-bg">
      <div class="inner">
        <div class="section-head">
          <h2 class="section-title">{{ locale === 'tk' ? 'Kategoriýalar' : 'Категории' }}</h2>
          <NuxtLink to="/products" class="see-all">
            {{ locale === 'tk' ? 'Hemmesini Gör' : 'Все категории' }}
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </NuxtLink>
        </div>

        <!-- Error state -->
        <div v-if="categoriesError" class="error-state">
          <span>⚠️</span>
          {{ locale === 'tk' ? 'Kategoriýalar ýüklenip bilinmedi.' : 'Не удалось загрузить категории.' }}
        </div>

        <div v-else class="categories-grid">
          <NuxtLink v-for="c in categories.filter(c => !c.parentId)" :key="c.id" :to="`/products?category=${c.id}`" class="cat-card">
            <div class="cat-img-wrap">
              <img
                v-if="catImage(c)"
                :src="catImage(c)"
                class="cat-img"
                :alt="locale === 'tk' ? c.nameTk : c.nameRu"
              />
              <div v-else class="cat-initial">
                {{ (locale === 'tk' ? c.nameTk : c.nameRu)?.[0]?.toUpperCase() }}
              </div>
            </div>
            <span class="cat-name">{{ locale === 'tk' ? c.nameTk : c.nameRu }}</span>
            <div class="cat-arrow">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </div>
          </NuxtLink>
        </div>
      </div>
    </section>

    <!-- ══ PRODUCTS ══════════════════════════════════════════════════════════ -->
    <section class="full-section surface-bg">
      <div class="inner">
        <div class="section-head">
          <h2 class="section-title">{{ locale === 'tk' ? 'Meşhur Önümler' : 'Популярные товары' }}</h2>
          <NuxtLink to="/products" class="see-all">
            {{ locale === 'tk' ? 'Hemmesini Gör' : 'Смотреть все' }}
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </NuxtLink>
        </div>

        <!-- Error state -->
        <div v-if="productsError" class="error-state">
          <span>⚠️</span>
          {{ locale === 'tk' ? 'Önümler ýüklenip bilinmedi.' : 'Не удалось загрузить товары.' }}
          <NuxtLink to="/products" class="error-link">
            {{ locale === 'tk' ? 'Hemmesine bak' : 'Перейти к товарам' }}
          </NuxtLink>
        </div>

        <div v-else class="products-grid">
          <NuxtLink
            v-for="p in products"
            :key="p.id"
            :to="`/products/${p.id}`"
            class="product-card"
          >
            <div class="product-img-wrap">
              <img
                v-if="firstImage(p)"
                :src="firstImage(p)!"
                :alt="locale === 'tk' ? p.nameTk : p.nameRu"
                class="product-img"
              />
              <div v-else class="product-emoji">{{ p.image }}</div>
              <div class="product-badge-wrap">
                <span v-if="p.stock === 0"      class="prod-badge out">{{ locale === 'tk' ? 'Gutardy' : 'Нет' }}</span>
                <span v-else-if="p.stock <= 10" class="prod-badge low">{{ locale === 'tk' ? 'Az galdy' : 'Мало' }}</span>
              </div>
            </div>

            <div class="product-info">
              <div class="product-cat">{{ locale === 'tk' ? p.category?.nameTk : p.category?.nameRu }}</div>
              <div class="product-name">{{ locale === 'tk' ? p.nameTk : p.nameRu }}</div>
              <div class="product-price-wrap">
                <span class="product-price">{{ fmt(clientPrice(Number(p.price), p.markup)) }} TMT</span>
              </div>
            </div>
          </NuxtLink>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.home { background: var(--surface); }

/* ══ Layout helpers ══ */
.full-section  { padding: 48px 24px; }
.white-bg      { background: var(--white); }
.surface-bg    { background: var(--surface); }
.inner         { max-width: 1200px; margin: 0 auto; }
.section-head  { display: flex; align-items: center; justify-content: space-between; margin-bottom: 28px; }
.section-title { font-family: var(--font-display); font-size: 26px; font-weight: 700; color: var(--dark); }
.see-all       { display: inline-flex; align-items: center; gap: 6px; font-size: 13px; font-weight: 700; color: var(--gold); text-decoration: none; transition: gap .15s; }
.see-all svg   { width: 14px; height: 14px; }
.see-all:hover { gap: 10px; }

/* ══ Error state ══ */
.error-state {
  display: flex; align-items: center; gap: 10px;
  padding: 20px; border-radius: var(--radius-lg);
  background: #FEF3C7; color: #92400E;
  font-size: 14px; font-weight: 500;
}
.error-link {
  margin-left: auto; color: var(--gold);
  font-weight: 700; text-decoration: none;
}
.error-link:hover { text-decoration: underline; }

/* ══ HERO ══ */
.hero {
  position: relative; overflow: hidden;
  background: linear-gradient(135deg, #0f1117 0%, #1a1d2e 50%, #0f1117 100%);
  padding: 72px 24px 80px;
}
.hero-blob { position: absolute; border-radius: 50%; filter: blur(80px); pointer-events: none; }
.hero-blob-1 { width: 500px; height: 500px; background: rgba(232,160,32,0.12); top: -100px; right: -100px; }
.hero-blob-2 { width: 300px; height: 300px; background: rgba(59,130,246,0.08); bottom: -80px; left: 10%; }
.hero-inner {
  max-width: 1200px; margin: 0 auto;
  display: grid; grid-template-columns: 1fr 1fr;
  gap: 60px; align-items: center; position: relative; z-index: 1;
}
.hero-content { display: flex; flex-direction: column; gap: 24px; }
.hero-badge {
  display: inline-flex; align-items: center; width: fit-content;
  padding: 6px 14px; border-radius: 50px;
  background: rgba(232,160,32,0.15); border: 1px solid rgba(232,160,32,0.3);
  font-size: 13px; font-weight: 700; color: #E8A020;
}
.hero-title { font-family: var(--font-display); font-size: 52px; font-weight: 800; color: white; line-height: 1.1; margin: 0; }
.hero-title em {
  font-style: normal;
  background: linear-gradient(135deg, #E8A020, #FF8C00);
  -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
}
.hero-sub { font-size: 16px; color: rgba(255,255,255,0.55); line-height: 1.6; margin: 0; }
.hero-actions { display: flex; gap: 12px; flex-wrap: wrap; }
.hero-btn-primary {
  display: inline-flex; align-items: center; gap: 8px;
  height: 48px; padding: 0 24px; border-radius: 50px;
  background: linear-gradient(135deg, #E8A020, #FF8C00);
  color: white; font-size: 14px; font-weight: 700; text-decoration: none;
  transition: all .2s; box-shadow: 0 8px 24px rgba(232,160,32,0.35);
}
.hero-btn-primary:hover { transform: translateY(-2px); box-shadow: 0 12px 32px rgba(232,160,32,0.5); }
.hero-btn-secondary {
  display: inline-flex; align-items: center;
  height: 48px; padding: 0 24px; border-radius: 50px;
  border: 1.5px solid rgba(255,255,255,0.2);
  color: rgba(255,255,255,0.8); font-size: 14px; font-weight: 700; text-decoration: none;
  transition: all .2s;
}
.hero-btn-secondary:hover { border-color: rgba(255,255,255,0.5); color: white; background: rgba(255,255,255,0.06); }

.hero-btn-apk {
  position: relative;
  display: inline-flex; align-items: center; gap: 10px;
  height: 48px; padding: 0 22px; border-radius: 50px;
  border: none;
  color: white; font-family: var(--font-body);
  text-decoration: none; transition: all .2s;
  background: linear-gradient(135deg, #3DDC84, #196e3b);
  box-shadow: 0 8px 24px rgba(61,220,132,0.35);
  animation: apk-glow 2.4s ease-in-out infinite;
}
.hero-btn-apk:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 32px rgba(61,220,132,0.55);
}
.apk-text { display: flex; flex-direction: column; align-items: flex-start; line-height: 1.15; }
.apk-label { font-size: 13px; font-weight: 800; }
.apk-sub   { font-size: 10px; font-weight: 600; opacity: .85; letter-spacing: .03em; }

.apk-pulse-dot {
  position: absolute; top: -4px; right: -4px;
  width: 12px; height: 12px; border-radius: 50%;
  background: #FF8C00;
  box-shadow: 0 0 0 0 rgba(255,140,0,0.6);
  animation: apk-pulse 1.8s ease-out infinite;
}

@keyframes apk-glow {
  0%, 100% { box-shadow: 0 8px 24px rgba(61,220,132,0.35); }
  50%      { box-shadow: 0 8px 32px rgba(61,220,132,0.6); }
}
@keyframes apk-pulse {
  0%   { box-shadow: 0 0 0 0 rgba(255,140,0,0.6); }
  70%  { box-shadow: 0 0 0 8px rgba(255,140,0,0); }
  100% { box-shadow: 0 0 0 0 rgba(255,140,0,0); }
}

@media (prefers-reduced-motion: reduce) {
  .hero-btn-apk, .apk-pulse-dot { animation: none; }
}
.hero-stats { display: flex; align-items: center; gap: 20px; padding-top: 8px; }
.hero-stat  { display: flex; flex-direction: column; gap: 2px; }
.hero-stat strong { font-family: var(--font-display); font-size: 22px; font-weight: 800; color: white; }
.hero-stat span   { font-size: 11px; color: rgba(255,255,255,0.4); text-transform: uppercase; letter-spacing: .06em; }
.hero-stat-divider { width: 1px; height: 36px; background: rgba(255,255,255,0.1); }
.hero-visual { position: relative; height: 340px; display: flex; align-items: center; justify-content: center; }
.hero-globe { font-size: 140px; line-height: 1; filter: drop-shadow(0 20px 60px rgba(0,0,0,0.5)); animation: float 4s ease-in-out infinite; }
@keyframes float { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-12px); } }
.hero-card {
  position: absolute; display: flex; align-items: center; gap: 12px;
  background: rgba(255,255,255,0.06); backdrop-filter: blur(12px);
  border: 1px solid rgba(255,255,255,0.12); border-radius: 16px; padding: 12px 16px; white-space: nowrap;
}
.hero-card-1 { top: 20px;    left: -20px;  animation: float 4s ease-in-out infinite 0.5s; }
.hero-card-2 { top: 30px;    right: -10px; animation: float 4s ease-in-out infinite 1s; }
.hero-card-3 { bottom: 30px; left: 10px;   animation: float 4s ease-in-out infinite 1.5s; }
.hc-icon  { font-size: 28px; }
.hc-title { font-size: 13px; font-weight: 700; color: white; }
.hc-sub   { font-size: 11px; color: rgba(255,255,255,0.5); margin-top: 2px; }
.hc-stars { font-size: 12px; color: #E8A020; margin-top: 2px; }

/* ══ HOW IT WORKS ══ */
.steps-section { background:  #0f172a; padding: 48px 24px; }
.steps-inner   { max-width: 1200px; margin: 0 auto; }
.steps-head    { text-align: center; margin-bottom: 36px; }
.steps-title   { font-family: var(--font-display); font-size: 26px; font-weight: 700; color: white; margin-bottom: 8px; }
.steps-sub     { font-size: 14px; color: rgba(255,255,255,0.4); }
.steps-grid    { display: grid; grid-template-columns: repeat(5, 1fr); gap: 0; }
.step-card     { display: flex; flex-direction: column; align-items: center; text-align: center; gap: 12px; padding: 8px 12px; position: relative; }
.step-num-wrap { display: flex; align-items: center; width: 100%; justify-content: center; position: relative; margin-bottom: 4px; }
.step-num      { width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 800; z-index: 1; flex-shrink: 0; }
.step-connector { position: absolute; top: 50%; left: calc(50% + 20px); right: calc(-50% + 20px); height: 1.5px; background: rgba(255,255,255,0.08); z-index: 0; }
.step-icon-wrap { width: 56px; height: 56px; border-radius: var(--radius-lg); display: flex; align-items: center; justify-content: center; }
.step-icon-wrap svg { width: 24px; height: 24px; }
.step-title { font-size: 14px; font-weight: 700; color: white; }
.step-desc  { font-size: 12px; color: rgba(255,255,255,0.4); line-height: 1.5; }

/* ══ CATEGORIES ══ */
.categories-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 12px; }
.cat-card {
  background: var(--surface); border: 1.5px solid var(--border-light); border-radius: var(--radius-lg);
  padding: 20px 16px; display: flex; flex-direction: column; align-items: center; gap: 10px;
  text-decoration: none; transition: all .2s; position: relative; overflow: hidden;
}
.cat-card::before { content: ''; position: absolute; bottom: 0; left: 0; right: 0; height: 2px; background: var(--gold); transform: scaleX(0); transition: transform .2s; }
.cat-card:hover { border-color: var(--gold); transform: translateY(-3px); box-shadow: var(--shadow-md); }
.cat-card:hover::before { transform: scaleX(1); }
.cat-card:hover .cat-arrow { opacity: 1; transform: translateX(3px); }
.cat-img-wrap  { width: 100%; height: 120px; border-radius: 10px; overflow: hidden; background: var(--surface); }
.cat-img       { width: 100%; height: 100%; object-fit: cover; transition: transform .3s; }
.cat-card:hover .cat-img { transform: scale(1.05); }
.cat-initial   { width: 100%; height: 100%; background: linear-gradient(135deg, #E8A020, #FF8C00); color: white; font-size: 28px; font-weight: 800; display: flex; align-items: center; justify-content: center; }
.cat-name  { font-size: 13px; font-weight: 700; color: var(--dark); text-align: center; }
.cat-arrow { width: 20px; height: 20px; color: var(--gold); opacity: 0; transition: all .2s; }
.cat-arrow svg { width: 100%; height: 100%; }

/* ══ PRODUCTS ══ */
.products-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; }
.product-card  { background: var(--white); border: 1.5px solid var(--border-light); border-radius: var(--radius-lg); overflow: hidden; text-decoration: none; display: flex; flex-direction: column; transition: all .2s; }
.product-card:hover { border-color: var(--gold); transform: translateY(-4px); box-shadow: var(--shadow-md); }
.product-img-wrap { position: relative; height: 180px; background: var(--surface); overflow: hidden; display: flex; align-items: center; justify-content: center; }
.product-img   { width: 100%; height: 100%; object-fit: cover; transition: transform .3s; }
.product-card:hover .product-img { transform: scale(1.05); }
.product-emoji { font-size: 56px; }
.product-badge-wrap { position: absolute; top: 8px; left: 8px; display: flex; gap: 4px; flex-direction: column; }
.prod-badge    { font-size: 10px; font-weight: 700; padding: 3px 8px; border-radius: var(--radius-pill); }
.prod-badge.out { background: #FEE2E2; color: #991B1B; }
.prod-badge.low { background: #FEF3C7; color: #92400E; }
.product-info  { padding: 14px; display: flex; flex-direction: column; gap: 6px; flex: 1; }
.product-cat   { font-size: 10px; font-weight: 700; color: var(--gold); text-transform: uppercase; letter-spacing: .06em; }
.product-name  { font-size: 13px; font-weight: 700; color: var(--dark); line-height: 1.4; }
.product-price-wrap { margin-top: 4px; }
.product-price { font-family: var(--font-display); font-size: 18px; font-weight: 800; color: var(--gold); }
.product-btn {
  margin-top: auto; height: 38px; border-radius: var(--radius-md); border: none;
  background: var(--gold); color: white; font-size: 12px; font-weight: 700;
  font-family: var(--font-body); cursor: pointer;
  display: flex; align-items: center; justify-content: center; gap: 6px;
  transition: all .15s;
}
.product-btn svg { width: 13px; height: 13px; }
.product-btn:hover:not(:disabled) { background: var(--gold-dark); }
.product-btn:disabled { background: var(--border); color: var(--subtle); cursor: not-allowed; }
/* ✅ Green flash when item is added */
.product-btn.added { background: #22C55E; }

/* ══ RESPONSIVE ══ */
@media (max-width: 1024px) {
  .hero-inner { grid-template-columns: 1fr; gap: 40px; }
  .hero-visual { height: 220px; }
  .hero-title { font-size: 40px; }
  .hero-globe { font-size: 100px; }
}
@media (max-width: 900px) {
  .categories-grid { grid-template-columns: repeat(3, 1fr); }
  .products-grid   { grid-template-columns: repeat(2, 1fr); }
  .steps-grid      { grid-template-columns: repeat(3, 1fr); gap: 16px; }
  .step-connector  { display: none; }
}
@media (max-width: 600px) {
  .hero-title  { font-size: 32px; }
  .hero-visual { display: none; }
  .categories-grid { grid-template-columns: repeat(2, 1fr); }
  .products-grid   { grid-template-columns: 1fr 1fr; }
  .steps-grid      { grid-template-columns: repeat(2, 1fr); }
}
</style>