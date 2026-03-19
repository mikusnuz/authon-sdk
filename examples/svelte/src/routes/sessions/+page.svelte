<script lang="ts">
  import { onMount } from 'svelte'
  import { goto } from '$app/navigation'
  import { base } from '$app/paths'
  import { getAuthon } from '@authon/svelte'
  import type { SessionInfo } from '@authon/shared'

  const { client, isSignedIn } = getAuthon()

  let sessions: SessionInfo[] = []
  let fetching = true
  let revoking: string | null = null
  let error = ''
  let successMsg = ''

  onMount(async () => {
    if (!$isSignedIn) {
      goto(`${base}/sign-in`)
      return
    }
    await load()
  })

  async function load() {
    fetching = true
    error = ''
    try {
      sessions = await client.listSessions()
    } catch (err) {
      error = err instanceof Error ? err.message : 'Failed to load sessions'
    } finally {
      fetching = false
    }
  }

  async function handleRevoke(sessionId: string) {
    revoking = sessionId
    successMsg = ''
    try {
      await client.revokeSession(sessionId)
      sessions = sessions.filter((s) => s.id !== sessionId)
      successMsg = 'Session revoked successfully.'
    } catch (err) {
      error = err instanceof Error ? err.message : 'Failed to revoke session'
    } finally {
      revoking = null
    }
  }

  function formatRelative(dateStr: string): string {
    const diff = Date.now() - new Date(dateStr).getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 1) return 'Just now'
    if (mins < 60) return `${mins}m ago`
    const hours = Math.floor(mins / 60)
    if (hours < 24) return `${hours}h ago`
    const days = Math.floor(hours / 24)
    return `${days}d ago`
  }

  function formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    })
  }

  function parseUserAgent(ua: string): string {
    if (ua.includes('Chrome') && !ua.includes('Edg')) return 'Chrome'
    if (ua.includes('Firefox')) return 'Firefox'
    if (ua.includes('Safari') && !ua.includes('Chrome')) return 'Safari'
    if (ua.includes('Edg')) return 'Edge'
    if (ua.includes('OPR') || ua.includes('Opera')) return 'Opera'
    return 'Unknown browser'
  }

  function getDeviceIcon(ua: string): string {
    const lower = ua.toLowerCase()
    if (lower.includes('mobile') || lower.includes('android') || lower.includes('iphone')) return '📱'
    if (lower.includes('tablet') || lower.includes('ipad')) return '📟'
    return '💻'
  }
</script>

{#if fetching}
  <div class="page-centered">
    <div class="loading-spinner-lg"></div>
  </div>
{:else}
  <div class="page" style="max-width: 720px;">
    <div style="margin-bottom: 24px;">
      <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px;">
        <h1 style="font-size: 26px; font-weight: 700; color: var(--text-primary);">
          Active Sessions
        </h1>
        <button class="btn btn-secondary btn-sm" onclick={load} disabled={fetching}>
          Refresh
        </button>
      </div>
      <p style="color: var(--text-secondary); font-size: 14px;">
        Manage your active sessions using
        <code style="color: var(--accent);">client.listSessions()</code>,
        <code style="color: var(--accent);">client.revokeSession(id)</code>
      </p>
    </div>

    {#if error}
      <div class="alert alert-error" style="margin-bottom: 16px;">{error}</div>
    {/if}
    {#if successMsg}
      <div class="alert alert-success" style="margin-bottom: 16px;">{successMsg}</div>
    {/if}

    <div class="card" style="margin-bottom: 16px; padding: 12px 16px;">
      <span style="font-size: 13px; color: var(--text-secondary);">
        {sessions.length} active {sessions.length === 1 ? 'session' : 'sessions'}
      </span>
    </div>

    {#if sessions.length === 0}
      <div class="card" style="text-align: center; padding: 40px 20px;">
        <div style="font-size: 40px; margin-bottom: 12px;">📭</div>
        <div style="color: var(--text-secondary); font-size: 15px;">No active sessions found</div>
      </div>
    {:else}
      <div style="display: flex; flex-direction: column; gap: 10px;">
        {#each sessions as session, i}
          {@const ua = session.userAgent ?? ''}
          {@const browser = ua ? parseUserAgent(ua) : 'Unknown'}
          {@const deviceIcon = ua ? getDeviceIcon(ua) : '💻'}
          {@const shortUa = ua.length > 60 ? ua.slice(0, 60) + '…' : ua}
          {@const isCurrent = i === 0}
          <div class="session-item">
            <div style="display: flex; align-items: center; gap: 12px; flex: 1; min-width: 0;">
              <div style="
                width: 40px; height: 40px; border-radius: 50%;
                background: {isCurrent ? 'var(--accent-light)' : 'rgba(100, 116, 139, 0.1)'};
                display: flex; align-items: center; justify-content: center;
                font-size: 20px; flex-shrink: 0;
              ">{deviceIcon}</div>
              <div style="min-width: 0;">
                <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 2px;">
                  <span style="font-weight: 600; font-size: 14px; color: var(--text-primary);">{browser}</span>
                  {#if isCurrent}
                    <span class="badge badge-success" style="font-size: 11px;">Current</span>
                  {/if}
                </div>
                <div style="font-size: 12px; color: var(--text-tertiary); overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                  {shortUa || 'Unknown user agent'}
                </div>
                <div style="font-size: 12px; color: var(--text-tertiary); margin-top: 2px; display: flex; gap: 12px;">
                  {#if session.ipAddress}
                    <span>IP: {session.ipAddress}</span>
                  {/if}
                  {#if session.lastActiveAt}
                    <span>Active {formatRelative(session.lastActiveAt)}</span>
                  {/if}
                  {#if session.createdAt}
                    <span>Signed in {formatDate(session.createdAt)}</span>
                  {/if}
                </div>
              </div>
            </div>

            {#if !isCurrent}
              <button
                class="btn btn-danger btn-sm"
                onclick={() => handleRevoke(session.id)}
                disabled={revoking === session.id}
                style="flex-shrink: 0;"
              >
                {#if revoking === session.id}
                  <span class="loading-spinner" style="width: 14px; height: 14px;"></span>
                {:else}
                  Revoke
                {/if}
              </button>
            {/if}
          </div>
        {/each}
      </div>
    {/if}

    <div class="card" style="margin-top: 24px;">
      <div class="section-title">Security Tip</div>
      <p style="font-size: 14px; color: var(--text-secondary); line-height: 1.6;">
        If you notice any suspicious sessions, revoke them immediately and change your password.
        Sessions are automatically cleared after 30 days of inactivity.
      </p>
    </div>
  </div>
{/if}
