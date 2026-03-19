<script lang="ts">
  import { onMount } from 'svelte'
  import { goto } from '$app/navigation'
  import { base } from '$app/paths'
  import { getAuthon } from '@authon/svelte'

  const store = getAuthon()
  const { client, isSignedIn, signOut } = store

  const CONFIRMATION_TEXT = 'DELETE'

  let confirmInput = ''
  let loading = false
  let error = ''

  $: isConfirmed = confirmInput === CONFIRMATION_TEXT

  onMount(() => {
    if (!$isSignedIn) {
      goto(`${base}/sign-in`)
    }
  })

  async function handleDelete() {
    if (!isConfirmed) return
    loading = true
    error = ''
    try {
      await signOut()
      goto(`${base}/`)
    } catch (err) {
      error = err instanceof Error ? err.message : 'Failed to delete account'
      loading = false
    }
  }
</script>

<div class="page-centered">
  <div style="width: 100%; max-width: 480px;">
    <div class="card">
      <div style="text-align: center; margin-bottom: 24px;">
        <div style="
          width: 56px; height: 56px; border-radius: 50%;
          background: var(--danger-bg); border: 1px solid rgba(239, 68, 68, 0.3);
          display: flex; align-items: center; justify-content: center;
          margin: 0 auto 16px; font-size: 24px;
        ">⚠️</div>
        <h1 style="font-size: 22px; font-weight: 700; color: var(--text-primary); margin-bottom: 8px;">
          Delete Account
        </h1>
        <p style="color: var(--text-secondary); font-size: 14px; line-height: 1.6;">
          This action is <strong style="color: var(--danger);">permanent and irreversible</strong>.
          All your data will be deleted immediately.
        </p>
      </div>

      <div class="alert alert-error" style="margin-bottom: 24px;">
        <div style="font-weight: 600; margin-bottom: 6px;">This will permanently delete:</div>
        <ul style="padding-left: 18px; display: flex; flex-direction: column; gap: 4px; margin-top: 4px;">
          <li>Your account and personal information</li>
          <li>All active sessions</li>
          <li>MFA configuration and backup codes</li>
          <li>Any linked social accounts</li>
        </ul>
      </div>

      {#if error}
        <div class="alert alert-error" style="margin-bottom: 16px;">{error}</div>
      {/if}

      <div class="form-group" style="margin-bottom: 20px;">
        <label class="form-label" for="confirm">
          Type <strong style="color: var(--danger); font-family: 'Courier New', monospace;">DELETE</strong> to confirm
        </label>
        <input
          id="confirm"
          class="form-input"
          type="text"
          placeholder="DELETE"
          bind:value={confirmInput}
          style="
            border-color: {isConfirmed ? 'var(--danger)' : ''};
            text-align: center;
            font-family: 'Courier New', monospace;
            letter-spacing: 0.1em;
            font-size: 16px;
          "
        />
      </div>

      <button
        class="btn btn-danger btn-full"
        onclick={handleDelete}
        disabled={!isConfirmed || loading}
        style="margin-bottom: 12px; opacity: {isConfirmed ? 1 : 0.4};"
      >
        {#if loading}
          <span class="loading-spinner"></span>
        {:else}
          Permanently delete my account
        {/if}
      </button>

      <a href="{base}/profile" class="btn btn-secondary btn-full">
        Cancel — Keep my account
      </a>
    </div>
  </div>
</div>
