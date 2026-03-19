<script lang="ts">
  import { onMount } from 'svelte'
  import { goto } from '$app/navigation'
  import { base } from '$app/paths'
  import { getAuthon } from '@authon/svelte'
  import type { MfaStatus } from '@authon/shared'

  const { client, isSignedIn } = getAuthon()

  type SetupStep = 'idle' | 'qr' | 'verify' | 'done'

  let status: MfaStatus | null = null
  let statusLoading = true
  let setupStep: SetupStep = 'idle'
  let qrData: { secret: string; qrCodeSvg: string; backupCodes: string[] } | null = null
  let verifyCode = ''
  let disableCode = ''
  let showDisable = false
  let regenCode = ''
  let showRegen = false
  let newBackupCodes: string[] | null = null
  let isLoading = false
  let localError = ''
  let successMsg = ''

  onMount(async () => {
    if (!$isSignedIn) {
      goto(`${base}/sign-in`)
      return
    }
    await loadStatus()
  })

  async function loadStatus() {
    statusLoading = true
    try {
      status = await client.getMfaStatus()
    } catch {
      status = null
    }
    statusLoading = false
  }

  async function handleSetupStart() {
    localError = ''
    isLoading = true
    try {
      const data = await client.setupMfa()
      qrData = { secret: data.secret, qrCodeSvg: data.qrCodeSvg, backupCodes: data.backupCodes }
      setupStep = 'qr'
    } catch (err) {
      localError = err instanceof Error ? err.message : 'Failed to start MFA setup'
    } finally {
      isLoading = false
    }
  }

  async function handleVerifySetup() {
    localError = ''
    isLoading = true
    try {
      await client.verifyMfaSetup(verifyCode)
      setupStep = 'done'
      successMsg = 'MFA enabled successfully!'
      await loadStatus()
    } catch (err) {
      localError = err instanceof Error ? err.message : 'Invalid code. Please try again.'
    } finally {
      isLoading = false
    }
  }

  async function handleDisable() {
    localError = ''
    isLoading = true
    try {
      await client.disableMfa(disableCode)
      showDisable = false
      disableCode = ''
      successMsg = 'MFA has been disabled.'
      await loadStatus()
    } catch (err) {
      localError = err instanceof Error ? err.message : 'Invalid code'
    } finally {
      isLoading = false
    }
  }

  async function handleRegenerate() {
    localError = ''
    isLoading = true
    try {
      const codes = await client.regenerateBackupCodes(regenCode)
      newBackupCodes = codes
      showRegen = false
      regenCode = ''
      successMsg = 'Backup codes regenerated.'
    } catch (err) {
      localError = err instanceof Error ? err.message : 'Failed to regenerate backup codes'
    } finally {
      isLoading = false
    }
  }

  function toggleDisable() {
    showDisable = true
    showRegen = false
  }

  function toggleRegen() {
    showRegen = true
    showDisable = false
  }

  function cancelDisable() {
    showDisable = false
    disableCode = ''
  }

  function cancelRegen() {
    showRegen = false
    regenCode = ''
  }
</script>

