<script lang="ts">
  import { base } from '$app/paths'
  import { getAuthon } from '@authon/svelte'

  const { client } = getAuthon()

  type Step = 'email' | 'sent'

  let step: Step = 'email'
  let email = ''
  let loading = false
  let error = ''

  async function handleSubmit(e: Event) {
    e.preventDefault()
    loading = true
    error = ''
    try {
      await client.sendMagicLink(email)
      step = 'sent'
    } catch (err) {
      error = err instanceof Error ? err.message : 'Failed to send reset email'
    } finally {
      loading = false
    }
  }

  function tryAgain() {
    step = 'email'
    error = ''
  }
</script>

<div class="page-centered">
  <div style="width: 100%; max-width: 440px;">
    <div style="text-align: center; margin-bottom: 32px;">
      <div style="font-size: 40px; margin-bottom: 16px;">🔒</div>
      <h1 style="font-size: 26px; font-weight: 700; color: var(--text-primary); margin-bottom: 8px;">
        Reset Password
      </h1>
      <p style="color: var(--text-secondary); font-size: 14px; max-width: 340px; margin: 0 auto;">
        {#if step === 'email'}
          Enter your email and we'll send you a magic link to reset your password.
        {:else}
          Check your inbox for the reset link.
        {/if}
      </p>
    </div>

    {#if step === 'email'}
      <div class="card">
        <div style="font-size: 12px; color: var(--text-tertiary); margin-bottom: 16px;">
          <code style="color: var(--accent);">client.sendMagicLink(email)</code>
        </div>

        {#if error}
          <div class="alert alert-error" style="margin-bottom: 16px;">{error}</div>
        {/if}

        <form onsubmit={handleSubmit} style="display: flex; flex-direction: column; gap: 16px;">
          <div class="form-group">
            <label class="form-label" for="email">Email address</label>
            <input
              id="email"
              class="form-input"
              type="email"
              placeholder="you@example.com"
              bind:value={email}
              autocomplete="email"
              autofocus
              required
            />
          </div>

          <button type="submit" class="btn btn-primary btn-full" disabled={loading}>
            {#if loading}
              <span class="loading-spinner"></span>
            {:else}
              Send reset link
            {/if}
          </button>
        </form>

        <div style="margin-top: 20px; text-align: center; font-size: 14px;">
          <a href="{base}/sign-in" style="color: var(--text-secondary);">Back to sign in</a>
        </div>
      </div>
    {:else}
      <div class="card" style="text-align: center;">
        <div style="font-size: 48px; margin-bottom: 16px;">✉️</div>
        <h2 style="font-size: 20px; font-weight: 700; color: var(--text-primary); margin-bottom: 8px;">
          Check your email
        </h2>
        <p style="color: var(--text-secondary); font-size: 14px; margin-bottom: 24px; line-height: 1.6;">
          We sent a magic link to <strong style="color: var(--text-primary);">{email}</strong>.
          Click the link to reset your password. The link expires in 15 minutes.
        </p>

        <div class="alert alert-warning" style="text-align: left; margin-bottom: 20px;">
          <strong>Did not receive the email?</strong> Check your spam folder or try again.
        </div>

        <div style="display: flex; gap: 10px; justify-content: center;">
          <button class="btn btn-secondary" onclick={tryAgain}>Try again</button>
          <a href="{base}/sign-in" class="btn btn-primary">Back to sign in</a>
        </div>
      </div>
    {/if}
  </div>
</div>
