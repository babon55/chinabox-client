import { watchEffect } from 'vue';
import { createI18n } from 'vue-i18n';
import tkMessages from '../../locales/tk.json';
import ruMessages from '../../locales/ru.json';

const getLocale = (): 'tk' | 'ru' => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('silkshop_lang');
    if (saved === 'tk' || saved === 'ru') return saved;
  }
  return 'tk';
};

export default defineNuxtPlugin((nuxtApp) => {
  // Create inside plugin — prevents SSR state sharing between requests
  const i18n = createI18n({
    legacy: false,
    locale: getLocale(),
    fallbackLocale: 'tk',
    messages: {
      tk: tkMessages,
      ru: ruMessages,
    },
  });

  nuxtApp.vueApp.use(i18n); // handles $t, $i18n globally — no need to set manually

  nuxtApp.provide('i18n', i18n);

  // Only persist on client
  if (import.meta.client) {
    watchEffect(() => {
      localStorage.setItem('silkshop_lang', i18n.global.locale.value);
    });

    // Clean up when app unmounts
    nuxtApp.hook('app:beforeMount', () => {
      nuxtApp.hook('app:error', () => stop());
    });
  }
});