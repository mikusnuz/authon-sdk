<script lang="ts">
  import { browser } from '$app/environment'
  import { getAuthon } from '@authon/svelte'
  import type { AuthonStore } from '@authon/svelte'
  import type { AuthonUser } from '@authon/shared'
  import PasswordlessPanel from '$lib/components/PasswordlessPanel.svelte'
  import PasskeyPanel from '$lib/components/PasskeyPanel.svelte'
  import WalletPanel from '$lib/components/WalletPanel.svelte'

  let authon: AuthonStore | null = browser ? getAuthon() : null

  const userStore = authon?.user
  const isSignedInStore = authon?.isSignedIn
  const isLoadingStore = authon?.isLoading

  function getAvatarInitials(u: AuthonUser | null): string {
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
  }

  function signIn() {
    authon?.openSignIn()
  }

  function signUp() {
    authon?.openSignUp()
  }

  function signOut() {
    authon?.signOut()
  }
</script>

<svelte:head>
  <title>Authon Svelte Example</title>
</svelte:head>

<div class="page">
  {#if $isLoadingStore}
    <div class="loading-page">
      <p>Loading...</p>
    </div>
  {:else if $isSignedInStore}
    <div class="signed-in-layout">
      <div class="topbar">
        <div class="topbar-brand">Authon Example</div>
        <div class="topbar-right">
          <button class="btn btn-outline btn-sm" on:click={signOut}>Sign Out</button>
        </div>
      </div>
      <div class="welcome-content">
        <div class="welcome-card">
          <div class="welcome-avatar">
            {#if $userStore?.avatarUrl}
              <img src={$userStore.avatarUrl} alt="avatar" />
            {:else}
              <span>{getAvatarInitials($userStore ?? null)}</span>
            {/if}
          </div>
          <h2>Welcome back, {$userStore?.displayName || $userStore?.email?.split('@')[0]}</h2>
          <p class="welcome-email">{$userStore?.email}</p>
          <div class="info-grid">
            <div class="info-row">
              <span class="info-label">User ID</span>
              <span class="info-value mono">{$userStore?.id}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Email verified</span>
              <span class="info-badge {$userStore?.emailVerified ? 'badge-green' : 'badge-yellow'}">
                {$userStore?.emailVerified ? 'Verified' : 'Unverified'}
              </span>
            </div>
            {#if $userStore?.displayName}
              <div class="info-row">
                <span class="info-label">Display name</span>
                <span class="info-value">{$userStore.displayName}</span>
              </div>
            {/if}
          </div>
          <button class="btn btn-outline btn-sm" on:click={signOut}>Sign Out</button>
        </div>
        {#if authon}
          <PasskeyPanel {authon} />
          <WalletPanel {authon} />
        {/if}
      </div>
    </div>
  {:else}
    <div class="hero">
      <div class="badge">@authon/svelte SDK</div>
      <h1>Authon Svelte Example</h1>
      <p class="subtitle">
        Drop-in authentication for SvelteKit. Branding, OAuth providers,
        and MFA all configured from your Authon dashboard.
      </p>
      <div class="btn-group">
        <button class="btn btn-primary" on:click={signIn}>Sign In</button>
        <button class="btn btn-outline" on:click={signUp}>Create Account</button>
      </div>
      {#if authon}
        <PasswordlessPanel {authon} />
      {/if}
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
        <div class="feature-card">
          <div class="feature-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="8" cy="15" r="4"/>
              <path d="M10.85 12.15L19 4M18 5l2 2M15 8l2 2"/>
            </svg>
          </div>
          <div>
            <div class="feature-title">Passkeys + Passwordless</div>
            <div class="feature-desc">Passkey, email code, magic link</div>
          </div>
        </div>
        <div class="feature-card">
          <div class="feature-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="2" y="6" width="20" height="14" rx="2"/>
              <path d="M16 13h2M2 10h20M6 6V4h12v2"/>
            </svg>
          </div>
          <div>
            <div class="feature-title">Embedded Wallet</div>
            <div class="feature-desc">Sign messages, passkey backup</div>
          </div>
        </div>
      </div>
    </div>
  {/if}
</div>
