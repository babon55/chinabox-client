<script setup lang="ts">
import { useI18n } from 'vue-i18n'

// prop kept so the parent doesn't need changes, but lang comes from i18n
defineProps<{ currentLang?: string }>()

const { locale } = useI18n()
const lang = computed(() => locale.value)

const steps = computed(() => [
  {
    icon: '🔐',
    title: lang.value === 'tk' ? 'Giriş ediň'      : 'Войдите',
    desc:  lang.value === 'tk' ? 'Hasabyňyzy açyň' : 'Откройте аккаунт',
  },
  {
    icon: '🛍️',
    title: lang.value === 'tk' ? 'Sargyt ediň'     : 'Заказывайте',
    desc:  lang.value === 'tk' ? 'Önümleri saýlaň' : 'Выбирайте товары',
  },
  {
    icon: '🚀',
    title: lang.value === 'tk' ? 'Eltip berler'    : 'Получайте',
    desc:  lang.value === 'tk' ? 'Gapyňyza çenli'  : 'До вашей двери',
  },
])

const testimonial = computed(() => ({
  tk: {
    text: '"SilkShop bilen haryt satyn almak örän aňsat boldy. Maslahat berýärin!"',
    name: 'Merdan A.',
    role: 'Müşderi',
  },
  ru: {
    text: '"С SilkShop покупать товары стало очень просто. Рекомендую!"',
    name: 'Мердан А.',
    role: 'Покупатель',
  },
}[lang.value as 'tk' | 'ru']))
</script>

<template>
  <div class="side-panel">
    <!-- Background shapes -->
    <div class="bg-orb bg-orb-1" />
    <div class="bg-orb bg-orb-2" />
    <div class="bg-grid" />

    <!-- Logo -->
    <NuxtLink to="/" class="side-logo">
      <div class="side-logo-icon">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
          <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
          <line x1="12" y1="22.08" x2="12" y2="12"/>
        </svg>
      </div>
      <span class="side-logo-name">SilkShop</span>
    </NuxtLink>

    <!-- Hero -->
    <div class="side-hero">
      <h2 class="side-title">
        {{ lang === 'tk' ? 'Hoş Geldiňiz\nYzyna!' : 'С Возвращением!' }}
      </h2>
      <p class="side-desc">
        {{ lang === 'tk'
          ? 'Hasabyňyza giriş edip, şahsy sargyt taryhyňyzy we arzanladyşlaryňyzy görüň.'
          : 'Войдите в аккаунт, чтобы увидеть историю заказов и персональные скидки.' }}
      </p>
    </div>

    <!-- How it works steps -->
    <div class="steps">
      <div v-for="(step, i) in steps" :key="i" class="step-item">
        <div class="step-icon">{{ step.icon }}</div>
        <div class="step-connector" v-if="i < steps.length - 1" />
        <div class="step-text">
          <span class="step-title">{{ step.title }}</span>
          <span class="step-desc">{{ step.desc }}</span>
        </div>
      </div>
    </div>

    <!-- Testimonial card -->
    <div class="testimonial-card">
      <div class="quote-icon">"</div>
      <p class="testimonial-text">{{ testimonial.text }}</p>
      <div class="testimonial-author">
        <div class="author-avatar">{{ testimonial.name[0] }}</div>
        <div class="author-info">
          <span class="author-name">{{ testimonial.name }}</span>
          <span class="author-role">{{ testimonial.role }}</span>
        </div>
        <div class="star-row">
          <span v-for="i in 5" :key="i" class="star">★</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.side-panel {
  position: relative;
  width: 100%; height: 100%;
  background: linear-gradient(160deg, #0F1117 0%, #161B2E 50%, #0F1117 100%);
  padding: 48px 44px;
  display: flex; flex-direction: column; gap: 32px;
  overflow: hidden;
}

/* background decorations */
.bg-orb { position: absolute; border-radius: 50%; pointer-events: none; }
.bg-orb-1 {
  width: 340px; height: 340px; top: -100px; right: -100px;
  background: radial-gradient(circle, rgba(232,160,32,0.1) 0%, transparent 70%);
}
.bg-orb-2 {
  width: 220px; height: 220px; bottom: 120px; left: -60px;
  background: radial-gradient(circle, rgba(99,102,241,0.08) 0%, transparent 70%);
}
.bg-grid {
  position: absolute; inset: 0; pointer-events: none; opacity: 0.03;
  background-image: linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px),
                    linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px);
  background-size: 40px 40px;
}

