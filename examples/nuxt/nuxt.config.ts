export default defineNuxtConfig({
  app: {
    baseURL: '/nuxt/',
  },
  css: ['~/assets/style.css'],
  runtimeConfig: {
    public: {
      authonProjectId: process.env.NUXT_PUBLIC_AUTHON_PROJECT_ID || '',
      authonApiUrl: process.env.NUXT_PUBLIC_AUTHON_API_URL || '',
    },
  },
  compatibilityDate: '2024-11-01',
})
