import { defineConfig } from 'eslint/config'

export default defineConfig([
  {
    extends: ['@nuxt/eslint-config'],
    rules: {
      'prettier/prettier': 'error'
    }
  }
])