/* Logo */
.side-logo { display: flex; align-items: center; gap: 10px; text-decoration: none; z-index: 1; }
.side-logo-icon {
  width: 40px; height: 40px;
  background: linear-gradient(135deg, #E8A020, #FF8C00);
  border-radius: 11px;
  display: flex; align-items: center; justify-content: center;
  color: white; box-shadow: 0 4px 14px rgba(232,160,32,0.35);
}
.side-logo-name {
  font-family: 'Playfair Display', serif;
  font-size: 22px; font-weight: 700; color: white;
}

/* Hero */
.side-hero { z-index: 1; }
.side-title {
  font-family: 'Playfair Display', serif;
  font-size: 38px; font-weight: 700; color: white;
  line-height: 1.15; margin-bottom: 14px; white-space: pre-line;
}
.side-desc {
  font-size: 14px; color: rgba(255,255,255,0.5);
  line-height: 1.7; font-family: 'Plus Jakarta Sans', sans-serif;
}

/* Steps */
.steps { display: flex; flex-direction: column; gap: 0; z-index: 1; }
.step-item {
  display: flex; align-items: flex-start; gap: 14px;
  position: relative;
}
.step-icon {
  width: 44px; height: 44px; flex-shrink: 0;
  background: rgba(255,255,255,0.07);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 12px;
  display: flex; align-items: center; justify-content: center;
  font-size: 20px; z-index: 1;
}
.step-connector {
  position: absolute;
  left: 21px; top: 44px;
  width: 2px; height: 24px;
  background: linear-gradient(to bottom, rgba(232,160,32,0.4), rgba(232,160,32,0.05));
}
.step-text {
  display: flex; flex-direction: column; gap: 2px;
  padding: 10px 0;
}
.step-title {
  font-size: 14px; font-weight: 700; color: white;
  font-family: 'Plus Jakarta Sans', sans-serif;
}
.step-desc {
  font-size: 12px; color: rgba(255,255,255,0.45);
  font-family: 'Plus Jakarta Sans', sans-serif;
}

/* Testimonial */
.testimonial-card {
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(255,255,255,0.09);
  border-radius: 18px;
  padding: 22px 24px;
  position: relative;
  z-index: 1;
  margin-top: auto;
}
.quote-icon {
  font-family: 'Playfair Display', serif;
  font-size: 52px; line-height: 0.6;
  color: #E8A020; opacity: 0.6;
  margin-bottom: 10px;
}
.testimonial-text {
  font-size: 13px; color: rgba(255,255,255,0.75);
  line-height: 1.65; font-family: 'Plus Jakarta Sans', sans-serif;
  font-style: italic; margin-bottom: 16px;
}
.testimonial-author {
  display: flex; align-items: center; gap: 10px;
}
.author-avatar {
  width: 34px; height: 34px; border-radius: 50%;
  background: linear-gradient(135deg, #E8A020, #FF8C00);
  display: flex; align-items: center; justify-content: center;
  font-size: 14px; font-weight: 700; color: white;
  flex-shrink: 0; font-family: 'Plus Jakarta Sans', sans-serif;
}
.author-info { display: flex; flex-direction: column; flex: 1; }
.author-name { font-size: 13px; font-weight: 700; color: white; font-family: 'Plus Jakarta Sans', sans-serif; }
.author-role { font-size: 11px; color: rgba(255,255,255,0.4); font-family: 'Plus Jakarta Sans', sans-serif; }
.star-row { display: flex; gap: 1px; }
.star { color: #E8A020; font-size: 12px; }
</style>