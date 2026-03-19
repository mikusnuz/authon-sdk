<script lang="ts">
  import { onMount } from 'svelte'
  import { goto } from '$app/navigation'
  import { base } from '$app/paths'
  import { getAuthon, renderSocialButtons } from '@authon/svelte'

  const store = getAuthon()
  const { client, isSignedIn } = store

  let email = ''
  let password = ''
  let confirmPassword = ''
  let displayName = ''
  let loading = false
  let error = ''

  let socialContainer: HTMLElement

  onMount(() => {
    if ($isSignedIn) {
      goto(`${base}/`)
      return
    }
    const cleanup = renderSocialButtons({
      client,
      container: socialContainer,
      onSuccess: () => goto(`${base}/`),
      onError: (e) => { error = e.message },
    })
    return cleanup
  })

  async function handleSubmit(e: Event) {
    e.preventDefault()

    if (password !== confirmPassword) {
      error = 'Passwords do not match'
      return
    }
    if (password.length < 8) {
      error = 'Password must be at least 8 characters'
      return
    }

    loading = true
    error = ''
    try {
      await client.signUpWithEmail(email, password, { displayName: displayName || undefined })
      goto(`${base}/`)
    } catch (err) {
      error = err instanceof Error ? err.message : 'Sign up failed'
    } finally {
      loading = false
    }
  }
</script>

<div class="page-centered">
  <div style="width: 100%; max-width: 500px;">
    <div style="text-align: center; margin-bottom: 24px;">
      <h1 style="font-size: 26px; font-weight: 700; color: var(--text-primary); margin-bottom: 8px;">
        Create Account
      </h1>
      <p style="color: var(--text-secondary); font-size: 14px;">
        Join Authon — full auth flow demo
      </p>
    </div>

    <div class="card">
      <div style="margin-bottom: 16px;">
        <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
          <span style="font-size: 12px; font-weight: 600; color: var(--accent-2); background: rgba(79, 70, 229, 0.12); padding: 2px 8px; border-radius: 5px;">
            Custom
          </span>
          <code style="font-size: 12px; color: var(--text-secondary);">
            client.signUpWithEmail(email, password, meta)
          </code>
        </div>
      </div>

      {#if error}
        <div class="alert alert-error" style="margin-bottom: 16px;">{error}</div>
      {/if}

      <form onsubmit={handleSubmit} style="display: flex; flex-direction: column; gap: 16px;">
        <div class="form-group">
          <label class="form-label" for="displayName">
            Display Name <span style="color: var(--text-tertiary);">(optional)</span>
          </label>
          <input
            id="displayName"
            class="form-input"
            type="text"
            placeholder="Your name"
            bind:value={displayName}
            autocomplete="name"
          />
        </div>

        <div class="form-group">
          <label class="form-label" for="email">Email</label>
          <input
            id="email"
            class="form-input"
            type="email"
            placeholder="you@example.com"
            bind:value={email}
            autocomplete="email"
            required
          />
        </div>

        <div class="form-group">
          <label class="form-label" for="password">Password</label>
          <input
            id="password"
            class="form-input"
            type="password"
            placeholder="Minimum 8 characters"
            bind:value={password}
            autocomplete="new-password"
            required
          />
        </div>

        <div class="form-group">
          <label class="form-label" for="confirmPassword">Confirm Password</label>
          <input
            id="confirmPassword"
            class="form-input"
            type="password"
            placeholder="Repeat your password"
            bind:value={confirmPassword}
            autocomplete="new-password"
            required
          />
        </div>

        <button type="submit" class="btn btn-primary btn-full" disabled={loading}>
          {#if loading}
            <span class="loading-spinner"></span>
          {:else}
            Create account
          {/if}
        </button>
      </form>

      <div style="display: flex; align-items: center; gap: 12px; margin: 20px 0;">
        <div class="divider" style="flex: 1;"></div>
        <span style="color: var(--text-tertiary); font-size: 13px;">or sign up with</span>
        <div class="divider" style="flex: 1;"></div>
      </div>

      <div>
        <div style="font-size: 12px; color: var(--text-tertiary); margin-bottom: 10px;">
          <code style="color: var(--accent);">renderSocialButtons(&#123;&#125;)</code>
          {' — full-width buttons'}
        </div>
        <div bind:this={socialContainer}></div>
      </div>

      <div style="margin-top: 20px; text-align: center; font-size: 14px; color: var(--text-secondary);">
        Already have an account?
        <a href="{base}/sign-in" style="color: var(--accent); font-weight: 600;">Sign in</a>
      </div>
    </div>
  </div>
</div>
