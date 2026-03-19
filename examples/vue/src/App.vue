<script setup lang="ts">
import { useAuthon, AuthonSignedIn, AuthonSignedOut, AuthonUserButton } from '@authon/vue'

const { user, openSignIn, openSignUp } = useAuthon()
</script>

<template>
  <div class="page">
    <AuthonSignedOut>
      <div class="hero">
        <div class="badge">@authon/vue SDK</div>
        <h1>Authon Vue Example</h1>
        <p class="subtitle">
          Drop-in authentication components. Branding, OAuth providers,
          and MFA all configured from your Authon dashboard.
        </p>
        <div class="btn-group">
          <button class="btn btn-primary" @click="openSignIn">Sign In</button>
          <button class="btn btn-outline" @click="openSignUp">Create Account</button>
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
    </AuthonSignedOut>

    <AuthonSignedIn>
      <div class="signed-in-layout">
        <div class="topbar">
          <div class="topbar-brand">Authon Example</div>
          <div class="topbar-right">
            <AuthonUserButton />
          </div>
        </div>
        <div class="welcome-content">
          <div class="welcome-card">
            <div class="welcome-avatar">
              <img v-if="user?.avatarUrl" :src="user.avatarUrl" alt="avatar" />
              <span v-else>
                {{
                  user?.displayName
                    ? user.displayName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
                    : (user?.email?.[0] ?? '?').toUpperCase()
                }}
              </span>
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
                <span :class="`info-badge ${user?.emailVerified ? 'badge-green' : 'badge-yellow'}`">
                  {{ user?.emailVerified ? 'Verified' : 'Unverified' }}
                </span>
              </div>
              <div v-if="user?.displayName" class="info-row">
                <span class="info-label">Display name</span>
                <span class="info-value">{{ user.displayName }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AuthonSignedIn>
  </div>
</template>
