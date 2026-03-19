<template>
  <div class="page">
    <div class="hero">
      <div class="hero-badge">
        <span>v0.3.0</span>
        <span class="hero-badge-sep">|</span>
        <span>Reference Implementation</span>
      </div>

      <h1 class="hero-title">
        Authon Nuxt SDK<br />Example App
      </h1>

      <p class="hero-desc">
        Complete authentication flow demo using
        <code class="code-badge">@authon/nuxt</code>.
        Every feature of the SDK — demonstrated and ready to copy.
      </p>

      <template v-if="!isSignedIn">
        <div class="hero-cta">
          <NuxtLink to="/sign-in" class="btn btn-primary btn-lg">Sign in</NuxtLink>
          <NuxtLink to="/sign-up" class="btn btn-secondary btn-lg">Create account</NuxtLink>
        </div>
      </template>

      <template v-else>
        <div class="welcome-card">
          <div class="avatar">
            <img v-if="user?.avatarUrl" :src="user.avatarUrl" alt="avatar" />
            <span v-else>{{ initials }}</span>
          </div>
          <div class="welcome-info">
            <div class="welcome-name">Welcome back, {{ displayName }}!</div>
            <div class="welcome-email">{{ user?.email }}</div>
          </div>
        </div>
        <div class="hero-cta">
          <NuxtLink to="/profile" class="btn btn-primary btn-lg">View Profile</NuxtLink>
          <NuxtLink to="/mfa" class="btn btn-secondary btn-lg">MFA Setup</NuxtLink>
          <NuxtLink to="/sessions" class="btn btn-secondary btn-lg">Sessions</NuxtLink>
        </div>
        <div v-if="user?.emailVerified" style="margin-top: 16px">
          <span class="badge badge-success">Email verified</span>
        </div>
        <div v-else style="margin-top: 16px; color: var(--warning); font-size: 13px">
          Your email is not verified.
        </div>
      </template>
    </div>

    <div class="features-section">
      <h2 class="features-title">Features Demonstrated</h2>
      <p class="features-subtitle">Navigate to each page to see the feature in action</p>
      <div class="feature-grid">
        <div v-for="f in features" :key="f.title" class="feature-card">
          <div class="feature-icon">{{ f.icon }}</div>
          <div class="feature-title">{{ f.title }}</div>
          <div class="feature-desc">{{ f.desc }}</div>
        </div>
      </div>
    </div>

    <div class="card" style="margin-bottom: 48px">
      <div class="section-title">Quick Start</div>
      <pre class="code-block">{{ quickStart }}</pre>
    </div>
  </div>
</template>

<script setup lang="ts">
const { $authon } = useNuxtApp()
const authon = $authon as any

const isSignedIn = computed(() => authon?.isSignedIn ?? false)
const user = computed(() => authon?.user ?? null)

const initials = computed(() => {
  if (!user.value) return '?'
  if (user.value.displayName) {
    return user.value.displayName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
  }
  return (user.value.email?.[0] ?? '?').toUpperCase()
})

const displayName = computed(() => {
  if (!user.value) return ''
  return user.value.displayName ?? user.value.email?.split('@')[0] ?? ''
})

const features = [
  {
    icon: '🔐',
    title: 'Email & Password Auth',
    desc: 'Full sign-in / sign-up flow with validation and error handling.',
  },
  {
    icon: '🌐',
    title: 'Social Login (10 providers)',
    desc: 'Google, Apple, Kakao, Naver, Facebook, GitHub, Discord, X, LINE, Microsoft.',
  },
  {
    icon: '🔑',
    title: 'Two-Factor Auth (MFA)',
    desc: 'TOTP authenticator app setup with QR code and backup codes.',
  },
  {
    icon: '📱',
    title: 'Session Management',
    desc: 'List all active sessions across devices, revoke any session.',
  },
  {
    icon: '👤',
    title: 'Profile Management',
    desc: 'Update display name, avatar URL, phone number via client.updateProfile().',
  },
  {
    icon: '🚦',
    title: 'Route Protection',
    desc: 'definePageMeta({ middleware: "auth" }) — Nuxt route middleware.',
  },
  {
    icon: '🪝',
    title: 'Composable Access',
    desc: 'useNuxtApp().$authon — access client, user, isSignedIn, isLoading.',
  },
  {
    icon: '🎨',
    title: 'Social Buttons',
    desc: 'renderSocialButtons() — DOM-based renderer for all 10 OAuth providers.',
  },
]

const quickStart = `// plugins/authon.client.ts
import { createAuthonPlugin } from '@authon/nuxt'

export default defineNuxtPlugin((nuxtApp) => {
  const authon = createAuthonPlugin('pk_live_...', { apiUrl: '...' })
  return { provide: { authon } }
})

// In any component
const { $authon } = useNuxtApp()
await $authon.client.signInWithEmail(email, password)`
</script>
