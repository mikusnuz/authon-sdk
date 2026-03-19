import { createAuthMiddleware } from '@authon/nuxt'

export default defineNuxtRouteMiddleware((to, from) => {
  if (import.meta.server) return
  const { $authon } = useNuxtApp()
  return createAuthMiddleware($authon as any, '/sign-in')(to, from) as any
})
