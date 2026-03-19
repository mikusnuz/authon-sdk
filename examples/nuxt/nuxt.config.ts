export default defineNuxtConfig({
  app: {
    baseURL: '/nuxt/',
  },
  runtimeConfig: {
    public: {
      authonProjectId: process.env.AUTHON_PROJECT_ID || '',
      authonApiUrl: process.env.AUTHON_API_URL || 'https://api.authon.dev',
    },
  },
  css: ['~/assets/style.css'],
  compatibilityDate: '2024-11-01',
})
