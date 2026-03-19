<script lang="ts">
  import { getAuthon } from '@authon/svelte'
  import { base } from '$app/paths'

  const store = getAuthon()
  const { user, isSignedIn } = store

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
      title: 'Svelte Readable Stores',
      desc: 'createAuthonStore() → $user, $isSignedIn, $isLoading reactive stores.',
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
      title: 'Protected Routes',
      desc: 'Redirect unauthenticated users with requireAuth() helper.',
    },
    {
      icon: '🧩',
      title: 'SvelteKit Context',
      desc: 'initAuthon() / getAuthon() — share store across the component tree.',
    },
  ]

  function getInitials(u: typeof $user): string {
    if (!u) return '?'
    if (u.displayName) {
      return u.displayName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
    }
    return (u.email?.[0] ?? '?').toUpperCase()
  }
</script>

<div class="page">
  <div style="text-align: center; padding: 60px 0 48px;">
    <div style="
      display: inline-flex; align-items: center; gap: 8px;
      padding: 6px 16px; border-radius: 99px;
      background: var(--accent-light); border: 1px solid rgba(124, 58, 237, 0.3);
      font-size: 13px; color: var(--accent); font-weight: 600; margin-bottom: 24px;
    ">
      <span>v0.3.0</span>
      <span style="opacity: 0.5;">|</span>
      <span>Reference Implementation</span>
    </div>

    <h1 style="
      font-size: clamp(32px, 5vw, 56px); font-weight: 800;
      line-height: 1.15; letter-spacing: -0.03em; margin-bottom: 20px;
      background: linear-gradient(135deg, #f1f5f9 0%, #94a3b8 100%);
      -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
    ">
      Authon Svelte SDK<br />Example App
    </h1>

    <p style="
      font-size: 18px; color: var(--text-secondary);
      max-width: 560px; margin: 0 auto 40px; line-height: 1.6;
    ">
      Complete authentication flow demo using
      <code style="color: var(--accent); background: var(--accent-light); padding: 2px 8px; border-radius: 5px; font-size: 15px;">@authon/svelte</code>.
      Every feature of the SDK — demonstrated and ready to copy.
    </p>

    {#if !$isSignedIn}
      <div style="display: flex; gap: 12px; justify-content: center; flex-wrap: wrap;">
        <a href="{base}/sign-in" class="btn btn-primary" style="font-size: 15px; padding: 12px 28px; border-radius: 10px;">
          Sign in
        </a>
        <a href="{base}/sign-up" class="btn btn-secondary" style="font-size: 15px; padding: 12px 28px; border-radius: 10px;">
          Create account
        </a>
      </div>
    {:else}
      <div style="
        display: inline-flex; align-items: center; gap: 12px;
        padding: 14px 24px; border-radius: 12px;
        background: var(--bg-card); border: 1px solid var(--border);
        margin-bottom: 20px;
      ">
        <div class="avatar">
          {#if $user?.avatarUrl}
            <img src={$user.avatarUrl} alt="avatar" />
          {:else}
            {getInitials($user)}
          {/if}
        </div>
        <div style="text-align: left;">
          <div style="font-weight: 600; color: var(--text-primary);">
            Welcome back, {$user?.displayName ?? $user?.email?.split('@')[0]}!
          </div>
          <div style="font-size: 13px; color: var(--text-secondary);">{$user?.email}</div>
        </div>
      </div>
      <br />
      <div style="display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; margin-top: 16px;">
        <a href="{base}/profile" class="btn btn-primary" style="font-size: 15px; padding: 12px 28px; border-radius: 10px;">
          View Profile
        </a>
        <a href="{base}/mfa" class="btn btn-secondary" style="font-size: 15px; padding: 12px 28px; border-radius: 10px;">
          MFA Setup
        </a>
        <a href="{base}/sessions" class="btn btn-secondary" style="font-size: 15px; padding: 12px 28px; border-radius: 10px;">
          Sessions
        </a>
      </div>

      {#if $user?.emailVerified}
        <div style="margin-top: 16px;">
          <span class="badge badge-success">Email verified</span>
        </div>
      {:else}
        <p style="color: var(--warning); font-size: 13px; margin-top: 16px;">
          Your email is not verified.
        </p>
      {/if}
    {/if}
  </div>

  <div style="margin-bottom: 48px;">
    <h2 style="font-size: 22px; font-weight: 700; color: var(--text-primary); margin-bottom: 8px; text-align: center;">
      Features Demonstrated
    </h2>
    <p style="text-align: center; color: var(--text-secondary); font-size: 14px; margin-bottom: 28px;">
      Navigate to each page to see the feature in action
    </p>
    <div class="feature-grid">
      {#each FEATURES as f}
        <div class="feature-card">
          <div class="feature-icon">{f.icon}</div>
          <div class="feature-title">{f.title}</div>
          <div class="feature-desc">{f.desc}</div>
        </div>
      {/each}
    </div>
  </div>

  <div class="card" style="margin-bottom: 48px;">
    <div class="section-title">Quick Start</div>
    <pre style="
      background: var(--bg-0); border: 1px solid var(--border);
      border-radius: 8px; padding: 16px 20px; font-size: 13px;
      color: #93c5fd; overflow: auto; line-height: 1.7;
      font-family: 'Courier New', monospace;
    ">{`<!-- +layout.svelte -->
<script lang="ts">
  import { initAuthon } from '@authon/svelte'
  const store = initAuthon('your-project-id')
  const { isSignedIn, user } = store
</` + `script>

<!-- +page.svelte -->
<script lang="ts">
  import { getAuthon } from '@authon/svelte'
  const { isSignedIn, user } = getAuthon()
</` + `script>

{#if $isSignedIn}
  <p>Hello, {$user?.displayName}!</p>
{/if}`}</pre>
  </div>
</div>
