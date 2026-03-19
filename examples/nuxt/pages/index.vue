<script setup lang="ts">
import type { AuthonPluginState } from '@authon/nuxt'

const nuxtApp = useNuxtApp()
const authon = computed(() => nuxtApp.$authon as AuthonPluginState | undefined)

const isLoading = computed(() => authon.value?.isLoading ?? true)
const isSignedIn = computed(() => authon.value?.isSignedIn ?? false)
const user = computed(() => authon.value?.user ?? null)

const avatar = computed(() => {
  const u = user.value
  if (!u) return '?'
  if (u.displayName) {
    return u.displayName
      .split(' ')
      .map((n: string) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }
  return (u.email?.[0] ?? '?').toUpperCase()
})

function signIn() {
  authon.value?.client.openSignIn()
}

function signUp() {
  authon.value?.client.openSignUp()
}

function signOut() {
  authon.value?.client.signOut()
}
</script>

<template>
  <div class="page">
    <ClientOnly>
      <div v-if="isLoading" class="auth-page">
        <div class="hero">
          <div class="badge">@authon/nuxt SDK</div>
          <p class="subtitle">Loading...</p>
        </div>
      </div>

      <div v-else-if="!isSignedIn" class="hero">
      <div class="badge">@authon/nuxt SDK</div>
      <h1>Authon Nuxt Example</h1>
      <p class="subtitle">
        Drop-in authentication for Nuxt 3. Branding, OAuth providers,
        and MFA all configured from your Authon dashboard.
      </p>
      <div class="btn-group">
        <button class="btn btn-primary" @click="signIn">Sign In</button>
        <button class="btn btn-outline" @click="signUp">Create Account</button>
      </div>
      <div class="feature-grid">
        <div class="feature-card">
          <div class="feature-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
              <path d="M7 11V7a5 5 0 0110 0v4"/>
            </svg>
          </div>
          <div>
            <div class="feature-title">Email + Password</div>
            <div class="feature-desc">Secure sign-in with validation</div>
          </div>
        </div>
        <div class="feature-card">
          <div class="feature-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
          </div>
          <div>
            <div class="feature-title">OAuth Providers</div>
            <div class="feature-desc">Google, GitHub, and more</div>
          </div>
        </div>
        <div class="feature-card">
          <div class="feature-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 2L2 7l10 5 10-5-10-5z"/>
              <path d="M2 17l10 5 10-5"/>
              <path d="M2 12l10 5 10-5"/>
            </svg>
          </div>
          <div>
            <div class="feature-title">Dashboard Branding</div>
            <div class="feature-desc">Logo, colors, fonts from dashboard</div>
          </div>
        </div>
        <div class="feature-card">
          <div class="feature-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              <path d="M9 12l2 2 4-4"/>
            </svg>
          </div>
          <div>
            <div class="feature-title">MFA Support</div>
            <div class="feature-desc">TOTP authenticator app</div>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="signed-in-layout">
      <div class="topbar">
        <div class="topbar-brand">Authon Example</div>
        <div class="topbar-right">
          <button class="btn btn-outline btn-sm" @click="signOut">Sign Out</button>
        </div>
      </div>
      <div class="welcome-content">
        <div class="welcome-card">
          <div class="welcome-avatar">
            <img v-if="user?.avatarUrl" :src="user.avatarUrl" alt="avatar" />
            <span v-else>{{ avatar }}</span>
          </div>
          <h2>Welcome back, {{ user?.displayName || user?.email?.split('@')[0] }}</h2>
          <p class="welcome-email">{{ user?.email }}</p>
          <div class="info-grid">
            <div class="info-row">
              <span class="info-label">User ID</span>
              <span class="info-value mono">{{ user?.id }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Email verified</span>
              <span :class="['info-badge', user?.emailVerified ? 'badge-green' : 'badge-yellow']">
                {{ user?.emailVerified ? 'Verified' : 'Unverified' }}
              </span>
            </div>
            <div v-if="user?.displayName" class="info-row">
              <span class="info-label">Display name</span>
              <span class="info-value">{{ user.displayName }}</span>
            </div>
          </div>
          <button class="btn btn-outline btn-sm" @click="signOut">Sign Out</button>
        </div>
      </div>
    </div>
    </ClientOnly>
  </div>
</template>