{#if statusLoading}
  <div class="page-centered">
    <div class="loading-spinner-lg"></div>
  </div>
{:else}
  <div class="page" style="max-width: 640px;">
    <div style="margin-bottom: 24px;">
      <h1 style="font-size: 26px; font-weight: 700; color: var(--text-primary); margin-bottom: 8px;">
        Two-Factor Authentication
      </h1>
      <p style="color: var(--text-secondary); font-size: 14px;">
        Add an extra layer of security using
        <code style="color: var(--accent);">client.setupMfa()</code> /
        <code style="color: var(--accent);">client.verifyMfaSetup(code)</code>
      </p>
    </div>

    {#if localError}
      <div class="alert alert-error" style="margin-bottom: 16px;">{localError}</div>
    {/if}
    {#if successMsg}
      <div class="alert alert-success" style="margin-bottom: 16px;">{successMsg}</div>
    {/if}

    <div class="card" style="margin-bottom: 20px;">
      <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px;">
        <div>
          <div style="font-size: 16px; font-weight: 600; color: var(--text-primary);">Authenticator App</div>
          <div style="font-size: 13px; color: var(--text-secondary); margin-top: 2px;">
            {#if status?.enabled}
              Active — {status.backupCodesRemaining} backup codes remaining
            {:else}
              Not configured
            {/if}
          </div>
        </div>
        <span class="badge {status?.enabled ? 'badge-success' : 'badge-muted'}">
          <span style="width: 6px; height: 6px; border-radius: 50%; background: {status?.enabled ? 'var(--success)' : 'var(--text-tertiary)'}; display: inline-block;"></span>
          {status?.enabled ? 'Enabled' : 'Disabled'}
        </span>
      </div>

      {#if !status?.enabled && setupStep === 'idle'}
        <button class="btn btn-primary" onclick={handleSetupStart} disabled={isLoading}>
          {#if isLoading}
            <span class="loading-spinner"></span>
          {:else}
            Set up authenticator app
          {/if}
        </button>
      {/if}

      {#if setupStep === 'qr' && qrData}
        <div>
          <div class="alert alert-warning" style="margin-bottom: 20px;">
            Scan the QR code with your authenticator app (Google Authenticator, Authy, etc.)
          </div>

          <div class="qr-container" style="margin-bottom: 20px;">
            {@html qrData.qrCodeSvg}
            <div style="font-size: 13px; color: var(--text-secondary); text-align: center;">
              Or enter manually:
              <div style="
                font-family: 'Courier New', monospace; font-size: 14px;
                color: var(--text-primary); margin-top: 6px; word-break: break-all;
                padding: 8px 12px; background: var(--bg-card); border-radius: 6px;
                border: 1px solid var(--border);
              ">{qrData.secret}</div>
            </div>
          </div>

          {#if qrData.backupCodes.length > 0}
            <div style="margin-bottom: 20px;">
              <div style="font-size: 14px; font-weight: 600; color: var(--text-primary); margin-bottom: 8px;">
                Backup Codes — Save these now
              </div>
              <div class="alert alert-warning" style="margin-bottom: 12px; font-size: 12px;">
                Store backup codes safely. Each code can only be used once.
              </div>
              <div class="backup-codes-grid">
                {#each qrData.backupCodes as code}
                  <div class="backup-code">{code}</div>
                {/each}
              </div>
            </div>
          {/if}

          <button
            class="btn btn-secondary btn-full"
            style="margin-bottom: 12px;"
            onclick={() => { setupStep = 'verify' }}
          >
            I've scanned the QR code — Next
          </button>
        </div>
      {/if}

      {#if setupStep === 'verify'}
        <div>
          <div style="font-size: 14px; font-weight: 600; color: var(--text-primary); margin-bottom: 12px;">
            Enter the 6-digit code from your authenticator app
          </div>
          <div style="display: flex; gap: 10px; align-items: flex-end;">
            <div class="form-group" style="flex: 1;">
              <input
                class="form-input"
                type="text"
                inputmode="numeric"
                maxlength="6"
                placeholder="000000"
                bind:value={verifyCode}
                style="text-align: center; font-size: 20px; letter-spacing: 0.2em;"
                autofocus
              />
            </div>
            <button
              class="btn btn-primary"
              onclick={handleVerifySetup}
              disabled={isLoading || verifyCode.length !== 6}
              style="flex-shrink: 0;"
            >
              {#if isLoading}
                <span class="loading-spinner"></span>
              {:else}
                Verify & Enable
              {/if}
            </button>
          </div>
        </div>
      {/if}

      {#if setupStep === 'done' && status?.enabled}
        <div class="alert alert-success">
          MFA is now active on your account!
        </div>
      {/if}

      {#if status?.enabled && setupStep === 'idle'}
        <div style="display: flex; gap: 10px; flex-wrap: wrap;">
          <button class="btn btn-secondary btn-sm" onclick={toggleRegen}>
            Regenerate backup codes
          </button>
          <button class="btn btn-danger btn-sm" onclick={toggleDisable}>
            Disable MFA
          </button>
        </div>
      {/if}
    </div>

    {#if showDisable}
      <div class="card" style="margin-bottom: 20px;">
        <div style="font-size: 15px; font-weight: 600; color: var(--text-primary); margin-bottom: 12px;">
          Disable MFA
        </div>
        <p style="color: var(--text-secondary); font-size: 13px; margin-bottom: 16px;">
          Enter your current TOTP code to confirm.
          <code style="color: var(--accent);">client.disableMfa(code)</code>
        </p>
        <div style="display: flex; gap: 10px; align-items: flex-end;">
          <div class="form-group" style="flex: 1;">
            <input
              class="form-input"
              type="text"
              inputmode="numeric"
              maxlength="6"
              placeholder="000000"
              bind:value={disableCode}
              style="text-align: center; letter-spacing: 0.15em;"
            />
          </div>
          <button
            class="btn btn-danger"
            onclick={handleDisable}
            disabled={isLoading || disableCode.length !== 6}
          >
            {#if isLoading}
              <span class="loading-spinner"></span>
            {:else}
              Disable
            {/if}
          </button>
          <button class="btn btn-secondary" onclick={cancelDisable}>Cancel</button>
        </div>
      </div>
    {/if}

    {#if showRegen}
      <div class="card" style="margin-bottom: 20px;">
        <div style="font-size: 15px; font-weight: 600; color: var(--text-primary); margin-bottom: 12px;">
          Regenerate Backup Codes
        </div>
        <p style="color: var(--text-secondary); font-size: 13px; margin-bottom: 16px;">
          Enter your TOTP code to generate new backup codes.
          <code style="color: var(--accent);">client.regenerateBackupCodes(code)</code>
        </p>
        <div style="display: flex; gap: 10px; align-items: flex-end;">
          <div class="form-group" style="flex: 1;">
            <input
              class="form-input"
              type="text"
              inputmode="numeric"
              maxlength="6"
              placeholder="000000"
              bind:value={regenCode}
              style="text-align: center; letter-spacing: 0.15em;"
            />
          </div>
          <button
            class="btn btn-primary"
            onclick={handleRegenerate}
            disabled={isLoading || regenCode.length !== 6}
          >
            {#if isLoading}
              <span class="loading-spinner"></span>
            {:else}
              Regenerate
            {/if}
          </button>
          <button class="btn btn-secondary" onclick={cancelRegen}>Cancel</button>
        </div>
      </div>
    {/if}

    {#if newBackupCodes}
      <div class="card">
        <div style="font-size: 15px; font-weight: 600; color: var(--text-primary); margin-bottom: 4px;">
          New Backup Codes
        </div>
        <div class="alert alert-warning" style="margin-bottom: 12px; font-size: 12px;">
          Previous backup codes have been invalidated. Save these new codes safely.
        </div>
        <div class="backup-codes-grid">
          {#each newBackupCodes as code}
            <div class="backup-code">{code}</div>
          {/each}
        </div>
      </div>
    {/if}
  </div>
{/if}
