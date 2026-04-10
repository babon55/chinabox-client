import { defineConfig } from 'vitest/config'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    include: ['**/*.spec.ts', '**/*.test.ts', '**/__tests__/**'],
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./app', import.meta.url)),
      '#app': fileURLToPath(new URL('./tests/__mocks__/app-mock.ts', import.meta.url))
    }
  }
})
