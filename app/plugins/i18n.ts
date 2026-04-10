import { watchEffect } from 'vue';
import { createI18n } from 'vue-i18n';
import tkMessages from '../../locales/tk.json';
import ruMessages from '../../locales/ru.json';

// Determine locale (works for both SSR and client)
const getLocale = (): 'tk' | 'ru' => {
  // On client, check localStorage first
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('silkshop_lang');
    if (saved === 'tk' || saved === 'ru') return saved as 'tk' | 'ru';
  }
  // Default to 'tk' (server-side and if no saved preference)
  return 'tk';
};

// Create i18n instance with proper SSR support
export const i18n = createI18n({
  legacy: false,
  locale: getLocale(),
  fallbackLocale: 'tk',
  messages: {
    tk: tkMessages,
    ru: ruMessages
  }
});

// Nuxt plugin definition
export default defineNuxtPlugin((nuxtApp) => {
  // Install i18n on the Vue app
  nuxtApp.vueApp.use(i18n);

  // Provide i18n for composition API
  nuxtApp.provide('i18n', i18n);

  // Global $t for Options API / template convenience
  // Note: $i18n is automatically provided by vue-i18n plugin
  nuxtApp.vueApp.config.globalProperties.$t = i18n.global.t;

  // Persist locale changes to localStorage
  if (typeof window !== 'undefined') {
    watchEffect(() => {
      localStorage.setItem('silkshop_lang', i18n.global.locale.value);
    });
  }
});
