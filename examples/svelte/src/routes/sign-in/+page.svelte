<script lang="ts">
  import { onMount } from 'svelte'
  import { goto } from '$app/navigation'
  import { base } from '$app/paths'
  import { getAuthon, renderSocialButtons } from '@authon/svelte'
  import { AuthonMfaRequiredError } from '@authon/js'

  const store = getAuthon()
  const { client, isSignedIn } = store

  type View = 'custom'
  type MfaState = { required: true; mfaToken: string } | { required: false }

  let view: View = 'custom'
  let email = ''
  let password = ''
  let mfaCode = ''
  let mfa: MfaState = { required: false }
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
      compact: true,
      onSuccess: () => goto(`${base}/`),
      onError: (e) => { error = e.message },
    })
    return cleanup
  })

  async function handleSubmit(e: Event) {
    e.preventDefault()
    loading = true
    error = ''
    try {
      await client.signInWithEmail(email, password)
      goto(`${base}/`)
    } catch (err) {
      if (err instanceof AuthonMfaRequiredError) {
        mfa = { required: true, mfaToken: err.mfaToken }
      } else {
        error = err instanceof Error ? err.message : 'Sign in failed'
      }
    } finally {
      loading = false
    }
  }

  async function handleMfaVerify(e: Event) {
    e.preventDefault()
    if (!mfa.required) return
    loading = true
    error = ''
    try {
      await client.verifyMfa(mfa.mfaToken, mfaCode)
      goto(`${base}/`)
    } catch (err) {
      error = err instanceof Error ? err.message : 'MFA verification failed'
    } finally {
      loading = false
    }
  }

  function backFromMfa() {
    mfa = { required: false }
    mfaCode = ''
    error = ''
  }
</script>

<div class="page-centered">
  <div style="width: 100%; max-width: 500px;">
    <div style="text-align: center; margin-bottom: 24px;">
      <h1 style="font-size: 26px; font-weight: 700; color: var(--text-primary); margin-bottom: 8px;">
        Sign In
      </h1>
      <p style="color: var(--text-secondary); font-size: 14px;">
        Sign in to your Authon account
      </p>
    </div>

    {#if mfa.required}
      <div class="card">
        <div style="text-align: center; margin-bottom: 24px;">
          <div style="font-size: 32px; margin-bottom: 12px;">🔑</div>
          <h2 style="font-size: 20px; font-weight: 700; color: var(--text-primary); margin-bottom: 8px;">
            Two-Factor Authentication
          </h2>
          <p style="color: var(--text-secondary); font-size: 14px;">
            Enter the 6-digit code from your authenticator app
          </p>
        </div>

        {#if error}
          <div class="alert alert-error" style="margin-bottom: 16px;">{error}</div>
        {/if}

        <form onsubmit={handleMfaVerify} style="display: flex; flex-direction: column; gap: 16px;">
          <div class="form-group">
            <label class="form-label" for="mfa-code">Verification Code</label>
            <input
              id="mfa-code"
              class="form-input"
              type="text"
              inputmode="numeric"
              maxlength="6"
              placeholder="000000"
              bind:value={mfaCode}
              autofocus
              style="text-align: center; font-size: 24px; letter-spacing: 0.2em;"
            />
          </div>

          <button type="submit" class="btn btn-primary btn-full" disabled={loading || mfaCode.length !== 6}>
            {#if loading}
              <span class="loading-spinner"></span>
            {:else}
              Verify
            {/if}
          </button>

          <button type="button" class="btn btn-secondary btn-full" onclick={backFromMfa}>
            Back
          </button>
        </form>
      </div>
    {:else}
      <div class="card">
        <div style="margin-bottom: 16px;">
          <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
            <span style="font-size: 12px; font-weight: 600; color: var(--accent-2); background: rgba(79, 70, 229, 0.12); padding: 2px 8px; border-radius: 5px;">
              Custom
            </span>
            <code style="font-size: 12px; color: var(--text-secondary);">
              client.signInWithEmail(email, password)
            </code>
          </div>
        </div>

        {#if error}
          <div class="alert alert-error" style="margin-bottom: 16px;">{error}</div>
        {/if}

        <form onsubmit={handleSubmit} style="display: flex; flex-direction: column; gap: 16px;">
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
              placeholder="••••••••"
              bind:value={password}
              autocomplete="current-password"
              required
            />
            <div style="display: flex; justify-content: flex-end; margin-top: 4px;">
              <a href="{base}/reset-password" style="font-size: 13px; color: var(--accent);">
                Forgot password?
              </a>
            </div>
          </div>

          <button type="submit" class="btn btn-primary btn-full" disabled={loading}>
            {#if loading}
              <span class="loading-spinner"></span>
            {:else}
              Sign in
            {/if}
          </button>
        </form>

        <div style="display: flex; align-items: center; gap: 12px; margin: 20px 0;">
          <div class="divider" style="flex: 1;"></div>
          <span style="color: var(--text-tertiary); font-size: 13px;">or continue with</span>
          <div class="divider" style="flex: 1;"></div>
        </div>

        <div>
          <div style="font-size: 12px; color: var(--text-tertiary); margin-bottom: 10px;">
            <code style="color: var(--accent);">renderSocialButtons(&#123; compact: true &#125;)</code>
            {' — all enabled providers'}
          </div>
          <div bind:this={socialContainer}></div>
        </div>

        <div style="margin-top: 20px; text-align: center; font-size: 14px; color: var(--text-secondary);">
          Don't have an account?
          <a href="{base}/sign-up" style="color: var(--accent); font-weight: 600;">Sign up</a>
        </div>
      </div>
    {/if}
  </div>
</div>
