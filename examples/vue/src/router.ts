import { createRouter, createWebHistory } from 'vue-router'
import { useAuthon } from '@authon/vue'

const router = createRouter({
  history: createWebHistory('/vue/'),
  routes: [
    {
      path: '/',
      component: () => import('./components/Layout.vue'),
      children: [
        { path: '', component: () => import('./views/Home.vue') },
        { path: 'sign-in', component: () => import('./views/SignIn.vue') },
        { path: 'sign-up', component: () => import('./views/SignUp.vue') },
        { path: 'reset-password', component: () => import('./views/ResetPassword.vue') },
        {
          path: '',
          component: () => import('./components/ProtectedRoute.vue'),
          children: [
            { path: 'profile', component: () => import('./views/Profile.vue') },
            { path: 'mfa', component: () => import('./views/Mfa.vue') },
            { path: 'sessions', component: () => import('./views/Sessions.vue') },
            { path: 'delete-account', component: () => import('./views/DeleteAccount.vue') },
          ],
        },
      ],
    },
  ],
})

router.beforeEach((to) => {
  const protectedPaths = ['/profile', '/mfa', '/sessions', '/delete-account']
  const isProtected = protectedPaths.some((p) => to.path === p || to.path.startsWith(p + '/'))
  if (!isProtected) return true

  try {
    const { isSignedIn, isLoading } = useAuthon()
    if (isLoading) return true
    if (!isSignedIn) return '/sign-in'
  } catch {
    return '/sign-in'
  }

  return true
})

export default router
