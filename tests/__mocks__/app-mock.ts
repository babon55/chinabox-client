// Mock for Nuxt's #app module
export const useRuntimeConfig = () => ({
  public: {
    apiBase: 'http://localhost:3001/api/v1'
  }
})

// These would be available globally, but we also stub them
declare global {
  const $fetch: unknown
  const navigateTo: unknown
}
