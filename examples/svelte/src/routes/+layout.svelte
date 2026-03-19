<script lang="ts">
  import '../app.css'
  import { initAuthon, getAuthon } from '@authon/svelte'
  import { base } from '$app/paths'
  import { page } from '$app/stores'
  import { browser } from '$app/environment'

  const publishableKey = import.meta.env.VITE_AUTHON_PUBLISHABLE_KEY || 'YOUR_PROJECT_ID'
  const apiUrl = import.meta.env.VITE_AUTHON_API_URL || 'https://api.authon.dev'

  const store = initAuthon(publishableKey, { apiUrl })
  const { user, isSignedIn, signOut } = store

  async function handleSignOut() {
    await signOut()
    if (browser) {
      window.location.href = `${base}/`
    }
  }

  function getInitials(u: typeof $user): string {
    if (!u) return '?'
    if (u.displayName) {
      return u.displayName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
    }
    return (u.email?.[0] ?? '?').toUpperCase()
  }
</script>

<div style="display: flex; flex-direction: column; min-height: 100vh;">
  <nav style="
    height: 64px;
    background: rgba(10, 15, 30, 0.9);
    backdrop-filter: blur(12px);
    border-bottom: 1px solid var(--border-subtle);
    display: flex;
    align-items: center;
    padding: 0 24px;
    position: sticky;
    top: 0;
    z-index: 100;
  ">
    <div style="max-width: 1100px; margin: 0 auto; width: 100%; display: flex; align-items: center; justify-content: space-between;">
      <a href="{base}/" style="display: flex; align-items: center; gap: 10px; text-decoration: none;">
        <div style="
          width: 32px; height: 32px; border-radius: 8px;
          background: linear-gradient(135deg, #7c3aed, #4f46e5);
          display: flex; align-items: center; justify-content: center;
          color: #fff; font-size: 16px; font-weight: 800;
        ">A</div>
        <span style="font-weight: 700; font-size: 16px; color: var(--text-primary);">
          Authon<span style="color: var(--accent); margin-left: 4px; font-size: 13px; font-weight: 500;">Svelte SDK</span>
        </span>
      </a>

      <div style="display: flex; align-items: center; gap: 8px;">
        {#if $isSignedIn}
          <a href="{base}/profile" class="nav-link">Profile</a>
          <a href="{base}/mfa" class="nav-link">MFA</a>
          <a href="{base}/sessions" class="nav-link">Sessions</a>
          <button
            onclick={handleSignOut}
            style="
              display: flex; align-items: center; gap: 8px;
              padding: 6px 12px; border-radius: 8px;
              background: var(--bg-2); border: 1px solid var(--border);
              color: var(--text-secondary); font-size: 13px; font-weight: 500;
              cursor: pointer; transition: all 0.15s;
            "
          >
            <div class="avatar" style="width: 28px; height: 28px; font-size: 12px;">
              {#if $user?.avatarUrl}
                <img src={$user.avatarUrl} alt="avatar" />
              {:else}
                {getInitials($user)}
              {/if}
            </div>
            <span>Sign out</span>
          </button>
        {:else}
          <a href="{base}/sign-in" style="
            padding: 7px 16px; border-radius: 8px; font-size: 13px; font-weight: 600;
            color: var(--text-secondary); text-decoration: none;
            border: 1px solid var(--border); transition: all 0.15s;
          ">Sign in</a>
          <a href="{base}/sign-up" style="
            padding: 7px 16px; border-radius: 8px; font-size: 13px; font-weight: 600;
            color: #fff; text-decoration: none; background: var(--accent); transition: background 0.15s;
          ">Sign up</a>
        {/if}
      </div>
    </div>
  </nav>

  <main style="flex: 1; display: flex; flex-direction: column;">
    <slot />
  </main>

  <footer style="
    border-top: 1px solid var(--border-subtle);
    padding: 20px 24px; text-align: center;
    color: var(--text-tertiary); font-size: 13px;
  ">
    <div style="max-width: 1100px; margin: 0 auto;">
      Authon Svelte SDK Example &mdash;
      <a href="https://docs.authon.dev" target="_blank" rel="noopener noreferrer">Documentation</a>
      {' · '}
      <a href="https://github.com/mikusnuz/authon-sdk" target="_blank" rel="noopener noreferrer">GitHub</a>
    </div>
  </footer>
</div>

<style>
  :global(.nav-link) {
    padding: 6px 14px;
    border-radius: 7px;
    font-size: 13px;
    font-weight: 500;
    color: var(--text-secondary);
    text-decoration: none;
    transition: color 0.15s;
  }

  :global(.nav-link:hover) {
    color: var(--text-primary);
    text-decoration: none;
  }
</style>
