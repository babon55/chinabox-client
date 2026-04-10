<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const year = computed(() => new Date().getFullYear())
</script>

<template>
  <footer class="footer">
    <div class="footer-top">
      <div class="footer-inner">

        <!-- Brand -->
        <div class="footer-brand">
          <div class="brand-logo">
            <div class="logo-icon">🛍️</div>
            <span class="logo-name">SilkShop</span>
          </div>
          <p class="brand-desc">
            {{ $t('footer.brandDesc') }}
          </p>
          <div class="delivery-badges">
            <span class="dbadge">{{ $t('footer.delivery1') }}</span>
            <span class="dbadge">{{ $t('footer.delivery2') }}</span>
          </div>
        </div>

        <!-- Links -->
        <div class="footer-links">
          <h4>{{ $t('footer.pages') }}</h4>
          <ul>
            <li><NuxtLink to="/">{{ $t('footer.home') }}</NuxtLink></li>
            <li><NuxtLink to="/products">{{ $t('footer.products') }}</NuxtLink></li>
            <li><NuxtLink to="/cart">{{ $t('footer.cart') }}</NuxtLink></li>
            <li><NuxtLink to="/orders">{{ $t('footer.orders') }}</NuxtLink></li>
          </ul>
        </div>

        <!-- Contact -->
        <div class="footer-links">
          <h4>{{ $t('footer.contact') }}</h4>
          <ul>
            <li>📞 +993 65 000 000</li>
            <li>📧 info@silkshop.tm</li>
            <li>📍 {{ $t('footer.address') }}</li>
          </ul>
        </div>

      </div>
    </div>

    <div class="footer-bottom">
      <div class="footer-inner">
        <span>© {{ year }} SilkShop. {{ $t('footer.copyright') }}</span>
        <span class="made-by">{{ $t('footer.madeWithLove') }}</span>
      </div>
    </div>
  </footer>
</template>

<style scoped>
.footer { background: var(--dark); color: rgba(255,255,255,.7); font-family: var(--font-body); }

.footer-top { padding: 48px 0 32px; border-bottom: 1px solid rgba(255,255,255,.08); }
.footer-inner { max-width: 1280px; margin: 0 auto; padding: 0 24px; display: grid; grid-template-columns: 2fr 1fr 1fr; gap: 40px; }

.brand-logo { display: flex; align-items: center; gap: 10px; margin-bottom: 14px; }
.logo-icon  { font-size: 28px; }
.logo-name  { font-family: var(--font-display); font-size: 22px; font-weight: 700; color: var(--white); }
.brand-desc { font-size: 13px; line-height: 1.7; color: rgba(255,255,255,.5); margin-bottom: 16px; }
.delivery-badges { display: flex; gap: 8px; flex-wrap: wrap; }
.dbadge { font-size: 12px; font-weight: 600; background: rgba(232,160,32,.15); color: var(--gold); border: 1px solid rgba(232,160,32,.25); padding: 4px 12px; border-radius: var(--radius-pill); }

.footer-links h4 { font-size: 13px; font-weight: 700; color: var(--white); text-transform: uppercase; letter-spacing: .06em; margin-bottom: 16px; }
.footer-links ul  { list-style: none; display: flex; flex-direction: column; gap: 10px; }
.footer-links li  { font-size: 13px; color: rgba(255,255,255,.5); }
.footer-links a   { color: rgba(255,255,255,.5); text-decoration: none; transition: color .15s; }
.footer-links a:hover { color: var(--gold); }

.footer-bottom { padding: 16px 0; }
.footer-bottom .footer-inner { display: flex; justify-content: space-between; align-items: center; grid-template-columns: unset; }
.footer-bottom span { font-size: 12px; color: rgba(255,255,255,.35); }
.made-by { color: rgba(255,255,255,.25); }

@media (max-width: 768px) {
  .footer-inner { grid-template-columns: 1fr; gap: 28px; }
  .footer-bottom .footer-inner { flex-direction: column; gap: 6px; text-align: center; }
}
</style>