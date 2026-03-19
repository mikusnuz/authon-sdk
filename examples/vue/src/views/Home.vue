<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import { AuthonSignedIn, AuthonSignedOut, useUser } from '@authon/vue'

const { user: userRef } = useUser()
const user = computed(() => userRef.value)

const FEATURES = [
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
    icon: '🛡️',
    title: 'Built-in Components',
    desc: '<AuthonSignIn />, <AuthonSignUp />, <AuthonUserButton /> — drop-in ready.',
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
    desc: 'Update display name, avatar URL, phone number via updateProfile().',
  },
  {
    icon: '🚦',
    title: 'Conditional Rendering',
    desc: '<AuthonSignedIn>, <AuthonSignedOut> — render UI based on auth state.',
  },
  {
    icon: '🪝',
    title: 'Vue Composables',
    desc: 'useAuthon(), useUser() — reactive refs with Vue 3 Composition API.',
  },
]

const initials = computed(() => {
  const u = user.value
  if (!u) return '?'
  if (u.displayName) return u.displayName[0].toUpperCase()
  return (u.email?.[0] ?? '?').toUpperCase()
})

const welcomeName = computed(() => {
  const u = user.value
  if (!u) return ''
  return u.displayName ?? u.email?.split('@')[0] ?? ''
})
</script>

<template>
  <div class="page">
    <div style="text-align: center; padding: 60px 0 48px;">
      <div
        style="
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 6px 16px;
          border-radius: 99px;
          background: var(--accent-light);
          border: 1px solid rgba(124, 58, 237, 0.3);
          font-size: 13px;
          color: var(--accent);
          font-weight: 600;
          margin-bottom: 24px;
        "
      >
        <span>v0.3.0</span>
        <span style="opacity: 0.5;">|</span>
        <span>Reference Implementation</span>
      </div>

      <h1
        style="
          font-size: clamp(32px, 5vw, 56px);
          font-weight: 800;
          line-height: 1.15;
          letter-spacing: -0.03em;
          margin-bottom: 20px;
          background: linear-gradient(135deg, #f1f5f9 0%, #94a3b8 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        "
      >
        Authon Vue SDK<br />Example App
      </h1>

      <p
        style="
          font-size: 18px;
          color: var(--text-secondary);
          max-width: 560px;
          margin: 0 auto 40px;
          line-height: 1.6;
        "
      >
        Complete authentication flow demo using
        <code
          style="
            color: var(--accent);
            background: var(--accent-light);
            padding: 2px 8px;
            border-radius: 5px;
            font-size: 15px;
          "
        >@authon/vue</code>.
        Every feature of the SDK — demonstrated and ready to copy.
      </p>

      <AuthonSignedOut>
        <div style="display: flex; gap: 12px; justify-content: center; flex-wrap: wrap;">
          <RouterLink
            to="/sign-in"
            class="btn btn-primary"
            style="font-size: 15px; padding: 12px 28px; border-radius: 10px;"
          >
            Sign in
          </RouterLink>
          <RouterLink
            to="/sign-up"
            class="btn btn-secondary"
            style="font-size: 15px; padding: 12px 28px; border-radius: 10px;"
          >
            Create account
          </RouterLink>
        </div>
      </AuthonSignedOut>

      <AuthonSignedIn>
        <div
          style="
            display: inline-flex;
            align-items: center;
            gap: 12px;
            padding: 14px 24px;
            border-radius: 12px;
            background: var(--bg-card);
            border: 1px solid var(--border);
            margin-bottom: 20px;
          "
        >
          <div class="avatar">
            <img v-if="user?.avatarUrl" :src="user.avatarUrl" alt="avatar" />
            <template v-else>{{ initials }}</template>
          </div>
          <div style="text-align: left;">
            <div style="font-weight: 600; color: var(--text-primary);">
              Welcome back, {{ welcomeName }}!
            </div>
            <div style="font-size: 13px; color: var(--text-secondary);">{{ user?.email }}</div>
          </div>
        </div>
        <br />
        <div style="display: flex; gap: 12px; justify-content: center; flex-wrap: wrap;">
          <RouterLink
            to="/profile"
            class="btn btn-primary"
            style="font-size: 15px; padding: 12px 28px; border-radius: 10px;"
          >
            View Profile
          </RouterLink>
          <RouterLink
            to="/mfa"
            class="btn btn-secondary"
            style="font-size: 15px; padding: 12px 28px; border-radius: 10px;"
          >
            MFA Setup
          </RouterLink>
          <RouterLink
            to="/sessions"
            class="btn btn-secondary"
            style="font-size: 15px; padding: 12px 28px; border-radius: 10px;"
          >
            Sessions
          </RouterLink>
        </div>

        <AuthonSignedIn>
          <div v-if="user?.emailVerified" style="margin-top: 16px;">
            <span class="badge badge-success">Email verified</span>
          </div>
          <p v-else style="color: var(--warning); font-size: 13px; margin-top: 16px;">
            Your email is not verified.
          </p>
        </AuthonSignedIn>
      </AuthonSignedIn>
    </div>

    <div style="margin-bottom: 48px;">
      <h2 style="font-size: 22px; font-weight: 700; color: var(--text-primary); margin-bottom: 8px; text-align: center;">
        Features Demonstrated
      </h2>
      <p style="text-align: center; color: var(--text-secondary); font-size: 14px; margin-bottom: 28px;">
        Navigate to each page to see the feature in action
      </p>
      <div class="feature-grid">
        <div v-for="f in FEATURES" :key="f.title" class="feature-card">
          <div class="feature-icon">{{ f.icon }}</div>
          <div class="feature-title">{{ f.title }}</div>
          <div class="feature-desc">{{ f.desc }}</div>
        </div>
      </div>
    </div>

    <div class="card" style="margin-bottom: 48px;">
      <div class="section-title">Quick Start</div>
      <pre
        style="
          background: var(--bg-0);
          border: 1px solid var(--border);
          border-radius: 8px;
          padding: 16px 20px;
          font-size: 13px;
          color: #93c5fd;
          overflow: auto;
          line-height: 1.7;
          font-family: 'Courier New', monospace;
        "
      >import { createAuthon, AuthonSignIn, useAuthon } from '@authon/vue'

const authon = createAuthon({ publishableKey: 'your-project-id' })
app.use(authon)

// In your component:
const { isSignedIn, user, signOut } = useAuthon()</pre>
    </div>
  </div>
</template>
