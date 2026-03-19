<script lang="ts">
  import { onMount } from 'svelte'
  import { goto } from '$app/navigation'
  import { base } from '$app/paths'
  import { getAuthon } from '@authon/svelte'

  const store = getAuthon()
  const { user, isSignedIn, client } = store

  let displayName = ''
  let avatarUrl = ''
  let phone = ''
  let loading = false
  let error = ''
  let success = ''

  onMount(() => {
    if (!$isSignedIn) {
      goto(`${base}/sign-in`)
      return
    }
    displayName = $user?.displayName ?? ''
    avatarUrl = $user?.avatarUrl ?? ''
    phone = $user?.phone ?? ''
  })

  function getInitials(u: typeof $user): string {
    if (!u) return '?'
    if (u.displayName) {
      return u.displayName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
    }
    return (u.email?.[0] ?? '?').toUpperCase()
  }

  function formatDate(dateStr: string | undefined): string {
    if (!dateStr) return '-'
    return new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
  }

  async function handleSave(e: Event) {
    e.preventDefault()
    loading = true
    error = ''
    success = ''
    try {
      await client.updateProfile({
        displayName: displayName || undefined,
        avatarUrl: avatarUrl || undefined,
        phone: phone || undefined,
      })
      success = 'Profile updated successfully'
    } catch (err) {
      error = err instanceof Error ? err.message : 'Failed to update profile'
    } finally {
      loading = false
    }
  }
</script>

<div class="page">
  <div style="margin-bottom: 24px;">
    <h1 style="font-size: 26px; font-weight: 700; color: var(--text-primary); margin-bottom: 8px;">
      Profile
    </h1>
    <p style="color: var(--text-secondary); font-size: 14px;">
      View and edit your account details
    </p>
  </div>

  <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; align-items: start;">
    <div>
      <div class="card" style="margin-bottom: 16px;">
        <div class="section-title">Account Info</div>
        <div style="display: flex; align-items: center; gap: 16px; margin-bottom: 20px;">
          <div class="avatar avatar-lg">
            {#if $user?.avatarUrl}
              <img src={$user.avatarUrl} alt="avatar" />
            {:else}
              {getInitials($user)}
            {/if}
          </div>
          <div>
            <div style="font-weight: 700; font-size: 18px; color: var(--text-primary);">
              {$user?.displayName ?? 'No display name'}
            </div>
            <div style="color: var(--text-secondary); font-size: 14px;">{$user?.email}</div>
            <div style="margin-top: 6px; display: flex; gap: 6px; flex-wrap: wrap;">
              {#if $user?.emailVerified}
                <span class="badge badge-success">Email verified</span>
              {:else}
                <span class="badge badge-muted">Not verified</span>
              {/if}
            </div>
          </div>
        </div>

        <div style="display: flex; flex-direction: column; gap: 10px;">
          <div class="info-row">
            <span class="info-label">User ID</span>
            <span class="info-value mono">{$user?.id ?? '-'}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Email</span>
            <span class="info-value">{$user?.email ?? '-'}</span>
          </div>
          {#if $user?.phone}
            <div class="info-row">
              <span class="info-label">Phone</span>
              <span class="info-value">{$user.phone}</span>
            </div>
          {/if}
          <div class="info-row">
            <span class="info-label">Joined</span>
            <span class="info-value">{formatDate($user?.createdAt)}</span>
          </div>
        </div>
      </div>

      <div class="card">
        <div class="section-title">Quick Actions</div>
        <div style="display: flex; flex-direction: column; gap: 8px;">
          <a href="{base}/mfa" class="btn btn-secondary" style="justify-content: flex-start; gap: 10px;">
            <span>🔑</span>
            <span>Two-Factor Authentication</span>
          </a>
          <a href="{base}/sessions" class="btn btn-secondary" style="justify-content: flex-start; gap: 10px;">
            <span>📱</span>
            <span>Active Sessions</span>
          </a>
          <a href="{base}/delete-account" class="btn btn-danger" style="justify-content: flex-start; gap: 10px;">
            <span>⚠️</span>
            <span>Delete Account</span>
          </a>
        </div>
      </div>
    </div>

    <div class="card">
      <div class="section-title">Edit Profile</div>
      <div style="font-size: 12px; color: var(--text-tertiary); margin-bottom: 16px;">
        <code style="color: var(--accent);">client.updateProfile(&#123; displayName, avatarUrl, phone &#125;)</code>
      </div>

      {#if error}
        <div class="alert alert-error" style="margin-bottom: 16px;">{error}</div>
      {/if}
      {#if success}
        <div class="alert alert-success" style="margin-bottom: 16px;">{success}</div>
      {/if}

      <form onsubmit={handleSave} style="display: flex; flex-direction: column; gap: 16px;">
        <div class="form-group">
          <label class="form-label" for="displayName">Display Name</label>
          <input
            id="displayName"
            class="form-input"
            type="text"
            placeholder="Your name"
            bind:value={displayName}
          />
        </div>

        <div class="form-group">
          <label class="form-label" for="email-display">Email</label>
          <input
            id="email-display"
            class="form-input"
            type="email"
            value={$user?.email ?? ''}
            disabled
          />
          <span class="form-error" style="color: var(--text-tertiary);">Email cannot be changed</span>
        </div>

        <div class="form-group">
          <label class="form-label" for="avatarUrl">Avatar URL</label>
          <input
            id="avatarUrl"
            class="form-input"
            type="url"
            placeholder="https://example.com/avatar.jpg"
            bind:value={avatarUrl}
          />
        </div>

        <div class="form-group">
          <label class="form-label" for="phone">Phone</label>
          <input
            id="phone"
            class="form-input"
            type="tel"
            placeholder="+1 (555) 000-0000"
            bind:value={phone}
          />
        </div>

        <button type="submit" class="btn btn-primary" disabled={loading} style="align-self: flex-start; min-width: 140px;">
          {#if loading}
            <span class="loading-spinner"></span>
          {:else}
            Save changes
          {/if}
        </button>
      </form>
    </div>
  </div>
</div>

<style>
  .info-row {
    display: flex;
    gap: 8px;
    align-items: baseline;
  }

  .info-label {
    font-size: 13px;
    color: var(--text-tertiary);
    min-width: 70px;
  }

  .info-value {
    font-size: 13px;
    color: var(--text-secondary);
    word-break: break-all;
  }

  .info-value.mono {
    font-family: 'Courier New', monospace;
  }
</style>
