import { createAuthonPlugin } from '@authon/nuxt'

export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig()

  const publishableKey = config.public.authonProjectId as string
  if (!publishableKey) {
    console.error('NUXT_PUBLIC_AUTHON_PROJECT_ID is required. Copy .env.example to .env and fill in your project ID.')
    return
  }

  const apiUrl = config.public.authonApiUrl as string | undefined

  const authon = createAuthonPlugin(publishableKey, apiUrl ? { apiUrl } : undefined)

  return {
    provide: { authon },
  }
})
