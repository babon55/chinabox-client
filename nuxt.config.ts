import {
  featureBasedPagesHook,
  getFeaturePagesWatchPaths,
  getFeatureComponentsWatchPaths,
  getFeatureImportsWatchPaths,
  setupFeatureComponents,
  setupFeatureImports,
} from "./config/hooks/index";

export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },

  devServer: {
    port: 3000,
    host: "0.0.0.0",
  },

  modules: [
    "@pinia/nuxt",
    '@nuxt/ui',
    function featureComponentsModule(_options, nuxt) {
      setupFeatureComponents(nuxt);
    },
    function featureImportsModule(_options, nuxt) {
      setupFeatureImports(nuxt);
    },
  ],

  css: ["~/assets/index.css"],

  app: {
    pageTransition: { name: "page", mode: "out-in" },
    layoutTransition: false,
    head: {
      link: [
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Playfair+Display:wght@700&display=swap',
        },
      ],
    },
  },

  watch: [
    ...getFeaturePagesWatchPaths(),
    ...getFeatureComponentsWatchPaths(),
    ...getFeatureImportsWatchPaths(),
  ],

  hooks: {
    "pages:extend": featureBasedPagesHook,
  },
});