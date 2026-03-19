import { createAuthonPlugin } from '@authon/nuxt'

export default defineNuxtPlugin((nuxtApp) => {
  const config = useRuntimeConfig()
  const authon = createAuthonPlugin(
    config.public.authonProjectId as string,
    { apiUrl: config.public.authonApiUrl as string },
  )
  return {
    provide: {
      authon,
    },
  }
})
